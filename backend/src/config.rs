use std::{env, str::FromStr};

use fapshi_rs::client::FapshiClient;
use minio::s3::{creds::StaticProvider, http::BaseUrl, Client};

use crate::services::image::ImageService;

#[derive(Clone, Debug)]
pub struct Config {
    pub database_url: String,
    pub jwt_secret: String,
    pub jwt_expires_in: i64,
    pub server_port: u16,
    pub server_host: String,
    pub cors_origins: Vec<String>,
    pub image_service: ImageService,
    pub payment_service: FapshiClient,
}

impl Config {
    pub fn from_env() -> Self {
        let endpoint = env::var("MINIO_ENDPOINT").unwrap_or_else(|_| "localhost".to_string());
        let port = env::var("MINIO_PORT")
            .unwrap_or_else(|_| "9000".to_string())
            .parse::<u16>()
            .unwrap();
        let access_key = env::var("MINIO_ACCESS_KEY").unwrap();
        let secret_key = env::var("MINIO_SECRET_KEY").unwrap();
        let bucket = env::var("MINIO_BUCKET_NAME").unwrap_or_else(|_| "product-images".to_string());
        let fapshi_api_user = env::var("FAPSHI_API_USER").expect("FAPSHI_API_USER must be set");
        let fapshi_api_key = env::var("FAPSHI_API_KEY").expect("FAPSHI_API_KEY must be set");

        let base_url = BaseUrl::from_str("http://localhost:9000").unwrap();
        let credentials = Box::new(StaticProvider::new(&access_key, &secret_key, None));
        let client = Client::new(base_url, Some(credentials), None, None).unwrap();
        let image_service = ImageService { client, bucket };
        let payment_service = FapshiClient::new(&fapshi_api_user, &fapshi_api_key, true)
            .expect("Failed to create FapshiClient");
        Self {
            database_url: env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
            jwt_secret: env::var("JWT_SECRET").expect("JWT_SECRET must be set"),
            jwt_expires_in: env::var("JWT_EXPIRES_IN")
                .unwrap_or_else(|_| "86400".to_string())
                .parse()
                .expect("JWT_EXPIRES_IN must be a number"),
            server_port: env::var("SERVER_PORT")
                .unwrap_or_else(|_| "8080".to_string())
                .parse()
                .expect("SERVER_PORT must be a number"),
            server_host: env::var("SERVER_HOST").unwrap_or_else(|_| "127.0.0.1".to_string()),
            cors_origins: env::var("CORS_ORIGINS")
                .unwrap_or_else(|_| "http://192.168.2.236:8081".to_string())
                .split(',')
                .map(|s| s.trim().to_string())
                .collect(),
            image_service,
            payment_service,
        }
    }
}
