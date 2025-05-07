pub mod user;
 
pub fn config() -> axum::Router {
    user::config()
} 