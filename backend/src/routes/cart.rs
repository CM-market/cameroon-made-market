use crate::{
    middleware::auth::AuthUser, models::cart_item::CartItem, state::AppState,
    utils::shared::ApiResponse,
};
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{delete, get, post},
    Extension, Json, Router,
};
use serde::Deserialize;

use uuid::Uuid;

pub fn config() -> Router<AppState> {
    Router::new()
        .route("/api/cart", get(get_cart))
        .route("/api/cart", post(add_to_cart))
        .route("/api/cart/:product_id", delete(remove_from_cart))
}

#[axum::debug_handler]
async fn get_cart(
    State(state): State<AppState>,
    Extension(auth): Extension<AuthUser>,
) -> impl IntoResponse {
    match state.cart_service.get_cart(auth.id).await {
        Ok(cart_items) => Json(ApiResponse::success(cart_items, "Cart fetched")).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()>::error(&e.to_string())),
        )
            .into_response(),
    }
}

#[derive(Deserialize)]
pub struct AddToCartRequest {
    product_id: Uuid,
    quantity: i32,
}

#[axum::debug_handler]
async fn add_to_cart(
    State(state): State<AppState>,
    Extension(auth): Extension<AuthUser>,
    Json(payload): Json<AddToCartRequest>,
) -> impl IntoResponse {
    let cart = state.cart_service.get_cart(auth.id.clone()).await;
    match cart {
        Ok(cart) => {
            if let Some(cart) = cart {
                let cart_id = cart.id;
                let cart_item = CartItem {
                    cart_id: cart.id,
                    product_id: payload.product_id,
                    quantity: payload.quantity,
                };
                match state
                    .cart_service
                    .add_item_to_cart(cart_id, cart_item)
                    .await
                {
                    Ok(_) => Json(ApiResponse::success((), "Item added to cart")).into_response(),
                    Err(e) => {
                        tracing::error!("could not add item to cart: {}", e.to_string());
                        (
                            StatusCode::INTERNAL_SERVER_ERROR,
                            Json(ApiResponse::<()>::error("failed to add item to cart")),
                        )
                            .into_response()
                    }
                }
            } else {
                // Cart does not exist, create a new one
                let new_cart = state.cart_service.get_or_create_cart(auth.id.clone()).await;
                return match new_cart {
                    Ok(_) => Json(ApiResponse::success((), "New cart created")).into_response(),
                    Err(e) => {
                        tracing::error!("could not create new cart: {}", e.to_string());
                        (
                            StatusCode::INTERNAL_SERVER_ERROR,
                            Json(ApiResponse::<()>::error("Failed to create new cart")),
                        )
                            .into_response()
                    }
                };
            }
        }
        Err(e) => {
            tracing::error!("could not retrieve cart: {}", e.to_string());
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<()>::error("Failed to retrieve cart")),
            )
                .into_response()
        }
    }
}

#[derive(Deserialize)]
pub struct UpdateCartRequest {
    quantity: i32,
}

#[axum::debug_handler]
async fn remove_from_cart(
    State(state): State<AppState>,
    Extension(auth): Extension<AuthUser>,
    Path(product_id): Path<Uuid>,
) -> impl IntoResponse {
    let cart_id = match state.cart_service.get_cart(auth.id).await {
        Ok(cart) => match cart {
            Some(cart) => cart.id,
            None => {
                return (
                    StatusCode::NOT_FOUND,
                    Json(ApiResponse::<()>::error("Cart not found")),
                )
                    .into_response()
            }
        },
        Err(e) => {
            tracing::error!("could not retrieve cart: {}", e.to_string());
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<()>::error("Failed to retrieve cart")),
            )
                .into_response();
        }
    };
    match state
        .cart_service
        .remove_item_from_cart(cart_id, product_id)
        .await
    {
        Ok(_) => Json(ApiResponse::success((), "Item removed from cart")).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()>::error(&e.to_string())),
        )
            .into_response(),
    }
}
