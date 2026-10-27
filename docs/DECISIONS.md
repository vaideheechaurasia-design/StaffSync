# StaffSync — Architecture Decision Records (ADRs)

This document formalizes the key architectural, technical, and design decisions made for the StaffSync Human Resource Management System, including context, alternatives considered, decisions, and rationales.

---

## ADR-001: Modular Monolith vs. Microservices Architecture

* **Status:** Accepted
* **Context:** StaffSync is an enterprise HRMS being developed as an individual full-stack project for ServiceNow University / SkillWallet.
* **Alternatives Considered:**
  1. *Microservices:* Separate services for Auth, Employees, Attendance, Leaves, and Notifications communicating via REST/gRPC or message brokers (Kafka/RabbitMQ).
  2. *Modular Monolith:* A single unified backend codebase structured with strict module boundaries (routes, controllers, services, models).
* **Decision:** Adopt a **Modular Monolith** architecture.
* **Rationale:**
  * Microservices introduce massive operational complexity (distributed transactions, network failure modes, service discovery, multi-container deployments) which is counterproductive for an individual student developer.
  * A modular monolith provides the benefits of cohesive domain boundaries and easy refactoring while maintaining single-command local development and unified CI/CD deployment.

---

## ADR-002: Authentication via JWT in HTTP-Only Cookies vs. LocalStorage

* **Status:** Accepted
* **Context:** The application manages sensitive employee personnel and attendance data. A secure authentication session management mechanism is required.
* **Alternatives Considered:**
  1. *JWT stored in `localStorage`:* Easy to implement, but vulnerable to Cross-Site Scripting (XSS) attacks where malicious scripts extract the token.
  2. *JWT stored in HTTP-Only, SameSite Cookies:* Inaccessible to JavaScript; automatically attached by the browser on same-origin/whitelisted requests.
  3. *Stateful Server Sessions (Redis/Express-Session):* Highly secure, but requires provisioning and paying for an external Redis cache server.
* **Decision:** Use **JWT stored in HTTP-Only, SameSite Cookies**.
* **Rationale:** HTTP-only cookies eliminate the risk of client-side token theft via XSS without requiring external session storage infrastructure. `SameSite=Lax` (or `None` with `Secure` in cross-site production) effectively mitigates CSRF vectors when combined with standard REST header verification.

---

## ADR-003: User Collection (Auth) vs. Employee Collection (Profile) Normalization

* **Status:** Accepted
* **Context:** The system needs to manage credentials, system roles, and extensive employee personal and organizational details.
* **Alternatives Considered:**
  1. *Single Monolithic `User` Document:* Storing authentication fields, roles, contact details, department, salary, and employment history in a single schema.
  2. *Separated `User` and `Employee` Collections:* A 1-to-1 relationship between `User` (credentials, status, role) and `Employee` (HR attributes).
* **Decision:** **Separate `User` and `Employee` into distinct collections linked by `userId`.**
* **Rationale:**
  * Upholds the Principle of Least Privilege: Non-HR queries (e.g., fetching a team member's name or department) never touch the collection holding password hashes or login metadata.
  * Facilitates future authentication integrations (such as Google OAuth or enterprise SSO) without modifying the employee data schema.

---

## ADR-004: Styling Framework — Bootstrap 5 & Custom CSS vs. Tailwind CSS

* **Status:** Accepted
* **Context:** StaffSync requires a modern, responsive, accessible enterprise aesthetic appropriate for a B2B SaaS platform.
* **Alternatives Considered:**
  1. *Tailwind CSS:* Utility-first, highly customizable, but requires writing extensive verbose class strings and building component abstractions from scratch.
  2. *Material UI (MUI) / Ant Design:* Pre-built components, but introduces heavy bundle sizes, opinionated React wrappers, and complex custom styling overrides.
  3. *Bootstrap 5 + Custom CSS:* Industry-standard responsive grid, clean semantic components (cards, badges, modals, tables), lightweight, and easily customized with enterprise CSS theme variables.
* **Decision:** Utilize **Bootstrap 5 with Custom CSS**.
* **Rationale:** Bootstrap 5 provides immediate access to battle-tested responsive grids, accessible modals, responsive tables, and form elements. Combined with custom CSS variables, it produces a polished enterprise aesthetic with minimal boilerplate.

---

## ADR-005: Client-Side State Management — React Context API vs. Redux Toolkit

* **Status:** Accepted
* **Context:** The frontend needs to manage authenticated user state, active alerts, and global notification counts.
* **Alternatives Considered:**
  1. *Redux Toolkit:* Powerful state container, but introduces significant boilerplate (slices, dispatchers, selectors, thunks) unnecessary for this project scope.
  2. *React Context API + Custom Hooks:* Built into React; zero external dependencies; perfectly suited for low-to-medium frequency global updates like authentication state.
* **Decision:** Utilize **React Context API with Custom Hooks (`useAuth`, `useAlert`)**.
* **Rationale:** Keeps the client architecture lightweight, clean, and beginner-friendly while fulfilling all global state requirements.

---

## ADR-006: Backend Input Validation — `express-validator` vs. Joi / Zod

* **Status:** Accepted
* **Context:** API routes must validate and sanitize all incoming payloads before passing data to controllers or services.
* **Alternatives Considered:**
  1. *Zod / Joi:* Schema declaration libraries, powerful but require custom middleware wrappers to integrate with Express route chains.
  2. *`express-validator`:* Native Express middleware wrapping `validator.js`; allows declarative, route-level validation chains with standardized error extraction.
* **Decision:** Utilize **`express-validator`**.
* **Rationale:** Seamlessly integrates into Express route definitions, provides rich sanitization functions, and allows declarative validation rules with custom error messages.

---

## ADR-007: Attendance Check-In Model — Single Daily Document with Compound Index

* **Status:** Accepted
* **Context:** The application records daily employee check-ins and check-outs, calculating hours worked and flag statuses.
* **Alternatives Considered:**
  1. *Event-Sourced Punch Stream:* Storing every single punch as an individual event document and computing daily summaries dynamically.
  2. *Single Daily Document per Employee:* Storing `checkInTime`, `checkOutTime`, `totalHours`, and `status` in one document representing the calendar date.
* **Decision:** Utilize a **Single Daily Document per Employee with a Unique Compound Index on `{ employeeId: 1, date: 1 }`**.
* **Rationale:** The unique compound index enforces at the database level that an employee cannot check in twice on the same day. Reading daily attendance status becomes a fast, single-document lookup rather than an expensive aggregation query.

---

## ADR-008: Leave Balance Tracking — Explicit Annual Documents vs. Runtime Aggregation

* **Status:** Accepted
* **Context:** The system must enforce annual leave quotas across multiple categories (Annual, Casual, Sick, Unpaid).
* **Alternatives Considered:**
  1. *Dynamic Runtime Aggregation:* Summing all approved leave days dynamically from the `LeaveRequest` collection whenever balances are queried.
  2. *Explicit `LeaveBalance` Collection:* Dedicated documents tracking quotas and consumed days per employee per year.
* **Decision:** Utilize an **Explicit `LeaveBalance` Collection with Compound Index `{ employeeId: 1, year: 1 }`**.
* **Rationale:** Explicit balance tracking guarantees $O(1)$ quota verification during leave application submission, allows easy administrative adjustments or carryover rules, and prevents race conditions.

---

## ADR-009: Soft Deletion vs. Hard Deletion for Employee Records

* **Status:** Accepted
* **Context:** Employees who leave the organization must no longer have active system access, but their organizational history must be preserved.
* **Alternatives Considered:**
  1. *Hard Deletion (`deleteOne`):* Deletes the employee document and cascades deletion across attendance and leaves.
  2. *Soft Deletion:* Setting `status: "INACTIVE"` and `User.isActive: false`, retaining all related attendance, leave, and audit documents.
* **Decision:** Implement **Strict Soft Deletion**.
* **Rationale:** Hard deletion destroys historical attendance data, breaks foreign key references in audit logs and leave approvals, and violates labor compliance requirements.

---

## ADR-010: Database Platform (MongoDB Atlas) & Deployment Topology (Render + Vercel)

* **Status:** Accepted
* **Context:** Selecting a reliable, modern, cloud-hosted architecture that remains accessible and cost-effective for a student showcase.
* **Alternatives Considered:**
  1. *Single Monolithic VM (AWS EC2 / DigitalOcean Droplet):* Requires manual Linux server configuration, SSL certificate renewals, and cost commitments.
  2. *PaaS + DBaaS Topology (MongoDB Atlas + Render + Vercel):* Fully managed cloud database, automated Git-driven deployments, zero server management, and automatic HTTPS.
* **Decision:** Deploy to **MongoDB Atlas (DB) + Render (Node API) + Vercel (React Frontend)**.
* **Rationale:** Best-in-class developer experience, automated preview builds, and robust free/hobby tiers well suited for an individual capstone project.

