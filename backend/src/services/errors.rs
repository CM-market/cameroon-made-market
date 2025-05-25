use thiserror::Error;

#[derive(Debug, Error)]
pub enum ServiceError {
    #[error("Not Found: {0}")]
    NotFound(String),
    #[error("Validation Error: {0}")]
    Validation(String),
    #[error("Database Error: {0}")]
    DatabaseError(String),
    #[error("Internal Server Error: {0}")]
    Unauthorized(String),
    #[error("Internal Server Error: {0}")]
    Forbidden(String),
    #[error("Internal Server Error")]
    InternalServerError,
    #[error("Error: {0}")]
    GenericError(String),
    #[error("User not found: {0}")]
    UserNotFound(String),
    #[error("Invalid password")]
    InvalidPassword,
}

impl From<sea_orm::DbErr> for ServiceError {
    fn from(err: sea_orm::DbErr) -> Self {
        match err {
            sea_orm::DbErr::RecordNotFound(e) => ServiceError::NotFound(e.to_string()),
            sea_orm::DbErr::Query(e) => ServiceError::DatabaseError(e.to_string()),
            sea_orm::DbErr::Conn(e) => ServiceError::DatabaseError(e.to_string()),
            sea_orm::DbErr::Migration(e) => ServiceError::DatabaseError(e.to_string()),
            sea_orm::DbErr::Exec(e) => ServiceError::DatabaseError(e.to_string()),
            sea_orm::DbErr::Type(e) => ServiceError::DatabaseError(e.to_string()),
            sea_orm::DbErr::Json(e) => ServiceError::DatabaseError(e.to_string()),

            _ => ServiceError::InternalServerError,
        }
    }
}
