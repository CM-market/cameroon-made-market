use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;
use chrono::NaiveDateTime;
use rust_decimal::Decimal;

/// Products table, each product belongs to a producer
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "products")]
pub struct Model {
    /// Primary key (UUID)
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    /// Foreign key to producer
    pub producer_id: Uuid,
    /// Product name
    pub name: String,
    /// Product description
    pub description: String,
    /// Product price
    pub price: Decimal,
    /// Product category
    pub category: String,
    /// Product region
    pub region: String,
    /// Whether the product is certified
    pub certified: bool,
    /// Product image URL
    pub image_url: String,
    /// Timestamp of creation
    pub created_at: NaiveDateTime,
}

/// Defines relationships for the products table
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// Belongs to a producer
    #[sea_orm(belongs_to = "super::producer::Entity", from = "Column::ProducerId", to = "super::producer::Column::Id", on_update = "Cascade", on_delete = "Cascade")]
    Producer,
    /// One-to-many with cart_items
    #[sea_orm(has_many = "super::cart_item::Entity")]
    CartItem,
    /// One-to-many with order_items
    #[sea_orm(has_many = "super::order_item::Entity")]
    OrderItem,
}

impl Related<super::producer::Entity> for Entity {
    fn to() -> RelationDef { Relation::Producer.def() }
}
impl Related<super::cart_item::Entity> for Entity {
    fn to() -> RelationDef { Relation::CartItem.def() }
}
impl Related<super::order_item::Entity> for Entity {
    fn to() -> RelationDef { Relation::OrderItem.def() }
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
            seller_id: Some(product.producer_id),
            title: product.name,
            description: Some(product.description),
            price: product.price,
            category: Some(product.category),
            certified: product.certified,
            image_urls: vec![product.image_url],
            created_at: DateTime::from_utc(product.created_at.naive_utc(), Utc),
            updated_at: DateTime::from_utc(product.created_at.naive_utc(), Utc),
        }
    }
} 