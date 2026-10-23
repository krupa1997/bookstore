# How IBM Bob Was Used

This document describes specific instances where IBM Bob (AI coding assistant) was used during development of the bookstore backend.

---

## What is IBM Bob?

IBM Bob is an AI coding assistant integrated into the development environment. Unlike a simple code generator, Bob reads actual source files, understands the full call chain across layers, and applies precise targeted fixes — only changing lines that need to change.

---

## Specific Instances

### 1. Diagnosing the Payment Duplicate Insert Bug

**Problem:** Every time the payment screen loaded, the backend threw:
```
Unique index or primary key violation on PAYMENTS(ORDER_ID)
```

**How Bob helped:**
- Bob read `PaymentService.java`, `Payment.java`, `Order.java`, and `CheckoutPage.jsx` in sequence
- Traced the issue across three layers: React component → Spring service → Hibernate entity
- Identified that React 18 Strict Mode mounts components twice in development, firing two simultaneous `initiatePayment` API calls before either committed to the database
- Fixed the frontend with a `useRef` guard to prevent the duplicate call
- Fixed the backend by rewriting the payment lookup to use `findIdByOrderId` + `findById`, guaranteeing Hibernate issues an UPDATE instead of an INSERT on retry

**Files changed:** `CheckoutPage.jsx`, `PaymentService.java`, `PaymentRepository.java`

---

### 2. Guest Cart Not Migrating on Login

**Problem:** Users added items to cart as guests, logged in, then hit "Cannot checkout an empty cart" error.

**How Bob helped:**
- Read `AuthContext.jsx`, `CartService.java`, `CartController.java`, and `CartRepository.java`
- Identified that `refreshCart()` was called after login without the guest token, so the backend created a new empty user cart instead of migrating the existing guest cart
- Fixed `CartService.getOrCreateCartEntity()` to detect and migrate the guest cart when a user first logs in
- Fixed `AuthContext` to pass the guest token on the first post-login cart fetch

**Files changed:** `CartService.java`, `AuthContext.jsx`

---

### 3. Fixing PaymentMethod Enum Mismatch

**Problem:** API returned `JSON parse error: Cannot deserialize value of type PaymentMethod from String "CARD"`.

**How Bob helped:**
- Read `PaymentMethod.java` enum and `CheckoutPage.jsx` in parallel
- Found that the frontend was sending `"CARD"` but the backend enum only accepts `CREDIT_CARD`, `DEBIT_CARD`, `UPI`, `WALLET`, `NET_BANKING`, `GIFT_CARD`
- Updated `PAYMENT_METHODS` constant and default state in one targeted diff

**Files changed:** `CheckoutPage.jsx`

---

### 4. Shipping API Response Mismatch

**Problem:** Shipping options were not displaying correctly on the checkout screen.

**How Bob helped:**
- Read the actual API response shape and compared it against the frontend mapping code
- Found that the code was reading `r.id`, `r.label`, `r.priceINR`, `r.estimatedDeliveryDate` but the API returned `shippingMethodId`, `name`, `cost`, `tentativeDeliveryDate`
- Also found that a static hardcoded list of 2 options was blocking the API's 3rd option (Super Saver) from ever rendering
- Replaced the static list entirely with direct API response rendering

**Files changed:** `CheckoutPage.jsx`

---

### 5. Logout Not Redirecting Away from Protected Pages

**Problem:** Clicking logout while on My Orders kept the user on the orders screen, which still showed order data.

**How Bob helped:**
- Traced the logout flow from `Navbar.jsx` → `AuthContext.logout()` → `App.jsx` state
- Found that `logout()` cleared the session but nothing told `App` to change `activePage`
- Added an `onLogout` callback prop to `Navbar`, wired it in `App` to call `navigateTo('home')`
- Also added a `user` guard in `OrdersPage` to immediately show a sign-in prompt if not authenticated, without firing a 403 API call

**Files changed:** `Navbar.jsx`, `App.jsx`, `OrdersPage.jsx`

---

## Summary

| Issue | Root Cause Found By Bob | Layers Touched |
|-------|------------------------|----------------|
| Payment duplicate insert | React Strict Mode + Hibernate session identity | Frontend + Backend |
| Empty cart at checkout | Guest token not passed post-login | Frontend + Backend |
| PaymentMethod parse error | Enum value mismatch | Frontend |
| Shipping options not showing | Field name mismatch + static list override | Frontend |
| Logout not redirecting | Missing callback prop chain | Frontend |

In every case, Bob read the actual source files rather than guessing, and made the minimal change needed — no unnecessary refactoring or added abstractions.
