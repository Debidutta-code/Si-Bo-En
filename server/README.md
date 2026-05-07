# Server (RevChill)

This folder contains the backend API for RevChill. It’s a TypeScript + Express app with Prisma (Postgres) and MongoDB/Mongoose, plus queues, sockets, and email/SMS services.

## Top-level folders/files

### `src/`
Main application source code (Express app, routes, modules, services).

### `prisma/`
Prisma schema and generated artifacts for the SQL database layer.

- `schema.prisma`: main Prisma schema.
- `enums.prisma`: shared enums used by the schema.
- `models/`: schema model splits/partials (project-specific layout).
- `generated/`: generated Prisma artifacts (if committed in this repo).

### `public/`
Publicly served static files.

- `uploads/`: uploaded assets (images/docs/etc). In production, make sure this is protected/validated and ideally backed by object storage.

### `prisma.config.ts`
Prisma configuration/bootstrapping used by this project.

### `tsconfig.json`
TypeScript configuration for building `src/` into `dist/`.

### `package.json`
Scripts and dependencies.

Common scripts:

- `dev`: start server with nodemon.
- `build`: compile TypeScript into `dist/`.
- `start:test`: run the compiled server.
- `db:push`: generate Prisma client + push schema.

## `src/` module map

`src/` is organized as feature modules. Each module typically contains its own routes/controllers/services/repositories depending on the feature.

### Entry points

- `src/index.ts`: application entry point (bootstraps the server).
- `src/app.ts`: Express app setup (middleware, routes, error handlers).

### Feature / domain modules

- `src/access-control/` — Role/permission access control, policies and guards.
- `src/add-on/` — Add-ons/upsells related APIs (property add-ons, booking add-ons).
- `src/agency/` — Agency-related management (agents, commissions, configs).
- `src/agent-paltform/` — Agent platform feature area (note: folder name has a typo in repo).
- `src/ari/` — ARI (Availability, Rates, Inventory) related endpoints and processing.
- `src/auth/` — Authentication & authorization (login, OTP, password reset, tokens).
- `src/booking-engine/` — Booking engine core flows (search, booking, pricing, checkout).
- `src/currency-maping/` — Currency mapping/normalization utilities and endpoints.
- `src/dashboard/` — Dashboard data aggregation for extranet/admin views.
- `src/integrations/` — Third-party integrations (channel managers, external services).
- `src/logs/` — Logging and audit/event logging endpoints/utilities.
- `src/loyalty/` — Loyalty program logic (points, tiers, redemptions).
- `src/payment/` — Payment processing utilities and flows.
- `src/platforms/` — Platform-specific modules (partners, distribution platforms).
- `src/pms/` — PMS (Property Management System) functions and modules.
- `src/policies/` — Policy management (cancellation, booking policies, etc.).
- `src/promocode/` — Promo code creation/validation/redemption.
- `src/promotions/` — Promotions logic (discounts, geo restrictions, offers).
- `src/property-management/` — Property CRUD, configuration, and related sub-features.
- `src/tax-system/` — Tax rules, calculations, and tax-related data.

### Infrastructure / cross-cutting

- `src/config/` — Configuration loading (env, constants, central config exports).
- `src/middlewares/` — Express middlewares (auth, validation, error handling, etc.).
- `src/queue/` — Queue producers/consumers (BullMQ/Redis). Background jobs for emails, processing, etc.
- `src/sms-email-service/` — Email/SMS sending, templates, loaders, repositories.
- `src/socket/` — Socket.IO real-time layer (events, namespaces, handlers).
- `src/types/` — Shared TypeScript types/interfaces.
- `src/utils/` — General-purpose utilities (dates, formatting, helpers).
- `src/utils-management/` — Utilities specific to internal management/administration flows.

## `src/sms-email-service/` (template system)

This module contains the email/SMS sending implementation.

Common subfolders:

- `controller/` — API controllers (trigger send, callbacks, etc.).
- `routes/` — Express routes for email/SMS endpoints.
- `service/` — Service layer (send OTP, reservation emails, etc.).
- `reposititory/` — Persistence layer for email tokens/OTP (note: folder name has a typo in repo).
- `loader/` — Template loaders (prepare HTML using variable injection).
- `docx/` — HTML templates stored as files (example: `otp.html`).
- `utils/` — Helper utilities (template loader, sender utilities, etc.).
- `models/` — Data models used by this module.
- `templatesss/` — Legacy/in-code templates (project-specific; consider consolidating).

## Notes / conventions

- Most modules follow a “controller → service → repository” layering.
- Data storage can be mixed: Prisma (SQL) + Mongoose (Mongo). Check each module’s repository layer for the source of truth.
- Folder names like `agent-paltform` and `reposititory` appear misspelled in the repo; keep consistent naming when importing.
