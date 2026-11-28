# MentorMatch Design System & Color Guide

This document defines the **Deep Olive Studio** visual identity, exact hex/rgba color tokens, typography, borders, and component patterns used in MentorMatch (established across [AuthShell.tsx](file:///d:/CodeFiles/MentorMatch/components/auth/AuthShell.tsx), [sign-in/page.tsx](file:///d:/CodeFiles/MentorMatch/app/(auth)/sign-in/page.tsx), and [sign-up/page.tsx](file:///d:/CodeFiles/MentorMatch/app/(auth)/sign-up/page.tsx)). Use these exact values whenever building or updating screens so colors stay consistent without guesswork.

---

## 1. Design Philosophy: Deep Olive Studio (Black & Olive)

MentorMatch pairs an obsidian-black canvas (`#090a08`) with olive-charcoal elevated surfaces (`#11140e`), olive-tinted hairline borders, warm bone typography (`#f2f0e8`), and moss-olive primary actions (`#8fa654`). Depth comes from subtle tonal layering and soft dark ambient shadows rather than glowing halos or bright chrome.

---

## 2. Color Palette Reference

### Base Surfaces & Backgrounds

| Element | Hex / Value | Tailwind Class / CSS | Usage |
| :--- | :--- | :--- | :--- |
| **Obsidian Canvas** | `#090a08` | `bg-[#090a08]` | Root page background. |
| **Top Radial Atmosphere** | `rgba(143,166,84,0.10)` | `bg-[radial-gradient(ellipse_65%_50%_at_25%_0%,rgba(143,166,84,0.10),transparent_70%)]` | Subtle ambient olive wash at the top edge of standalone pages. |
| **Primary Card Surface** | `#11140e` | `bg-[#11140e]` | Primary containers, auth panels, and form cards. |
| **Input Field Surface** | `#0d0f0b` | `bg-[#0d0f0b]` | Recessed text/password inputs and autofill inset surface. |
| **Track / Tab Well** | `#0b0d09` | `bg-[#0b0d09]` | Segmented switcher track (`Sign in` / `Create account`). |
| **Elevated Olive Tile** | `#161b12` | `bg-[#161b12]` | Brand emblem (`MM`) and workflow highlight icon badges. |
| **Active Tab Surface** | `#1b2116` | `bg-[#1b2116]` | Selected tab or active segmented control pill. |
| **Legacy App Shell (Existing Views)** | `#0b090a` / `#111315` / `#1a1d20` | `bg-[#0b090a]` / `bg-[#111315]` / `hover:bg-[#1a1d20]` | Older authenticated dashboard surfaces prior to Black & Olive migration. |

---

### Primary Olive Accents & Interactive States

| Role | Hex / Value | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- |
| **Primary CTA Fill (Moss Olive)** | `#8fa654` | `bg-[#8fa654]` | Primary submit buttons and active indicator borders. |
| **Primary CTA Hover** | `#9eb660` | `hover:bg-[#9eb660]` | Hover state for primary olive buttons; also used for input caret & highlight icons. |
| **Primary CTA Active** | `#7f9449` | `active:bg-[#7f9449]` | Pressed state for primary olive buttons. |
| **Primary CTA Text** | `#0b0d08` | `text-[#0b0d08]` | High-contrast obsidian ink on `#8fa654` olive buttons. |
| **Olive Accent Text / Met Check** | `#b7cc7e` | `text-[#b7cc7e]` | Inline action links, brand emblem text, and satisfied password checks. |
| **Olive Link Hover** | `#cde099` | `hover:text-[#cde099]` | Hover text and underline color for inline olive links. |
| **Olive Link Underline (Rest)** | `#4d5c33` | `decoration-[#4d5c33]` | Subtle resting underline for inline links. |
| **Met Requirement Pill Fill** | `rgba(143,166,84,0.20)` | `bg-[#8fa654]/20` | Filled check circle when a validation rule passes. |
| **Text Selection** | `rgba(143,166,84,0.30)` | `selection:bg-[#8fa654]/30 selection:text-[#f2f0e8]` | Root text selection highlight. |
| **Input Focus Ring** | `rgba(143,166,84,0.25)` | `focus-visible:ring-2 focus-visible:ring-[#8fa654]/25` | Focus ring on form inputs paired with `focus-visible:border-[#8fa654]`. |
| **Control Focus Ring** | `rgba(143,166,84,0.50)` | `focus-visible:ring-2 focus-visible:ring-[#8fa654]/50` | Focus ring on header links, icon buttons, and toggles. |

---

### Borders & Dividers (Olive-Tinted Hairlines)

| Border Role | Hex Code | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- |
| **Section / Card Divider** | `#1e2419` | `border-[#1e2419]` | Thin horizontal separators between lists or card footers. |
| **Tab Track Border** | `#1f251a` | `border-[#1f251a]` | Outer border around segmented tab wells. |
| **Primary Card Border** | `#242a1e` | `border-[#242a1e]` | Default border for `#11140e` cards and form panels. |
| **Input Default Border** | `#283022` | `border-[#283022]` | Resting border on `#0d0f0b` inputs. |
| **Icon Tile Border** | `#2a3322` | `border-[#2a3322]` | Border on `#161b12` icon containers. |
| **Unmet Check Circle** | `#31382a` | `border-[#31382a]` | Neutral border for unsatisfied validation circles. |
| **Active Tab Border** | `#323d28` | `border-[#323d28]` | Border on `#1b2116` active tab pills. |
| **Brand Emblem Border** | `#3a4530` | `border-[#3a4530]` | Resting border on the `MM` brand emblem (`hover:border-[#8fa654]`). |
| **Input Hover Border** | `#3c4832` | `hover:border-[#3c4832]` | Subtle border lift when hovering inputs. |
| **Focus Border** | `#8fa654` | `focus-visible:border-[#8fa654]` | Active border on focused inputs. |

---

### Text & Ink Hierarchy (Warm Bone & Olive-Neutral)

| Hierarchy Role | Hex Code | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Ink (Warm Bone)** | `#f2f0e8` | `text-[#f2f0e8]` | Headings, primary labels, active tabs, and input text. |
| **Body / Field Label Ink** | `#c7cabf` | `text-[#c7cabf]` | Form labels and feature highlight copy. |
| **Secondary Copy** | `#a8ab9e` | `text-[#a8ab9e]` | Subtitles, lead paragraphs, and footer prompt text. |
| **Inactive Tab Ink** | `#9a9e91` | `text-[#9a9e91]` | Unselected tab items. |
| **Interactive Icon Ink** | `#8e9484` | `text-[#8e9484]` | Password eye toggle at rest (`hover:text-[#f2f0e8]`). |
| **Unmet Hint Text** | `#8a8f80` | `text-[#8a8f80]` | Unmet password criteria text. |
| **Placeholder & Footer Muted** | `#787d6f` | `placeholder:text-[#787d6f] text-[#787d6f]` | Input placeholders and bottom copyright metadata (maintains ≥4.5:1 on `#0d0f0b`). |

---

### Semantic & Status Colors

| Domain | Hex / Classes | Usage |
| :--- | :--- | :--- |
| **Inline Error Surface** | Background `#231214`, Border `#61282d`, Text `#f4b8bc`, Icon `#eb7b83` | Dark-native inline error alerts (`AuthErrorAlert`). Avoid light `bg-red-50` banners. |
| **Ratings & Stars** | `#f59e0b` (`fill-amber-400 text-amber-400`) | Star ratings, feedback scores, review summaries. |
| **Growth & Success** | `#10b981` (`text-emerald-400 bg-emerald-500/10 border-emerald-500/20`) | Mentee confidence boost, completed session indicators. |
| **Live / In Progress** | `text-cyan-400 animate-pulse` | Ongoing WebRTC call badges and live presence. |

#### Mentorship Request Statuses

These state colors extend the olive base only where a request outcome needs to be scanned quickly. Each hue carries one meaning and is paired with a label, so status is never communicated by color alone.

| Status | Surface | Border | Text | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Pending** | `#2b2517` | `#6b5528` | `#dfc47a` | Waiting for a mentor's decision. |
| **Accepted** | `#14231f` | `#265944` | `#6ee7b7` | Request accepted and eligible for session scheduling. |
| **Rejected** | `#231214` | `#61282d` | `#f4b8bc` | Request declined. |
| **Accept action** | `#10b981` with `#0b0d08` text | `#10b981` | `#0b0d08` | Primary action on received requests; the dark text keeps the action legible. |

---

## 3. Typography & Hierarchy

* **Primary Font:** `DM_Sans` from `next/font/google` (`weight: ["400", "500", "600", "700"]`, `subsets: ["latin"]`).

| Hierarchy Level | Tailwind Class | Example Usage |
| :--- | :--- | :--- |
| **Display / Hero Headline** | `text-3xl sm:text-4xl lg:text-[2.6rem] font-bold tracking-[-0.03em] leading-[1.1] text-[#f2f0e8]` | Auth split-column headline. |
| **Form / Card Title** | `text-xl sm:text-2xl font-semibold tracking-tight text-[#f2f0e8]` | "Welcome back", "Create your account". |
| **Lead / Body Copy** | `text-base text-[#a8ab9e] leading-relaxed` | Split-column summary copy. |
| **Field Label** | `text-xs font-medium text-[#c7cabf]` | Input labels (`Email address`, `Password`). |
| **Helper / Requirement Item** | `text-xs text-[#8a8f80]` (met: `text-[#b7cc7e]`) | Password criteria, inline footer links. |
| **Muted Footer Metadata** | `text-xs text-[#787d6f]` | Copyright and tagline strip. |

---

## 4. Layout, Shapes & Elevation

* **Corner Radii:** `rounded-2xl` (`16px`) for primary containers; `rounded-xl` (`12px`) for inputs, primary buttons, tab tracks, and alerts; `rounded-lg` (`8px`) for active tabs and the `MM` brand emblem; `rounded-md` (`6px`) for icon tiles.
* **Elevation:** Surfaces stay flat at rest and separate via `#242a1e` 1px borders; primary floating panels use a soft ambient shadow: `shadow-[0_24px_64px_-24px_rgba(0,0,0,0.85)]`. Avoid hard offset shadows (`4px 4px 0`) or neon perimeter glows.
* **Viewport Density (Standard vs. Compact):**
  * **Standard forms** (e.g. `/sign-in`): `p-6 sm:p-8` card padding, `space-y-4`, `h-11` (`44px`) inputs and submit button.
  * **Multi-field forms** (e.g. `/sign-up`): compact rhythm (`p-5 sm:p-6` card padding, `py-3.5 sm:py-4` shell padding, `space-y-3`, `h-10` (`40px`) inputs and submit button) so the full page fits inside standard laptop viewports without vertical scrolling.
* **Browser Autofill Override:** Apply the `.auth-input` class from [globals.css](file:///d:/CodeFiles/MentorMatch/app/globals.css#L127-L135) on dark-surface inputs so browser autofill preserves `#0d0f0b` background and `#f2f0e8` text instead of flashing white/blue.

---

## 5. Reusable Component Patterns

### A. Primary Olive Action Button
```tsx
<Button
  type="submit"
  className="w-full h-11 rounded-xl bg-[#8fa654] hover:bg-[#9eb660] active:bg-[#7f9449] text-[#0b0d08] font-semibold text-sm shadow-sm transition-colors cursor-pointer disabled:opacity-50"
>
  Sign in
</Button>
```

### B. Olive-Tinted Dark Input
```tsx
<Input
  className="auth-input h-11 rounded-xl bg-[#0d0f0b] border-[#283022] text-[#f2f0e8] placeholder:text-[#787d6f] caret-[#9eb660] hover:border-[#3c4832] focus-visible:border-[#8fa654] focus-visible:ring-2 focus-visible:ring-[#8fa654]/25 transition-colors text-sm"
/>
```

### C. Dark-Native Error Alert
```tsx
<Alert
  variant="destructive"
  className="rounded-xl border-[#61282d] bg-[#231214] text-[#f4b8bc]"
>
  <AlertCircle className="h-4 w-4 text-[#eb7b83]" />
  <AlertDescription className="text-xs sm:text-sm text-[#f4b8bc]">
    {error}
  </AlertDescription>
</Alert>
```

### D. Card Container
```tsx
<section className="bg-[#11140e] border border-[#242a1e] rounded-2xl p-6 sm:p-8 shadow-[0_24px_64px_-24px_rgba(0,0,0,0.85)]">
  {children}
</section>
```

---

## 6. UI Guardrails & Checklist

* **Do** use `#090a08` canvas, `#11140e` card surfaces, `#0d0f0b` input wells, and `#242a1e` / `#283022` olive-tinted borders.
* **Do** keep primary CTA buttons `#8fa654` (`#9eb660` hover) with `#0b0d08` text—do not use `#d3d3d3` or `#3b82f6` on new Black & Olive surfaces.
* **Do** include `.auth-input` on dark inputs so Chrome/Edge autofill stays dark.
* **Do** use `bg-[#231214] border-[#61282d] text-[#f4b8bc]` for error alerts instead of light-mode `bg-red-50` boxes.
* **Don't** use raw `#000000` or harsh `#ffffff` card backgrounds, gradient text, eyebrow kickers above headings, or low-contrast `text-gray-600` labels on dark backgrounds.
* **Don't** render `Navbar` or `AppSidebar` on standalone auth routes (`/sign-in`, `/sign-up`).
