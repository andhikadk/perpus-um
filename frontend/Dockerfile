# Multi-stage build
# Stage 1: Copy and prepare frontend files
FROM node:18-alpine as builder

WORKDIR /app

# Copy frontend files
COPY . .

# Install dependencies if package.json exists (for any build tools)
RUN if [ -f package.json ]; then npm install && npm run build 2>/dev/null || true; fi

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy frontend files from builder stage
COPY --from=builder /app /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/index.html || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
