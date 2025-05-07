use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;
use chrono::NaiveDateTime;

/// Stores registered users (producers and admins only)
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "users")]
pub struct Model {
    /// Primary key (UUID)
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    /// Unique email address
    #[sea_orm(unique)]
    pub email: String,
    /// Hashed password
    pub password_hash: String,
    /// User role (producer or admin)
    pub role: UserRole,
    /// Timestamp of creation
    pub created_at: NaiveDateTime,
}

/// Enum for user roles
#[derive(Copy, Clone, Debug, EnumIter, DeriveActiveEnum, Serialize, Deserialize, PartialEq, Eq)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "user_role")]
pub enum UserRole {
    #[sea_orm(string_value = "producer")]
    Producer,
    #[sea_orm(string_value = "admin")]
    Admin,
}

/// Defines relationships for the users table
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// One-to-one with producers
    #[sea_orm(has_one = "super::producer::Entity")]
    Producer,
    /// One-to-many with carts
    #[sea_orm(has_many = "super::cart::Entity")]
    Cart,
    /// One-to-many with orders
    #[sea_orm(has_many = "super::order::Entity")]
    Order,
}

impl Related<super::producer::Entity> for Entity {
    fn to() -> RelationDef { Relation::Producer.def() }
}
impl Related<super::cart::Entity> for Entity {
    fn to() -> RelationDef { Relation::Cart.def() }
}
impl Related<super::order::Entity> for Entity {
    fn to() -> RelationDef { Relation::Order.def() }
}

impl ActiveModelBehavior for ActiveModel {}

#[derive(Debug, Deserialize)]
pub struct CreateUser {
    pub name: String,
    pub email: String,
    pub phone: Option<String>,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateUser {
    pub name: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub password: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub phone: Option<String>,
    pub role: String,
    pub created_at: DateTime<Utc>,
}

impl From<Model> for UserResponse {
    fn from(user: Model) -> Self {
        Self {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role.to_string(),
            created_at: DateTime::from_utc(user.created_at.naive_utc(), Utc),
        }
    }
} 