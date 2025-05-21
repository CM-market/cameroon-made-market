use crate::{
    middleware::auth::AuthUser,
    services::product::{CreateProduct, UpdateProduct},
    state::AppState,
    utils::shared::ApiResponse,
};
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{delete, get, post, put},
    Extension, Json, Router,
};
use tracing::info;
use uuid::Uuid;

pub fn config() -> Router<AppState> {
    Router::new()
        .route("/products", get(list_products))
        .route("/products", post(create_product))
        .route("/products/:id", get(get_product))
        .route("/products/:id", put(update_product))
        .route("/products/:id", delete(delete_product))
}

#[axum::debug_handler]
async fn list_products( 
    State(state): State<AppState>,
) -> impl IntoResponse {
    match state
        .product_service
        .list_products()
        .await
    { 
        Ok(products) => Json(ApiResponse::success(
            products,
            "Products retrieved successfully",
        ))
        .into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()>::error(&e.to_string())),
        )
            .into_response(),
    }
}

#[axum::debug_handler]
async fn get_product(
    State(state): State<AppState>,
    Path(product_id): Path<Uuid>,
) -> impl IntoResponse {
    match state.product_service.get_product_by_id(product_id).await {
        Ok(Some(product)) => Json(ApiResponse::success(
            product,
            "Product retrieved successfully",
        ))
        .into_response(),
        Ok(None) => (
            StatusCode::NOT_FOUND,
            Json(ApiResponse::<()>::error("Product not found")),
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
async fn create_product(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(product_data): Json<CreateProductRequest>,
) -> impl IntoResponse {
    let seller_id = match Uuid::parse_str(&auth_user.id) {
        Ok(id) => id,
        Err(e) => {
            return (
                StatusCode::BAD_REQUEST,
                Json(ApiResponse::<()>::error(&format!(
                    "Invalid seller ID: {}",
                    e
                ))),
            )
                .into_response();
        }
    };
    let create_product = CreateProduct {
        seller_id,
        title: product_data.title,
        description: Some(product_data.description),
        price: product_data.price,
        category: Some(product_data.category),
        image_urls: product_data.image_urls,
    };
    info!("Creating product: {:?}", create_product);
    match state.product_service.create_product(create_product).await {
        Ok(product) => (
            StatusCode::CREATED,
            Json(ApiResponse::success(
                product,
                "Product created successfully",
            )),
        )
            .into_response(),
        Err(e) => {
            tracing::error!("could not store products: {}", e.to_string());
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<()>::error(&e.to_string())),
            )
                .into_response()
        }
    }
}

#[axum::debug_handler]
async fn update_product(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(product_id): Path<Uuid>,
    Json(product_data): Json<UpdateProductRequest>,
) -> impl IntoResponse {
    // First check if the product exists and belongs to the vendor
    match state.product_service.get_product_by_id(product_id).await {
        Ok(Some(product)) => {
            if product.seller_id != Uuid::parse_str(&auth_user.id).unwrap() {
                return (
                    StatusCode::FORBIDDEN,
                    Json(ApiResponse::<()>::error(
                        "You don't have permission to update this product",
                    )),
                )
                    .into_response();
            }

            let update_product = UpdateProduct {
                title: product_data.title,
                description: product_data.description,
                price: product_data.price,
                category: product_data.category,
                image_urls: product_data.image_urls,
            };

            match state
                .product_service
                .update_product(product.id, update_product)
                .await
            {
                Ok(updated_product) => Json(ApiResponse::success(
                    updated_product,
                    "Product updated successfully",
                ))
                .into_response(),
                Err(e) => (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse::<()>::error(&e.to_string())),
                )
                    .into_response(),
            }
        }
        Ok(None) => (
            StatusCode::NOT_FOUND,
            Json(ApiResponse::<()>::error("Product not found")),
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
async fn delete_product(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(product_id): Path<Uuid>,
) -> impl IntoResponse {
    // First check if the product exists and belongs to the vendor
    match state.product_service.get_product_by_id(product_id).await {
        Ok(Some(product)) => {
            if product.seller_id != Uuid::parse_str(&auth_user.id).unwrap() {
                return (
                    StatusCode::FORBIDDEN,
                    Json(ApiResponse::<()>::error(
                        "You don't have permission to delete this product",
                    )),
                )
                    .into_response();
            }

            match state.product_service.delete_product(product.id).await {
                Ok(_) => (
                    StatusCode::NO_CONTENT,
                    Json(ApiResponse::<()>::success(
                        (),
                        "Product deleted successfully",
                    )),
                )
                    .into_response(),
                Err(e) => (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse::<()>::error(&e.to_string())),
                )
                    .into_response(),
            }
        }
        Ok(None) => (
            StatusCode::NOT_FOUND,
            Json(ApiResponse::<()>::error("Product not found")),
        )
            .into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()>::error(&e.to_string())),
        )
            .into_response(),
    }
}

#[derive(serde::Deserialize)]
pub struct ListProductsQuery {
    category: Option<String>,
    seller_id: Option<Uuid>,
}

#[derive(serde::Deserialize, Debug)]
pub struct CreateProductRequest {
    title: String,
    description: String,
    price: f64,
    category: String,
    image_urls: Vec<String>,
    quantity: i32,
}

#[derive(serde::Deserialize)]
pub struct UpdateProductRequest {
    title: Option<String>,
    description: Option<String>,
    quantity: Option<i32>,
    price: Option<f64>,
    category: Option<String>,
    image_urls: Option<Vec<String>>,
}
