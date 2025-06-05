# frontend/Dockerfile
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.12.3

# Set pnpm registry and increase timeout
RUN pnpm config set registry https://registry.npmjs.org/ && \
    pnpm config set fetch-retries 5 && \
    pnpm config set fetch-retry-mintimeout 20000 && \
    pnpm config set fetch-retry-maxtimeout 120000

# Copy package.json and lock file
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# Copy source code
COPY . .

# Build the React app
RUN pnpm run build

# Debug: List contents to verify build output
RUN ls -la /app

# Production stage
FROM nginx:alpine
# Copy build output (Vite defaults to 'dist')
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration (for React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf 

# Expose port (default: 80)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]