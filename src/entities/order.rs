use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;
use chrono::NaiveDateTime;
use rust_decimal::Decimal;

/// Orders table, belongs to a user (optional) or a guest session
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "orders")]
pub struct Model {
    /// Primary key (UUID)
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    /// Foreign key to user (nullable)
    pub user_id: Option<Uuid>,
    /// Guest session ID (nullable, indexed)
    #[sea_orm(indexed)]
    pub session_id: Option<String>,
    /// Total order amount
    pub total: Decimal,
    /// Order status
    pub status: OrderStatus,
    /// Customer name
    pub customer_name: String,
    /// Customer phone
    pub customer_phone: String,
    /// Customer email
    pub customer_email: String,
    /// Timestamp of creation
    pub created_at: NaiveDateTime,
}

/// Enum for order status
#[derive(Copy, Clone, Debug, EnumIter, DeriveActiveEnum, Serialize, Deserialize, PartialEq, Eq)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "order_status")]
pub enum OrderStatus {
    #[sea_orm(string_value = "pending")]
    Pending,
    #[sea_orm(string_value = "paid")]
    Paid,
    #[sea_orm(string_value = "failed")]
    Failed,
    #[sea_orm(string_value = "shipped")]
    Shipped,
}

/// Defines relationships for the orders table
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// Belongs to a user
    #[sea_orm(belongs_to = "super::user::Entity", from = "Column::UserId", to = "super::user::Column::Id", on_update = "Cascade", on_delete = "SetNull")]
    User,
    /// One-to-many with order_items
    #[sea_orm(has_many = "super::order_item::Entity")]
    OrderItem,
    /// One-to-many with payments
    #[sea_orm(has_many = "super::payment::Entity")]
    Payment,
}

impl Related<super::user::Entity> for Entity {
    fn to() -> RelationDef { Relation::User.def() }
}
impl Related<super::order_item::Entity> for Entity {
    fn to() -> RelationDef { Relation::OrderItem.def() }
}
impl Related<super::payment::Entity> for Entity {
    fn to() -> RelationDef { Relation::Payment.def() }
}

impl ActiveModelBehavior for ActiveModel {}

#[derive(Debug, Deserialize)]
pub struct CreateOrder {
    pub session_id: Option<String>,
    pub user_id: Option<Uuid>,
    pub customer_name: String,
    pub customer_email: Option<String>,
    pub customer_phone: Option<String>,
    pub delivery_address: Option<String>,
    pub items: Vec<CreateOrderItem>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateOrder {
    pub status: Option<String>,
    pub total: Option<Decimal>,
}

#[derive(Debug, Serialize)]
pub struct OrderResponse {
    pub id: Uuid,
    pub session_id: Option<String>,
    pub user_id: Option<Uuid>,
    pub customer_name: String,
    pub customer_email: Option<String>,
    pub customer_phone: Option<String>,
    pub delivery_address: Option<String>,
    pub status: String,
    pub total: Option<Decimal>,
    pub created_at: DateTime<Utc>,
    pub items: Vec<OrderItemResponse>,
}

impl From<(Model, Vec<super::order_item::Model>)> for OrderResponse {
    fn from((order, items): (Model, Vec<super::order_item::Model>)) -> Self {
        Self {
            id: order.id,
            session_id: order.session_id,
            user_id: order.user_id,
            customer_name: order.customer_name,
            customer_email: order.customer_email,
            customer_phone: order.customer_phone,
            delivery_address: order.delivery_address,
            status: order.status,
            total: order.total,
            created_at: order.created_at,
            items: items.into_iter().map(OrderItemResponse::from).collect(),
        }
    }
}

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "order_items")]
pub struct OrderItemModel {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub order_id: Uuid,
    pub product_id: Uuid,
    pub quantity: i32,
    pub price: Decimal,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum OrderItemRelation {
    #[sea_orm(
        belongs_to = "super::order::Entity",
        from = "Column::OrderId",
        to = "super::order::Column::Id",
        on_update = "NoAction",
        on_delete = "Cascade"
    )]
    Order,
    #[sea_orm(
        belongs_to = "super::product::Entity",
        from = "Column::ProductId",
        to = "super::product::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    Product,
}

impl Related<super::order::Entity> for Entity {
    fn to() -> RelationDef {
        OrderItemRelation::Order.def()
    }
}

impl Related<super::product::Entity> for Entity {
    fn to() -> RelationDef {
        OrderItemRelation::Product.def()
    }
}

#[derive(Debug, Deserialize)]
pub struct CreateOrderItem {
    pub product_id: Uuid,
    pub quantity: i32,
    pub price: Decimal,
}

#[derive(Debug, Serialize)]
pub struct OrderItemResponse {
    pub id: Uuid,
    pub order_id: Uuid,
    pub product_id: Uuid,
    pub quantity: i32,
    pub price: Decimal,
    pub product: Option<super::product::ProductResponse>,
}

impl From<OrderItemModel> for OrderItemResponse {
    fn from(item: OrderItemModel) -> Self {
        Self {
            id: item.id,
            order_id: item.order_id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            product: None,
        }
    }
} 