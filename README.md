# eCommerce Bookstore

A full-stack eCommerce bookstore application with a Spring Boot backend and React frontend.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.3, Spring Security, Spring Data JPA |
| Database | H2 (in-memory, dev) |
| Auth | JWT (HMAC-SHA256) |
| Frontend | React 18, Vite, Tailwind CSS |
| Build | Maven (backend), npm (frontend) |

---

## Running Locally

**Backend:**
```bash
cd bookstore
./mvnw spring-boot:run
# Runs on http://localhost:8080
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

Demo login: `demo@bookstore.com` / `Password123!`

---

## Project Structure

```
bookstore/
├── src/main/java/com/bookstore/
│   ├── controller/     # REST controllers (HTTP layer)
│   ├── service/        # Business logic
│   ├── repository/     # Spring Data JPA interfaces
│   ├── model/          # JPA entities
│   ├── dto/            # Request/response objects
│   ├── security/       # JWT filter, config, user details
│   └── config/         # App config, data seeder
└── frontend/
    ├── src/
    │   ├── api/        # Centralized API client
    │   ├── components/ # React page components
    │   └── context/    # AuthContext (auth + cart state)
```

---

## API Design

See [API_DESIGN.md](./API_DESIGN.md) for full endpoint documentation.

---

## Security

See [SECURITY.md](./SECURITY.md) for JWT and access control details.

---

## IBM Bob Usage

See [IBM_BOB_USAGE.md](./IBM_BOB_USAGE.md) for specific examples of how IBM Bob was used during development.

---

## Best Practices Followed

### Backend
- **Layered architecture** — Controllers delegate to Services; Services use Repositories. No business logic in controllers.
- **DTOs for API contracts** — JPA entities are never exposed directly; all responses use DTO classes.
- **Input validation** — `@Valid` + Bean Validation annotations on all request bodies.
- **Consistent error responses** — `GlobalExceptionHandler` catches all exceptions and returns structured `ErrorResponse` JSON. Stack traces never reach the client.
- **Secure password storage** — BCrypt hashing via `BCryptPasswordEncoder`. Plaintext passwords never stored or logged.
- **Ownership checks** — Every protected resource operation verifies the authenticated user owns the resource before proceeding.
- **Transactional boundaries** — `@Transactional` on all service write methods; `@Transactional(readOnly = true)` on reads.
- **Idempotent payment initiation** — Retrying payment for the same order updates the existing row rather than inserting a duplicate.

### Frontend
- **Centralized API client** — All HTTP calls go through a single `api.js` module that attaches the JWT automatically.
- **Auth state in context** — `AuthContext` manages user session, cart state, and token storage in one place.
- **Guest cart migration** — Items added before login are preserved and migrated on authentication.
- **Strict Mode safe effects** — `useRef` guard prevents React 18 Strict Mode from firing one-time side effects twice.
- **Protected page guards** — Pages requiring auth check `user` from context before rendering or making API calls.
