use sea_orm_migration::prelude::*;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![Box::new(tables::Migration)]
    }
}

pub mod tables {
    use sea_orm::sea_query::extension::postgres::Type;

    use super::*;

    #[derive(DeriveMigrationName)]
    pub struct Migration;

    #[async_trait::async_trait]
    impl MigrationTrait for Migration {
        async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
            // Create user_role enum type
            manager
                .create_type(
                    Type::create()
                        .as_enum(Alias::new("user_role"))
                        .values(vec!["Admin", "Vendor", "Buyer"])
                        .to_owned(),
                )
                .await?;

            // Create users table
            manager
                .create_table(
                    Table::create()
                        .table(Users::Table)
                        .if_not_exists()
                        .col(ColumnDef::new(Users::Id).uuid().not_null().primary_key())
                        .col(ColumnDef::new(Users::Email).string())
                        .col(ColumnDef::new(Users::PasswordHash).string().not_null())
                        .col(ColumnDef::new(Users::IsActive).boolean().not_null())
                        .col(
                            ColumnDef::new(Users::Role)
                                .enumeration(
                                    Alias::new("user_role"),
                                    vec!["Admin", "Vendor", "User"],
                                )
                                .not_null(),
                        )
                        .col(ColumnDef::new(Users::FullName).string().not_null())
                        .col(
                            ColumnDef::new(Users::Phone)
                                .integer()
                                .not_null()
                                .unique_key(),
                        )
                        .col(
                            ColumnDef::new(Users::CreatedAt)
                                .timestamp_with_time_zone()
                                .not_null(),
                        )
                        .col(
                            ColumnDef::new(Users::UpdatedAt)
                                .timestamp_with_time_zone()
                                .not_null(),
                        )
                        .to_owned(),
                )
                .await?;

            // Create products table
            manager
                .create_table(
                    Table::create()
                        .table(Products::Table)
                        .if_not_exists()
                        .col(ColumnDef::new(Products::Id).uuid().not_null().primary_key())
                        .col(ColumnDef::new(Products::SellerId).uuid())
                        .col(ColumnDef::new(Products::Title).string().not_null())
                        .col(ColumnDef::new(Products::Description).string())
                        .col(ColumnDef::new(Products::Quantity).integer().not_null())
                        .col(ColumnDef::new(Products::ReturnPolicy).string())
                        .col(ColumnDef::new(Products::Price).double().not_null())
                        .col(ColumnDef::new(Products::Category).string())
                        .col(ColumnDef::new(Products::IsApproved).boolean().not_null())
                        .col(ColumnDef::new(Products::IsRejected).boolean().not_null())
                        .col(
                            ColumnDef::new(Products::ImageUrls)
                                .array(ColumnType::String(StringLen::Max))
                                .not_null(),
                        )
                        .col(
                            ColumnDef::new(Products::CreatedAt)
                                .timestamp_with_time_zone()
                                .not_null(),
                        )
                        .col(
                            ColumnDef::new(Products::UpdatedAt)
                                .timestamp_with_time_zone()
                                .not_null(),
                        )
                        .foreign_key(
                            ForeignKey::create()
                                .name("fk_products_seller_id")
                                .from(Products::Table, Products::SellerId)
                                .to(Users::Table, Users::Id)
                                .on_delete(ForeignKeyAction::SetNull)
                                .on_update(ForeignKeyAction::NoAction),
                        )
                        .to_owned(),
                )
                .await?;

            // Create carts table
            manager
                .create_table(
                    Table::create()
                        .table(Carts::Table)
                        .if_not_exists()
                        .col(ColumnDef::new(Carts::Id).uuid().not_null().primary_key())
                        .col(
                            ColumnDef::new(Carts::SessionId)
                                .uuid()
                                .not_null()
                                .unique_key(),
                        )
                        .col(
                            ColumnDef::new(Carts::CreatedAt)
                                .timestamp_with_time_zone()
                                .not_null(),
                        )
                        .foreign_key(
                            ForeignKey::create()
                                .name("fk_carts_session_id")
                                .from(Carts::Table, Carts::SessionId)
                                .to(Users::Table, Users::Id)
                                .on_delete(ForeignKeyAction::NoAction)
                                .on_update(ForeignKeyAction::NoAction),
                        )
                        .to_owned(),
                )
                .await?;

            // Create cart_items table
            manager
                .create_table(
                    Table::create()
                        .table(CartItems::Table)
                        .if_not_exists()
                        .col(
                            ColumnDef::new(CartItems::Id)
                                .uuid()
                                .not_null()
                                .primary_key(),
                        )
                        .col(ColumnDef::new(CartItems::CartId).uuid().not_null())
                        .col(ColumnDef::new(CartItems::ProductId).uuid().not_null())
                        .col(ColumnDef::new(CartItems::Quantity).integer().not_null())
                        .foreign_key(
                            ForeignKey::create()
                                .name("fk_cart_items_cart_id")
                                .from(CartItems::Table, CartItems::CartId)
                                .to(Carts::Table, Carts::Id)
                                .on_delete(ForeignKeyAction::Cascade)
                                .on_update(ForeignKeyAction::NoAction),
                        )
                        .foreign_key(
                            ForeignKey::create()
                                .name("fk_cart_items_product_id")
                                .from(CartItems::Table, CartItems::ProductId)
                                .to(Products::Table, Products::Id)
                                .on_delete(ForeignKeyAction::Cascade)
                                .on_update(ForeignKeyAction::NoAction),
                        )
                        .to_owned(),
                )
                .await?;

            // Create orders table
            manager
                .create_table(
                    Table::create()
                        .table(Orders::Table)
                        .if_not_exists()
                        .col(ColumnDef::new(Orders::Id).uuid().not_null().primary_key())
                        .col(ColumnDef::new(Orders::UserId).uuid().not_null())
                        .col(ColumnDef::new(Orders::CustomerName).string().not_null())
                        .col(ColumnDef::new(Orders::CustomerEmail).string())
                        .col(ColumnDef::new(Orders::CustomerPhone).string().not_null())
                        .col(ColumnDef::new(Orders::DeliveryAddress).string().not_null())
                        .col(ColumnDef::new(Orders::Status).text().not_null())
                        .col(ColumnDef::new(Orders::Total).decimal_len(10, 2).not_null())
                        .col(
                            ColumnDef::new(Orders::CreatedAt)
                                .timestamp_with_time_zone()
                                .not_null(),
                        )
                        .foreign_key(
                            ForeignKey::create()
                                .name("fk_orders_session_id")
                                .from(Orders::Table, Orders::UserId)
                                .to(Users::Table, Users::Id)
                                .on_delete(ForeignKeyAction::SetNull)
                                .on_update(ForeignKeyAction::NoAction),
                        )
                        .to_owned(),
                )
                .await?;

            // Create order_items table
            manager
                .create_table(
                    Table::create()
                        .table(OrderItems::Table)
                        .if_not_exists()
                        .col(
                            ColumnDef::new(OrderItems::Id)
                                .uuid()
                                .not_null()
                                .primary_key(),
                        )
                        .col(ColumnDef::new(OrderItems::OrderId).uuid().not_null())
                        .col(ColumnDef::new(OrderItems::ProductId).uuid().not_null())
                        .col(ColumnDef::new(OrderItems::Quantity).integer().not_null())
                        .col(ColumnDef::new(Products::Price).double().not_null())
                        .foreign_key(
                            ForeignKey::create()
                                .name("fk_order_items_order_id")
                                .from(OrderItems::Table, OrderItems::OrderId)
                                .to(Orders::Table, Orders::Id)
                                .on_delete(ForeignKeyAction::Cascade)
                                .on_update(ForeignKeyAction::NoAction),
                        )
                        .foreign_key(
                            ForeignKey::create()
                                .name("fk_order_items_product_id")
                                .from(OrderItems::Table, OrderItems::ProductId)
                                .to(Products::Table, Products::Id)
                                .on_delete(ForeignKeyAction::NoAction)
                                .on_update(ForeignKeyAction::NoAction),
                        )
                        .to_owned(),
                )
                .await?;

            // Create payments table
            manager
                .create_table(
                    Table::create()
                        .table(Payments::Table)
                        .if_not_exists()
                        .col(ColumnDef::new(Payments::Id).uuid().not_null().primary_key())
                        .col(ColumnDef::new(Payments::OrderId).uuid().not_null())
                        .col(
                            ColumnDef::new(Payments::Amount)
                                .decimal_len(10, 2)
                                .not_null(),
                        )
                        .col(ColumnDef::new(Payments::Status).string().not_null())
                        .col(ColumnDef::new(Payments::PaymentMethod).string().not_null())
                        .col(ColumnDef::new(Payments::PaymentDetails).json())
                        .col(
                            ColumnDef::new(Payments::CreatedAt)
                                .timestamp_with_time_zone()
                                .not_null(),
                        )
                        .col(
                            ColumnDef::new(Payments::UpdatedAt)
                                .timestamp_with_time_zone()
                                .not_null(),
                        )
                        .foreign_key(
                            ForeignKey::create()
                                .name("fk_payments_order_id")
                                .from(Payments::Table, Payments::OrderId)
                                .to(Orders::Table, Orders::Id)
                                .on_delete(ForeignKeyAction::Cascade)
                                .on_update(ForeignKeyAction::NoAction),
                        )
                        .to_owned(),
                )
                .await?;

            Ok(())
        }

        async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
            // Drop tables in reverse order to avoid foreign key conflicts
            manager
                .drop_table(Table::drop().table(Payments::Table).to_owned())
                .await?;
            manager
                .drop_table(Table::drop().table(OrderItems::Table).to_owned())
                .await?;
            manager
                .drop_table(Table::drop().table(Orders::Table).to_owned())
                .await?;
            manager
                .drop_table(Table::drop().table(CartItems::Table).to_owned())
                .await?;
            manager
                .drop_table(Table::drop().table(Carts::Table).to_owned())
                .await?;
            manager
                .drop_table(Table::drop().table(Products::Table).to_owned())
                .await?;
            manager
                .drop_table(Table::drop().table(Users::Table).to_owned())
                .await?;

            Ok(())
        }
    }

    // Define table aliases for clarity
    #[derive(Iden)]
    enum Users {
        Table,
        Id,
        Email,
        PasswordHash,
        IsActive,
        Role,
        FullName,
        Phone,
        CreatedAt,
        UpdatedAt,
    }

    #[derive(Iden)]
    enum Products {
        Table,
        Id,
        SellerId,
        Quantity,
        ReturnPolicy,
        Title,
        Description,
        Price,
        Category,
        IsApproved,
        IsRejected,
        ImageUrls,
        CreatedAt,
        UpdatedAt,
    }

    #[derive(Iden)]
    enum Carts {
        Table,
        Id,
        SessionId,
        CreatedAt,
    }

    #[derive(Iden)]
    enum CartItems {
        Table,
        Id,
        CartId,
        ProductId,
        Quantity,
    }

    #[derive(Iden)]
    enum Orders {
        Table,
        Id,
        UserId,
        CustomerName,
        CustomerEmail,
        CustomerPhone,
        DeliveryAddress,
        Status,
        Total,
        CreatedAt,
    }

    #[derive(Iden)]
    enum OrderItems {
        Table,
        Id,
        OrderId,
        ProductId,
        Quantity,
    }

    #[derive(Iden)]
    enum Payments {
        Table,
        Id,
        OrderId,
        Amount,
        Status,
        PaymentMethod,
        PaymentDetails,
        CreatedAt,
        UpdatedAt,
    }
}
