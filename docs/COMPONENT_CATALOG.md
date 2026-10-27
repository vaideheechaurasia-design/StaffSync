# StaffSync — Reusable UI Component Catalog

**Target Platform:** React 18 + Bootstrap 5.3  
**Design Standard:** Accessible, Modular, Enterprise Presentation Components  
**Version:** 2.0.0 (Phase 2 Specification)  

---

## 1. Architectural Component Principles

1. **Pure Presentation & Separation of Concerns:** Reusable components handle DOM presentation, styling, and basic accessibility attributes. Business logic and API queries are kept in page containers and custom hooks.
2. **Prop-Driven Customization:** Every component exposes a clean, intuitive conceptual interface (props) to allow reuse across modules without code duplication.
3. **Accessibility First (A11y):** All interactive components include appropriate ARIA roles (`role="status"`, `role="dialog"`, `aria-expanded`, `aria-describedby`), focus management, and keyboard event handlers.

---

## 2. Reusable Component Specifications

---

### 1. `ApplicationLayout`
* **Purpose:** The global outer shell providing the structural layout for the authenticated experience.
* **Conceptual Properties (Props):**
  * `user`: Current authenticated user object `{ role, firstName, lastName, email }`.
  * `children`: Rendered page view.
  * `activeRoute`: Current pathname for sidebar highlighting.
* **Expected Behavior:** Combines `Sidebar`, `Topbar`, dynamic breadcrumbs, and main content container. Handles responsive toggling of sidebar (expanded on desktop, collapsed on tablet, offcanvas drawer on mobile).
* **Accessibility:** Contains `<header>`, `<nav aria-label="Main Navigation">`, `<main id="main-content">`, and a hidden "Skip to main content" link for keyboard users.

---

### 2. `Sidebar`
* **Purpose:** Left vertical navigation bar displaying role-scoped navigation links and brand identity.
* **Conceptual Properties (Props):**
  * `role`: User role (`HR_ADMIN`, `MANAGER`, `EMPLOYEE`).
  * `isCollapsed`: Boolean state controlling expanded vs icon-only tablet mode.
  * `onToggleCollapse`: Callback function.
  * `mobileOpen`: Boolean state for mobile offcanvas visibility.
  * `onMobileClose`: Callback function.
* **Expected Behavior:** Filters links based on `role`. Highlights active route with `--ss-color-accent` left border and contrasting background. Expands/collapses smoothly via CSS transitions.
* **Accessibility:** Uses semantic `<nav>`, lists inside `<ul>/<li>`, and adds `aria-current="page"` to the active item.

---

### 3. `Topbar`
* **Purpose:** Horizontal header bar fixed at the top of the viewport for search, notifications, and user profile management.
* **Conceptual Properties (Props):**
  * `user`: Current user data.
  * `unreadNotificationCount`: Number of unread alerts (displays red badge if $>0$).
  * `onNotificationClick`: Callback to open notification dropdown or navigate.
  * `onLogout`: Logout handler callback.
* **Expected Behavior:** Houses mobile hamburger toggle, quick global search input, notification bell with unread badge counter, and user avatar dropdown menu ("View Profile", "Settings", "Logout").
* **Accessibility:** Dropdown menus support `aria-haspopup="true"` and `aria-expanded`. Closes on `Escape` key press.

---

### 4. `PageHeader`
* **Purpose:** Consistent title banner displayed at the top of every dashboard and management screen.
* **Conceptual Properties (Props):**
  * `title`: Page heading string (e.g., "Employee Directory").
  * `subtitle`: Short descriptive sentence (e.g., "Manage organizational staff records and department assignments.").
  * `breadcrumbs`: Array of `{ label, path }` objects.
  * `actionButton`: Optional primary action button element (e.g., "Onboard Employee").
* **Expected Behavior:** Renders an accessible `<h1>` page heading, subtext, breadcrumb trail, and right-aligned primary CTA button.
* **Accessibility:** Dynamic breadcrumbs use `<nav aria-label="Breadcrumb">` with `aria-current="page"` on the terminal link.

---

### 5. `SummaryCard` (StatCard)
* **Purpose:** High-impact metric card displaying key performance indicators (KPIs) on dashboards.
* **Conceptual Properties (Props):**
  * `label`: Title of metric (e.g., "Total Active Headcount").
  * `value`: Primary numerical or text figure (e.g., `142` or `94.2%`).
  * `icon`: Semantic icon concept (e.g., `people`, `clock`, `calendar-check`).
  * `variant`: Color theme (`primary`, `success`, `warning`, `info`, `danger`).
  * `changeText`: Optional trend label (e.g., "+3 this month").
* **Expected Behavior:** Elevated card container (`--ss-shadow-card`) featuring large bold metric text, icon in tinted circle, and subtle hover elevation (`--ss-shadow-hover`).
* **Accessibility:** Uses semantic `<article>` or `<div>` with `aria-label` summarizing metric: e.g., `aria-label="Total Active Headcount: 142"`.

---

### 6. `DataTable`
* **Purpose:** Responsive, accessible tabular view for employee directories, attendance logs, and leave queues.
* **Conceptual Properties (Props):**
  * `columns`: Array of column definitions `{ header, key, sortable, renderCell }`.
  * `data`: Array of row objects.
  * `loading`: Boolean state.
  * `emptyMessage`: String or custom JSX for empty state.
  * `onRowClick`: Optional click handler.
* **Expected Behavior:** Displays clean table with `--ss-color-surface-alt` header row. Supports column sorting indicators, hover highlight on rows, and graceful horizontal scrolling on tablet viewports.
* **Accessibility:** Semantic `<table>`, `<thead>`, `<tbody>`, `<th> scope="col"`, and keyboard navigable sorting headers (`tabindex="0"`, `role="button"`, `aria-sort`).

---

### 7. `SearchInput`
* **Purpose:** Real-time search filter with integrated clear button and search icon.
* **Conceptual Properties (Props):**
  * `placeholder`: Input placeholder text (e.g., "Search employees by name or code...").
  * `value`: Current search string.
  * `onChange`: Debounced input change handler ($300\text{ms}$).
  * `onClear`: Callback to reset search query.
* **Expected Behavior:** Pre-appended magnifying glass icon, trailing "X" button when input has text. Debounces keystrokes before dispatching filter event.
* **Accessibility:** Visible `<label class="visually-hidden">` linked via `id`/`for`. Includes `aria-label="Clear search"`.

---

### 8. `FilterBar`
* **Purpose:** Container row organizing search input, department dropdown filter, status filter, and clear actions.
* **Conceptual Properties (Props):**
  * `filters`: Array of filter configuration objects (options, selectedValue, onChange).
  * `onReset`: Reset all filters callback.
* **Expected Behavior:** Stacks horizontally on desktop with gap spacing; stacks into 1-column controls on mobile viewports.
* **Accessibility:** Wrapped in `<fieldset>` or `<section aria-label="Data filters">`.

---

### 9. `StatusBadge`
* **Purpose:** Multi-modal semantic badge communicating document or lifecycle status.
* **Conceptual Properties (Props):**
  * `status`: Raw status enum (e.g., `APPROVED`, `PENDING`, `REJECTED`, `LATE`, `ACTIVE`).
  * `size`: `'sm'` or `'md'`.
* **Expected Behavior:** Maps status enum to appropriate color token (`success`, `warning`, `danger`, `info`), icon concept, and title-cased label.
* **Accessibility:** Never relies on color alone. Renders `role="status"` and contains an explicit icon + readable text label.

---

### 10. `FormField`
* **Purpose:** Form control wrapper standardizing labels, inputs, help text, and validation error messages.
* **Conceptual Properties (Props):**
  * `id`: Unique input identifier.
  * `label`: Form label string.
  * `required`: Boolean flag (appends accessible red asterisk).
  * `error`: Validation error message string (if any).
  * `helpText`: Optional secondary guidance text.
  * `children`: Input element (`<input>`, `<select>`, `<textarea>`).
* **Expected Behavior:** Positions label above input. If `error` is present, adds red border to input and displays red error text below with warning icon.
* **Accessibility:** Automatically associates `<label for="{id}">` with the input. Uses `aria-invalid="true"` and `aria-describedby="{id}-error"` when invalid.

---

### 11. `ConfirmDialog`
* **Purpose:** Modal confirmation prompt required before executing destructive or irreversible actions.
* **Conceptual Properties (Props):**
  * `isOpen`: Boolean visibility flag.
  * `title`: Modal title (e.g., "Deactivate Employee").
  * `message`: Explanatory confirmation text.
  * `confirmLabel`: Action button text (e.g., "Yes, Deactivate").
  * `confirmVariant`: `'danger'` or `'primary'`.
  * `isLoading`: Boolean state during API submission.
  * `onConfirm`: Confirmation callback.
  * `onCancel`: Cancellation callback.
* **Expected Behavior:** Darkened backdrop (`rgba(15, 32, 39, 0.6)`), centered dialog, auto-focuses "Cancel" button to prevent accidental submission.
* **Accessibility:** `role="alertdialog"`, `aria-modal="true"`, focus trapped within dialog, closes on `Escape` key.

---

### 12. `ModalForm`
* **Purpose:** Container modal for complex forms (e.g., "Create Department", "Reject Leave with Comment").
* **Conceptual Properties (Props):**
  * `isOpen`: Boolean visibility.
  * `title`: Header title.
  * `children`: Form inputs.
  * `onSubmit`: Form submit handler.
  * `onClose`: Close handler.
  * `isSubmitting`: Loading state flag.
* **Expected Behavior:** Constrained max-width ($550\text{px}$), scrollable modal body if content overflows viewport, sticky footer with Cancel and Submit buttons.
* **Accessibility:** Focus trap management, restores focus to trigger button upon close, `aria-labelledby="{modal-title-id}"`.

---

### 13. `EmptyState`
* **Purpose:** Informative illustration and message displayed when lists, tables, or queues have zero records.
* **Conceptual Properties (Props):**
  * `icon`: Semantic icon concept (e.g., `inbox`, `search`, `calendar`).
  * `title`: Friendly heading (e.g., "No Pending Leave Requests").
  * `description`: Explanatory message.
  * `actionButton`: Optional CTA button (e.g., "Submit Leave Request").
* **Expected Behavior:** Centered vertical container with generous padding ($48\text{px}$), soft gray icon circle, muted text, and action button.
* **Accessibility:** Contains an accessible heading (`<h2>` or `<h3>`) and non-confusing ARIA descriptions.

---

### 14. `LoadingSkeleton`
* **Purpose:** Shimmering visual placeholder rendered during asynchronous API data fetching.
* **Conceptual Properties (Props):**
  * `type`: `'card'`, `'table-row'`, `'stat-card'`, `'profile'`.
  * `count`: Number of items to render (default: 3).
* **Expected Behavior:** Animated light gray rectangles (`#E9ECEF` to `#F8F9FA`) with subtle gradient sweep animation. Prevents Cumulative Layout Shift (CLS).
* **Accessibility:** Uses `<div aria-busy="true" aria-label="Loading content...">`. Hidden from screen readers once content arrives.

---

### 15. `ErrorState`
* **Purpose:** Visual recovery container displayed when an API query or whole page fails to load.
* **Conceptual Properties (Props):**
  * `title`: Error title (e.g., "Unable to Load Attendance Data").
  * `message`: User-friendly explanation (suppresses raw technical errors).
  * `onRetry`: Optional callback function to re-attempt the failed operation.
* **Expected Behavior:** Centered alert container with warning icon, clean message, and prominent "Try Again" button.
* **Accessibility:** `role="alert"` so screen readers announce the failure immediately.

---

### 16. `ToastNotification`
* **Purpose:** Floating non-blocking alert banner reporting the outcome of a mutation.
* **Conceptual Properties (Props):**
  * `id`: Unique notification identifier.
  * `type`: `'success'`, `'error'`, `'info'`, `'warning'`.
  * `message`: Concise text description (e.g., "Leave request submitted successfully.").
  * `duration`: Auto-dismiss timeout in ms (default: $4000\text{ms}$).
  * `onDismiss`: Close callback.
* **Expected Behavior:** Positioned fixed at top-right of viewport ($Z\text{-index}: 1080$). Slides in smoothly; auto-dismisses with manual close "X" button.
* **Accessibility:** `role="status"` (for success/info) or `role="alert"` (for error). Focusable close button.

---

### 17. `Pagination`
* **Purpose:** Navigation controls for chunked tabular datasets.
* **Conceptual Properties (Props):**
  * `currentPage`: Active page index (1-based).
  * `totalPages`: Total available pages.
  * `totalRecords`: Total number of records across all pages.
  * `onPageChange`: Page selection callback.
* **Expected Behavior:** Displays "Showing 1 to 10 of 45 entries", Previous/Next arrow buttons, and numbered page buttons. Disables buttons at boundaries.
* **Accessibility:** Uses `<nav aria-label="Pagination Navigation">`, `aria-current="page"` on active button, and `aria-disabled="true"` on disabled bounds.

---

### 18. `ProtectedRoute` (Route Guard)
* **Purpose:** Client-side routing wrapper verifying authentication state and role authorization.
* **Conceptual Properties (Props):**
  * `allowedRoles`: Array of permissible roles (e.g., `['HR_ADMIN', 'MANAGER']`).
  * `children`: Target page component.
* **Expected Behavior:**
  * If user is unauthenticated: Redirects to `/login?redirect={targetPath}`.
  * If user is authenticated but role is unauthorized: Redirects to `/unauthorized`.
  * If user is authenticated and authorized: Renders `children`.
* **Security Notice:** Client-side route masking is strictly a UX convenience; backend API middleware enforces true authorization.

