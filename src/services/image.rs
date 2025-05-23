use anyhow::Result;
use axum::{
    extract::{Multipart, State},
    http::StatusCode,
    response::{IntoResponse, Response},
};

use minio::s3::{
    builders::ObjectContent, client::Client, types::S3Api,
};

use uuid::Uuid;

use crate::state::AppState;

#[derive(Debug, Clone, Default)]
pub struct ImageService {
    pub client: Client,
    pub bucket: String,
}

impl ImageService {
    pub async fn upload_image(&self, file: Vec<u8>) -> Result<String> {
        let object_name = format!("{}.jpg", Uuid::new_v4());
        let content = ObjectContent::from(file);
        self.client
            .put_object_content(&self.bucket, &object_name, content)
            .send()
            .await?;

        Ok(object_name)
    }

    pub async fn get_image_url(&self, object_name: &str) -> Result<std::path::PathBuf> {
        let get_object = self
            .client
            .get_object(&self.bucket, object_name)
            .send()
            .await?;
        let file_path = std::path::PathBuf::from(format!("./{}.png", object_name));
        let _ = get_object.content.to_file(&file_path).await?;

        Ok(file_path)
    }
}

#[axum::debug_handler]
pub async fn handle_image_upload(
    State(state): State<AppState>,
    mut multipart: Multipart,
) -> Result<Response, (StatusCode, String)> {
      println!("in fuction above");
    let image_service = state.config.image_service.clone();
    println!("in fu");

    while let Some(field) = multipart.next_field().await.map_err(|e| {
        (
            StatusCode::BAD_REQUEST,
            format!("Failed to process multipart form: {}", e),
        )
    })? {
        let name = field.name().unwrap_or_default();

        if name == "file" {
            let data = field.bytes().await.map_err(|e| {
                (
                    StatusCode::BAD_REQUEST,
                    format!("Failed to read file data: {}", e),
                )
            })?;

            let object_name = image_service
                .upload_image((&data).to_vec())
                .await
                .map_err(|e| {
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        format!("Failed to upload image: {}", e),
                    )
                })?;

            let image_url = image_service
                .get_image_url(&object_name)
                .await
                .map_err(|e| {
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        format!("Failed to get image URL: {}", e),
                    )
                })?;

            return Ok((StatusCode::OK, image_url.display().to_string()).into_response());
        }
    }

    Err((
        StatusCode::BAD_REQUEST,
        "No file found in the request".to_string(),
    ))
}
