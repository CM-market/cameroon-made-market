use axum::{
    routing::{get, post},
    Router,
};

use crate::handlers::user::{register, login, get_me};

pub fn config() -> Router {
    Router::new()
        .route("/api/users", post(register))
        .route("/api/users/login", post(login))
        .route("/api/users/me", get(get_me))
} 