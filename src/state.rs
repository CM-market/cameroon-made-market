use crate::{
    config::{self, Config},
    migration::{self, Migrator},
    services::product::ProductService,
};
use sea_orm::{Database, DatabaseConnection};
use sea_orm_migration::{MigrationTrait, MigratorTrait};
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    // user shared user Service hear
    pub db: Arc<DatabaseConnection>,
    pub config: Arc<Config>,
    pub product_service: Arc<ProductService>,
}

impl AppState {
    pub fn new(db: DatabaseConnection, config: Config) -> Self {
        let db = Arc::new(db);
        let product_service = Arc::new(ProductService::new(db.clone()));
        Self {
            db,
            config: Arc::new(config),
            product_service,
        }
    }
}

impl AppState {
    pub fn db(&self) -> &DatabaseConnection {
        &self.db
    }

    pub fn config(&self) -> &Config {
        &self.config
    }
}

pub async fn setup() -> AppState {
    let url = std::env::var("DATABASE_URL").expect("DATABASE_URL env not set");
    let db: DatabaseConnection = Database::connect(&url)
        .await
        .expect("Failed to connect to database");

    Migrator::up(&db, None)
        .await
        .expect("Failed to apply migrations");
    let config = config::Config::from_env();
    AppState::new(db, config)
}
