# StaffSync — Phased Project Progress Tracker

**Current Phase:** PHASE 9 — Leave Requests & Approval Workflows
**Phase Status:** Phase 9 Complete & Verified (Live MongoDB Atlas Leave Workflow Verified; 113 Backend Tests Passing; Frontend Production Build Clean)
**Last Updated:** October 29, 2026

---

## 1. Overall Project Lifecycle Status

| Phase | Title | Assigned To | Status | Target Completion |
| :---: | :--- | :--- | :---: | :---: |
| **01** | Requirements Analysis & Architecture Design | Antigravity | **Approved** | Completed |
| **02** | UI/UX Design System & Application Blueprint | Antigravity | **Approved** | Completed |
| **03** | Local Development Environment & GitHub Setup | Project Owner + Antigravity | **Approved** | Completed |
| **04** | MERN Project Initialization & Frontend Foundation | Antigravity + Project Owner | **Approved** | Completed |
| **05** | MongoDB Atlas Setup & Backend Foundation | Project Owner + Antigravity | **Approved** | Completed |
| **06** | **Authentication & Role-Based Authorization** | Antigravity + Project Owner | **Approved** | Completed |
| **07** | **Employee & Department Management** | Antigravity | **Approved** | Completed |
| **08** | **Attendance Management Engine** | Antigravity | **Approved** | Completed |
| **09** | **Leave Requests & Approval Workflows** | Antigravity | **Completed (Under Review)** | Current Phase |
| **10** | Announcements & Training Management | Antigravity | Pending | Next |
| **11** | Dashboards, Notifications & Analytics | Antigravity | Pending | Upcoming |
| **12** | Full Integration, Testing, Security & Bug Fixing | Antigravity + Project Owner | Pending | Upcoming |
| **13** | Final UI Polish, Documentation & Demo Preparation | Antigravity + Project Owner | Pending | Upcoming |
| **14** | GitHub Finalization & Release | Project Owner + Antigravity | Pending | Upcoming |
| **15** | Production Deployment & Final Verification | Project Owner + Antigravity | Pending | Upcoming |

---

## 2. Phase 4 Task Execution & Verification Checklist (Completed)

* [x] **Frontend Initialization (`client/`)**
  * Scaffolded React 18 SPA with Vite bundler and JavaScript.
  * Installed `react-router-dom`, `bootstrap`, `axios`.
  * Configured design system CSS tokens (`variables.css`, `index.css`) matching `docs/DESIGN_SYSTEM.md`.
  * Built layouts: `PublicLayout`, `AuthLayout`, and `DashboardLayout`.
  * Built navigation components: `Navbar` (with brand, notifications, profile menu, and live API status badge), `Sidebar` (role-scoped navigation for `HR_ADMIN`, `MANAGER`, and `EMPLOYEE`), and `Footer`.
  * Built reusable components: `PageHeader`, `SummaryCard`, `StatusBadge`, `EmptyState`, `LoadingSpinner`, `PlaceholderNotice`, and `ProtectedRoute`.
  * Configured all 22 page routes and placeholders with clear phase badges.
* [x] **Backend Foundation (`server/`)**
  * Scaffolded Express application with modular structure: `src/config/`, `src/middlewares/`, `src/routes/`.
  * Configured `helmet` for secure HTTP headers.
  * Configured `cors` with credentials support and client origin whitelisting (`http://localhost:5173`).
  * Implemented request parsing (`express.json()`, `express.urlencoded()`).
  * Implemented `GET /api/v1/health` and `GET /api/health` returning structured uptime, environment, and version info without leaking secrets.
  * Implemented 404 handler and centralized `errorMiddleware`.
  * Configured `.env.example` and safe `.env` with development defaults.
* [x] **Root Workflow & Tooling**
  * Created root `package.json` with scripts (`npm run dev`, `npm run client`, `npm run server`, `npm run build`, `npm run test`).
  * Installed `concurrently` at root for simultaneous frontend and backend execution.
  * Verified `.gitignore` properly ignores `node_modules/`, `.env`, and `dist/` across all levels.

---

## 3. Phase 5 Task Execution & Verification Checklist (Completed)

* [x] **Database Driver & Object Data Modeling (`mongoose`)**
  * Installed `mongoose` (v9.x) in `server/package.json`.
  * Built dedicated database connection module at `server/src/config/db.js`.
  * Added connection retry logic (max 2 retries for transient connection drops; immediate termination on non-recoverable authentication errors).
  * Added connection lifecycle event listeners (`error`, `disconnected`, `reconnected`).
  * Added `sanitizeConnectionUri()` to auto-sanitize accidental `<>` brackets around passwords and reject placeholders.
  * Added `getConnectionStatus()` exposing clean connection metadata (`status`, `host`, `name`, `message`) without leaking sensitive credentials.
  * Added `disconnectDB()` for clean shutdown.
* [x] **Environment Configuration & Safety (`server/src/config/env.js`)**
  * Configured dual support for `MONGODB_URI` and `MONGO_URI`.
  * Created `maskMongoUri()` utility to sanitize connection strings in server logs (`mongodb+srv://*****:*****@...`).
  * Created `validateEnv()` to assert mandatory production environment parameters.
  * Updated `server/.env.example` with clear, safe placeholders.
* [x] **Server Startup & Lifecycle Integration (`server/src/server.js`)**
  * Updated server bootstrap to establish MongoDB connection before accepting HTTP traffic on port 5000.
  * Added safe error handling preventing server initialization when the database is unreachable or misconfigured.
  * Added graceful shutdown handlers for `SIGTERM` and `SIGINT` to close the HTTP server and terminate database connections cleanly.
* [x] **API Health Diagnostics Integration (`server/src/routes/healthRoutes.js`)**
  * Integrated real-time database connection diagnostics into `/api/v1/health` and `/api/health`.
  * Reports `database.status` as `'connected'` only when `mongoose.connection.readyState === 1`.
  * Accurately reports `'disconnected'`, `'connecting'`, or `'disconnecting'` with informative messages.
* [x] **Live MongoDB Atlas Connection Verified**
  * Diagnosed initial `bad auth` failure: identified literal `<>` angle brackets left around the password.
  * Verified live TLS connection to `cluster0.olb0co1.mongodb.net`.
  * Verified connection routes to `staffsync` database.
  * Live health endpoint returned HTTP 200 with `status: "healthy"` and `database.status: "connected"`.
* [x] **Automated Test Suite Expansion**
  * Created `server/tests/env.test.js` covering configuration defaults, environment validation, and URI credential masking.
  * Created `server/tests/db.test.js` covering connection status extraction, missing URI validation, and timeout behavior without requiring live Atlas credentials.
  * Updated `server/tests/health.test.js` verifying database payload structure and Phase 5 service status.
  * **Test Result:** All 13 tests passed cleanly (`npm run test`).
* [x] **Build & Ignore Verification**
  * Frontend production build passed cleanly (`npm run build`).
  * Git ignore audit confirmed `.env`, `node_modules/`, and `dist/` remain untracked.

---

## 4. Phase 6 Task Execution & Verification Checklist (In Progress)

* [x] **Task 6.1 — Core Auth Dependencies & User Mongoose Model (Completed)**
  * Installed `bcryptjs`, `jsonwebtoken`, and `cookie-parser` in `server/package.json`.
  * Built `server/src/models/User.js`:
    * Fields: `name`, `email` (RFC regex, unique, lowercase, trimmed), `password` (`select: false`, minlength 8), `role` (`HR_ADMIN`, `MANAGER`, `EMPLOYEE`, default: `EMPLOYEE`), `isActive`, `passwordChangedAt`, `lastLogin`, timestamps.
    * Pre-save hook: hashes passwords using `bcryptjs.hash` (10 rounds) only when modified.
    * Instance method: `comparePassword(candidatePassword)` using `bcryptjs.compare`.
    * Instance method: `changedPasswordAfter(JWTTimestamp)`.
    * Serialization: `toJSON` and `toObject` transform automatically deletes `password` and `__v`.
  * Unit test suite `server/tests/user.test.js` (12 unit tests passing, covering validation, hashing, comparison, role restrictions, and serialization security).
* [x] **Task 6.2 — JWT Configuration & Cookie Infrastructure (Completed)**
  * Configured `JWT_SECRET` and `JWT_EXPIRES_IN` in `server/src/config/env.js` with `validateJwtSecret` (enforcing $\ge 32$ characters in production, with no predictable production fallback).
  * Updated `server/.env.example` with safe, generic placeholders.
  * Registered `cookieParser()` in `server/src/app.js` with appropriate middleware ordering preserving CORS with credentials.
  * Implemented `server/src/utils/tokenUtils.js`:
    * `signToken(payload, options)`: signs JWT with configured secret and expiration.
    * `verifyToken(token, options)`: validates signature and expiration.
    * `getAuthCookieOptions(overrides)`: returns `httpOnly: true`, `secure: isProd`, `sameSite: isProd ? 'none' : 'lax'`, `maxAge: 8h`, `path: '/'`.
    * `setAuthCookie(res, token)`: applies auth cookie to Express response.
    * `clearAuthCookie(res)`: clears cookie with matching security options and immediate expiration (`maxAge: 0`, `expires: epoch 0`).
  * Created unit test suite `server/tests/token.test.js` (9 unit tests passing).
  * Updated `server/tests/env.test.js` (5 unit tests passing).
  * Total Backend Tests: **37 passed, 0 failed**.
* [x] **Task 6.3 — Authentication & RBAC Middleware (Completed)**
  * Implemented `server/src/middlewares/authMiddleware.js`:
    * `verifyToken` (aliased as `protect`): Reads JWT from HTTP-only session cookie (or `Authorization: Bearer <token>` fallback), validates signature and expiration with `tokenUtils.verifyToken()`, loads user from database, verifies `isActive: true` and checks `user.changedPasswordAfter(decoded.iat)`, and attaches sanitized user to `req.user` (strictly preventing password hash exposure).
    * Rejection conditions (HTTP 401 Unauthorized): missing token, empty/unsupported auth header, forged/tampered signature, expired token, malformed string, non-existent user, deactivated user, and password changed after token issuance.
    * `requireRole(...allowedRoles)` (aliased as `restrictTo`): Enforces RBAC permissions based strictly on `req.user.role`. Rejects unauthorized roles with HTTP 403 Forbidden and unauthenticated requests with HTTP 401 Unauthorized. Prevents privilege escalation from client-supplied body or query parameters.
    * Error security: Consistent JSON error envelopes without leaking stack traces, secrets, or raw token values.
  * Created unit test suite `server/tests/authMiddleware.test.js` (16 unit tests passing across all auth and RBAC scenarios).
  * Total Backend Tests: **54 passed, 0 failed** across 6 test suites.
* [x] **Task 6.4 — Auth Controller & Endpoints (Completed)**
  * Implemented `server/src/controllers/authController.js`:
    * `login`: Validates inputs (400 on missing email/password), normalizes email, queries user with `.select('+password')`, verifies hash via `user.comparePassword()`, rejects invalid credentials with generic 401 Unauthorized (preventing account enumeration), rejects inactive accounts with 403 Forbidden, updates `lastLogin` timestamp, generates cryptographically signed JWT with verified claims, sets secure HttpOnly cookie via `setAuthCookie()`, and returns sanitized user object without password hash.
    * `logout`: Clears authentication cookie via `clearAuthCookie()` with matching security attributes (`maxAge: 0`, epoch 0) and returns structured 200 OK without requiring an active token.
    * `getMe`: Protected profile handler returning sanitized identity of authenticated `req.user`.
  * Created `server/src/routes/authRoutes.js` and mounted at `/api/v1/auth` (and `/api/auth`) via `server/src/routes/index.js`:
    * `POST /api/v1/auth/login` (public, credentials validation)
    * `POST /api/v1/auth/logout` (public, cookie invalidation)
    * `GET /api/v1/auth/me` (protected via `verifyToken`)
  * Created automated integration test suite `server/tests/auth.test.js` (11 tests covering login success, missing fields 400, bad credentials 401, inactive user 403, role spoofing resistance, logout cookie invalidation, unauthenticated 401s, protected cookie & Bearer session profile retrieval, and error safety 500).
  * Total Backend Tests: **66 passed, 0 failed** across 6 test suites.
  * Security Limitation Note: Brute-force rate limiting on `/login` (5 attempts per 15 minutes) is documented and scheduled for implementation during Phase 12 (Security Hardening & Polish).
* [x] **Task 6.5 — Admin Seed Script & Frontend Authentication Integration (Completed)**
  * Implemented idempotent CLI seed script `server/src/scripts/seedAdmin.js` (`npm run seed:admin`):
    * Connects via `connectDB()`, validates admin credentials ($\ge 8$ chars password), normalizes email, and creates `HR_ADMIN` user with bcrypt password hashing.
    * Idempotent check: safely preserves existing admin accounts and passwords without overwriting.
    * Tested and executed live against MongoDB Atlas (`admin@staffsync.internal` provisioned and verified).
  * Created unit test suite `server/tests/seedAdmin.test.js` (4 tests passing).
  * Built frontend API service `client/src/api/authService.js` (`login`, `logout`, `getMe`) utilizing `apiClient` with `withCredentials: true`.
  * Updated `client/src/context/AuthContext.jsx`:
    * Real backend session management restoring identity on mount via `GET /api/v1/auth/me`.
    * Implemented `login(email, password)` and `logout()`.
    * Exposes `isLoading`, `currentUser`, `role`, and `isAuthenticated`.
    * Normalizes user identity for UI compatibility (`firstName`, `lastName`, `initials`, `name`).
  * Updated `client/src/components/guards/ProtectedRoute.jsx`:
    * Added loading state guard displaying `LoadingSpinner` while session restoration is pending, eliminating premature redirects to login.
  * Secured application shell in `client/src/App.jsx`:
    * Wrapped `DashboardLayout` in `<ProtectedRoute>` so all authenticated shell routes require valid sessions.
  * Updated `client/src/pages/auth/LoginPage.jsx`:
    * Connected form to live backend `login()` action with validation, error handling banner, and loading spinner.
    * Added Capstone Quick-Fill helper that populates form inputs without bypassing backend authentication.
  * Updated `client/src/components/layout/Navbar.jsx`:
    * Replaced demo role switcher with active verified role badge and live API connectivity indicator.
  * Live Atlas End-to-End Verification: Tested `POST /login`, `GET /me` session cookie validation, and `POST /logout` against live Atlas database with 100% success.
  * Total Backend Tests: **71 passed, 0 failed** across 7 test suites.
  * Frontend Production Build: **130 modules transformed cleanly in 1.31s**.

---

## 5. Phase 7 Execution & Verification Checklist: Employee & Department Management (Completed)

* [x] **Department & Employee Mongoose Models:**
  * Implemented `server/src/models/Department.js` (`name`, `code`, `description`, `managerId`, `isActive`, timestamps).
  * Implemented `server/src/models/Employee.js` (`userId` ref to User, `employeeCode`, `firstName`, `lastName`, `phone`, `departmentId` ref to Department, `managerId`, `designation`, `employmentType`, `status`, `address`, `emergencyContact`, `dateOfJoining`, virtual `fullName`, timestamps).
* [x] **Backend Controllers & Routes:**
  * Created `server/src/controllers/departmentController.js` and `server/src/routes/departmentRoutes.js` (mounted at `/api/v1/departments` with auto-seeding of default departments: Engineering, HR, Marketing, Operations).
  * Created `server/src/controllers/employeeController.js` and `server/src/routes/employeeRoutes.js` (mounted at `/api/v1/employees`):
    * `GET /employees`: Text search across name, code, designation, department filter, and status filter with populated references.
    * `GET /employees/:id`: Individual profile retrieval by ID or employeeCode.
    * `POST /employees`: Restricted to `HR_ADMIN`, validates required fields, prevents duplicate code or email, provisions linked `User` account with bcrypt hash, and creates `Employee` record.
    * `PUT /employees/:id`: Restricted to `HR_ADMIN`, updates profile details, and synchronizes status and full name with `User` document.
    * `DELETE /employees/:id`: Restricted to `HR_ADMIN`, soft-deactivates employee (`status: 'INACTIVE'`) and suspends linked `User.isActive: false`.
* [x] **Automated Testing Suite:**
  * Created `server/tests/employee.test.js` (11 automated tests covering auth protection, admin RBAC guards, validation errors, duplicate code rejection, onboarding creation, 404s, profile lookup, updates, and deactivation).
  * Total Backend Tests: **82 passed, 0 failed** across 8 test suites.
* [x] **Frontend API Services & Views Integration:**
  * Created `client/src/api/employeeService.js` and `client/src/api/departmentService.js`.
  * Updated `client/src/pages/employees/EmployeeDirectory.jsx` with real-time search, department filtering, status filtering, loading spinner, empty state, error handling, and deactivation action.
  * Updated `client/src/pages/employees/CreateEmployee.jsx` with full onboarding form, input validation, dynamic department loading, and loading state.
  * Updated `client/src/pages/employees/EmployeeProfile.jsx` with live profile details, inline editing for `HR_ADMIN`, deactivation with confirmation, and loading/error states.
  * Updated `client/src/pages/departments/DepartmentList.jsx` connected to live `/departments` API.
* [x] **Live Database & Production Verification:**
  * Executed live MongoDB Atlas CRUD verification script (`Sarah Connor`, `EMP-1005`, create, search, update designation, profile read, and soft-deactivate) with 100% success.
  * Frontend production build: **133 modules transformed cleanly in 1.43s**.

---

## 6. Phase 8 Execution & Verification Checklist: Attendance Management (Completed)

* [x] **Attendance Mongoose Model (`server/src/models/Attendance.js`):**
  * `employeeId` foreign reference to `Employee` model.
  * `date`: Normalized calendar date (midnight UTC `00:00:00.000Z`) for unambiguous daily grouping.
  * `checkInTime`: Mandatory check-in timestamp.
  * `checkOutTime`: Optional check-out timestamp.
  * `totalHours`: Computed shift duration rounded to 2 decimal places.
  * `status`: Strict enumeration (`PRESENT`, `LATE`, `HALF_DAY`, `ABSENT`).
  * `notes`: Optional memo (workstation details, remote notes).
  * **Compound Unique Index:** `{ employeeId: 1, date: 1 }` strictly prohibiting duplicate punch entries for the same employee on the same calendar day.
  * Secondary indexes: `{ date: 1, status: 1 }` and `{ employeeId: 1, date: -1 }`.
* [x] **Attendance Controller & Business Logic (`server/src/controllers/attendanceController.js`):**
  * `normalizeDate(date)`: Idempotently normalizes any date to midnight UTC.
  * `getOrCreateEmployeeForUser(user)`: Seamless user-to-employee resolution with automatic profile creation for administrative users to enable immediate time tracking.
  * `checkIn`: Enforces double-punch protection (400 Conflict if already checked in), evaluates late arrival threshold ($> 09:30\text{ AM}$), and creates punch record (201 Created).
  * `checkOut`: Validates existing punch-in, prevents duplicate check-outs, computes `totalHours` duration, and flags $< 4.0\text{h}$ as `HALF_DAY` (200 OK).
  * `getTodayStatus`: Returns real-time punch status (`isCheckedIn`, `isCheckedOut`, `record`).
  * `getMyHistory`: Personal attendance history with month/year filtering and computed summary statistics (`presentCount`, `lateCount`, `halfDayCount`, `avgWorkingHours`).
  * `getTeamAttendance`: Scoped subordinate roster for managers and HR admins (`MANAGER`, `HR_ADMIN`).
  * `getAllAttendance`: Company-wide attendance overview with date, department, and status filters, plus pagination (`HR_ADMIN`).
  * `createAttendanceRecord`: Administrative backfill and manual punch creation (`HR_ADMIN`).
  * `updateAttendanceRecord`: Administrative record correction and working duration recalculation (`HR_ADMIN`).
* [x] **Attendance Routes (`server/src/routes/attendanceRoutes.js`):**
  * Protected by `verifyToken` on all routes.
  * Mounted at `/api/v1/attendance` in `server/src/routes/index.js`.
  * Strict RBAC enforcement via `requireRole(USER_ROLES.HR_ADMIN)` and `requireRole(USER_ROLES.MANAGER, USER_ROLES.HR_ADMIN)`.
* [x] **Automated Testing Suite (`server/tests/attendance.test.js`):**
  * Implemented 14 automated unit and integration tests covering:
    * 401 Unauthorized for missing tokens.
    * 201 Created for valid clock-in.
    * 400 Conflict for duplicate check-ins on the same day.
    * 400 Bad Request for check-out without check-in.
    * 200 OK for valid check-out with duration arithmetic.
    * 400 Bad Request for duplicate check-out.
    * 200 OK for today's status retrieval.
    * 200 OK for personal history and monthly summary calculation.
    * 403 Forbidden for non-manager access to team roster.
    * 200 OK for manager team roster retrieval.
    * 403 Forbidden for non-admin company overview.
    * 200 OK for admin paginated attendance overview.
    * 201 Created for admin manual punch record.
    * 200 OK for admin record update and duration recalculation.
  * Total Backend Test Suite: **97 passed, 0 failed, 0 skipped** across 9 test suites in 1.17s.
* [x] **Frontend API Integration & Views:**
  * Created `client/src/api/attendanceService.js` with full client methods (`checkIn`, `checkOut`, `getTodayStatus`, `getMyHistory`, `getTeamAttendance`, `getAllAttendance`, `createRecord`, `updateRecord`).
  * Updated `client/src/pages/attendance/AttendanceLog.jsx`: Real one-click Clock In / Clock Out button, today punch status banner, live monthly summary cards, and history table with duration formatting and status badges.
  * Updated `client/src/pages/attendance/TeamAttendance.jsx`: Date selector, team summary cards (Present, Late, Not Punched), and subordinate roster table.
  * Updated `client/src/pages/attendance/AdminAttendance.jsx`: Company overview with date/dept/status filters, pagination, and modal for HR administrators to log manual punches.
* [x] **Live Database & Production Verification:**
  * Verified live against MongoDB Atlas (`ac-sz12oft-shard-00-01.olb0co1.mongodb.net/staffsync`):
    * Clock-in recorded successfully.
    * Compound unique index `{ employeeId: 1, date: 1 }` strictly blocked duplicate punch with `E11000 duplicate key error`.
    * Clock-out recorded with working duration calculated to 8.5 hours.
    * Attendance history retrieved and validated.
  * Frontend production build: **134 modules transformed cleanly in 1.45s**.

---

## 7. Phase 9 Execution & Verification Checklist: Leave Requests & Approval Workflows (Completed)

* [x] **Leave Models & Schemas:**
  * Implemented `server/src/models/LeaveRequest.js`:
    * Foreign reference `employeeId` to `Employee`.
    * Strict enumerations: `LEAVE_TYPES` (`ANNUAL`, `CASUAL`, `SICK`, `UNPAID`) and `LEAVE_STATUSES` (`PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`).
    * `startDate` and `endDate` fields with UTC midnight normalization.
    * `totalDays` requested business days count.
    * `reason` with min 5 and max 500 characters.
    * `reviewedBy` foreign reference to `User`.
    * `reviewComment` (mandatory when rejecting).
    * `reviewedAt` timestamp.
    * Indexes on `{ employeeId: 1, status: 1 }`, `{ status: 1, createdAt: -1 }`, and `{ employeeId: 1, startDate: 1, endDate: 1 }`.
  * Implemented `server/src/models/LeaveBalance.js`:
    * Annual balance sheets per employee per calendar year (`employeeId`, `year`).
    * Quota and consumed tracking for `annual` (15), `casual` (10), `sick` (10), and `unpaid` (0).
    * Compound unique index `{ employeeId: 1, year: 1 }`.
* [x] **Leave Controller & Business Logic (`server/src/controllers/leaveController.js`):**
  * `calculateWorkingDays(startDate, endDate)`: Accurately counts Monday–Friday business days excluding weekends.
  * `getOrCreateLeaveBalance(employeeId, year)`: Resolves or auto-provisions annual quota balance sheets.
  * `applyLeave`: Validates date ranges (`endDate >= startDate`), enforces minimum reason length, checks remaining quota balance, detects active overlapping leave collisions via `startDate <= reqEnd AND endDate >= reqStart` (409 Conflict), and creates pending application (201 Created).
  * `getMyLeaves`: Retrieves caller's personal leave applications with status filtering and current year balances (200 OK).
  * `getMyBalance`: Returns current year quota breakdown (200 OK).
  * `getPendingApprovals`: Scoped retrieval for managers (direct reports and department members, excluding self) and organization-wide for HR admins.
  * `getAllLeaves`: Paginated registry with multi-criteria filtering for HR admins.
  * `getLeaveById`: Individual leave retrieval with role-based access restrictions (employees can only view their own).
  * `reviewLeave`: Enforces role authorization (`MANAGER` or `HR_ADMIN`), double review prevention (rejects already reviewed requests), self-approval prevention (managers cannot approve their own requests), managerial scope check, mandatory rejection feedback, and automated leave balance decrement on approval.
  * `cancelLeave`: Self-service applicant cancellation for pending applications only.
* [x] **Leave Routes (`server/src/routes/leaveRoutes.js`):**
  * Protected by `verifyToken` on all routes.
  * Mounted at `/api/v1/leaves` in `server/src/routes/index.js`.
  * RBAC enforcement on reviews (`requireRole(USER_ROLES.MANAGER, USER_ROLES.HR_ADMIN)`) and organization queries (`requireRole(USER_ROLES.HR_ADMIN)`).
* [x] **Automated Testing Suite (`server/tests/leave.test.js`):**
  * Implemented 16 automated unit/integration tests covering:
    * 401 Unauthorized for unauthenticated requests.
    * 400 Bad Request for inverted date ranges (`endDate < startDate`).
    * 400 Bad Request for short reasons (< 5 chars).
    * 201 Created for valid applications.
    * 409 Conflict for overlapping active/pending leave requests.
    * 200 OK for personal leave history retrieval.
    * 403 Forbidden when employee attempts to view another's application.
    * 403 Forbidden when regular employee attempts to review requests.
    * 403 Forbidden for manager self-approval attempts.
    * 403 Forbidden when manager attempts review outside departmental scope.
    * 400 Bad Request when rejecting without mandatory review comment.
    * 200 OK for valid manager approval with quota balance decrement.
    * 400 Bad Request for duplicate/repeated review attempts.
    * 200 OK for applicant self-service cancellation.
    * 400 Bad Request when attempting to cancel an already approved leave.
  * Total Backend Test Suite: **113 passed, 0 failed, 0 skipped** across 10 test suites in 1.24s.
* [x] **Frontend API Integration & Views:**
  * Created `client/src/api/leaveService.js` with client methods (`apply`, `getMyLeaves`, `getMyBalance`, `getPendingApprovals`, `getAll`, `getById`, `review`, `cancel`).
  * Updated `client/src/pages/leaves/LeaveCenter.jsx`: Real annual quota cards, status-filtered history table, applicant self-service cancellation with confirmation, and loading/empty states.
  * Updated `client/src/pages/leaves/ApplyLeave.jsx`: Live quota balances in dropdown options and sidebar, real-time business day calculation widget, form validation, and error alert banners.
  * Updated `client/src/pages/leaves/LeaveApprovals.jsx`: Real pending review table with quick approve confirmation and rejection modal requiring mandatory feedback.
  * Updated `client/src/pages/dashboard/ManagerDashboard.jsx` & `HRDashboard.jsx`: Live pending leave count badges and table previews connected to `leaveService.getPendingApprovals()`.
* [x] **Live Database & Production Verification:**
  * Executed live MongoDB Atlas verification script (`verifyLeaveAtlas.js`) against `ac-sz12oft-shard-00-01.olb0co1.mongodb.net/staffsync`:
    * Leave application created for test employee `Sarah Connor` (`EMP-1005`).
    * Overlap query verified active leave range collision detection.
    * Review approval executed by admin user with balance decremented from 15 to 13 days.
  * Frontend production build: **135 modules transformed cleanly in 1.46s**.
