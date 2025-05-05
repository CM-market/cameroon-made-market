use axum::{
    extract::State,
    Json,
};
use uuid::Uuid;

use crate::{
    models::user::{CreateUser, LoginUser},
    services::user::UserService,
    state::AppState,
    ApiResponse,
    middleware::auth::AuthUser,
};

pub async fn register(
    State(state): State<AppState>,
    Json(user_data): Json<CreateUser>,
) -> Json<ApiResponse<_>> {
    let user_service = UserService::new(
        state.db.clone(),
        state.config.jwt_secret.clone(),
        state.config.jwt_expires_in,
    );

    match user_service.create_user(user_data).await {
        Ok(user) => Json(ApiResponse::success(user, "User created successfully")),
        Err(e) => Json(ApiResponse::error(&e.to_string())),
    }
}

pub async fn login(
    State(state): State<AppState>,
    Json(login_data): Json<LoginUser>,
) -> Json<ApiResponse<_>> {
    let user_service = UserService::new(
        state.db.clone(),
        state.config.jwt_secret.clone(),
        state.config.jwt_expires_in,
    );

    match user_service.login(login_data).await {
        Ok((user, token)) => Json(ApiResponse::success(
            serde_json::json!({
                "user": user,
                "token": token
            }),
            "Login successful",
        )),
        Err(e) => Json(ApiResponse::error(&e.to_string())),
    }
}

pub async fn get_me(
    State(state): State<AppState>,
    auth_user: AuthUser,
) -> Json<ApiResponse<_>> {
    let user_service = UserService::new(
        state.db.clone(),
        state.config.jwt_secret.clone(),
        state.config.jwt_expires_in,
    );

    match user_service.get_user_by_id(auth_user.user_id).await {
        Ok(user) => Json(ApiResponse::success(user, "User retrieved successfully")),
        Err(e) => Json(ApiResponse::error(&e.to_string())),
    }
} 