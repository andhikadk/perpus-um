# Docker Setup Guide

Panduan lengkap untuk menjalankan seluruh aplikasi Perpustakaan BALQIS menggunakan Docker.

## Prerequisites

Pastikan Anda sudah menginstal:
- [Docker](https://www.docker.com/products/docker-desktop) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0+)

## Quick Start

### 1. Clone dan Setup Environment

```bash
# Clone repository
git clone <repository-url>
cd project_balqis

# Copy .env file dari template
cp .env.example .env

# Edit .env dengan konfigurasi Anda (terutama SMTP dan JWT_SECRET)
nano .env
```

### 2. Build dan Jalankan Services

```bash
# Build images dan start all services
docker-compose up -d

# Atau untuk development dengan logs
docker-compose up
```

### 3. Inisialisasi Database (Pertama Kali)

Database akan otomatis diinisialisasi saat container MySQL startup. Jika perlu reinisialisasi:

```bash
# Stop dan remove containers
docker-compose down -v

# Start kembali (akan reinisialisasi database)
docker-compose up -d
```

### 4. Akses Aplikasi

- **Frontend**: http://localhost (atau port yang dikonfigurasi di FRONTEND_PORT)
- **Backend API**: http://localhost:3000/api (atau BACKEND_PORT)
- **MySQL Database**: localhost:3306 (atau port yang dikonfigurasi di DB_PORT)

Default credentials untuk admin login:
- Email: `admin@gmail.com`
- Password: `admin`

## Services Overview

### 1. Database (MySQL)
- **Image**: `mysql:8.0-alpine`
- **Port**: 3306 (configurable)
- **Volume**: `mysql_data` (persistent storage)
- **Health Check**: Active

### 2. Backend (Node.js/Express)
- **Image**: Built from `./backend/Dockerfile`
- **Port**: 3000 (configurable)
- **Volume**:
  - `./backend` (source code)
  - `backend_uploads` (file uploads)
- **Dependencies**: Depends on database being healthy
- **Health Check**: Checks `/health` endpoint

### 3. Frontend (Nginx)
- **Image**: Built from `./frontend/Dockerfile`
- **Port**: 80 (configurable)
- **Configuration**: `nginx.conf` untuk proxy API requests
- **Dependencies**: Depends on backend service

## Common Commands

### View Status dan Logs

```bash
# View status semua services
docker-compose ps

# View logs dari semua services
docker-compose logs -f

# View logs dari specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Stop dan Start

```bash
# Stop all services (keep data)
docker-compose stop

# Start services
docker-compose start

# Stop dan remove all (keep data)
docker-compose down

# Stop dan remove everything including data
docker-compose down -v
```

### Rebuild Images

```bash
# Rebuild saat ada perubahan code
docker-compose build

# Rebuild dan restart
docker-compose up -d --build
```

### Execute Commands

```bash
# Execute command di backend container
docker-compose exec backend npm install
docker-compose exec backend npm run dev

# MySQL CLI access
docker-compose exec db mysql -u balqis_user -p joki_balqis_library_app

# Shell access
docker-compose exec backend sh
docker-compose exec db sh
```

## Configuration

### Environment Variables (.env)

```env
# Database
DB_HOST=db                          # Host MySQL (default: db)
DB_PORT=3306                        # Port MySQL
DB_NAME=joki_balqis_library_app     # Database name
DB_USER=balqis_user                 # MySQL user
DB_PASSWORD=balqis_password         # MySQL password
DB_ROOT_PASSWORD=rootpassword       # MySQL root password

# Node.js
NODE_ENV=production                 # atau development

# Ports
BACKEND_PORT=3000                   # Backend port
FRONTEND_PORT=80                    # Frontend port

# Security
JWT_SECRET=your_secure_key_here     # WAJIB: Ganti dengan key yang aman!

# Email (SMTP)
SMTP_HOST=smtp.zeptomail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASSWORD=your_password
SMTP_FROM=noreply@perpustakaan.ac.id
```

### Nginx Configuration

File `frontend/nginx.conf` mengkonfigurasi:
- Static file serving dengan caching
- API proxy ke backend
- SPA fallback untuk routing
- Compression dan security headers

## Development Mode

Untuk development dengan hot-reload:

```bash
# Modify backend service di docker-compose.yml:
# Uncomment atau ganti command dengan:
# command: npm run dev

docker-compose up
```

## Production Deployment

### Pre-deployment Checklist

```bash
# 1. Update .env dengan production values
nano .env

# Key things to change:
# - JWT_SECRET: Generate secure random key
# - DB_PASSWORD: Use strong password
# - SMTP credentials: Production email service
# - NODE_ENV=production

# 2. Build production images
docker-compose build

# 3. Test locally first
docker-compose up -d
# Test application...

# 4. Prepare for cloud deployment
# Export images atau push to registry
```

### Docker Image Management

```bash
# Save images untuk transfer
docker save balqis_backend:latest -o backend.tar
docker save balqis_frontend:latest -o frontend.tar

# Load images di server lain
docker load -i backend.tar
docker load -i frontend.tar
```

### Using Docker Registry

```bash
# Tag images
docker tag balqis_backend:latest myregistry.azurecr.io/balqis_backend:latest
docker tag balqis_frontend:latest myregistry.azurecr.io/balqis_frontend:latest

# Push to registry
docker push myregistry.azurecr.io/balqis_backend:latest
docker push myregistry.azurecr.io/balqis_frontend:latest

# Update docker-compose.yml image references
# Kemudian deploy dengan:
docker-compose pull
docker-compose up -d
```

## Troubleshooting

### Backend tidak bisa connect ke database

```bash
# Check MySQL health
docker-compose exec db mysqladmin ping -ubalqis_user -pbalqis_password

# Check logs
docker-compose logs db
docker-compose logs backend
```

### Frontend tidak bisa akses API

```bash
# Verify backend is running
docker-compose ps

# Check Nginx logs
docker-compose logs frontend

# Test backend directly
curl http://localhost:3000/api/members
```

### Port sudah terpakai

```bash
# Ganti port di .env
FRONTEND_PORT=8080
BACKEND_PORT=3001
DB_PORT=3307

# Atau cari proses yang pakai port
lsof -i :80
# Kill process jika diperlukan
kill -9 <PID>
```

### Database tidak terinisialisasi

```bash
# Remove volume dan restart
docker-compose down -v
docker-compose up -d

# Atau manual initialize
docker-compose exec db mysql -uroot -p<root_password> < database/schema.sql
```

## Performance Tips

1. **Use named volumes** untuk persistent data
2. **Enable BuildKit** untuk faster builds: `DOCKER_BUILDKIT=1`
3. **Optimize layers** dalam Dockerfile
4. **Use Alpine images** untuk smaller footprint
5. **Configure resource limits** di docker-compose.yml

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## Security Best Practices

1. ✅ **Ganti default credentials** di .env
2. ✅ **Generate strong JWT_SECRET** - minimum 32 characters
3. ✅ **Use .env.example** tanpa secrets
4. ✅ **Don't commit .env** - add to .gitignore
5. ✅ **Use environment variables** untuk sensitive data
6. ✅ **Regular updates** `docker-compose pull` untuk base images
7. ✅ **Scan images** untuk vulnerabilities: `docker scan <image>`

## Monitoring

### View container stats

```bash
# Real-time stats
docker stats

# Specific container
docker stats balqis_backend
```

### View event logs

```bash
docker-compose logs --tail 50 -f
```

### Health status

```bash
docker-compose ps
# Check STATUS column untuk (healthy) indicators
```

## Cleanup

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Full cleanup (WARNING: Removes all dangling resources)
docker system prune -a
```

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Best practices for writing Dockerfiles](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Compose file specification](https://docs.docker.com/compose/compose-file/)

## Support

Untuk masalah atau pertanyaan:
1. Check logs: `docker-compose logs -f`
2. Verify configuration di .env
3. Ensure ports tidak conflict
4. Check Docker daemon berjalan
5. Update Docker ke version terbaru

---

**Last Updated**: 2025
**Maintained by**: Development Team
