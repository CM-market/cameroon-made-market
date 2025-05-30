#[derive(Debug, thiserror::Error)]
pub enum ErrorResponse {
    #[error("conversion failed: {0}")]
    ConversionFailed(String),
}

impl axum::response::IntoResponse for ErrorResponse {
fn into_response(self) -> axum::response::Response {
    match self {
        ErrorResponse::ConversionFailed(msg) => {
            let body = axum::Json(serde_json::json!({
                "error": msg,
            }));
            (axum::http::StatusCode::BAD_REQUEST, body).into_response()
        }
    }
}
    
}