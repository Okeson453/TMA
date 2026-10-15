# TMA API Documentation

This document provides the complete API specification for the Telegram Mini App (TMA) Backend-for-Frontend (BFF) engine.

---

## 1. Authentication & Headers

Every request to `/api/*` and `/proxy/*` endpoints must carry valid Telegram Web App authentication data.

### Request Headers

| Header | Type | Description |
|---|---|---|
| `X-Telegram-Init-Data` | `string` | The raw `initData` string provided by Telegram WebApp SDK (`window.Telegram.WebApp.initData`). |
| `Content-Type` | `string` | Required `application/json` for POST and PATCH endpoints. |
| `X-Trace-Id` | `string` (optional) | Optional correlation ID. If not supplied, the server generates a UUIDv4 and returns it on the response. |

### Query Parameter Fallback (Iframe Navigation)

For top-level navigation inside `<iframe>` tags (where custom HTTP headers cannot be attached), the backend accepts the authentication payload via the query parameter:
```
GET /proxy/:profileId/?initData=<encoded_telegram_init_data>
```

---

## 2. Standard Error Response Format

All error responses strictly follow the uniform error structure:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Invalid or forged Telegram initData signature",
    "traceId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "details": null
  }
}
```

### Standard Status Codes

| Status Code | Code | Cause |
|---|---|---|
| `400 Bad Request` | `VALIDATION_ERROR` | Request body failed Zod schema validation. |
| `403 Forbidden` | `FORBIDDEN` | Missing, expired, or cryptographically invalid `initData` HMAC signature, or attempted cross-user profile access. |
| `404 Not Found` | `NOT_FOUND` | The requested profile does not exist or does not belong to the calling user. |
| `500 Internal Error`| `INTERNAL_ERROR` | Unhandled server exception. |
| `502 Bad Gateway` | `BAD_GATEWAY` | Proxied origin unreachable or returned network error. |

---

## 3. Endpoints

### 3.1 Health Check

#### `GET /health`
Returns service status, environment, and configured target origin. Does not require authentication.

**Response `200 OK`**:
```json
{
  "status": "ok",
  "timestamp": "2026-10-15T22:35:03.286Z",
  "env": "development",
  "targetOrigin": "https://m.facebook.com"
}
```

---

### 3.2 List Profiles

#### `GET /api/profiles`
Returns all profiles belonging exclusively to the authenticated Telegram user.

**Headers**:
- `X-Telegram-Init-Data: <initData>`

**Response `200 OK`**:
```json
{
  "profiles": [
    {
      "profileId": "a1111111-1111-4111-8111-111111111111",
      "displayName": "Russell Crowee",
      "telegramUserId": 84920481,
      "createdAt": "2026-10-15T22:35:01.204Z",
      "updatedAt": "2026-10-15T22:35:01.204Z",
      "cookieStatus": "active",
      "fingerprintSummary": "iOS Safari (393x852)"
    }
  ]
}
```

---

### 3.3 Create Profile

#### `POST /api/profiles`
Creates a new profile, encrypts its cookies into the AES-256-GCM vault, and persists its device fingerprint.

**Headers**:
- `X-Telegram-Init-Data: <initData>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "displayName": "Russell Crowee (Personal)",
  "cookieString": "c_user=100084920481; xs=32%3A...; datr=fr_...;",
  "fingerprint": {
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15...",
    "acceptLanguage": "en-US,en;q=0.9",
    "screenWidth": 393,
    "screenHeight": 852
  }
}
```

**Response `201 Created`**:
```json
{
  "profileId": "8f191f74-9ad8-4768-be24-3e002adf8a6b"
}
```

---

### 3.4 Get Profile

#### `GET /api/profiles/:profileId`
Retrieves a single profile record. Returns `404 Not Found` if the profile belongs to another Telegram user.

**Response `200 OK`**:
```json
{
  "profile": {
    "profileId": "a1111111-1111-4111-8111-111111111111",
    "telegramUserId": 84920481,
    "displayName": "Russell Crowee",
    "createdAt": "2026-10-15T22:35:01.204Z",
    "updatedAt": "2026-10-15T22:35:01.204Z"
  }
}
```

---

### 3.5 Update Profile

#### `PATCH /api/profiles/:profileId`
Updates mutable profile fields (such as `displayName`).

**Request Body**:
```json
{
  "displayName": "Russell Crowee (Updated)"
}
```

**Response `200 OK`**:
```json
{
  "profile": {
    "profileId": "a1111111-1111-4111-8111-111111111111",
    "displayName": "Russell Crowee (Updated)",
    "updatedAt": "2026-10-15T22:45:00.000Z"
  }
}
```

---

### 3.6 Delete Profile

#### `DELETE /api/profiles/:profileId`
Deletes the profile and cascades deletion to its encrypted cookie vault and device fingerprint records.

**Response `204 No Content`**

---

### 3.7 Profile Health Pre-Check

#### `GET /api/profiles/:profileId/health`
Lightweight pre-check used by the frontend before mounting the `<iframe>`. Validates that the profile exists, belongs to the caller, and contains active encrypted credentials.

**Response `200 OK`**:
```json
{
  "status": "ok",
  "profileId": "a1111111-1111-4111-8111-111111111111",
  "displayName": "Russell Crowee",
  "cookieStatus": "active",
  "traceId": "c331904a-..."
}
```

---

### 3.8 Proxied Origin Traffic

#### `ALL /proxy/:profileId/*`
The wildcard stateful reverse proxy endpoint.
- Validates Telegram HMAC signature and profile ownership.
- Hydrates the profile's decrypted cookies from the vault into the outgoing `Cookie` header.
- Injects the stored User-Agent and device headers.
- Strips `X-Frame-Options`, `Content-Security-Policy`, and `Strict-Transport-Security` from origin responses.
- Rewrites HTML/CSS URLs into `/proxy/:profileId/...`.
- Traps origin `Set-Cookie` headers, updates the vault, and never forwards them to the client.

**Response**: Rewritten origin payload with headers sanitized for Telegram iframe embedding.
