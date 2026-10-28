# StaffSync — Phase 6 Implementation Plan: Authentication & Role-Based Authorization

**Milestone:** Phase 6 — Authentication and Role-Based Authorization
**Architecture Pattern:** JWT stored in HTTP-Only, SameSite Cookies with RBAC Middleware
**Security Standard:** OWASP Top 10 / Enterprise SaaS Best Practices
**Status:** Planning Complete (Awaiting Owner Review & Sign-Off)

---

## 1. Executive Summary & Objectives

Phase 6 implements the complete authentication and role-based access control (RBAC) foundation for StaffSync. This phase replaces the frontend demo-only auth switcher introduced in Phase 4 with an end-to-end, cryptographically signed, secure authentication engine backed by MongoDB Atlas.

### Core Objectives:
1. Build the Mongoose `User` model with strict validation and lifecycle hooks.
2. Implement cryptographic password hashing using `bcryptjs` (work factor 10+).
3. Implement `POST /api/v1/auth/login` issuing signed JWT tokens in HTTP-only, secure, SameSite cookies.
4. Implement `GET /api/v1/auth/me` to restore and validate sessions on client startup.
5. Implement `POST /api/v1/auth/logout` to clear session cookies cleanly.
6. Build `verifyToken` authentication and `requireRole` authorization Express middlewares.
7. Implement an idempotent, secure CLI seed script to provision the initial `HR_ADMIN` account.
8. Transition the frontend `AuthContext` from static preview data to live API integration.
9. Verify route guards (`ProtectedRoute`), role-aware sidebar navigation, and unauthorized (403) handling.
10. Deliver a comprehensive automated test suite verifying positive and negative authentication flows.

---

## 2. Dependencies & Package Audit

### Current Backend Dependencies (`server/package.json`):
* `cors`, `dotenv`, `express`, `helmet`, `mongoose`, `morgan`.

### Required Dependencies for Phase 6:
| Package | Version Target | Purpose |
| :--- | :---: | :--- |
| `bcryptjs` | `^2.4.3` | Cryptographic password hashing and salt generation (pure JS, zero native binary compile issues on Windows). |
| `jsonwebtoken` | `^9.0.2` | Signing and verifying cryptographically secure JSON Web Tokens. |
| `cookie-parser` | `^1.4.7` | Express middleware to parse and populate `req.cookies` from incoming cookie headers. |
| `express-validator` | `^7.2.1` | Declarative request payload validation and sanitization middleware for login and password change endpoints. |

*Note: No new client packages are needed. The frontend already has `axios` with `withCredentials: true` and `react-router-dom`.*

---

## 3. Detailed Implementation Sequence

The implementation is structured into 12 distinct, testable steps:

### Step 1: User Mongoose Model (`server/src/models/User.js`)
* **Schema Definition:**
  * `email`: `String`, required, unique, lowercase, trimmed, validated via RFC email regex.
  * `password`: `String`, required, min length 8, `select: false` (never returned in queries by default).
  * `role`: `String`, required, enum: `['HR_ADMIN', 'MANAGER', 'EMPLOYEE']`, default: `'EMPLOYEE'`.
  * `isActive`: `Boolean`, required, default: `true`.
  * `passwordChangedAt`: `Date`, optional (used to invalidate tokens issued before password changes).
  * `lastLogin`: `Date`, optional.
* **Timestamps:** `{ timestamps: true }` (`createdAt`, `updatedAt`).
* **Indexes:**
  * `{ email: 1 }` (unique compound index).
  * `{ role: 1 }` (standard index for administrative filtering).

### Step 2: Password Hashing & Lifecycle Hooks
* **Pre-Save Hook:** In `User.js`, execute `bcryptjs.hash` with salt factor 10 whenever `isModified('password')` is true.
* **Instance Method `comparePassword(candidatePassword)`:** Securely compares plaintext input against stored bcrypt hash using `bcryptjs.compare`.
* **Instance Method `changedPasswordAfter(JWTTimestamp)`:** Checks whether password was modified after token issuance.

### Step 3: Environment Configuration & JWT Secrets (`server/src/config/env.js`)
* Add and validate:
  * `JWT_SECRET`: Mandatory in production (at least 32 characters long); safe default provided for local development.
  * `JWT_EXPIRES_IN`: Defaults to `'8h'` (8 hours).
  * `COOKIE_EXPIRES_IN_DAYS`: Defaults to `1` (or 8 hours matching JWT).
* Update `server/.env.example` with safe placeholder tokens.

### Step 4: Cookie & Express Parser Integration (`server/src/app.js`)
* Mount `cookieParser()` before API routers.
* Verify `cors` middleware explicitly preserves `credentials: true` and whitelists `http://localhost:5173`.

### Step 5: Token Generation & Cookie Strategy (`server/src/utils/tokenUtils.js`)
* Utility to generate JWT signed with `{ userId, role, email }`.
* Utility `sendTokenResponse(user, statusCode, res)`:
  * Creates signed JWT.
  * Sets cookie `token` with:
    * `httpOnly: true` (inaccessible to `document.cookie`, immune to XSS token theft).
    * `secure: process.env.NODE_ENV === 'production'` (HTTPS only in production).
    * `sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'`.
    * `maxAge: 8 * 60 * 60 * 1000` (8 hours).
  * Sends standardized JSON response envelope with sanitized user profile (excluding `password`).

### Step 6: Authentication Controller (`server/src/controllers/authController.js`)
* **`login` (`POST /api/v1/auth/login`):**
  * Validates email format and presence of password.
  * Queries user with `.select('+password')`.
  * Checks if user exists and `user.isActive === true` (returns `403` if account deactivated).
  * Compares password with `user.comparePassword` (returns `401` on mismatch with generic "Invalid credentials" error to prevent user enumeration).
  * Updates `lastLogin` timestamp.
  * Calls `sendTokenResponse`.
* **`logout` (`POST /api/v1/auth/logout`):**
  * Clears `token` cookie with `res.cookie('token', 'none', { expires: new Date(Date.now() + 5 * 1000), httpOnly: true })`.
  * Returns `200 OK` with `{ success: true, message: "Logged out successfully" }`.
* **`getMe` (`GET /api/v1/auth/me`):**
  * Returns sanitized identity of `req.user` populated by auth middleware.

### Step 7: Authentication & RBAC Middleware (`server/src/middlewares/authMiddleware.js`)
* **`verifyToken`:**
  * Extracts token from `req.cookies.token` (or `Authorization: Bearer <token>` fallback for API testing).
  * If missing: returns `401 Unauthorized` (`"Authentication required. Please log in."`).
  * Verifies JWT signature using `jwt.verify(token, config.jwtSecret)`.
  * Checks if the user still exists in the database.
  * Checks if user is still active (`isActive === true`).
  * Checks if user changed password after token issuance.
  * Populates `req.user` with `{ id: user._id, email: user.email, role: user.role }`.
* **`requireRole(...allowedRoles)`:**
  * Checks if `allowedRoles.includes(req.user.role)`.
  * If not: returns `403 Forbidden` (`"Access Denied: You do not have permission to perform this action."`).

### Step 8: Auth Route Registration (`server/src/routes/authRoutes.js`)
* Mounts routes at `/api/v1/auth`:
  * `POST /login` (public, input validation middleware).
  * `POST /logout` (`verifyToken`).
  * `GET /me` (`verifyToken`).
* Connects `authRoutes` to `server/src/routes/index.js`.

### Step 9: Initial Admin Provisioning Script (`server/src/scripts/seedAdmin.js`)
* Idempotent CLI script executed via `npm run seed:admin`.
* Connects to database using `connectDB()`.
* Checks if any `HR_ADMIN` user already exists:
  * If exists: logs notice and exits cleanly without duplicating accounts.
  * If none exists: creates default administrator account (`admin@staffsync.internal`) with configurable environment password (or secure default), hashes password, and prints masked success notice.
* Closes database connection cleanly.

### Step 10: Frontend Client Integration (`client/src/`)
* **`client/src/api/authService.js`:**
  * `login(email, password)`: `POST /auth/login`.
  * `logout()`: `POST /auth/logout`.
  * `getMe()`: `GET /auth/me`.
* **`client/src/context/AuthContext.jsx`:**
  * Replaces Phase 4 static mockup state with live authentication state:
    * `currentUser`, `isAuthenticated`, `isLoading`, `error`.
  * On initial mount: invokes `authService.getMe()` to check for an existing valid cookie session.
  * Provides `login(email, password)` and `logout()` functions.
  * Keeps 1-click demo credential filler in `LoginPage.jsx` for quick developer testing (populates email/password fields with valid seeded accounts).
* **`client/src/components/guards/ProtectedRoute.jsx`:**
  * Displays accessible loading spinner while `isLoading === true`.
  * Redirects unauthenticated users to `/login`.
  * Redirects authenticated users with insufficient role to `/unauthorized`.

### Step 11: Automated Test Suite Expansion
* **`server/tests/auth.test.js`:**
  * `POST /auth/login`: valid login returns 200 and sets `Set-Cookie` header.
  * `POST /auth/login`: invalid password returns 401 with generic error.
  * `POST /auth/login`: non-existent email returns 401.
  * `POST /auth/login`: missing email/password returns 400.
  * `GET /auth/me`: valid cookie session returns 200 with user profile.
  * `GET /auth/me`: unauthenticated request returns 401.
  * `POST /auth/logout`: clears cookie and returns 200.
* **`server/tests/rbac.test.js`:**
  * Tests role guard: `HR_ADMIN` allowed, `EMPLOYEE` received 403 on protected admin route.
  * Inactive user account receives 403 on login attempt.

### Step 12: Documentation & Review Artifacts
* Update `docs/PROGRESS.md` with Phase 6 tasks.
* Create `docs/PHASE_6_REVIEW.md` detailing verification results, test runs, and security audit.

---

## 4. Security & Compliance Checklist

* [x] **No Plaintext Passwords:** Passwords hashed with `bcryptjs` salt rounds 10 before saving.
* [x] **No Secret Leaks:** `password` field marked `select: false`; tokens and hashes omitted from logs and API payloads.
* [x] **No Public Admin Registration:** The application does not expose an open public `/register` endpoint that could grant elevated privileges. All accounts are seeded or provisioned by HR Admins.
* [x] **Cookie Security:** Cookies flagged `HttpOnly`, `SameSite: Lax/None`, and `Secure` in production.
* [x] **Backend RBAC Enforcement:** Route protection executed in Express middleware (`verifyToken` + `requireRole`), independent of frontend guards.
* [x] **Generic Auth Errors:** Authentication errors return uniform `"Invalid email or password"` to prevent user enumeration.

---

## 5. Recommended First Implementation Task

Upon owner approval to begin Phase 6, the recommended initial task is:

**Task 6.1 — Install Core Auth Packages & Implement the User Model:**
1. Install `bcryptjs`, `jsonwebtoken`, and `cookie-parser` in `server/`.
2. Create `server/src/models/User.js` with email validation, role enum, `select: false` password, and bcrypt pre-save hashing hook.
3. Write isolated unit tests in `server/tests/user.test.js` verifying password hashing and comparison methods without requiring network traffic.
