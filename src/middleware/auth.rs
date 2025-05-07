use axum::{
    extract::State,
    http::{Request, StatusCode},
    middleware::Next,
    response::Response,
    Json,
};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use crate::{
    config::Config,
    models::user::UserRole,
    AppState,
    ApiResponse,
};

/// JWT claims structure
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
    pub role: UserRole,
}

/// Authenticated user structure
#[derive(Debug, Clone)]
pub struct AuthUser {
    pub id: String,
    pub role: UserRole,
}

/// Middleware to validate JWT token
pub async fn auth<B>(
    State(state): State<AppState>,
    mut req: Request<B>,
    next: Next<B>,
) -> Result<Response, StatusCode> {
    let token = req
        .headers()
        .get("Authorization")
        .and_then(|auth_header| auth_header.to_str().ok())
        .and_then(|str| str.strip_prefix("Bearer "))
        .ok_or(StatusCode::UNAUTHORIZED)?;

    match decode::<Claims>(
        token,
        &DecodingKey::from_secret(state.config.jwt_secret.as_bytes()),
        &Validation::default(),
    ) {
        Ok(claims) => {
            req.extensions_mut().insert(AuthUser {
                id: claims.claims.sub,
                role: claims.claims.role,
            });
            Ok(next.run(req).await)
        }
        Err(_) => {
            Ok(Json(ApiResponse::<()>::error("Invalid token")).into_response())
        }
    }
}

/// Generate JWT token for a user
pub fn generate_token(user_id: &str, role: UserRole, config: &Config) -> Result<String, StatusCode> {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as usize;

    let claims = Claims {
        sub: user_id.to_string(),
        exp: now + (24 * 60 * 60), // 24 hours
        role,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(config.jwt_secret.as_bytes()),
    )
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
} 