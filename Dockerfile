# Stage 1: Build React Client Application
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci

# Copy full application source code
COPY . .

# Build production assets into /app/dist
RUN npm run build

# Stage 2: Production Nginx Web Server
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP ports
EXPOSE 80 5173

CMD ["nginx", "-g", "daemon off;"]
