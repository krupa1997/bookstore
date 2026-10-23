# Security Implementation

## JWT Authentication

### How it works

1. **Login / Register** — The client sends credentials to `/v1/auth/login` or `/v1/auth/register`. On success, the server generates a signed JWT and returns it in the response body as `accessToken`.

2. **Token storage** — The frontend stores the token in `localStorage` under the key `bw_token`.

3. **Authenticated requests** — Every subsequent API call includes the token in the HTTP header:
   ```
   Authorization: Bearer <jwt>
   ```

4. **Token validation** — Every request passes through `JwtAuthenticationFilter` (a `OncePerRequestFilter`). It:
   - Extracts the Bearer token from the `Authorization` header
   - Validates the token signature and expiry using `JwtTokenProvider`
   - Loads the user from the database via `CustomUserDetailsService.loadUserById(userId)`
   - Sets the authenticated principal in Spring Security's `SecurityContextHolder`

5. **Protected endpoints** — Spring Security's `SecurityConfig` marks all routes as authenticated by default, with explicit `permitAll()` only for `/v1/auth/**` and public catalog endpoints.

### Token structure

The JWT payload contains:
- `sub` — the user's UUID
- `iat` — issued-at timestamp
- `exp` — expiry timestamp

The token is signed using HMAC-SHA256 with a secret key configured via application properties.

---

## Security Config

```
Public (no token required):
  POST /v1/auth/register
  POST /v1/auth/login
  GET  /v1/catalog/**

Protected (JWT required):
  All /v1/cart/** endpoints
  All /v1/orders/** endpoints
  All /v1/payments/** endpoints
  All /v1/shipping/** endpoints
  All /v1/members/** endpoints
```

---

## Guest Cart Security

Guest users are identified by a `X-Guest-Cart-Token` UUID header generated client-side and persisted in `localStorage`. This token scopes cart operations to a single browser session without requiring authentication.

On login, the guest cart is migrated to the authenticated user's account server-side — the guest token is cleared from the cart row and replaced with the user's ID.

---

## Password Security

- Passwords are hashed using **BCrypt** via Spring Security's `BCryptPasswordEncoder` before storage.
- Plaintext passwords are never stored or logged.

---

## Access Control

- Every protected endpoint extracts the authenticated user's ID from the JWT principal (`@AuthenticationPrincipal UserPrincipal`).
- Resource ownership is verified in the service layer — e.g. an order is only accessible if `order.getUser().getId().equals(userId)`. Violations throw a `SecurityException` returning HTTP 403.

---

## Error Handling

- Stack traces are never exposed to API consumers. All exceptions are handled by `GlobalExceptionHandler` which returns a generic `ErrorResponse` DTO.
- Authentication failures return `401 Unauthorized`. Authorisation failures return `403 Forbidden`.
