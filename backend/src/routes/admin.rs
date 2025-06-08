use axum::{
    routing::{get, put, post},
    Router,
};
use crate::handlers::admin_handlers::*;
use crate::middleware::admin_auth::admin_auth;

use crate::state::AppState;

pub fn admin_routes() -> Router<AppState> {
    Router::new()
        .route("/admins/dashboard", get(get_dashboard_metrics))
        .route("/admins/users", get(get_users))
        .route("/admins/users/:id", put(update_user_status))
        .route("/admins/products", get(get_products))
        .route("/admins/products/:id", put(update_product_status))
        .route("/admins/products/:id/reject", put(reject_product))
        .route("/admins/products/:id/approve", post(approve_product))
        .route("/admins/orders", get(get_orders))
        .route("/admins/orders/:id", get(get_order_details))
        .route("/admins/sales-trends", get(get_sales_trends))
        .route("/admins/buyer-conversion", get(get_buyer_conversion))
        .route("/admins/top-categories", get(get_top_categories))
        .route("/admins/recent-activities", get(get_recent_activities))
        .route("/admins/products/pending", get(get_pending_products))
        .route_layer(axum::middleware::from_fn(admin_auth))
}