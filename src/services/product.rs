use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, JoinType, QueryFilter,
    QueryOrder, QuerySelect, RelationTrait, Set,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::models::{
    order::{self, Status},
    order_item,
    product::{self, Model},
};

use super::errors::ServiceError;

pub struct ProductService {
    db: Arc<DatabaseConnection>,
}

#[derive(Debug, Clone)]
pub struct CreateProduct {
    pub seller_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub quantity: i32,
    pub price: f64,
    pub category: Option<String>,
    pub image_urls: Vec<String>,
    pub return_policy: Option<String>,
}

pub struct UpdateProduct {
    pub title: Option<String>,
    pub description: Option<String>,
    pub quantity: Option<i32>,
    pub price: Option<f64>,
    pub category: Option<String>,
    pub image_urls: Option<Vec<String>>,
    pub return_policy: Option<String>,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct ProductWithStats {
    #[serde(flatten)]
    pub product: Model,
    pub sales: i32,
    pub revenue: f64,
}

impl ProductService {
    pub fn new(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }

    pub async fn create_product(&self, product_data: CreateProduct) -> Result<Model, ServiceError> {
        let product = product::ActiveModel {
            id: Set(Uuid::new_v4()),
            seller_id: Set(product_data.seller_id),
            title: Set(product_data.title),
            is_rejected: Set(false),
            description: Set(product_data.description),
            price: Set(product_data.price),
            category: Set(product_data.category),
            image_urls: Set(product_data.image_urls),
            quantity: Set(product_data.quantity),
            return_policy: Set(product_data.return_policy),
            is_approved: Set(false),
            created_at: Set(chrono::Utc::now()),
            updated_at: Set(chrono::Utc::now()),
        }
        .insert(&*self.db)
        .await?;

        Ok(product.into())
    }

    pub async fn get_product_by_id(
        &self,
        product_id: Uuid,
    ) -> Result<Option<ProductWithStats>, ServiceError> {
        let product = product::Entity::find_by_id(product_id)
            .one(&*self.db)
            .await
            .map_err(|e| ServiceError::NotFound(e.to_string()))?;

        if let Some(product) = product {
            let stats = self.calculate_product_stats(product_id).await?;
            Ok(Some(ProductWithStats {
                product,
                sales: stats.sales,
                revenue: stats.revenue,
            }))
        } else {
            Ok(None)
        }
    }

    pub async fn update_product(
        &self,
        product_id: Uuid,
        product_data: UpdateProduct,
    ) -> Result<Model, ServiceError> {
        let product = product::Entity::find_by_id(product_id)
            .one(&*self.db)
            .await
            .map_err(|e| ServiceError::NotFound(e.to_string()))?;
        if let Some(product) = product {
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
            if let Some(image_urls) = product_data.image_urls {
                active_model.image_urls = Set(image_urls);
            }
            if let Some(quantity) = product_data.quantity {
                active_model.quantity = Set(quantity);
            }
            if let Some(return_policy) = product_data.return_policy {
                active_model.return_policy = Set(Some(return_policy));
            }
            active_model.updated_at = Set(chrono::Utc::now());

            let updated_product = active_model.update(&*self.db).await?;
            Ok(updated_product.into())
        } else {
            Err(ServiceError::NotFound("Product not found".into()))
        }
    }

    pub async fn delete_product(&self, product_id: Uuid) -> Result<(), ServiceError> {
        product::Entity::delete_by_id(product_id)
            .exec(&*self.db)
            .await?;
        Ok(())
    }

    pub async fn list_products(&self) -> Result<Vec<Model>, ServiceError> {
        let query = product::Entity::find()
            .filter(product::Column::IsApproved.eq(true));

        let products = query
            .order_by_desc(product::Column::CreatedAt)
            .all(&*self.db)
            .await?;

        tracing::info!("Found {} approved products", products.len());
        for product in &products {
            tracing::info!("Product: id={}, title={}, is_approved={}", 
                product.id, 
                product.title, 
                product.is_approved
            );
        }

        Ok(products)
    }

    pub async fn list_products_by(
        &self,
        seller_id: Option<Uuid>,
    ) -> Result<Vec<ProductWithStats>, ServiceError> {
        let mut query = product::Entity::find();

        if let Some(seller_id) = seller_id {
            query = query.filter(product::Column::SellerId.eq(seller_id));
        }

        let products = query
            .order_by_desc(product::Column::CreatedAt)
            .all(&*self.db)
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Failed to fetch products: {}", e)))?;

        let mut products_with_stats = Vec::new();
        for product in products {
            match self.calculate_product_stats(product.id).await {
                Ok(stats) => {
                    products_with_stats.push(ProductWithStats {
                        product,
                        sales: stats.sales,
                        revenue: stats.revenue,
                    });
                }
                Err(e) => {
                    tracing::error!(
                        "Failed to calculate stats for product {}: {}",
                        product.id,
                        e
                    );
                    // Continue with other products even if one fails
                    products_with_stats.push(ProductWithStats {
                        product,
                        sales: 0,
                        revenue: 0.0,
                    });
                }
            }
        }

        Ok(products_with_stats)
    }

    async fn calculate_product_stats(
        &self,
        product_id: Uuid,
    ) -> Result<ProductStats, ServiceError> {
        // Get the product first to get its price
        let product = product::Entity::find_by_id(product_id)
            .one(&*self.db)
            .await
            .map_err(|e| ServiceError::DatabaseError(format!("Failed to fetch product: {}", e)))?
            .ok_or_else(|| {
                ServiceError::NotFound(format!("Product with ID {} not found", product_id))
            })?;

        // Join order_items with orders to get only completed orders
        let order_items = order_item::Entity::find()
            .join(JoinType::InnerJoin, order_item::Relation::Order.def())
            .filter(order_item::Column::ProductId.eq(product_id))
            .filter(order::Column::Status.eq(Status::Delivered.to_string()))
            .all(&*self.db)
            .await
            .map_err(|e| {
                ServiceError::DatabaseError(format!("Failed to fetch order items: {}", e))
            })?;

        let sales = order_items.iter().map(|item| item.quantity).sum();
        let revenue = order_items.iter().fold(0.0, |acc, item| {
            acc + (item.quantity as f64 * product.price)
        });

        Ok(ProductStats { sales, revenue })
    }

    pub async fn approve_product(&self, product_id: Uuid) -> Result<Model, ServiceError> {
        let product = product::Entity::find_by_id(product_id)
            .one(&*self.db)
            .await
            .map_err(|e| ServiceError::NotFound(e.to_string()))?;
        if let Some(product) = product {
            tracing::info!("Approving product: id={}, title={}, current is_approved={}", 
                product.id, 
                product.title, 
                product.is_approved
            );
            let mut active_model: product::ActiveModel = product.clone().into();
            active_model.is_approved = Set(true);
            active_model.updated_at = Set(chrono::Utc::now());
            let updated_product = active_model.update(&*self.db).await?;
            tracing::info!("Product approved successfully: id={}, title={}, new is_approved={}", 
                updated_product.id, 
                updated_product.title, 
                updated_product.is_approved
            );
            Ok(updated_product.into())
        } else {
            Err(ServiceError::NotFound("Product not found".into()))
        }
    }

    pub async fn list_pending_products(&self) -> Result<Vec<Model>, ServiceError> {
        let products = product::Entity::find()
            .filter(product::Column::IsApproved.eq(false))
            .order_by_desc(product::Column::CreatedAt)
            .all(&*self.db)
            .await?;
        Ok(products)
    }
}

#[derive(Debug)]
struct ProductStats {
    sales: i32,
    revenue: f64,
}

#[cfg(test)]
mod tests {
    use super::*;
    use sea_orm::MockDatabase;

    #[tokio::test]
    async fn test_create_product() {
        let seller_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![product::Model {
                id: Uuid::new_v4(),
                seller_id: seller_id,
                title: "Test Product".to_string(),
                description: Some("Test Description".to_string()),
                price: 10.0,
                category: Some("Test Category".to_string()),
                is_rejected: false,
                image_urls: vec!["test.jpg".to_string()],
                quantity: 1,
                return_policy: Some("Test Refund Policy".to_string()),
                is_approved: false,
                created_at: chrono::Utc::now(),
                updated_at: chrono::Utc::now(),
            }]])
            .into_connection();

        let service = ProductService::new(Arc::new(db));

        let product_data = CreateProduct {
            seller_id,
            title: "Test Product".to_string(),
            description: Some("Test Description".to_string()),
            price: 100.0,
            category: Some("Test Category".to_string()),
            image_urls: vec!["test.jpg".to_string()],
            return_policy: Some("Test Refund Policy".to_string()),
            quantity: 1,
        };

        let result = service.create_product(product_data).await;
        assert!(result.is_ok());

        let product_response = result.unwrap();
        assert_eq!(product_response.title, "Test Product");
        assert_eq!(product_response.price, 100.0);
        assert_eq!(product_response.seller_id, seller_id);
    }

    #[tokio::test]
    async fn test_get_product_by_id() {
        let product_id = Uuid::new_v4();
        let seller_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![product::Model {
                id: product_id,
                seller_id: seller_id,
                title: "Test Product".to_string(),
                description: Some("Test Description".to_string()),
                price: 100.0,
                quantity: 1,
                is_rejected: false,
                category: Some("Test Category".to_string()),
                image_urls: vec!["test.jpg".to_string()],
                return_policy: Some("Test Refund Policy".to_string()),
                is_approved: false,
                created_at: chrono::Utc::now(),
                updated_at: chrono::Utc::now(),
            }]])
            .into_connection();

        let service = ProductService::new(Arc::new(db));

        let result = service.get_product_by_id(product_id).await;
        assert!(result.is_ok());

        let product_response = result.unwrap();
        let product_response = product_response.unwrap();
        assert_eq!(product_response.product.id, product_id);
        assert_eq!(product_response.product.title, "Test Product");
    }

    #[tokio::test]
    async fn test_update_product() {
        let product_id = Uuid::new_v4();
        let seller_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![
                vec![product::Model {
                    id: product_id,
                    seller_id: seller_id,
                    title: "Test Product".to_string(),
                    description: Some("Test Description".to_string()),
                    price: 1000.0,
                    quantity: 1,
                    category: Some("Test Category".to_string()),
                    is_rejected: false,                    image_urls: vec!["test.jpg".to_string()],
                    return_policy: Some("Test Refund Policy".to_string()),
                    is_approved: false,
                    created_at: chrono::Utc::now(),
                    updated_at: chrono::Utc::now(),
                }],
                vec![product::Model {
                    id: product_id,
                    seller_id: seller_id,
                    title: "Updated Product".to_string(),
                    description: Some("Updated Description".to_string()),
                    price: 100.0,
                    quantity: 1,
                    category: Some("Updated Category".to_string()),
                    image_urls: vec!["updated.jpg".to_string()],
                    return_policy: Some("Updated Refund Policy".to_string()),
                    is_rejected: false,
                    is_approved: false,
                    created_at: chrono::Utc::now(),
                    updated_at: chrono::Utc::now(),
                }],
            ])
            .into_connection();

        let service = ProductService::new(Arc::new(db));

        let update_data = UpdateProduct {
            title: Some("Updated Product".to_string()),
            description: Some("Updated Description".to_string()),
            price: Some(100.0),
            category: Some("Updated Category".to_string()),
            image_urls: Some(vec!["updated.jpg".to_string()]),
            return_policy: Some("Updated Refund Policy".to_string()),
            quantity: Some(1),
        };

        let result = service.update_product(product_id, update_data).await;
        assert!(result.is_ok());

        let product_response = result.unwrap();
        assert_eq!(product_response.title, "Updated Product");
        assert_eq!(product_response.price, 100.0);
    }

    #[tokio::test]
    async fn test_list_products() {
        let seller_id = Uuid::new_v4();
        let db = MockDatabase::new(sea_orm::DatabaseBackend::Postgres)
            .append_query_results(vec![vec![
                product::Model {
                    id: Uuid::new_v4(),
                    seller_id: seller_id,
                    title: "Product 1".to_string(),
                    description: Some("Description 1".to_string()),
                    price: 100.0,
                    quantity: 1,
                    category: Some("Category A".to_string()),
                    image_urls: vec!["1.jpg".to_string()],
                    is_rejected: false,
                    return_policy: Some("Refund Policy 1".to_string()),
                    is_approved: false,
                    created_at: chrono::Utc::now(),
                    updated_at: chrono::Utc::now(),
                },
                product::Model {
                    id: Uuid::new_v4(),
                    seller_id: seller_id,
                    title: "Product 2".to_string(),
                    description: Some("Description 2".to_string()),
                    price: 100.0,
                    quantity: 1,
                    category: Some("Category B".to_string()),
                    image_urls: vec!["2.jpg".to_string()],
                    return_policy: Some("Refund Policy 2".to_string()),
                    is_rejected: false,
                    is_approved: false,
                    created_at: chrono::Utc::now(),
                    updated_at: chrono::Utc::now(),
                },
            ]])
            .into_connection();

        let service = ProductService::new(Arc::new(db));

        let result = service.list_products().await;
        assert!(result.is_ok());

        let products = result.unwrap();
        assert_eq!(products.len(), 2);
        assert_eq!(products[0].title, "Product 1");
        assert_eq!(products[1].title, "Product 2");
    }
}
