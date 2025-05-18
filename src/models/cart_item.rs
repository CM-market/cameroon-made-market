use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// CartItem model representing individual items in a shopping cart
/// This model tracks the quantity of each product in the cart
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "cart_items")]
pub struct Model {
    /// Unique identifier for the cart item
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    /// Reference to the parent cart
    pub cart_id: Uuid,
    /// Reference to the product in the cart
    pub product_id: Uuid,
    /// Quantity of the product in the cart
    pub quantity: i32,

}

/// Defines the relationships between CartItem and other entities
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// Relationship with the parent Cart
    /// If the cart is deleted, the cart item is also deleted
    #[sea_orm(
        belongs_to = "super::cart::Entity",
        from = "Column::CartId",
        to = "super::cart::Column::Id",
        on_update = "NoAction",
        on_delete = "Cascade"
    )]
    Cart,
    /// Relationship with the Product in the cart
    /// If the product is deleted, the cart item is also deleted
    #[sea_orm(
        belongs_to = "super::product::Entity",
        from = "Column::ProductId",
        to = "super::product::Column::Id",
        on_update = "NoAction",
        on_delete = "Cascade"
    )]
    Product,
}

/// Implements the relationship with Cart entity
impl Related<super::cart::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Cart.def()
    }
}

/// Implements the relationship with Product entity
impl Related<super::product::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Product.def()
    }
}

pub struct CartItem {
    pub cart_id: Uuid,
    pub product_id: Uuid,
    pub quantity: i32,
}
/// Implements default behavior for active model operations
impl ActiveModelBehavior for ActiveModel {}
