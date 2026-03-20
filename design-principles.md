# Design System — Single Source of Truth

> **Brand Identity:** Luxury travel & hospitality platform
> **Last Updated:** August 1, 2023 (Colors: July 17, 2023)

---

## 1. Brand Overview

The brand uses a distinctive trident-style logomark (Ψ) rendered in **Black Coal (#000000)** against the signature **Saffron Yellow (#FDBE00)** header. The overall aesthetic communicates premium luxury travel with warmth, clarity, and confidence. Every component should feel refined yet approachable — never cold or overly minimal.

---

## 2. Color Palette

### 2.1 Brand Colors

| Name               | Hex       | HSL             | Usage                                      |
|--------------------|-----------|-----------------|--------------------------------------------|
| Black Coal         | `#000000` | 0, 0, 0         | Primary text, primary dark buttons, icons  |
| Ultramarine Blue   | `#1E2643` | 227, 38, 19     | Secondary dark accents                     |
| Lavender Blue      | `#9EAEF4` | 229, 80, 79     | Decorative, soft highlights                |
| Verdigris          | `#ACBEB9` | 163, 12, 71     | Muted accents, subtle backgrounds          |
| Sand               | `#D5CDC2` | 35, 18, 80      | Warm neutral background, card surfaces     |
| Light Sand         | `#F6EFE7` | 32, 45, 94      | Light warm background                      |
| Saffron Yellow     | `#FDBE00` | 45, 100, 50     | **Primary brand color**, CTAs, active states, header |
| Sienna             | `#9D432C` | 12, 56, 39      | Warm accent, seasonal/editorial highlights |

### 2.2 China Branding (Region-Specific)

| Name      | Hex       | HSL             |
|-----------|-----------|-----------------|
| Blue Wave | `#00807D` | 180, 100, 25    |
| Marigold  | `#FB9100` | 35, 100, 49     |

### 2.3 Layout / Neutral Colors

| Name         | Hex       | HSL         | Usage                                  |
|--------------|-----------|-------------|----------------------------------------|
| Dark Grey    | `#333333` | 0, 0, 20    | Secondary text, heavy UI elements      |
| Middle Grey  | `#666666` | 0, 0, 40    | Helper text, icons                     |
| Grey         | `#999999` | 0, 0, 60    | Disabled text, placeholders            |
| Light Grey   | `#CCCCCC` | 0, 0, 80    | Borders, dividers                      |
| Pearl        | `#F8F8F8` | 0, 0, 97    | Page backgrounds, subtle card fills    |
| Cloud White  | `#FFFFFF` | 0, 0, 100   | Card backgrounds, clean surfaces       |

### 2.4 Semantic / Feedback Colors

| Name   | Hex       | Usage                            |
|--------|-----------|----------------------------------|
| Green  | `#088A20` | Success states, valid inputs     |
| Red    | `#BF2F17` | Error states, destructive tags   |
| Orange | `#C75300` | Warnings, on-demand/add-on tags  |

### 2.5 Color Usage Rules

- **Saffron Yellow** is the hero color — use for primary CTAs, active/selected states, branded headers, and filter chips in active state.
- **Black Coal** is used for primary text, headings, filled dark buttons, and icon buttons.
- **White** is used as text on dark fills and as the default card/surface color.
- Semantic colors (Green, Red, Orange) are **only** for validation states and status tags — never for decoration.
- Maintain sufficient contrast ratios: text on Saffron Yellow must be Black Coal; text on Black Coal must be White.

---

## 3. Typography

### 3.1 General Rules

- Headings are set in a **bold, high-contrast serif or sans-serif** with generous sizing.
- Body and component text uses a **clean sans-serif** typeface.
- Labels above input fields use a smaller, semi-bold weight.
- Helper / additional information text sits directly below labels in a lighter weight.
- Error messages use the **Red** semantic color with an error icon (⚠ circle exclamation).

### 3.2 Hierarchy

| Level                | Weight    | Context                               |
|----------------------|-----------|---------------------------------------|
| Page Title           | Bold      | Section headers like "Filters", "Tabs"|
| Component Label      | Semi-bold | "Label" above inputs, filter names    |
| Body / Placeholder   | Regular   | Input values, descriptions            |
| Helper Text          | Regular   | "Additional informations" subtext     |
| Error Text           | Regular   | Red validation messages               |
| Button Text          | Semi-bold | All button labels                     |
| Tag Text             | Semi-bold | Pill/badge labels                     |

---

## 4. Components

### 4.1 Buttons

#### Text Buttons
Five fill variants, each available in multiple sizes and states:

| Variant              | Fill            | Text Color  | Border           |
|----------------------|-----------------|-------------|------------------|
| Saffron Yellow       | `#FDBE00`       | Black Coal  | None             |
| Black Coal           | `#000000`       | White       | None             |
| White                | `#FFFFFF`       | Black Coal  | None             |
| Black Coal w/ Stroke | `#000000`       | White       | 1px White stroke |
| White w/ Stroke      | `#FFFFFF`       | Black Coal  | 1px Black stroke |

**Size tiers (top to bottom in the spec):**
1. Large — full rounded pill, prominent padding
2. Medium — standard size
3. Small — compact
4. With arrow (→) — appended trailing arrow icon
5. Ghost / text-only — no fill, just label + optional arrow

**States:** Default → Hover (slight darkening / fill shift) → Disabled (reduced opacity ~40–50%)

#### Icon Buttons
Circular buttons housing a single icon. Same five color variants as text buttons. Three sizes: large, medium, small.

#### Arrow Buttons
Circular buttons with a back-arrow (←) icon. Same five color variants and three sizes as icon buttons.

#### Links
Three visual styles:
- **Boxed** — rounded pill with a subtle border (Default, Hover underline, Disabled muted)
- **Underlined** — text with underline decoration
- **With arrow** — text + trailing → or leading ← arrow

**States:** Default → Hover → Disabled (muted text, no interaction)

### 4.2 Input Fields

#### Textfield Variants
Four structural types in a single row:

| Type            | Structure                              |
|-----------------|----------------------------------------|
| Default         | Plain text input                       |
| Dropdown        | Text input + trailing chevron (˅)      |
| With Icon       | Leading icon + text input              |
| Icon + Dropdown | Leading icon + text input + chevron    |

**Anatomy (top-to-bottom):**
- **Label** (semi-bold, top-left)
- **Helper text** ("Additional informations", lighter)
- **Input container** — rounded rectangle, 1px border

**States (progressive rows in the spec):**

| State    | Border Color | Icon(s)                 | Notes                          |
|----------|-------------|-------------------------|--------------------------------|
| Default  | Light Grey  | —                       | Placeholder text shown         |
| Hover    | Dark Grey   | —                       | Border darkens                 |
| Focus    | Black Coal  | —                       | Bold border                    |
| Filled   | Light Grey  | —                       | Value replaces placeholder     |
| Valid    | Green       | ✓ trailing checkmark    | Green border + green check     |
| Error    | Red         | ✗ trailing X + ✓        | Red border, red error message below |

**Error display:** Red circle-exclamation icon + "Error message displays here." in Red, below the input.

#### Date Fields
- Format: `YYYY / MM / DD`
- Displays a secondary label with example date (e.g., `2000/07/04`)
- Same state progression as textfields (Default → Hover → Focus → Filled → Valid → Error)
- Segmented inputs for year, month, day separated by `/`

#### Password Fields
- Input with trailing visibility toggle (eye icon)
- Real-time validation checklist below:
  - At least 12 characters
  - At least one lowercase
  - At least one uppercase
  - At least one special character `#$%&'()*`
  - At least one number
- Each rule shows ✓ Green when met, ⚠ Red when failed
- States: Empty → Partially valid (mixed green/red) → Error (red border + message) → Valid (green border + check)

#### Phone Number
- Country code selector (dropdown, e.g., `+33`) + number input
- Label shows format hint: `+33 00 00 00 00`

### 4.3 Filters

#### Filter Button — Default
Rounded pill with label "Filters". Outlined border, no fill.

#### Filter Button — Dropdown
Same pill shape + trailing chevron (˅) indicating expandable options.

#### Range Slider
- Horizontal track with two thumb handles (‖ pause-bar style)
- Labels at each thumb: e.g., `1h` — `4h`
- Track between thumbs filled with **Saffron Yellow**
- Tick marks along the full track for scale

#### Active / Selected State
- **Saffron Yellow fill** replaces the outline
- ✓ checkmark icon appears trailing the label
- Dropdown variant: Yellow fill + ✓ check + chevron

#### Size Variants
Filters come in two sizes visible in the dashed-border group:
- **Regular** — standard pill height
- **Small** — compact pill height

### 4.4 Tabs

#### Structure
Horizontal row of tab labels inside a rounded container (light grey/pearl background).

#### States

| State     | Appearance                                      |
|-----------|-------------------------------------------------|
| Default   | Plain text label, no fill                       |
| Selected  | **Black Coal fill**, white text, rounded pill   |
| Roll Over | **Black Coal fill** with subtle opacity, white text, rounded pill |

- Only one tab is selected at a time.
- Selected tab uses a fully rounded pill shape with Black Coal background.

### 4.5 Tags

#### Range Tags (Product Tier)
- Rounded rectangle with a leading **diamond ◆** icon in Saffron Yellow
- Labels: "Gamme Luxe", "Avec Espace Luxe", "Exclusive Collection", "With Exclusive Spaces"
- Light sand/pearl background

#### Brand / Sub-brand Tags
- **Villas & Châlets** — diamond icon, outlined
- **Cruises** — diamond icon + ship icon variant, Black Coal fill
- **Joyview** — distinct colored tag (Chinese characters: 悦景)
- **Circuits / Tours** — Red/coral colored pill with compass icon
- **Getaway** — Saffron Yellow pill with binoculars icon

#### Market Tags

| Tag          | Style                        |
|--------------|------------------------------|
| Best Seller  | Red text, red rounded border |
| New          | Red text, red rounded border |
| Included     | Black text, black border     |
| Add-ons      | Orange fill, white text      |
| Unavailable  | Grey fill, white text        |

#### Offer Tags

| Tag           | Style                               |
|---------------|-------------------------------------|
| Summer Deals  | Coral/salmon fill, white text       |
| Winter Deals  | Saffron Yellow fill, dark text      |
| Black Friday  | Black Coal fill, white text         |
| Happy First   | Coral/pink fill, white text         |
| Honeymoon     | Outlined coral border, coral text   |

#### Miscellaneous Tags
Small circular badges for:
- Icons (info icon)
- Numbers (e.g., `8`)
- Google (G logo)
- Trip Advisor (owl icon)

#### Small Tags
Compact pill tags for:
- **Seasons** — outlined, e.g., "Winter", "Summer"
- **Offers** — Red/coral fill
- **New Resort** — Green fill

### 4.6 Controls

#### Checkbox
- Square with rounded corners
- States: Unchecked (empty) → Checked (✓ fill) → Indeterminate
- Paired with text label on the right
- Error state: red error message below

#### Radio Button
- Circle
- States: Unselected (empty circle) → Selected (filled inner dot)
- Paired with text label
- Error state: red error message below

#### Switch / Toggle
- Pill-shaped track
- States: Off (dark, circle left) → On (green/yellow, circle right, ✓ icon)

#### Zoom Control
- Vertical stack: fullscreen icon (⛶) on top, `+` button, `−` button
- Clean outlined style

#### Scroll Line
- Two variants:
  - **Yellow track** — Saffron Yellow progress indicator
  - **Black track** — Black Coal progress indicator
- Thin horizontal line showing scroll/progress position

#### Pagination

**Full variant:**
- `< Previous` — numbered page buttons — `Next >`
- Current page: Black Coal filled circle with white number
- Other pages: plain numbers
- Ellipsis (…) for truncated ranges

**Compact variant:**
- `<` — numbered pages — `>`
- Same active/inactive styling, fewer visible pages

#### Sort By
- Icon group: three circular icon buttons in a row (person, grid, list)
- Three visual states matching the row:
  - Default: outlined icons
  - Hover: subtle fill
  - Selected: Black Coal fill, white icon

#### Spinner
- Single circular loading animation (rotating arc)

#### Main Loader
- Brand logomark (Ψ) with a diamond orbit animation
- Accompanied by message: "Thank you for patience; we are seeking the best for you."
- Multiple size variants shown in the spec

### 4.7 Avatars

| Type     | Appearance                                      |
|----------|-------------------------------------------------|
| Letters  | Circular badge with initials (e.g., "JD"), dark background |
| Picture  | Circular cropped photo                          |
| Icons    | Circular badge with a person icon, colored fill (e.g., coral) |

Two sizes: Standard and Small.

---

## 5. Spacing & Layout Principles

- **Border radius:** Components use generous rounding — full pill shapes for buttons, tags, tabs, and filters; medium radius (~8–12px) for input fields and cards.
- **Padding:** Buttons and filters have consistent horizontal padding (~16–24px) and vertical padding (~8–12px). Input fields have internal padding of ~12–16px.
- **Component grouping:** Related variants are visually grouped on a light grey/pearl card background with soft rounding.
- **Dashed borders** (orange/sienna dashed stroke) indicate component variant groups or state documentation in the spec — this is a documentation convention, not a UI element.

---

## 6. Iconography

- Icons are **line-style** (outlined, not filled) in their default state.
- Consistent stroke weight across all icons.
- Common icons used across components:
  - **Chevron down (˅)** — dropdowns, expandable filters
  - **Checkmark (✓)** — valid state, active filters, completed actions
  - **X mark (✗)** — error state, clear/dismiss
  - **Arrow right (→)** — navigation, CTA emphasis
  - **Arrow left (←)** — back navigation
  - **Eye / Eye-off** — password visibility toggle
  - **Calendar** — date input leading icon
  - **Diamond (◆)** — luxury tier indicator
  - **Exclamation circle (⚠)** — error/warning indicator

---

## 7. State Design Rules

### 7.1 Interactive States (Buttons)

| State    | Visual Treatment                                        |
|----------|---------------------------------------------------------|
| Default  | Standard fill/border as defined per variant             |
| Hover    | Slight darkening or highlight shift                     |
| Disabled | Reduced opacity (~40–50%), no pointer cursor            |

### 7.2 Input States

| State    | Border        | Feedback Icon | Message              |
|----------|---------------|---------------|----------------------|
| Default  | Light Grey    | —             | —                    |
| Hover    | Dark Grey     | —             | —                    |
| Focus    | Black Coal    | —             | —                    |
| Filled   | Light Grey    | —             | —                    |
| Valid    | Green         | ✓ (green)     | —                    |
| Error    | Red           | ✗ (red)       | Red error text below |

### 7.3 Selection States (Tabs, Filters, Sort)

| State     | Treatment                                               |
|-----------|---------------------------------------------------------|
| Default   | No fill, plain text                                     |
| Selected  | Filled background (Black Coal for tabs, Saffron Yellow for filters) |
| Hover     | Subtle fill preview                                     |

---

## 8. Brand Header Pattern

Every page in the design system follows a consistent header:

1. **Saffron Yellow banner** — full width, generous height
2. **Logomark (Ψ)** — centered, Black Coal
3. **Page title** — bold, below the banner
4. **"Updated on [date]"** — right-aligned metadata

This pattern should be maintained for all documentation and can inform the application's main navigation header styling (yellow brand bar + dark logo).

---

## 9. Accessibility Guidelines

- All interactive elements must have visible focus indicators.
- Color alone should never convey meaning — pair semantic colors with icons (✓ for success, ✗ for error, ⚠ for warning).
- Maintain minimum contrast ratios: 4.5:1 for normal text, 3:1 for large text.
- Saffron Yellow (`#FDBE00`) on white does **not** meet WCAG AA — always pair it with Black Coal text or use it as a background with dark text.
- Disabled states should be visually distinct but not rely solely on color (use reduced opacity + cursor change).

---

## 10. Do's and Don'ts

### Do
- Use Saffron Yellow as the primary action color for CTAs and active states.
- Use Black Coal for high-contrast text buttons and selected tabs.
- Keep input field labels above the field, with helper text between label and input.
- Use the full rounded pill shape for buttons, filters, tabs, and tags.
- Show real-time validation feedback on form fields with appropriate icons and colors.

### Don't
- Don't use Red or Green for decorative purposes — they are reserved for validation.
- Don't place light text on Saffron Yellow — always use Black Coal.
- Don't mix border radius styles — maintain pill shapes across interactive components.
- Don't use the brand Saffron Yellow as a text color — it's for fills and backgrounds only.
- Don't use the China branding colors (Blue Wave, Marigold) outside of the China market.

---

*This document serves as the canonical design reference. All UI development should adhere to these specifications. When in doubt, refer to the component state tables and color usage rules above.*
