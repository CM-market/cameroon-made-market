use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, QueryOrder, Set,
};
use uuid::Uuid;

use crate::{
    entities::product::{self, CreateProduct, UpdateProduct, ProductResponse},
    AppError,
};

pub struct ProductService {
    db: DatabaseConnection,
}

impl ProductService {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }

    pub async fn create_product(&self, product_data: CreateProduct) -> Result<ProductResponse, AppError> {
        let product = product::ActiveModel {
            id: Set(Uuid::new_v4()),
            seller_id: Set(Some(product_data.seller_id)),
            title: Set(product_data.title),
            description: Set(product_data.description),
            price: Set(product_data.price),
            category: Set(product_data.category),
            certified: Set(product_data.certified),
            image_urls: Set(product_data.image_urls),
            created_at: Set(chrono::Utc::now()),
            updated_at: Set(chrono::Utc::now()),
        }
        .insert(&self.db)
        .await?;

        Ok(product.into())
    }

    pub async fn get_product_by_id(&self, product_id: Uuid) -> Result<ProductResponse, AppError> {
        let product = product::Entity::find_by_id(product_id)
            .one(&self.db)
            .await?
            .ok_or_else(|| AppError::NotFoundError("Product not found".into()))?;

        Ok(product.into())
    }

    pub async fn update_product(&self, product_id: Uuid, product_data: UpdateProduct) -> Result<ProductResponse, AppError> {
        let mut product = product::Entity::find_by_id(product_id)
            .one(&self.db)
            .await?
            .ok_or_else(|| AppError::NotFoundError("Product not found".into()))?;

        let mut active_model: product::ActiveModel = product.clone().into();

        if let Some(title) = product_data.title {
            active_model.title = Set(title);
        }
        if let Some(description) = product_data.description {
            active_model.description = Set(Some(description));
        }
        if let Some(price) = product_data.price {
            active_model.price = Set(price);
        }
        if let Some(category) = product_data.category {
            active_model.category = Set(Some(category));
        }
        if let Some(certified) = product_data.certified {
            active_model.certified = Set(certified);
        }
        if let Some(image_urls) = product_data.image_urls {
            active_model.image_urls = Set(image_urls);
        }
        active_model.updated_at = Set(chrono::Utc::now());

        let updated_product = active_model.update(&self.db).await?;
        Ok(updated_product.into())
    }

    pub async fn delete_product(&self, product_id: Uuid) -> Result<(), AppError> {
        product::Entity::delete_by_id(product_id)
            .exec(&self.db)
            .await?;
        Ok(())
    }

    pub async fn list_products(
        &self,
        category: Option<String>,
        seller_id: Option<Uuid>,
        certified: Option<bool>,
    ) -> Result<Vec<ProductResponse>, AppError> {
        let mut query = product::Entity::find();

        if let Some(category) = category {
            query = query.filter(product::Column::Category.eq(category));
        }
        if let Some(seller_id) = seller_id {
            query = query.filter(product::Column::SellerId.eq(seller_id));
        }
        if let Some(certified) = certified {
            query = query.filter(product::Column::Certified.eq(certified));
        }

        let products = query
            .order_by_desc(product::Column::CreatedAt)
            .all(&self.db)
            .await?;

        Ok(products.into_iter().map(ProductResponse::from).collect())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use mockall::predicate::*;
    use sea_orm::MockDatabase;
    use test_log;
    use rust_decimal::Decimal;

    #[tokio::test]
    async fn test_create_product() {
        let seller_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![product::Model {
                id: Uuid::new_v4(),
                seller_id: Some(seller_id),
                title: "Test Product".to_string(),
                description: Some("Test Description".to_string()),
                price: Decimal::new(1000, 2), // 10.00
                category: Some("Test Category".to_string()),
                certified: true,
                image_urls: vec!["test.jpg".to_string()],
                created_at: chrono::Utc::now(),
                updated_at: chrono::Utc::now(),
            }]])
            .into_connection();

        let service = ProductService::new(db);

        let product_data = CreateProduct {
            seller_id,
            title: "Test Product".to_string(),
            description: Some("Test Description".to_string()),
            price: Decimal::new(1000, 2),
            category: Some("Test Category".to_string()),
            certified: true,
            image_urls: vec!["test.jpg".to_string()],
        };

        let result = service.create_product(product_data).await;
        assert!(result.is_ok());

        let product_response = result.unwrap();
        assert_eq!(product_response.title, "Test Product");
        assert_eq!(product_response.price, Decimal::new(1000, 2));
        assert_eq!(product_response.seller_id, Some(seller_id));
    }

    #[tokio::test]
    async fn test_get_product_by_id() {
        let product_id = Uuid::new_v4();
        let seller_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![product::Model {
                id: product_id,
                seller_id: Some(seller_id),
                title: "Test Product".to_string(),
                description: Some("Test Description".to_string()),
                price: Decimal::new(1000, 2),
                category: Some("Test Category".to_string()),
                certified: true,
                image_urls: vec!["test.jpg".to_string()],
                created_at: chrono::Utc::now(),
                updated_at: chrono::Utc::now(),
            }]])
            .into_connection();

        let service = ProductService::new(db);

        let result = service.get_product_by_id(product_id).await;
        assert!(result.is_ok());

        let product_response = result.unwrap();
        assert_eq!(product_response.id, product_id);
        assert_eq!(product_response.title, "Test Product");
    }

    #[tokio::test]
    async fn test_update_product() {
        let product_id = Uuid::new_v4();
        let seller_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![
                vec![product::Model {
                    id: product_id,
                    seller_id: Some(seller_id),
                    title: "Test Product".to_string(),
                    description: Some("Test Description".to_string()),
                    price: Decimal::new(1000, 2),
                    category: Some("Test Category".to_string()),
                    certified: true,
                    image_urls: vec!["test.jpg".to_string()],
                    created_at: chrono::Utc::now(),
                    updated_at: chrono::Utc::now(),
                }],
                vec![product::Model {
                    id: product_id,
                    seller_id: Some(seller_id),
                    title: "Updated Product".to_string(),
                    description: Some("Updated Description".to_string()),
                    price: Decimal::new(2000, 2),
                    category: Some("Updated Category".to_string()),
                    certified: true,
                    image_urls: vec!["updated.jpg".to_string()],
                    created_at: chrono::Utc::now(),
                    updated_at: chrono::Utc::now(),
                }],
            ])
            .into_connection();

        let service = ProductService::new(db);

        let update_data = UpdateProduct {
            title: Some("Updated Product".to_string()),
            description: Some("Updated Description".to_string()),
            price: Some(Decimal::new(2000, 2)),
            category: Some("Updated Category".to_string()),
            certified: None,
            image_urls: Some(vec!["updated.jpg".to_string()]),
        };

        let result = service.update_product(product_id, update_data).await;
        assert!(result.is_ok());

        let product_response = result.unwrap();
        assert_eq!(product_response.title, "Updated Product");
        assert_eq!(product_response.price, Decimal::new(2000, 2));
    }

    #[tokio::test]
    async fn test_list_products() {
        let seller_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![
                product::Model {
                    id: Uuid::new_v4(),
                    seller_id: Some(seller_id),
                    title: "Product 1".to_string(),
                    description: Some("Description 1".to_string()),
                    price: Decimal::new(1000, 2),
                    category: Some("Category A".to_string()),
                    certified: true,
                    image_urls: vec!["1.jpg".to_string()],
                    created_at: chrono::Utc::now(),
                    updated_at: chrono::Utc::now(),
                },
                product::Model {
                    id: Uuid::new_v4(),
                    seller_id: Some(seller_id),
                    title: "Product 2".to_string(),
                    description: Some("Description 2".to_string()),
                    price: Decimal::new(2000, 2),
                    category: Some("Category B".to_string()),
                    certified: false,
                    image_urls: vec!["2.jpg".to_string()],
                    created_at: chrono::Utc::now(),
                    updated_at: chrono::Utc::now(),
                },
            ]])
            .into_connection();

        let service = ProductService::new(db);

        let result = service.list_products(None, Some(seller_id), None).await;
        assert!(result.is_ok());

        let products = result.unwrap();
        assert_eq!(products.len(), 2);
        assert_eq!(products[0].title, "Product 1");
        assert_eq!(products[1].title, "Product 2");
    }
} 