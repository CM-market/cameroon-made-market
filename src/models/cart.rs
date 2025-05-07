use chrono::{DateTime, Utc};
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Cart model representing a shopping cart in the marketplace
/// This model is used to track items that users want to purchase
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "carts")]
pub struct Model {
    /// Unique identifier for the cart
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    /// Unique session identifier for guest shopping carts
    /// This allows tracking cart items for users who haven't logged in
    #[sea_orm(unique)]
    pub session_id: Uuid,
    /// Timestamp when the cart was created
    pub created_at: DateTime<Utc>,
}

/// Defines the relationships between Cart and other entities
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// Relationship with CartItems that belong to this cart
    #[sea_orm(has_many = "super::cart_item::Entity")]
    CartItem,
    #[sea_orm(
        belongs_to = "super::user::Entity",
        from = "Column::SessionId",
        to = "super::user::Column::Id"
    )]
    User,
}

/// Implements the relationship with CartItem entity
impl Related<super::cart_item::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::CartItem.def()
    }
}
impl Related<super::user::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::User.def()
    }
}

/// Implements default behavior for active model operations
impl ActiveModelBehavior for ActiveModel {}
