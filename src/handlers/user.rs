use axum::{
    extract::State,
    Json,
};
use uuid::Uuid;

use crate::{
    models::user::{CreateUser, LoginUser, UserResponse},
    services::user::UserService,
    state::AppState,
    ApiResponse,
    middleware::auth::AuthUser,
};

/// Register a new user
pub async fn register(
    State(state): State<AppState>,
    Json(user_data): Json<CreateUser>,
) -> Json<ApiResponse<UserResponse>> {
    let user_service = UserService::new(state.db, state.config.jwt_secret.clone(), state.config.jwt_expires_in);
    match user_service.create_user(user_data).await {
        Ok(user) => Json(ApiResponse::success(user)),
        Err(e) => Json(ApiResponse::error(e.to_string())),
    }
}

/// Login a user
pub async fn login(
    State(state): State<AppState>,
    Json(login_data): Json<LoginUser>,
) -> Json<ApiResponse<UserResponse>> {
    let user_service = UserService::new(state.db, state.config.jwt_secret.clone(), state.config.jwt_expires_in);
    match user_service.login(login_data.email, login_data.password).await {
        Ok((user, token)) => {
            let mut response = ApiResponse::success(user);
            response.token = Some(token);
            Json(response)
        }
        Err(e) => Json(ApiResponse::error(e.to_string())),
    }
}

/// Get current user information
pub async fn get_me(
    State(state): State<AppState>,
    auth_user: AuthUser,
) -> Json<ApiResponse<UserResponse>> {
    let user_service = UserService::new(state.db, state.config.jwt_secret.clone(), state.config.jwt_expires_in);
    match user_service.get_user_by_id(auth_user.id).await {
        Ok(user) => Json(ApiResponse::success(user)),
        Err(e) => Json(ApiResponse::error(e.to_string())),
    }
} 