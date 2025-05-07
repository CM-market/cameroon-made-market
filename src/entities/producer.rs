use sea_orm::entity::prelude::*;
use uuid::Uuid;
use chrono::NaiveDateTime;

/// Producers table, linked one-to-one with users
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "producers")]
pub struct Model {
    /// Primary key (UUID)
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    /// Foreign key to users (unique)
    #[sea_orm(unique)]
    pub user_id: Uuid,
    /// Full name of the producer
    pub full_name: String,
    /// Region of the producer
    pub region: String,
    /// Whether the producer is certified
    pub certified: bool,
    /// Timestamp of creation
    pub created_at: NaiveDateTime,
}

/// Defines relationships for the producers table
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// Belongs to a user
    #[sea_orm(belongs_to = "super::user::Entity", from = "Column::UserId", to = "super::user::Column::Id", on_update = "Cascade", on_delete = "Cascade")]
    User,
    /// One-to-many with products
    #[sea_orm(has_many = "super::product::Entity")]
    Product,
}

impl Related<super::user::Entity> for Entity {
    fn to() -> RelationDef { Relation::User.def() }
}
impl Related<super::product::Entity> for Entity {
    fn to() -> RelationDef { Relation::Product.def() }
}

impl ActiveModelBehavior for ActiveModel {} 