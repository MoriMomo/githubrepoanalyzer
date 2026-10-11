# Proof — Architectural Extraction & Grounding Engine

> **Turn real software engineering projects into defensible, interview-survivable resume bullets with zero invented metrics.**

Proof is an Architectural Extraction & Grounding Engine tailored for student and new-graduate software engineers. It inspects a project's concrete source artifacts (repository manifests, Dockerfiles, CI workflows, migrations) and runs an interactive **Truth Drill** to anchor every claim.

Every synthesized bullet is formatted in Google's **X-Y-Z formula** (*"Accomplished [X] as measured by [Y] by doing [Z]"*) and paired with an **Interview Defense Card** scripting how to truthfully defend that claim under intense technical interview scrutiny.

---

## The North Star: The Anti-Fabrication Guarantee

Generic ATS resume builders and chatbots happily fabricate metrics like:
> *"Optimized database queries by 40% using Redis caching"*

When a student sits down in front of a senior technical interviewer, the interviewer asks:
> *"How did you measure that 40%? What load testing framework did you use? What was your p99 baseline?"*

The candidate freezes because they never measured it.

### How Proof Enforces the Guarantee:
1. **Prompt Constraints**: The model is strictly instructed never to emit percentages, latencies, or counts unless present verbatim in the source corpus.
2. **Deterministic Validation Pass (`app/lib/grounding.ts`)**: Downstream of the AI, our deterministic validator scans all output bullets for metric units (`%`, `ms`, `x`, `k req/s`, `rows`). If any metric was not explicitly present in the source README or Truth Drill answers, it is **excised and flagged**.
3. **Traceability by Design**: Every bullet displays its verifiable evidence chain from manifest dependencies to candidate answers.

---

## The 4-Phase Pipeline

```
  Source (README / Notes / GitHub URL)
                 │
                 ▼
  [Step 1: Ingestion & Deterministic Parse]
     - Manifest extraction (ioredis, pg, express, docker, vitest)
     - Presence footprint flags (.github/workflows, migrations, .env)
                 │
                 ▼
  [Step 2: AI Signal Structuring]
     - Categorizes candidate claims: Systems, API, Reliability
     - Identifies claims needing student verification
                 │
                 ▼
  [Step 3: The Truth Drill]
     - 2–3 targeted repo-specific micro-interview questions
     - User selects choices or provides custom mechanisms
                 │
                 ▼
  [Step 4: Bullet Synthesis & Interview Defense]
     - Google X-Y-Z bullets synthesized with selected AI model
     - Deterministic grounding validation pass excises ungrounded metrics
     - Generates 1 Interview Defense Card per bullet
```

---

## Core Capabilities

- **Dual-Mode Ingestion**: Ingests public repositories directly via **GitHub URL** (CDN-first caching bypassing rate limits) or **Manual Markdown Paste**.
- **Architecture Showcases**: 3 pre-configured real-world project blueprints (TaskFlow Worker, Go Event Broker, Next.js SaaS Platform).
- **Swappable AI Models & Efficiency Levers**: Defaults to `gpt-5-mini` (tuned with `reasoning_effort: "low"` and `verbosity: "low"` for fast, low-latency, fluff-free JSON extraction). Swappable via UI header to `alibaba:qwen/qwen-max`, `gemini-3.6-flash`, `claude-haiku-5-5`, or `claude-opus-4-8`.
- **Live Grounding Linter**: Real-time warnings if user manual edits introduce ungrounded numbers.
- **Interviewer Hotseat Simulator**: Interactive practice mode with instant AI grounding evaluations and coaching tips.
- **Verifiable Evidence Lineage**: Interactive modal tracing each bullet back to its underlying code dependencies.
- **Interview Risk Auditor**: Compare an old vulnerable bullet against a Proof-defended bullet side-by-side.
- **Multi-Format Export**: One-click download as **LaTeX (`.tex`)** for Overleaf, **Markdown (`.md`)**, **Plain Text (`.txt`)**, and **JSON (`.json`)**.
- **Zero-Backend Architecture**: Runs completely in the browser via **Puter.js** (`window.puter`) with personal cloud KV storage.

---

## Tech Stack

| Layer | Choice | Details |
|---|---|---|
| **Framework** | React 19 + React Router v7 | SPA Mode (`ssr: false`), no backend server required |
| **Bundler** | Vite 6 | Lightning-fast HMR and tree-shaking |
| **Styling** | Tailwind CSS v4 | `@tailwindcss/vite`, rich dark-mode technical palette |
| **State** | Zustand 5 | Client-side reactive store for Puter session management |
| **Cloud & AI** | Puter.js (`window.puter`) | Free client-side AI chat, KV persistence, and authentication |
| **Default Model** | `gpt-5-mini` | Low reasoning effort & low verbosity for fast structured JSON |
| **Test Runner** | Vitest 3 | Unit, acceptance, and pipeline integration tests |

---

## Getting Started

### 1. Prerequisites
- Node.js 20+
- npm 10+

### 2. Installation
```bash
git clone <repository-url>
cd proofcheck
npm install
```

### 3. Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Verification & Quality Assurance

Proof includes a rigorous verification suite:

```bash
# Run unit & anti-fabrication acceptance tests
npm run test

# Run strict TypeScript typechecking
npm run typecheck

# Run ESLint 9 code quality checks
npm run lint

# Build production static bundle
npm run build
```

---

## Directory Tour

```
proofcheck/
├── app/
│   ├── components/
│   │   ├── BulletAuditor.tsx       # Before vs After interview risk auditor
│   │   ├── BulletCard.tsx          # Google X-Y-Z bullet card with live linter
│   │   ├── DefenseCard.tsx         # Interview question & script
│   │   ├── MockInterviewModal.tsx  # Interviewer Hotseat simulator
│   │   ├── SourceInput.tsx         # GitHub URL & Paste input tabs with showcases
│   │   ├── StackBadges.tsx         # Tech stack & architectural footprint pills
│   │   ├── TraceabilityModal.tsx   # Evidence chain lineage modal
│   │   └── TruthDrill.tsx          # Micro-interview question component
│   ├── lib/
│   │   ├── fallback.ts             # Deterministic simulation synthesizer
│   │   ├── github.ts               # Raw CDN & tree ingestion adapter
│   │   ├── grounding.ts            # Anti-fabrication deterministic pass
│   │   ├── parse.ts                # Step 1 deterministic parser
│   │   ├── prompts.ts              # Stage 1 & 2 prompt builders & model configs
│   │   ├── puter.ts                # Puter.js Zustand store
│   │   └── utils.ts                # Helper utilities & open-redirect guard
│   ├── routes/
│   │   ├── auth.tsx                # Puter authentication view
│   │   ├── home.tsx                # Project library with search & per-card delete
│   │   ├── project.tsx             # 4-phase state machine & multi-format export
│   │   └── wipe.tsx                # Secure data purge route
│   ├── root.tsx                    # Root layout & Puter script injection
│   └── routes.ts                   # Route definitions
├── test/
│   ├── github.test.ts              # URL parser unit tests
│   ├── grounding.test.ts           # Anti-fabrication & §8 acceptance tests
│   ├── parse.test.ts               # Step 1 deterministic parser tests
│   └── pipeline.test.ts            # End-to-end integration test
├── types/
│   ├── index.d.ts                  # Core domain models (SignalSet, Claim, Bullet)
│   └── puter.d.ts                  # Global window.puter typings
└── docs/
    ├── ARCHITECTURE.md             # Product contract & source of truth
    └── BUILD_HANDOFF.md            # Implementation companion
```
