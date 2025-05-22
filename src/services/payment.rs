use std::sync::Arc;

use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, Set};
use uuid::Uuid;

use crate::models::{
    order::Status,
    payment::{self, Model},
};

use super::errors::ServiceError;

pub struct PaymentService {
    db: Arc<DatabaseConnection>,
}
pub struct CreatePayment {
    pub order_id: Uuid,
    pub amount: f64,
    pub payment_method: String,
    pub payment_details: Option<serde_json::Value>,
}
impl PaymentService {
    pub fn new(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }

    pub async fn create_payment(
        &self,
        payment_data: CreatePayment,
    ) -> Result<payment::Model, ServiceError> {
        let payment = payment::ActiveModel {
            id: Set(Uuid::new_v4()),
            order_id: Set(payment_data.order_id),
            amount: Set(payment_data.amount),
            status: Set(Status::Pending.into()),
            payment_method: Set(payment_data.payment_method),
            payment_details: Set(payment_data.payment_details),
            created_at: Set(chrono::Utc::now()),
            updated_at: Set(chrono::Utc::now()),
        }
        .insert(&*self.db)
        .await?;

        Ok(payment.into())
    }

    pub async fn get_payment_by_id(&self, payment_id: Uuid) -> Result<Option<Model>, ServiceError> {
        let payment = payment::Entity::find_by_id(payment_id)
            .one(&*self.db)
            .await
            .map_err(|e| ServiceError::NotFound(e.to_string()))?;

        Ok(payment)
    }

    pub async fn get_payment_by_order_id(
        &self,
        order_id: Uuid,
    ) -> Result<Option<Model>, ServiceError> {
        let payment = payment::Entity::find()
            .filter(payment::Column::OrderId.eq(order_id))
            .one(&*self.db)
            .await
            .map_err(|e| ServiceError::NotFound(e.to_string()))?;

        Ok(payment)
    }

    pub async fn update_payment_status(
        &self,
        payment_id: Uuid,
        status: String,
    ) -> Result<Option<Model>, ServiceError> {
        let payment = payment::Entity::find_by_id(payment_id)
            .one(&*self.db)
            .await
            .map_err(|e| ServiceError::NotFound(e.to_string()))?;
        if let Some(payment) = payment {
            let mut active_model: payment::ActiveModel = payment.into();
            active_model.status = Set(status);
            active_model.updated_at = Set(chrono::Utc::now());
            let updated_payment = active_model.update(&*self.db).await?;

            Ok(updated_payment.into())
        } else {
            Err(ServiceError::NotFound("Payment not found".into()))
        }
    }

    pub async fn update_payment_details(
        &self,
        payment_id: Uuid,
        payment_details: serde_json::Value,
    ) -> Result<Model, ServiceError> {
        let payment = payment::Entity::find_by_id(payment_id)
            .one(&*self.db)
            .await
            .map_err(|e| ServiceError::NotFound(e.to_string()))?;

        if let Some(payment) = payment {
            let mut active_model: payment::ActiveModel = payment.into();
            active_model.payment_details = Set(Some(payment_details));
            active_model.updated_at = Set(chrono::Utc::now());
            let updated_payment = active_model.update(&*self.db).await?;

            Ok(updated_payment.into())
        } else {
            Err(ServiceError::NotFound("Payment not found".into()))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use sea_orm::MockDatabase;
    use serde_json::json;

    #[tokio::test]
    async fn test_create_payment() {
        let order_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![payment::Model {
                id: Uuid::new_v4(),
                order_id,
                amount: 200.0, // 100.00
                status: "pending".to_string(),
                payment_method: "card".to_string(),
                payment_details: Some(json!({
                    "card_last4": "4242",
                    "card_brand": "visa"
                })),
                created_at: chrono::Utc::now(),
                updated_at: chrono::Utc::now(),
            }]])
            .into_connection();

        let service = PaymentService::new(Arc::new(db));

        let payment_data = CreatePayment {
            order_id,
            amount: 100.0,
            payment_method: "card".to_string(),
            payment_details: Some(json!({
                "card_last4": "4242",
                "card_brand": "visa"
            })),
        };

        let result = service.create_payment(payment_data).await;
        assert!(result.is_ok());

        let payment_response = result.unwrap();
        assert_eq!(payment_response.order_id, order_id);
        assert_eq!(payment_response.status, "pending");
        assert_eq!(payment_response.amount, 100.0);
    }

    #[tokio::test]
    async fn test_get_payment_by_id() {
        let payment_id = Uuid::new_v4();
        let order_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![payment::Model {
                id: payment_id,
                order_id,
                amount: 100.0,
                status: "pending".to_string(),
                payment_method: "card".to_string(),
                payment_details: Some(json!({
                    "card_last4": "4242",
                    "card_brand": "visa"
                })),
                created_at: chrono::Utc::now(),
                updated_at: chrono::Utc::now(),
            }]])
            .into_connection();

        let service = PaymentService::new(Arc::new(db));

        let result = service.get_payment_by_id(payment_id).await;
        assert!(result.is_ok());

        let payment_response = result.unwrap();
        let payment_response = payment_response.unwrap();
        assert_eq!(payment_response.id, payment_id);
        assert_eq!(payment_response.order_id, order_id);
    }

    #[tokio::test]
    async fn test_update_payment_status() {
        let payment_id = Uuid::new_v4();
        let order_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![
                vec![payment::Model {
                    id: payment_id,
                    order_id,
                    amount: 100.0,
                    status: "pending".to_string(),
                    payment_method: "card".to_string(),
                    payment_details: Some(json!({
                        "card_last4": "4242",
                        "card_brand": "visa"
                    })),
                    created_at: chrono::Utc::now(),
                    updated_at: chrono::Utc::now(),
                }],
                vec![payment::Model {
                    id: payment_id,
                    order_id,
                    amount: 100.0,
                    status: "completed".to_string(),
                    payment_method: "card".to_string(),
                    payment_details: Some(json!({
                        "card_last4": "4242",
                        "card_brand": "visa"
                    })),
                    created_at: chrono::Utc::now(),
                    updated_at: chrono::Utc::now(),
                }],
            ])
            .into_connection();

        let service = PaymentService::new(db.into());

        let result = service
            .update_payment_status(payment_id, "completed".to_string())
            .await;
        assert!(result.is_ok());

        let payment_response = result.unwrap();
        assert_eq!(payment_response.unwrap().status, "completed");
    }
}
