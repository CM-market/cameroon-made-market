use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, QueryOrder, Set,
};
use uuid::Uuid;

use crate::models::{
    order::{self, CreateOrder, Model, Status},
    order_item,
};

use super::errors::ServiceError;

pub struct OrderService {
    db: DatabaseConnection,
}

impl OrderService {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    pub async fn create_order(
        &self,
        order_data: CreateOrder,
    ) -> Result<order::Model, ServiceError> {
        let order = order::ActiveModel {
            id: Set(Uuid::new_v4()),
            user_id: Set(order_data.user_id),
            customer_name: Set(order_data.customer_name),
            customer_email: Set(order_data.customer_email),
            customer_phone: Set(order_data.customer_phone),
            delivery_address: Set(order_data.delivery_address),
            status: Set(order_data.status),
            total: Set(order_data.total),
            created_at: Set(chrono::Utc::now()),
        }
        .insert(&self.db)
        .await?;

        // Create order items
        for item in order_data.items {
            order_item::ActiveModel {
                id: Set(Uuid::new_v4()),
                order_id: Set(order.id),
                product_id: Set(item.product_id),
                quantity: Set(item.quantity as i32),
            }
            .insert(&self.db)
            .await?;
        }

        Ok(order.into())
    }

    pub async fn get_order_by_id(
        &self,
        order_id: Uuid,
    ) -> Result<Option<order::Model>, ServiceError> {
        let order = order::Entity::find_by_id(order_id)
            .one(&self.db)
            .await
            .map_err(|e| ServiceError::NotFound(e.to_string()))?;

        Ok(order)
    }

    pub async fn update_order_status(
        &self,
        order_id: Uuid,
        status: Status,
    ) -> Result<Model, ServiceError> {
        let order = order::Entity::find_by_id(order_id)
            .one(&self.db)
            .await
            .map_err(|e| ServiceError::NotFound(e.to_string()))?;
        if let Some(order) = order {
            let mut active_model: order::ActiveModel = order.into();
            active_model.status = Set(status.into());
            let updated_order = active_model.update(&self.db).await?;

            Ok(updated_order.into())
        } else {
            return Err(ServiceError::NotFound("Order not found".to_string()));
        }
    }
    /// List orders with optional filters by session ID or status
    pub async fn list_orders(
        &self,
        session_id: Option<Uuid>,
        status: Option<Status>,
    ) -> Result<Vec<Model>, ServiceError> {
        let mut query = order::Entity::find();

        if let Some(session_id) = session_id {
            query = query.filter(order::Column::UserId.eq(session_id));
        }
        if let Some(status) = status {
            query = query.filter(order::Column::Status.eq::<String>(status.into()));
        }

        let orders = query
            .order_by_desc(order::Column::CreatedAt)
            .all(&self.db)
            .await?;

        Ok(orders)
    }

    pub async fn get_order_items(
        &self,
        order_id: Uuid,
    ) -> Result<Vec<order_item::Model>, ServiceError> {
        let items = order_item::Entity::find()
            .filter(order_item::Column::OrderId.eq(order_id))
            .all(&self.db)
            .await?;

        Ok(items)
    }

    pub async fn delete_order(&self, order_id: Uuid) -> Result<(), ServiceError> {
        // Delete order items first
        order_item::Entity::delete_many()
            .filter(order_item::Column::OrderId.eq(order_id))
            .exec(&self.db)
            .await?;

        // Then delete the order
        order::Entity::delete_by_id(order_id).exec(&self.db).await?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use sea_orm::MockDatabase;

    #[tokio::test]
    async fn test_create_order() {
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![order::Model {
                id: Uuid::new_v4(),
                user_id: "test_session".to_string(),
                customer_name: "Test Customer".to_string(),
                customer_email: Some("test@example.com".to_string()),
                customer_phone: "1234567890".to_string(),
                delivery_address: "Test Address".to_string(),
                status: "pending".to_string(),
                total: 100.0, // 100.00
                created_at: chrono::Utc::now(),
            }]])
            .append_query_results(vec![vec![order_item::Model {
                id: Uuid::new_v4(),
                order_id: Uuid::new_v4(),
                product_id: Uuid::new_v4(),
                quantity: 2,
            }]])
            .into_connection();

        let service = OrderService::new(db);

        let order_data = CreateOrder {
            id: Uuid::new_v4(),
            created_at: chrono::Utc::now(),
            user_id: "test_session".to_string(),
            customer_name: "Test Customer".to_string(),
            customer_email: Some("test@example.com".to_string()),
            customer_phone: "1234567890".to_string(),
            delivery_address: "Test Address".to_string(),
            status: "pending".to_string(),
            total: 1000.0,
            items: vec![order::Items {
                product_id: Uuid::new_v4(),
                quantity: 2,
                price: 50.0,
            }],
        };

        let result = service.create_order(order_data).await;
        assert!(result.is_ok());

        let order_response = result.unwrap();
        assert_eq!(order_response.customer_name, "Test Customer");
        assert_eq!(order_response.status, "pending");
        assert_eq!(order_response.total, 100.0);
    }

    #[tokio::test]
    async fn test_get_order_by_id() {
        let order_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![order::Model {
                id: order_id,
                user_id: "test_session".to_string(),
                customer_name: "Test Customer".to_string(),
                customer_email: Some("test@example.com".to_string()),
                customer_phone: "1234567890".to_string(),
                delivery_address: "Test Address".to_string(),
                status: "pending".to_string(),
                total: 10.0,
                created_at: chrono::Utc::now(),
            }]])
            .into_connection();

        let service = OrderService::new(db);

        let result = service.get_order_by_id(order_id).await;
        assert!(result.is_ok());

        let order_response = result.unwrap();
        let order_response = order_response.unwrap();
        assert_eq!(order_response.id, order_id);
        assert_eq!(order_response.status, "pending");
    }

    #[tokio::test]
    async fn test_update_order_status() {
        let order_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![order::Model {
                id: order_id,
                user_id: "test_session".to_string(),
                customer_name: "Test Customer".to_string(),
                customer_email: Some("test@example.com".to_string()),
                customer_phone: "1234567890".to_string(),
                delivery_address: "Test Address".to_string(),
                status: "pending".to_string(),
                total: 100.0,
                created_at: chrono::Utc::now(),
            }]])
            .append_query_results(vec![vec![order::Model {
                id: order_id,
                user_id: "test_session".to_string(),
                customer_name: "Test Customer".to_string(),
                customer_email: Some("test@example.com".to_string()),
                customer_phone: "1234567890".to_string(),
                delivery_address: "Test Address".to_string(),
                status: "completed".to_string(),
                total: 100.0,
                created_at: chrono::Utc::now(),
            }]])
            .into_connection();

        let service = OrderService::new(db);

        let result = service
            .update_order_status(order_id, Status::Delivered)
            .await;
        assert!(result.is_ok());

        let order_response = result.unwrap();
        assert_eq!(order_response.status, "completed");
    }

    #[tokio::test]
    async fn test_list_orders() {
        let user_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![
                order::Model {
                    id: Uuid::new_v4(),
                    user_id: "session1".to_string(),
                    customer_name: "Customer 1".to_string(),
                    customer_email: Some("customer1@example.com".to_string()),
                    customer_phone: "1234567890".to_string(),
                    delivery_address: "Address 1".to_string(),
                    status: "pending".to_string(),
                    total: 100.0,
                    created_at: chrono::Utc::now(),
                },
                order::Model {
                    id: Uuid::new_v4(),
                    user_id: "session2".to_string(),
                    customer_name: "Customer 2".to_string(),
                    customer_email: Some("customer2@example.com".to_string()),
                    customer_phone: "0987654321".to_string(),
                    delivery_address: "Address 2".to_string(),
                    status: "completed".to_string(),
                    total: 100.0,
                    created_at: chrono::Utc::now(),
                },
            ]])
            .into_connection();

        let service = OrderService::new(db);

        let result = service.list_orders(Some(user_id), None).await;
        assert!(result.is_ok());

        let orders = result.unwrap();
        assert_eq!(orders.len(), 2);
        assert_eq!(orders[0].customer_name, "Customer 1");
        assert_eq!(orders[1].customer_name, "Customer 2");
    }

    #[tokio::test]
    async fn test_get_order_items() {
        let order_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![
                order_item::Model {
                    id: Uuid::new_v4(),
                    order_id,
                    product_id: Uuid::new_v4(),
                    quantity: 2,
                },
                order_item::Model {
                    id: Uuid::new_v4(),
                    order_id,
                    product_id: Uuid::new_v4(),
                    quantity: 1,
                },
            ]])
            .into_connection();

        let service = OrderService::new(db);

        let result = service.get_order_items(order_id).await;
        assert!(result.is_ok());

        let items = result.unwrap();
        assert_eq!(items.len(), 2);
        assert_eq!(items[0].quantity, 2);
        assert_eq!(items[1].quantity, 1);
    }

    #[tokio::test]
    async fn test_delete_order() {
        let order_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_exec_results(vec![]) // Simulate successful deletion of order items
            .append_exec_results(vec![]) // Simulate successful deletion of order
            .into_connection();

        let service = OrderService::new(db);

        let result = service.delete_order(order_id).await;
        assert!(result.is_ok());
    }
}
