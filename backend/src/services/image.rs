use anyhow::Result;
use axum::{
    extract::{Multipart, State},
    http::StatusCode,
    response::{IntoResponse, Response},
};

use log::warn;
use minio::s3::{builders::ObjectContent, client::Client, types::S3Api};
use uuid::Uuid;

use crate::state::AppState;

const ALLOWED_MIME_TYPES: [&str; 4] = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE: usize = 2 * 1024 * 1024; // 2MB

#[derive(Debug, Clone, Default)]
pub struct ImageService {
    pub client: Client,
    pub bucket: String,
}

impl ImageService {
    pub async fn ensure_bucket_exists(&self) -> Result<()> {
        if !self.client.bucket_exists(&self.bucket).send().await?.exists {
            self.client.create_bucket(&self.bucket).send().await?;
            // Set bucket policy for public read access
              let policy = r#"
            {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Action": ["s3:GetObject", "s3:ListBucket", "s3:putObject"],
                        "Effect": "Allow",
                        "Principal": "*",
                        "Resource": ["arn:aws:s3:::{{bucket_name}}/*"]
                    }
                ]
            }
            "#
            .replace("{{bucket_name}}", &self.bucket);
            self.client
                .put_bucket_policy(&self.bucket)
                .config(policy)
                .send()
                .await?;
        }
        Ok(())
    }

    pub async fn upload_image(&self, file: Vec<u8>, content_type: &str) -> Result<String> {
        // Ensure bucket exists before uploading
        self.ensure_bucket_exists().await?;

        // Validate file type
        if !ALLOWED_MIME_TYPES.contains(&content_type) {
            return Err(anyhow::anyhow!(
                "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
            ));
        }

        // Validate file size
        if file.len() > MAX_FILE_SIZE {
            return Err(anyhow::anyhow!(
                "File size exceeds the maximum limit of 2MB."
            ));
        }

        let extension = match content_type {
            "image/jpeg" => "jpg",
            "image/png" => "png",
            "image/gif" => "gif",
            "image/webp" => "webp",
            _ => return Err(anyhow::anyhow!("Unsupported image format")),
        };

        let object_name = format!("{}.{}", Uuid::new_v4(), extension);
        let content = ObjectContent::from(file);
        self.client
            .put_object_content(&self.bucket, &object_name, content)
            .send()
            .await?;

        Ok(object_name)
    }

    pub async fn get_image_url(&self, object_name: &str) -> Result<std::path::PathBuf> {
        let _get_object = self
            .client
            .get_object(&self.bucket, object_name)
            .send()
            .await?;
        let file_path = std::path::PathBuf::from(object_name);

        Ok(file_path)
    }
}

pub async fn handle_image_upload(
    State(state): State<AppState>,
    mut multipart: Multipart,
) -> Result<Response, (StatusCode, String)> {
    warn!("Handling image upload");
    let image_service = state.config.image_service.clone();

    while let Some(field) = multipart.next_field().await.map_err(|e| {
        (
            StatusCode::BAD_REQUEST,
            format!("Failed to process multipart form: {}", e),
        )
    })? {
        let name = field.name().unwrap_or_default();

        if name == "file" {
            // Get content type as an owned String
            let content_type = field
                .content_type()
                .map(|s| s.to_string())
                .unwrap_or_default();

            // Validate content type
            if !ALLOWED_MIME_TYPES.contains(&content_type.as_str()) {
                return Err((
                    StatusCode::BAD_REQUEST,
                    format!(
                        "Invalid file type. Allowed types: {}",
                        ALLOWED_MIME_TYPES.join(", ")
                    ),
                ));
            }

            let data = field.bytes().await.map_err(|e| {
                (
                    StatusCode::BAD_REQUEST,
                    format!("Failed to read file data: {}", e),
                )
            })?;

            // Validate file size
            if data.len() > MAX_FILE_SIZE {
                return Err((
                    StatusCode::BAD_REQUEST,
                    format!(
                        "File size exceeds the maximum limit of {}MB",
                        MAX_FILE_SIZE / 1024 / 1024
                    ),
                ));
            }

            let object_name = image_service
                .upload_image((&data).to_vec(), &content_type)
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
