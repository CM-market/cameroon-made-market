use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, Set,
};
use uuid::Uuid;
use jsonwebtoken::{encode, EncodingKey, Header};
use chrono::{Duration, Utc};

use crate::{
    entities::user::{self, CreateUser, UpdateUser, UserResponse},
    utils::password::{hash_password, verify_password},
    middleware::auth::Claims,
    AppError,
};

pub struct UserService {
    db: DatabaseConnection,
    jwt_secret: String,
    jwt_expires_in: i64,
}

impl UserService {
    pub fn new(db: DatabaseConnection, jwt_secret: String, jwt_expires_in: i64) -> Self {
        Self {
            db,
            jwt_secret,
            jwt_expires_in,
        }
    }

    pub async fn create_user(&self, user_data: CreateUser) -> Result<UserResponse, AppError> {
        let password_hash = hash_password(&user_data.password)?;

        let user = user::ActiveModel {
            id: Set(Uuid::new_v4()),
            name: Set(user_data.name),
            email: Set(user_data.email),
            phone: Set(user_data.phone),
            password_hash: Set(password_hash),
            role: Set("seller".to_string()),
            created_at: Set(Utc::now()),
        }
        .insert(&self.db)
        .await?;

        Ok(user.into())
    }

    pub async fn login(&self, email: String, password: String) -> Result<(UserResponse, String), AppError> {
        let user = user::Entity::find()
            .filter(user::Column::Email.eq(email))
            .one(&self.db)
            .await?
            .ok_or_else(|| AppError::AuthenticationError("Invalid credentials".into()))?;

        if !verify_password(&password, &user.password_hash)? {
            return Err(AppError::AuthenticationError("Invalid credentials".into()));
        }

        let exp = (Utc::now() + Duration::hours(self.jwt_expires_in)).timestamp() as usize;
        let claims = Claims {
            sub: user.id,
            role: user.role.clone(),
            exp,
        };

        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(self.jwt_secret.as_bytes()),
        )?;

        Ok((user.into(), token))
    }

    pub async fn get_user_by_id(&self, user_id: Uuid) -> Result<UserResponse, AppError> {
        let user = user::Entity::find_by_id(user_id)
            .one(&self.db)
            .await?
            .ok_or_else(|| AppError::NotFoundError("User not found".into()))?;

        Ok(user.into())
    }

    pub async fn update_user(&self, user_id: Uuid, user_data: UpdateUser) -> Result<UserResponse, AppError> {
        let mut user = user::Entity::find_by_id(user_id)
            .one(&self.db)
            .await?
            .ok_or_else(|| AppError::NotFoundError("User not found".into()))?;

        let mut active_model: user::ActiveModel = user.clone().into();

        if let Some(name) = user_data.name {
            active_model.name = Set(name);
        }
        if let Some(email) = user_data.email {
            active_model.email = Set(email);
        }
        if let Some(phone) = user_data.phone {
            active_model.phone = Set(Some(phone));
        }
        if let Some(password) = user_data.password {
            active_model.password_hash = Set(hash_password(&password)?);
        }

        let updated_user = active_model.update(&self.db).await?;
        Ok(updated_user.into())
    }

    pub async fn delete_user(&self, user_id: Uuid) -> Result<(), AppError> {
        user::Entity::delete_by_id(user_id)
            .exec(&self.db)
            .await?;
        Ok(())
    }

    pub async fn list_users(&self) -> Result<Vec<UserResponse>, AppError> {
        let users = user::Entity::find().all(&self.db).await?;
        Ok(users.into_iter().map(UserResponse::from).collect())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use mockall::predicate::*;
    use sea_orm::MockDatabase;
    use test_log;

    #[tokio::test]
    async fn test_create_user() {
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![user::Model {
                id: Uuid::new_v4(),
                name: "Test User".to_string(),
                email: "test@example.com".to_string(),
                phone: Some("1234567890".to_string()),
                password_hash: "hashed_password".to_string(),
                role: "seller".to_string(),
                created_at: Utc::now(),
            }]])
            .into_connection();

        let service = UserService::new(
            db,
            "test_secret".to_string(),
            24,
        );

        let user_data = CreateUser {
            name: "Test User".to_string(),
            email: "test@example.com".to_string(),
            phone: Some("1234567890".to_string()),
            password: "password123".to_string(),
        };

        let result = service.create_user(user_data).await;
        assert!(result.is_ok());

        let user_response = result.unwrap();
        assert_eq!(user_response.name, "Test User");
        assert_eq!(user_response.email, "test@example.com");
        assert_eq!(user_response.phone, Some("1234567890".to_string()));
    }

    #[tokio::test]
    async fn test_login_success() {
        let user_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![user::Model {
                id: user_id,
                name: "Test User".to_string(),
                email: "test@example.com".to_string(),
                phone: Some("1234567890".to_string()),
                password_hash: hash_password("password123").unwrap(),
                role: "seller".to_string(),
                created_at: Utc::now(),
            }]])
            .into_connection();

        let service = UserService::new(
            db,
            "test_secret".to_string(),
            24,
        );

        let result = service.login("test@example.com".to_string(), "password123".to_string()).await;
        assert!(result.is_ok());

        let (user_response, token) = result.unwrap();
        assert_eq!(user_response.email, "test@example.com");
        assert!(!token.is_empty());
    }

    #[tokio::test]
    async fn test_login_invalid_credentials() {
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![user::Model {
                id: Uuid::new_v4(),
                name: "Test User".to_string(),
                email: "test@example.com".to_string(),
                phone: Some("1234567890".to_string()),
                password_hash: hash_password("password123").unwrap(),
                role: "seller".to_string(),
                created_at: Utc::now(),
            }]])
            .into_connection();

        let service = UserService::new(
            db,
            "test_secret".to_string(),
            24,
        );

        let result = service.login("test@example.com".to_string(), "wrong_password".to_string()).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_get_user_by_id() {
        let user_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![user::Model {
                id: user_id,
                name: "Test User".to_string(),
                email: "test@example.com".to_string(),
                phone: Some("1234567890".to_string()),
                password_hash: "hashed_password".to_string(),
                role: "seller".to_string(),
                created_at: Utc::now(),
            }]])
            .into_connection();

        let service = UserService::new(
            db,
            "test_secret".to_string(),
            24,
        );

        let result = service.get_user_by_id(user_id).await;
        assert!(result.is_ok());

        let user_response = result.unwrap();
        assert_eq!(user_response.id, user_id);
        assert_eq!(user_response.email, "test@example.com");
    }

    #[tokio::test]
    async fn test_update_user() {
        let user_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![
                vec![user::Model {
                    id: user_id,
                    name: "Test User".to_string(),
                    email: "test@example.com".to_string(),
                    phone: Some("1234567890".to_string()),
                    password_hash: "hashed_password".to_string(),
                    role: "seller".to_string(),
                    created_at: Utc::now(),
                }],
                vec![user::Model {
                    id: user_id,
                    name: "Updated User".to_string(),
                    email: "test@example.com".to_string(),
                    phone: Some("0987654321".to_string()),
                    password_hash: "hashed_password".to_string(),
                    role: "seller".to_string(),
                    created_at: Utc::now(),
                }],
            ])
            .into_connection();

        let service = UserService::new(
            db,
            "test_secret".to_string(),
            24,
        );

        let update_data = UpdateUser {
            name: Some("Updated User".to_string()),
            email: None,
            phone: Some("0987654321".to_string()),
            password: None,
        };

        let result = service.update_user(user_id, update_data).await;
        assert!(result.is_ok());

        let user_response = result.unwrap();
        assert_eq!(user_response.name, "Updated User");
        assert_eq!(user_response.phone, Some("0987654321".to_string()));
    }

    #[tokio::test]
    async fn test_list_users() {
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![
                user::Model {
                    id: Uuid::new_v4(),
                    name: "User 1".to_string(),
                    email: "user1@example.com".to_string(),
                    phone: Some("1234567890".to_string()),
                    password_hash: "hashed_password".to_string(),
                    role: "seller".to_string(),
                    created_at: Utc::now(),
                },
                user::Model {
                    id: Uuid::new_v4(),
                    name: "User 2".to_string(),
                    email: "user2@example.com".to_string(),
                    phone: Some("0987654321".to_string()),
                    password_hash: "hashed_password".to_string(),
                    role: "seller".to_string(),
                    created_at: Utc::now(),
                },
            ]])
            .into_connection();

        let service = UserService::new(
            db,
            "test_secret".to_string(),
            24,
        );

        let result = service.list_users().await;
        assert!(result.is_ok());

        let users = result.unwrap();
        assert_eq!(users.len(), 2);
        assert_eq!(users[0].name, "User 1");
        assert_eq!(users[1].name, "User 2");
    }
} 