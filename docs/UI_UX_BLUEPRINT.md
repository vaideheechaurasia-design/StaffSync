# StaffSync — Master UI/UX Blueprint & Application Shell Specification

**Target Platform:** React 18 Single Page Application (SPA)  
**Styling Framework:** Bootstrap 5.3 + Custom CSS Variables  
**Design Philosophy:** People First. Work Smarter. (Clean, Modern Enterprise SaaS)  
**Version:** 2.0.0 (Phase 2 Master Specification)  

---

## 1. Application Shell Architecture & Global Layout

The StaffSync web application shell consists of two primary layout architectures:
1. **`AuthLayout`:** Unauthenticated container dedicated to authentication flows (`/login`), providing an uncluttered, branded experience.
2. **`DashboardLayout`:** Authenticated application shell incorporating the sidebar navigation, topbar, breadcrumb area, main content viewport, and global notification/toast anchors.

```
+-----------------------------------------------------------------------------------------------+
| TOPBAR: [=] [StaffSync Logo]        [Search Employees...]     [Notif Bell (3)] [Avatar: Jane v]|
+-------------------+---------------------------------------------------------------------------+
| SIDEBAR           | BREADCRUMBS: Home > Leaves > Submit Leave                                 |
| (Desktop: 260px   +---------------------------------------------------------------------------+
|  Tablet: 72px     | PAGE HEADER: [H1: Submit Leave Request]             [Button: View Balances]|
|  Mobile: Offcanvas| Subtitle: Submit a formal request for paid time off.                      |
|                   +---------------------------------------------------------------------------+
| - Dashboard       | MAIN CONTENT CONTAINER (Fluid grid with max-width 1400px)                 |
| - Employees       |                                                                           |
| - Departments     | +-----------------------------------------+ +---------------------------+ |
| - Attendance      | | LEAVE APPLICATION FORM                  | | REMAINING LEAVE QUOTAS    | |
| - Leaves          | | - Leave Type: [Annual Leave       v]    | | - Annual: 11 / 15 days    | |
| - Announcements   | | - Date Range: [2026-11-10] to [2026-11-12] | - Casual:  8 / 10 days    | |
| - Training        | | - Calculated Days: 3 Business Days      | | - Sick:    9 / 10 days    | |
| - Reports (HR)    | | - Reason: [Attending family event...]   | | - Unpaid:  0 days         | |
|                   | |                                         | +---------------------------+ |
|                   | | [Submit Application Button]   [Cancel]  |                               |
|                   | +-----------------------------------------+                               |
|                   |                                                                           |
| [Collapse Sidebar]| FOOTER: StaffSync v1.0.0 • ServiceNow University Capstone • Status: Healthy|
| [Logout Button]   |                                                                           |
+-------------------+---------------------------------------------------------------------------+
```

### 1.1 Shell Subcomponents & Layout Responsibilities
* **Top Navigation Bar (`Topbar`):** Fixed to top of viewport ($64\text{px}$ height). Contains:
  * Brand logo linked to role dashboard.
  * Mobile hamburger button ($<992\text{px}$).
  * Global search input bar (debounced search for staff members).
  * Notification bell icon with red unread count badge ($>0$) opening the notification dropdown drawer.
  * User profile avatar dropdown displaying current user's name, designation, "My Profile", "Settings", and "Logout".
* **Left Vertical Navigation (`Sidebar`):**
  * Fixed left ($260\text{px}$ desktop).
  * Renders role-filtered navigation items with high-contrast active route indicators (`--ss-color-accent` left border).
  * Tablet viewport ($768\text{px}-991\text{px}$): Collapses to slim icon-only bar ($72\text{px}$) with hover tooltips.
  * Mobile viewport ($<768\text{px}$): Offcanvas slide-out drawer with backdrop.
* **Breadcrumb & Page Title Area (`PageHeader`):**
  * Displays semantic `<nav aria-label="Breadcrumb">` showing hierarchical route trail.
  * Page title rendered in `<h1>` with supporting descriptive text and primary action button.
* **Main Content Container:**
  * Fluid responsive container (`padding: 24px` desktop, `16px` mobile).
  * Constrained to a max-width of $1400\text{px}$ on ultra-wide screens to prevent over-stretched tables and forms.
* **Global Feedback Anchors:**
  * Fixed top-right container for floating `ToastNotification` items ($Z\text{-index}: 1080$).
  * Global modal anchor for `ConfirmDialog` and `ModalForm` dialogs ($Z\text{-index}: 1055$).

---

## 2. Role-Based Navigation Specifications

Navigation links are conditionally displayed based on the authenticated user's role. 

> [!IMPORTANT]
> **Authorization Security Rule:** Hiding navigation links on the client is strictly a user convenience to prevent navigation clutter. **Backend authorization middleware enforces all actual access controls.** Tampering with client routing or issuing direct API calls from unauthorized roles will strictly yield `HTTP 403 Forbidden`.

### 2.1 Navigation Menu for `HR_ADMIN` (Organization Governance)

| Navigation Label | Destination Route | Semantic Icon Concept | Required Role | Desktop Visibility | Mobile Visibility |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **HR Dashboard** | `/dashboard/hr` | `speedometer2` (Dashboard) | `HR_ADMIN` | Always Visible | Always Visible |
| **Employees** | `/employees` | `people` (Users Group) | `HR_ADMIN` | Always Visible | Always Visible |
| **Departments** | `/departments` | `diagram-3` (Org Structure) | `HR_ADMIN` | Always Visible | Always Visible |
| **Company Attendance** | `/attendance/admin`| `calendar-check` (Calendar Tick)| `HR_ADMIN` | Always Visible | Always Visible |
| **Leave Approvals** | `/leaves/approvals`| `envelope-check` (Mail Tick) | `HR_ADMIN` | Always Visible (Badge) | Always Visible (Badge) |
| **Announcements** | `/announcements` | `megaphone` (Broadcast) | `HR_ADMIN` | Always Visible | Always Visible |
| **Training Programs** | `/training` | `mortarboard` (Cap/Graduation) | `HR_ADMIN` | Always Visible | Always Visible |
| **HR Reports** | `/reports` | `graph-up` (Analytics Graph) | `HR_ADMIN` | Always Visible | Always Visible |
| **My Personal Space** | `/dashboard/employee`| `person-workspace` (Desk) | `HR_ADMIN` | Secondary Group | Drawer Menu |
| **Notifications** | `/notifications` | `bell` (Bell Alert) | `HR_ADMIN` | Topbar + Nav | Always Visible |
| **My Profile** | `/profile` | `person-circle` (Avatar) | `HR_ADMIN` | Topbar Dropdown | Drawer Footer |

### 2.2 Navigation Menu for `MANAGER` (Department & Team Supervision)

| Navigation Label | Destination Route | Semantic Icon Concept | Required Role | Desktop Visibility | Mobile Visibility |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **Manager Dashboard**| `/dashboard/manager`| `speedometer2` (Dashboard) | `MANAGER` | Always Visible | Always Visible |
| **Team Attendance** | `/attendance/team` | `calendar-check` (Calendar Tick)| `MANAGER` | Always Visible | Always Visible |
| **Leave Approvals** | `/leaves/approvals`| `envelope-check` (Mail Tick) | `MANAGER` | Always Visible (Badge) | Always Visible (Badge) |
| **Department Staff** | `/employees` | `people` (Users Group) | `MANAGER` | Always Visible | Always Visible |
| **Departments** | `/departments` | `diagram-3` (Org Structure) | `MANAGER` | Always Visible (Read) | Always Visible (Read) |
| **My Attendance** | `/attendance` | `clock` (Time Punch) | `MANAGER` | Always Visible | Always Visible |
| **My Leaves** | `/leaves` | `calendar-range` (Date Range)| `MANAGER` | Always Visible | Always Visible |
| **Announcements** | `/announcements` | `megaphone` (Broadcast) | `MANAGER` | Always Visible | Always Visible |
| **Training Catalog** | `/training` | `mortarboard` (Cap/Graduation) | `MANAGER` | Always Visible | Always Visible |
| **Notifications** | `/notifications` | `bell` (Bell Alert) | `MANAGER` | Topbar + Nav | Always Visible |
| **My Profile** | `/profile` | `person-circle` (Avatar) | `MANAGER` | Topbar Dropdown | Drawer Footer |

### 2.3 Navigation Menu for `EMPLOYEE` (Personal Self-Service)

| Navigation Label | Destination Route | Semantic Icon Concept | Required Role | Desktop Visibility | Mobile Visibility |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **My Dashboard** | `/dashboard/employee`| `speedometer2` (Dashboard) | `EMPLOYEE` | Always Visible | Always Visible |
| **Daily Attendance** | `/attendance` | `clock` (Time Punch) | `EMPLOYEE` | Always Visible | Always Visible |
| **My Leaves** | `/leaves` | `calendar-range` (Date Range)| `EMPLOYEE` | Always Visible | Always Visible |
| **Apply for Leave** | `/leaves/apply` | `plus-circle` (Plus Circle) | `EMPLOYEE` | Quick Action | Drawer Menu |
| **Staff Directory** | `/employees` | `people` (Directory Cards) | `EMPLOYEE` | Always Visible | Always Visible |
| **Announcements** | `/announcements` | `megaphone` (Broadcast) | `EMPLOYEE` | Always Visible | Always Visible |
| **Training Catalog** | `/training` | `mortarboard` (Cap/Graduation) | `EMPLOYEE` | Always Visible | Always Visible |
| **Notifications** | `/notifications` | `bell` (Bell Alert) | `EMPLOYEE` | Topbar + Nav | Always Visible |
| **My Profile** | `/profile` | `person-circle` (Avatar) | `EMPLOYEE` | Topbar Dropdown | Drawer Footer |

---

## 3. Comprehensive Form Validation Matrix

The following matrix standardizes form controls, client-side validation rules, user-friendly feedback strings, and backend validation dependencies across all major system workflows.

| Form Name | Field Name | Input Type | Required? | Length / Range Limits | Allowed Format / Values | Client Validation Behavior | User-Facing Error Message | Backend Validation Dependency |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| **Login** | `email` | `email` | **Yes** | Max 100 chars | Standard email format (`user@domain.com`) | Regex check on blur | "Please enter a valid work email address." | `express-validator.isEmail()` |
| **Login** | `password` | `password` | **Yes** | Min 6 chars | Plain text | Checks length $\ge 6$ on submit | "Password must be at least 6 characters." | `bcryptjs.compare()` |
| **Onboard Employee**| `email` | `email` | **Yes** | Max 100 chars | Valid email | Regex check on blur | "A valid work email is required." | `isEmail()`, unique check |
| **Onboard Employee**| `password` | `password` | **Yes** | Min 8 chars | Plain text | Checks length $\ge 8$ on submit | "Temporary password must be at least 8 characters." | Salt & hash pre-save hook |
| **Onboard Employee**| `role` | `select` | **Yes** | Fixed enum | `HR_ADMIN`, `MANAGER`, `EMPLOYEE` | Select validation | "Please assign a system role." | `isIn(['HR_ADMIN','MANAGER','EMPLOYEE'])` |
| **Onboard Employee**| `employeeCode`| `text` | **Yes** | 4–20 chars | Uppercase alphanumeric (e.g., `EMP-1002`) | Uppercase auto-transform | "Employee code is required (e.g. EMP-1001)." | Unique Mongoose index |
| **Onboard Employee**| `firstName` | `text` | **Yes** | 2–50 chars | Alpha characters, spaces, hyphens | Trim, length check | "First name must be between 2 and 50 characters." | `isLength({ min: 2, max: 50 })` |
| **Onboard Employee**| `lastName` | `text` | **Yes** | 2–50 chars | Alpha characters, spaces, hyphens | Trim, length check | "Last name must be between 2 and 50 characters." | `isLength({ min: 2, max: 50 })` |
| **Onboard Employee**| `phone` | `tel` | Optional | 10–15 digits | E.164 or formatted phone | Regex check if filled | "Please enter a valid phone number (10-15 digits)." | Optional regex sanitizer |
| **Onboard Employee**| `departmentId`| `select` | **Yes** | ObjectId | Active department IDs | Must select an option | "Please assign a department." | `isMongoId()`, foreign key check |
| **Onboard Employee**| `managerId` | `select` | Optional | ObjectId | Active manager employee IDs | Dropdown selection | N/A | `isMongoId()` if present |
| **Onboard Employee**| `designation` | `text` | **Yes** | 2–100 chars | Job title string | Trim, length check | "Designation / Job title is required." | `notEmpty()` |
| **Onboard Employee**| `employmentType`|`select` | **Yes** | Fixed enum | `FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERN` | Select validation | "Please select an employment type." | `isIn([...])` |
| **Onboard Employee**| `dateOfJoining`|`date` | **Yes** | Valid date | ISO date format (`YYYY-MM-DD`) | Date picker verification | "Please select the date of joining." | `isISO8601()` |
| **Department Form** | `name` | `text` | **Yes** | 2–100 chars | Trimmed string | Trim, length check | "Department name must be between 2 and 100 characters." | Unique Mongoose index |
| **Department Form** | `code` | `text` | **Yes** | 2–10 chars | Uppercase alphanumeric (e.g., `ENG`, `HR`) | Auto-uppercase | "Department code must be 2-10 characters (e.g., ENG)." | Unique Mongoose index |
| **Department Form** | `managerId` | `select` | Optional | ObjectId | Active employee IDs | Dropdown selection | N/A | `isMongoId()` if present |
| **Department Form** | `description` | `textarea`| Optional | Max 250 chars | Plain text | Character counter | "Description cannot exceed 250 characters." | `isLength({ max: 250 })` |
| **Check-In Action** | `notes` | `text` | Optional | Max 200 chars | Plain text | Max length check | "Notes cannot exceed 200 characters." | `isLength({ max: 200 })` |
| **Leave Request** | `leaveType` | `select` | **Yes** | Fixed enum | `ANNUAL`, `CASUAL`, `SICK`, `UNPAID` | Select validation | "Please choose a leave type." | `isIn(['ANNUAL','CASUAL','SICK','UNPAID'])`|
| **Leave Request** | `startDate` | `date` | **Yes** | Valid date | Must be today or future date | Date $\ge$ Today check | "Start date cannot be in the past." | Date boundary check |
| **Leave Request** | `endDate` | `date` | **Yes** | Valid date | Must be $\ge$ `startDate` | Date comparison on blur | "End date cannot be earlier than start date." | `endDate >= startDate` validator |
| **Leave Request** | `totalDays` | `number` | **Yes** | Min 0.5 | Positive decimal | Auto-calculated from dates | "Total days must be at least 0.5 days." | Quota comparison check |
| **Leave Request** | `reason` | `textarea`| **Yes** | 5–500 chars | Plain text | Character counter on input | "Please provide a reason (5–500 characters)." | `isLength({ min: 5, max: 500 })` |
| **Leave Review** | `reviewComment`|`textarea`| **Conditional**| 5–300 chars | Plain text | **Required if rejecting** | "A reason is required when rejecting a leave request." | Required when status is `REJECTED` |
| **Announcement Form**| `title` | `text` | **Yes** | 3–150 chars | Plain text | Trim, length check | "Title must be between 3 and 150 characters." | `isLength({ min: 3, max: 150 })` |
| **Announcement Form**| `content` | `textarea`| **Yes** | Min 10 chars | Plain text / Markdown | Trim, length check | "Content must be at least 10 characters long." | `isLength({ min: 10 })` |
| **Announcement Form**| `priority` | `select` | **Yes** | Fixed enum | `NORMAL`, `HIGH`, `URGENT` | Select validation | "Please select a priority level." | `isIn(['NORMAL','HIGH','URGENT'])` |
| **Announcement Form**| `category` | `select` | **Yes** | Fixed enum | `GENERAL`, `POLICY`, `EVENT`, `ALERT` | Select validation | "Please select an announcement category." | `isIn(['GENERAL','POLICY','EVENT','ALERT'])`|
| **Announcement Form**| `isPinned` | `checkbox`| Optional | Boolean | `true` or `false` | Default unchecked | N/A | `isBoolean()` |
| **Training Form** | `title` | `text` | **Yes** | 3–120 chars | Plain text | Trim, length check | "Workshop title must be between 3 and 120 characters." | `isLength({ min: 3, max: 120 })` |
| **Training Form** | `trainer` | `text` | **Yes** | 2–80 chars | Trainer / Org name | Trim, length check | "Trainer name must be between 2 and 80 characters." | `isLength({ min: 2, max: 80 })` |
| **Training Form** | `startDate` | `datetime`| **Yes** | Valid ISO date | Future date | Must be $\ge$ Today | "Start date and time must be in the future." | `isISO8601()` |
| **Training Form** | `endDate` | `datetime`| **Yes** | Valid ISO date | Must be $\ge$ `startDate` | Comparison check | "End date must be after start date." | `endDate >= startDate` |
| **Training Form** | `capacity` | `number` | **Yes** | Min 1, Max 500 | Positive integer | Integer verification | "Capacity must be at least 1 participant." | `isInt({ min: 1, max: 500 })` |
| **Training Form** | `locationOrUrl`|`text` | **Yes** | 2–200 chars | Room name or URL | Non-empty check | "Please enter a meeting room or virtual link." | `notEmpty()` |
| **Change Password** | `currentPassword`|`password`| **Yes** | Min 6 chars | Current password | Non-empty check | "Please enter your current password." | `bcryptjs.compare()` |
| **Change Password** | `newPassword`| `password`| **Yes** | Min 8 chars | New password | Length check | "New password must be at least 8 characters." | Cannot equal old password |

---

## 4. Unresolved Decisions Requiring Confirmation

The following form constraints represent standard recommendations and require confirmation during Phase 2 review:
1. **Password Complexity Rule:** We have specified a minimum length of 8 characters for temporary and new passwords. Does your evaluation require additional complexity rules (e.g. 1 uppercase, 1 number, 1 special character)?
2. **Employee Code Convention:** We recommend an institutional format of `EMP-` followed by 4 digits (e.g. `EMP-1001`). Is this convention approved for your demo data?
3. **Emergency Contact Multiplicity:** We have modeled a single primary emergency contact per employee (`name`, `relationship`, `phone`). Is one contact sufficient for your project scope?
