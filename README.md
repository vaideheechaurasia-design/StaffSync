# StaffSync — Modern Human Resource Management System

> **Tagline:** People First. Work Smarter.  
> **Target Audience:** ServiceNow University / SkillWallet Capstone Project  
> **Development Phase:** Phase 4 — MERN Project Initialization & Frontend Foundation (Completed / Under Review)

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
* **Database:** MongoDB Atlas (Cloud Managed NoSQL) via Mongoose 8+ ODM *(deferred to Phase 5)*
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
| **04** | **MERN Project Initialization & Frontend Foundation** | **Completed (Under Review)** |
| 05 | MongoDB Atlas Setup & Backend Foundation | Pending (Next) |
| 06 | Authentication & Role-Based Authorization | Pending |
| 07 | Employee & Department Management | Pending |
| 08 | Attendance Management Engine | Pending |
| 09 | Leave Requests & Approval Workflows | Pending |
| 10 | Announcements & Training Management | Pending |
| 11 | Dashboards, Notifications & Analytics | Pending |
| 12 | Full Integration, Testing, Security & Bug Fixing | Pending |
| 13 | Final UI Polish, Documentation & Demo Preparation | Pending |
| 14 | GitHub Finalization & Release | Pending |
| 15 | Production Deployment & Final Verification | Pending |

> [!NOTE]
> Phase 4 is complete! The frontend application shell with all 22 routes and layouts, plus the Express API shell with `/api/v1/health` diagnostics, are fully functional. MongoDB Atlas connection will be configured in Phase 5, followed by real JWT authentication in Phase 6.

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
│   ├── PHASE_4_REVIEW.md              # Detailed verification report for Phase 4
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
    ├── package.json                   # Backend dependencies (Express, Helmet, CORS, Dotenv)
    ├── .env.example                   # Server environment template
    ├── .env                           # Local server environment (git-ignored)
    ├── src/
    │   ├── config/                    # Validated environment settings (PORT, CLIENT_URL)
    │   ├── middlewares/               # Error middleware & 404 handler
    │   ├── routes/                    # API v1 router and /health diagnostic routes
    │   ├── app.js                     # Express app setup (Helmet, CORS, Morgan, JSON parser)
    │   └── server.js                  # HTTP server bootstrap & graceful shutdown listeners
    └── tests/
        └── health.test.js             # Automated API health & 404 test suite
```

---

## 6. Quick Start & Local Development

### Prerequisites

* **Node.js:** v20.x or v22.x LTS installed (`node -v`)
* **npm:** v10.x or v11.x installed (`npm -v`)
* **Git:** Version control installed (`git --version`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ashishtheanalyst/StaffSync.git
   cd StaffSync
   ```

2. **Install all dependencies (root, backend, and frontend):**
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables:**
   * Backend: Copy `server/.env.example` to `server/.env` (default values work out of the box for local development):
     ```bash
     PORT=5000
     CLIENT_URL=http://localhost:5173
     NODE_ENV=development
     ```
   * Frontend: Copy `client/.env.example` to `client/.env`:
     ```bash
     VITE_API_BASE_URL=http://localhost:5000/api/v1
     ```

### Running the Application

| Command | Action | URL |
| :--- | :--- | :--- |
| **`npm run dev`** | **Runs backend and frontend concurrently** | **Client: `http://localhost:5173`**<br>**API: `http://localhost:5000`** |
| `npm run client` | Starts Vite React development server | `http://localhost:5173` |
| `npm run server` | Starts Express backend server with nodemon | `http://localhost:5000` |
| `npm run build` | Compiles production assets in `client/dist/` | — |
| `npm run test` | Runs backend automated test suite | — |

---

## 7. Verification & Health Check

### Health Check Endpoint
Once the server is running, the API health check can be verified via browser or terminal:
```bash
curl http://localhost:5000/api/v1/health
```
**Example Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "status": "healthy",
  "message": "StaffSync HRMS API is operational.",
  "data": {
    "uptimeSeconds": 14,
    "environment": "development",
    "version": "1.0.0",
    "database": {
      "status": "pending_configuration",
      "message": "MongoDB Atlas connection will be configured in Phase 5."
    }
  }
}
```

### Automated Testing
Run the backend test suite:
```bash
npm run test
```
* **Results:** 4 tests passed, 0 failed.

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
