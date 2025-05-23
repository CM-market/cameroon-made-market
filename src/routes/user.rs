use axum::{
    middleware,
    routing::{get, post},
    Router,
};

use crate::{
    handlers::user::{get_all_users, get_me, login, register},
    middleware::auth::auth,
    state::AppState,
};

pub fn config() -> Router<AppState> {
    Router::new()
        .route("/api/users", post(register))
        .route("/api/users/login", post(login))
        .route(
            "/api/users/me",
            get(get_me).layer(middleware::from_fn(auth)),
        )
        .route(
            "/api/users/all",
            get(get_all_users).layer(middleware::from_fn(auth)),
        )
}
