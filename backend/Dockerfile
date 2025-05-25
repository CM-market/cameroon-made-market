# syntax=docker/dockerfile:1.4

# Stage 1: Build
FROM rust:1.86-alpine AS builder

WORKDIR /app

# Install required build dependencies, including OpenSSL development files
RUN apk add --no-cache \
    build-base \
    pkgconf \
    openssl-dev \
    musl-dev \
    ca-certificates \
    postgresql-dev \
    musl-utils \
    llvm-libunwind-dev

# Set environment variables (disable static linking for OpenSSL)
ENV OPENSSL_STATIC=0
ENV OPENSSL_DIR=/usr

# Copy Cargo files separately to optimize caching
COPY Cargo.toml Cargo.lock ./
COPY . .

# Build the project (using the host's default target)
RUN cargo build --release && \
    strip target/release/cameroon-made-market

# Stage 2: Runtime using a distroless image
FROM gcr.io/distroless/static-debian12:latest

WORKDIR /app

# Copy the built binary from the builder stage
COPY --from=builder /app/target/release/cameroon-made-market /usr/local/bin/cameroon-made-market

# Expose the port
EXPOSE 8080

# Set the entrypoint
ENTRYPOINT ["/usr/local/bin/cameroon-made-market"]
