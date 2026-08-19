# MenuGo Developer Onboarding Guide

## 1. Repository Layout

- [menugo-backends](menugo-backends): backend API and services
- [menugo-frontend](menugo-frontend): React/Vite frontend
- [docs](docs): architecture, deployment, and technical documentation
## 2. Prerequisites
- Node.js 18+
- npm 9+
- Git
- a local or remote PostgreSQL database
- Redis for caching and queue features

## 3. Initial Setup

### Backend

```bash
cd menugo-backends
npm install
```

### Frontend

```bash
cd menugo-frontend
npm install
```

## 4. Running the Project

### Backend

```bash
cd menugo-backends
npm run dev
```

### Frontend

```bash
cd menugo-frontend
npm run dev
```

## 5. Useful Commands

### Backend

- npm test
- npm run lint
- npm run dev
- npm run migrate

### Frontend

- npm run build
- npm run dev
- npm run preview

## 6. Development Workflow

1. create a feature branch
2. make changes in the relevant backend or frontend folders
3. run relevant tests
4. update docs if behavior changes
5. open a pull request with a clear summary

## 7. Where to Start

- backend route definitions: [menugo-backends/src/routes](menugo-backends/src/routes)
- backend business logic: [menugo-backends/src/controllers](menugo-backends/src/controllers)
- frontend screens and components: [menugo-frontend/src](menugo-frontend/src)
- API docs: [menugo-backends/docs/api-docs.html](menugo-backends/docs/api-docs.html)

## 8. Common Gotchas

- environment variables must be configured before starting the backend
- Redis and database connectivity are required for full functionality
- upload routes depend on file storage configuration
- auth routes require valid JWT settings
