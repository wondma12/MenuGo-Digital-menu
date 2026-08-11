# MenuGo Deployment Guide

## 1. Prerequisites

Before deployment, ensure the following are available:

- Node.js 18 or newer
- npm 9 or newer
- PostgreSQL or a compatible database service
- Redis instance
- environment variables configured for the backend
- optional frontend build output for static hosting

## 2. Backend Setup

### 2.1 Install dependencies

```bash
cd menugo-backends
npm install
```

### 2.2 Configure environment variables

Create a local environment file with values for:

- database connection details
- JWT secret
- Redis URL
- Stripe keys
- email service configuration
- CORS origins

### 2.3 Start the backend

```bash
npm start
```

For development:

```bash
npm run dev
```

### 2.4 Health check

```bash
curl http://localhost:3000/health
```

## 3. Frontend Setup

### 3.1 Install dependencies

```bash
cd menugo-frontend
npm install
```

### 3.2 Build the application

```bash
npm run build
```

### 3.3 Serve the built frontend

The frontend can be served via Vite in development or a static host in production.

## 4. Production Considerations

- run the backend behind a process manager such as PM2
- secure environment variables and secrets
- use managed PostgreSQL and Redis services where possible
- configure CORS for production origins only
- enable logging and monitoring
- set up backups for the database

## 5. Suggested Hosting Options

- backend: Render, Railway, Azure App Service, VPS
- frontend: Vercel, Netlify, Render, Azure Static Web Apps
- database: managed PostgreSQL
- cache: managed Redis

## 6. Operational Checklist

- health endpoint responds successfully
- API docs are reachable
- authentication works
- uploads are stored correctly
- email notifications are configured
- Stripe webhooks are configured if payments are active
