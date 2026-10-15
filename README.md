# TMA — Telegram Mini App

A mobile-first **Telegram Mini App (TMA)** for managing and switching between user-defined profiles. The project is designed around a modular full-stack architecture, secure Telegram Web App authentication, and a clean profile-management experience.

> **Project status:** Early development. The profile-management foundation and architecture are being established. End-to-end deployment and production readiness have not yet been verified.

## Overview

TMA aims to provide a simple interface inside Telegram where authenticated users can create, view, and remove their own named profiles. The backend is designed to enforce per-user data ownership and expose a typed API to the frontend.

### Current foundation

- Telegram Web App `initData` signature and freshness validation on the backend.
- Profile management API with user-scoped data access.
- Mobile-first React interface with profile listing, creation, deletion confirmation, loading, empty, and error states.
- PostgreSQL persistence and Redis integration points.
- Shared TypeScript DTOs and Zod validation schemas.
- Structured logging, health endpoints, and Prometheus-compatible metrics foundations.
- Container and CI configuration foundations.

Features listed here describe the intended implementation foundation and should not be interpreted as a claim that a production deployment or full end-to-end verification has been completed.

## Technology Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Vite |
| Data fetching and validation | TanStack Query, Zod |
| Backend API | Node.js, TypeScript, Express / Fastify BFF |
| Database | PostgreSQL (relational schema with cascade delete & encrypted vault) |
| Cache / supporting infrastructure | Redis |
| Observability | Pino logging, Prometheus metrics |
| Platform | Telegram Mini Apps |
| Development and deployment | TypeScript workspaces, Docker, GitHub Actions |

## Architecture

The project is organized with clear separation of concerns:

```text
TMA/
├── src/            # React + Vite Telegram Mini App UI
│   ├── app/        # SPA Router and global providers
│   ├── api/        # Typed API client with Telegram initData injection
│   ├── features/   # Profiles (Switcher, Add) and Embed views
│   └── shared/     # Telegram SDK wrapper, UI components, layouts
├── backend/        # Backend-for-Frontend (BFF) engine
│   ├── api/        # Routes, controllers, and Telegram HMAC validator
│   ├── services/   # ProfileService, SessionService, ProxyService
│   ├── repositories/# Profile, CookieVault, and Fingerprint repositories
│   └── infrastructure/# AES-256-GCM crypto, logger, storage
├── shared/         # Shared DTOs, types, and Zod validation schemas
├── docs/           # Detailed API, security, and deployment documentation
├── server.ts       # Full-stack server entry point (API + Vite middlewares)
├── IMPLEMENTATION_STATUS.md # Detailed specification traceability matrix
└── README.md
```

The frontend communicates with the backend through the API client. The backend validates Telegram authentication data, applies request validation, and scopes profile operations to the authenticated Telegram user. PostgreSQL is the persistence layer; Redis is available for supporting infrastructure needs.

## Getting Started

### Prerequisites

- Node.js (use a current LTS release, e.g. Node 20 or 22)
- npm, pnpm, or bun
- PostgreSQL (or local file-backed persistence engine)
- Redis, if enabled by your local configuration
- A Telegram bot and its token for Telegram Web App authentication

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Okeson453/TMA.git
cd TMA
npm install
```

Configure your local environment:

```bash
cp .env.example .env
```

Set the required values in `.env`:

```env
TELEGRAM_BOT_TOKEN="your_bot_token_from_botfather"
COOKIE_VAULT_KEY="base64_encoded_32_byte_aes_key"
PORT=3000
```

> **Never commit real tokens, credentials, or production environment files.**

### Running in Development

Start the full-stack server (runs both the backend API and Vite dev server on port 3000):

```bash
npm run dev
```

Run type checks and builds:

```bash
npm run lint
npm run build
```

## Authentication and Data Protection

- Telegram Web App authentication data must be validated server-side; client-provided user details alone are not trusted.
- Authentication data is checked for signature validity using HMAC-SHA256 (`WebAppData` + bot token) and constant-time comparison.
- Profile reads and writes are strictly scoped to the authenticated Telegram user.
- Sensitive credentials and cookie tokens are encrypted at rest using AES-256-GCM.
- API input is validated at the server boundary via Zod schemas, avoiding logging secrets or authentication payloads.
- In production, enforce HTTPS and keep secrets in environment variables or a dedicated secret manager.

## Interactive Auth Harness & Testing

For local development and sandbox environments outside of the native Telegram client, the app includes an interactive **Auth Harness** banner at the top of the interface:
- **Valid HMAC initData:** Sends genuine, cryptographically signed Telegram initData to test successful authorization.
- **Simulate Forged (Expect 403):** Deliberately alters the HMAC signature to verify that the backend's `403 Forbidden` anti-tamper security control rejects unauthorized requests.
- **User Switcher:** Allows toggling between simulated Telegram User IDs (e.g., `84920481` vs `99999999`) to verify strict per-user data isolation.

## Integration Scope

This project focuses on profile management and a secure application foundation. It does **not** implement Facebook login, collection or replay of Facebook session cookies, browser-fingerprint spoofing, or bypassing another platform's framing and security protections. Any future third-party integration should use authorized, documented APIs and comply with the provider's terms and user-consent requirements.

## Documentation Index

- [API Documentation](docs/API_DOCUMENTATION.md) — Comprehensive reference for all API endpoints, request/response models, and error codes.
- [Security Architecture](docs/SECURITY.md) — Detailed explanation of Telegram HMAC-SHA256 validation, AES-256-GCM vault encryption, and isolation rules.
- [Deployment Guide](docs/DEPLOYMENT.md) — Containerization, environment variables, production hardening, and reverse proxy guidelines.
- [Implementation Traceability](IMPLEMENTATION_STATUS.md) — Traceability checklist mapping every specification requirement to code.

## Development Status

TMA is under active development. Before treating it as production-ready, complete and verify:

- Dependency installation and lockfile generation
- Type checking, automated tests, and production builds
- Database migration and CRUD integration tests
- Telegram Web App authentication tests in a real Telegram environment
- Deployment configuration, monitoring, backup, and recovery procedures
- Security review and end-to-end validation

## Contributing

Contributions should keep changes focused, preserve clear separation between frontend, backend, and shared contracts, and include tests for behavior changes. Do not commit credentials, real user data, or generated build artifacts.

## License

No license has been selected yet. Unless a license is added to this repository, standard copyright restrictions apply.
