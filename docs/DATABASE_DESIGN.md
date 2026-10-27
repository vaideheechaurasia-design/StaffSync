# StaffSync — Database Architecture & Schema Specification

**Database Engine:** MongoDB (via MongoDB Atlas)  
**Object Data Modeling (ODM):** Mongoose (v8+)  
**Version:** 1.0.0 (Phase 1 Specification)  

---

## 1. Database Modeling Philosophy & Design Patterns

### 1.1 Normalized References vs. Embedded Documents
In MongoDB document modeling, choosing between embedding and referencing is determined by access patterns, data volatility, document growth limits, and cardinality:
* **References (`ObjectId` with `ref`):** Preferred when data is queried independently, frequently updated, or has an unbounded $1:N$ relationship. In StaffSync:
  * `User` and `Employee` are normalized to decouple authentication credentials from employment profile attributes.
  * `Attendance`, `LeaveRequest`, and `AuditLog` records reference `Employee` because they accumulate indefinitely over time; embedding them inside the employee document would risk violating MongoDB's 16MB document size limit and cause performance degradation.
  * `Department` is referenced by `Employee` to allow renaming or restructuring a department without performing massive update queries across hundreds of employee records.
* **Embedded Subdocuments:** Preferred for bounded, atomic, tightly coupled datasets that are never queried outside the parent document's context (e.g., `emergencyContact` and `address` within `Employee`, or `leaveQuotaBreakdown` inside `LeaveBalance`).

### 1.2 Separation of Authentication (`User`) and Profile (`Employee`)
StaffSync strictly separates the `User` identity from the `Employee` business entity:
* **The `User` Collection:** Stores strictly authentication and authorization credentials (email, hashed password, role, account status, security timestamps).
* **The `Employee` Collection:** Stores human resource, personal, and organizational data (employee ID, department, manager, title, phone, emergency contacts, hire date).
* **Rationale:** This separation ensures principle of least privilege in data access, simplifies security auditing, allows multiple auth providers or SSO in the future, and prevents sensitive credentials from leaking during standard HR profile queries.

### 1.3 Data Retention & Soft-Deletion Strategy
* HR regulations require permanent retention of historical employee data for compliance, tax, and dispute resolution.
* **Soft Deletion:** Employees are never deleted using MongoDB `deleteOne` or `deleteMany`. Instead, their status flag is updated (`status: "INACTIVE"`), and their linked `User.isActive` is set to `false`.
* Historical records (`Attendance`, `LeaveRequest`, `TrainingEnrollment`) remain intact and continue referencing the deactivated `Employee` ID.

---

## 2. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--|| EMPLOYEE : "authenticates as (1:1)"
    DEPARTMENT ||--o{ EMPLOYEE : "belongs to (1:N)"
    DEPARTMENT ||--o| EMPLOYEE : "headed by / manager (1:1)"
    EMPLOYEE ||--o{ EMPLOYEE : "reports to manager (1:N)"
    EMPLOYEE ||--o{ ATTENDANCE : "records daily (1:N)"
    EMPLOYEE ||--o{ LEAVE_REQUEST : "submits (1:N)"
    EMPLOYEE ||--o{ LEAVE_BALANCE : "holds annual (1:N)"
    EMPLOYEE ||--o{ TRAINING_ENROLLMENT : "enrolls in (1:N)"
    TRAINING_PROGRAM ||--o{ TRAINING_ENROLLMENT : "offers (1:N)"
    USER ||--o{ ANNOUNCEMENT : "publishes (1:N)"
    USER ||--o{ NOTIFICATION : "receives (1:N)"
    USER ||--o{ AUDIT_LOG : "triggers action (1:N)"

    USER {
        ObjectId _id PK
        string email UK
        string passwordHash
        string role "HR_ADMIN | MANAGER | EMPLOYEE"
        boolean isActive
        date lastLogin
    }

    EMPLOYEE {
        ObjectId _id PK
        ObjectId userId FK,UK
        string employeeCode UK
        string firstName
        string lastName
        ObjectId departmentId FK
        ObjectId managerId FK
        string designation
        date dateOfJoining
        string employmentType "FULL_TIME | PART_TIME | CONTRACT"
        string status "ACTIVE | INACTIVE | ON_LEAVE"
    }

    DEPARTMENT {
        ObjectId _id PK
        string name UK
        string code UK
        ObjectId managerId FK
        boolean isActive
    }

    ATTENDANCE {
        ObjectId _id PK
        ObjectId employeeId FK
        date date UK_COMPOUND
        date checkInTime
        date checkOutTime
        number totalHours
        string status "PRESENT | LATE | HALF_DAY | ABSENT"
    }

    LEAVE_REQUEST {
        ObjectId _id PK
        ObjectId employeeId FK
        string leaveType "ANNUAL | SICK | CASUAL | UNPAID"
        date startDate
        date endDate
        number totalDays
        string status "PENDING | APPROVED | REJECTED | CANCELLED"
        ObjectId reviewedBy FK
    }

    LEAVE_BALANCE {
        ObjectId _id PK
        ObjectId employeeId FK
        number year UK_COMPOUND
        number annualLeaveQuota
        number annualLeaveUsed
        number sickLeaveQuota
        number sickLeaveUsed
        number casualLeaveQuota
        number casualLeaveUsed
    }

    TRAINING_PROGRAM {
        ObjectId _id PK
        string title
        string trainer
        date startDate
        date endDate
        number capacity
        number enrolledCount
        string status "UPCOMING | ONGOING | COMPLETED | CANCELLED"
    }

    TRAINING_ENROLLMENT {
        ObjectId _id PK
        ObjectId programId FK
        ObjectId employeeId FK
        date enrolledAt
        string status "ENROLLED | COMPLETED | DROPPED"
    }

    ANNOUNCEMENT {
        ObjectId _id PK
        string title
        string content
        string priority "NORMAL | HIGH | URGENT"
        ObjectId authorId FK
        boolean isPinned
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId recipientId FK
        string title
        string message
        string type "LEAVE | ATTENDANCE | TRAINING | ANNOUNCEMENT"
        boolean isRead
    }

    AUDIT_LOG {
        ObjectId _id PK
        ObjectId actorId FK
        string action "CREATE | UPDATE | DELETE | STATUS_CHANGE"
        string targetEntity
        ObjectId targetId
        object changes
        date timestamp
    }
```

---

## 3. Detailed Collection Specifications

### 3.1 Collection: `users`
* **Purpose:** Stores authentication credentials, system roles, and account security flags. Contains no personal or HR data.
* **Fields:**
  * `_id` (`ObjectId`, Required, Primary Key): Unique MongoDB document identifier.
  * `email` (`String`, Required, Unique, Lowercase, Trimmed): Work email used as primary login credential.
  * `password` (`String`, Required): Bcrypt salted hash (minimum 10 rounds). Excluded by default from queries (`select: false`).
  * `role` (`String`, Required, Enum: `['HR_ADMIN', 'MANAGER', 'EMPLOYEE']`, Default: `'EMPLOYEE'`): Access level controlling RBAC policies.
  * `isActive` (`Boolean`, Required, Default: `true`): Account state. Disabled accounts are denied token issuance.
  * `passwordChangedAt` (`Date`, Optional): Timestamp for invalidating tokens issued before password changes.
  * `lastLogin` (`Date`, Optional): Timestamp of the most recent successful authentication.
  * `createdAt` / `updatedAt` (`Date`, Mongoose Timestamps).
* **Indexes:**
  * `{ email: 1 }` (Unique Index).
  * `{ role: 1 }` (Standard Index for administrative filtering).
* **Security & Access Restrictions:** Readable only by system auth services and HR/Admin; passwords never exposed in any API response.

### 3.2 Collection: `employees`
* **Purpose:** Stores complete professional, personal, and departmental profile records for staff members.
* **Fields:**
  * `_id` (`ObjectId`, Required, Primary Key).
  * `userId` (`ObjectId`, Required, Unique, Ref: `'User'`): 1-to-1 link to authentication document.
  * `employeeCode` (`String`, Required, Unique, Uppercase, Trimmed): Institutional identifier (e.g., `EMP-1001`).
  * `firstName` (`String`, Required, Trimmed, Max: 50).
  * `lastName` (`String`, Required, Trimmed, Max: 50).
  * `phone` (`String`, Optional, Trimmed).
  * `departmentId` (`ObjectId`, Required, Ref: `'Department'`): Organizational department.
  * `managerId` (`ObjectId`, Optional, Ref: `'Employee'`): Reporting manager hierarchy.
  * `designation` (`String`, Required, Trimmed, Max: 100): Official job title.
  * `dateOfJoining` (`Date`, Required, Default: `Date.now`).
  * `employmentType` (`String`, Required, Enum: `['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']`, Default: `'FULL_TIME'`).
  * `status` (`String`, Required, Enum: `['ACTIVE', 'INACTIVE', 'ON_LEAVE']`, Default: `'ACTIVE'`).
  * `address` (`Object`, Embedded Subdocument):
    * `street` (`String`), `city` (`String`), `state` (`String`), `zipCode` (`String`), `country` (`String`).
  * `emergencyContact` (`Object`, Embedded Subdocument):
    * `name` (`String`), `relationship` (`String`), `phone` (`String`).
  * `createdAt` / `updatedAt` (`Date`, Mongoose Timestamps).
* **Indexes:**
  * `{ userId: 1 }` (Unique Index).
  * `{ employeeCode: 1 }` (Unique Index).
  * `{ departmentId: 1, status: 1 }` (Compound Index for department queries).
  * `{ managerId: 1 }` (Index for manager direct reports queries).
* **Security & Access Restrictions:** Employees can read their own profile and edit address/phone/emergency contacts. Managers can view their department's employee profiles. Only HR can create, update sensitive job fields, or deactivate profiles.

### 3.3 Collection: `departments`
* **Purpose:** Defines functional organizational divisions (e.g., Engineering, Human Resources, Finance).
* **Fields:**
  * `_id` (`ObjectId`, Required, Primary Key).
  * `name` (`String`, Required, Unique, Trimmed, Max: 100): Department name (e.g., `Engineering`).
  * `code` (`String`, Required, Unique, Uppercase, Max: 10): Department code (e.g., `ENG`).
  * `description` (`String`, Optional, Max: 250).
  * `managerId` (`ObjectId`, Optional, Ref: `'Employee'`): Department Head.
  * `isActive` (`Boolean`, Required, Default: `true`).
  * `createdAt` / `updatedAt` (`Date`, Mongoose Timestamps).
* **Indexes:**
  * `{ name: 1 }` (Unique Index).
  * `{ code: 1 }` (Unique Index).
* **Access Restrictions:** Read access available to all authenticated users. Create, update, and deactivation restricted strictly to HR/Admin.

### 3.4 Collection: `attendances`
* **Purpose:** Daily time-tracking and punch logs.
* **Fields:**
  * `_id` (`ObjectId`, Required, Primary Key).
  * `employeeId` (`ObjectId`, Required, Ref: `'Employee'`): The employee recording attendance.
  * `date` (`Date`, Required): Normalized calendar date representing midnight UTC of the attendance day.
  * `checkInTime` (`Date`, Required): Exact ISO timestamp of the initial punch-in.
  * `checkOutTime` (`Date`, Optional): Exact ISO timestamp of the punch-out.
  * `totalHours` (`Number`, Optional, Default: 0): Computed duration in decimal hours (e.g., 8.25).
  * `status` (`String`, Required, Enum: `['PRESENT', 'LATE', 'HALF_DAY', 'ABSENT']`, Default: `'PRESENT'`).
  * `notes` (`String`, Optional, Max: 200): Explanatory note or regularization explanation.
  * `createdAt` / `updatedAt` (`Date`, Mongoose Timestamps).
* **Indexes:**
  * `{ employeeId: 1, date: 1 }` (Unique Compound Index — strictly prevents duplicate daily records per employee).
  * `{ date: 1, status: 1 }` (Compound Index for company-wide daily attendance aggregation).
  * `{ employeeId: 1, date: -1 }` (Index for rapid personal history timeline queries).
* **Access Restrictions:** Employees can record their own check-in/out. Managers can view attendance for their department/direct reports. HR can view all records and perform administrative regularizations.

### 3.5 Collection: `leaverequests`
* **Purpose:** Formal employee requests for time off and manager approval workflows.
* **Fields:**
  * `_id` (`ObjectId`, Required, Primary Key).
  * `employeeId` (`ObjectId`, Required, Ref: `'Employee'`).
  * `leaveType` (`String`, Required, Enum: `['ANNUAL', 'CASUAL', 'SICK', 'UNPAID']`).
  * `startDate` (`Date`, Required): Beginning date of leave (inclusive).
  * `endDate` (`Date`, Required): Ending date of leave (inclusive).
  * `totalDays` (`Number`, Required, Min: 0.5): Number of business days requested.
  * `reason` (`String`, Required, Trimmed, Min: 5, Max: 500).
  * `status` (`String`, Required, Enum: `['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']`, Default: `'PENDING'`).
  * `reviewedBy` (`ObjectId`, Optional, Ref: `'User'`): The manager or HR admin who processed the request.
  * `reviewComment` (`String`, Optional, Max: 300): Mandatory feedback if rejected.
  * `reviewedAt` (`Date`, Optional): Timestamp when status changed from PENDING.
  * `createdAt` / `updatedAt` (`Date`, Mongoose Timestamps).
* **Indexes:**
  * `{ employeeId: 1, status: 1 }` (Index for employee portal queries).
  * `{ status: 1, createdAt: -1 }` (Index for manager pending queue).
  * `{ employeeId: 1, startDate: 1, endDate: 1 }` (Index for overlap collision detection).
* **Access Restrictions:** Employees can create, view, and cancel their own pending leaves. Managers can review requests from their department reports. HR has universal review and override permissions.

### 3.6 Collection: `leavebalances`
* **Purpose:** Maintains annual leave quotas and tracks allocated vs. consumed days per employee.
* **Fields:**
  * `_id` (`ObjectId`, Required, Primary Key).
  * `employeeId` (`ObjectId`, Required, Ref: `'Employee'`).
  * `year` (`Number`, Required, Min: 2020, Max: 2100): Calendar year (e.g., 2026).
  * `annual` (`Object`, Embedded):
    * `quota` (`Number`, Required, Default: 15), `used` (`Number`, Required, Default: 0).
  * `casual` (`Object`, Embedded):
    * `quota` (`Number`, Required, Default: 10), `used` (`Number`, Required, Default: 0).
  * `sick` (`Object`, Embedded):
    * `quota` (`Number`, Required, Default: 10), `used` (`Number`, Required, Default: 0).
  * `unpaid` (`Object`, Embedded):
    * `used` (`Number`, Required, Default: 0).
  * `createdAt` / `updatedAt` (`Date`, Mongoose Timestamps).
* **Indexes:**
  * `{ employeeId: 1, year: 1 }` (Unique Compound Index — ensures exactly one balance sheet per employee per calendar year).
* **Access Restrictions:** Employees can view their own balances. HR has full authority to initialize or manually adjust balances with audit logging.

### 3.7 Collection: `announcements`
* **Purpose:** Company-wide news, urgent updates, and policy broadcasts.
* **Fields:**
  * `_id` (`ObjectId`, Required, Primary Key).
  * `title` (`String`, Required, Trimmed, Max: 150).
  * `content` (`String`, Required, Trimmed).
  * `priority` (`String`, Required, Enum: `['NORMAL', 'HIGH', 'URGENT']`, Default: `'NORMAL'`).
  * `category` (`String`, Required, Enum: `['GENERAL', 'POLICY', 'EVENT', 'ALERT']`, Default: `'GENERAL'`).
  * `authorId` (`ObjectId`, Required, Ref: `'User'`): HR admin author.
  * `isPinned` (`Boolean`, Required, Default: `false`).
  * `isActive` (`Boolean`, Required, Default: `true`).
  * `expiresAt` (`Date`, Optional): Automatic archival date.
  * `createdAt` / `updatedAt` (`Date`, Mongoose Timestamps).
* **Indexes:**
  * `{ isActive: 1, isPinned: -1, createdAt: -1 }` (Compound Index for main dashboard newsfeed).
* **Access Restrictions:** Read access to all authenticated staff. Create, update, pin, and archive restricted to HR/Admin.

### 3.8 Collection: `trainingprograms`
* **Purpose:** Catalogs internal workshops, compliance seminars, and technical training.
* **Fields:**
  * `_id` (`ObjectId`, Required, Primary Key).
  * `title` (`String`, Required, Trimmed, Max: 120).
  * `description` (`String`, Required, Trimmed, Max: 1000).
  * `trainer` (`String`, Required, Trimmed, Max: 80): Instructor name or organization.
  * `startDate` (`Date`, Required).
  * `endDate` (`Date`, Required).
  * `capacity` (`Number`, Required, Min: 1): Maximum allowed participants.
  * `enrolledCount` (`Number`, Required, Default: 0, Min: 0): Denormalized counter for rapid availability checks.
  * `locationOrUrl` (`String`, Required, Trimmed): Meeting room or virtual conference link.
  * `status` (`String`, Required, Enum: `['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']`, Default: `'UPCOMING'`).
  * `createdAt` / `updatedAt` (`Date`, Mongoose Timestamps).
* **Indexes:**
  * `{ status: 1, startDate: 1 }` (Compound Index for catalog browsing).
* **Access Restrictions:** All staff can view upcoming programs. Only HR/Admin can manage programs.

### 3.9 Collection: `trainingenrollments`
* **Purpose:** Tracks an individual employee's participation in a training program.
* **Fields:**
  * `_id` (`ObjectId`, Required, Primary Key).
  * `programId` (`ObjectId`, Required, Ref: `'TrainingProgram'`).
  * `employeeId` (`ObjectId`, Required, Ref: `'Employee'`).
  * `enrolledAt` (`Date`, Required, Default: `Date.now`).
  * `status` (`String`, Required, Enum: `['ENROLLED', 'ATTENDED', 'COMPLETED', 'DROPPED']`, Default: `'ENROLLED'`).
  * `feedback` (`String`, Optional, Max: 500).
  * `createdAt` / `updatedAt` (`Date`, Mongoose Timestamps).
* **Indexes:**
  * `{ programId: 1, employeeId: 1 }` (Unique Compound Index — prevents duplicate enrollments by an employee in the same program).
  * `{ employeeId: 1, status: 1 }` (Index for personal training history).
* **Access Restrictions:** Employees can enroll and drop their own registrations. HR/Trainers update completion status.

### 3.10 Collection: `notifications`
* **Purpose:** In-app operational alerts and status updates.
* **Fields:**
  * `_id` (`ObjectId`, Required, Primary Key).
  * `recipientId` (`ObjectId`, Required, Ref: `'User'`): The target user.
  * `title` (`String`, Required, Max: 100).
  * `message` (`String`, Required, Max: 250).
  * `type` (`String`, Required, Enum: `['LEAVE', 'ATTENDANCE', 'TRAINING', 'ANNOUNCEMENT', 'SYSTEM']`).
  * `actionLink` (`String`, Optional): Frontend route to relevant screen (e.g., `/leaves/manage`).
  * `isRead` (`Boolean`, Required, Default: `false`).
  * `createdAt` (`Date`, Mongoose Timestamps with TTL index for 60-day auto-expiry).
* **Indexes:**
  * `{ recipientId: 1, isRead: 1, createdAt: -1 }` (Compound Index for notification bell query).
  * `{ createdAt: 1 }` (TTL Index: expires after 60 days to conserve storage).
* **Access Restrictions:** Users can strictly read and mark their personal notifications as read.

### 3.11 Collection: `auditlogs`
* **Purpose:** Immutable compliance record of sensitive system actions.
* **Fields:**
  * `_id` (`ObjectId`, Required, Primary Key).
  * `actorId` (`ObjectId`, Required, Ref: `'User'`): Who performed the action.
  * `action` (`String`, Required, Enum: `['CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'OVERRIDE', 'LOGIN_FAILURE']`).
  * `targetEntity` (`String`, Required, Enum: `['USER', 'EMPLOYEE', 'DEPARTMENT', 'LEAVE', 'ATTENDANCE']`).
  * `targetId` (`ObjectId`, Optional): ID of the affected document.
  * `changes` (`Object`, Optional): Snapshot of before/after modified fields.
  * `ipAddress` (`String`, Optional): Client IP for forensic audit.
  * `timestamp` (`Date`, Required, Default: `Date.now`).
* **Indexes:**
  * `{ timestamp: -1 }` (Index for chronological audit viewing).
  * `{ targetEntity: 1, targetId: 1 }` (Index for resource history tracing).
* **Access Restrictions:** Immutable (No update or delete operations permitted). Read access strictly limited to HR/Admin.

