use crate::{
    middleware::auth::AuthUser, models::order::{NewOrder, Status}, state::AppState, utils::shared::ApiResponse,
};
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{delete, get, post, put},
    Extension, Json, Router,
};
use serde::Deserialize;
use tracing::{error, info};
use uuid::Uuid;

pub fn config() -> Router<AppState> {
    Router::new()
        .route("/orders", get(list_orders))
        .route("/orders", post(create_order))
        .route("/orders/:id", get(get_order))
        .route("/orders/:id/status", put(update_order_status))
        .route("/orders/:id/items", get(get_order_items))
        .route("/orders/:id", delete(delete_order))
}

#[derive(Deserialize)]
pub struct ListOrdersQuery {
    user_id: Option<Uuid>,
    status: Option<String>,
}

#[derive(Deserialize)]
pub struct CreateOrderRequest {
    customer_name: String,
    customer_email: Option<String>,
    customer_phone: String,
    delivery_address: String,
    total: f64,
    items: Vec<OrderItemRequest>,
}

#[derive(Deserialize, Debug)]
pub struct OrderItemRequest {
    pub product_id: Uuid,
    pub quantity: u32,
    pub price: f64,
}

#[derive(Deserialize)]
pub struct UpdateOrderStatusRequest {
    status: Status,
}

#[axum::debug_handler]
async fn list_orders(
    State(state): State<AppState>,
    axum::extract::Query(params): axum::extract::Query<ListOrdersQuery>,
) -> impl IntoResponse {
    match state
        .order_service
        .list_orders(params.user_id, params.status.map(|s| s.into()))
        .await
    {
        Ok(orders) => Json(ApiResponse::success(
            orders,
            "Orders retrieved successfully",
        ))
        .into_response(),
        Err(e) => {
            error!("Error retrieving orders: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<()>::error("Could not retrieve orders")),
            )
                .into_response()
        }
    }
}

#[axum::debug_handler]
async fn get_order(State(state): State<AppState>, Path(order_id): Path<Uuid>) -> impl IntoResponse {
    match state.order_service.get_order_by_id(order_id).await {
        Ok(Some(order)) => {
            Json(ApiResponse::success(order, "Order retrieved successfully")).into_response()
        }
        Ok(None) => (
            StatusCode::NOT_FOUND,
            Json(ApiResponse::<()>::error("Order not found")),
        )
            .into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()>::error(&e.to_string())),
        )
            .into_response(),
    }
}

#[axum::debug_handler]
async fn create_order(
    State(state): State<AppState>,
    Extension(auth): Extension<AuthUser>, // require auth if needed
    Json(payload): Json<CreateOrderRequest>,
) -> impl IntoResponse {
    let req = NewOrder {
        user_id: Uuid::parse_str(&auth.id).expect("Invalid UUID in auth.id"),
        customer_name: payload.customer_name,
        customer_email: payload.customer_email,
        customer_phone: payload.customer_phone,
        delivery_address: payload.delivery_address,
        status: "pending".to_string(),
        total: payload.total,
        items: payload.items,
    };

    info!("Creating order: {:?}", req);
    match state.order_service.create_order(req).await {
        Ok(order) => (
            StatusCode::CREATED,
            Json(ApiResponse::success(order, "Order created successfully")),
        )
            .into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()>::error(&e.to_string())),
        )
            .into_response(),
    }
}

#[axum::debug_handler]
async fn update_order_status(
    State(state): State<AppState>,
    Path(order_id): Path<Uuid>,
    Json(payload): Json<UpdateOrderStatusRequest>,
) -> impl IntoResponse {
    
    match state
        .order_service
        .update_order_status(order_id, payload.status.into())
        .await
    {
        Ok(order) => Json(ApiResponse::success(order, "Order status updated")).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()>::error(&e.to_string())),
        )
            .into_response(),
    }
}

#[axum::debug_handler]
async fn get_order_items(
    State(state): State<AppState>,
    Path(order_id): Path<Uuid>,
) -> impl IntoResponse {
    match state.order_service.get_order_items(order_id).await {
        Ok(items) => Json(ApiResponse::success(items, "Order items retrieved")).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            error!("Error retrieving order items: {}", e),
            Json(ApiResponse::<()>::error("Could not retrieve order items")),
        )
            .into_response(),
    }
}

#[axum::debug_handler]
async fn delete_order(
    State(state): State<AppState>,
    Path(order_id): Path<Uuid>,
) -> impl IntoResponse {
    match state.order_service.delete_order(order_id).await {
        Ok(_) => (
            StatusCode::NO_CONTENT,
            Json(ApiResponse::success((), "Order deleted successfully")),
        )
            .into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()>::error(&e.to_string())),
        )
            .into_response(),
    }
}
