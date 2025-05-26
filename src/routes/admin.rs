use axum::{
    routing::{get, put},
    Router,
};
use crate::handlers::admin_handlers::*;
use crate::middleware::admin_auth::admin_auth;

use crate::state::AppState;

pub fn admin_routes() -> Router<AppState> {
    Router::new()
        .route("/api/admin/dashboard", get(get_dashboard_metrics))
        .route("/api/admin/users", get(get_users))
        .route("/api/admin/users/:id", put(update_user_status))
        .route("/api/admin/products", get(get_products))
        .route("/api/admin/products/:id", put(update_product_status))
        .route("/api/admin/orders", get(get_orders))
        .route("/api/admin/orders/:id", get(get_order_details))
        .route("/api/admin/sales-trends", get(get_sales_trends))
        .route("/api/admin/buyer-conversion", get(get_buyer_conversion))
        .route("/api/admin/top-categories", get(get_top_categories))
        .route("/api/admin/recent-activities", get(get_recent_activities))
        .route_layer(axum::middleware::from_fn(admin_auth))
}