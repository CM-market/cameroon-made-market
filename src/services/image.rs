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
use std::{env, io::Cursor, str::FromStr};
use uuid::Uuid;

pub struct ImageService {
    client: Client,
    bucket: String,
}

impl ImageService {
    pub fn new() -> Result<Self> {
        let endpoint = env::var("MINIO_ENDPOINT").unwrap_or_else(|_| "localhost".to_string());
        let port = env::var("MINIO_PORT")
            .unwrap_or_else(|_| "9000".to_string())
            .parse::<u16>()?;
        let access_key = env::var("MINIO_ACCESS_KEY")?;
        let secret_key = env::var("MINIO_SECRET_KEY")?;
        let bucket = env::var("MINIO_BUCKET_NAME").unwrap_or_else(|_| "product-images".to_string());

        let base_url = BaseUrl::from_str(&format!("{}:{}", &endpoint, port))?;
        let credentials = Box::new(StaticProvider::new(&access_key, &secret_key, None));
        let client = Client::new(base_url, Some(credentials), None, None)?;

        Ok(Self { client, bucket })
    }

    pub async fn upload_image(&self, file: Vec<u8>) -> Result<String> {
        let object_name = format!("{}.jpg", Uuid::new_v4());
        let mut cursor = Cursor::new(file.clone());

        let mut args = PutObjectArgs::new(
            &self.bucket,
            &object_name,
            &mut cursor,
            Some(file.len()),
            None,
        )?;

        self.client.put_object(&mut args).await?;

        Ok(object_name)
    }

    pub async fn get_image_url(&self, object_name: &str) -> Result<Bytes> {
        let args = GetObjectArgs::new(&self.bucket, object_name)?;
        let url = self.client.get_object(&args).await?;
        let url = url.bytes().await?;
        Ok(url)
    }
}

#[axum::debug_handler]
pub async fn handle_image_upload(
    mut multipart: Multipart,
) -> Result<Response, (StatusCode, String)> {
    let image_service = ImageService::new().map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to initialize image service: {}", e),
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
            let content_type = field.content_type().unwrap_or("image/jpeg").to_string();
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

            return Ok((StatusCode::OK, image_url).into_response());
        }
    }

    Err((
        StatusCode::BAD_REQUEST,
        "No file found in the request".to_string(),
    ))
}
