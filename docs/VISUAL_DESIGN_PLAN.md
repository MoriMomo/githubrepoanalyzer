# Visual Design Plan — Proof

> **This is a plan, not an implementation.** Do not modify code while reading it. It defines the visual direction and the design system to apply as the v1 UI is built (or retrofitted onto it once built). When you do implement, preserve all existing behavior and the data/state contracts in the architecture doc.

## 0. Read first + stated assumptions

Read `docs/ARCHITECTURE.md` (product contract, §9 is the UI state machine) and `docs/BUILD_HANDOFF.md` (stack, file layout) before applying anything here. If they disagree with this file on behavior or structure, those win — this file governs *visuals only*.

**Assumptions about the current visual state (state them, then proceed):**
1. The Proof UI is **not built yet** — the architecture doc describes a planned 4-phase layout (`input → analysis → drill → output`) but no components exist on disk yet. This plan is therefore a **design system to build against**, not a redesign of existing screens.
2. Stack is fixed: React 19 + React Router v7 (SPA, `ssr: false`), **Tailwind v4** via `@tailwindcss/vite`, TypeScript strict. All visual work must be Tailwind-first and SPA-safe (no SSR-only tricks).
3. The ported `reference/resumind/app.css` uses a Tailwind v4 `@theme` block and a Google-font import — reuse that mechanism; do not introduce a second styling system (no CSS-in-JS runtime, no styled-components).
4. If any of these is false when you start (e.g. components already exist), **stop and report what you found** before changing direction.

---

## 1. Target visual direction — "defensible, not decorative"

Proof's brand promise is *grounded, honest, no fabrication*. The visuals must embody that: **clean, intentional, tech-savvy — the opposite of generic AI slop.** The look should read like a precise developer tool (think Linear, Vercel dashboard, Raycast, Railway), not a pastel SaaS landing page.

**Principles**
- **Restraint over decoration.** Every element earns its place. No gradient blobs, no floating 3D shapes, no stock illustrations, no emoji-as-icons.
- **Typographic hierarchy does the work**, not color. One strong display face for headings, one clean mono/grotesk for data and code-like content.
- **Monospace signals "technical."** Stack badges, model names, signal flags, and bullet metadata use a mono face — it reads as "this tool understands code."
- **Dense but breathable.** Developer tools pack information; use whitespace and dividers for rhythm, not giant hero padding.
- **Honest motion.** Micro-interactions only, and only where they convey state (a bullet being grounded, a phase transition). No decorative parallax. Must respect `prefers-reduced-motion`.

**Anti-slop checklist (reject the design if any are true):**
- Generic purple→blue hero gradient, or a gradient on body background.
- Centered single-column marketing layout for what is actually a tool.
- Rounded-everything with heavy drop shadows (the "bubbly SaaS" look).
- Emoji used as feature icons.
- More than ~2 accent colors.
- Lorem-ipsum-shaped filler or fake dashboard screenshots.

---

## 2. The design system (define once, reuse everywhere)

Put these as tokens in the Tailwind v4 `@theme` block in `app/app.css`. Values below are a **starting palette** — a restrained, near-neutral dark-first scheme with a single functional accent. Adjust hues, but keep the discipline (neutrals + one accent + semantic status colors).

```css
@theme {
  /* Typography */
  --font-display: "Space Grotesk", ui-sans-serif, system-ui, sans-serif; /* headings */
  --font-sans:    "Inter", ui-sans-serif, system-ui, sans-serif;          /* body */
  --font-mono:    "JetBrains Mono", ui-monospace, SFMono-Regular, monospace; /* data/code */

  /* Neutrals (dark-first; invert for light mode if added) */
  --color-bg:        #0b0d10;  /* near-black, not pure black */
  --color-surface:   #14171c;  /* cards/panels */
  --color-surface-2: #1b1f26;  /* raised */
  --color-border:    #262b33;
  --color-text:      #e6e9ef;
  --color-text-dim:  #9aa3b2;

  /* ONE accent — functional, not decorative */
  --color-accent:    #5eead4;  /* teal-ish; signals "verified/grounded" */
  --color-accent-dim:#2dd4bf;

  /* Semantic status (map to the grounding guarantee) */
  --color-ok:    #4ade80;  /* grounded claim */
  --color-warn:  #fbbf24;  /* needs-drill */
  --color-flag:  #fb7185;  /* metric stripped / ungrounded */
}
```

**Fonts:** load via one `@import url(...)` in `app.css` (Google Fonts: Space Grotesk + Inter + JetBrains Mono) — same mechanism the reference `app.css` already uses. Preconnect in `root.tsx` links (the reference `root.tsx` already preconnects to fonts.googleapis.com — reuse it).

**Spacing/radius discipline:** standardize on a small radius (`rounded-md`, 6–8px) everywhere; no `rounded-3xl`. Borders over shadows: use `1px` `--color-border` to separate surfaces, reserve shadow for one elevation level (dropdowns/modals) only.

---

## 3. Libraries & techniques — what to add and exactly where

Keep the dependency footprint small and deliberate (consistent with the anti-slop ethos). Recommended additions, each justified by *where it applies*:

| Library | Version pin | Where it applies | Why (and why not something heavier) |
|---|---|---|---|
| **lucide-react** | pin latest stable | All icons (stack badges, phase steps, copy button, flags) | Clean, consistent, line-based icon set. Replaces emoji/ad-hoc SVGs. Tree-shakeable. |
| **class-variance-authority (cva)** | pin latest | Button, Badge, Card variants | Typed, declarative component variants on top of Tailwind. Prevents className soup. Pairs with the already-present `clsx`/`tailwind-merge` (`cn()` util is already ported). |
| **framer-motion** (`motion`) | pin latest | Phase transitions, bullet reveal, drill-answer state | Only for *stateful* motion. Lazy-import it in the one or two components that animate so it stays out of the initial bundle (SPA perf). Respect `prefers-reduced-motion` via its reduced-motion API. |
| **@fontsource** *(optional alt to Google CDN)* | pin latest | Self-host the three fonts | Use if you want zero external font requests / offline. Otherwise the Google `@import` is fine for v1. |

**Deliberately NOT adding:** no component kit (shadcn is fine *conceptually* but copy only the 4–5 primitives you need, don't pull a whole library), no icon-font, no CSS-in-JS runtime, no charting lib (nothing to chart in v1), no three.js/ogl/GSAP (overkill, and heavy — the kind of bundle bloat that hurt a prior project).

**Techniques:**
- **Build 5 primitives, compose everything from them:** `Button`, `Badge`, `Card`, `Panel`, `Divider` — each a cva-driven component in `app/components/ui/`. Every screen uses these; nothing hand-rolls a button.
- **A subtle dotted/grid background** on the app shell via a CSS `background-image` (radial-dot or 1px grid at ~4% opacity) — reads "technical canvas" without a gradient. One rule in `app.css`, not a component.
- **Mono for all machine data:** model name, `vendor:family/model` ids, stack tokens, signal flags, UUIDs. This single choice does most of the "tech-savvy" lifting.
- **Focus-visible rings** in the accent color on every interactive element (accessibility + looks intentional).
- **Honest loading states** (architecture §9): skeleton rows or a quiet pulsing label ("Writing defensible bullets"), never a fake percentage bar.

---

## 4. Screen-by-screen application (maps to architecture §9)

Apply the system to the planned phases without changing their behavior or the `ProjectSession.phase` state machine:

- **App shell / `root.tsx`:** dark `--color-bg`, dotted-grid background, a slim top bar — left: wordmark in display font + a mono version tag; right: auth state (sign-in/out) and the current model name in mono (`gpt-5-mini` etc.). Split-screen container on desktop (`lg:grid-cols-2`), single stacked pane on mobile.
- **`input` phase (`SourceInput`):** one focused `Panel` with a large monospace `<textarea>` (it holds a README — mono makes that feel right), a clear primary `Button` ("Scan Architecture"). No hero. A one-line honest subtitle stating the privacy/grounding promise.
- **`analysis` phase (`StackBadges`):** detected stack + presence flags as mono `Badge`s with lucide icons (e.g. a container icon for Dockerfile, a check for CI). Right pane shows a quiet "Generating your Truth Drill…" skeleton.
- **`drill` phase (`TruthDrill`):** 2–3 questions as cards; MCQ options as selectable chips with a clear selected state in the accent color; an "other" free-text affordance. Left pane; right pane shows a live preview of which claims are becoming grounded (status dots: ok/warn).
- **`output` phase (`BulletCard` + `DefenseCard`):** the payoff screen. Each bullet in a `Card` with: the bullet text (body font), a mono metadata row (category + grounding sources), a copy button (lucide `Copy`, with a copied state), and any `flags` rendered in `--color-flag` ("metric removed (ungrounded)"). The `DefenseCard` expands below with the interviewer question + defense script, visually distinct (surface-2, left accent border). This is the screenshot-worthy moment — make it the most polished.
- **`home.tsx` (library) / `wipe.tsx`:** session list as compact `Card` rows (mono timestamp + source ref); wipe keeps its confirm step, styled with `--color-flag` for the destructive action.

---

## 5. Implementation steps (in order)

Do this as a series of small, verifiable commits — do not reformat or restructure unrelated code.

1. **Tokens + fonts:** add the `@theme` tokens and font imports to `app/app.css`; set the shell background. Verify the app still renders.
2. **Install libs:** add lucide-react, cva, framer-motion with pinned versions; `npm install`. Confirm the build still passes before writing components.
3. **UI primitives:** build `app/components/ui/{Button,Badge,Card,Panel,Divider}.tsx` with cva variants, composed from `cn()`. Add a tiny `/ui-kit` demo route (or a Storybook-free sandbox section) to eyeball them — remove it before done, or keep behind a dev flag.
4. **Apply shell + phases** in the order of §4, one phase per commit, wiring to existing components/state without altering behavior.
5. **Motion pass:** lazy-import framer-motion only in the phase-transition and bullet-reveal spots; add the `prefers-reduced-motion` guard.
6. **Accessibility pass:** focus-visible rings, color-contrast check on text vs surfaces (AA minimum), keyboard navigation through the drill. Note: full WCAG conformance needs manual assistive-tech testing — state that rather than claiming it.

## 6. Verification (must pass before claiming done)

From the project root, after the visual work:
1. `npm run typecheck` — clean.
2. `npm run lint` — no new errors.
3. `npm run build` — succeeds; **check the client bundle size did not balloon** (framer-motion must be code-split, not in the initial chunk). Report the before/after of the largest chunks.
4. Manual visual check against the §1 anti-slop checklist and the §3 "deliberately NOT adding" list — confirm none were violated.
5. Confirm **no behavior changed**: the `input→analysis→drill→output` flow, the grounding pass, and KV persistence work exactly as before the visual work.

## 7. Guardrails
- Preserve existing behavior and all data/state contracts; this is a visual layer only.
- No fabricated content, fake screenshots, or placeholder stats in the UI (consistent with the product's anti-fabrication ethos) — use real empty/loading states.
- Keep the dependency list minimal and pinned; justify any library beyond the four above before adding it.
- Tailwind-first; no second styling runtime.
```

