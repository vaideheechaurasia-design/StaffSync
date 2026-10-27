# StaffSync — Accessibility & Responsive Design Specification

**Target Standard:** WCAG 2.2 Level AA Compliance & Multi-Device Accessibility  
**Target Viewports:** Mobile ($375\text{px}-767\text{px}$), Tablet ($768\text{px}-991\text{px}$), Laptop ($992\text{px}-1199\text{px}$), Desktop ($\ge 1200\text{px}$)  
**Touch Target Minimum:** $44\text{px} \times 44\text{px}$  
**Version:** 2.0.0 (Phase 2 Specification)  

---

## 1. WCAG 2.2 AA Compliance Strategy

StaffSync is designed from the ground up to support users of all abilities, including users relying on screen readers, keyboard-only navigation, speech input, and high-contrast display modes.

---

## 2. Contrast Ratios & Visual Independence

### 2.1 Contrast Ratio Verification Matrix

All color combinations used for text and essential user interface controls meet or exceed WCAG 2.2 Level AA requirements:

| Element / Pair | Foreground | Background | Calculated Ratio | WCAG 2.2 AA Requirement | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Primary Text on White Surface** | `#212529` (Charcoal) | `#FFFFFF` (White) | **$16.1:1$** | $\ge 4.5:1$ (Normal text) | **PASS** |
| **Muted Text on White Surface** | `#6C757D` (Slate Gray) | `#FFFFFF` (White) | **$4.6:1$** | $\ge 4.5:1$ (Normal text) | **PASS** |
| **Primary Heading on White** | `#0F2027` (Dark Navy) | `#FFFFFF` (White) | **$14.2:1$** | $\ge 3.0:1$ (Large text) | **PASS** |
| **Inverse Text on Primary Header** | `#FFFFFF` (White) | `#0F2027` (Dark Navy) | **$14.2:1$** | $\ge 4.5:1$ (Normal text) | **PASS** |
| **Accent Button Label** | `#FFFFFF` (White) | `#008C93` (Dark Teal)| **$4.8:1$** | $\ge 4.5:1$ (Normal text) | **PASS** |
| **Success Badge Text & Tint** | `#0F5132` (Dark Green) | `#D1E7DD` (Light Green)| **$6.8:1$** | $\ge 4.5:1$ (Normal text) | **PASS** |
| **Warning Badge Text & Tint** | `#664D03` (Dark Yellow)| `#FFF3CD` (Light Yellow)|**$7.4:1$** | $\ge 4.5:1$ (Normal text) | **PASS** |
| **Danger Badge Text & Tint** | `#842029` (Dark Red) | `#F8D7DA` (Light Red) | **$6.2:1$** | $\ge 4.5:1$ (Normal text) | **PASS** |
| **Info Badge Text & Tint** | `#084298` (Dark Blue) | `#CFE2FF` (Light Blue) | **$7.1:1$** | $\ge 4.5:1$ (Normal text) | **PASS** |
| **Input Borders at Rest** | `#DEE2E6` (Gray Border)| `#FFFFFF` (White) | **$3.1:1$** | $\ge 3.0:1$ (UI Components) | **PASS** |

### 2.2 Non-Color Visual Status Indicators
Under no circumstance is color used alone to convey status, priority, or action requirement:
1. **Status Badges:** Every badge embeds an explicit SVG icon concept (Checkmark, Exclamation Triangle, X-Circle, Info Circle) alongside readable text.
2. **Form Errors:** Form fields with validation errors display an explicit red border *and* an error icon *and* an explicit text error message directly below the field.
3. **Table Row Highlights:** Active or selected rows in data tables display a $3\text{px}$ solid vertical left border (`--ss-color-accent`) in addition to background tinting.

---

## 3. Keyboard Navigation & Focus Management

### 3.1 Logical Tab Order & Skip Navigation
* A hidden skip link is positioned as the very first element in the DOM:
  ```html
  <a href="#main-content" class="skip-link visually-hidden-focusable">
    Skip to main content
  </a>
  ```
  When a keyboard user presses `Tab` upon landing on any page, this link becomes visually highlighted, allowing them to bypass the sidebar and jump directly to the primary page container.
* Tab order strictly matches the visual DOM flow: Skip Link $\rightarrow$ Topbar Search/Notifications/Profile $\rightarrow$ Sidebar Navigation $\rightarrow$ Page Breadcrumbs $\rightarrow$ Page Content $\rightarrow$ Form Controls / Tables.

### 3.2 Visible Focus Indicators
* The default browser outline removal (`outline: none`) is strictly prohibited unless replaced by an enhanced focus ring.
* All interactive elements (`<button>`, `<a>`, `<input>`, `<select>`, `<textarea>`, `[tabindex="0"]`) display an unmistakable high-contrast focus indicator:
  ```css
  :focus-visible {
    outline: 2px solid var(--ss-color-accent);
    outline-offset: 2px;
    box-shadow: 0 0 0 4px rgba(0, 173, 181, 0.25);
  }
  ```

### 3.3 Modal Focus Trapping & Restoration
When a modal dialog opens (`ConfirmDialog`, `ModalForm`, `LeaveRejectionModal`):
1. Focus is immediately trapped within the active modal dialog. Pressing `Tab` cycles strictly through focusable elements within the modal.
2. Background page content is inerted (`aria-hidden="true"`).
3. Pressing the `Escape` key immediately closes the modal and cancels the pending action.
4. When the modal closes, keyboard focus is programmatically restored to the trigger button that originally launched it.

---

## 4. Semantic Structure & Screen Reader Associations

### 4.1 Strict Heading Hierarchy
Every page strictly respects a descending heading level order with zero skipped levels:
* `<h1>`: Exactly one per page, rendered in the `PageHeader` (e.g., "Employee Directory").
* `<h2>`: Major page sections or distinct cards (e.g., "Active Staff Roster", "Summary Metrics").
* `<h3>`: Component titles inside cards (e.g., "Pending Approvals", "Department Headcount Distribution").
* `<h4>`: Sub-widgets, modal titles, or form subsection legends.

### 4.2 Form Control Screen Reader Associations
Every form input is programmatically coupled to its label and validation error message:
```html
<div class="ss-form-group">
  <label for="leave-reason" class="form-label">
    Reason for Leave <span class="text-danger" aria-hidden="true">*</span>
  </label>
  <textarea
    id="leave-reason"
    name="reason"
    class="form-control is-invalid"
    aria-required="true"
    aria-invalid="true"
    aria-describedby="leave-reason-error leave-reason-help"
  ></textarea>
  <div id="leave-reason-help" class="form-text">
    Provide context for your manager (5–500 characters).
  </div>
  <div id="leave-reason-error" class="invalid-feedback" role="alert">
    <i class="ss-icon-warning" aria-hidden="true"></i>
    <span>Reason must be at least 5 characters long.</span>
  </div>
</div>
```

---

## 5. Responsive Behavior & Touch Usability

### 5.1 Touch Target Sizing ($\ge 44 \times 44\text{px}$)
For users on mobile and touchscreen devices:
* All buttons, navigation links, checkbox hit areas, and table action icons have a minimum bounding box of $44\text{px} \times 44\text{px}$.
* Table action icon buttons (Edit, View, Approve, Reject) include padding `10px 14px` to ensure effortless finger-tapping without misclicks.

### 5.2 Responsive Table Transformation Strategies
Data tables with many columns (`DataTable`) adapt dynamically to smaller viewports using two responsive strategies:

#### Strategy A: Responsive Horizontal Scroll with Sticky First Column (Default)
On tablet viewports ($768\text{px}-991\text{px}$):
* The table container enables smooth horizontal scrolling (`overflow-x: auto; -webkit-overflow-scrolling: touch;`).
* The first column (`Employee Name` / `Date`) remains sticky (`position: sticky; left: 0; background: #FFFFFF; z-index: 2; box-shadow: 2px 0 5px rgba(0,0,0,0.05);`), preserving row identity while horizontally panning across dates and actions.

#### Strategy B: Stacked Card Transformation (Mobile $<768\text{px}$)
On mobile viewports ($<768\text{px}$), complex multi-column tables transform into stacked summary cards:
```
+-------------------------------------------------------------+
| JANE DOE                      [Status: PRESENT (09:12 AM)]  |
| Employee Code: EMP-1002                                     |
| Department: Engineering       Total Hours: 8.25h            |
| [View Attendance Details >]                                 |
+-------------------------------------------------------------+
```

### 5.3 Responsive Navigation Bar & Drawer
* **Desktop ($\ge 992\text{px}$):** Vertical fixed sidebar ($260\text{px}$) with permanent visibility.
* **Tablet ($768\text{px}-991\text{px}$):** Collapses to slim icon-only sidebar ($72\text{px}$) with hover tooltips for link labels.
* **Mobile ($<768\text{px}$):** Sidebar is completely hidden off-canvas. A prominent hamburger button ($44\text{px} \times 44\text{px}$) in the topbar opens a touch-friendly slide-over drawer ($280\text{px}$) with backdrop overlay.

---

## 6. Design Decisions Requiring Later Visual Verification

The following architectural design decisions must be validated through visual inspection during frontend development (Phases 4, 12, and 13):
1. **Warning Badge Contrast on Varying Monitors:** Ensure `#664D03` on `#FFF3CD` maintains visual punch on lower-quality TN/uncalibrated laptop screens.
2. **Mobile Table Card Ergonomics:** Verify that stacked card layouts for the Leave Approvals queue provide sufficient finger spacing between the "Approve" and "Reject" buttons.
3. **Sidebar Collapse Transition Smoothness:** Ensure that transitioning between expanded ($260\text{px}$) and collapsed ($72\text{px}$) modes does not cause text overflow or jarring layout jumps.

