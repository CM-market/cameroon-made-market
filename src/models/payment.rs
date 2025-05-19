use chrono::{DateTime, Utc};
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Payment model representing financial transactions in the marketplace
/// This model tracks payment information and status for orders
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "payments")]
pub struct Model {
    /// Unique identifier for the payment
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    /// Reference to the order this payment is associated with
    pub order_id: Uuid,
    /// Amount of the payment
    pub amount: f64,
    /// Current status of the payment (e.g., "pending", "completed", "failed", "refunded")
    pub status: String,
    /// Method used for payment (e.g., "credit_card", "mobile_money", "bank_transfer")
    pub payment_method: String,
    /// Additional payment details stored as JSON
    /// This can include transaction IDs, payment provider details, etc.
    pub payment_details: Option<Json>,
    /// Timestamp when the payment was created
    pub created_at: DateTime<Utc>,
    /// Timestamp when the payment was last updated
    pub updated_at: DateTime<Utc>,
}

/// Defines the relationships between Payment and other entities
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// Relationship with the Order this payment is for
    /// If the order is deleted, the payment is also deleted
    #[sea_orm(
        belongs_to = "super::order::Entity",
        from = "Column::OrderId",
        to = "super::order::Column::Id",
        on_update = "NoAction",
        on_delete = "Cascade"
    )]
    Order,
}

/// Implements the relationship with Order entity
impl Related<super::order::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Order.def()
    }
}

/// Implements default behavior for active model operations
impl ActiveModelBehavior for ActiveModel {}
