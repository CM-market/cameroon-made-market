use crate::{
    config::{self, Config},
    migration::{self, Migrator},
};
use sea_orm::{Database, DatabaseConnection};
use sea_orm_migration::{MigrationTrait, MigratorTrait};
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    // user shared user Service hear
    pub db: Arc<DatabaseConnection>,
    pub config: Arc<Config>,
}

impl AppState {
    pub fn new(db: DatabaseConnection, config: Config) -> Self {
        Self {
            db: Arc::new(db),
            config: Arc::new(config),
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
