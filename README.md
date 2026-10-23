# E-Commerce Book Platform API (Spring Boot 3)

Production-grade Spring Boot 3 implementation of the E-Commerce Book Platform API derived from the architectural wireframe and OpenAPI 3.0 specification.

---

## 🛠 Tech Stack

- **Java 17 / 21**
- **Spring Boot 3.3.4**
  - Spring Web MVC
  - Spring Data JPA (Hibernate)
  - Spring Security (Stateless JWT Authentication with JJWT 0.12.6)
  - Spring Validation (Jakarta Validation)
- **H2 In-Memory Database** (persists in memory during application runtime with console enabled)
- **SpringDoc OpenAPI 2.6.0** (Interactive Swagger UI)
- **Lombok**

---

## 🚀 Running the Application

### 1. Build and Run via Maven
```bash
mvn clean package
mvn spring-boot:run
```

The application will start on port `8080` with context path `/v1`:
- **Base URL:** `http://localhost:8080/v1`
- **Swagger UI:** `http://localhost:8080/v1/swagger-ui/index.html`
- **OpenAPI JSON Spec:** `http://localhost:8080/v1/api-docs`
- **H2 Console:** `http://localhost:8080/v1/h2-console` (JDBC URL: `jdbc:h2:mem:bookstoredb`, User: `sa`, Password: empty)

---

## 🔑 Pre-Seeded Demo Credentials

The `DataInitializer` seeds a test account on boot:
- **Email:** `demo@bookstore.com`
- **Password:** `Password123!`
- **Initial Wallet Balance:** `$50.00`
- **Initial Gift Points:** `500` (Redeemable for `$5.00`)

---

## 📋 Architecture & API Journey Mapping

| Journey / Architecture Layer | Endpoints | Description |
| :--- | :--- | :--- |
| **1. Auth & Member** | `POST /auth/register`<br>`POST /auth/login`<br>`POST /auth/logout`<br>`GET/POST /members/me/addresses` | User signup, JWT issuance, delivery address book. |
| **2. Catalog & Recommendations** | `GET /catalog/categories`<br>`GET /catalog/brands`<br>`GET /catalog/products`<br>`GET /catalog/products/{id}`<br>`GET /catalog/products/{id}/related`<br>`GET /catalog/recommendations` | Browse categories, publishers, product detail with tentative delivery date, upsell/cross-sell, and order-history based recommendations. |
| **3. Cart & Basket** | `GET /cart`<br>`POST /cart`<br>`PUT /cart/items/{itemId}`<br>`DELETE /cart/items/{itemId}` | Supports both authenticated users and anonymous visitors via `X-Guest-Cart-Token`. |
| **4. Orders & Checkout** | `POST /orders/checkout`<br>`GET /orders`<br>`GET /orders/{id}`<br>`POST /orders/{id}/cancel`<br>`POST /orders/{id}/buy-again`<br>`POST /orders/{id}/returns` | Order placement, history, **48-hour order cancellation window enforcement**, one-click **"Buy It Again"**, and RMA return initiation. |
| **5. Payments & Wallet** | `POST /payments/initiate`<br>`POST /payments/confirm`<br>`GET /payments/wallet`<br>`POST /payments/wallet/redeem-points` | Gateway session initiation, confirmation callbacks, gift points redemption (100 pts = $1). |
| **6. Shipping & Fulfillment** | `POST /shipping/calculate-rate` | Postal code shipping tier estimation with calculated tentative delivery dates. |

---

## 🔒 Security Best Practices
- **Password Encryption:** Strong `BCryptPasswordEncoder`.
- **Stateless Authentication:** Signed HMAC-SHA256 JWT tokens.
- **Role-Based Access Control:** Configured through Spring Security `SecurityFilterChain`.
- **Injection Prevention:** Parameterized Spring Data JPA queries.
- **Input Validation:** Strict Jakarta `@Valid` annotations on all mutation endpoints.
