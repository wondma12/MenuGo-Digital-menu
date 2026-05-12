# MenuGo — API Design (RESTful)

Version: v1

Base URL: `/api/v1` (recommend mounting the routes under this prefix)

Auth: JWT bearer tokens. Public endpoints are documented per-route. Protected routes require `Authorization: Bearer <access_token>`.

Common query params

- `page` (integer) — pagination page (default 1)
- `limit` (integer) — items per page (default 20)
- `sort` (string) — e.g. `-created_at` for desc
- `q` (string) — full-text / search query

Error response format

```
{
  "status": "error",
  "message": "Short description",
  "errors": [ { "field":"fieldname", "message":"detail" } ]
}
```

Success response format

```
{
  "status": "success",
  "data": { ... }
}
```

Authentication flows

- Register: `POST /auth/register` — body: `{ email, password, full_name?, phone? }` — returns access token + optional refresh token cookie.
- Login: `POST /auth/login` — body: `{ email, password }` — returns `accessToken` and possibly `refreshToken`.
- Refresh token: `POST /auth/refresh-token` — body/cookie as implemented — returns new access token.
- Logout: `POST /auth/logout` — invalidates refresh token.
- Password reset: `POST /auth/forgot-password`, `POST /auth/reset-password`.
- Get current user: `GET /auth/me` (protected)

Authorization notes

- Role-based middleware exists (examples: `platform_admin`, `restaurant_admin`, `customer`, `waiter`).
- Many routes require `isRestaurantStaff`, `isWaiter`, `isRestaurantOwner`, or `restrictTo('platform_admin')`.

File uploads

- `POST /upload` — single file (field `file`) — returns uploaded file metadata.
- `POST /upload/multiple` — multiple files (field `files`).
- `DELETE /upload/:publicId(*)` — delete by cloud `publicId` (supports slashes).

Endpoints

1) /auth

- POST `/auth/register` — register new user
  - Body: `{ email, password, full_name?, phone?, role? }`
- POST `/auth/login` — login
  - Body: `{ email, password }`
- POST `/auth/refresh-token` — refresh access token
- POST `/auth/forgot-password` — request reset
- POST `/auth/reset-password` — reset password
- GET `/auth/verify-email/:token` — email verification
- POST `/auth/logout` — protected
- POST `/auth/change-password` — protected
- GET `/auth/me` — protected, returns current user
- PUT `/auth/profile` — protected, update profile

1) /users

- GET `/users` — platform_admin only — list users (pagination, filters)
- POST `/users` — platform_admin only — create user
- GET `/users/stats` — platform_admin only — statistics
- POST `/users/:id/toggle-status` — platform_admin only
- GET `/users/me/sessions` — list active sessions for current user
- DELETE `/users/me/sessions/:sessionId` — revoke a session
- POST `/users/me/avatar` — upload avatar (multipart)
- GET `/users/:id` — get user by id
- PUT `/users/:id` — update user
- DELETE `/users/:id` — delete user

1) /restaurants

- GET `/restaurants` — list restaurants (public)
- GET `/restaurants/:id` — get restaurant
- POST `/restaurants` — create restaurant (protected)
- PUT `/restaurants/:id` — update (isRestaurantOwner)
- DELETE `/restaurants/:id` — delete (isRestaurantOwner)
- PATCH `/restaurants/:id/status` — platform_admin only — change status
- POST `/restaurants/:id/verify` — platform_admin only
- GET `/restaurants/:id/dashboard` — isRestaurantOwner
- PUT `/restaurants/:id/settings` — isRestaurantOwner
- POST `/restaurants/:id/calls` — create customer call request
- GET `/restaurants/:id/reviews` — list reviews
- POST `/restaurants/:id/reviews` — create review (public or protected depending flow)
- GET `/restaurants/:id/tables` — isRestaurantStaff
- POST `/restaurants/:id/tables` — isRestaurantOwner

1) /menu

- GET `/menu/restaurant/:restaurantId` — public customer menu
- GET `/menu/categories/:restaurantId` — isRestaurantStaff
- POST `/menu/categories/:restaurantId` — create category
- PUT `/menu/categories/:id` — update category
- DELETE `/menu/categories/:id` — delete
- PATCH `/menu/categories/:id/status` — toggle status
- GET `/menu/items/:restaurantId` — get items
- GET `/menu/item/:id` — get item by id
- POST `/menu/items/:restaurantId` — create item (multipart image)
- PUT `/menu/items/:id` — update item (multipart)
- DELETE `/menu/items/:id` — delete item
- PATCH `/menu/items/:id/toggle` — toggle availability
- POST `/menu/option-groups/:restaurantId` — create option group
- POST `/menu/option-groups/:groupId/options` — add option to group

1) /orders

- POST `/orders` — public create order (normalize middleware + validation). Body example:

  ```json
  { "restaurant_id": 123, "table_id": 5, "items": [{"menu_item_id":1,"qty":2,"options":[] }], "customer": {"name":"...","phone":"..."}, "payment": {...} }
  ```

- GET `/orders/restaurant/:restaurantId` — isRestaurantStaff — list orders
- GET `/orders/:id` — get order
- PUT `/orders/:id/status` — update status
- POST `/orders/:id/cancel` — cancel order
- POST `/orders/waiter` — create order by waiter (isWaiter)
- GET `/orders/waiter/orders` — isWaiter — list waiter's orders
- POST `/orders/:id/verify` — isWaiter — verify order

1) /tables

- GET `/tables/restaurant/:restaurantId` — list tables
- GET `/tables/restaurant/:restaurantId/layout` — layout
- GET `/tables/:id` — get table
- POST `/tables/restaurant/:restaurantId` — create table
- PUT `/tables/:id` — update table
- DELETE `/tables/:id` — delete table
- PATCH `/tables/:id/status` — update status
- POST `/tables/:id/assign-waiter` — assign waiter
- GET `/tables/:id/reservations` — list
- POST `/tables/restaurant/:restaurantId/reservations` — create reservation
- PATCH `/tables/reservations/:id/status` — update reservation status

1) /waiters

- All routes are protected and require `isWaiter`.
- GET `/waiters/dashboard` — dashboard
- POST `/waiters/shift/start`, `/waiters/shift/end`, `/waiters/shift/break`
- GET `/waiters/notifications` — notifications
- PATCH `/waiters/notifications/:id/read` — mark read
- GET `/waiters/calls` — call requests
- POST `/waiters/calls/:id/acknowledge`, `/waiters/calls/:id/resolve`
- GET `/waiters/reservations/today` — today's reservations
- GET `/waiters/performance` — performance metrics
- PATCH `/waiters/status` — update realtime status
- GET `/waiters/profile`, PUT `/waiters/profile` — manage profile

1) /staff

- GET `/staff` — isRestaurantStaff — list staff
- POST `/staff` — create staff
- GET `/staff/schedule`, PUT `/staff/schedule` — schedules
- GET `/staff/roles`, PUT `/staff/roles/:roleId` — roles management
- PUT `/staff/:staffId/permissions` — update staff permissions
- PUT `/staff/:id`, DELETE `/staff/:id`, PATCH `/staff/:id/status`

1) /qr

- POST `/qr/scan/:identifier` — public — record QR scan
- POST `/qr/restaurant/:restaurantId/generate` — isRestaurantStaff — generate restaurant QR
- POST `/qr/restaurant/:restaurantId/table/:tableId/generate` — generate table QR
- GET `/qr/restaurant/:restaurantId` — list restaurant QRs
- GET `/qr/restaurant/:restaurantId/analytics` — analytics
- PATCH `/qr/:id/deactivate` — deactivate
- GET `/qr/download/:identifier` — download QR image

1) /kitchen

- Protected; authorized roles only (kitchen, chef, admin, restaurant_admin)
- GET `/kitchen/dashboard/:restaurantId` — dashboard
- GET `/kitchen/completed/:restaurantId` — completed orders
- GET `/kitchen/analytics/:restaurantId` — analytics
- GET `/kitchen/inventory-alerts/:restaurantId` — alerts
- GET `/kitchen/stations/:restaurantId` — stations
- GET `/kitchen/orders/:orderId` — order details
- PUT `/kitchen/orders/:orderId/status` — update order status
- POST `/kitchen/orders/bulk-update` — bulk status updates

1) /analytics

- Protected (isRestaurantStaff)
- GET `/analytics/sales/:restaurantId`
- GET `/analytics/menu/:restaurantId`
- GET `/analytics/hourly/:restaurantId`
- GET `/analytics/customers/:restaurantId`
- GET `/analytics/revenue/:restaurantId`
- GET `/analytics/export/:restaurantId` — export report (validation applied)

1) /reviews

- GET `/reviews/restaurant/:restaurantId` — list reviews
- POST `/reviews/restaurant/:restaurantId` — create review
- PATCH `/reviews/:id/status` — update review status (isRestaurantStaff)
- DELETE `/reviews/:id` — delete
- GET `/reviews/waiter/:waiterId` — waiter feedback
- POST `/reviews/waiter/:waiterId/order/:orderId` — create waiter feedback

1) /coupons

- GET `/coupons/public/restaurant/:restaurantId` — public coupons
- POST `/coupons/validate` — validate coupon (no staff required)
- Protected (isRestaurantStaff): 
- GET `/coupons/restaurant/:restaurantId`, GET `/coupons/:id`, 
- POST `/coupons/restaurant/:restaurantId`, PUT `/coupons/:id`, 
- DELETE `/coupons/:id`,
- GET `/coupons/restaurant/:restaurantId/analytics`,

- POST `/coupons/order/:orderId/apply` — apply coupon to order

1) /inventory

- Protected (isRestaurantStaff):
- GET `/inventory/restaurant/:restaurantId`
- GET `/inventory/restaurant/:restaurantId/summary`
- GET `/inventory/restaurant/:restaurantId/low-stock`
- GET `/inventory/restaurant/:restaurantId/transactions`
- GET `/inventory/:id`
- POST `/inventory/restaurant/:restaurantId`
- PUT `/inventory/:id`
- DELETE `/inventory/:id`
- POST `/inventory/:id/adjust` — adjust stock

1) /notifications

- Protected: GET `/notifications` — list
- PATCH `/notifications/:id/read` — mark one read
- PATCH `/notifications/read-all` — mark all read
- DELETE `/notifications/:id` — delete
- POST `/notifications/push-token` — register push token
- DELETE `/notifications/push-token` — unregister
- GET `/notifications/preferences`, PUT `/notifications/preferences`
- POST `/notifications/send` — restricted to platform_admin/restaurant_admin

1) /reports

- Protected (isRestaurantStaff):
- GET `/reports/sales/:restaurantId` — sales report
- GET `/reports/orders/:restaurantId` — order report
- GET `/reports/menu/:restaurantId` — menu report
- GET `/reports/invoice/:orderId` — order invoice
- GET `/reports/export/:restaurantId` — export data

1) /dashboard

- Protected:
- GET `/dashboard/platform` — platform admin
- GET `/dashboard/restaurant` — restaurant staff
- GET `/dashboard/waiter` — waiter
- GET `/dashboard/customer` — customer

1) /platform

- Protected + `platform_admin` only
- GET `/platform/dashboard` — platform dashboard
- GET `/platform/analytics`, `/platform/analytics/users`
- Support tickets: GET/POST/PUT `/platform/tickets`, 
- POST `/platform/tickets/:id/messages`
- System logs `/platform/logs` and `/platform/health`
- Subscriptions: CRUD under `/platform/subscriptions` and `/platform/subscriptions/plans`

1) /support

- Protected: GET `/support/tickets`, 
- GET `/support/tickets/:ticketId`, 
- POST `/support/tickets`, 
- GET/POST messages, PATCH `/support/tickets/:ticketId/status`, 
- GET `/support/knowledge-base`

1) /system

- Protected (platform_admin)
- GET/PUT `/system/settings`
- POST `/system/settings/email/test`
- GET `/system/audit-logs`
- GET `/system/health`
- Backups: GET `/system/backups`, 
- POST `/system/backups`, 
- DELETE `/system/backups/:backupId`, 
- GET `/system/backups/:backupId/download`,

Schema examples (representative)

User (response)

```json
{
  "id": 123,
  "email": "admin@example.com",
  "full_name": "Alice",
  "role": "platform_admin",
  "created_at": "2024-01-01T00:00:00Z"
}
```

Restaurant (response)

```json
{
  "id": 10,
  "name": "Cafe Foo",
  "address": "...",
  "status": "active",
  "settings": { "tax_rate": 0.07 }
}
```

Order (create request)

```json
{
  "restaurant_id": 10,
  "table_id": 5,
  "customer": { "name":"John", "phone":"+123" },
  "items": [{ "menu_item_id": 1, "qty": 2, "options": [ {"option_id":4} ] }],
  "payment": { "method": "card|cash|wallet", "amount": 29.5 }
}
```

Validation

- Most protected endpoints use `validate()` middleware and express-validator rules present in `src/middleware/validationMiddleware.js` and per-resource validations.

Recommendations & Best Practices

- Version the API: mount under `/api/v1` and keep compatibility guarantees.
- Use consistent naming: prefer plural resources (`/restaurants`, `/orders`). The codebase already follows this mostly.
- Standardize date/time to ISO 8601 and use UTC.
- Pagination: return meta `{ total, page, limit }` alongside `data` list responses.
- Error handling: return machine-readable `code` fields for common error types.
- Rate limiting: apply per-IP and per-user rate limits for public endpoints (e.g., order creation, auth). Consider `100/min` for public paths and stricter for auth endpoints.
- File uploads: validate file type & size at middleware.
- Security: enforce CORS, content-type checks, strong JWT signing keys, refresh token rotation, and secure cookies for refresh tokens.
- Logging & monitoring: capture request IDs, response times, and instrument with App Insights or similar.

Testing & QA

- Provide Postman / OpenAPI spec generated from this doc.
- Integration tests: cover auth flows, order creation, menu retrieval, and key admin flows.

OpenAPI / Postman

- Recommended next step: generate an OpenAPI 3.0 YAML/JSON from these endpoints and schemas. This file can be used to generate client SDKs, Postman collections, and automated tests.

Maintenance

- Keep `docs/API_DESIGN.md` updated when routes change. Prefer a generated OpenAPI spec for authoritative source.

---
Generated by a repository scan of `menugo-backend/src/routes` on 2026-04-25. Review controller-level details for exact request/response fields.
