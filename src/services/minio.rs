use anyhow::Result;
use axum::{
    body::Bytes,
    extract::Multipart,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use minio::s3::{
    args::{GetObjectArgs, PutObjectArgs},
    client::Client,
    creds::StaticProvider,
    http::BaseUrl,
};
use std::env;
use uuid::Uuid;

pub struct MinioService {
    client: Client,
    bucket: String,
}

impl MinioService {
    pub fn new() -> Result<Self> {
        let endpoint = env::var("MINIO_ENDPOINT").unwrap_or_else(|_| "localhost".to_string());
        let port = env::var("MINIO_PORT")
            .unwrap_or_else(|_| "9000".to_string())
            .parse::<u16>()?;
        let access_key = env::var("MINIO_ACCESS_KEY")?;
        let secret_key = env::var("MINIO_SECRET_KEY")?;
        let bucket = env::var("MINIO_BUCKET_NAME").unwrap_or_else(|_| "product-images".to_string());

        let base_url = BaseUrl::new(&endpoint, port, false)?;
        let credentials = StaticProvider::new(&access_key, &secret_key, None);
        let client = Client::new(base_url, Some(credentials), None, None)?;

        Ok(Self { client, bucket })
    }

    pub async fn upload_image(&self, file: Bytes, preview_url: &str) -> Result<String> {
        let object_name = format!("{}.jpg", Uuid::new_v4());
        
        let args = PutObjectArgs::new(&self.bucket, &object_name, file.as_ref())?;
        self.client.put_object(args).await?;

        Ok(object_name)
    }

    pub async fn get_image_url(&self, object_name: &str) -> Result<String> {
        let args = GetObjectArgs::new(&self.bucket, object_name)?;
        let url = self.client.get_presigned_url(args, 3600).await?;
        Ok(url)
    }
}

pub async fn handle_image_upload(
    mut multipart: Multipart,
) -> Result<Response, (StatusCode, String)> {
    let minio = MinioService::new().map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to initialize MinIO: {}", e),
        )
    })?;

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

            let preview_url = field
                .name()
                .unwrap_or_default()
                .to_string();

            let object_name = minio
                .upload_image(data, &preview_url)
                .await
                .map_err(|e| {
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        format!("Failed to upload image: {}", e),
                    )
                })?;

            let image_url = minio
                .get_image_url(&object_name)
                .await
                .map_err(|e| {
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        format!("Failed to get image URL: {}", e),
                    )
                })?;

            return Ok((StatusCode::OK, image_url).into_response());
        }
    }

    Err((
        StatusCode::BAD_REQUEST,
        "No file found in the request".to_string(),
    ))
} 