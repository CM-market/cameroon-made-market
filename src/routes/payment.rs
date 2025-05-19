use crate::{
    middleware::auth::AuthUser, models::user::UserRole, state::AppState, utils::shared::ApiResponse,
};
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Extension, Json, Router,
};
use fapshi_rs::api::{payment::PaymentApi, transaction::TransactionApi};
use fapshi_rs::models::DirectPaymentRequest;
use serde::{Deserialize, Serialize};
use tracing::{error, info};
use uuid::Uuid;

pub fn config() -> Router<AppState> {
    Router::new()
        .route("/payments", get(list_payments))
        .route("/payments", post(create_payment))
        .route("/indirect_payment", post(create_indirect_payment))
        .route("/payments/:id", get(get_transation_status))
}

#[axum::debug_handler]
async fn list_payments(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> impl IntoResponse {
    let user_id = match Uuid::parse_str(&auth_user.id) {
        Ok(id) => id,
        Err(e) => {
            return (
                StatusCode::BAD_REQUEST,
                Json(ApiResponse::<()>::error(&format!("Invalid user ID: {}", e))),
            )
                .into_response();
        }
    };

    match TransactionApi::get_transactions_by_user_id(&state.payment_service, &user_id.to_string()).await
    {
        Ok(payments) => Json(ApiResponse::success(
            payments,
            "Payments retrieved successfully",
        ))
        .into_response(),
        Err(e) => {
            tracing::error!("error: {}", e.to_string());
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<()>::error("could not get transactions")),
            )
                .into_response()
        }
    }
}

#[axum::debug_handler]
async fn get_transation_status(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(transaction_id): Path<String>,
) -> impl IntoResponse {
    if auth_user.role == UserRole::Admin {
        let _user_id = match Uuid::parse_str(&auth_user.id) {
            Ok(id) => id,
            Err(e) => {
                return (
                    StatusCode::BAD_REQUEST,
                    Json(ApiResponse::<()>::error(&format!("Invalid user ID: {}", e))),
                )
                    .into_response();
            }
        };

        match TransactionApi::get_status(&state.payment_service, &transaction_id).await {
            Ok(status) => Json(ApiResponse::success(
                status,
                "Payment status retrieved successfully",
            ))
            .into_response(),

            Err(e) => {
                error!("error {}", e.to_string());
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiResponse::<()>::error("could not get transaction status")),
                )
                    .into_response()
            }
        }
    } else {
        (
            StatusCode::UNAUTHORIZED,
            Json(ApiResponse::<()>::error("Unauthorized")),
        )
            .into_response()
    }
}

#[axum::debug_handler]
async fn create_payment(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payment_data): Json<CreateDirectPaymentRequest>,
) -> impl IntoResponse {
    let user_id = match Uuid::parse_str(&auth_user.id) {
        Ok(id) => id,
        Err(e) => {
            return (
                StatusCode::BAD_REQUEST,
                Json(ApiResponse::<()>::error(&format!("Invalid user ID: {}", e))),
            )
                .into_response();
        }
    };

    // Validate order_id exists and belongs to the user
    match state
        .order_service
        .get_order_by_id(payment_data.order_id)
        .await
    {
        Ok(Some(order)) => {
            let payment_request = DirectPaymentRequest {
                amount: order.total as f32,
                medium: None,
                name: Some(payment_data.name.clone()),
                email: None,
                phone: payment_data.phone.clone(),
                user_id: Some(user_id.to_string()),
                external_id: Some(order.id.to_string()),
                message: Some(format!("Payment for order {}", order.id)),
            };

            info!("Initiating payment for order: {:?}", payment_request);

            match PaymentApi::initiate_direct_payment(&state.payment_service, &payment_request).await {
                Ok(fapshi_response) => {
                    let payment = Payment {
                        id: Uuid::new_v4(),
                        user_id,
                        order_id: order.id,
                        amount: order.total,
                        status: "pending".to_string(),
                        transaction_id: fapshi_response.transaction_id,
                        created_at: chrono::Utc::now(),
                    };
                    (
                        StatusCode::CREATED,
                        Json(ApiResponse::success(
                            payment,
                            "Payment initiated successfully",
                        )),
                    )
                        .into_response()
                }
                Err(e) => (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    error!(
                        "Error initiating payment: {}",
                        e.to_string()
                    ),
                    Json(ApiResponse::<()>::error("Payment initiation failed")),
                )
                    .into_response(),
            }
        }
        Ok(None) => (
            StatusCode::NOT_FOUND,
            Json(ApiResponse::<()>::error("Order not found")),
        )
            .into_response(),
        Err(e) => (
            StatusCode::BAD_GATEWAY,
            Json(ApiResponse::<()>::error(&format!(
                "Payment gateway error: {}",
                e
            ))),
        )
            .into_response(),
    }
}

async fn create_indirect_payment(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payment_data): Json<CreateInDirectPaymentRequest>,
) -> impl IntoResponse {
    let user_id = match Uuid::parse_str(&auth_user.id) {
        Ok(id) => id,
        Err(e) => {
            return (
                StatusCode::BAD_REQUEST,
                Json(ApiResponse::<()>::error(&format!("Invalid user ID: {}", e))),
            )
                .into_response();
        }
    };

    // Validate order_id exists and belongs to the user
    match state
        .order_service
        .get_order_by_id(payment_data.order_id)
        .await
    {
        Ok(Some(order)) => {
            let message = format!("payment for order {}", order.id);
            let payment_request = fapshi_rs::models::PaymentRequest {
                amount: order.total,
                email: None,
                user_id: Some(user_id.to_string()),
                external_id: Some(order.id.to_string()),
                message,
                redirect_url: Some(payment_data.redirect_url.clone()),
                card_only: None,
            };

            info!("Initiating payment for order: {:?}", payment_request);

            match PaymentApi::create_payment(&state.payment_service, &payment_request).await {
                Ok(fapshi_response) => {
                    let payment = IndirectPayment {
                        id: Uuid::new_v4(),
                        user_id,
                        order_id: order.id,
                        amount: order.total,
                        status: "pending".to_string(),
                        transaction_id: fapshi_response.transaction_id,
                        created_at: chrono::Utc::now(),
                        payment_link: fapshi_response.payment_link
                    };
                    (
                        StatusCode::CREATED,
                        Json(ApiResponse::success(
                            payment,
                            "Payment initiated successfully",
                        )),
                    )
                        .into_response()
                }
                Err(e) => (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    error!(
                        "Error initiating payment: {}",
                        e.to_string()
                    ),
                    Json(ApiResponse::<()>::error("Payment initiation failed")),
                )
                    .into_response(),
            }
        }
        Ok(None) => (
            StatusCode::NOT_FOUND,
            Json(ApiResponse::<()>::error("Order not found")),
        )
            .into_response(),
        Err(e) => (
            StatusCode::BAD_GATEWAY,
            Json(ApiResponse::<()>::error(&format!(
                "Payment gateway error: {}",
                e
            ))),
        )
            .into_response(),
    }
}

#[derive(Serialize, Deserialize)]
pub struct CreateDirectPaymentRequest {
    order_id: Uuid,
    name: String,
    phone: String,
}

#[derive(Serialize, Deserialize)]
pub struct CreateInDirectPaymentRequest {
    order_id: Uuid,
    name: String,
    redirect_url: String,
    phone: String,
}
pub struct CreatePaymentResponse {
    pub payment_link: String,
    pub transaction_id: String,
    pub date_initiated: String,
}

#[derive(Serialize, Deserialize)]
pub struct Payment {
    pub id: Uuid,
    pub user_id: Uuid,
    pub order_id: Uuid,
    pub amount: f64,
    pub status: String,
    pub transaction_id: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Serialize, Deserialize)]
pub struct IndirectPayment {
    pub id: Uuid,
    pub user_id: Uuid,
    pub order_id: Uuid,
    pub amount: f64,
    pub status: String,
    pub transaction_id: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub payment_link: String
}
