# MenuGo Technical Report

## 1. Project Overview

MenuGo is a digital menu and restaurant management platform designed for restaurants that want a modern, web-based ordering and menu experience. The repository contains two main parts:

- Backend API: [menugo-backends](menugo-backends)
- Frontend application: [menugo-frontend](menugo-frontend)

The solution covers restaurant onboarding, menu management, order handling, QR-based customer access, staff workflows, analytics, reviews, coupons, inventory monitoring, notifications, and support tickets.

## 2. Objective

The goal of the project is to provide a full-stack SaaS experience that allows restaurants to:

- create and manage restaurant profiles
- publish digital menus with categories and items
- accept and track customer orders
- manage tables and waitstaff workflows
- generate QR codes for customer access
- analyze sales, menu performance, and operations
- support customer reviews and coupons
- operate with a secure and documented API layer

## 3. Architecture Summary

### 3.1 Backend

The backend is built with Node.js and Express and is organized under [menugo-backends/src](menugo-backends/src).

Key areas:

- app initialization and middleware: [menugo-backends/src/app.js](menugo-backends/src/app.js)
- routes and versioned API mounting: [menugo-backends/src/routes/index.js](menugo-backends/src/routes/index.js)
- controllers for business logic: [menugo-backends/src/controllers](menugo-backends/src/controllers)
- models and database access: [menugo-backends/src/models](menugo-backends/src/models)
- services for integrations: [menugo-backends/src/services](menugo-backends/src/services)
- validation rules: [menugo-backends/src/validations](menugo-backends/src/validations)
- utilities and logging: [menugo-backends/src/utils](menugo-backends/src/utils)

### 3.2 Frontend

The frontend is a Vite-based React application under [menugo-frontend/src](menugo-frontend/src). It provides the customer and staff views for interacting with the platform.

Key areas:

- main app shell and routing: [menugo-frontend/src](menugo-frontend/src)
- shared UI components: [menugo-frontend/src/components](menugo-frontend/src/components)
- pages and screens: [menugo-frontend/src/pages](menugo-frontend/src/pages)
- services and API integration: [menugo-frontend/src/services](menugo-frontend/src/services)

## 4. Functional Modules

### 4.1 Authentication and User Management

The backend exposes authentication routes for registration, login, refresh tokens, password recovery, and email verification. These routes are defined in [menugo-backends/src/routes/authRoutes.js](menugo-backends/src/routes/authRoutes.js).

Primary capabilities:

- user signup and login
- JWT-based authentication
- password recovery workflow
- protected user and staff endpoints

### 4.2 Restaurant Management

Restaurants are the central entity of the platform. The restaurant module supports:

- restaurant creation and editing
- table management
- public restaurant metadata access
- owner/admin access controls

Relevant routes are in [menugo-backends/src/routes/restaurantRoutes.js](menugo-backends/src/routes/restaurantRoutes.js) and [menugo-backends/src/routes/tableRoutes.js](menugo-backends/src/routes/tableRoutes.js).

### 4.3 Menu Management

The menu system supports categories, menu items, and customer-facing visibility. The menu routes are implemented in [menugo-backends/src/routes/menuRoutes.js](menugo-backends/src/routes/menuRoutes.js).

Features include:

- public menu browsing
- category management
- item creation and updates
- image support for menu items

### 4.4 Orders and Checkout

Orders are handled through [menugo-backends/src/routes/orderRoutes.js](menugo-backends/src/routes/orderRoutes.js).

Capabilities include:

- create order
- retrieve order by ID or restaurant
- update status
- cancel order

### 4.5 Tables and QR Codes

The QR and tables modules support dine-in access and customer interaction. Relevant routes are in [menugo-backends/src/routes/qrRoutes.js](menugo-backends/src/routes/qrRoutes.js) and [menugo-backends/src/routes/tableRoutes.js](menugo-backends/src/routes/tableRoutes.js).

Capabilities include:

- generate restaurant and table QR codes
- record scan events
- inspect QR analytics

### 4.6 Staff and Waiter Workflow

Staff and waiter functionality lives in [menugo-backends/src/routes/staffRoutes.js](menugo-backends/src/routes/staffRoutes.js) and [menugo-backends/src/routes/waiterRoutes.js](menugo-backends/src/routes/waiterRoutes.js).

This covers:

- staff listing and role management
- waiter dashboard access
- shift start and end logic
- notifications and call requests

### 4.7 Analytics, Reports, and Reviews

The platform includes analytics and reporting modules in [menugo-backends/src/routes/analyticsRoutes.js](menugo-backends/src/routes/analyticsRoutes.js) and [menugo-backends/src/routes/reportRoutes.js](menugo-backends/src/routes/reportRoutes.js).

The platform also manages customer reviews and coupons through [menugo-backends/src/routes/reviewRoutes.js](menugo-backends/src/routes/reviewRoutes.js) and [menugo-backends/src/routes/couponRoutes.js](menugo-backends/src/routes/couponRoutes.js).

## 5. Technology Stack

### 5.1 Backend Stack

- Node.js
- Express.js
- Sequelize ORM
- PostgreSQL-compatible database support
- Redis
- JWT authentication
- Multer and Cloudinary for uploads
- Socket.io for real-time features
- Nodemailer for email workflows
- Stripe for payments

### 5.2 Frontend Stack

- React 18
- Vite
- Tailwind CSS
- React Router
- React Query
- Zustand
- Socket.io client
- Recharts

## 6. Data and Persistence Model

The backend uses models and migrations to organize restaurant data, menu content, orders, staff, subscriptions, support tickets, and other operational records.

Relevant database assets are in:

- [menugo-backends/database.sql](menugo-backends/database.sql)
- [menugo-backends/database-postgres.sql](menugo-backends/database-postgres.sql)
- [menugo-backends/db-migrations](menugo-backends/db-migrations)

This indicates a relational design with tables for restaurants, users, orders, menus, tables, staff, subscriptions, tickets, and support data.

## 7. Security Considerations

The backend includes middleware and security patterns to protect the API:

- CORS configuration in [menugo-backends/src/app.js](menugo-backends/src/app.js)
- rate limiting in [menugo-backends/src/middleware](menugo-backends/src/middleware)
- authentication and authorization middleware
- sanitization of sensitive query parameters in request logging
- static file and upload handling with controlled routes

These controls help reduce the risk of common web application issues such as open CORS policies, excessive logging of sensitive data, and unauthorized access to protected routes.

## 8. API and Documentation

The backend exposes a documented API surface through:

- [menugo-backends/docs/api-docs.html](menugo-backends/docs/api-docs.html)
- [menugo-backends/docs/api-docs.json](menugo-backends/docs/api-docs.json)
- [menugo-backends/src/routes/index.js](menugo-backends/src/routes/index.js)

This documentation covers the major resource groups and supports both human-readable browsing and machine-readable consumption.

## 9. Testing and Quality

The repository includes automated tests under [menugo-backends/tests](menugo-backends/tests), including unit and integration coverage for key backend behavior.

Examples include:

- menu controller logic
- order controller behavior
- QR controller behavior
- database lifecycle and schema helpers
- API documentation route validation

## 10. Deployment and Operations

The project includes deployment and operational scripts for local and hosted environments, including:

- [menugo-backends/ecosystem.config.js](menugo-backends/ecosystem.config.js)
- [menugo-backends/setupRailway.bat](menugo-backends/setupRailway.bat)
- [menugo-backends/setupRailway.sh](menugo-backends/setupRailway.sh)
- [menugo-backends/RAILWAY_SETUP.md](menugo-backends/RAILWAY_SETUP.md)

This suggests the application is intended to run in a cloud or container-friendly environment with process management and database-backed deployment workflows.

## 11. Key Strengths

- full-stack restaurant management solution
- clear separation between backend and frontend layers
- modular route and controller structure
- rich set of business modules beyond basic CRUD
- API documentation available for integration and onboarding
- test coverage for core backend flows

## 12. Risks and Improvement Areas

Potential areas for improvement include:

- expanding API examples and request/response schemas
- formalizing OpenAPI/Swagger generation instead of hand-built docs
- improving documentation for environment variables and deployment steps
- adding more end-to-end tests for checkout, staff workflow, and QR flows
- hardening monitoring and observability for production deployments

## 13. Conclusion

MenuGo is a feature-rich restaurant management platform with a strong backend foundation and a frontend experience built around digital menu interaction. The current implementation already supports core SaaS functionality, and the addition of API documentation and a technical report provides a clearer foundation for onboarding, integration, and future maintenance.
