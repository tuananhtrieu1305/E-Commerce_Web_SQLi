# ============================================================
# Stage 1: Build — Node 20 Alpine
# ============================================================
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files trước → cache npm install layer
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code → build
COPY . .
RUN npm run build

# ============================================================
# Stage 2: Serve — Nginx Alpine (nhẹ, production-ready)
# ============================================================
FROM nginx:alpine

# Copy build output vào Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy entrypoint script (inject runtime config)
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN sed -i 's/\r$//' /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

# Custom Nginx config cho SPA (React Router)
RUN echo 'server { \
    listen 3000; \
    root /usr/share/nginx/html; \
    index index.html; \
    resolver 127.0.0.11 valid=30s; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /uploads/ { \
        set $upstream http://backend-secure:8082; \
        proxy_pass $upstream$uri; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3000

# Dùng entrypoint script để inject BACKEND_URL vào runtime-env.js
ENTRYPOINT ["/docker-entrypoint.sh"]
