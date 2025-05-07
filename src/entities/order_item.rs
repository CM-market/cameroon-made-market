use sea_orm::entity::prelude::*;
use uuid::Uuid;
use rust_decimal::Decimal;

/// Order items table, belongs to an order and references a product
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "order_items")]
pub struct Model {
    /// Primary key (UUID)
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    /// Foreign key to order
    pub order_id: Uuid,
    /// Foreign key to product
    pub product_id: Uuid,
    /// Quantity of the product in the order
    pub quantity: i32,
    /// Unit price at the time of order
    pub unit_price: Decimal,
}

/// Defines relationships for the order_items table
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// Belongs to an order
    #[sea_orm(belongs_to = "super::order::Entity", from = "Column::OrderId", to = "super::order::Column::Id", on_update = "Cascade", on_delete = "Cascade")]
    Order,
    /// Belongs to a product
    #[sea_orm(belongs_to = "super::product::Entity", from = "Column::ProductId", to = "super::product::Column::Id", on_update = "Cascade", on_delete = "Cascade")]
    Product,
}

impl Related<super::order::Entity> for Entity {
    fn to() -> RelationDef { Relation::Order.def() }
}
impl Related<super::product::Entity> for Entity {
    fn to() -> RelationDef { Relation::Product.def() }
}

impl ActiveModelBehavior for ActiveModel {} 