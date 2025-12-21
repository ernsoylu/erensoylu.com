# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copy only necessary files for build (avoid sensitive data)
COPY public ./public
COPY src ./src
COPY index.html ./
COPY tsconfig*.json ./
COPY vite.config.ts ./

# Build-time args (Vite reads env at build time)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_DEBUG

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_DEBUG=$VITE_DEBUG

RUN npm run build

# --- Runtime stage ---
FROM nginx:1.27-alpine

# Create non-root user for security
RUN addgroup -S nginx-app && adduser -S -G nginx-app nginx-app

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Set proper permissions for nginx-app user
RUN chown -R nginx-app:nginx-app /usr/share/nginx/html && \
    chown -R nginx-app:nginx-app /var/cache/nginx && \
    chown -R nginx-app:nginx-app /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx-app:nginx-app /var/run/nginx.pid

# Switch to non-root user
USER nginx-app

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

