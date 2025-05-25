use rust_decimal::Decimal;
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// OrderItem model representing individual items within an order
/// This model tracks the quantity and price of each product in the order
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "order_items")]
pub struct Model {
    /// Unique identifier for the order item
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    /// Reference to the parent order
    pub order_id: Uuid,
    /// Reference to the product being ordered
    pub product_id: Uuid,
    /// Quantity of the product ordered
    pub quantity: i32,
}

/// Defines the relationships between OrderItem and other entities
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// Relationship with the parent Order
    /// If the order is deleted, the order item is also deleted
    #[sea_orm(
        belongs_to = "super::order::Entity",
        from = "Column::OrderId",
        to = "super::order::Column::Id",
        on_update = "NoAction",
        on_delete = "Cascade"
    )]
    Order,
    /// Relationship with the Product being ordered
    /// If the product is deleted, the order item remains for record keeping
    #[sea_orm(
        belongs_to = "super::product::Entity",
        from = "Column::ProductId",
        to = "super::product::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    Product,
}

/// Implements the relationship with Order entity
impl Related<super::order::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Order.def()
    }
}

/// Implements the relationship with Product entity
impl Related<super::product::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Product.def()
    }
}

pub struct OrderItem {
    /// Unique identifier for the order item
    pub id: Uuid,
    /// Reference to the parent order
    pub order_id: Uuid,
    /// Reference to the product being ordered
    pub product_id: Uuid,
    /// Quantity of the product ordered
    pub quantity: i32,
    /// Price of the product at the time of order
    pub price: Decimal,
}
/// Implements default behavior for active model operations
impl ActiveModelBehavior for ActiveModel {}
