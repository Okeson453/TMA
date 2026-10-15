# TMA Security Architecture & Controls

This document details the security principles, cryptographic algorithms, data isolation boundaries, and threat mitigation strategies implemented in the TMA platform.

---

## 1. Telegram Authentication & Cryptographic Verification

All incoming requests to the API and proxy layers require mathematical verification of the Telegram `initData` payload.

### Verification Algorithm

The verification process follows the official Telegram Mini App protocol:

1. **Parse & Separate:** Parse the incoming query string into key-value pairs. Extract the `hash` parameter and remove it from the data dictionary.
2. **Sort Alphabetically:** Sort all remaining key-value pairs alphabetically by key.
3. **Build Data-Check-String:** Join pairs formatted as `key=value` using the newline character `\n`:
   ```
   auth_date=1792103706\nquery_id=AAHdF...\nuser={"id":84920481,...}
   ```
4. **Derive Secret Key:** Compute HMAC-SHA256 of the bot token using the constant string `"WebAppData"` as the key:
   $$\text{secret\_key} = \text{HMAC\_SHA256}(\text{"WebAppData"}, \text{bot\_token})$$
5. **Compute Expected Hash:** Compute the HMAC-SHA256 of the data-check-string using `secret_key`:
   $$\text{calculated\_hash} = \text{HMAC\_SHA256}(\text{secret\_key}, \text{data\_check\_string})$$
6. **Constant-Time Comparison:** Use `crypto.timingSafeEqual` to compare `hash` with `calculated_hash`. If lengths differ or bytes do not match identically, the request is immediately rejected with `403 Forbidden`.

```ts
const hashBuf = Buffer.from(hash, 'hex');
const calcBuf = Buffer.from(calculatedHash, 'hex');
if (hashBuf.length !== calcBuf.length || !crypto.timingSafeEqual(hashBuf, calcBuf)) {
  return { valid: false };
}
```

### Server-Derived Identity

The application **never** trusts client-supplied query parameters or headers for user identity. The `telegramUserId` is extracted exclusively from the cryptographically verified `user` object within the validated `initData`.

---

## 2. Server-Side Session Authority & Stateless Client

### The Stateless Client Invariant

In standard web applications, browsers receive `Set-Cookie` response headers and manage cookies in client-side storage. In TMA:
1. **The client holds zero target-origin cookies.**
2. When the target origin responds with `Set-Cookie` headers, the proxy engine traps them server-side.
3. The cookies are merged and saved directly into the server's encrypted vault under the active `profileId`.
4. The `Set-Cookie` header is **stripped** from the response sent to the Telegram Mini App WKWebView.
5. Cross-site script injection inside the client cannot access, leak, or tamper with the origin session credentials.

---

## 3. Encryption at Rest (AES-256-GCM)

All authentication credentials and session tokens stored in the database are encrypted using **AES-256-GCM** (Galois/Counter Mode), providing both confidentiality and integrity authentication.

### Payload Structure

Encrypted vault entries are stored as a binary/base64 blob:
```
[ 12-byte IV ] + [ 16-byte Auth Tag ] + [ Ciphertext ]
```

- **IV (Initialization Vector):** 12 bytes of cryptographically secure random bytes generated uniquely per encryption operation via `crypto.randomBytes(12)`. IVs are never reused.
- **Auth Tag:** 16-byte authentication tag produced by GCM mode. Any tampering with the ciphertext causes decryption to fail.
- **Key Management:** The 32-byte master encryption key is supplied via the `COOKIE_VAULT_KEY` environment variable and never committed to version control.

---

## 4. Multi-Profile Isolation Boundaries

The database and service layers enforce strict multi-tenant boundaries:
- Every database query for profiles or credentials is parameter-scoped by the verified `telegram_user_id`.
- Foreign profile requests (where `profile.telegram_user_id !== authenticatedUserId`) return `404 Not Found` or `403 Forbidden`.
- Deleting a profile triggers cascade deletion of its associated cookie vault and device fingerprint records.

---

## 5. Header Sanitization & Anti-Framing Defenses

To render target mobile interfaces inside Telegram's WKWebView, the Ingress Sanitizer systematically removes headers that prevent framing:

| Header Stripped | Reason |
|---|---|
| `X-Frame-Options` | Stripped and replaced with `ALLOWALL` to allow embedding in Telegram WKWebView. |
| `Content-Security-Policy` | Stripped of `frame-ancestors` directives that block iframe mounting. |
| `Strict-Transport-Security` | Stripped on origin proxy stream to avoid forcing origin-only subresource domains. |
| `Cross-Origin-Embedder-Policy` | Stripped to allow cross-origin asset resolution. |
| `Set-Cookie` | Stripped so no origin cookies reach the client browser. |

---

## 6. Egress Residential Network Protection

Direct datacenter-IP requests (e.g. AWS, GCP, DigitalOcean) to target platforms are frequently detected and flagged as automated scraping or unauthorized proxies.

- Outbound proxy traffic routes through residential or mobile exit nodes.
- At boot time, the proxy configuration inspects proxy hostnames against known datacenter ranges and issues warnings if datacenter addresses are detected.
