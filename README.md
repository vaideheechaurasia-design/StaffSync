# StaffSync — Modern Human Resource Management System

> **Tagline:** People First. Work Smarter.  
> **Target Audience:** ServiceNow University / SkillWallet Capstone Project  
> **Development Phase:** Phase 9 — Leave Requests & Approval Workflows (Completed / Under Review)

---

## 1. Project Overview

**StaffSync** is an enterprise-grade, web-based Human Resource Management System (HRMS) built using the **MERN** stack (MongoDB, Express.js, React.js, Node.js) with Bootstrap 5 and custom CSS. It is designed to digitize, unify, and simplify human resource workflows for modern organizations.

StaffSync bridges the gap between organizational governance and employee empowerment by providing dedicated, role-tailored portals for **Employees**, **Managers**, and **HR Administrators**.

---

## 2. Core Capabilities

* **Employee Lifecycle Management:** Centralized employee directory, detailed profiles, self-service contact updates, and HR onboarding/deactivation.
* **Department & Organization Management:** Department structuring, manager assignments, and departmental headcount tracking.
* **Time & Attendance Tracking:** Daily one-click check-in and check-out, working hour calculations, late arrival flags, and personal attendance history.
* **Leave Management & Approval Workflows:** Annual leave balance tracking (Annual, Casual, Sick, Unpaid), leave application submission, collision detection, and Manager approval/rejection queues.
* **Company Announcements:** Official bulletin board with priority flags (Normal, High, Urgent) and pinned updates.
* **Training & Development:** Corporate workshop catalog, seat capacity monitoring, and one-click employee self-enrollment.
* **In-App Notifications:** Real-time alert badges for leave updates, attendance reminders, and company news.
* **Executive HR Analytics:** Role-specific KPI dashboards, headcount distribution metrics, and monthly leave trend visualizations.
* **Enterprise Security & RBAC:** Backend-enforced role-based access control, bcrypt password hashing, HTTP-only JWT sessions, rate limiting, and immutable audit logging.

---

## 3. Technology Stack

* **Frontend:** React 18 (SPA), Vite 6, React Router v6, Bootstrap 5.3, Bootstrap Icons, Custom CSS
* **Backend:** Node.js LTS (v20+), Express.js 4 (Modular Monolith architecture, ES Modules)
* **Database:** MongoDB Atlas (Cloud Managed NoSQL) via Mongoose 9 ODM *(Phase 5 Connected)*
* **Authentication & Security:** JSON Web Tokens (JWT) stored in HTTP-Only SameSite Cookies, `bcryptjs`, `helmet`, `cors`, `express-rate-limit`, `mongo-sanitize`, `express-validator` *(deferred to Phase 6)*
* **Testing:** Node.js Native Test Runner, Supertest, Jest, React Testing Library
* **Cloud Hosting (Planned):** Vercel (Frontend), Render (Backend API), MongoDB Atlas (Database)

---

## 4. Phased Development Process

To maintain exceptional architectural quality and clear separation of concerns, StaffSync is developed across 15 structured phases:

| Phase | Milestone | Status |
| :---: | :--- | :---: |
| **01** | **Requirements Analysis & System Architecture Design** | **Approved** |
| **02** | **UI/UX Design System & Application Blueprint** | **Approved** |
| **03** | **Local Development Environment & GitHub Setup** | **Approved** |
| **04** | **MERN Project Initialization & Frontend Foundation** | **Approved** |
| **05** | **MongoDB Atlas Setup & Backend Foundation** | **Approved** |
| **06** | **Authentication & Role-Based Authorization** | **Approved** |
| **07** | **Employee & Department Management** | **Approved** |
| **08** | **Attendance Management Engine** | **Approved** |
| **09** | **Leave Requests & Approval Workflows** | **Approved** |
| 10 | Announcements & Training Management | Pending (Next) |
| 11 | Dashboards, Notifications & Analytics | Pending |
| 12 | Full Integration, Testing, Security & Bug Fixing | Pending |
| 13 | Final UI Polish, Documentation & Demo Preparation | Pending |
| 14 | GitHub Finalization & Release | Pending |
| 15 | Production Deployment & Final Verification | Pending |

> [!NOTE]
> Phases 5 through 9 are complete and verified against live MongoDB Atlas:
> * **Phase 5:** MongoDB Atlas connection with bounded retry logic and health check diagnostics.
> * **Phase 6:** JWT authentication in HTTP-only cookies with Role-Based Access Control (`HR_ADMIN`, `MANAGER`, `EMPLOYEE`).
> * **Phase 7:** Employee lifecycle management, department structuring, and soft-deactivation.
> * **Phase 8:** Attendance clock-in/out engine, daily unique compound index enforcement, and working hour calculations.
> * **Phase 9:** Leave applications, quota balances, collision detection, and manager approval queues.

---

## 5. Project Architecture & Directory Layout

```text
StaffSync/
├── .gitignore                         # Multi-tier gitignore (root, client, server)
├── package.json                       # Root workflow orchestration scripts
├── package-lock.json
├── README.md                          # Project documentation and developer guide
├── docs/                              # Comprehensive architectural blueprints & specifications
│   ├── ACCESSIBILITY_RESPONSIVENESS.md
│   ├── API_SPECIFICATION.md
│   ├── ARCHITECTURE.md
│   ├── COMPONENT_CATALOG.md
│   ├── DATABASE_DESIGN.md
│   ├── DECISIONS.md
│   ├── DEPLOYMENT_PLAN.md
│   ├── DESIGN_SYSTEM.md
│   ├── IMPLEMENTATION_ROADMAP.md
│   ├── PAGE_SPECIFICATIONS.md
│   ├── PHASE_2_REVIEW.md
│   ├── PHASE_4_REVIEW.md
│   ├── PHASE_5_REVIEW.md              # Detailed verification report for Phase 5
│   ├── PROGRESS.md                    # Phased progress tracker
│   ├── PROJECT_PLAN.md
│   ├── SECURITY_DESIGN.md
│   ├── TESTING_STRATEGY.md
│   └── UI_UX_BLUEPRINT.md
│
├── client/                            # React 18 Single-Page Application (Vite)
│   ├── index.html                     # HTML5 entry with branding & Google Fonts
│   ├── vite.config.js                 # Vite build configuration (port 5173)
│   ├── package.json                   # Frontend dependencies (React, Router, Bootstrap, Axios)
│   ├── .env.example                   # Client environment template
│   ├── .env                           # Local client environment (git-ignored)
│   └── src/
│       ├── api/                       # Axios instance with credentials & health service
│       ├── components/
│       │   ├── common/                # PageHeader, StatusBadge, SummaryCard, EmptyState, etc.
│       │   ├── guards/                # ProtectedRoute (role-based route guard)
│       │   └── layout/                # Navbar (with API status indicator), Sidebar, Footer
│       ├── context/                   # AuthContext (with 1-click preview role switcher)
│       ├── layouts/                   # PublicLayout, AuthLayout, DashboardLayout
│       ├── pages/                     # 22 structured route views across all HR modules
│       ├── styles/                    # Design tokens (variables.css) and Bootstrap custom styles
│       ├── App.jsx                    # React Router v6 complete route hierarchy
│       └── main.jsx                   # Application bootstrap entry
│
└── server/                            # Express.js REST API Backend
    ├── package.json                   # Backend dependencies (Express, Helmet, CORS, Mongoose)
    ├── .env.example                   # Server environment template with MONGODB_URI
    ├── .env                           # Local server environment (git-ignored)
    ├── src/
    │   ├── config/                    # Database connection (db.js) & environment loader (env.js)
    │   ├── middlewares/               # Error middleware & 404 handler
    │   ├── routes/                    # API router (/api/v1) and /health diagnostics
    │   ├── app.js                     # Express app setup (Helmet, CORS, Morgan, JSON parser)
    │   └── server.js                  # HTTP server bootstrap & graceful shutdown listeners
    └── tests/
        ├── db.test.js                 # Automated tests for connection logic & status reporting
        ├── env.test.js                # Automated tests for configuration schema & credential masking
        └── health.test.js             # Automated tests for /api/v1/health and /api/health
```

---

## 6. Quick Start & Local Development

### Prerequisites

* **Node.js:** v20.x or v22.x LTS installed (`node -v`)
* **npm:** v10.x or v11.x installed (`npm -v`)
* **Git:** Version control installed (`git --version`)
* **MongoDB Atlas:** Free cluster deployed with database user credentials

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vaideheechaurasia-design/StaffSync-.git
   cd StaffSync
   ```

2. **Install all dependencies (root, backend, and frontend):**
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables:**
   * Backend: Copy `server/.env.example` to `server/.env` and insert your Atlas connection string and JWT secret:
     ```bash
     PORT=5000
     CLIENT_URL=http://localhost:5173
     NODE_ENV=development
     MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/staffsync?retryWrites=true&w=majority
     JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
     JWT_EXPIRES_IN=8h
     ```
   * Frontend: Copy `client/.env.example` to `client/.env`:
     ```bash
     VITE_API_BASE_URL=http://localhost:5000/api/v1
     ```

4. **Seed the Initial Administrator Account:**
   * Run the idempotent admin provisioning script to create the initial `HR_ADMIN` user in MongoDB Atlas:
     ```bash
     npm run seed:admin
     ```

### Running the Application

| Command | Action | URL |
| :--- | :--- | :--- |
| **`npm run dev`** | **Runs backend and frontend concurrently** | **Client: `http://localhost:5173`**<br>**API: `http://localhost:5000`** |
| `npm run seed:admin` | Provisions the default `HR_ADMIN` account in MongoDB | — |
| `npm run client` | Starts Vite React development server | `http://localhost:5173` |
| `npm run server` | Starts Express backend server with nodemon | `http://localhost:5000` |
| `npm run build` | Compiles production assets in `client/dist/` | — |
| `npm run test` | Runs backend automated test suite | — |

---

## 7. Verification & Health Check

### Health Check Endpoint
Once the server is running, the API and database health check can be verified via browser or terminal:
```bash
curl http://localhost:5000/api/v1/health
```
**Example Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "status": "healthy",
  "message": "StaffSync HRMS API and Database are operational.",
  "data": {
    "uptimeSeconds": 14,
    "environment": "development",
    "version": "1.0.0",
    "database": {
      "status": "connected",
      "host": "ac-sz12oft-shard-00-02.olb0co1.mongodb.net",
      "name": "staffsync",
      "message": "MongoDB Atlas connection is established and healthy."
    },
    "services": {
      "database": "Phase 5 (Connected)",
      "authentication": "Phase 6 (JWT + HTTP-only cookies)",
      "employees": "Phase 7 (Active)",
      "attendance": "Phase 8 (Active)",
      "leaves": "Phase 9 (Active)"
    }
  }
}
```

### Automated Testing
Run the backend test suite:
```bash
npm run test
```
* **Results:** **115 tests passed, 0 failed across 10 test suites** (`attendance.test.js`, `auth.test.js`, `authMiddleware.test.js`, `db.test.js`, `employee.test.js`, `env.test.js`, `health.test.js`, `leave.test.js`, `seedAdmin.test.js`, `token.test.js`, `user.test.js`).

---

## 8. Deployment Target & Hosting Configuration

### Backend Deployment (Render)
* **Root Directory:** `server`
* **Build Command:** `npm install`
* **Start Command:** `node src/server.js`
* **Environment Variables (Render Dashboard):**
  * `NODE_ENV=production`
  * `PORT=5000` *(or dynamically assigned by Render)*
  * `MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/staffsync?retryWrites=true&w=majority`
  * `JWT_SECRET=<secure-random-string-at-least-32-characters>`
  * `JWT_EXPIRES_IN=8h`
  * `CLIENT_URL=https://<your-vercel-app>.vercel.app` *(Must match the exact deployed frontend origin)*
  * `ADMIN_PASSWORD=<secure-custom-password>` *(Required for admin provisioning)*

### Frontend Deployment (Vercel)
* **Root Directory:** `client`
* **Build Command:** `npm run build`
* **Output Directory:** `dist`
* **Environment Variables (Vercel Dashboard):**
  * `VITE_API_BASE_URL=https://<your-render-service>.onrender.com/api/v1`
* **SPA Routing:** Managed automatically by `client/vercel.json` rewrite configuration.

### Known Limitations (Phase 10+ Scope)
* **Announcements & Training:** Bulletin board and workshop enrollments are scheduled for Phase 10.
* **Email Delivery:** Password resets and notifications currently operate within the application; external SMTP email dispatch is planned for production release.

---

## 8. Architectural Documentation Index

All architectural specifications are documented inside the [`docs/`](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs) folder:

1. [**`PROJECT_PLAN.md`**](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs/PROJECT_PLAN.md) — Comprehensive requirements, problem statement, personas, prioritized functional requirements (`FR-001` to `FR-092`), NFRs, and business rules.
2. [**`ARCHITECTURE.md`**](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs/ARCHITECTURE.md) — Layered modular monolith architecture, component responsibilities, Mermaid system diagrams, request flows, and directory structure.
3. [**`DATABASE_DESIGN.md`**](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs/DATABASE_DESIGN.md) — 11 Mongoose collection schemas, validation rules, compound indexes, retention policies, and Mermaid ER diagram.
4. [**`API_SPECIFICATION.md`**](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs/API_SPECIFICATION.md) — RESTful API catalog covering 12 modules, HTTP methods, request bodies, status codes, and auth boundaries.
5. [**`DESIGN_SYSTEM.md`**](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs/DESIGN_SYSTEM.md) — Navy/indigo design tokens, typography, component styling standards, and WCAG AA contrast rules.
6. [**`PAGE_SPECIFICATIONS.md`**](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs/PAGE_SPECIFICATIONS.md) — Detailed specifications for all 22 application routes and views.
7. [**`COMPONENT_CATALOG.md`**](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs/COMPONENT_CATALOG.md) — Complete inventory of reusable layout and common UI components.
8. [**`ACCESSIBILITY_RESPONSIVENESS.md`**](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs/ACCESSIBILITY_RESPONSIVENESS.md) — Responsive breakpoints, ARIA landmarks, keyboard navigation, and accessibility standards.
9. [**`SECURITY_DESIGN.md`**](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs/SECURITY_DESIGN.md) — Authentication strategy (JWT in HTTP-only cookies), RBAC matrix, password hashing, input sanitization, CORS, and audit logging.
10. [**`TESTING_STRATEGY.md`**](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs/TESTING_STRATEGY.md) — Testing pyramid (Unit, API, Component, E2E), tools, measurable acceptance criteria, and execution reporting protocol.
11. [**`IMPLEMENTATION_ROADMAP.md`**](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs/IMPLEMENTATION_ROADMAP.md) — Complete 15-phase roadmap with prerequisites, owner actions, deliverables, and definition of done.
12. [**`DEPLOYMENT_PLAN.md`**](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs/DEPLOYMENT_PLAN.md) — Cloud production topology (MongoDB Atlas + Render + Vercel), build scripts, health checks, and cost notices.
13. [**`DECISIONS.md`**](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs/DECISIONS.md) — Formal Architecture Decision Records (ADR-001 through ADR-010) explaining key technical choices and trade-offs.
14. [**`PROGRESS.md`**](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs/PROGRESS.md) — Detailed task execution tracker for all 15 phases.
15. [**`PHASE_4_REVIEW.md`**](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs/PHASE_4_REVIEW.md) — Verification audit and test results for Phase 4.
16. [**`PHASE_5_REVIEW.md`**](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs/PHASE_5_REVIEW.md) — Verification audit, debugging analysis, and live connection results for Phase 5.
