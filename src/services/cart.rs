use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, Set};
use uuid::Uuid;

use crate::models::{
    cart::{self, Model},
    cart_item::{self, CartItem},
};

use super::errors::ServiceError;

pub struct CartService {
    db: DatabaseConnection,
}

impl CartService {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    pub async fn get_or_create_cart(&self, session_id: String) -> Result<Model, ServiceError> {
        let cart = cart::Entity::find()
            .filter(cart::Column::SessionId.eq(&session_id))
            .one(&self.db)
            .await?;

        match cart {
            Some(cart) => Ok(cart.into()),
            None => {
                let new_cart = cart::ActiveModel {
                    id: Set(Uuid::new_v4()),
                    session_id: Set(Uuid::parse_str(&session_id)
                        .map_err(|e| ServiceError::Validation(e.to_string()))?),
                    created_at: Set(chrono::Utc::now()),
                }
                .insert(&self.db)
                .await?;

                Ok(new_cart.into())
            }
        }
    }

    pub async fn add_item_to_cart(
        &self,
        cart_id: Uuid,
        item_data: CartItem,
    ) -> Result<cart_item::Model, ServiceError> {
        // Check if item already exists in cart
        let existing_item = cart_item::Entity::find()
            .filter(cart_item::Column::CartId.eq(cart_id))
            .filter(cart_item::Column::ProductId.eq(item_data.product_id))
            .one(&self.db)
            .await?;

        match existing_item {
            Some(item) => {
                // Update quantity if item exists
                let mut active_model: cart_item::ActiveModel = item.clone().into();
                active_model.quantity = Set(item.quantity + item_data.quantity);
                let updated_item = active_model.update(&self.db).await?;
                Ok(updated_item)
            }
            None => {
                // Create new item if it doesn't exist
                let new_item = cart_item::ActiveModel {
                    id: Set(Uuid::new_v4()),
                    cart_id: Set(cart_id),
                    product_id: Set(item_data.product_id),
                    quantity: Set(item_data.quantity),
                }
                .insert(&self.db)
                .await?;

                Ok(new_item.into())
            }
        }
    }

    pub async fn update_cart_item_quantity(
        &self,
        cart_id: Uuid,
        item_id: Uuid,
        quantity: i32,
    ) -> Result<cart_item::Model, ServiceError> {
        let item = cart_item::Entity::find()
            .filter(cart_item::Column::CartId.eq(cart_id))
            .filter(cart_item::Column::Id.eq(item_id))
            .one(&self.db)
            .await
            .map_err(|e| ServiceError::NotFound(e.to_string()))?;

        if quantity <= 0 {
            cart_item::Entity::delete_by_id(item_id)
                .exec(&self.db)
                .await
                .map_err(|e| ServiceError::Validation(e.to_string()))?;
        }
        if let Some(item) = item {
            let mut active_model: cart_item::ActiveModel = item.into();
            active_model.quantity = Set(quantity);
            let updated_item = active_model.update(&self.db).await?;

            Ok(updated_item.into())
        } else {
            Err(ServiceError::NotFound("Item not found".to_string()))
        }
    }

    pub async fn remove_item_from_cart(
        &self,
        cart_id: Uuid,
        item_id: Uuid,
    ) -> Result<(), ServiceError> {
        cart_item::Entity::delete_many()
            .filter(cart_item::Column::CartId.eq(cart_id))
            .filter(cart_item::Column::Id.eq(item_id))
            .exec(&self.db)
            .await?;

        Ok(())
    }

    pub async fn get_cart(&self, cart_id: Uuid) -> Result<Option<cart::Model>, ServiceError> {
        let cart = cart::Entity::find_by_id(cart_id).one(&self.db).await?;

        Ok(cart)
    }

    pub async fn clear_cart(&self, cart_id: Uuid) -> Result<(), ServiceError> {
        cart_item::Entity::delete_many()
            .filter(cart_item::Column::CartId.eq(cart_id))
            .exec(&self.db)
            .await?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use mockall::predicate::*;
    use sea_orm::{MockDatabase, MockExecResult};

    #[tokio::test]
    async fn test_get_or_create_cart() {
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            // .append_query_results(vec![vec![]]) // Empty result for initial search
            .append_query_results(vec![vec![cart::Model {
                id: Uuid::new_v4(),
                session_id: Uuid::parse_str("test_session").unwrap(),
                created_at: chrono::Utc::now(),
            }]])
            .into_connection();

        let service = CartService::new(db);

        let result = service.get_or_create_cart("test_session".to_string()).await;
        assert!(result.is_ok());

        let cart_response = result.unwrap();
        assert_eq!(cart_response.session_id.to_string(), "test_session");
    }

    #[tokio::test]
    async fn test_add_item_to_cart() {
        let cart_id = Uuid::new_v4();
        let product_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results::<Model, _, _>(vec![vec![]]) // Empty result for existing item check
            .append_query_results(vec![vec![cart_item::Model {
                id: Uuid::new_v4(),
                cart_id,
                product_id,
                quantity: 1,
            }]])
            .into_connection();

        let service = CartService::new(db);

        let item_data = CartItem {
            id: Uuid::new_v4(),
            cart_id,
            product_id,
            quantity: 1,
        };

        let result = service.add_item_to_cart(cart_id, item_data).await;
        assert!(result.is_ok());

        let item_response = result.unwrap();
        assert_eq!(item_response.cart_id, cart_id);
        assert_eq!(item_response.product_id, product_id);
        assert_eq!(item_response.quantity, 1);
    }

    #[tokio::test]
    async fn test_update_cart_item_quantity() {
        let cart_id = Uuid::new_v4();
        let item_id = Uuid::new_v4();
        let product_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![cart_item::Model {
                id: item_id,
                cart_id,
                product_id,
                quantity: 1,
            }]])
            .append_query_results(vec![vec![cart_item::Model {
                id: item_id,
                cart_id,
                product_id,
                quantity: 2,
            }]])
            .into_connection();

        let service = CartService::new(db);

        let result = service.update_cart_item_quantity(cart_id, item_id, 2).await;
        assert!(result.is_ok());

        let item_response = result.unwrap();
        assert_eq!(item_response.quantity, 2);
    }

    #[tokio::test]
    async fn test_update_cart_item_quantity_remove() {
        let cart_id = Uuid::new_v4();
        let item_id = Uuid::new_v4();
        let product_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![cart_item::Model {
                id: item_id,
                cart_id,
                product_id,
                quantity: 1,
            }]])
            .append_exec_results(vec![]) // Simulate successful deletion
            .into_connection();

        let service = CartService::new(db);

        let result = service.update_cart_item_quantity(cart_id, item_id, 0).await;
        assert!(result.is_err());
        match result {
            Err(ServiceError::Validation(msg)) => assert_eq!(msg, "Item removed from cart"),
            _ => panic!("Expected ValidationError"),
        }
    }

    #[tokio::test]
    async fn test_get_cart() {
        let cart_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![cart::Model {
                id: cart_id,
                session_id: Uuid::parse_str("test_session").unwrap(),
                created_at: chrono::Utc::now(),
            }]])
            .into_connection();

        let service = CartService::new(db);

        let result = service.get_cart(cart_id).await;
        assert!(result.is_ok());

        let cart_response = result.unwrap();
        let cart_response = cart_response.unwrap();
        assert_eq!(cart_response.id, cart_id);
        assert_eq!(cart_response.session_id.to_string(), "test_session");
    }

    #[tokio::test]
    async fn test_clear_cart() {
        let cart_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_exec_results(vec![]) // Simulate successful deletion
            .into_connection();

        let service = CartService::new(db);

        let result = service.clear_cart(cart_id).await;
        assert!(result.is_ok());
    }
}
