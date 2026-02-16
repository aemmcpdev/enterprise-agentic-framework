# API Reference

Complete API reference for the Enterprise Agentic Framework.

## Base URL

```
http://localhost:3000
```

## Authentication

Currently, EAF uses network-level security. API key authentication is planned for v0.2.0.

---

## Health & Status

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "version": "0.1.0"
}
```

### Readiness Check

```http
GET /ready
```

**Response:**
```json
{
  "ready": true
}
```

---

## Agents

### List Agents

```http
GET /api/v1/agents
```

**Response:**
```json
{
  "agents": [
    {
      "id": "agt_abc123",
      "name": "Research Agent",
      "role": "task",
      "status": "active",
      "model": "claude-sonnet-4-5-20250929",
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

### Get Agent

```http
GET /api/v1/agents/:id
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Agent ID (e.g., `agt_abc123`) |

**Response:**
```json
{
  "id": "agt_abc123",
  "name": "Research Agent",
  "role": "task",
  "status": "active",
  "model": "claude-sonnet-4-5-20250929",
  "systemPrompt": "You are a research agent...",
  "tools": ["http_request", "read_file"],
  "maxIterations": 20,
  "createdAt": "2025-01-15T10:00:00.000Z"
}
```

### Create Agent

```http
POST /api/v1/agents
Content-Type: application/json
```

**Body:**
```json
{
  "templateName": "research-agent",
  "overrides": {
    "model": "claude-haiku-4-5-20251001",
    "maxIterations": 30
  }
}
```

**Response (201):**
```json
{
  "id": "agt_xyz789",
  "name": "research-agent",
  "model": "claude-haiku-4-5-20251001",
  "status": "idle"
}
```

### Delete Agent

```http
DELETE /api/v1/agents/:id
```

**Response:**
```json
{
  "success": true
}
```

---

## Tasks

### Submit Task

```http
POST /api/v1/tasks
Content-Type: application/json
```

**Body:**
```json
{
  "agentId": "agt_abc123",
  "description": "Analyze the Q1 sales data and identify the top 3 trends"
}
```

**Response (201):**
```json
{
  "id": "tsk_def456",
  "agentId": "agt_abc123",
  "description": "Analyze the Q1 sales data...",
  "status": "pending",
  "createdAt": "2025-01-15T10:30:00.000Z"
}
```

### Get Task

```http
GET /api/v1/tasks/:id
```

**Response:**
```json
{
  "id": "tsk_def456",
  "agentId": "agt_abc123",
  "description": "Analyze the Q1 sales data...",
  "status": "completed",
  "result": {
    "findings": ["Trend 1: ...", "Trend 2: ...", "Trend 3: ..."],
    "confidence": 0.89
  },
  "createdAt": "2025-01-15T10:30:00.000Z",
  "completedAt": "2025-01-15T10:32:15.000Z"
}
```

### List Tasks

```http
GET /api/v1/tasks?agentId=agt_abc123&status=completed&limit=20
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `agentId` | string | Filter by agent ID |
| `status` | string | Filter by status (pending/running/completed/failed) |
| `limit` | number | Max results (default: 50) |

---

## Dashboard

### Get Dashboard Data

```http
GET /api/v1/dashboard
```

**Response:**
```json
{
  "baselines": {},
  "measurements": {},
  "deltas": {},
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### Get Dashboard Summary

```http
GET /api/v1/dashboard/summary
```

**Response:**
```json
{
  "totalAgents": 12,
  "activeAlerts": 2,
  "dashboardData": {}
}
```

---

## Alerts

### Get Active Alerts

```http
GET /api/v1/alerts
```

**Response:**
```json
{
  "alerts": [
    {
      "id": "evt_abc123",
      "ruleId": "rule_error_rate",
      "severity": "critical",
      "status": "firing",
      "title": "High Error Rate",
      "message": "error_rate > 0.1 (current: 0.15)",
      "firedAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get Alert History

```http
GET /api/v1/alerts/history
```

Returns all alerts (including resolved) sorted by most recent first.

### Acknowledge Alert

```http
POST /api/v1/alerts/:id/acknowledge
```

**Response:**
```json
{
  "success": true
}
```

### Resolve Alert

```http
POST /api/v1/alerts/:id/resolve
```

**Response:**
```json
{
  "success": true
}
```

---

## WebSocket

### Connection

```
ws://localhost:3000/ws
```

### Subscribe to Events

```json
{ "type": "subscribe", "event": "alert" }
{ "type": "subscribe", "event": "agent_status" }
{ "type": "subscribe", "event": "metric" }
{ "type": "subscribe", "event": "dashboard_update" }
```

### Unsubscribe

```json
{ "type": "unsubscribe", "event": "metric" }
```

### Event Messages

```json
{
  "type": "alert",
  "payload": {
    "id": "evt_abc123",
    "severity": "critical",
    "title": "High Error Rate"
  },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### Event Types

| Type | Description |
|------|-------------|
| `alert` | New alert fired or status changed |
| `agent_status` | Agent started, stopped, or errored |
| `metric` | Real-time metric update |
| `dashboard_update` | Dashboard data refresh |

---

## Error Responses

All endpoints return standard error responses:

```json
{
  "error": "Agent not found"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (invalid input) |
| 404 | Resource not found |
| 500 | Internal server error |
