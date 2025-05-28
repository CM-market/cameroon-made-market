use chrono::{DateTime, Utc};
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use std::fmt;
use uuid::Uuid;

use crate::routes::order::OrderItemRequest;

/// Order model representing customer purchases in the marketplace
/// This model tracks the entire order lifecycle from creation to completion
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "orders")]
pub struct Model {
    /// Unique identifier for the order
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    /// user identifier for guest checkout orders
    pub user_id: String,
    /// Name of the customer placing the order
    pub customer_name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    /// Email address of the customer
    pub customer_email: Option<String>,
    /// Phone number of the customer
    pub customer_phone: String,
    /// Delivery address for the order
    pub delivery_address: String,
    /// region where the order is to be delivered
    pub region: String,
    /// City where the order is to be delivered
    pub city: String,
    /// Current status of the order
    #[sea_orm(column_type = "Text")]
    pub status: String,
    /// Total amount of the order including all items and fees
    pub total: f64,
    /// Timestamp when the order was created
    pub created_at: DateTime<Utc>,
}

/// Order status enum
#[derive(Debug, Clone, PartialEq, Eq, Hash, Deserialize)]
pub enum Status {
    /// Order is pending and awaiting payment
    Pending,
    /// Order has been paid and is being processed
    Processing,
    /// Order has been shipped to the customer
    Shipped,
    /// Order has been delivered to the customer
    Delivered,
    /// Order has been cancelled
    Cancelled,
}

impl fmt::Display for Status {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Status::Pending => write!(f, "Pending"),
            Status::Processing => write!(f, "Processing"),
            Status::Shipped => write!(f, "Shipped"),
            Status::Delivered => write!(f, "Delivered"),
            Status::Cancelled => write!(f, "Cancelled"),
        }
    }
}

impl From<Status> for String {
    fn from(status: Status) -> String {
        match status {
            Status::Pending => "pending".to_string(),
            Status::Processing => "processing".to_string(),
            Status::Shipped => "shipped".to_string(),
            Status::Delivered => "delivered".to_string(),
            Status::Cancelled => "cancelled".to_string(),
        }
    }
}

impl From<String> for Status {
    fn from(status: String) -> Status {
        match status.as_str() {
            "pending" => Status::Pending,
            "processing" => Status::Processing,
            "shipped" => Status::Shipped,
            "delivered" => Status::Delivered,
            "cancelled" => Status::Cancelled,
            _ => Status::Pending,
        }
    }
}

/// Defines the relationships between Order and other entities
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// Relationship with the User who placed the order
    /// If the user is deleted, the order remains but user_id becomes null
    #[sea_orm(
        belongs_to = "super::user::Entity",
        from = "Column::UserId",
        to = "super::user::Column::Id",
        on_update = "NoAction",
        on_delete = "SetNull"
    )]
    User,
    /// Relationship with OrderItems that belong to this order
    #[sea_orm(has_many = "super::order_item::Entity")]
    OrderItem,
    /// Relationship with Payments associated with this order
    #[sea_orm(has_many = "super::payment::Entity")]
    Payment,
}

/// Implements the relationship with User entity
impl Related<super::user::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::User.def()
    }
}

/// Implements the relationship with OrderItem entity
impl Related<super::order_item::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::OrderItem.def()
    }
}

/// Implements the relationship with Payment entity
impl Related<super::payment::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Payment.def()
    }
}
#[derive(Serialize, Deserialize)]
pub struct CreateOrder {
    /// Unique identifier for the order
    pub id: Uuid,
    /// Session identifier for guest checkout orders
    pub user_id: String,
    /// Name of the customer placing the order
    pub customer_name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    /// Email address of the customer
    pub customer_email: Option<String>,
    /// Phone number of the customer
    pub customer_phone: String,
    /// Delivery address for the order
    pub delivery_address: String,
    /// Current status of the ord
    pub status: String,
    /// Total amount of the order including all items and fees
    pub total: f64,
    /// region where the order is to be delivered
    pub region: String,
    /// City where the order is to be delivered
    pub city: String,
    /// Timestamp when the order was created
    pub created_at: DateTime<Utc>,
    pub items: Vec<Items>,
}
#[derive(Serialize, Deserialize)]
pub struct Items {
    pub product_id: Uuid,
    pub quantity: u32,
    pub price: f64,
}

#[derive(Debug)]
pub struct NewOrder {
    pub user_id: Uuid,
    pub customer_name: String,
    pub customer_email: Option<String>,
    pub customer_phone: String,
    pub delivery_address: String,
    pub status: String,
    pub total: f64,
    pub items: Vec<OrderItemRequest>,
    pub city: String,
    pub region: String
}

/// Implements default behavior for active model operations
impl ActiveModelBehavior for ActiveModel {}
