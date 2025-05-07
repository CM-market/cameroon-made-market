use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;
use chrono::NaiveDateTime;

/// Carts table, each cart belongs to a user or a guest session
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "carts")]
pub struct Model {
    /// Primary key (UUID)
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    /// Foreign key to user (nullable)
    pub user_id: Option<Uuid>,
    /// Guest session ID (nullable, indexed)
    #[sea_orm(indexed)]
    pub session_id: Option<String>,
    /// Timestamp of creation
    pub created_at: NaiveDateTime,
}

/// Defines relationships for the carts table
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// Belongs to a user
    #[sea_orm(belongs_to = "super::user::Entity", from = "Column::UserId", to = "super::user::Column::Id", on_update = "Cascade", on_delete = "SetNull")]
    User,
    /// One-to-many with cart_items
    #[sea_orm(has_many = "super::cart_item::Entity")]
    CartItem,
}

impl Related<super::user::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::User.def()
    }
}
impl Related<super::cart_item::Entity> for Entity {
    fn to() -> RelationDef { Relation::CartItem.def() }
}

impl ActiveModelBehavior for ActiveModel {}

#[derive(Debug, Deserialize)]
pub struct CreateCart {
    pub session_id: String,
}

#[derive(Debug, Serialize)]
pub struct CartResponse {
    pub id: Uuid,
    pub session_id: String,
    pub created_at: DateTime<Utc>,
    pub items: Vec<CartItemResponse>,
}

impl From<(Model, Vec<super::cart_item::Model>)> for CartResponse {
    fn from((cart, items): (Model, Vec<super::cart_item::Model>)) -> Self {
        Self {
            id: cart.id,
            session_id: cart.session_id.unwrap(),
            created_at: DateTime::from_utc(cart.created_at.naive_utc(), Utc),
            items: items.into_iter().map(CartItemResponse::from).collect(),
        }
    }
}

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "cart_items")]
pub struct CartItemModel {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub cart_id: Uuid,
    pub product_id: Uuid,
    pub quantity: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum CartItemRelation {
    #[sea_orm(
        belongs_to = "super::cart::Entity",
        from = "Column::CartId",
        to = "super::cart::Column::Id",
        on_update = "NoAction",
        on_delete = "Cascade"
    )]
    Cart,
    #[sea_orm(
        belongs_to = "super::product::Entity",
        from = "Column::ProductId",
        to = "super::product::Column::Id",
        on_update = "NoAction",
        on_delete = "Cascade"
    )]
    Product,
}

impl Related<super::cart::Entity> for Entity {
    fn to() -> RelationDef {
        CartItemRelation::Cart.def()
    }
}

impl Related<super::product::Entity> for Entity {
    fn to() -> RelationDef {
        CartItemRelation::Product.def()
    }
}

#[derive(Debug, Deserialize)]
pub struct CreateCartItem {
    pub cart_id: Uuid,
    pub product_id: Uuid,
    pub quantity: i32,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCartItem {
    pub quantity: i32,
}

#[derive(Debug, Serialize)]
pub struct CartItemResponse {
    pub id: Uuid,
    pub cart_id: Uuid,
    pub product_id: Uuid,
    pub quantity: i32,
    pub product: Option<super::product::ProductResponse>,
}

impl From<CartItemModel> for CartItemResponse {
    fn from(item: CartItemModel) -> Self {
        Self {
            id: item.id,
            cart_id: item.cart_id,
            product_id: item.product_id,
            quantity: item.quantity,
            product: None,
        }
    }
} 