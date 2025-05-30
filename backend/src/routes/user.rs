use axum::{
    routing::get,
    Router,
};

use crate::{
    handlers::user::{get_all_users, get_me},
    state::AppState,
};

pub fn config() -> Router<AppState> {
    Router::new()
        .route("/api/users/me", get(get_me))
        .route("/api/users/all", get(get_all_users))
}
