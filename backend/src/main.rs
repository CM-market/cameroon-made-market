use axum::routing::{get, post};
use axum::{http, middleware, Extension, Router};
use cameroon_made_market::handlers::user::{login, register};
use cameroon_made_market::middleware::auth::{auth, generate_token};
use cameroon_made_market::models::user::UserRole;
use cameroon_made_market::routes;
use cameroon_made_market::routes::admin::admin_routes;

use cameroon_made_market::routes::product::list_products;
use cameroon_made_market::state::setup;
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

#[tokio::main]
async fn main() {
    // Initialize tracing
    config_tracing();
    // Load environment variables
    dotenv::dotenv().ok();

    // Get configuration
    let app_state = setup().await;
    let token = generate_token(
        "ed9bac6c-1714-4002-939d-0e328af7a2b8",
        UserRole::Buyer,
        &app_state.config,
    )
    .unwrap();
    println!("{}", token);
    // Configure CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build our application with a route
    let app = Router::new()
        .merge(routes::user::config())
        .merge(routes::product::config())
        .merge(routes::cart::config())
        .merge(routes::order::config())
        .merge(routes::payment::config())
        .merge(admin_routes())
        .layer(middleware::from_fn({
            move |req: http::Request<axum::body::Body>, next| auth(req, next)
        }))
   
        .route("/api/users", post(register))
        .route("/api/users/login", post(login))
        .route("/products", get(list_products))
        .route("/", get(welcome))
        // .merge(routes::category::config())
        // .merge(routes::address::config())
        // .merge(routes::notification::config())
        // .merge(routes::review::config())
        // .merge(routes::wishlist::config())
        // .merge(routes::shipping::config())
        // .merge(routes::search::config())
        // .merge(routes::admin::config())
        .layer(Extension(app_state.clone()))
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state(app_state.clone());

    // Run it
    let addr = format!(
        "{}:{}",
        app_state.config.server_host, app_state.config.server_port
    );
    tracing::info!("listening on {}", addr);
    axum::serve(TcpListener::bind(addr).await.unwrap(), app)
        .await
        .unwrap();
}

async fn welcome() -> &'static str {
    "Welcome to Cameroon Made Market API!"
}

fn config_tracing() {
    if std::env::var("RUST_LIB_BACKTRACE").is_err() {
        std::env::set_var("RUST_LIB_BACKTRACE", "1")
    }

    use tracing::Level;
    use tracing_subscriber::{filter, layer::SubscriberExt, util::SubscriberInitExt};

    let tracing_layer = tracing_subscriber::fmt::layer();
    let filter = filter::Targets::new()
        .with_target("hyper::proto", Level::INFO)
        .with_target("tower_http::trace", Level::DEBUG)
        .with_default(Level::DEBUG);

    tracing_subscriber::registry()
        .with(tracing_layer)
        .with(filter)
        .init();
}
