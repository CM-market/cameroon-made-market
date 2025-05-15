use axum::{extract::State, Extension, Json};
use tracing::info;
use uuid::Uuid;

use crate::{
    middleware::auth::AuthUser,
    models::user::{Model, UserRole},
    services::user::{CreateUser, LoginRequest, LoginResponse, UserService},
    state::AppState,
    utils::shared::ApiResponse,
    utils::rbac::require_role,
};

/// Register a new user
#[axum::debug_handler]
pub async fn register(
    State(state): State<AppState>,
    Json(user_data): Json<CreateUser>,
    Extension(auth_user): Option<AuthUser>,
) -> Json<ApiResponse<Model>> {
    // Restrict who can create Admin or Vendor users
    match user_data.role {
        UserRole::Admin | UserRole::Vendor => {
            // Only allow if the requester is an Admin
            if let Some(ref user) = auth_user {
                if user.role != UserRole::Admin {
                    return Json(ApiResponse::error("Only admins can create Admin or Vendor users."));
                }
            } else {
                return Json(ApiResponse::error("Authentication required to create Admin or Vendor users."));
            }
        }
        UserRole::Buyer => {
            // Anyone can create a Buyer
        }
    }
    print!("Registering user: {:?}", user_data);
    let user_service = UserService::new(
        state.db,
        state.config.jwt_secret.clone(),
        state.config.jwt_expires_in,
    );
    match user_service.create_user(user_data).await {
        Ok(user) => {
            info!("User Successfully created");
            Json(ApiResponse::success(user, "User created successfully"))
        }
        Err(e) => Json(ApiResponse::error(&e.to_string())),
    }
}

/// Login a user
#[axum::debug_handler]
pub async fn login(
    State(state): State<AppState>,
    Json(login_data): Json<LoginRequest>,
) -> Json<ApiResponse<LoginResponse>> {
    let user_service = UserService::new(
        state.db,
        state.config.jwt_secret.clone(),
        state.config.jwt_expires_in,
    );
    let config = state.config.as_ref();
    match user_service
        .login(login_data.phone, login_data.password, config)
        .await
    {
        Ok((user, token)) => {
            let response = ApiResponse::success(
                LoginResponse {
                    role: user.role,
                    user_id: user.id,
                    token,
                },
                "Login successful",
            );

            Json(response)
        }
        Err(e) => Json(ApiResponse::error(&e.to_string())),
    }
}

/// Get current user information
#[axum::debug_handler]
pub async fn get_me(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> Json<ApiResponse<Option<Model>>> {
    // RBAC: Only allow Buyer, Vendor, or Admin (all roles)
    if let Err((status, msg)) = require_role(&auth_user, &[UserRole::Buyer, UserRole::Vendor, UserRole::Admin]) {
        return Json(ApiResponse::error(msg));
    }
    let user_service = UserService::new(
        state.db,
        state.config.jwt_secret.clone(),
        state.config.jwt_expires_in,
    );

    // Handle UUID parsing
    let uuid = match Uuid::parse_str(&auth_user.id) {
        Ok(uuid) => uuid,
        Err(_) => {
            return Json(ApiResponse::error("Invalid user ID format"));
        }
    };

    // Handle database query
    match user_service.get_user_by_id(uuid).await {
        Ok(Some(user)) => Json(ApiResponse::success(
            Some(user),
            "User retrieved successfully",
        )),
        Ok(None) => Json(ApiResponse::error("User not found")),
        Err(e) => Json(ApiResponse::error(&format!(
            "Failed to retrieve user: {}",
            e
        ))),
    }
}

/// Get all users
#[axum::debug_handler]
pub async fn get_all_users(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> Json<ApiResponse<Vec<Model>>> {
    // Only admins can access
    if let Err((_status, msg)) = require_role(&auth_user, &[UserRole::Admin]) {
        return Json(ApiResponse::error(msg));
    }
    let user_service = UserService::new(
        state.db,
        state.config.jwt_secret.clone(),
        state.config.jwt_expires_in,
    );
    match user_service.list_users().await {
        Ok(users) => Json(ApiResponse::success(users, "All users retrieved successfully")),
        Err(e) => Json(ApiResponse::error(&e.to_string())),
    }
}
