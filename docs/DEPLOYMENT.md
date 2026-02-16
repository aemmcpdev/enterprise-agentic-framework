# Deployment Guide

This guide covers deploying the Enterprise Agentic Framework (EAF) in production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Docker Compose (Development)](#docker-compose-development)
- [Docker Compose (Production)](#docker-compose-production)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Cloud Deployments](#cloud-deployments)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Monitoring](#monitoring)
- [Scaling](#scaling)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Node.js | 20.x | 22.x LTS |
| PostgreSQL | 15 with pgvector | 16 with pgvector |
| Redis | 7.x | 7.2+ |
| RAM | 4 GB | 16 GB |
| CPU | 2 cores | 8 cores |
| Disk | 20 GB | 100 GB SSD |

### Required API Keys

At minimum, you need **one LLM provider** key:

- **Anthropic Claude** (recommended): `ANTHROPIC_API_KEY`
- **OpenAI GPT**: `OPENAI_API_KEY`
- **Ollama** (self-hosted, no key needed): Just set `OLLAMA_BASE_URL`

---

## Docker Compose (Development)

The fastest way to get started:

```bash
# Clone the repository
git clone https://github.com/your-org/enterprise-agentic-framework.git
cd enterprise-agentic-framework

# Copy environment file
cp .env.example .env
# Edit .env with your API keys

# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f server
```

### Services

| Service | Port | Description |
|---------|------|-------------|
| `postgres` | 5432 | PostgreSQL 16 with pgvector |
| `redis` | 6379 | Redis 7 for queues and caching |
| `server` | 3000 | EAF REST API + WebSocket |
| `dashboard` | 3001 | Next.js COMMAND AI Dashboard |

### Health Checks

```bash
# Server health
curl http://localhost:3000/health

# Server readiness
curl http://localhost:3000/ready

# Dashboard
curl http://localhost:3001
```

---

## Docker Compose (Production)

For production Docker Compose deployments, create a `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: eaf
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '2'

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: always
    deploy:
      resources:
        limits:
          memory: 512M

  server:
    build:
      context: .
      dockerfile: docker/Dockerfile.server
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/eaf
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      PORT: '3000'
      NODE_ENV: production
      ENCRYPTION_KEY: ${ENCRYPTION_KEY}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: always
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 2G
          cpus: '2'

  dashboard:
    build:
      context: .
      dockerfile: docker/Dockerfile.dashboard
    environment:
      NEXT_PUBLIC_API_URL: ${API_URL}
    depends_on:
      - server
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - '443:443'
      - '80:80'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt
    depends_on:
      - server
      - dashboard
    restart: always

volumes:
  postgres_data:
  redis_data:
```

Run with:
```bash
docker compose -f docker-compose.prod.yml up -d
```

---

## Kubernetes Deployment

### Namespace

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: eaf
```

### Server Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: eaf-server
  namespace: eaf
spec:
  replicas: 3
  selector:
    matchLabels:
      app: eaf-server
  template:
    metadata:
      labels:
        app: eaf-server
    spec:
      containers:
        - name: server
          image: your-registry/eaf-server:latest
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: eaf-secrets
                  key: database-url
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: eaf-secrets
                  key: redis-url
            - name: ANTHROPIC_API_KEY
              valueFrom:
                secretKeyRef:
                  name: eaf-secrets
                  key: anthropic-api-key
            - name: ENCRYPTION_KEY
              valueFrom:
                secretKeyRef:
                  name: eaf-secrets
                  key: encryption-key
          resources:
            requests:
              memory: "512Mi"
              cpu: "500m"
            limits:
              memory: "2Gi"
              cpu: "2000m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 30
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: eaf-server
  namespace: eaf
spec:
  selector:
    app: eaf-server
  ports:
    - port: 3000
      targetPort: 3000
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: eaf-server-hpa
  namespace: eaf
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: eaf-server
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

### Secrets

```bash
kubectl create secret generic eaf-secrets -n eaf \
  --from-literal=database-url='postgresql://user:pass@postgres:5432/eaf' \
  --from-literal=redis-url='redis://:pass@redis:6379' \
  --from-literal=anthropic-api-key='sk-ant-...' \
  --from-literal=encryption-key='your-32-byte-key'
```

---

## Cloud Deployments

### AWS

| Component | AWS Service |
|-----------|-------------|
| Server | ECS Fargate or EKS |
| Database | RDS PostgreSQL with pgvector |
| Redis | ElastiCache Redis |
| Dashboard | Amplify or CloudFront + S3 |
| Secrets | AWS Secrets Manager |
| Monitoring | CloudWatch |

### Google Cloud

| Component | GCP Service |
|-----------|-------------|
| Server | Cloud Run or GKE |
| Database | Cloud SQL PostgreSQL |
| Redis | Memorystore Redis |
| Dashboard | Cloud Run |
| Secrets | Secret Manager |
| Monitoring | Cloud Monitoring |

### Azure

| Component | Azure Service |
|-----------|---------------|
| Server | Container Apps or AKS |
| Database | Azure Database for PostgreSQL |
| Redis | Azure Cache for Redis |
| Dashboard | Static Web Apps |
| Secrets | Key Vault |
| Monitoring | Application Insights |

---

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/eaf` |
| `REDIS_URL` | Redis connection string | `redis://:pass@host:6379` |
| `ENCRYPTION_KEY` | Master encryption key (32+ chars) | `your-very-secure-encryption-key-here` |

### LLM Providers (at least one required)

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic Claude API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `OLLAMA_BASE_URL` | Ollama server URL (default: http://localhost:11434) |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `HOST` | 0.0.0.0 | Server host |
| `NODE_ENV` | development | Environment |
| `LOG_LEVEL` | info | Logging level (debug/info/warn/error) |
| `CORS_ORIGIN` | * | Allowed CORS origins |
| `MAX_CONCURRENT_AGENTS` | 10 | Max agents running simultaneously |

---

## Database Setup

The Docker Compose setup auto-runs `docker/init.sql`. For manual setup:

```bash
# Connect to PostgreSQL
psql -U eaf -d eaf

# Run the init script
\i docker/init.sql
```

### Tables Created

| Table | Purpose |
|-------|---------|
| `agents` | Agent configurations and status |
| `tasks` | Task submissions and results |
| `audit_log` | Immutable audit trail (hash-chained) |
| `memory_entries` | Agent memory with vector embeddings |
| `policies` | Governance policies |
| `metrics` | Time-series metrics |

### Migrations

For schema changes, use manual SQL migrations in `docker/migrations/`:

```bash
psql -U eaf -d eaf -f docker/migrations/001_add_column.sql
```

---

## Monitoring

### Health Endpoints

- `GET /health` — Basic health check (returns status, version, timestamp)
- `GET /ready` — Readiness check (returns true when all dependencies are connected)

### Metrics

EAF emits structured JSON logs that can be collected by any log aggregator:

```json
{
  "level": "info",
  "message": "Agent task completed",
  "agentId": "agt_abc123",
  "taskId": "tsk_def456",
  "duration_ms": 4523,
  "cost": 0.034,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Recommended Stack

- **Log Collection:** Fluentd/Fluent Bit → Elasticsearch → Kibana
- **Metrics:** Prometheus + Grafana
- **Alerts:** EAF built-in alerts → Slack/Email/Webhook

---

## Scaling

### Horizontal Scaling

The EAF server is stateless and can be scaled horizontally:

```bash
# Docker Compose
docker compose up -d --scale server=3

# Kubernetes
kubectl scale deployment eaf-server -n eaf --replicas=5
```

### Database Scaling

- **Read Replicas:** Use PostgreSQL read replicas for dashboard queries
- **Connection Pooling:** Use PgBouncer for connection pooling
- **Partitioning:** Partition audit_log and metrics tables by date

### Redis Scaling

- **Cluster Mode:** Use Redis Cluster for high availability
- **Separate Instances:** Use separate Redis instances for queues vs. caching

---

## Troubleshooting

### Common Issues

**Server won't start:**
```bash
# Check logs
docker compose logs server

# Verify database is ready
docker compose exec postgres pg_isready -U eaf

# Verify Redis is ready
docker compose exec redis redis-cli ping
```

**Agent errors:**
```bash
# Check server logs for agent errors
curl http://localhost:3000/api/v1/alerts

# Check audit trail
curl http://localhost:3000/api/v1/alerts/history
```

**High memory usage:**
```bash
# Check agent count
curl http://localhost:3000/api/v1/agents | jq '.agents | length'

# Reduce max concurrent agents
export MAX_CONCURRENT_AGENTS=5
```
