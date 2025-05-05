use axum::{
    routing::{get, post},
    Router,
};
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use dotenv::dotenv;
use std::env;

mod config;
mod db;
mod handlers;
mod middleware;
mod models;
mod routes;
mod services;
mod state;
mod utils;

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Load environment variables
    dotenv::dotenv().ok();

    // Get configuration
    let config = config::Config::from_env();
    let db_pool = db::create_pool(&config.database_url).await;
    let app_state = state::AppState::new(db_pool, config);

    // Configure CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build our application with a route
    let app = Router::new()
        .merge(routes::config())
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state(app_state);

    // Run it
    let addr = format!("{}:{}", app_state.config.server_host, app_state.config.server_port);
    tracing::info!("listening on {}", addr);
    axum::Server::bind(&addr.parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
