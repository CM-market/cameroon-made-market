use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "products")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub seller_id: Option<Uuid>,
    pub title: String,
    pub description: Option<String>,
    pub price: Decimal,
    pub category: Option<String>,
    pub certified: bool,
    pub image_urls: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::user::Entity",
        from = "Column::SellerId",
        to = "super::user::Column::Id",
        on_update = "NoAction",
        on_delete = "SetNull"
    )]
    User,
    #[sea_orm(has_many = "super::cart_item::Entity")]
    CartItem,
    #[sea_orm(has_many = "super::order_item::Entity")]
    OrderItem,
}

impl Related<super::user::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::User.def()
    }
}

impl Related<super::cart_item::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::CartItem.def()
    }
}

impl Related<super::order_item::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::OrderItem.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

#[derive(Debug, Deserialize)]
pub struct CreateProduct {
    pub seller_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub price: Decimal,
    pub category: Option<String>,
    pub certified: bool,
    pub image_urls: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProduct {
    pub title: Option<String>,
    pub description: Option<String>,
    pub price: Option<Decimal>,
    pub category: Option<String>,
    pub certified: Option<bool>,
    pub image_urls: Option<Vec<String>>,
}

#[derive(Debug, Serialize)]
pub struct ProductResponse {
    pub id: Uuid,
    pub seller_id: Option<Uuid>,
    pub title: String,
    pub description: Option<String>,
    pub price: Decimal,
    pub category: Option<String>,
    pub certified: bool,
    pub image_urls: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<Model> for ProductResponse {
    fn from(product: Model) -> Self {
        Self {
            id: product.id,
            seller_id: product.seller_id,
            title: product.title,
            description: product.description,
            price: product.price,
            category: product.category,
            certified: product.certified,
            image_urls: product.image_urls,
            created_at: product.created_at,
            updated_at: product.updated_at,
        }
    }
} 