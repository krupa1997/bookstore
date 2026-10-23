# eCommerce Bookstore — API Design

Base URL: `/v1`
Authentication: Bearer JWT token in `Authorization` header.

---

## Auth

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/v1/auth/register` | No | Register a new user |
| POST | `/v1/auth/login` | No | Login and receive JWT |
| POST | `/v1/auth/logout` | Yes | Invalidate session |

**POST /v1/auth/register**
```json
Request:
{
  "firstName": "Alice",
  "lastName": "Smith",
  "email": "alice@example.com",
  "password": "Password123!"
}

Response 201:
{
  "accessToken": "<jwt>",
  "user": { "id": "uuid", "email": "alice@example.com", "firstName": "Alice", "lastName": "Smith" }
}
```

**POST /v1/auth/login**
```json
Request:
{ "email": "alice@example.com", "password": "Password123!" }

Response 200:
{
  "accessToken": "<jwt>",
  "user": { "id": "uuid", "email": "alice@example.com", "firstName": "Alice" }
}
```

---

## Catalog

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/v1/catalog/products` | No | List products with filters |
| GET | `/v1/catalog/products/{id}` | No | Get product detail |
| GET | `/v1/catalog/products/{id}/related` | No | Get related products |
| GET | `/v1/catalog/categories` | No | List all categories |
| GET | `/v1/catalog/brands` | No | List all brands/publishers |
| GET | `/v1/catalog/recommendations` | No | Get recommended products |

**GET /v1/catalog/products** — Query params: `categoryId`, `brandId`, `search`, `page`, `limit`
```json
Response 200:
{
  "items": [
    {
      "id": "uuid",
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "price": 42.50,
      "currency": "INR",
      "inStock": true,
      "category": { "id": "uuid", "name": "Computers & Technology" },
      "brand": { "id": "uuid", "name": "O'Reilly Media" }
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20
}
```

---

## Cart

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/v1/cart` | Optional | Get current cart |
| POST | `/v1/cart` | Optional | Add item to cart |
| PUT | `/v1/cart/items/{itemId}` | Optional | Update item quantity |
| DELETE | `/v1/cart/items/{itemId}` | Optional | Remove item |

> Guest users pass `X-Guest-Cart-Token: <uuid>` header. On login, the guest cart is automatically migrated to the authenticated user's account.

**POST /v1/cart**
```json
Request:
{ "productId": "uuid", "quantity": 2 }

Response 200:
{
  "cartId": "uuid",
  "items": [
    { "id": "uuid", "product": { "title": "Clean Code" }, "quantity": 2, "unitPrice": 42.50, "totalPrice": 85.00 }
  ],
  "subtotal": 85.00,
  "discount": 0.00,
  "total": 85.00
}
```

---

## Shipping

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/v1/shipping/calculate-rate` | Yes | Get live shipping options for a cart |

**POST /v1/shipping/calculate-rate**
```json
Request:
{ "deliveryPostalCode": "560001", "cartId": "uuid" }

Response 200:
{
  "options": [
    { "shippingMethodId": "standard-ground",  "name": "Standard Ground Shipping (3-5 business days)", "cost": 4.99, "tentativeDeliveryDate": "2026-10-28" },
    { "shippingMethodId": "express-priority",  "name": "Express Priority Shipping (1-2 business days)", "cost": 9.99, "tentativeDeliveryDate": "2026-10-26" },
    { "shippingMethodId": "super-saver",       "name": "Free Super Saver Shipping (5-7 business days)", "cost": 0.00, "tentativeDeliveryDate": "2026-10-31" }
  ]
}
```

---

## Orders

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/v1/orders/checkout` | Yes | Place order from active cart |
| GET | `/v1/orders` | Yes | Paginated order history |
| GET | `/v1/orders/{orderId}` | Yes | Order detail |
| POST | `/v1/orders/{orderId}/cancel` | Yes | Cancel order (within 48h window) |
| POST | `/v1/orders/{orderId}/buy-again` | Yes | Re-add order items to cart |
| POST | `/v1/orders/{orderId}/returns` | Yes | Request a return |

**POST /v1/orders/checkout**
```json
Request:
{
  "deliveryAddressId": "uuid",
  "shippingMethodId": "standard-ground",
  "redeemGiftPoints": 0
}

Response 201:
{
  "id": "uuid",
  "status": "PENDING_PAYMENT",
  "items": [...],
  "subtotal": 85.00,
  "shippingAmount": 4.99,
  "discountAmount": 0.00,
  "totalAmount": 89.99,
  "canCancelUntil": "2026-10-24T11:00:00"
}
```

Order status values: `PENDING_PAYMENT` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED` → `CANCELLED` / `RETURNED`

---

## Payments

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/v1/payments/initiate` | Yes | Create payment session for an order |
| POST | `/v1/payments/confirm` | Yes | Confirm payment after gateway callback |
| GET | `/v1/payments/wallet` | Yes | Get wallet balance and gift points |
| POST | `/v1/payments/wallet/redeem-points` | Yes | Redeem gift points for cart discount |

**POST /v1/payments/initiate**
```json
Request:
{ "orderId": "uuid", "paymentMethod": "CREDIT_CARD", "walletRedemptionAmount": 0 }

Response 200:
{
  "paymentId": "uuid",
  "orderId": "uuid",
  "amount": 89.99,
  "currency": "INR",
  "gatewayRedirectUrl": "https://payment-gateway.example.com/checkout?session=...",
  "paymentStatus": "INITIATED"
}
```

> Calling this endpoint multiple times for the same order reuses the existing payment record (idempotent — issues UPDATE not INSERT).

**POST /v1/payments/confirm**
```json
Request:
{ "paymentId": "uuid", "gatewayTransactionId": "TXN-ABC123", "status": "SUCCESS" }

Response 200:
{ "paymentId": "uuid", "orderId": "uuid", "status": "PAID", "transactionTimestamp": "2026-10-22T11:00:00" }
```

Supported `paymentMethod` values: `CREDIT_CARD`, `DEBIT_CARD`, `UPI`, `WALLET`, `NET_BANKING`, `GIFT_CARD`

---

## Member Addresses

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/v1/members/me/addresses` | Yes | List saved addresses |
| POST | `/v1/members/me/addresses` | Yes | Add a new address |

---

## Error Response Format

All errors return a consistent JSON body:
```json
{ "status": 400, "error": "Bad Request", "message": "Delivery address ID is required" }
```

| HTTP Status | Meaning |
|-------------|---------|
| 400 | Validation error / bad input |
| 401 | Missing or expired JWT |
| 403 | Authenticated but not authorised |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate resource) |
| 500 | Internal server error |

---

## Key Design Decisions

1. **Guest cart support** — Carts work without login using `X-Guest-Cart-Token`. On login, the guest cart is automatically migrated to the user account so items are not lost.
2. **Idempotent payment initiation** — Calling `/payments/initiate` multiple times for the same order reuses the existing payment row (UPDATE) rather than inserting a duplicate, avoiding unique constraint violations on retries.
3. **48-hour cancellation window** — Orders can be cancelled within 48 hours of placement while in `PENDING_PAYMENT` or `CONFIRMED` status.
4. **Gift points system** — 100 points = ₹1 discount. Points are awarded at 10 points per ₹10 spent after a successful payment confirmation.
5. **Layered architecture** — Controllers handle HTTP, Services contain business logic, Repositories handle persistence. DTOs decouple the API contract from internal JPA entities.
