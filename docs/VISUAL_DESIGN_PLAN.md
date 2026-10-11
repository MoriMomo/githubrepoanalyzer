# Visual Design Plan — Proof (v2: Calm Engineering Craft)

> **This document defines the visual specification for Proof.** It replaces the early "cyberpunk HUD / dark neon bento" tropes with a **Calm Engineering Craft** aesthetic inspired by tier-1 developer software (Linear, Raycast, Supabase Studio, Stripe).

---

## 1. Design Philosophy: Calm Engineering Craft

Proof’s brand promise is **grounded, honest, no fabrication**. The visual interface must reflect the discipline and poise of senior software engineering, not the caricature of an AI tool:

### Anti-AI-Slop Laws
1. **No Screaming All-Caps Cockpits:** Never use full-uppercase micro-labels for every heading (`DETECTED TECHNOLOGY FOOTPRINT`, `VERIFIABLE SPOKEN DEFENSE (WHAT TO SAY OUT LOUD)`). Use calm sentence case or subtle small-caps with neutral tone (`text-xs text-zinc-400 font-medium`).
2. **Progressive Disclosure over "Card Inception":** Avoid nesting 5 bordered boxes inside 5 other bordered boxes with every detail expanded by default. Default to a clean, readable resume presentation. Provide a dedicated **Inspector Drawer / Master-Detail panel** for technical deep-dives (Lineage, Code Anchors, Spoken Defense, Interview Q&A).
3. **Muted Neutrality (95% Calm, 5% Purposeful Pop):** Avoid firing cyan, emerald, amber, and rose borders simultaneously. Surfaces are warm obsidian/zinc (`#0a0b0e`, `#111317`, `#161920`) with ultra-fine hair-thin borders (`border-white/[0.08]`). Color is reserved strictly for functional verification states.
4. **Keyboard-First Ergonomics:** A first-class `Cmd+K` / `Ctrl+K` command palette (`cmdk`) allows instant search, export, navigation, and model switching without reaching for the mouse.
5. **Curated Action Menus:** Replace sprawling toolbars of 6+ raw export buttons with a single primary action (`Copy All`) and a Radix dropdown menu (`Export as...`).

---

## 2. Component Architecture & Libraries

| Library | Purpose | UX Enhancement |
| :--- | :--- | :--- |
| **`@radix-ui/react-dropdown-menu`** | Export options, action menus | Accessible, clean popover menus replacing wide button arrays. |
| **`@radix-ui/react-tooltip`** | Keyboard hints, metadata tags | Clean floating micro-labels without cluttering static card layouts. |
| **`@radix-ui/react-tabs`** | View toggles, inspector modes | Fluid, keyboard-navigable tabbed interfaces. |
| **`@radix-ui/react-dialog`** | Focus modals, mock interviews | Smooth focus management and backdrop dismissals. |
| **`cmdk`** | Global Command Palette (`Cmd+K`) | Fast-path navigation, search, and instant commands. |
| **`sonner`** | Physics-based stacked toasts | Non-intrusive, beautiful feedback for copy and export actions. |
| **`lucide-react`** | Semantic iconography | Line-weight balanced icons (16px default), never decorative clutter. |
| **`class-variance-authority`** | Design system variants | Typed variants for buttons, badges, inputs, and cards. |

---

## 3. Layout Architecture: Master-Detail Inspector

The core workspace (`/project/:id`) is structured around **Progressive Disclosure**:

```
+-----------------------------------------------------------------------------------+
| Top Navigation: Wordmark | Project Title | Model Selector | Cmd+K Search | Auth   |
+-----------------------------------------------------------------------------------+
| Phase Stepper: [01 Ingest] -> [02 Signals] -> [03 Truth Drill] -> [04 Playbook]   |
+-------------------------------------------------+---------------------------------+
| Main Workspace (Canvas / Bullets)               | Technical Inspector (Drawer)    |
|                                                 |                                 |
| - Header: Action bar (Copy All, Export ▾, Edit) | - Active Bullet Focus           |
| - Clean Resume Bullets (Google X-Y-Z)           | - Code Proof Anchors            |
|   * Phrased with crisp metrics & actions        | - Spoken Defense Script (Audio) |
|   * Subtle category tag & verification pill     | - Senior Interviewer Challenge  |
|   * Click row to open Inspector                 | - Architectural Trade-offs      |
|                                                 | - Evidence Lineage Audit Trail  |
+-------------------------------------------------+---------------------------------+
```

---

## 4. Design Tokens & Typography

- **Headings & UI:** [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (500/600 weight, tight tracking).
- **Code, Metrics & Anchors:** [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) (400/500 weight, 12-13px).
- **Backgrounds:** `#090a0d` (base), `#0f1116` (surface), `#151820` (sub-surface/hover).
- **Borders:** `rgba(255, 255, 255, 0.08)` for regular dividers, `rgba(255, 255, 255, 0.14)` for focus/hover.
- **Accent:** Emerald `#10b981` (grounded/verified), Indigo/Cyan `#38bdf8` (selected/active).
- **Destructive/Flag:** Rose `#f43f5e` (ungrounded claim removed).

---

## 5. Verification Checklist

1. `npm run typecheck` & `npm run lint` pass with 0 errors.
2. `npm test` passes 100% of pipeline and grounding tests.
3. Production bundle builds cleanly in SPA mode (`build/client/index.html`).
4. Zero-infra guarantee remains 100% intact (client-only, Puter SDK v2, `localStorage`).
5. Visual review confirms: zero screaming all-caps headers, no card-nesting sprawl, unified command palette, smooth Radix menus.

