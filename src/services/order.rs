use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, QueryOrder, Set,
};
use uuid::Uuid;

use crate::models::order::{self, CreateOrder};

use super::errors::ServiceError;

pub struct OrderService {
    db: DatabaseConnection,
}

impl OrderService {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    pub async fn create_order(&self, order_data: CreateOrder) -> Result<order::Model, ServiceError> {
        let order = order::ActiveModel {
            id: Set(Uuid::new_v4()),
            session_id: Set(order_data.session_id),
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
            order::item::ActiveModel {
                id: Set(Uuid::new_v4()),
                order_id: Set(order.id),
                product_id: Set(item.product_id),
                quantity: Set(item.quantity),
                price: Set(item.price),
            }
            .insert(&self.db)
            .await?;
        }

        Ok(order.into())
    }

    pub async fn get_order_by_id(&self, order_id: Uuid) -> Result<OrderResponse, ServiceError> {
        let order = order::Entity::find_by_id(order_id)
            .one(&self.db)
            .await?
            .ok_or_else(|| AppError::NotFoundError("Order not found".into()))?;

        Ok(order.into())
    }

    pub async fn update_order_status(
        &self,
        order_id: Uuid,
        status: String,
    ) -> Result<OrderResponse, AppError> {
        let order = order::Entity::find_by_id(order_id)
            .one(&self.db)
            .await?
            .ok_or_else(|| AppError::NotFoundError("Order not found".into()))?;

        let mut active_model: order::ActiveModel = order.into();
        active_model.status = Set(status);
        let updated_order = active_model.update(&self.db).await?;

        Ok(updated_order.into())
    }

    pub async fn list_orders(
        &self,
        user_id: Option<Uuid>,
        status: Option<String>,
    ) -> Result<Vec<OrderResponse>, AppError> {
        let mut query = order::Entity::find();

        if let Some(user_id) = user_id {
            query = query.filter(order::Column::UserId.eq(user_id));
        }
        if let Some(status) = status {
            query = query.filter(order::Column::Status.eq(status));
        }

        let orders = query
            .order_by_desc(order::Column::CreatedAt)
            .all(&self.db)
            .await?;

        Ok(orders.into_iter().map(OrderResponse::from).collect())
    }

    pub async fn get_order_items(&self, order_id: Uuid) -> Result<Vec<OrderItemResponse>, AppError> {
        let items = order::order_item::Entity::find()
            .filter(order::order_item::Column::OrderId.eq(order_id))
            .all(&self.db)
            .await?;

        Ok(items.into_iter().map(OrderItemResponse::from).collect())
    }

    pub async fn delete_order(&self, order_id: Uuid) -> Result<(), AppError> {
        // Delete order items first
        order::order_item::Entity::delete_many()
            .filter(order::order_item::Column::OrderId.eq(order_id))
            .exec(&self.db)
            .await?;

        // Then delete the order
        order::Entity::delete_by_id(order_id)
            .exec(&self.db)
            .await?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use mockall::predicate::*;
    use sea_orm::MockDatabase;
    use test_log;
    use rust_decimal::Decimal;

    #[tokio::test]
    async fn test_create_order() {
        let user_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![order::Model {
                id: Uuid::new_v4(),
                session_id: Some("test_session".to_string()),
                user_id: Some(user_id),
                customer_name: "Test Customer".to_string(),
                customer_email: Some("test@example.com".to_string()),
                customer_phone: Some("1234567890".to_string()),
                delivery_address: Some("Test Address".to_string()),
                status: "pending".to_string(),
                total: Some(Decimal::new(10000, 2)), // 100.00
                created_at: chrono::Utc::now(),
            }]])
            .append_query_results(vec![vec![order::order_item::Model {
                id: Uuid::new_v4(),
                order_id: Uuid::new_v4(),
                product_id: Uuid::new_v4(),
                quantity: 2,
                price: Decimal::new(5000, 2), // 50.00
            }]])
            .into_connection();

        let service = OrderService::new(db);

        let order_data = CreateOrder {
            session_id: Some("test_session".to_string()),
            user_id: Some(user_id),
            customer_name: "Test Customer".to_string(),
            customer_email: Some("test@example.com".to_string()),
            customer_phone: Some("1234567890".to_string()),
            delivery_address: Some("Test Address".to_string()),
            status: "pending".to_string(),
            total: Some(Decimal::new(10000, 2)),
            items: vec![order::CreateOrderItem {
                product_id: Uuid::new_v4(),
                quantity: 2,
                price: Decimal::new(5000, 2),
            }],
        };

        let result = service.create_order(order_data).await;
        assert!(result.is_ok());

        let order_response = result.unwrap();
        assert_eq!(order_response.customer_name, "Test Customer");
        assert_eq!(order_response.status, "pending");
        assert_eq!(order_response.total, Some(Decimal::new(10000, 2)));
    }

    #[tokio::test]
    async fn test_get_order_by_id() {
        let order_id = Uuid::new_v4();
        let user_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![order::Model {
                id: order_id,
                session_id: Some("test_session".to_string()),
                user_id: Some(user_id),
                customer_name: "Test Customer".to_string(),
                customer_email: Some("test@example.com".to_string()),
                customer_phone: Some("1234567890".to_string()),
                delivery_address: Some("Test Address".to_string()),
                status: "pending".to_string(),
                total: Some(Decimal::new(10000, 2)),
                created_at: chrono::Utc::now(),
            }]])
            .into_connection();

        let service = OrderService::new(db);

        let result = service.get_order_by_id(order_id).await;
        assert!(result.is_ok());

        let order_response = result.unwrap();
        assert_eq!(order_response.id, order_id);
        assert_eq!(order_response.status, "pending");
    }

    #[tokio::test]
    async fn test_update_order_status() {
        let order_id = Uuid::new_v4();
        let user_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![order::Model {
                id: order_id,
                session_id: Some("test_session".to_string()),
                user_id: Some(user_id),
                customer_name: "Test Customer".to_string(),
                customer_email: Some("test@example.com".to_string()),
                customer_phone: Some("1234567890".to_string()),
                delivery_address: Some("Test Address".to_string()),
                status: "pending".to_string(),
                total: Some(Decimal::new(10000, 2)),
                created_at: chrono::Utc::now(),
            }]])
            .append_query_results(vec![vec![order::Model {
                id: order_id,
                session_id: Some("test_session".to_string()),
                user_id: Some(user_id),
                customer_name: "Test Customer".to_string(),
                customer_email: Some("test@example.com".to_string()),
                customer_phone: Some("1234567890".to_string()),
                delivery_address: Some("Test Address".to_string()),
                status: "completed".to_string(),
                total: Some(Decimal::new(10000, 2)),
                created_at: chrono::Utc::now(),
            }]])
            .into_connection();

        let service = OrderService::new(db);

        let result = service.update_order_status(order_id, "completed".to_string()).await;
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
                    session_id: Some("session1".to_string()),
                    user_id: Some(user_id),
                    customer_name: "Customer 1".to_string(),
                    customer_email: Some("customer1@example.com".to_string()),
                    customer_phone: Some("1234567890".to_string()),
                    delivery_address: Some("Address 1".to_string()),
                    status: "pending".to_string(),
                    total: Some(Decimal::new(10000, 2)),
                    created_at: chrono::Utc::now(),
                },
                order::Model {
                    id: Uuid::new_v4(),
                    session_id: Some("session2".to_string()),
                    user_id: Some(user_id),
                    customer_name: "Customer 2".to_string(),
                    customer_email: Some("customer2@example.com".to_string()),
                    customer_phone: Some("0987654321".to_string()),
                    delivery_address: Some("Address 2".to_string()),
                    status: "completed".to_string(),
                    total: Some(Decimal::new(20000, 2)),
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
                order::order_item::Model {
                    id: Uuid::new_v4(),
                    order_id,
                    product_id: Uuid::new_v4(),
                    quantity: 2,
                    price: Decimal::new(5000, 2),
                },
                order::order_item::Model {
                    id: Uuid::new_v4(),
                    order_id,
                    product_id: Uuid::new_v4(),
                    quantity: 1,
                    price: Decimal::new(3000, 2),
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
            .append_exec_results(vec![1])  // Simulate successful deletion of order items
            .append_exec_results(vec![1])  // Simulate successful deletion of order
            .into_connection();

        let service = OrderService::new(db);

        let result = service.delete_order(order_id).await;
        assert!(result.is_ok());
    }
} 