# StaffSync — RESTful API Specification

**API Base URL:** `/api/v1`  
**Data Format:** JSON (`application/json`)  
**Specification Version:** 1.0.0 (Phase 1 Design)  

---

## 1. Authentication vs. Authorization

Understanding the strict boundary between authentication and authorization is foundational to StaffSync's security architecture:

* **Authentication ("Who are you?"):**
  * The process of verifying a user's claimed identity.
  * In StaffSync, authentication occurs when an employee submits their email and password to `/api/v1/auth/login`. The system verifies the bcrypt password hash and issues a cryptographically signed JSON Web Token (JWT) encapsulating their user ID, role, and department.
* **Authorization ("What are you permitted to do?"):**
  * The process of determining whether an authenticated user has permission to access a specific resource or perform an action.
  * In StaffSync, authorization is enforced by backend middleware (`verifyToken`, `requireRole`, and resource ownership checks). Hiding buttons on the React frontend is merely a user experience convenience; **all authorization rules are strictly validated on the backend API**.

---

## 2. Global HTTP Status Code & Error Contract

StaffSync uses standard HTTP status codes:
* `200 OK`: Request succeeded; data returned.
* `201 Created`: Resource successfully created.
* `204 No Content`: Action succeeded with no body returned (e.g., resource removal).
* `400 Bad Request`: Malformed syntax, invalid parameters, or domain logic violation.
* `401 Unauthorized`: Missing or invalid authentication token.
* `403 Forbidden`: Authenticated, but lacking sufficient role or resource ownership permissions.
* `404 Not Found`: Target resource does not exist.
* `409 Conflict`: Unique constraint violation (e.g., duplicate email or check-in on the same day).
* `422 Unprocessable Entity`: Input validation failure (e.g., invalid email format, end date earlier than start date).
* `429 Too Many Requests`: Rate limit exceeded.
* `500 Internal Server Error`: Unhandled server-side exception.

### Standard Response Envelope
```json
// Success
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": { ... }
}

// Error
{
  "success": false,
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    { "field": "email", "issue": "A valid work email is required" }
  ]
}
```

---

## 3. Module Endpoint Catalog

### 3.1 Module: Authentication (`/api/v1/auth`)

#### `POST /auth/login`
* **Purpose:** Authenticates user credentials and issues a signed JWT in an HTTP-only cookie.
* **Authentication:** Public
* **Role/Permission:** Any
* **Request Body:**
  ```json
  {
    "email": "jane.doe@staffsync.internal",
    "password": "SecurePassword123!"
  }
  ```
* **Expected Response (`200 OK`):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "654c1f9b8c2d1e001a111111",
        "email": "jane.doe@staffsync.internal",
        "role": "EMPLOYEE",
        "employeeProfile": {
          "id": "654c1f9b8c2d1e001a222222",
          "employeeCode": "EMP-1002",
          "firstName": "Jane",
          "lastName": "Doe",
          "designation": "Software Engineer",
          "departmentId": "654c1f9b8c2d1e001a333333"
        }
      }
    }
  }
  ```
* **Validation & Errors:**
  * `400`: Missing email or password.
  * `401`: Invalid email or incorrect password.
  * `403`: Account is deactivated (`isActive: false`).
  * `429`: Exceeded 5 login attempts within 15 minutes.

#### `POST /auth/logout`
* **Purpose:** Clears the HTTP-only authentication cookie and invalidates client session.
* **Authentication:** Authenticated
* **Role/Permission:** All Roles
* **Expected Response (`200 OK`):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Logged out successfully"
  }
  ```

#### `GET /auth/me`
* **Purpose:** Validates the active cookie/JWT session and returns authenticated identity.
* **Authentication:** Authenticated
* **Role/Permission:** All Roles
* **Expected Response (`200 OK`):** Returns the current user's profile and permissions.
* **Errors:** `401 Unauthorized` if token is missing, expired, or invalid.

#### `POST /auth/change-password`
* **Purpose:** Allows logged-in user to change their password by validating old password.
* **Authentication:** Authenticated
* **Role/Permission:** All Roles
* **Request Body:** `{ "currentPassword": "...", "newPassword": "..." }`
* **Expected Response (`200 OK`)**

---

### 3.2 Module: Users Management (`/api/v1/users`)

#### `GET /users`
* **Purpose:** List all system users with role and status filtering.
* **Authentication:** Authenticated
* **Role/Permission:** `HR_ADMIN`
* **Query Params:** `?role=MANAGER&isActive=true&page=1&limit=20`
* **Expected Response (`200 OK`):** Array of User objects with pagination metadata.

#### `PATCH /users/:id/status`
* **Purpose:** Activate or deactivate a user account.
* **Authentication:** Authenticated
* **Role/Permission:** `HR_ADMIN`
* **Request Body:** `{ "isActive": false }`
* **Expected Response (`200 OK`)**

---

### 3.3 Module: Employees (`/api/v1/employees`)

#### `GET /employees`
* **Purpose:** Paginated employee directory with search and department filtering.
* **Authentication:** Authenticated
* **Role/Permission:** All Roles (Filtered based on role: Employees see directory card view; Managers see their department; HR sees all full profiles).
* **Query Params:** `?search=Jane&department=654c...&status=ACTIVE&page=1&limit=10`
* **Expected Response (`200 OK`):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": [
      {
        "_id": "654c1f9b8c2d1e001a222222",
        "employeeCode": "EMP-1002",
        "firstName": "Jane",
        "lastName": "Doe",
        "designation": "Software Engineer",
        "department": { "id": "654...", "name": "Engineering" },
        "status": "ACTIVE"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "totalRecords": 1, "totalPages": 1 }
  }
  ```

#### `POST /employees`
* **Purpose:** Create a new employee profile and provision linked User account.
* **Authentication:** Authenticated
* **Role/Permission:** `HR_ADMIN`
* **Request Body:**
  ```json
  {
    "email": "robert.smith@staffsync.internal",
    "password": "InitialTempPassword123!",
    "role": "EMPLOYEE",
    "employeeCode": "EMP-1003",
    "firstName": "Robert",
    "lastName": "Smith",
    "phone": "+1-555-0199",
    "departmentId": "654c1f9b8c2d1e001a333333",
    "managerId": "654c1f9b8c2d1e001a222222",
    "designation": "Junior Developer",
    "employmentType": "FULL_TIME",
    "dateOfJoining": "2026-02-01"
  }
  ```
* **Expected Response (`201 Created`)**
* **Validation & Errors:**
  * `400`: Missing required fields.
  * `409`: Duplicate email or employeeCode.

#### `GET /employees/:id`
* **Purpose:** Retrieve full profile of an employee.
* **Authentication:** Authenticated
* **Role/Permission:** `HR_ADMIN`, `MANAGER` (if within their department), or `EMPLOYEE` (self only).
* **Expected Response (`200 OK`):** Complete employee profile document.
* **Errors:** `403 Forbidden` if employee attempts to inspect another employee's private profile.

#### `PUT /employees/:id`
* **Purpose:** Update employee profile.
* **Authentication:** Authenticated
* **Role/Permission:** 
  * `HR_ADMIN`: Can modify all fields (department, title, salary, manager, status).
  * `EMPLOYEE`: Can strictly update personal fields (`phone`, `address`, `emergencyContact`) on own profile.
* **Expected Response (`200 OK`)**

#### `DELETE /employees/:id`
* **Purpose:** Soft-deactivate an employee record (sets `status: "INACTIVE"` and disables `User`).
* **Authentication:** Authenticated
* **Role/Permission:** `HR_ADMIN`
* **Expected Response (`200 OK`):** `{ "message": "Employee deactivated successfully." }`

---

### 3.4 Module: Departments (`/api/v1/departments`)

#### `GET /departments`
* **Purpose:** List all active organizational departments.
* **Authentication:** Authenticated
* **Role/Permission:** All Roles
* **Expected Response (`200 OK`):** Array of Department objects with head manager information.

#### `POST /departments`
* **Purpose:** Create a new department.
* **Authentication:** Authenticated
* **Role/Permission:** `HR_ADMIN`
* **Request Body:** `{ "name": "Human Resources", "code": "HR", "managerId": "654..." }`
* **Expected Response (`201 Created`)**

#### `PUT /departments/:id`
* **Purpose:** Update department details or reassign department head.
* **Authentication:** Authenticated
* **Role/Permission:** `HR_ADMIN`
* **Expected Response (`200 OK`)**

---

### 3.5 Module: Attendance (`/api/v1/attendance`)

#### `POST /attendance/check-in`
* **Purpose:** Record daily check-in timestamp for authenticated employee.
* **Authentication:** Authenticated
* **Role/Permission:** `EMPLOYEE`, `MANAGER`, `HR_ADMIN` (Self)
* **Request Body:** `{ "notes": "Working from office" }` (Optional)
* **Expected Response (`201 Created`):**
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "Checked in successfully",
    "data": {
      "date": "2026-10-28T00:00:00.000Z",
      "checkInTime": "2026-10-28T09:05:12.000Z",
      "status": "PRESENT"
    }
  }
  ```
* **Errors:**
  * `409 Conflict`: Check-in already recorded for today.

#### `POST /attendance/check-out`
* **Purpose:** Record daily check-out timestamp and calculate total working hours.
* **Authentication:** Authenticated
* **Role/Permission:** Self
* **Expected Response (`200 OK`):** Attendance record with `checkOutTime` and `totalHours`.
* **Errors:** `400 Bad Request` if no check-in exists for today or check-out already completed.

#### `GET /attendance/my-history`
* **Purpose:** Personal attendance history with month/year filtering.
* **Authentication:** Authenticated
* **Role/Permission:** Self
* **Query Params:** `?month=10&year=2026`
* **Expected Response (`200 OK`):** Daily attendance records and monthly stats (Present, Late, Half-day counts).

#### `GET /attendance/team`
* **Purpose:** View attendance logs of department direct reports.
* **Authentication:** Authenticated
* **Role/Permission:** `MANAGER`
* **Query Params:** `?date=2026-10-28`
* **Expected Response (`200 OK`):** Today's attendance summary for manager's team.

#### `GET /attendance/all`
* **Purpose:** Organization-wide attendance overview and reports.
* **Authentication:** Authenticated
* **Role/Permission:** `HR_ADMIN`
* **Query Params:** `?date=2026-10-28&department=654...`
* **Expected Response (`200 OK`)**

---

### 3.6 Module: Leave Requests (`/api/v1/leaves`)

#### `POST /leaves`
* **Purpose:** Submit a formal leave application.
* **Authentication:** Authenticated
* **Role/Permission:** All Roles (Self)
* **Request Body:**
  ```json
  {
    "leaveType": "ANNUAL",
    "startDate": "2026-11-10",
    "endDate": "2026-11-12",
    "totalDays": 3,
    "reason": "Attending family function."
  }
  ```
* **Expected Response (`201 Created`):** Created `LeaveRequest` document with status `PENDING`.
* **Validation & Errors:**
  * `422`: End date before start date, or negative totalDays.
  * `400`: Insufficient leave quota available.
  * `409`: Overlapping leave request exists for these dates.

#### `GET /leaves/my-requests`
* **Purpose:** Retrieve personal leave history.
* **Authentication:** Authenticated
* **Role/Permission:** Self
* **Expected Response (`200 OK`):** Array of leave requests sorted chronologically.

#### `GET /leaves/pending-approvals`
* **Purpose:** Retrieve leave applications awaiting review.
* **Authentication:** Authenticated
* **Role/Permission:** `MANAGER` (sees team requests), `HR_ADMIN` (sees all).
* **Expected Response (`200 OK`):** Array of pending leave requests with applicant details.

#### `PATCH /leaves/:id/status`
* **Purpose:** Approve or reject a leave application.
* **Authentication:** Authenticated
* **Role/Permission:** `MANAGER` (for direct reports), `HR_ADMIN`
* **Request Body:**
  ```json
  {
    "status": "APPROVED",
    "reviewComment": "Approved. Ensure handoff is completed."
  }
  ```
* **Expected Response (`200 OK`):** Updated leave request with status and updated balance.
* **Validation & Errors:**
  * `400`: Mandatory comment missing when `status: "REJECTED"`.
  * `403`: Manager unauthorized to review an employee from another department.

#### `DELETE /leaves/:id`
* **Purpose:** Cancel a pending leave request.
* **Authentication:** Authenticated
* **Role/Permission:** Self (Applicant only, before approval)
* **Expected Response (`200 OK`)**

---

### 3.7 Module: Leave Balances (`/api/v1/leave-balances`)

#### `GET /leave-balances/my-balance`
* **Purpose:** Get remaining and consumed leave quotas for current year.
* **Authentication:** Authenticated
* **Role/Permission:** Self
* **Expected Response (`200 OK`):** Quota breakdown for Annual, Sick, Casual, and Unpaid leave.

#### `GET /leave-balances/:employeeId`
* **Purpose:** HR/Manager view of an employee's leave balance.
* **Authentication:** Authenticated
* **Role/Permission:** `HR_ADMIN`, `MANAGER` (team only).
* **Expected Response (`200 OK`)**

#### `PUT /leave-balances/:employeeId`
* **Purpose:** Administrative adjustment of leave quotas.
* **Authentication:** Authenticated
* **Role/Permission:** `HR_ADMIN`
* **Request Body:** `{ "year": 2026, "annualQuota": 18, "reason": "Carryover adjustment" }`
* **Expected Response (`200 OK`)**

---

### 3.8 Module: Announcements (`/api/v1/announcements`)

#### `GET /announcements`
* **Purpose:** View active company announcements.
* **Authentication:** Authenticated
* **Role/Permission:** All Roles
* **Query Params:** `?limit=5`
* **Expected Response (`200 OK`):** Array of announcements with pinned announcements at the top.

#### `POST /announcements`
* **Purpose:** Publish a new company announcement.
* **Authentication:** Authenticated
* **Role/Permission:** `HR_ADMIN`
* **Request Body:**
  ```json
  {
    "title": "Annual Company Retreat 2026",
    "content": "We are excited to announce our upcoming annual retreat...",
    "priority": "HIGH",
    "category": "EVENT",
    "isPinned": true
  }
  ```
* **Expected Response (`201 Created`)**

#### `DELETE /announcements/:id`
* **Purpose:** Archive or remove an announcement.
* **Authentication:** Authenticated
* **Role/Permission:** `HR_ADMIN`
* **Expected Response (`200 OK`)**

---

### 3.9 Module: Training Programs & Enrollments (`/api/v1/training`)

#### `GET /training/programs`
* **Purpose:** Catalog of available training sessions.
* **Authentication:** Authenticated
* **Role/Permission:** All Roles
* **Expected Response (`200 OK`):** Array of upcoming programs with available seat counts.

#### `POST /training/programs`
* **Purpose:** Create a new corporate training program.
* **Authentication:** Authenticated
* **Role/Permission:** `HR_ADMIN`
* **Request Body:**
  ```json
  {
    "title": "Advanced React Patterns & Performance",
    "description": "Deep dive into React 18 hooks, memoization, and architecture.",
    "trainer": "Tech Excellence Academy",
    "startDate": "2026-11-15T09:00:00Z",
    "endDate": "2026-11-16T17:00:00Z",
    "capacity": 25,
    "locationOrUrl": "Virtual Room Alpha"
  }
  ```
* **Expected Response (`201 Created`)**

#### `POST /training/programs/:id/enroll`
* **Purpose:** Enroll current employee into a training program.
* **Authentication:** Authenticated
* **Role/Permission:** `EMPLOYEE`, `MANAGER`, `HR_ADMIN` (Self)
* **Expected Response (`201 Created`)**
* **Errors:**
  * `400`: Program has reached maximum capacity.
  * `409`: Employee already enrolled in this program.

#### `GET /training/my-enrollments`
* **Purpose:** List training sessions registered by current employee.
* **Authentication:** Authenticated
* **Role/Permission:** Self
* **Expected Response (`200 OK`)**

---

### 3.10 Module: Notifications (`/api/v1/notifications`)

#### `GET /notifications`
* **Purpose:** Get recent notifications for authenticated user.
* **Authentication:** Authenticated
* **Role/Permission:** Self
* **Query Params:** `?unreadOnly=false&limit=15`
* **Expected Response (`200 OK`):** Notification list with unread counter.

#### `PATCH /notifications/:id/read`
* **Purpose:** Mark a specific notification as read.
* **Authentication:** Authenticated
* **Role/Permission:** Self
* **Expected Response (`200 OK`)**

#### `PATCH /notifications/mark-all-read`
* **Purpose:** Mark all user notifications as read.
* **Authentication:** Authenticated
* **Role/Permission:** Self
* **Expected Response (`200 OK`)**

---

### 3.11 Module: Dashboard Analytics & Reports (`/api/v1/analytics`)

#### `GET /analytics/employee-dashboard`
* **Purpose:** Summary data for employee landing screen (today's clock status, remaining leaves, latest announcements).
* **Authentication:** Authenticated
* **Role/Permission:** `EMPLOYEE`, `MANAGER`, `HR_ADMIN`
* **Expected Response (`200 OK`)**

#### `GET /analytics/manager-dashboard`
* **Purpose:** Team overview for managers (team attendance today, pending leave approval count, team headcount).
* **Authentication:** Authenticated
* **Role/Permission:** `MANAGER`, `HR_ADMIN`
* **Expected Response (`200 OK`)**

#### `GET /analytics/hr-dashboard`
* **Purpose:** Executive HR metrics (total active headcount, department breakdown, today's attendance rate, pending leave total).
* **Authentication:** Authenticated
* **Role/Permission:** `HR_ADMIN`
* **Expected Response (`200 OK`)**

---

### 3.12 Module: Health Checks (`/api/v1/health`)

#### `GET /health`
* **Purpose:** Platform operational health diagnostic for uptime monitoring and deployment smoke testing.
* **Authentication:** Public
* **Role/Permission:** Public
* **Expected Response (`200 OK`):**
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-10-28T03:30:00.000Z",
    "uptime": 1420.5,
    "database": {
      "status": "connected",
      "name": "staffsync_db"
    },
    "environment": "production"
  }
  ```
* **Errors:** `503 Service Unavailable` if database connection is disconnected.

