use crate::{
    middleware::auth::AuthUser,
    services::{
        image::handle_image_upload,
        product::{CreateProduct, UpdateProduct},
    },
    state::AppState,
    utils::shared::ApiResponse,
    models::user::UserRole,
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
        .nest(
            "/api/products",
            Router::new()
                .route("/", post(create_product))
                .route("/upload-image", post(handle_image_upload))
                .route("/:id", get(get_product_by))
                .route("/:id", put(update_product))
                .route("/:id", delete(delete_product)),
        )
        .nest(
            "/vendor",
            Router::new().route("/products", get(list_products_by)),
        )
        .nest(
            "/api/admin",
            Router::new()
                .route("/products/:id/approve", post(approve_product))
                .route("/products/pending", get(list_pending_products)),
        )
}
pub async fn list_products_by(
    State(state): State<AppState>,
    extension_auth_user: Option<Extension<AuthUser>>,
) -> impl IntoResponse {
    let seller_id = match extension_auth_user {
        Some(Extension(auth_user)) => Some(Uuid::parse_str(&auth_user.id).unwrap()),
        None => None,
    };

    tracing::info!("Fetching products for seller_id: {:?}", seller_id);

    match state.product_service.list_products_by(seller_id).await {
        Ok(products) => {
            tracing::info!("Successfully retrieved {} products", products.len());
            Json(ApiResponse::success(
                products,
                "Products retrieved successfully",
            ))
            .into_response()
        }
        Err(e) => {
            tracing::error!("Error fetching products: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<()>::error(&format!(
                    "Failed to fetch products: {}",
                    e
                ))),
            )
                .into_response()
        }
    }
}

pub async fn list_products(State(state): State<AppState>) -> impl IntoResponse {
    match state.product_service.list_products().await {
        Ok(products) => Json(ApiResponse::success(
            products,
            "Products retrieved successfully",
        ))
        .into_response(),
        Err(e) => {
            tracing::error!("could not retrieve products: {}", e.to_string());
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<()>::error("could not retrieve products")),
            )
                .into_response()
        }
    }
}

async fn get_product_by(
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
        quantity: product_data.quantity,
        return_policy: Some(product_data.return_policy),
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

async fn update_product(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(product_id): Path<Uuid>,
    Json(product_data): Json<UpdateProductRequest>,
) -> impl IntoResponse {
    // First check if the product exists and belongs to the vendor
    match state.product_service.get_product_by_id(product_id).await {
        Ok(Some(product)) => {
            if product.product.seller_id != Uuid::parse_str(&auth_user.id).unwrap() {
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
                quantity: product_data.quantity,
                return_policy: product_data.return_policy,
            };

            match state
                .product_service
                .update_product(product.product.id, update_product)
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

async fn delete_product(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(product_id): Path<Uuid>,
) -> impl IntoResponse {
    // First check if the product exists and belongs to the vendor
    match state.product_service.get_product_by_id(product_id).await {
        Ok(Some(product)) => {
            if product.product.seller_id != Uuid::parse_str(&auth_user.id).unwrap() {
                return (
                    StatusCode::FORBIDDEN,
                    Json(ApiResponse::<()>::error(
                        "You don't have permission to delete this product",
                    )),
                )
                    .into_response();
            }

            match state
                .product_service
                .delete_product(product.product.id)
                .await
            {
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

async fn approve_product(
    State(state): State<AppState>,
    Path(product_id): Path<Uuid>,
    Extension(auth_user): Extension<AuthUser>,
) -> impl IntoResponse {
    // Check if user is admin
    if auth_user.role != UserRole::Admin {
        return (
            StatusCode::FORBIDDEN,
            Json(ApiResponse::<()>::error("Only admins can approve products")),
        )
            .into_response();
    }
    match state.product_service.approve_product(product_id).await {
        Ok(product) => (
            StatusCode::OK,
            Json(ApiResponse::success(product, "Product approved successfully")),
        )
            .into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()>::error(&e.to_string())),
        )
            .into_response(),
    }
}

async fn list_pending_products(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> impl IntoResponse {
    // Check if user is admin
    if auth_user.role != UserRole::Admin {
        return (
            StatusCode::FORBIDDEN,
            Json(ApiResponse::<()>::error("Only admins can view pending products")),
        )
            .into_response();
    }
    match state.product_service.list_pending_products().await {
        Ok(products) => (
            StatusCode::OK,
            Json(ApiResponse::success(products, "Pending products retrieved successfully")),
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
    return_policy: String,
}

#[derive(serde::Deserialize)]
pub struct UpdateProductRequest {
    title: Option<String>,
    description: Option<String>,
    quantity: Option<i32>,
    price: Option<f64>,
    category: Option<String>,
    image_urls: Option<Vec<String>>,
    return_policy: Option<String>,
}
