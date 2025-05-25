# frontend/Dockerfile
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

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