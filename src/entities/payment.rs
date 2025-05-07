use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc, NaiveDateTime};
use uuid::Uuid;
use rust_decimal::Decimal;

/// Payments table, belongs to an order
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "payments")]
pub struct Model {
    /// Primary key (UUID)
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    /// Foreign key to order
    pub order_id: Uuid,
    /// Payment provider (e.g. MTN, Orange)
    pub provider: String,
    /// Payment status
    pub status: PaymentStatus,
    /// Transaction ID
    pub transaction_id: String,
    /// Timestamp when paid
    pub paid_at: NaiveDateTime,
}

/// Enum for payment status
#[derive(Copy, Clone, Debug, EnumIter, DeriveActiveEnum, Serialize, Deserialize, PartialEq, Eq)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "payment_status")]
pub enum PaymentStatus {
    #[sea_orm(string_value = "success")]
    Success,
    #[sea_orm(string_value = "failure")]
    Failure,
}

/// Defines relationships for the payments table
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// Belongs to an order
    #[sea_orm(belongs_to = "super::order::Entity", from = "Column::OrderId", to = "super::order::Column::Id", on_update = "Cascade", on_delete = "Cascade")]
    Order,
}

impl Related<super::order::Entity> for Entity {
    fn to() -> RelationDef { Relation::Order.def() }
}

impl ActiveModelBehavior for ActiveModel {}

#[derive(Debug, Deserialize)]
pub struct CreatePayment {
    pub order_id: Uuid,
    pub amount: Decimal,
    pub currency: String,
    pub payment_method: String,
    pub payment_details: Option<Json>,
}

#[derive(Debug, Deserialize)]
pub struct UpdatePayment {
    pub status: Option<String>,
    pub payment_details: Option<Json>,
}

#[derive(Debug, Serialize)]
pub struct PaymentResponse {
    pub id: Uuid,
    pub order_id: Uuid,
    pub amount: Decimal,
    pub currency: String,
    pub status: String,
    pub payment_method: String,
    pub payment_details: Option<Json>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<Model> for PaymentResponse {
    fn from(payment: Model) -> Self {
        Self {
            id: payment.id,
            order_id: payment.order_id,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status.to_string(),
            payment_method: payment.provider,
            payment_details: payment.transaction_id.into(),
            created_at: DateTime::from_utc(payment.paid_at.naive_utc(), Utc),
            updated_at: DateTime::from_utc(payment.paid_at.naive_utc(), Utc),
        }
    }
} 