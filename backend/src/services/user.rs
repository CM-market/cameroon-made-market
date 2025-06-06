use std::sync::Arc;

use chrono::Utc;
use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, Set};
use serde::{Deserialize, Serialize};
use tracing::error;
use uuid::Uuid;

use crate::{
    config::Config,
    middleware::auth::generate_token,
    models::user::{self, Model, UserRole},
    utils::password::{hash_password, verify_password},
};

use super::errors::ServiceError;
pub struct UserService {
    db: Arc<DatabaseConnection>,
}

#[derive(Deserialize, Debug)]
pub struct CreateUser {
    pub full_name: String,
    pub email: Option<String>,
    pub phone: i32,
    pub password: String,
    pub role: UserRole,
}

#[derive(Deserialize)]
pub struct LoginRequest {
    pub phone: i32,
    pub password: String,
    pub role: Option<UserRole>,
}

#[derive(Deserialize, Serialize)]
pub struct LoginResponse {
    pub role: UserRole,
    pub user_id: Uuid,
    pub token: String,
    pub full_name: String,
}
pub struct UpdateUser {
    pub full_name: Option<String>,
    pub email: Option<String>,
    pub phone: i32,
    pub password: String,
}

impl UserService {
    pub fn new(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }

    pub async fn create_user(&self, user_data: CreateUser) -> Result<Model, ServiceError> {
        let password_hash = hash_password(&user_data.password)?;

        let active_model = user::ActiveModel {
            id: Set(Uuid::new_v4()),
            full_name: Set(user_data.full_name.clone()),
            email: Set(user_data.email),
            phone: Set(user_data.phone),
            password_hash: Set(password_hash),
            is_active: Set(true),
            role: Set(user_data.role.into()),
            created_at: Set(Utc::now()),
            updated_at: Set(Utc::now()),
        };
        let result = active_model.insert(&*self.db).await;
        match result {
            Ok(user) => Ok(user.into()),
            Err(e) => {
                error!(error = %e, "Failed to insert user");
                Err(ServiceError::InternalServerError)
            }
        }
    }

    pub async fn login(
        &self,
        phone: i32,
        password: String,
        config: &Config,
        expected_role: Option<UserRole>,
    ) -> Result<(Model, String), ServiceError> {
        let user = user::Entity::find()
            .filter(user::Column::Phone.eq(phone))
            .one(&*self.db)
            .await
            .map_err(|_| ServiceError::InternalServerError)?;
        if let Some(user) = user {
            if let Some(role) = expected_role {
                if user.role != role {
                    return Err(ServiceError::InvalidPassword)?;
                }
            }
            if !verify_password(&password, &user.password_hash)? {
                return Err(ServiceError::InvalidPassword)?;
            }
            let token = generate_token(&user.id.to_string(), user.role.clone(), &config)
                .map_err(|_| ServiceError::InternalServerError)?;
            Ok((user, token))
        } else {
            Err(ServiceError::UserNotFound("User not found".to_string()))
        }
    }

    pub async fn get_user_by_id(&self, user_id: Uuid) -> Result<Option<Model>, ServiceError> {
        let user = user::Entity::find_by_id(user_id)
            .one(self.db.as_ref())
            .await
            .map_err(|e| ServiceError::NotFound(e.to_string()))?;

        Ok(user.into())
    }

    pub async fn update_user(
        &self,
        user_id: Uuid,
        user_data: UpdateUser,
    ) -> Result<Model, ServiceError> {
        let user = user::Entity::find_by_id(user_id)
            .one(&*self.db)
            .await
            .map_err(|e| ServiceError::NotFound(e.to_string()))?;
        if let Some(user) = user {
            let mut active_model: user::ActiveModel = user.clone().into();

            if let Some(name) = user_data.full_name {
                active_model.full_name = Set(name);
            }
            if let Some(email) = user_data.email {
                active_model.email = Set(Some(email));
            }
            active_model.phone = Set(user_data.phone);
            active_model.password_hash = Set(hash_password(&user_data.password)?);

            let updated_user = active_model.update(self.db.as_ref()).await?;
            Ok(updated_user.into())
        } else {
            Err(ServiceError::UserNotFound("User not found".to_string()))
        }
    }
    pub async fn delete_user(&self, user_id: Uuid) -> Result<(), ServiceError> {
        user::Entity::delete_by_id(user_id).exec(&*self.db).await?;
        Ok(())
    }

    pub async fn list_users(&self) -> Result<Vec<Model>, ServiceError> {
        let users = user::Entity::find().all(&*self.db).await?;
        Ok(users)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use sea_orm::MockDatabase;

    #[tokio::test]
    async fn test_create_user() {
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![user::Model {
                id: Uuid::new_v4(),
                full_name: "Test User".to_string(),
                email: Some("test@example.com".to_string()),
                phone: 654988322,
                password_hash: "hashed_password".to_string(),
                is_active: true,
                role: UserRole::Vendor.into(),
                created_at: Utc::now(),
                updated_at: Utc::now(),
            }]])
            .into_connection();

        let service = UserService::new(db.into());

        let user_data = CreateUser {
            full_name: "Test User".to_string(),
            email: Some("test@example.com".to_string()),
            phone: 1234567890,
            password: "password123".to_string(),
            role: UserRole::Vendor,
        };

        let result = service.create_user(user_data).await;
        assert!(result.is_ok());

        let user_response = result.unwrap();
        assert_eq!(user_response.full_name, "Test User");
        assert_eq!(user_response.email, Some("test@example.com".to_string()));
        assert_eq!(user_response.phone, 1234567890);
        assert_eq!(user_response.role, UserRole::Vendor);
    }

    #[tokio::test]
    async fn test_login_success() {
        let user_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![user::Model {
                id: user_id,
                full_name: "Test User".to_string(),
                email: Some("test@example.com".to_string()),
                phone: 1234567890,
                password_hash: hash_password("password123").unwrap(),
                is_active: true,
                role: UserRole::Admin.into(),
                created_at: Utc::now(),
                updated_at: Utc::now(),
            }]])
            .into_connection();

        let service = UserService::new(db.into());

        let config = Config {
            jwt_secret: "test_secret".to_string(),
            jwt_expires_in: 24,
            ..Default::default()
        };
        let result = service
            .login(123, "password123".to_string(), &config, None)
            .await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_login_invalid_credentials() {
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![user::Model {
                id: Uuid::new_v4(),
                full_name: "Test User".to_string(),
                email: Some("test@example.com".to_string()),
                phone: 1234567890,
                password_hash: hash_password("password123").unwrap(),
                is_active: true,
                role: UserRole::Buyer.into(),
                created_at: Utc::now(),
                updated_at: Utc::now(),
            }]])
            .into_connection();

        let service = UserService::new(db.into());

        let config = Config {
            jwt_secret: "test_secret".to_string(),
            jwt_expires_in: 24,
            ..Default::default()
        };
        let result = service
            .login(123, "wrong_password".to_string(), &config, None)
            .await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_get_user_by_id() {
        let user_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![user::Model {
                id: user_id,
                full_name: "Test User".to_string(),
                email: Some("test@example.com".to_string()),
                phone: 123,
                password_hash: "hashed_password".to_string(),
                is_active: true,
                role: UserRole::Vendor.into(),
                created_at: Utc::now(),
                updated_at: Utc::now(),
            }]])
            .into_connection();

        let service = UserService::new(db.into());

        let result = service.get_user_by_id(user_id).await;
        assert!(result.is_ok());

        let user_response = result.unwrap();
        let user_response = user_response.unwrap();
        assert_eq!(user_response.id, user_id);
        assert_eq!(user_response.email, Some("test@example.com".to_string()));
        assert_eq!(user_response.role, UserRole::Vendor);
    }

    #[tokio::test]
    async fn test_update_user() {
        let user_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![
                vec![user::Model {
                    id: user_id,
                    full_name: "Test User".to_string(),
                    email: Some("test@example.com".to_string()),
                    phone: 123,
                    password_hash: "hashed_password".to_string(),
                    is_active: true,
                    role: UserRole::Admin.into(),
                    created_at: Utc::now(),
                    updated_at: Utc::now(),
                }],
                vec![user::Model {
                    id: user_id,
                    full_name: "Updated User".to_string(),
                    email: Some("test@example.com".to_string()),
                    phone: 98,
                    password_hash: "hashed_password".to_string(),
                    is_active: true,
                    role: UserRole::Admin.into(),
                    created_at: Utc::now(),
                    updated_at: Utc::now(),
                }],
            ])
            .into_connection();

        let service = UserService::new(db.into());

        let update_data = UpdateUser {
            full_name: Some("Updated User".to_string()),
            email: None,
            phone: 98,
            password: "02".to_string(),
        };

        let result = service.update_user(user_id, update_data).await;
        assert!(result.is_ok());

        let user_response = result.unwrap();
        assert_eq!(user_response.full_name, "Updated User");
        assert_eq!(user_response.phone, 98);
        assert_eq!(user_response.role, UserRole::Admin);
    }

    #[tokio::test]
    async fn test_list_users() {
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![
                user::Model {
                    id: Uuid::new_v4(),
                    full_name: "User 1".to_string(),
                    email: Some("user1@example.com".to_string()),
                    is_active: true,
                    phone: 123,
                    password_hash: "hashed_password".to_string(),
                    role: UserRole::Buyer.into(),
                    created_at: Utc::now(),
                    updated_at: Utc::now(),
                },
                user::Model {
                    id: Uuid::new_v4(),
                    full_name: "User 2".to_string(),
                    email: Some("user2@example.com".to_string()),
                    is_active: true,
                    phone: 98,
                    password_hash: "hashed_password".to_string(),
                    role: UserRole::Vendor.into(),
                    created_at: Utc::now(),
                    updated_at: Utc::now(),
                },
            ]])
            .into_connection();

        let service = UserService::new(db.into());

        let result = service.list_users().await;
        assert!(result.is_ok());

        let users = result.unwrap();
        assert_eq!(users.len(), 2);
        assert_eq!(users[0].full_name, "User 1");
        assert_eq!(users[1].full_name, "User 2");
        assert_eq!(users[0].role, UserRole::Buyer);
        assert_eq!(users[1].role, UserRole::Vendor);
    }
}
