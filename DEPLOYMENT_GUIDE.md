# Deployment Guide for Udyam Registration System

This guide covers deploying the dynamic form system with proper separation of concerns.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Scraper      │
│   (React/Vite)  │◄──►│   (Node.js)     │◄──►│   (TypeScript)  │
│   Port: 5173    │    │   Port: 7777    │    │   Scheduled     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Deployment Options

### Option 1: Separate Services (Recommended)

#### 1. Scraper Deployment
```bash
# Deploy scraper as a separate service
cd scraper
npm install
npm run build

# Run as scheduled job (cron, GitHub Actions, etc.)
npm run scrape
```

#### 2. Backend Deployment
```bash
# Deploy backend API
cd backend
npm install
npm run build

# Set environment variables
export SCHEMA_PATH=/shared/schemas
export PORT=7777
export CORS_ORIGIN=https://your-frontend-domain.com

# Start server
npm start
```

#### 3. Frontend Deployment
```bash
# Deploy frontend
cd frontend
npm install
npm run build

# Deploy to Vercel/Netlify/static hosting
```

### Option 2: Monolithic Deployment

If you prefer to deploy everything together:

```bash
# Create a deployment script
#!/bin/bash
cd scraper && npm install && npm run scrape
cd ../backend && npm install && npm start &
cd ../frontend && npm install && npm run build
```

## Environment Configuration

### Backend Environment Variables
```bash
# .env file for backend
PORT=7777
CORS_ORIGIN=http://localhost:5173
SCHEMA_PATH=../scraper/output
DATABASE_URL=your_database_url
```

### Frontend Environment Variables
```bash
# .env file for frontend
VITE_API_URL=http://localhost:7777/api/v1
VITE_API_BASE_URL=http://localhost:7777/api/v1
```

## Production Deployment

### 1. Docker Deployment

#### Backend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 7777
CMD ["npm", "start"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

### 2. Cloud Deployment

#### Heroku
```bash
# Backend
heroku create udyam-backend
heroku config:set SCHEMA_PATH=/app/shared/schemas
git push heroku main

# Frontend
heroku create udyam-frontend
git push heroku main
```

#### Railway
```bash
# Deploy backend
railway login
railway init
railway up

# Deploy frontend
railway login
railway init
railway up
```

#### Vercel (Frontend)
```bash
# Deploy frontend to Vercel
npm install -g vercel
vercel --prod
```

## Schema Management

### Development
- Scraper runs locally and outputs to `scraper/output/`
- Backend reads from relative path `../scraper/output/`

### Production
- Scraper runs as scheduled job
- Outputs to shared storage (S3, database, etc.)
- Backend reads from `SCHEMA_PATH` environment variable

### Schema Update Process
1. **Development**: Run scraper manually
2. **Staging**: Automated scraper runs daily
3. **Production**: Automated scraper runs weekly

## Monitoring and Logging

### Backend Logging
```javascript
// Add to backend
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Frontend Error Tracking
```javascript
// Add to frontend
window.addEventListener('error', (event) => {
  console.error('Frontend error:', event.error);
  // Send to error tracking service
});
```

## Security Considerations

### Backend Security
```javascript
// Add security middleware
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

### Frontend Security
```javascript
// Add CSP headers
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'"
    }
  }
});
```

## Performance Optimization

### Backend
- Enable compression
- Add caching for schema data
- Use connection pooling for database

### Frontend
- Code splitting
- Lazy loading
- Image optimization

## Backup and Recovery

### Schema Backup
```bash
# Backup schema files
cp scraper/output/*.json backup/schemas/

# Restore schema files
cp backup/schemas/*.json scraper/output/
```

### Database Backup
```bash
# Backup database
pg_dump your_database > backup/database.sql

# Restore database
psql your_database < backup/database.sql
```

## Troubleshooting

### Common Issues

1. **Schema not loading**
   - Check `SCHEMA_PATH` environment variable
   - Verify file permissions
   - Check file paths

2. **CORS errors**
   - Update `CORS_ORIGIN` in backend
   - Check frontend API URL

3. **Database connection issues**
   - Verify `DATABASE_URL`
   - Check network connectivity
   - Verify database credentials

### Debug Commands
```bash
# Check backend logs
tail -f backend/logs/app.log

# Check frontend build
npm run build --debug

# Test API endpoints
curl http://localhost:7777/api/v1/schema/form-schema
```

## Conclusion

This deployment strategy provides:
- **Scalability**: Each service can scale independently
- **Maintainability**: Clear separation of concerns
- **Reliability**: Proper error handling and monitoring
- **Security**: Environment-specific configurations
- **Flexibility**: Easy to update and deploy individual components

Choose the deployment option that best fits your infrastructure and requirements.
