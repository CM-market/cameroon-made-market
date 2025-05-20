use crate::models::user::UserRole;
use crate::middleware::auth::AuthUser;
use axum::http::StatusCode;

pub fn require_role(user: &AuthUser, allowed_roles: &[UserRole]) -> Result<(), (StatusCode, &'static str)> {
    if allowed_roles.contains(&user.role) {
        Ok(())
    } else {
        Err((StatusCode::FORBIDDEN, "You do not have permission to access this resource."))
    } 
} 