# StaffSync — Modern Human Resource Management System

> **Tagline:** People First. Work Smarter.  
> **Target Audience:** ServiceNow University / SkillWallet Capstone Project  
> **Development Phase:** Phase 1 — Requirements Analysis & System Architecture Design (Completed / In Review)  

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

* **Frontend:** React 18 (SPA), React Router v6, Bootstrap 5.3, Bootstrap Icons, Custom CSS
* **Backend:** Node.js LTS, Express.js (Modular Monolith architecture)
* **Database:** MongoDB Atlas (Cloud Managed NoSQL) via Mongoose 8+ ODM
* **Authentication & Security:** JSON Web Tokens (JWT) stored in HTTP-Only SameSite Cookies, `bcryptjs`, `helmet`, `express-rate-limit`, `mongo-sanitize`, `express-validator`
* **Testing:** Jest, Supertest, React Testing Library
* **Cloud Hosting (Planned):** Vercel (Frontend), Render / Railway (Backend API), MongoDB Atlas (Database)

---

## 4. Phased Development Process

To maintain exceptional architectural quality and clear separation of concerns, StaffSync is developed across 15 structured phases:

| Phase | Milestone | Status |
| :---: | :--- | :---: |
| **01** | **Requirements Analysis & System Architecture Design** | **Under Review** |
| 02 | UI/UX Design System & Application Blueprint | Pending |
| 03 | Local Development Environment & GitHub Setup | Pending |
| 04 | MERN Project Initialization & Frontend Foundation | Pending |
| 05 | MongoDB Atlas Setup & Backend Foundation | Pending |
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
> We are currently in **Phase 1**. No application code has been generated or packages installed yet. All technical planning, database schemas, API endpoints, and security policies have been fully documented in the `docs/` directory.

---

## 5. Architectural Documentation Index

All architectural specifications are documented inside the [`docs/`](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs) folder:

1. [**`PROJECT_PLAN.md`**](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs/PROJECT_PLAN.md) — Comprehensive requirements, problem statement, personas, prioritized functional requirements (`FR-001` to `FR-092`), NFRs, and business rules.
2. [**`ARCHITECTURE.md`**](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs/ARCHITECTURE.md) — Layered modular monolith architecture, component responsibilities, Mermaid system diagrams, request flows, and directory structure.
3. [**`DATABASE_DESIGN.md`**](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs/DATABASE_DESIGN.md) — 11 Mongoose collection schemas, validation rules, compound indexes, retention policies, and Mermaid ER diagram.
4. [**`API_SPECIFICATION.md`**](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs/API_SPECIFICATION.md) — RESTful API catalog covering 12 modules, HTTP methods, request bodies, status codes, and auth boundaries.
5. [**`SECURITY_DESIGN.md`**](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs/SECURITY_DESIGN.md) — Authentication strategy (JWT in HTTP-only cookies), RBAC matrix, password hashing, input sanitization, CORS, and audit logging.
6. [**`UI_UX_BLUEPRINT.md`**](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs/UI_UX_BLUEPRINT.md) — Frontend route hierarchy, role access table, layout design, reusable components, responsive breakpoints, and UI states.
7. [**`TESTING_STRATEGY.md`**](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs/TESTING_STRATEGY.md) — Testing pyramid (Unit, API, Component, E2E), tools, measurable acceptance criteria, and execution reporting protocol.
8. [**`IMPLEMENTATION_ROADMAP.md`**](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs/IMPLEMENTATION_ROADMAP.md) — Complete 15-phase roadmap with prerequisites, owner actions, deliverables, and definition of done.
9. [**`DEPLOYMENT_PLAN.md`**](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs/DEPLOYMENT_PLAN.md) — Cloud production topology (MongoDB Atlas + Render + Vercel), build scripts, health checks, and cost notices.
10. [**`DECISIONS.md`**](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs/DECISIONS.md) — Formal Architecture Decision Records (ADR-001 through ADR-010) explaining key technical choices and trade-offs.
11. [**`PROGRESS.md`**](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs/PROGRESS.md) — Detailed task execution tracker for all 15 phases.

