use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Product model representing items that can be sold in the marketplace
/// This model includes all necessary fields for product information and tracking
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "products")]
pub struct Model {
    /// Unique identifier for the product
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    /// Reference to the seller (user) who created the product
    /// Optional to allow for system-created products
    pub seller_id: Option<Uuid>,
    /// Title of the product
    pub title: String,
    /// Detailed description of the product
    pub description: Option<String>,
    /// Price of the product in the specified currency
    pub price: Decimal,
    /// Category the product belongs to (e.g., "Electronics", "Clothing")
    pub category: Option<String>,
    /// List of URLs to product images
    pub image_urls: Vec<String>,
    /// Timestamp when the product was created
    pub created_at: DateTime<Utc>,
    /// Timestamp when the product was last updated
    pub updated_at: DateTime<Utc>,
}

/// Defines the relationships between Product and other entities
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// Relationship with the User (seller) who created the product
    /// If the seller is deleted, the product remains but seller_id becomes null
    #[sea_orm(
        belongs_to = "super::user::Entity",
        from = "Column::SellerId",
        to = "super::user::Column::Id",
        on_update = "NoAction",
        on_delete = "SetNull"
    )]
    User,
    /// Relationship with CartItems that contain this product
    #[sea_orm(has_many = "super::cart_item::Entity")]
    CartItem,
    /// Relationship with OrderItems that contain this product
    #[sea_orm(has_many = "super::order_item::Entity")]
    OrderItem,
}

/// Implements the relationship with User entity
impl Related<super::user::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::User.def()
    }
}

/// Implements the relationship with CartItem entity
impl Related<super::cart_item::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::CartItem.def()
    }
}

/// Implements the relationship with OrderItem entity
impl Related<super::order_item::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::OrderItem.def()
    }
}

/// Implements default behavior for active model operations
impl ActiveModelBehavior for ActiveModel {}
