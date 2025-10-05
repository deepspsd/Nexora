# 🚀 NEXORA Backend Deployment Guide

Complete guide for deploying the MVP Agent backend to production.

## 📋 Table of Contents

1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Cloud Deployment](#cloud-deployment)
4. [Production Checklist](#production-checklist)
5. [Monitoring & Maintenance](#monitoring--maintenance)

---

## 🖥️ Local Development

### Quick Start

```bash
# 1. Navigate to backend directory
cd backend

# 2. Run startup script (Windows)
start.bat

# Or manually:
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### Development Server

```bash
# With auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# With custom workers
uvicorn main:app --reload --workers 4 --host 0.0.0.0 --port 8000
```

### Testing

```bash
# Run test script
python test_agent.py

# Run pytest (if tests are added)
pytest

# With coverage
pytest --cov=. --cov-report=html
```

---

## 🐳 Docker Deployment

### Build and Run with Docker

#### Option 1: Docker Compose (Recommended)

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

#### Option 2: Docker Commands

```bash
# Build image
docker build -t nexora-backend .

# Run container
docker run -d \
  --name nexora-backend \
  -p 8000:8000 \
  --env-file ../.env \
  -v $(pwd)/logs:/app/logs \
  -v $(pwd)/artifacts:/app/artifacts \
  nexora-backend

# View logs
docker logs -f nexora-backend

# Stop container
docker stop nexora-backend

# Remove container
docker rm nexora-backend
```

### Docker Configuration

**Dockerfile Features:**
- Python 3.9 slim base image
- System dependencies (gcc, g++, curl)
- Optimized layer caching
- Health check endpoint
- Non-root user (optional)

**docker-compose.yml Features:**
- Automatic restart
- Volume mounting for logs and artifacts
- Environment variable injection
- Network isolation
- Health checks

### Verify Docker Deployment

```bash
# Check container status
docker ps

# Test health endpoint
curl http://localhost:8000/health

# View logs
docker logs nexora-backend

# Execute commands in container
docker exec -it nexora-backend bash
```

---

## ☁️ Cloud Deployment

### AWS Deployment

#### Option 1: AWS ECS (Elastic Container Service)

1. **Push Docker image to ECR:**

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URL

# Tag image
docker tag nexora-backend:latest YOUR_ECR_URL/nexora-backend:latest

# Push image
docker push YOUR_ECR_URL/nexora-backend:latest
```

2. **Create ECS Task Definition:**

```json
{
  "family": "nexora-backend",
  "containerDefinitions": [
    {
      "name": "nexora-backend",
      "image": "YOUR_ECR_URL/nexora-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DEEPSEEK_API_KEY",
          "value": "your-key-here"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/nexora-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ],
  "requiresCompatibilities": ["FARGATE"],
  "networkMode": "awsvpc",
  "cpu": "512",
  "memory": "1024"
}
```

3. **Create ECS Service:**

```bash
aws ecs create-service \
  --cluster nexora-cluster \
  --service-name nexora-backend \
  --task-definition nexora-backend \
  --desired-count 2 \
  --launch-type FARGATE
```

#### Option 2: AWS EC2

```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Docker
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# Clone repository
git clone https://github.com/your-repo/nexora.git
cd nexora/backend

# Create .env file
nano .env
# Add your API keys

# Run with Docker Compose
docker-compose up -d

# Setup nginx reverse proxy (optional)
sudo yum install nginx -y
sudo nano /etc/nginx/conf.d/nexora.conf
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Google Cloud Platform (GCP)

#### Cloud Run Deployment

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/nexora-backend

# Deploy to Cloud Run
gcloud run deploy nexora-backend \
  --image gcr.io/YOUR_PROJECT_ID/nexora-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DEEPSEEK_API_KEY=your-key
```

### Azure Deployment

#### Azure Container Instances

```bash
# Login to Azure
az login

# Create resource group
az group create --name nexora-rg --location eastus

# Create container
az container create \
  --resource-group nexora-rg \
  --name nexora-backend \
  --image YOUR_ACR_URL/nexora-backend:latest \
  --dns-name-label nexora-backend \
  --ports 8000 \
  --environment-variables \
    DEEPSEEK_API_KEY=your-key \
    FIRECRAWL_API_KEY=your-key \
    E2B_API_KEY=your-key
```

### Heroku Deployment

```bash
# Login to Heroku
heroku login

# Create app
heroku create nexora-backend

# Set environment variables
heroku config:set DEEPSEEK_API_KEY=your-key
heroku config:set FIRECRAWL_API_KEY=your-key
heroku config:set E2B_API_KEY=your-key

# Deploy
git push heroku main

# Scale
heroku ps:scale web=1
```

### Railway Deployment

1. Connect GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

### Render Deployment

1. Create new Web Service on Render
2. Connect GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
6. Deploy

---

## ✅ Production Checklist

### Security

- [ ] API keys stored in environment variables (not hardcoded)
- [ ] HTTPS enabled (SSL/TLS certificate)
- [ ] CORS configured for specific origins only
- [ ] Rate limiting implemented
- [ ] JWT authentication enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Security headers configured

### Performance

- [ ] Database connection pooling
- [ ] Caching layer (Redis)
- [ ] CDN for static assets
- [ ] Gzip compression enabled
- [ ] Load balancing configured
- [ ] Auto-scaling enabled
- [ ] Resource limits set
- [ ] Monitoring configured

### Reliability

- [ ] Health checks configured
- [ ] Automatic restarts enabled
- [ ] Backup strategy in place
- [ ] Disaster recovery plan
- [ ] Error tracking (Sentry)
- [ ] Logging configured
- [ ] Alerting set up
- [ ] Uptime monitoring

### Configuration

```python
# main.py - Production settings

import os

# Environment
ENVIRONMENT = os.getenv("ENVIRONMENT", "production")

# CORS - Restrict to specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend-domain.com",
        "https://www.your-frontend-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Rate limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/mvpDevelopment")
@limiter.limit("10/hour")  # 10 requests per hour
async def mvp_development(...):
    ...
```

### Environment Variables

```env
# Production .env
ENVIRONMENT=production

# API Keys
DEEPSEEK_API_KEY=sk-or-v1-...
FIRECRAWL_API_KEY=fc-...
E2B_API_KEY=e2b_...

# Security
JWT_SECRET=your-secure-secret-here
SECRET_KEY=your-secret-key-here

# Database (if needed)
DATABASE_URL=postgresql://user:pass@host:5432/db

# Redis (for caching)
REDIS_URL=redis://host:6379

# Monitoring
SENTRY_DSN=https://...

# Logging
LOG_LEVEL=INFO
```

---

## 📊 Monitoring & Maintenance

### Logging

**Configure structured logging:**

```python
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
        }
        return json.dumps(log_data)

handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)
```

### Monitoring Tools

1. **Application Performance Monitoring (APM):**
   - New Relic
   - Datadog
   - AppDynamics

2. **Error Tracking:**
   - Sentry
   - Rollbar
   - Bugsnag

3. **Uptime Monitoring:**
   - UptimeRobot
   - Pingdom
   - StatusCake

4. **Log Management:**
   - ELK Stack (Elasticsearch, Logstash, Kibana)
   - Splunk
   - Papertrail

### Health Checks

```python
@app.get("/health")
async def health_check():
    """Comprehensive health check"""
    
    health_status = {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "checks": {}
    }
    
    # Check MVP Agent
    try:
        if mvp_agent:
            health_status["checks"]["mvp_agent"] = "ok"
        else:
            health_status["checks"]["mvp_agent"] = "not_initialized"
            health_status["status"] = "degraded"
    except Exception as e:
        health_status["checks"]["mvp_agent"] = f"error: {str(e)}"
        health_status["status"] = "unhealthy"
    
    # Check DeepSeek API
    try:
        await mvp_agent.deepseek.generate_code(
            prompt="test",
            max_tokens=10
        )
        health_status["checks"]["deepseek_api"] = "ok"
    except Exception as e:
        health_status["checks"]["deepseek_api"] = f"error: {str(e)}"
        health_status["status"] = "degraded"
    
    return health_status
```

### Backup Strategy

```bash
# Backup artifacts and logs
#!/bin/bash

BACKUP_DIR="/backups/nexora-$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Backup artifacts
tar -czf $BACKUP_DIR/artifacts.tar.gz /app/artifacts

# Backup logs
tar -czf $BACKUP_DIR/logs.tar.gz /app/logs

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR s3://your-backup-bucket/ --recursive

# Cleanup old backups (keep last 30 days)
find /backups -type d -mtime +30 -exec rm -rf {} \;
```

### Scaling

**Horizontal Scaling:**

```yaml
# kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nexora-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nexora-backend
  template:
    metadata:
      labels:
        app: nexora-backend
    spec:
      containers:
      - name: nexora-backend
        image: your-registry/nexora-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DEEPSEEK_API_KEY
          valueFrom:
            secretKeyRef:
              name: nexora-secrets
              key: deepseek-api-key
```

**Auto-scaling:**

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nexora-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nexora-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## 🔧 Troubleshooting

### Common Issues

**Issue: Container won't start**
```bash
# Check logs
docker logs nexora-backend

# Common causes:
# - Missing environment variables
# - Port already in use
# - Insufficient memory
```

**Issue: High memory usage**
```bash
# Monitor container resources
docker stats nexora-backend

# Solution: Increase memory limit in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 2G
```

**Issue: Slow response times**
```bash
# Check application logs
# Enable debug logging
# Monitor database queries
# Check external API response times
```

---

## 📞 Support

For deployment issues:
- Check logs first
- Review this guide
- Consult cloud provider documentation
- Contact support team

---

**Happy Deploying! 🚀**
