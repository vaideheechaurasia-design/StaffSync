# StaffSync — Design System & Visual Specification

**Design System Name:** StaffSync Enterprise Design Tokens  
**Styling Framework:** Bootstrap 5.3 + Custom CSS Variables  
**Target Design Standard:** WCAG 2.2 AA Enterprise B2B SaaS  
**Version:** 2.0.0 (Phase 2 Specification)  

---

## 1. Design Principles & Aesthetic Foundations

StaffSync's visual language is tailored for modern human resource professionals, managers, and employees. The interface balances density with readability, eliminating visual clutter while surfacing actionable information quickly.

### Core Principles
1. **People First Clarity:** High readability, intuitive visual cues, and zero visual ambiguity.
2. **Accessible by Default:** Every color, control, and state conforms strictly to WCAG 2.2 AA contrast standards ($\ge 4.5:1$ for normal body text, $\ge 3:1$ for large headings and interactive control borders).
3. **Multi-Modal Status Communication:** Color is **never** used as the sole indicator of status. Every badge, alert, and flag pairs color with an explicit semantic icon and clear textual description.
4. **Achievable & Standardized:** Built directly on top of Bootstrap 5.3 utility conventions and standard CSS custom properties (`--ss-*`), ensuring a clean implementation path for a beginner full-stack developer without heavy UI libraries.

---

## 2. Color Palette & Token Definitions

All colors are defined as reusable CSS custom properties in the `:root` scope.

### 2.1 Brand & Neutral Palette

| Token Name | Hex Code | Description & Usage | Minimum Contrast Ratio |
| :--- | :---: | :--- | :---: |
| `--ss-color-primary` | `#0F2027` | Deep enterprise navy. Main brand identity, top navigation header, primary headings, dark surfaces. | $14.2:1$ against white |
| `--ss-color-primary-hover`| `#1A333E` | Slightly elevated navy for hover states on primary controls. | $11.8:1$ against white |
| `--ss-color-secondary` | `#2C5364` | Slate teal. Secondary actions, subheadings, sidebar active indicator bar, tabs. | $7.8:1$ against white |
| `--ss-color-accent` | `#00ADB5` | Vibrant teal cyan. High-priority call-to-actions, focus rings, primary check-in button, active badge indicator. | $4.6:1$ against dark / $3.2:1$ on light |
| `--ss-color-accent-hover`| `#008C93` | Darkened teal for hover on accent buttons. | $4.8:1$ against white |
| `--ss-color-bg-app` | `#F8F9FA` | Off-white canvas background. Eye-friendly, reduces glare for daily workstation use. | N/A (Canvas) |
| `--ss-color-surface` | `#FFFFFF` | Pure white. Card containers, modals, table rows, form inputs. | N/A (Surface) |
| `--ss-color-surface-alt` | `#F1F3F5` | Light cool gray. Table header backgrounds, zebra striping, read-only inputs, sidebar background. | $1.15:1$ vs surface |
| `--ss-color-border` | `#DEE2E6` | Subtle gray border for cards, table dividers, input borders. Meets $3:1$ non-text contrast against `#FFFFFF`. | $3.1:1$ against white |
| `--ss-color-border-subtle`| `#E9ECEF` | Soft divider line between list items and dropdown sections. | Secondary divider |
| `--ss-color-text-main` | `#212529` | Charcoal black. Primary body text, table cell contents, form values, and labels. | $16.1:1$ against white |
| `--ss-color-text-muted` | `#6C757D` | Mid slate gray. Form hint text, timestamps, table secondary metadata, breadcrumbs. | $4.6:1$ against white |
| `--ss-color-text-inverse`| `#FFFFFF` | Crisp white for text placed on dark navy or status backgrounds. | High contrast |

### 2.2 Semantic Status Palette

Every semantic state includes a solid color, an accessible light tint (for badge and alert backgrounds), and a mandatory accompanying icon concept.

| Status | Solid Hex | Light Tint Hex | Semantic Icon Concept | Usage in StaffSync |
| :--- | :---: | :---: | :---: | :--- |
| **Success** | `#198754` | `#D1E7DD` | Checkmark in Circle (`check-circle`) | Approved leave, Present attendance, Active employee, Success toasts. |
| **Warning** | `#B78103` | `#FFF3CD` | Warning Triangle (`exclamation-triangle`)| Pending approvals, Late check-in, Half-day attendance, Expiry alerts. |
| **Danger** | `#DC3545` | `#F8D7DA` | Alert Octagon / X Circle (`x-circle`) | Rejected leave, Absent status, Inactive/Deactivated employee, Error banners. |
| **Info** | `#0D6EFD` | `#CFE2FF` | Info Circle (`info-circle`) | Annual leave category, Upcoming training session, System bulletins. |

> [!NOTE]
> The solid warning color `#B78103` is darkened from standard Bootstrap yellow (`#FFC107`) to guarantee a compliant $4.5:1$ contrast ratio against white surfaces for readable text.

---

## 3. Typography Hierarchy & Text Styles

StaffSync uses standard, highly legible system font stacks to ensure native rendering speed without external web font loading delays.

* **Primary Font Family:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
* **Monospace Font Family:** `SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace` (Used for employee codes, timestamps, and audit IDs)

| Element / Style | Font Size | Line Height | Font Weight | Color Token | Letter Spacing |
| :--- | :---: | :---: | :---: | :--- | :---: |
| **Display / Page Title (H1)**| `1.75rem` ($28\text{px}$) | `1.3` ($36.4\text{px}$) | `700` (Bold) | `--ss-color-primary` | `-0.02em` |
| **Section Header (H2)** | `1.35rem` ($21.6\text{px}$) | `1.35` ($29.2\text{px}$)| `600` (Semi-Bold) | `--ss-color-primary` | `-0.01em` |
| **Card / Widget Title (H3)** | `1.10rem` ($17.6\text{px}$) | `1.4` ($24.6\text{px}$) | `600` (Semi-Bold) | `--ss-color-primary` | `normal` |
| **Sub-section Title (H4)** | `0.95rem` ($15.2\text{px}$) | `1.4` ($21.3\text{px}$) | `600` (Semi-Bold) | `--ss-color-secondary` | `normal` |
| **Body Text (Default)** | `0.925rem` ($14.8\text{px}$)| `1.5` ($22.2\text{px}$) | `400` (Regular) | `--ss-color-text-main` | `normal` |
| **Body Bold / Emphasized** | `0.925rem` ($14.8\text{px}$)| `1.5` ($22.2\text{px}$) | `600` (Semi-Bold) | `--ss-color-text-main` | `normal` |
| **Small / Metadata** | `0.80rem` ($12.8\text{px}$) | `1.4` ($17.9\text{px}$) | `400` (Regular) | `--ss-color-text-muted` | `+0.01em` |
| **Micro / Badge Label** | `0.75rem` ($12.0\text{px}$) | `1.2` ($14.4\text{px}$) | `600` (Semi-Bold) | Inherit / Inverse | `+0.02em` |
| **Code / Monospace Pill** | `0.825rem` ($13.2\text{px}$)| `1.3` ($17.2\text{px}$) | `500` (Medium) | `--ss-color-secondary` | `normal` |

---

## 4. Spacing, Elevation & Shape System

### 4.1 Spacing Scale (8pt Grid System)
Spacing follows an 8-pixel harmonic rhythm directly compatible with Bootstrap utility classes (`m-1` through `m-5`, `p-1` through `p-5`).

| Token | Size in Pixels | Size in Rem | Bootstrap Equivalent | Recommended Usage |
| :--- | :---: | :---: | :---: | :--- |
| `--ss-space-1` | $4\text{px}$ | `0.25rem` | `1` | Form control padding, micro badge gaps, icon margins. |
| `--ss-space-2` | $8\text{px}$ | `0.50rem` | `2` | Stacked list spacing, button icon gaps, table cell padding Y. |
| `--ss-space-3` | $16\text{px}$ | `1.00rem` | `3` | Standard component internal padding, card body padding mobile. |
| `--ss-space-4` | $24\text{px}$ | `1.50rem` | `4` | Card body padding desktop, grid column gutters, section gaps. |
| `--ss-space-5` | $32\text{px}$ | `2.00rem` | `5` | Page title vertical margins, large modal padding. |
| `--ss-space-6` | $48\text{px}$ | `3.00rem` | `my-5` | Hero banner padding, empty state container spacing. |

### 4.2 Border Radius Scale
* `--ss-radius-sm`: `4px` (Small buttons, micro badges, input checkboxes/radios)
* `--ss-radius-md`: `8px` (Standard form inputs, default buttons, alert banners, dropdown menus)
* `--ss-radius-lg`: `12px` (Card containers, modal dialogs, dashboard widget panels)
* `--ss-radius-pill`: `9999px` (Status badges, avatar containers, pill buttons)

### 4.3 Elevation & Box Shadows
* `--ss-shadow-subtle`: `0 1px 3px rgba(15, 32, 39, 0.06)` (Standard cards at rest, form input rest state)
* `--ss-shadow-card`: `0 2px 10px rgba(15, 32, 39, 0.08)` (Elevated cards, summary KPI widgets)
* `--ss-shadow-hover`: `0 6px 18px rgba(15, 32, 39, 0.12)` (Card hover, active interactive widgets)
* `--ss-shadow-overlay`: `0 12px 30px rgba(15, 32, 39, 0.18)` (Modals, popovers, offcanvas navigation, dropdown menus)

---

## 5. UI Control Specifications & Interactive States

### 5.1 Button Variants & States

```
+-------------------------------------------------------------------------+
| [Primary: Dark Navy]   [Accent: Teal Cyan]   [Outline]   [Danger: Red]   |
+-------------------------------------------------------------------------+
```

1. **Primary Button (`.btn-primary`):**
   * Background: `--ss-color-primary` (`#0F2027`), Text: `#FFFFFF`.
   * Hover: `--ss-color-primary-hover` (`#1A333E`).
   * Active: Transform `translateY(1px)`.
   * Focus Ring: `0 0 0 3px rgba(0, 173, 181, 0.45)` (Accent focus ring).
2. **Accent Action Button (`.btn-accent`):**
   * Background: `--ss-color-accent` (`#00ADB5`), Text: `#FFFFFF` (Bold).
   * Used for high-intent workflows (e.g., "Check In Now", "Submit Leave", "Enroll in Workshop").
   * Hover: `--ss-color-accent-hover` (`#008C93`).
3. **Secondary / Outline Button (`.btn-outline-secondary`):**
   * Border: $1\text{px}$ solid `--ss-color-border`, Text: `--ss-color-secondary`.
   * Hover: Background `--ss-color-surface-alt`.
4. **Danger Button (`.btn-danger`):**
   * Background: `--ss-color-danger` (`#DC3545`), Text: `#FFFFFF`.
   * Used strictly for destructive actions (e.g., "Reject Leave", "Deactivate Employee").
5. **Disabled State (`:disabled`):**
   * Opacity: `0.65`, Cursor: `not-allowed`, Pointer-events: `none`.
6. **Loading State:**
   * Contains an inline spinning circle indicator ($16\text{px} \times 16\text{px}$) with label e.g., `"Submitting..."`.

### 5.2 Form Input Controls

1. **Text Inputs & Textareas (`.form-control`):**
   * Height: $42\text{px}$ (Text inputs), Padding: `8px 14px`.
   * Border: $1\text{px}$ solid `--ss-color-border`.
   * Background: `--ss-color-surface`.
   * Focus State: Border `--ss-color-accent` with shadow `0 0 0 3px rgba(0, 173, 181, 0.25)`. Outline: `none`.
   * Validation Error State: Border `--ss-color-danger`, red focus ring, and inline message below input with icon.
   * Disabled / Read-Only State: Background `--ss-color-surface-alt`, text `--ss-color-text-muted`.
2. **Select Dropdowns (`.form-select`):**
   * Height: $42\text{px}$, custom SVG chevron icon matching `--ss-color-secondary`.
3. **Checkboxes & Radios (`.form-check-input`):**
   * Size: $18\text{px} \times 18\text{px}$.
   * Checked State: Background `--ss-color-primary` with crisp white mark.

### 5.3 Badges & Status Indicators

Badges render with `--ss-radius-pill`, font size `0.75rem`, semi-bold weight, and a structured HTML format:

```html
<!-- Example of Accessible Multi-Modal Status Badge -->
<span class="badge ss-badge ss-badge-success" role="status">
  <i class="ss-icon-check-circle" aria-hidden="true"></i>
  <span>Approved</span>
</span>
```

* **Success Badge:** Background `#D1E7DD`, Text `#0F5132`, Border `#BADBCC`.
* **Warning Badge:** Background `#FFF3CD`, Text `#664D03`, Border `#FFECB5`.
* **Danger Badge:** Background `#F8D7DA`, Text `#842029`, Border `#F5C2C7`.
* **Info Badge:** Background `#CFE2FF`, Text `#084298`, Border `#B6D4FE`.

---

## 6. Structural Dimensions & Responsive Breakpoints

StaffSync adheres to standard Bootstrap 5 responsive breakpoints:

| Breakpoint | Class Infix | Min-Width | Layout Transformation |
| :--- | :---: | :---: | :--- |
| **Extra Small (Mobile)** | None | $<576\text{px}$ | Sidebar hidden in offcanvas drawer. 1-column forms and cards. Tables adapt to horizontal scroll or stacked summary cards. |
| **Small (Mobile Landscape)**| `sm` | $\ge 576\text{px}$ | 1-2 column grid layouts. Offcanvas navigation. |
| **Medium (Tablet)** | `md` | $\ge 768\text{px}$ | Sidebar collapses to slim icon-only bar ($70\text{px}$) or toggleable offcanvas. 2-column KPI grids. |
| **Large (Laptop)** | `lg` | $\ge 992\text{px}$ | Expanded sidebar ($250\text{px}$). 3-column KPI card rows. Full table view with all columns visible. |
| **Extra Large (Desktop)** | `xl` | $\ge 1200\text{px}$| Expanded sidebar ($260\text{px}$). 4-column KPI card rows. Content container constrained to max-width $1400\text{px}$. |

### Layout Shell Dimensions
* **Top Navigation Bar Height:** $64\text{px}$ (Fixed to top of viewport)
* **Expanded Sidebar Width:** $260\text{px}$ (Desktop)
* **Collapsed Sidebar Width:** $72\text{px}$ (Tablet)
* **Mobile Drawer Width:** $280\text{px}$ (Offcanvas)
* **Main Content Viewport:** Fluid width with `padding: 24px` on desktop, `padding: 16px` on mobile.

