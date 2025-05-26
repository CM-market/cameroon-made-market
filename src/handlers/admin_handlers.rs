use crate::models::{
    order::Entity as Order,
    product::{self, Entity as Product},
    user::{self, Entity as User, UserRole},
};
use crate::state::AppState;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, PaginatorTrait, QueryFilter, Set};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize)]
pub struct DashboardMetrics {
    total_users: i64,
    total_vendors: i64,
    total_products: i64,
    total_orders: i64,
    total_revenue: f64,
}

#[derive(Deserialize)]
pub struct UserStatusUpdate {
    is_active: bool,
}

#[derive(Deserialize)]
pub struct ProductStatusUpdate {
    is_approved: bool,
}

pub async fn get_dashboard_metrics(
    State(state): State<AppState>,
) -> Result<Json<DashboardMetrics>, StatusCode> {
    let db = &state.db;

    let total_users = User::find()
        .filter(user::Column::Role.eq(UserRole::Buyer))
        .count(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let total_vendors = User::find()
        .filter(user::Column::Role.eq(UserRole::Vendor))
        .count(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let total_products = Product::find()
        .count(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let total_orders = Order::find()
        .count(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Calculate total revenue from orders
    let total_revenue = Order::find()
        .all(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .iter()
        .map(|order| order.total)
        .sum();

    let metrics = DashboardMetrics {
        total_users: total_users.try_into().unwrap(),
        total_vendors: total_vendors.try_into().unwrap(),
        total_products: total_products.try_into().unwrap(),
        total_orders: total_orders.try_into().unwrap(),
        total_revenue,
    };

    Ok(Json(metrics))
}

pub async fn get_users(
    State(state): State<AppState>,
) -> Result<Json<Vec<user::Model>>, StatusCode> {
    let db = &state.db;

    let users = User::find()
        .all(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(users))
}

pub async fn update_user_status(
    State(state): State<AppState>,
    Path(user_id): Path<Uuid>,
    Json(status): Json<UserStatusUpdate>,
) -> Result<Json<user::Model>, StatusCode> {
    let db = &state.db;

    let user = User::find_by_id(user_id)
        .one(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    let mut user: user::ActiveModel = user.into();
    user.is_active = Set(status.is_active);
    let user = user
        .update(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(user))
}

pub async fn get_products(
    State(state): State<AppState>,
) -> Result<Json<Vec<crate::models::product::Model>>, StatusCode> {
    let db = &state.db;

    let products = Product::find()
        .all(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(products))
}

pub async fn update_product_status(
    State(state): State<AppState>,
    Path(product_id): Path<Uuid>,
    Json(status): Json<ProductStatusUpdate>,
) -> Result<Json<crate::models::product::Model>, StatusCode> {
    let db = &state.db;

    let product = Product::find_by_id(product_id)
        .one(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    let mut product: product::ActiveModel = product.into();
    product.is_approved = Set(status.is_approved);
    let product = product
        .update(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(product))
}

pub async fn get_orders(
    State(state): State<AppState>,
) -> Result<Json<Vec<crate::models::order::Model>>, StatusCode> {
    let db = &state.db;

    let orders = Order::find()
        .all(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(orders))
}

pub async fn get_order_details(
    State(state): State<AppState>,
    Path(order_id): Path<Uuid>,
) -> Result<Json<crate::models::order::Model>, StatusCode> {
    let db = &state.db;

    let order = Order::find_by_id(order_id)
        .one(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    Ok(Json(order))
}
