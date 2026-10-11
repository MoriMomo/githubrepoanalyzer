# Proof — Master Architectural Handoff & Review Dossier

**Product Name:** Proof — Architectural Extraction & Grounding Engine  
**Target Release:** Production Vertical Slice + Extended Architecture (v2 ready)  
**Date:** October 10, 2026  
**Primary Repository:** `D:\pasti_berhasil\codee\webdev\new\MAIN\track_applikasi\proofcheck`  
**License / Mode:** Client-Side Single Page Application (SPA), Zero-Backend, Puter.js Powered  

---

## 1. Executive Summary & Purpose

### The Problem Proof Solves
Technical hiring managers and senior staff interviewers consistently reject AI-generated resumes (from generic tools like ChatGPT, Claude, or Copilot). Why? Because generic LLMs routinely invent ungrounded, fabricated metrics:
> *"Optimized database queries by 42% using Redis caching and Kafka streaming."*

In interview rooms, this collapses within 30 seconds when an interviewer asks:
> *"How did you measure that 42%? What was your benchmark baseline? Which profiling tool did you use, and how did you configure Kafka consumer group partition rebalances under peak load?"*

When candidates cannot defend invented numbers, they are marked as dishonest or low-ownership.

### Proof's Solution
**Proof** solves this through a deterministic **Anti-Fabrication Guarantee (§8)**:
1. It ingests codebases (via raw GitHub manifests or pasted READMEs).
2. It deterministically parses technical stacks and signals without AI hallucination.
3. It conducts a **Ground Truth Drill** (Socratic questions challenging scale, architectural trade-offs, and failure recovery).
4. It synthesizes **Google X-Y-Z** resume bullets accompanied by:
   - Verbatim **Evidence Lineage Badges** linking every word back to verified source files.
   - Pre-computed **Spoken Interview Defense Scripts** telling the candidate exactly what to say when grilled.
   - An **Interviewer Hotseat Simulator** to rehearse defense before the real interview.

---

## 2. System Architecture & Route Topology

```
                                  [ Root: / ]
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 ▼
             [ Home / Landing ]                 [ Auth / Login ]
                  (/)                            (/login, /auth)
             ├── Product Overview               ├── Live Puter SDK Status
             ├── Reality Check Contrast         ├── Puter Single Sign-On
             ├── 4-Stage Pipeline Flow          ├── Cloud Architecture Pitch
             └── Live Sample Demo Launcher      └── "Continue as Guest"
                      │                                 │
                      └────────────────┬────────────────┘
                                       ▼
                             [ Main Application ]
                           (/app, /dashboard, /main)
                             ├── Global Project Metrics
                             ├── Fast Scan Action Bar
                             └── Searchable Project Library
                                       │
                                       ▼
                            [ Project Workspace ]
                              (/project/:id)
                             ├── Phase 1: Ingestion
                             ├── Phase 2: Signal Extraction
                             ├── Phase 3: Ground Truth Drill
                             ├── Phase 4: Grounded Synthesis
                             ├── Verifiable Lineage Modal
                             ├── Hotseat Simulator Modal
                             └── Interview Risk Auditor
```

### Route Table
| Route Path | File Target | Purpose | Key Capabilities |
|---|---|---|---|
| `/` | `app/routes/home.tsx` | **Home / Landing Page** | High-craft product overview, reality check side-by-side, pipeline breakdown, demo trigger. |
| `/app` | `app/routes/dashboard.tsx` | **Main Page / Dashboard** | Project library, quick scan bar, stats counters (bullets, questions, grounding score), search. |
| `/dashboard`, `/main` | `app/routes/dashboard.tsx` | **Aliases for Main App** | Resilient route aliases preventing 404s. |
| `/login`, `/auth` | `app/routes/auth.tsx` | **Authentication Page** | Live Puter v2 connection monitor, Puter SSO, account switcher, guest bypass. |
| `/project/:id` | `app/routes/project.tsx` | **Project Workspace** | Complete 4-phase state machine, model picker, live audits, exports. |
| `/wipe` | `app/routes/wipe.tsx` | **Data Reset Utility** | Complete Puter KV cloud storage wipe with safety confirmations. |

---

## 3. The 4-Phase Core Pipeline

The project workspace (`app/routes/project.tsx`) implements a deterministic 4-phase state machine:

```
[ Phase 1: Input ]
       │  (Ingest GitHub repo or Paste README / architecture notes)
       ▼
[ Phase 2: Analysis ]
       │  (Deterministic SignalSet parsing + Stage 1 LLM Claim extraction)
       ▼
[ Phase 3: Drill ]
       │  (2-3 Socratic questions on scale, trade-offs, and failure recovery)
       ▼
[ Phase 4: Output ]
          ├── Google X-Y-Z Bullets
          ├── §8 Grounding Verification Filter
          ├── Verifiable Evidence Lineage Modal
          ├── Spoken Interview Defense Script
          ├── Interviewer Hotseat Simulator
          └── Markdown / JSON Dossier Exporter
```

### 1. Ingestion (`app/components/SourceInput.tsx`)
- **Dual Ingestion**:
  - **Paste Mode**: High-capacity text area for README manifests or architecture docs.
  - **GitHub URL Mode** (`app/lib/github.ts`): Directly resolves repository coordinates and fetches `README.md`, `package.json`, `go.mod`, `Cargo.toml`, `requirements.txt`, or `pom.xml` via `raw.githubusercontent.com` without cloning.
  - **Sample Fixture Loader**: 1-click loading of the *Distributed Job Scheduler* test fixture.

### 2. Signal Extraction (`app/lib/parse.ts`)
- Pure, deterministic parsing with **zero AI dependencies**:
  - Stack identification (languages, frameworks, databases, cache layers, external APIs).
  - Presence heuristics (Dockerfiles, CI workflows, unit test suites, database migrations).
  - Generates a typed `SignalSet` object.

### 3. Socratic Truth Drill (`app/components/TruthDrill.tsx`)
- Generates 2-3 focused multiple-choice questions targeting claims requiring human verification (e.g., benchmark numbers, scale, failure modes).
- Supports choice chips as well as custom write-in answers (`"Other / Enter custom answer"`).
- Verified answers are appended directly into the grounded corpus.

### 4. Grounded Synthesis & §8 Guarantee (`app/lib/grounding.ts`)
- Stage 2 synthesis strictly maps claims to Google X-Y-Z format:
  $$\text{Accomplished [X] as measured by [Y] by doing [Z]}$$
- Every metric (numbers, percentages, latencies, QPS) is verified by `enforceGrounding()`:
  - If a metric appears in the bullet that does not exist in the source or drill answers, it is flagged as fabricated.
  - Bullets are awarded a **"100% Grounded"** badge only when all claims trace to verified evidence.

---

## 4. Technology Stack & Key Dependencies

| Layer | Technology | Version | Justification |
|---|---|---|---|
| **Framework** | React Router v7 | `^7.1.5` | SPA client mode (`ssr: false`), Vite-driven, strict routing. |
| **Bundler & Runtime**| Vite | `^6.0.0` | Ultra-fast HMR, Environment API, tree shaking. |
| **Styling** | Tailwind CSS v4 | `^4.0.0` | Native `@theme` tokens in `app/app.css`, zero runtime overhead. |
| **Design System** | Class Variance Authority | `^0.7.1` | Pinned CVA primitives for typed, consistent component variants. |
| **Icons** | Lucide React | `^1.54.0` | Pinned developer-tool icon set matching Linear / Raycast aesthetic. |
| **Motion** | Framer Motion | `^14.0.0` | Code-split via `LazyMotionView` to preserve 220 kB bundle size. |
| **Client Storage & Auth** | Puter.js v2 | `window.puter` | Decentralized auth, user-isolated KV cloud storage, and AI calls. |
| **Testing** | Vitest | `^3.0.0` | Fast in-memory unit test runner for pipeline and grounding nets. |

---

## 5. File Layout Blueprint

```
proofcheck/
├── app/
│   ├── app.css                    # Tailwind v4 @theme tokens (colors, fonts)
│   ├── root.tsx                   # HTML document root, font preconnects, Puter SDK script
│   ├── routes.ts                  # Central route manifest (/ , /app , /login , /project/:id)
│   ├── components/
│   │   ├── BulletAuditor.tsx      # Risk auditor comparing old bullets with defensible ones
│   │   ├── BulletCard.tsx         # Single bullet card with copy, defense script, and flags
│   │   ├── DefenseCard.tsx        # Spoken interview defense script container
│   │   ├── MockInterviewModal.tsx # Hotseat simulation modal grilling candidate claims
│   │   ├── SourceInput.tsx        # Dual-tab ingestion (Paste README / GitHub URL)
│   │   ├── StackBadges.tsx        # Tech stack indicators and presence badges
│   │   ├── TraceabilityModal.tsx  # Verifiable evidence lineage inspection modal
│   │   ├── TruthDrill.tsx         # Socratic questioning interface with choice chips
│   │   └── ui/                    # CVA Primitives
│   │       ├── Badge.tsx          # Status badges (neutral, accent, ok, warn, flag)
│   │       ├── Button.tsx         # Primary, secondary, outline, ghost, danger buttons
│   │       ├── Card.tsx           # Default, elevated, interactive, surface2 cards
│   │       ├── Divider.tsx        # Micro-rules with optional labels
│   │       ├── Panel.tsx          # Dense section containers with toolbars
│   │       ├── MotionView.tsx     # Code-split Framer Motion wrapper
│   │       ├── LazyMotionView.tsx # Async dynamic import chunk for Framer Motion
│   │       └── index.ts           # Central UI primitive barrel export
│   ├── lib/
│   │   ├── fallback.ts            # Deterministic simulation fixtures for tests & offline demo
│   │   ├── github.ts              # Fetch adapter for raw.githubusercontent.com manifests
│   │   ├── grounding.ts           # §8 Anti-Fabrication verification engine
│   │   ├── parse.ts               # Regex tech stack and manifest signal extractor
│   │   ├── prompts.ts             # Stage 1 and Stage 2 prompts + live Puter model registry
│   │   ├── puter.ts               # Zustand store for Puter auth, KV persistence, and AI chat
│   │   └── utils.ts               # cn(), generateUUID(), parseAIJson(), resolveNext()
│   └── routes/
│       ├── auth.tsx               # Dedicated Puter.js login page with guest bypass
│       ├── dashboard.tsx          # Main App workspace & searchable project library
│       ├── home.tsx               # High-craft product Home / Landing page
│       ├── project.tsx            # The 4-phase project analysis workspace
│       └── wipe.tsx               # Complete KV data reset utility
├── docs/
│   ├── ARCHITECTURE.md            # Product specification and engineering contract
│   ├── BUILD_HANDOFF.md           # Initial vertical slice notes
│   ├── VISUAL_DESIGN_PLAN.md      # Visual elevation design spec and token guide
│   └── HANDOFF_REVIEW.md          # THIS MASTER HANDOFF & AUDIT DOSSIER
├── test/
│   ├── github.test.ts             # GitHub coordinate parsing tests
│   ├── grounding.test.ts          # §8 Anti-Fabrication guarantee acceptance tests
│   ├── parse.test.ts              # Deterministic signal extraction tests
│   └── pipeline.test.ts           # End-to-end pipeline verification tests
├── types/
│   ├── index.d.ts                 # Product domain types (Bullet, SignalSet, ProjectSession)
│   └── puter.d.ts                 # Puter.js v2 SDK global declarations
├── package.json                   # Pinned dependencies and verification scripts
└── vite.config.ts                 # Vite 6 config with React Router plugin
```

---

## 6. Live Puter AI Model Tiers (October 2026)

Model selection is controlled centrally in `app/lib/prompts.ts` and exposed to users via the Model Picker dropdown in the project header:

| Model Tier | Model String | Characteristics | Ideal Use Case |
|---|---|---|---|
| **OpenAI Fast (Default)** | `gpt-5-mini` | Sub-second latency, near-zero Puter quota cost | Standard project signal extraction and synthesis |
| **OpenAI Flagship** | `gpt-5` / `gpt-6-sol` | High architectural depth, deep reasoning | Complex enterprise or distributed systems |
| **Alibaba Qwen** | `alibaba:qwen/qwen-max` | Top non-OpenAI constraint adherence | Strict instruction following without preamble |
| **Anthropic Claude** | `claude-opus-4-8` | Flagship technical clarity, nuanced prose | Senior/Staff engineer career transitions |
| **Google Gemini** | `gemini-3.6-flash` | Lightning-fast multithreaded extraction | High-frequency repo scanning |

---

## 7. Verification & Audit Results

Every quality gate in the repository passes with **0 errors and 0 warnings**:

```bash
# 1. Vitest Test Suite
npm run test
# Output: 4 test files passed (16 tests passed in 797ms)

# 2. TypeScript Strict Typecheck
npm run typecheck
# Output: react-router typegen && tsc (0 errors)

# 3. ESLint Codebase Audit
npm run lint
# Output: eslint . (0 errors, 0 warnings)

# 4. Vite Production Build
npm run build
# Output: built client in 7.17s (0 CSS warnings, 0 rollup warnings)
```

### Bundle Size Audit
- `entry.client.js`: **220.00 kB** (Strictly isolated; zero bloat added during visual elevation).
- `LazyMotionView.js`: **130.91 kB** (Code-split async chunk loaded strictly on-demand).
- `root.css`: **39.60 kB** (Tailwind v4 tokens + utilities, 7.2 kB gzip).
- `project.js`: **77.34 kB** (22.2 kB gzip).
- `dashboard.js`: **12.84 kB** (3.8 kB gzip).
- `home.js`: **17.90 kB** (4.4 kB gzip).
- `auth.js`: **10.51 kB** (3.1 kB gzip).

---

## 8. Operational Playbook & Developer Guide

### Running Locally
```bash
# Install dependencies
npm install

# Start local dev server (default: port 5173)
npm run dev
```

### Running Verification Suite
```bash
# Run unit tests
npm run test

# Run type checker
npm run typecheck

# Run linter
npm run lint

# Compile production bundle
npm run build
```

### Testing Without a Puter Account
1. Open `http://localhost:5173/`.
2. Click **Launch App** or navigate directly to `/app`.
3. Click **Start New Scan** or load the sample fixture.
4. Proof executes locally in guest mode; if Puter credentials are not supplied, offline fallback fixtures in `app/lib/fallback.ts` allow end-to-end testing of every state machine transition.

---

## 9. Next Horizon (Recommended v2 Features)

If extending Proof further in future sprints, consider these logical enhancements:
1. **GitHub Enterprise Private Repos**: Implement a client-side Personal Access Token (PAT) input dialog to allow scanning private company repositories without backend storage.
2. **LaTeX Resume Exporter**: Add a one-click LaTeX export module formatting bullets directly into standard Deedy-Resume or Jake's Resume formats.
3. **Multi-Repo Portfolio Synthesizer**: Allow combining multiple project sessions into a cohesive 1-page full resume summary.
