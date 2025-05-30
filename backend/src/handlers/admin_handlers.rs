use crate::models::{
    order::Entity as Order,
    product::{self, Entity as Product},
    user::{self, Entity as User, UserRole},
};
use crate::state::AppState;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use chrono::{Datelike, Utc};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, PaginatorTrait, QueryFilter, Set};
use sea_orm::{QueryOrder, QuerySelect};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Serialize)]
pub struct DashboardMetrics {
    total_users: i64,
    total_vendors: i64,
    total_products: i64,
    total_orders: i64,
    total_revenue: f64,
}

#[derive(Deserialize)]
pub struct UserStatusUpdate {
    is_active: bool,
}

#[derive(Deserialize)]
pub struct ProductStatusUpdate {
    is_approved: bool,
}

#[derive(Serialize)]
pub struct SalesTrend {
    pub month: String,
    pub sales: f64,
}

#[derive(Serialize)]
pub struct BuyerConversion {
    pub month: String,
    pub registered_buyers: usize,
    pub buyers_with_orders: usize,
    pub conversion_rate: f64,
}

#[derive(Serialize)]
pub struct CategoryStat {
    pub category: String,
    pub percentage: f64,
    pub value: usize, // product count or sales count
}

#[derive(Serialize)]
pub struct Activity {
    pub activity_type: String,
    pub name: String,
    pub time: String,
    pub action: String,
}

pub async fn get_dashboard_metrics(
    State(state): State<AppState>,
) -> Result<Json<DashboardMetrics>, StatusCode> {
    let db = &state.db;

    let total_users = User::find()
        .filter(user::Column::Role.eq(UserRole::Buyer))
        .count(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let total_vendors = User::find()
        .filter(user::Column::Role.eq(UserRole::Vendor))
        .count(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let total_products = Product::find()
        .count(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let total_orders = Order::find()
        .count(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Calculate total revenue from orders
    let total_revenue = Order::find()
        .all(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .iter()
        .map(|order| order.total)
        .sum();

    let metrics = DashboardMetrics {
        total_users: total_users.try_into().unwrap(),
        total_vendors: total_vendors.try_into().unwrap(),
        total_products: total_products.try_into().unwrap(),
        total_orders: total_orders.try_into().unwrap(),
        total_revenue,
    };

    Ok(Json(metrics))
}

pub async fn get_users(
    State(state): State<AppState>,
) -> Result<Json<Vec<user::Model>>, StatusCode> {
    let db = &state.db;

    let users = User::find()
        .all(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(users))
}

pub async fn update_user_status(
    State(state): State<AppState>,
    Path(user_id): Path<Uuid>,
    Json(status): Json<UserStatusUpdate>,
) -> Result<Json<user::Model>, StatusCode> {
    let db = &state.db;

    let user = User::find_by_id(user_id)
        .one(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    let mut user: user::ActiveModel = user.into();
    user.is_active = Set(status.is_active);
    let user = user
        .update(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(user))
}

pub async fn get_products(
    State(state): State<AppState>,
) -> Result<Json<Vec<crate::models::product::Model>>, StatusCode> {
    let db = &state.db;

    let products = Product::find()
        .all(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(products))
}

pub async fn update_product_status(
    State(state): State<AppState>,
    Path(product_id): Path<Uuid>,
    Json(status): Json<ProductStatusUpdate>,
) -> Result<Json<crate::models::product::Model>, StatusCode> {
    let db = &state.db;

    let product = Product::find_by_id(product_id)
        .one(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    let mut product: product::ActiveModel = product.into();
    product.is_approved = Set(status.is_approved);
    let product = product
        .update(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(product))
}

pub async fn get_orders(
    State(state): State<AppState>,
) -> Result<Json<Vec<crate::models::order::Model>>, StatusCode> {
    let db = &state.db;

    let orders = Order::find()
        .all(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(orders))
}

pub async fn get_order_details(
    State(state): State<AppState>,
    Path(order_id): Path<Uuid>,
) -> Result<Json<crate::models::order::Model>, StatusCode> {
    let db = &state.db;

    let order = Order::find_by_id(order_id)
        .one(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    Ok(Json(order))
}

pub async fn get_sales_trends(
    State(state): State<AppState>,
) -> Result<Json<Vec<SalesTrend>>, StatusCode> {
    let db = &state.db;
    let current_year = Utc::now().year();
    let orders = Order::find()
        .all(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let mut monthly_sales = [0.0; 12];
    for order in orders {
        let month = order.created_at.month0() as usize;
        if order.created_at.year() == current_year {
            monthly_sales[month] += order.total;
        }
    }
    let month_names = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    let trends: Vec<SalesTrend> = month_names
        .iter()
        .enumerate()
        .map(|(i, &name)| SalesTrend {
            month: name.to_string(),
            sales: monthly_sales[i],
        })
        .collect();
    Ok(Json(trends))
}

pub async fn get_buyer_conversion(
    State(state): State<AppState>,
) -> Result<Json<Vec<BuyerConversion>>, StatusCode> {
    let db = &state.db;
    let current_year = Utc::now().year();
    let buyers = User::find()
        .filter(user::Column::Role.eq(UserRole::Buyer))
        .all(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let orders = Order::find()
        .all(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let mut monthly_registered = [0; 12];
    let mut monthly_converted = [0; 12];
    for buyer in &buyers {
        if buyer.created_at.year() == current_year {
            let month = buyer.created_at.month0() as usize;
            monthly_registered[month] += 1;
        }
    }
    for i in 0..12 {
        let buyers_this_month: Vec<_> = buyers
            .iter()
            .filter(|b| b.created_at.year() == current_year && b.created_at.month0() as usize == i)
            .map(|b| b.id)
            .collect();
        let mut buyers_with_orders = std::collections::HashSet::new();
        for order in &orders {
            if order.created_at.year() == current_year && order.created_at.month0() as usize == i {
                let order_user_id = &order.user_id;
                if buyers_this_month.contains(order_user_id) {
                    buyers_with_orders.insert(*order_user_id);
                }
            }
        }
        monthly_converted[i] = buyers_with_orders.len();
    }
    let month_names = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    let conversions: Vec<BuyerConversion> = month_names
        .iter()
        .enumerate()
        .map(|(i, &name)| {
            let reg = monthly_registered[i];
            let conv = monthly_converted[i];
            BuyerConversion {
                month: name.to_string(),
                registered_buyers: reg,
                buyers_with_orders: conv,
                conversion_rate: if reg > 0 {
                    conv as f64 / reg as f64
                } else {
                    0.0
                },
            }
        })
        .collect();
    Ok(Json(conversions))
}

pub async fn get_top_categories(
    State(state): State<AppState>,
) -> Result<Json<Vec<CategoryStat>>, StatusCode> {
    let db = &state.db;
    let products = Product::find()
        .all(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let mut category_counts: HashMap<String, usize> = HashMap::new();
    for product in &products {
        let category = product
            .category
            .clone()
            .unwrap_or_else(|| "Uncategorized".to_string());
        *category_counts.entry(category).or_insert(0) += 1;
    }
    let total: usize = category_counts.values().sum();
    let mut stats: Vec<CategoryStat> = category_counts
        .into_iter()
        .map(|(category, value)| CategoryStat {
            percentage: if total > 0 {
                (value as f64 / total as f64) * 100.0
            } else {
                0.0
            },
            category,
            value,
        })
        .collect();
    stats.sort_by(|a, b| b.value.cmp(&a.value));
    stats.truncate(5);
    Ok(Json(stats))
}

pub async fn get_recent_activities(
    State(state): State<AppState>,
) -> Result<Json<Vec<Activity>>, StatusCode> {
    let db = &state.db;
    let recent_producers = User::find()
        .filter(user::Column::Role.eq(UserRole::Vendor))
        .order_by_desc(user::Column::CreatedAt)
        .limit(5)
        .all(&**db)
        .await
        .unwrap_or_default();
    let recent_products = Product::find()
        .order_by_desc(product::Column::CreatedAt)
        .limit(5)
        .all(&**db)
        .await
        .unwrap_or_default();
    let recent_orders = Order::find()
        .order_by_desc(crate::models::order::Column::CreatedAt)
        .limit(5)
        .all(&**db)
        .await
        .unwrap_or_default();
    let mut activities: Vec<Activity> = vec![];
    for producer in recent_producers {
        activities.push(Activity {
            activity_type: "New Producer".to_string(),
            name: producer.full_name,
            time: producer.created_at.format("%Y-%m-%d %H:%M").to_string(),
            action: "Registration submitted".to_string(),
        });
    }
    for product in recent_products {
        activities.push(Activity {
            activity_type: "Product Approval".to_string(),
            name: product.title,
            time: product.created_at.format("%Y-%m-%d %H:%M").to_string(),
            action: if product.is_approved {
                "Approved by admin"
            } else {
                "Pending approval"
            }
            .to_string(),
        });
    }
    for order in recent_orders {
        activities.push(Activity {
            activity_type: "New Order".to_string(),
            name: format!("Order #{}", order.id),
            time: order.created_at.format("%Y-%m-%d %H:%M").to_string(),
            action: format!("Placed for {:.0} FCFA", order.total),
        });
    }
    activities.sort_by(|a, b| b.time.cmp(&a.time));
    activities.truncate(10);
    Ok(Json(activities))
}

pub async fn get_pending_products(
    State(state): State<AppState>,
) -> Result<Json<Vec<crate::models::product::Model>>, StatusCode> {
    let db = &state.db;
    let products = Product::find()
        .filter(product::Column::IsApproved.eq(false))
        .order_by_desc(product::Column::CreatedAt)
        .all(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(products))
}

pub async fn reject_product(
    State(state): State<AppState>,
    Path(product_id): Path<Uuid>,
) -> Result<Json<crate::models::product::Model>, StatusCode> {
    let db = &state.db;
    let product = Product::find_by_id(product_id)
        .one(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;
    let mut product: product::ActiveModel = product.into();
    product.is_approved = Set(false);
    product.is_rejected = Set(true);
    let product = product
        .update(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(product))
}

pub async fn approve_product(
    State(state): State<AppState>,
    Path(product_id): Path<Uuid>,
) -> Result<Json<crate::models::product::Model>, StatusCode> {
    let db = &state.db;
    let product = Product::find_by_id(product_id)
        .one(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;
    let mut product: product::ActiveModel = product.into();
    product.is_approved = Set(true);
    product.is_rejected = Set(false);
    let product = product
        .update(&**db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(product))
}
 