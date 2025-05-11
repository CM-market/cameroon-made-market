use axum::{
    routing::{get, post},
    Router,
};

use crate::{handlers::user::{get_me, login, register}, state::AppState};

pub fn config() -> Router<AppState> {
    Router::new()
        .route("/api/users", post(register))
        .route("/api/users/login", post(login))
        .route("/api/users/me", get(get_me))
} 