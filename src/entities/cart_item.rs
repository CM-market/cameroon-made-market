use sea_orm::entity::prelude::*;
use uuid::Uuid;

/// Cart items table, belongs to a cart and references a product
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "cart_items")]
pub struct Model {
    /// Primary key (UUID)
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    /// Foreign key to cart
    pub cart_id: Uuid,
    /// Foreign key to product
    pub product_id: Uuid,
    /// Quantity of the product in the cart
    pub quantity: i32,
}

/// Defines relationships for the cart_items table
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// Belongs to a cart
    #[sea_orm(belongs_to = "super::cart::Entity", from = "Column::CartId", to = "super::cart::Column::Id", on_update = "Cascade", on_delete = "Cascade")]
    Cart,
    /// Belongs to a product
    #[sea_orm(belongs_to = "super::product::Entity", from = "Column::ProductId", to = "super::product::Column::Id", on_update = "Cascade", on_delete = "Cascade")]
    Product,
}

impl Related<super::cart::Entity> for Entity {
    fn to() -> RelationDef { Relation::Cart.def() }
}
impl Related<super::product::Entity> for Entity {
    fn to() -> RelationDef { Relation::Product.def() }
}

impl ActiveModelBehavior for ActiveModel {} 