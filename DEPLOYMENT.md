# DataUniverse Deployment Guide

This guide covers deploying the DataUniverse LMS platform to production.

## Prerequisites

- Node.js 18+ and npm/yarn
- MySQL 8.0+ database
- AWS account (for S3 file storage, optional)
- Domain name and SSL certificate (for production)

## Architecture

- **Frontend**: React + Vite (static files)
- **Backend**: Node.js + Express (API server)
- **Database**: MySQL (via Prisma ORM)

## Environment Setup

### 1. Backend Environment Variables

Create `backend/.env` from `backend/.env.example`:

```bash
cd backend
cp .env.example .env
```

Required variables:
- `DATABASE_URL`: MySQL connection string
- `JWT_SECRET`: Strong random secret for JWT tokens
- `NODE_ENV`: Set to `production`
- `PORT`: Server port (default: 3001)
- `CORS_ORIGINS`: Comma-separated list of allowed frontend origins

### 2. Frontend Environment Variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Required variables:
- `VITE_API_BASE_URL`: Full URL to your backend API (e.g., `https://api.yourdomain.com/api`)

## Database Setup

### 1. Run Migrations

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate deploy
```

### 2. Seed Database (Optional)

```bash
npm run seed
```

## Building for Production

### Frontend

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Output will be in `dist/` directory
```

### Backend

```bash
cd backend

# Install dependencies
npm install

# Build TypeScript
npm run build

# Output will be in `dist/` directory
```

## Deployment Options

### Option 1: Traditional VPS/Server

#### Frontend (Nginx)

1. Copy `dist/` contents to `/var/www/DataUniverse`
2. Configure Nginx:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    root /var/www/DataUniverse;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

3. Enable SSL with Let's Encrypt:

```bash
sudo certbot --nginx -d yourdomain.com
```

#### Backend (PM2)

1. Install PM2:
```bash
npm install -g pm2
```

2. Start the backend:
```bash
cd backend
pm2 start dist/app.js --name DataUniverse-api
pm2 save
pm2 startup
```

3. Configure Nginx reverse proxy:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Option 2: Docker Deployment

#### Dockerfile (Frontend)

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Dockerfile (Backend)

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate
EXPOSE 3001
CMD ["node", "dist/app.js"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - CORS_ORIGINS=${CORS_ORIGINS}
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=${DB_ROOT_PASSWORD}
      - MYSQL_DATABASE=DataUniverse
    volumes:
      - db_data:/var/lib/mysql
    ports:
      - "3306:3306"

volumes:
  db_data:
```

### Option 3: Cloud Platforms

#### Vercel (Frontend)

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`
3. Set environment variable `VITE_API_BASE_URL`

#### Railway / Render (Backend)

1. Connect your GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically on push

#### AWS / GCP / Azure

- Use S3 + CloudFront for frontend
- Use EC2/App Engine/App Service for backend
- Use RDS/Cloud SQL for database

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (32+ characters, random)
- [ ] Enable HTTPS/SSL for all domains
- [ ] Configure CORS to only allow your frontend domain
- [ ] Set secure HTTP headers (helmet.js recommended)
- [ ] Enable database backups
- [ ] Use environment variables (never commit .env)
- [ ] Keep dependencies updated
- [ ] Enable rate limiting on API
- [ ] Set up monitoring and logging

## Monitoring

### Health Checks

- Frontend: `https://yourdomain.com`
- Backend: `https://api.yourdomain.com/health`

### Recommended Tools

- **Error Tracking**: Sentry, Rollbar
- **APM**: New Relic, Datadog
- **Uptime**: UptimeRobot, Pingdom
- **Logs**: CloudWatch, Loggly

## Performance Optimization

1. **Frontend**:
   - Enable gzip/brotli compression
   - Use CDN for static assets
   - Implement code splitting
   - Optimize images

2. **Backend**:
   - Enable database connection pooling
   - Add Redis for caching (optional)
   - Implement rate limiting
   - Use compression middleware

## Backup Strategy

1. **Database**: Daily automated backups
2. **Files**: S3 versioning enabled
3. **Code**: Git repository (GitHub/GitLab)

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check `CORS_ORIGINS` includes your frontend URL
2. **Database Connection**: Verify `DATABASE_URL` format
3. **JWT Errors**: Ensure `JWT_SECRET` is set and consistent
4. **Build Failures**: Check Node.js version (18+)

### Logs

- Backend: `pm2 logs DataUniverse-api`
- Frontend: Browser console + server logs

## Support

For issues or questions, check:
- GitHub Issues
- Documentation
- API Health endpoint: `/health`
