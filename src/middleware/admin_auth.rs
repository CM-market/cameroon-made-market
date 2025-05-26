use axum::{
    extract::Request,
    http::StatusCode,
    middleware::Next,
    response::Response,
};
use crate::models::user::{Model as User, UserRole};

pub async fn admin_auth(
    req: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let user = req.extensions().get::<User>().cloned();

    match user {
        Some(user) if user.role == UserRole::Admin => {
            Ok(next.run(req).await)
        }
        _ => {
            Err(StatusCode::UNAUTHORIZED)
        }
    }
} 