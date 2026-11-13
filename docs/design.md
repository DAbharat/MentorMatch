# MentorMatch Design System & Color Guide

This document defines the visual identity, exact color codes, typography, and styling patterns used across MentorMatch. Follow these rules whenever creating new UI elements to maintain a cohesive, polished dark aesthetic without guesswork.

---

## 1. Design Philosophy: Retro-Modern Dark

MentorMatch combines a deep, distraction-free ultra-dark canvas with subtle retro-inspired borders, tactile cards, and sharp semantic accent colors (amber for ratings, emerald for growth, electric blue for actions).

---

## 2. Color Palette Reference

### Base Surfaces & Backgrounds
Always use these exact hex values for layers and depth:

| Element | Hex Code | Tailwind Class / CSS | Usage |
| :--- | :--- | :--- | :--- |
| **Canvas / Page Background** | `#0b090a` | `bg-[#0b090a]` | Root page background for all authenticated views. |
| **Card Surface** | `#111315` | `bg-[#111315]` | Primary container for stats, forms, session items, and widgets. |
| **Nested Item Background** | `#181d24` / `#1a1a1a` | `bg-neutral-900/60` | Sub-cards, list items, and table rows inside a primary card. |
| **Hover Surface** | `#1a1d20` | `hover:bg-[#1a1d20]` | Clickable cards and row highlights. |

---

### Borders & Dividers
Borders define structure in dark mode without overwhelming the eye:

| Border Role | Hex Code | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- |
| **Default Card Border** | `#1f1f1f` | `border-[#1f1f1f]` | The standard border for cards, sidebars, and panels. |
| **Interactive Hover Border**| `#2a2f34` | `hover:border-[#2a2f34]` | Applied on cards with hover animations. |
| **Inner Divider / Separator** | `#2a2a2a` | `border-neutral-800` | Thin lines separating sections within a card. |
| **Subtle Focus Ring** | `#3b82f6` | `ring-1 ring-blue-500` | Active form inputs and focus states. |

---

### Typography & Text Colors

#### Font Family
* **Primary Font:** `DM_Sans` from `next/font/google`
* **Import pattern:**
  ```typescript
  import { DM_Sans } from "next/font/google";

  const DM_Sans_Font = DM_Sans({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
  });
  ```

#### Text Hierarchy
| Hierarchy Level | Tailwind Class | Visual Appearance | Example Usage |
| :--- | :--- | :--- | :--- |
| **Page Title** | `text-2xl sm:text-3xl font-bold text-white tracking-tight` | Crisp white, bold | "Mentor Analytics", "Sessions" |
| **Section Heading** | `text-lg font-semibold text-white` | White, semi-bold | "Review Breakdown", "Upcoming Calls" |
| **Stat Label** | `text-xs font-semibold uppercase tracking-wider text-neutral-400` | Uppercase, muted | "SESSIONS COMPLETED", "TOTAL HOURS" |
| **Primary Body** | `text-sm text-neutral-200` | Light gray | General text, form descriptions |
| **Secondary / Subtext**| `text-xs text-neutral-400` | Mid gray | Review comments, timestamps, helper text |
| **Muted Details** | `text-[11px] text-neutral-500` | Dark gray | Small footer labels, metadata |

---

### Semantic Accents & Status Colors

Use these standardized accent colors for specific contexts:

| Domain | Accent Color | Tailwind Classes | Example Usage |
| :--- | :--- | :--- | :--- |
| **Ratings & Stars** | Amber (`#f59e0b`) | `fill-amber-400 text-amber-400` | Star ratings, feedback scores, review summaries. |
| **Growth & Success**| Emerald (`#10b981`) | `text-emerald-400 bg-emerald-500/10 border-emerald-500/20` | Mentee confidence boost (`+2.3`), completed sessions. |
| **Primary Actions** | Blue (`#3b82f6`) | `bg-blue-500 text-white hover:bg-blue-600 text-blue-400` | Main buttons, "Start Call", active tabs, analytics icons. |
| **Skills & Topics** | Purple (`#a855f7`) | `text-purple-400 border-neutral-700 bg-neutral-800` | Skill badges (React, Go, Python), category chips. |
| **Danger & Destructive**| Rose / Red (`#ef4444`) | `text-red-400 bg-red-500/10 border-red-500/20 hover:bg-red-500` | "End Call", "Cancel Session", logout dialogs. |
| **Live / In Progress**| Cyan / Blue | `text-cyan-400 animate-pulse` | Ongoing WebRTC call badge, live room presence. |

---

## 3. Reusable Component Patterns

### A. The Standard Stat / KPI Card
```tsx
<div className="flex flex-col justify-between gap-3 p-5 rounded-xl bg-[#111315] border border-[#1f1f1f] hover:border-[#2a2f34] transition-all duration-200">
  <div className="flex items-center justify-between text-muted-foreground">
    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
      Sessions Completed
    </span>
    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
      <Video className="w-5 h-5 text-blue-400" />
    </div>
  </div>
  <div>
    <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
      24
    </div>
    <p className="text-xs text-neutral-400 mt-1">2 upcoming this week</p>
  </div>
</div>
```

### B. Standard Skill Badge
```tsx
<Badge variant="outline" className="border-neutral-700 bg-neutral-800 text-neutral-200 text-xs px-2.5 py-0.5">
  TypeScript
</Badge>
```

### C. Retro UI Button (`@/components/retroui/Button`)
```tsx
import { Button } from "@/components/retroui/Button";

<Button
  size="sm"
  className="bg-blue-500 text-white hover:bg-blue-600 transition-colors"
  onClick={handleAction}
>
  Confirm Session
</Button>
```

---

## 4. UI Checklist for New Screens

* [ ] Background is set to `bg-[#0b090a]`.
* [ ] Container cards use `bg-[#111315] border border-[#1f1f1f] rounded-xl`.
* [ ] Typography imports `DM_Sans` and applies `DM_Sans_Font.className`.
* [ ] Star ratings always use `fill-amber-400 text-amber-400`.
* [ ] No raw black (`#000000`) or harsh pure white backgrounds (`#ffffff`) for cards.
* [ ] Loading states use either `<Spinner />` (`@/components/ui/spinner`) or `<Skeleton className="bg-neutral-800" />`.

