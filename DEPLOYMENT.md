# Vital Tags - Deployment Guide

This guide covers deploying Vital Tags to production environments.

## Quick Start (Docker Compose)

1. **Clone and configure:**
   ```bash
   git clone <repository>
   cd vitaltags
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Start services:**
   ```bash
   docker compose up -d
   ```

3. **Run migrations:**
   ```bash
   docker compose --profile migrate up migrate
   ```

4. **Seed terminology:**
   ```bash
   docker compose exec api python -m app.services.terminology --seed
   ```

## Production Environment Variables

Update `.env` with production values:

```env
# API
SECRET_KEY=<generate-secure-random-key>
DATABASE_URL=postgresql+psycopg://user:password@db:5432/vitaltags
MAGICLINK_FROM=noreply@yourdomain.com
BASE_URL=https://api.yourdomain.com
PUBLIC_CDN_BASE=https://yourdomain.com

# S3 Storage (use AWS S3, CloudFlare R2, or similar)
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY=<your-access-key>
S3_SECRET_KEY=<your-secret-key>
S3_BUCKET=vitaltags-prod
S3_PUBLIC_BASE=https://cdn.yourdomain.com

# Web
NEXT_PUBLIC_API_BASE=https://api.yourdomain.com
NEXT_PUBLIC_CDN_BASE=https://yourdomain.com
```

## SSL/TLS Configuration

1. **Obtain certificates** (Let's Encrypt recommended):
   ```bash
   certbot certonly --webroot -w /var/www/html -d yourdomain.com -d api.yourdomain.com
   ```

2. **Update NGINX config** in `infra/nginx/default.conf`:
   - Uncomment HTTPS server block
   - Update certificate paths
   - Add redirect from HTTP to HTTPS

## Production Deployment Options

### Option 1: Single Server (Docker Compose)

Best for small to medium deployments:

```bash
# Production compose file
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Option 2: Kubernetes

For scalable cloud deployments:

```yaml
# See k8s/ directory for Kubernetes manifests
kubectl apply -f k8s/
```

### Option 3: Cloud Platforms

#### AWS ECS/Fargate
- Use provided Docker images
- Configure ALB for load balancing
- Use RDS for PostgreSQL
- Use ElastiCache for Redis
- Use S3 for file storage

#### Google Cloud Run
- Deploy API and web as separate Cloud Run services
- Use Cloud SQL for PostgreSQL
- Use Memorystore for Redis
- Use Cloud Storage for files

#### Azure Container Instances
- Deploy using container groups
- Use Azure Database for PostgreSQL
- Use Azure Cache for Redis
- Use Azure Blob Storage for files

## Database Setup

### PostgreSQL Configuration

For production, tune PostgreSQL settings:

```sql
-- postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
max_connections = 200
```

### Backup Strategy

1. **Automated backups:**
   ```bash
   # Daily backup script
   pg_dump -h db -U postgres vitaltags | gzip > backup-$(date +%Y%m%d).sql.gz
   ```

2. **S3 backup storage:**
   ```bash
   aws s3 cp backup-$(date +%Y%m%d).sql.gz s3://your-backup-bucket/
   ```

## Monitoring and Alerting

### Health Checks

All services expose health endpoints:
- API: `GET /health`
- Web: `GET /api/health`
- NGINX: `GET /nginx-health`

### Metrics Collection

Configure with Prometheus/Grafana:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'vitaltags-api'
    targets: ['api:8000']
  - job_name: 'vitaltags-web'
    targets: ['web:3000']
```

### Log Aggregation

Use ELK stack or similar:
- Centralized logging with Elasticsearch
- Log parsing with Logstash
- Visualization with Kibana

## Security Considerations

### Network Security
- Use HTTPS everywhere
- Configure proper CORS policies
- Implement rate limiting
- Use VPN for database access

### Data Protection
- Enable database encryption at rest
- Use encrypted S3 buckets
- Implement proper backup encryption
- Regular security audits

### Access Control
- Principle of least privilege
- Regular key rotation
- Multi-factor authentication for admin access
- Security monitoring and alerting

## Performance Optimization

### CDN Configuration

Use CloudFlare or AWS CloudFront:
- Cache emergency pages aggressively
- Enable compression
- Optimize for global distribution

### Database Optimization
- Regular VACUUM and ANALYZE
- Proper indexing for search queries
- Connection pooling
- Read replicas for scaling

### Application Performance
- Enable Redis caching
- Optimize QR code generation
- Compress static assets
- Monitor response times

## Compliance

### GDPR Compliance
- Data retention policies configured
- User consent tracking implemented
- Right to erasure functionality
- Privacy by design principles

### Medical Data Security
- HIPAA-ready architecture (where applicable)
- Audit logging for all data access
- Encryption in transit and at rest
- Secure data export capabilities

## Disaster Recovery

### Backup Strategy
1. Daily database backups
2. S3 file backups
3. Configuration backups
4. Infrastructure as Code

### Recovery Procedures
1. Database restore process
2. File restore from S3
3. Service restart procedures
4. DNS failover configuration

## Scaling

### Horizontal Scaling
- Multiple API instances behind load balancer
- Database read replicas
- Redis cluster for high availability
- CDN for global performance

### Vertical Scaling
- Monitor resource usage
- Scale database resources
- Increase container limits
- Optimize memory usage

## Troubleshooting

### Common Issues

1. **QR codes not generating:**
   - Check S3 connectivity
   - Verify bucket permissions
   - Check logs for errors

2. **Slow emergency page loading:**
   - Verify CDN configuration
   - Check database query performance
   - Monitor network connectivity

3. **Authentication issues:**
   - Verify email service configuration
   - Check JWT token expiration
   - Validate magic link generation

### Debug Commands

```bash
# Check service status
docker compose ps

# View logs
docker compose logs api
docker compose logs web

# Database connectivity
docker compose exec api python -c "from app.db import engine; print(engine.execute('SELECT 1'))"

# Redis connectivity
docker compose exec redis redis-cli ping
```

## Support

For deployment support:
- Check GitHub Issues
- Review documentation
- Contact support team

Remember: This system handles medical information. Ensure all deployments meet relevant regulatory and security requirements for your jurisdiction.