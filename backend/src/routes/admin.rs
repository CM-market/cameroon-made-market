use axum::{
    routing::{get, put, post},
    Router,
};
use crate::handlers::admin_handlers::*;
use crate::middleware::admin_auth::admin_auth;

use crate::state::AppState;

pub fn admin_routes() -> Router<AppState> {
    Router::new()
        .route("/api/admins/dashboard", get(get_dashboard_metrics))
        .route("/api/admins/users", get(get_users))
        .route("/api/admins/users/:id", put(update_user_status))
        .route("/api/admins/products", get(get_products))
        .route("/api/admins/products/:id", put(update_product_status))
        .route("/api/admins/products/:id/reject", put(reject_product))
        .route("/api/admins/products/:id/approve", post(approve_product))
        .route("/api/admins/orders", get(get_orders))
        .route("/api/admins/orders/:id", get(get_order_details))
        .route("/api/admins/sales-trends", get(get_sales_trends))
        .route("/api/admins/buyer-conversion", get(get_buyer_conversion))
        .route("/api/admins/top-categories", get(get_top_categories))
        .route("/api/admins/recent-activities", get(get_recent_activities))
        .route("/api/admins/products/pending", get(get_pending_products))
        .route_layer(axum::middleware::from_fn(admin_auth))
}