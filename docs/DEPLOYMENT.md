# TMA Deployment Guide

This guide describes how to configure, containerize, and deploy the Telegram Mini App (TMA) to production environments.

---

## 1. Environment Variables Checklist

Ensure the following environment variables are securely injected via secret managers or environment configuration:

| Variable | Description | Example / Format |
|---|---|---|
| `NODE_ENV` | Runtime environment (`production` or `development`). | `production` |
| `PORT` | HTTP port the server listens on (defaults to 3000). | `3000` |
| `TELEGRAM_BOT_TOKEN` | Bot token from `@BotFather` used to verify `initData`. | `123456789:ABCdefGHI...` |
| `COOKIE_VAULT_KEY` | 32-byte Base64 encoded key for AES-256-GCM encryption. | Base64 string (32 bytes) |
| `TARGET_ORIGIN` | Target platform origin for reverse proxying. | `https://m.facebook.com` |
| `RESIDENTIAL_PROXY_URL` | Optional rotating residential/mobile ISP proxy URL. | `http://user:pass@proxy.provider:8080` |
| `DATABASE_URL` | PostgreSQL connection string for production database. | `postgresql://user:pass@host:5432/tma` |
| `REDIS_URL` | Optional Redis connection string for fast caching. | `redis://host:6379` |

### Generating a Secure Cookie Vault Key

Run the following command in Node.js to generate a 32-byte Base64 key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 2. Docker Deployment

### Dockerfile

A production Dockerfile builds the Vite frontend and runs the Node.js BFF engine:

```dockerfile
# Multi-stage Docker build
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

EXPOSE 3000
CMD ["npm", "start"]
```

### Building and Running the Container

```bash
docker build -t tma-app:latest .
docker run -p 3000:3000 \
  -e TELEGRAM_BOT_TOKEN="your_bot_token" \
  -e COOKIE_VAULT_KEY="your_base64_key" \
  tma-app:latest
```

---

## 3. Telegram Bot & Mini App Configuration

Telegram requires HTTPS for all Mini Apps.

1. Open Telegram and message `@BotFather`.
2. Create or select your bot using `/mybots`.
3. Choose **Bot Settings** → **Menu Button** → **Configure Menu Button**.
4. Enter your deployed HTTPS URL (e.g. `https://tma.yourdomain.com`).
5. Alternatively, create a Mini App attachment via `/newapp` to register an inline launch button.

---

## 4. Production Reverse Proxy (Nginx)

When deploying behind Nginx or an edge load balancer, ensure WebSocket and proxy headers are passed cleanly:

```nginx
server {
    listen 443 ssl http2;
    server_name tma.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/tma.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tma.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 5. Production Verification Checklist

- [ ] HTTPS enforced (required by Telegram WKWebView).
- [ ] Real bot token configured in `TELEGRAM_BOT_TOKEN`.
- [ ] Secure random 32-byte key set in `COOKIE_VAULT_KEY`.
- [ ] Database backups and SSL enabled on PostgreSQL.
- [ ] `/health` endpoint responds `200 OK`.
- [ ] Verified that requests with forged `initData` receive `403 Forbidden`.
