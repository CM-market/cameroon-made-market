# frontend/Dockerfile
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Set npm registry and increase timeout
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Update npm to the latest version (for improved dependency resolution)
RUN npm install -g npm@11.4.1

# Copy package.json and install dependencies (including devDependencies)
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps --include=dev

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom nginx configuration (optional, for routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port (default: 80)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]