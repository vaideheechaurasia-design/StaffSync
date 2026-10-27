# StaffSync — Page Specifications & Dashboard Data Contracts

**Specification Type:** Frontend Application Blueprint & Route Contracts  
**Target Roles:** `HR_ADMIN`, `MANAGER`, `EMPLOYEE`  
**Layouts Employed:** `PublicLayout`, `AuthLayout`, `DashboardLayout`  
**Version:** 2.0.0 (Phase 2 Specification)  

---

## 1. Complete Page Catalog & Specifications

---

### Page 1: User Login (`/login`)
1. **Purpose:** Secure authentication portal allowing employees, managers, and administrators to verify identity and obtain an active session cookie.
2. **Roles Allowed:** Public (Unauthenticated). Authenticated users are automatically redirected to `/dashboard`.
3. **Route:** `/login`
4. **Main Layout:** `AuthLayout` (Centered elevated card on dark navy gradient `#0F2027` to `#2C5364`).
5. **Components:** `LoginForm`, `BrandLogoHeader`, `AlertBanner`, `DemoCredentialPills`, `SubmitButtonWithSpinner`.
6. **Data Displayed:** System brand tagline ("People First. Work Smarter."), login form labels, clickable demo credentials pill bar (e.g., "Demo HR", "Demo Manager", "Demo Employee").
7. **Primary Actions:** Submit Login ("Sign In"). **Secondary Actions:** Fill demo credentials with 1-click.
8. **Form Fields & Validation:**
   * `email`: Required, valid email format, trimmed. Client error: "Please enter your valid work email address."
   * `password`: Required, min 6 characters. Client error: "Password must be at least 6 characters."
9. **Loading State:** Sign In button disables and displays spinning indicator with text "Verifying credentials...".
10. **Empty State:** N/A (Standard credentials form).
11. **Error State:** Red alert banner above inputs: "Invalid email or password" (401) or "Account has been deactivated" (403) or "Too many failed attempts. Try again in 15 minutes." (429).
12. **Success Feedback:** Brief green checkmark toast, followed by immediate navigation to `/dashboard`.
13. **Responsive Behavior:** Card takes $420\text{px}$ width on desktop; full width with $16\text{px}$ side margins on mobile.

---

### Page 2: HR / Admin Dashboard (`/dashboard/hr`)
1. **Purpose:** Executive command center providing organizational workforce metrics, attendance rates, pending approvals, and quick administrative shortcuts.
2. **Roles Allowed:** `HR_ADMIN`.
3. **Route:** `/dashboard/hr`
4. **Main Layout:** `DashboardLayout`.
5. **Components:** `PageHeader`, `StatCardGrid` (4 cards), `DepartmentDistributionChart`, `RecentAttendanceTable`, `PendingLeaveSummaryWidget`, `QuickActionsBar`.
6. **Data Displayed:** Total active headcount, today's attendance percentage, total on leave today, pending leave applications count, departmental employee breakdown, last 5 employee check-ins.
7. **Primary Actions:** "Onboard New Employee", "Create Department", "Publish Announcement". **Secondary Actions:** "View Full Attendance Log", "Review Pending Leaves".
8. **Form Fields & Validation:** N/A (Dashboard view).
9. **Loading State:** 4 skeleton metric cards with shimmering gradient; skeleton table rows.
10. **Empty State:** If company has zero records, renders `EmptyState`: "Welcome to StaffSync! Begin by onboarding your first department and employee."
11. **Error State:** Non-blocking error card with "Retry loading metrics" button.
12. **Success Feedback:** N/A.
13. **Responsive Behavior:** 4-column cards on desktop ($\ge 1200\text{px}$), 2-column on tablet ($768\text{px}-1199\text{px}$), 1-column stacked on mobile ($<768\text{px}$). Charts resize responsively.

---

### Page 3: Manager Dashboard (`/dashboard/manager`)
1. **Purpose:** Departmental supervision hub enabling managers to monitor team attendance, process pending leave requests, and track department capacity.
2. **Roles Allowed:** `MANAGER`, `HR_ADMIN`.
3. **Route:** `/dashboard/manager`
4. **Main Layout:** `DashboardLayout`.
5. **Components:** `PageHeader`, `StatCardGrid` (3 cards), `TeamAttendanceTodayWidget`, `PendingTeamLeavesTable`, `QuickApprovalModal`, `PersonalPunchWidget`.
6. **Data Displayed:** Team total headcount, team members present today, pending team leave count, tabular list of pending team leave applications (applicant name, dates, days, reason).
7. **Primary Actions:** "Review Leave Application" (opens approve/reject modal), "Check In / Out" (Self). **Secondary Actions:** "View Full Team Attendance".
8. **Form Fields & Validation:** Modal review comment field: Required if rejecting (min 5 chars); optional if approving.
9. **Loading State:** Shimmering card skeletons and table placeholders.
10. **Empty State:** Table displays `EmptyState`: "No pending leave requests from your team! All caught up." with a green checkmark illustration.
11. **Error State:** Error banner: "Unable to load team records. Please check your connection."
12. **Success Feedback:** Toast: "Leave request approved successfully" upon modal confirmation.
13. **Responsive Behavior:** 3-column cards on desktop, stacked on mobile. Tables enable horizontal scroll.

---

### Page 4: Employee Dashboard (`/dashboard/employee`)
1. **Purpose:** Personalized self-service portal for individual staff members to clock daily attendance, view remaining leave quotas, inspect company announcements, and see upcoming training.
2. **Roles Allowed:** `EMPLOYEE`, `MANAGER`, `HR_ADMIN`.
3. **Route:** `/dashboard/employee`
4. **Main Layout:** `DashboardLayout`.
5. **Components:** `PageHeader`, `PunchClockWidget` (interactive check-in/out), `LeaveBalanceSummaryCard`, `RecentAnnouncementsFeed`, `MyRecentAttendanceTable`.
6. **Data Displayed:** Live clock, today's punch status ("Not Checked In" / "Checked In at 09:12 AM" / "Checked Out at 05:30 PM"), remaining Annual, Casual, Sick days, latest 3 pinned/active announcements.
7. **Primary Actions:** "Check In" / "Check Out", "Apply for Leave". **Secondary Actions:** "View Attendance History", "Browse Training Catalog".
8. **Form Fields & Validation:** Optional check-in note (max 200 chars).
9. **Loading State:** Skeleton punch card and placeholder announcement cards.
10. **Empty State:** If zero announcements exist: "No company announcements at this time."
11. **Error State:** Alert banner if clock service fails.
12. **Success Feedback:** Green banner: "Checked in successfully at 09:14 AM" with sound-free visual cue.
13. **Responsive Behavior:** 2-column layout on desktop (Punch clock & balances on left; announcements & history on right); stacked 1-column on mobile.

---

### Page 5: Employee Directory (`/employees`)
1. **Purpose:** Centralized roster of staff members with search, department filtering, and status badges.
2. **Roles Allowed:** All Authenticated (`HR_ADMIN`, `MANAGER`, `EMPLOYEE` — scope filtered).
3. **Route:** `/employees`
4. **Main Layout:** `DashboardLayout`.
5. **Components:** `PageHeader`, `FilterBar` (Search input, Department select, Status filter), `DataTable` / `CardGridToggle`, `PaginationControls`.
6. **Data Displayed:** Employee code, full name, avatar placeholder, job title, department name, work email, status badge (`ACTIVE` / `INACTIVE`).
7. **Primary Actions:** "Add Employee" (HR only), Click employee row to navigate to details. **Secondary Actions:** Export directory (HR only), toggle table/card view.
8. **Form Fields & Validation:** Search query (debounced 300ms).
9. **Loading State:** 10 animated table skeleton rows.
10. **Empty State:** `EmptyState`: "No employees found matching your search criteria." with a "Clear Filters" button.
11. **Error State:** Error banner with retry button.
12. **Success Feedback:** N/A.
13. **Responsive Behavior:** Desktop shows 7-column table; mobile transitions to stacked profile cards showing Avatar, Name, Title, and Department with tap-to-view.

---

### Page 6: Employee Profile & Details (`/employees/:id`)
1. **Purpose:** Detailed view of an employee's professional record, organizational hierarchy, and personal contacts.
2. **Roles Allowed:** `HR_ADMIN`, `MANAGER` (same department), `EMPLOYEE` (self only).
3. **Route:** `/employees/:id`
4. **Main Layout:** `DashboardLayout`.
5. **Components:** `ProfileHeaderBanner`, `TabNavigation` (Overview, Job Details, Contact & Emergency, Leave & Attendance History), `InfoCardList`, `DeactivateConfirmModal`.
6. **Data Displayed:** Full name, code, designation, department, reporting manager link, hire date, employment type, phone, address, emergency contact name/phone.
7. **Primary Actions:** "Edit Profile" (HR or Self for personal fields), "Deactivate Employee" (HR only). **Secondary Actions:** "Back to Directory".
8. **Form Fields & Validation:** N/A (View page; actions trigger edit mode or modal).
9. **Loading State:** Profile card skeleton with tab placeholders.
10. **Empty State:** If ID does not exist: triggers 404 page.
11. **Error State:** If unauthorized: redirects to `/unauthorized`.
12. **Success Feedback:** Toast: "Employee profile updated successfully" after edit modal save.
13. **Responsive Behavior:** Header avatar and stats stack vertically on mobile. Tabs transform into horizontal scrollable pill bar.

---

### Page 7: Onboard New Employee (`/employees/create`)
1. **Purpose:** Administrative onboarding form for HR to provision a new user account, assign employment parameters, and initialize leave quotas.
2. **Roles Allowed:** `HR_ADMIN`.
3. **Route:** `/employees/create`
4. **Main Layout:** `DashboardLayout`.
5. **Components:** `PageHeader`, `Breadcrumbs`, `MultiSectionForm`, `SubmitActionBar`.
6. **Data Displayed:** Section 1: Account Credentials; Section 2: Personal Information; Section 3: Job & Department Assignment.
7. **Primary Actions:** "Save & Onboard Employee". **Secondary Actions:** "Cancel" (returns to directory).
8. **Form Fields & Validation:**
   * Account: `email` (Required, valid email), `password` (Required, min 8 chars), `role` (Required enum).
   * Personal: `firstName` (Required, 2-50 chars), `lastName` (Required, 2-50 chars), `phone` (Optional, 10-15 chars).
   * Job: `employeeCode` (Required, e.g. `EMP-1004`), `departmentId` (Required select), `managerId` (Optional select), `designation` (Required, max 100 chars), `employmentType` (Required enum), `dateOfJoining` (Required date).
9. **Loading State:** Submit button displays spinner; fields become read-only while saving.
10. **Empty State:** N/A.
11. **Error State:** Inline red field borders with validation messages; summary alert at top on server failure (e.g., 409 Duplicate Email).
12. **Success Feedback:** Toast: "Employee EMP-1004 successfully onboarded!" and redirection to their new profile.
13. **Responsive Behavior:** 2-column form on desktop; single-column stacked layout on mobile.

---

### Page 8: Department Management (`/departments`)
1. **Purpose:** Organization structure hub to view departments, assign department head managers, and review headcounts.
2. **Roles Allowed:** `HR_ADMIN` (Full CRUD), `MANAGER` (Read-only view).
3. **Route:** `/departments`
4. **Main Layout:** `DashboardLayout`.
5. **Components:** `PageHeader`, `DepartmentGrid`, `CreateDepartmentModal`, `EditDepartmentModal`.
6. **Data Displayed:** Department name, code (e.g. `ENG`), manager name, active headcount badge, status (`Active` / `Inactive`).
7. **Primary Actions:** "Create Department" (HR). **Secondary Actions:** "Edit Department", "Assign Manager".
8. **Form Fields & Validation (Modal):**
   * `name`: Required, 2-100 chars, unique.
   * `code`: Required, 2-10 chars, uppercase alphanumeric (e.g. `HR`, `ENG`).
   * `managerId`: Optional dropdown of eligible active managers.
   * `description`: Optional, max 250 chars.
9. **Loading State:** 6 card skeletons with placeholder badges.
10. **Empty State:** `EmptyState`: "No departments created yet. Click 'Create Department' to begin."
11. **Error State:** Modal displays inline error if code or name is duplicate (409 Conflict).
12. **Success Feedback:** Toast: "Department Engineering created successfully."
13. **Responsive Behavior:** 3-column card grid on desktop, 2-column on tablet, 1-column on mobile.

---

### Page 9: Personal Attendance Log (`/attendance`)
1. **Purpose:** Daily time-clocking portal and personal monthly punch history for employees.
2. **Roles Allowed:** All Authenticated (`EMPLOYEE`, `MANAGER`, `HR_ADMIN`).
3. **Route:** `/attendance`
4. **Main Layout:** `DashboardLayout`.
5. **Components:** `PunchClockWidget`, `AttendanceSummaryBar` (Present, Late, Half-Day, Total Hours), `MonthlyFilterBar`, `AttendanceHistoryTable`.
6. **Data Displayed:** Date, check-in timestamp, check-out timestamp, total duration hours, status badge (`PRESENT` / `LATE` / `HALF_DAY`), notes.
7. **Primary Actions:** "Check In" / "Check Out". **Secondary Actions:** Filter by Month/Year.
8. **Form Fields & Validation:** Optional check-in note (max 200 chars).
9. **Loading State:** Table skeleton rows with spinner on clock widget.
10. **Empty State:** "No attendance records found for October 2026."
11. **Error State:** Error banner: "Check-in failed: already checked in today." (409).
12. **Success Feedback:** Toast: "Checked in successfully at 09:15 AM."
13. **Responsive Behavior:** Clock widget full width on mobile; table displays horizontal scroll or stacked summary rows.

---

### Page 10: Team Attendance (`/attendance/team`)
1. **Purpose:** Manager view to monitor subordinate daily punch status and monthly compliance.
2. **Roles Allowed:** `MANAGER`, `HR_ADMIN`.
3. **Route:** `/attendance/team`
4. **Main Layout:** `DashboardLayout`.
5. **Components:** `PageHeader`, `DatePickerFilter`, `TeamAttendanceSummaryCards`, `TeamAttendanceTable`.
6. **Data Displayed:** Team member name, employee code, today's check-in time, check-out time, hours worked, status badge.
7. **Primary Actions:** Date selector (defaults to Today). **Secondary Actions:** Export team attendance report.
8. **Form Fields & Validation:** Date input (ISO date).
9. **Loading State:** Shimmering table rows.
10. **Empty State:** "No team members scheduled for this date."
11. **Error State:** Alert banner if fetch fails.
12. **Success Feedback:** N/A.
13. **Responsive Behavior:** Responsive table with sticky first column (Employee Name) on mobile.

---

### Page 11: Company Attendance Overview (`/attendance/admin`)
1. **Purpose:** Organization-wide attendance reporting and compliance monitoring for HR.
2. **Roles Allowed:** `HR_ADMIN`.
3. **Route:** `/attendance/admin`
4. **Main Layout:** `DashboardLayout`.
5. **Components:** `PageHeader`, `DepartmentFilterDropdown`, `DateRangePicker`, `OrganizationAttendanceStats`, `CompanyAttendanceTable`.
6. **Data Displayed:** Total present today, total absent today, late arrivals count, departmental attendance breakdown, complete staff punch records.
7. **Primary Actions:** "Filter by Department", "Select Date". **Secondary Actions:** "Export Attendance CSV".
8. **Form Fields & Validation:** Date picker, Department select.
9. **Loading State:** 10 skeleton rows with shimmer effect.
10. **Empty State:** "No attendance records recorded for this date and department."
11. **Error State:** Alert banner with retry action.
12. **Success Feedback:** N/A.
13. **Responsive Behavior:** Full desktop data table with horizontal scrolling on viewports $<992\text{px}$.

---

### Page 12: Leave Center & History (`/leaves`)
1. **Purpose:** Employee leave dashboard displaying annual leave balances, active requests, and complete history.
2. **Roles Allowed:** All Authenticated (`EMPLOYEE`, `MANAGER`, `HR_ADMIN`).
3. **Route:** `/leaves`
4. **Main Layout:** `DashboardLayout`.
5. **Components:** `PageHeader`, `LeaveBalanceCardsGrid` (Annual, Casual, Sick, Unpaid), `ActiveRequestsSection`, `LeaveHistoryTable`, `CancelLeaveModal`.
6. **Data Displayed:** Remaining days per leave type, total used, pending applications, approved leave history, rejection comments.
7. **Primary Actions:** "Apply for Leave" (navigates to `/leaves/apply`). **Secondary Actions:** "Cancel Request" (if status is `PENDING`).
8. **Form Fields & Validation:** Cancellation confirmation modal.
9. **Loading State:** 4 balance card skeletons and table shimmer.
10. **Empty State:** "You have not submitted any leave requests yet." with an "Apply for Leave" button.
11. **Error State:** Error banner on balance query failure.
12. **Success Feedback:** Toast: "Leave request cancelled successfully."
13. **Responsive Behavior:** 4 balance cards in 2x2 grid on tablet, 1-column stacked on mobile.

---

### Page 13: Submit Leave Request (`/leaves/apply`)
1. **Purpose:** Dedicated application form for employees to request time off.
2. **Roles Allowed:** All Authenticated (`EMPLOYEE`, `MANAGER`, `HR_ADMIN`).
3. **Route:** `/leaves/apply`
4. **Main Layout:** `DashboardLayout`.
5. **Components:** `PageHeader`, `Breadcrumbs`, `LeaveApplicationForm`, `LiveQuotaBalanceSidebarWidget`.
6. **Data Displayed:** Available balance for selected leave type, date range picker, calculated total business days, reason input.
7. **Primary Actions:** "Submit Leave Application". **Secondary Actions:** "Cancel" (returns to `/leaves`).
8. **Form Fields & Validation:**
   * `leaveType`: Required select (`ANNUAL`, `CASUAL`, `SICK`, `UNPAID`).
   * `startDate`: Required date (must be today or future date).
   * `endDate`: Required date (must be equal to or after `startDate`).
   * `totalDays`: Auto-calculated positive number (min 0.5, must not exceed available balance for type).
   * `reason`: Required textarea, min 5 chars, max 500 chars.
9. **Loading State:** Button shows spinner: "Validating quota and submitting...".
10. **Empty State:** N/A.
11. **Error State:** Inline error: "Insufficient Annual Leave balance (Requested: 4, Available: 2)" or "You have an overlapping leave request on these dates."
12. **Success Feedback:** Toast: "Leave application submitted! Routed to your manager for review." and redirection to `/leaves`.
13. **Responsive Behavior:** 2-column layout on desktop (Form on left 8 cols, Balance summary on right 4 cols); 1-column stacked on mobile.

---

### Page 14: Manager Leave Approvals Queue (`/leaves/approvals`)
1. **Purpose:** Review inbox for managers and HR admins to inspect, approve, or reject employee leave requests.
2. **Roles Allowed:** `MANAGER` (direct reports), `HR_ADMIN` (all organizational requests).
3. **Route:** `/leaves/approvals`
4. **Main Layout:** `DashboardLayout`.
5. **Components:** `PageHeader`, `ApprovalQueueTable`, `ApprovalActionModal`, `RejectionReasonModal`.
6. **Data Displayed:** Applicant name, employee code, leave type badge, start/end dates, total days requested, submission date, applicant's reason text.
7. **Primary Actions:** "Approve" (opens quick confirm), "Reject" (opens modal requiring mandatory feedback comment). **Secondary Actions:** Filter by leave type or department.
8. **Form Fields & Validation (Rejection Modal):**
   * `reviewComment`: Required textarea if rejecting (min 5 chars, max 300 chars). Error: "Please provide a reason for rejection to inform the employee."
9. **Loading State:** Shimmering table rows.
10. **Empty State:** `EmptyState`: "Inbox Zero! No pending leave requests requiring your review."
11. **Error State:** Alert banner on server error.
12. **Success Feedback:** Toast: "Leave request for Jane Doe approved."
13. **Responsive Behavior:** Desktop shows full table with action button groups; mobile presents each request as an elevated card with prominent Approve/Reject buttons.

---

### Page 15: Company Announcements Bulletin (`/announcements`)
1. **Purpose:** Company-wide news bulletin where staff read official news, events, and urgent alerts.
2. **Roles Allowed:** All Authenticated (`EMPLOYEE`, `MANAGER`, `HR_ADMIN`).
3. **Route:** `/announcements`
4. **Main Layout:** `DashboardLayout`.
5. **Components:** `PageHeader`, `PinnedAnnouncementBanner`, `AnnouncementsList`, `CreateAnnouncementButton` (HR only).
6. **Data Displayed:** Announcement title, priority badge (`NORMAL`, `HIGH`, `URGENT`), category badge (`GENERAL`, `POLICY`, `EVENT`, `ALERT`), author name, published date, full text content.
7. **Primary Actions:** "Post Announcement" (HR). **Secondary Actions:** Filter by category.
8. **Form Fields & Validation:** N/A (View page).
9. **Loading State:** 3 card skeleton placeholders.
10. **Empty State:** `EmptyState`: "No announcements published yet."
11. **Error State:** Error banner: "Failed to load announcements."
12. **Success Feedback:** N/A.
13. **Responsive Behavior:** Pinned alerts span full width with thick border; cards adapt to single column on mobile.

---

### Page 16: Manage Announcements (`/announcements/manage`)
1. **Purpose:** HR administrative console to author, pin, edit, and archive company bulletins.
2. **Roles Allowed:** `HR_ADMIN`.
3. **Route:** `/announcements/manage`
4. **Main Layout:** `DashboardLayout`.
5. **Components:** `PageHeader`, `AnnouncementEditorForm`, `ActiveAnnouncementsTable`, `ArchiveConfirmModal`.
6. **Data Displayed:** Table of active bulletins, priority, author, pin status, archive action button.
7. **Primary Actions:** "Publish Announcement". **Secondary Actions:** "Pin/Unpin", "Archive".
8. **Form Fields & Validation:**
   * `title`: Required, 3-150 chars.
   * `content`: Required textarea, min 10 chars.
   * `priority`: Required select (`NORMAL`, `HIGH`, `URGENT`).
   * `category`: Required select (`GENERAL`, `POLICY`, `EVENT`, `ALERT`).
   * `isPinned`: Optional checkbox (default: false).
9. **Loading State:** Save button spinner.
10. **Empty State:** Table empty state if zero published bulletins.
11. **Error State:** Modal validation warnings.
12. **Success Feedback:** Toast: "Announcement published to company feed."
13. **Responsive Behavior:** Form and management table stack vertically on smaller viewports.

---

### Page 17: Training Catalog & Workshops (`/training`)
1. **Purpose:** Professional development catalog allowing employees to discover upcoming workshops and self-enroll.
2. **Roles Allowed:** All Authenticated (`EMPLOYEE`, `MANAGER`, `HR_ADMIN`).
3. **Route:** `/training`
4. **Main Layout:** `DashboardLayout`.
5. **Components:** `PageHeader`, `TabFilter` ("Available Programs", "My Registered Programs"), `TrainingProgramGrid`, `EnrollConfirmModal`.
6. **Data Displayed:** Workshop title, trainer name, start/end dates and times, venue/URL link, remaining available seat count badge, enrollment status.
7. **Primary Actions:** "Enroll Now" (enabled if seats > 0 and not yet enrolled). **Secondary Actions:** "Drop Enrollment" (if registered and program has not started).
8. **Form Fields & Validation:** Confirmation dialog with seat commitment agreement.
9. **Loading State:** 6 program card skeletons.
10. **Empty State:** "No training programs currently scheduled. Check back soon!"
11. **Error State:** Error toast: "Enrollment failed: workshop has reached maximum capacity."
12. **Success Feedback:** Toast: "Successfully enrolled in 'Advanced React Patterns'!"
13. **Responsive Behavior:** 3-column card grid on desktop, 1-column card list on mobile.

---

### Page 18: Manage Training Programs (`/training/manage`)
1. **Purpose:** HR administration console to schedule training sessions, set participant quotas, and inspect attendee rosters.
2. **Roles Allowed:** `HR_ADMIN`.
3. **Route:** `/training/manage`
4. **Main Layout:** `DashboardLayout`.
5. **Components:** `PageHeader`, `CreateProgramModal`, `TrainingAdminTable`, `AttendeeRosterModal`.
6. **Data Displayed:** Program title, trainer, dates, capacity vs enrolled count (e.g. `18/25`), status (`UPCOMING`, `ONGOING`, `COMPLETED`).
7. **Primary Actions:** "Create New Program". **Secondary Actions:** "View Attendee Roster", "Cancel Program".
8. **Form Fields & Validation (Modal):**
   * `title`: Required, 3-120 chars.
   * `description`: Required, 10-1000 chars.
   * `trainer`: Required, 2-80 chars.
   * `startDate` & `endDate`: Required ISO dates (`endDate >= startDate`).
   * `capacity`: Required integer, min 1.
   * `locationOrUrl`: Required string.
9. **Loading State:** Modal spinner during creation.
10. **Empty State:** "No training sessions created yet."
11. **Error State:** Inline form errors.
12. **Success Feedback:** Toast: "Training program created successfully."
13. **Responsive Behavior:** Modal fits mobile viewports with sticky footer action buttons.

---

### Page 19: Notifications Center (`/notifications`)
1. **Purpose:** Dedicated notifications inbox where users review system alerts and lifecycle updates.
2. **Roles Allowed:** All Authenticated (`EMPLOYEE`, `MANAGER`, `HR_ADMIN`).
3. **Route:** `/notifications`
4. **Main Layout:** `DashboardLayout`.
5. **Components:** `PageHeader`, `NotificationActionHeader` ("Mark all as read"), `NotificationsList`, `NotificationItem`.
6. **Data Displayed:** Notification title, message body, relative timestamp ("10 minutes ago"), category icon, read/unread visual dot.
7. **Primary Actions:** Click notification item to navigate to relevant action URL and mark as read. **Secondary Actions:** "Mark All as Read".
8. **Form Fields & Validation:** N/A.
9. **Loading State:** 5 list skeleton items.
10. **Empty State:** `EmptyState`: "No notifications right now! You're completely up to date."
11. **Error State:** Error banner: "Could not load notifications."
12. **Success Feedback:** Immediate visual transition of unread badges to cleared state.
13. **Responsive Behavior:** Clean full-width list items on all devices.

---

### Page 20: Profile & Account Settings (`/profile`)
1. **Purpose:** User profile overview allowing self-service updates of personal contact information and password change.
2. **Roles Allowed:** All Authenticated (`EMPLOYEE`, `MANAGER`, `HR_ADMIN`).
3. **Route:** `/profile`
4. **Main Layout:** `DashboardLayout`.
5. **Components:** `ProfileSummaryCard`, `PersonalContactForm`, `ChangePasswordForm`.
6. **Data Displayed:** Employee code, name, designation, department, work email, editable phone, editable home address, editable emergency contact.
7. **Primary Actions:** "Save Contact Changes", "Update Password". **Secondary Actions:** "Discard Changes".
8. **Form Fields & Validation:**
   * Personal: `phone` (optional), `address` (optional strings), `emergencyContact` (`name`, `relationship`, `phone`).
   * Password Form: `currentPassword` (Required), `newPassword` (Required, min 8 chars, must not match current password).
9. **Loading State:** Form buttons show inline spinners during update.
10. **Empty State:** N/A.
11. **Error State:** Red inline error: "Current password does not match our records." (401).
12. **Success Feedback:** Toast: "Personal details updated successfully" / "Password changed successfully."
13. **Responsive Behavior:** 2-column layout on desktop (Personal info left, Security/Password right); stacked on mobile.

---

### Page 21: Access Denied / Unauthorized (`/unauthorized`)
1. **Purpose:** User-friendly 403 Forbidden screen explaining that the user's current role does not permit viewing the requested page.
2. **Roles Allowed:** All Authenticated.
3. **Route:** `/unauthorized`
4. **Main Layout:** `DashboardLayout`.
5. **Components:** `ErrorIllustration`, `ErrorHeading`, `DescriptiveMessage`, `BackToDashboardButton`.
6. **Data Displayed:** "Access Restricted (HTTP 403)", "Your account role does not have authorization to view this administrative resource."
7. **Primary Actions:** "Return to My Dashboard". **Secondary Actions:** "Contact System Administrator".
8. **Form Fields & Validation:** N/A.
9. **Loading State:** N/A.
10. **Empty State:** N/A.
11. **Error State:** Static error view.
12. **Success Feedback:** N/A.
13. **Responsive Behavior:** Centered message block on all viewports.

---

### Page 22: Not Found Page (`/404` or `*`)
1. **Purpose:** 404 error handler rendered when an invalid URL is entered.
2. **Roles Allowed:** Public & Authenticated.
3. **Route:** `*`
4. **Main Layout:** `PublicLayout` or `DashboardLayout` (based on auth state).
5. **Components:** `NotFoundIllustration`, `Heading`, `ActionButtons`.
6. **Data Displayed:** "404 — Page Not Found", "The page you are looking for doesn't exist or has been moved."
7. **Primary Actions:** "Return Home" / "Back to Dashboard".
8. **Form Fields & Validation:** N/A.
9. **Loading State:** N/A.
10. **Empty State:** N/A.
11. **Error State:** Static 404 view.
12. **Success Feedback:** N/A.
13. **Responsive Behavior:** Centered message block on all viewports.

---

## 2. Dashboard Widgets & Precise JSON Data Contracts

To resolve **Priority 1** from the Phase 1 Review, the exact JSON response contracts returned by the analytics endpoints are formalized below. These contracts strictly adhere to the standard envelope defined in [`API_SPECIFICATION.md`](file:///c:/Users/Ideapad/OneDrive/Documents/StaffSync/docs/API_SPECIFICATION.md#L37-L57).

### 2.1 HR Admin Dashboard Contract (`GET /api/v1/analytics/hr-dashboard`)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "HR analytics loaded successfully.",
  "data": {
    "summaryCards": {
      "totalHeadcount": 142,
      "activeEmployees": 138,
      "presentToday": 126,
      "lateToday": 8,
      "onLeaveToday": 6,
      "pendingLeavesCount": 9
    },
    "departmentDistribution": [
      { "departmentId": "654c1f9b8c2d1e001a333331", "departmentName": "Engineering", "headcount": 52 },
      { "departmentId": "654c1f9b8c2d1e001a333332", "departmentName": "Sales & Marketing", "headcount": 34 },
      { "departmentId": "654c1f9b8c2d1e001a333333", "departmentName": "Human Resources", "headcount": 12 },
      { "departmentId": "654c1f9b8c2d1e001a333334", "departmentName": "Operations", "headcount": 40 }
    ],
    "monthlyLeaveTrends": [
      { "month": "May", "approvedDays": 24 },
      { "month": "Jun", "approvedDays": 38 },
      { "month": "Jul", "approvedDays": 45 },
      { "month": "Aug", "approvedDays": 29 },
      { "month": "Sep", "approvedDays": 33 },
      { "month": "Oct", "approvedDays": 18 }
    ],
    "recentAttendance": [
      {
        "attendanceId": "654c1f9b8c2d1e001a444401",
        "employeeName": "Sarah Connor",
        "employeeCode": "EMP-1014",
        "department": "Engineering",
        "checkInTime": "2026-10-28T09:02:15.000Z",
        "status": "PRESENT"
      }
    ]
  }
}
```

### 2.2 Manager Dashboard Contract (`GET /api/v1/analytics/manager-dashboard`)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Manager dashboard metrics loaded.",
  "data": {
    "teamSummary": {
      "teamHeadcount": 14,
      "presentToday": 12,
      "lateToday": 1,
      "onLeaveToday": 1,
      "pendingTeamLeavesCount": 3
    },
    "pendingApprovals": [
      {
        "leaveRequestId": "654c1f9b8c2d1e001a555501",
        "employeeId": "654c1f9b8c2d1e001a222222",
        "employeeName": "Jane Doe",
        "employeeCode": "EMP-1002",
        "leaveType": "ANNUAL",
        "startDate": "2026-11-10T00:00:00.000Z",
        "endDate": "2026-11-12T00:00:00.000Z",
        "totalDays": 3,
        "reason": "Family vacation.",
        "submittedAt": "2026-10-27T14:22:00.000Z"
      }
    ],
    "teamAttendanceToday": [
      {
        "employeeId": "654c1f9b8c2d1e001a222222",
        "employeeName": "Jane Doe",
        "employeeCode": "EMP-1002",
        "checkInTime": "2026-10-28T09:12:00.000Z",
        "checkOutTime": null,
        "status": "PRESENT"
      }
    ]
  }
}
```

### 2.3 Employee Dashboard Contract (`GET /api/v1/analytics/employee-dashboard`)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Employee self-service dashboard loaded.",
  "data": {
    "todayAttendance": {
      "hasCheckedIn": true,
      "checkInTime": "2026-10-28T09:14:22.000Z",
      "hasCheckedOut": false,
      "checkOutTime": null,
      "status": "PRESENT"
    },
    "leaveBalance": {
      "year": 2026,
      "annual": { "quota": 15, "used": 4, "remaining": 11 },
      "casual": { "quota": 10, "used": 2, "remaining": 8 },
      "sick": { "quota": 10, "used": 1, "remaining": 9 },
      "unpaid": { "used": 0 }
    },
    "recentAnnouncements": [
      {
        "id": "654c1f9b8c2d1e001a666601",
        "title": "Annual Company Retreat 2026",
        "priority": "HIGH",
        "category": "EVENT",
        "publishedAt": "2026-10-25T10:00:00.000Z",
        "isPinned": true
      }
    ],
    "upcomingTraining": [
      {
        "id": "654c1f9b8c2d1e001a777701",
        "title": "Advanced React Patterns & Performance",
        "startDate": "2026-11-15T09:00:00.000Z",
        "trainer": "Tech Excellence Academy",
        "isEnrolled": true
      }
    ]
  }
}
```

> [!NOTE]
> **API Alignment Note:** The detailed payloads above expand the concise summaries in Phase 1's `API_SPECIFICATION.md` into exact widget property keys. No existing route names or HTTP verbs were modified.

