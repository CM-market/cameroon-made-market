# Cameroon Made Market Backend

This is the backend service for the Cameroon Made Market platform, built with Rust and Actix Web.

## Prerequisites

- Rust (latest stable version)
- PostgreSQL 12 or later
- SQLx CLI (for database migrations)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cameroon-made-market.git
cd cameroon-made-market
```

2. Create a `.env` file in the root directory with the following variables:
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/cameroon_made_market
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24
SERVER_PORT=8080
SERVER_HOST=127.0.0.1
CORS_ORIGINS=http://localhost:3000
```

3. Create the database:
```bash
createdb cameroon_made_market
```

4. Run database migrations:
```bash
sqlx migrate run
```

5. Build and run the application:
```bash
cargo run
```

## API Endpoints

### User Management

- `POST /api/users` - Register a new user
- `POST /api/users/login` - User login
- `GET /api/users/me` - Get current user profile (requires authentication)

## Development

### Running Tests

```bash
cargo test
```

### Database Migrations

To create a new migration:
```bash
sqlx migrate add <migration_name>
```

To run migrations:
```bash
sqlx migrate run
```

To revert the last migration:
```bash
sqlx migrate revert
```

## Project Structure

```
src/
├── config.rs         # Configuration management
├── db.rs            # Database connection setup
├── handlers/        # Request handlers
├── lib.rs           # Library entry point
├── main.rs          # Application entry point
├── middleware/      # Custom middleware
├── models/          # Data models
├── routes/          # Route definitions
├── services/        # Business logic
├── state.rs         # Application state
└── utils/           # Utility functions

migrations/          # Database migrations
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 