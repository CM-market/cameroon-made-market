use crate::{config::Config, models::user::UserRole, state::AppState};
use axum::{
    extract::Request,
    http::StatusCode,
    middleware::Next,
    response::Response,
};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

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
pub async fn auth(mut req: Request, next: Next) -> Result<Response, StatusCode> {
    // Get state from request extensions
    let state = req
        .extensions()
        .get::<AppState>()
        .cloned()
        .ok_or(StatusCode::INTERNAL_SERVER_ERROR)?;
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
        Err(e) => {
            println!("{}", token);
            tracing::error!("error decoding token: {}", e.to_string());
            Err(StatusCode::UNAUTHORIZED)
        }
    }
}

/// Generate JWT token for a user
pub fn generate_token(
    user_id: &str,
    role: UserRole,
    config: &Config,
) -> Result<String, StatusCode> {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as usize;

    let claims = Claims {
        sub: user_id.to_string(),
        exp: now + config.jwt_expires_in as usize,
        role,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(config.jwt_secret.as_bytes()),
    )
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}
