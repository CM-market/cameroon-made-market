# syntax=docker/dockerfile:1.4

# Stage 1: Build
FROM rust:1.86-alpine AS builder

WORKDIR /app

# Install required build dependencies
RUN apk update && apk add --no-cache \
    build-base \
    pkgconf \
    musl-dev \
    ca-certificates \
    postgresql-dev \
    openssl-libs-static \
    musl-utils && \
    rm -rf /var/cache/apk/*

# Set environment for static linking
ENV RUSTFLAGS="-C target-feature=+crt-static"
ENV PKG_CONFIG_ALL_STATIC=1
ENV OPENSSL_STATIC=1
ENV LIBPQ_STATIC=1

# Copy Cargo files and source
COPY Cargo.toml Cargo.lock ./
COPY . .

# Build for musl target
RUN cargo build --release --target x86_64-unknown-linux-musl

# Stage 2: Runtime using distroless
FROM gcr.io/distroless/static-debian12:latest

WORKDIR /app

# Copy the static binary
COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/cameroon-made-market /usr/local/bin/cameroon-made-market

# Expose the port
EXPOSE 8080

# Set the entrypoint
ENTRYPOINT ["/usr/local/bin/cameroon-made-market"]