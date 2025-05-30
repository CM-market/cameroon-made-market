use axum::response::{IntoResponse, Response};

// Custom error for authentication failures
#[derive(Debug)]
pub enum AuthError {
    MissingToken,
    InvalidToken,
    TokenValidationError(jsonwebtoken::errors::Error),
}

impl IntoResponse for AuthError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            AuthError::MissingToken => (
                axum::http::StatusCode::UNAUTHORIZED,
                "Missing authorization token",
            ),
            AuthError::InvalidToken => (
                axum::http::StatusCode::UNAUTHORIZED,
                "Invalid authorization token",
            ),
            AuthError::TokenValidationError(_) => (
                axum::http::StatusCode::UNAUTHORIZED,
                "Token validation failed",
            ),
        };
        (status, message).into_response()
    }
}
