# Proof — Architecture

> **Working name:** Proof (alt: Defensible, Ground Truth, Receipts). Not final.
> **One line:** An Architectural Extraction & Grounding Engine that turns a student's real project into defensible, interview-survivable resume bullets — it never invents a metric it cannot trace back to the student's own answer.

This document is the build contract. No code is written against it until it is approved. It is deliberately explicit so the implementation (and any other AI agent) can follow it without re-deriving decisions.

---

## 1. The Product in One Breath

A student pastes a project README (and later, a GitHub URL). The app extracts *concrete, verifiable* technical signals from it, asks 2–3 repo-specific questions to ground any claim that would otherwise be fabricated ("the Truth Drill"), then synthesizes three resume bullets in the Google X-Y-Z form — each paired with an **Interview Defense Card** that scripts how to survive being questioned on that exact line.

**The north star (testable):** every number, comparison, or performance claim in an output bullet is traceable to either (a) a fact present in the source text, or (b) an answer the user gave in the Truth Drill. Nothing else. If a claim cannot be grounded, the app marks the gap instead of filling it.

---

## 2. Why This Is Different (and the trap it avoids)

Generic ATS checkers score a resume against a generic rulebook or a pasted job description. They are happy to let an LLM write "optimized queries by 40%" for a student who never measured anything — which gets that student destroyed in the technical interview. Proof's entire value is the opposite: it is a **grounding engine with an anti-fabrication guarantee**, specialized for student / new-grad engineers describing projects they genuinely built.

Positioning consequence: we do **not** claim to detect "microservices" or "MVC" from folder names (overpromising, reads as naive). We detect *concrete signals we can point at* — a Dockerfile exists, a CI workflow exists, `ioredis` is a dependency, a migrations folder exists — and build claims only on those.

---

## 3. Scope

### 3.1 In scope (v1 — the vertical slice)
The unique core loop, proven end to end, with **README/notes paste as the only input**:

1. Paste raw README / notes markdown.
2. Signal extraction (deterministic parse + AI structuring).
3. Truth Drill: 2–3 AI-generated, repo-specific questions.
4. Bullet synthesis: 3 variants (Systems & Data Flow / API & Business Logic / Reliability & DX).
5. Interview Defense Card under each bullet.
6. Copy-to-clipboard per bullet; persist the session so a refresh does not lose work.

### 3.2 In scope (v2 — layered on once the loop is proven)
- GitHub URL ingestion (raw CDN for README + manifest, REST API for the tree) with the paste path as fallback.
- Multiple projects saved per user; a "project library".
- Export all bullets for a project (JSON + plain text).

### 3.3 Out of scope (explicitly, for now)
- Full resume builder / editor.
- ATS-safe PDF export.
- Job-description matching / match %.
- Private-repo auth beyond manual paste.
- Any claim of architectural *pattern* detection (see §2).

**Rationale for slice-first:** if the extract → drill → synthesize → defend loop is not compelling on pasted text, no amount of GitHub plumbing rescues it. The GitHub layer is an input adapter in front of a proven core, not a prerequisite.

---

## 4. Tech Stack

Reuse the proven Resumind stack so we keep working auth, storage, and AI plumbing — "from scratch" in concept, not in infrastructure.

| Concern | Choice | Notes |
|---|---|---|
| Framework | React 19 + React Router v7, **SPA mode** (`ssr: false`) | No server; static bundle. Same as Resumind. |
| Build | Vite 6 | |
| Styling | Tailwind v4 (`@tailwindcss/vite`) | |
| Language | TypeScript 5.8, strict | |
| State | Zustand 5 | One store, mirrors Resumind's `usePuterStore` pattern. |
| Backend | **Puter.js** (`window.puter`) | auth, KV (persistence), AI (`puter.ai.chat`). No API keys, no DB, no server. Model is swappable — see §4.1. |
| GitHub (v2) | `fetch` to `raw.githubusercontent.com` + `api.github.com` | No clone. See §7. |

**Why keep Puter:** AI is the right tool here (reasoning about trade-offs and generating repo-specific questions is exactly where rule engines are weak), and Puter gives us auth + per-user KV persistence + AI with zero backend, where **the signed-in user pays for their own AI calls** (no API key or per-user cost for us). The anti-fabrication guarantee is enforced in *our* prompt + validation layer, not by the model's goodwill.

### 4.1 AI model — swappable, tuned efficiency, defaults to `gpt-5-mini`

The model is **not** hardcoded at call sites. It lives as a single constant in `app/lib/prompts.ts` so it can be changed app-wide in one line, and swapped freely because `grounding.ts` (§8) enforces the anti-fabrication guarantee regardless of which model is used.

```ts
// app/lib/prompts.ts — single source of truth for the model & efficiency options
export const MODEL = "gpt-5-mini"; // default; swappable via model picker
export const DEFAULT_AI_OPTIONS: PuterChatOptions = {
  temperature: 0.2,
  reasoning_effort: "low", // suppresses unnecessary thinking tokens on structured JSON tasks
  verbosity: "low",        // eliminates conversational preamble and fluff
};
```

Every AI call passes the tuned options explicitly: `ai.chat(prompt, { ...DEFAULT_AI_OPTIONS, model: selectedModel })`.

**Default: `gpt-5-mini`.** Proof's two AI passes (Stage 1 signal structuring and Stage 2 Google X-Y-Z synthesis) are strictly constrained instruction-following and clean JSON emission tasks, not open-ended philosophical reasoning. Using `gpt-5-mini` with `reasoning_effort: "low"` and `verbosity: "low"` yields lightning-fast responses, minimal token overhead, and near-zero cost for student users, while our downstream `grounding.ts` net independently guarantees factual correctness.

**Oct 2026 Live Model Tiers on Puter:**
- **OpenAI:** `gpt-5-mini` (fast default), `gpt-5`, `gpt-5.2`, `gpt-6-sol`, `gpt-6-luna` (flagship tier with `:flex`/`:priority`).
- **Alibaba (Qwen):** `alibaba:qwen/qwen-max` (top non-OpenAI alternative for high constraint obedience), `qwen-plus`, `qwen-flash`.
- **Google Gemini:** `gemini-3.6-flash` (sub-second multi-signal flash extraction), `gemini-3.5-flash`.
- **Anthropic Claude:** `claude-haiku-5-5` (fast technical precision), `claude-opus-4-8` (flagship reasoning for multi-tier architectures).
- **DeepSeek:** `deepseek-v4-pro`, `deepseek-v4.1-flash`.

**Model Picker:** Proof includes a model dropdown in the synthesis header, allowing candidates to evaluate synthesis trade-offs across OpenAI, Qwen, Gemini, and Claude while retaining the 100% deterministic anti-fabrication guarantee.

---

## 5. The Processing Pipeline (the heart)

```
  Source text (README / notes)  -- v2 --  GitHub URL
               |                              |
               |                      [Adapter: fetch raw files]
               v                              v
        +------------------------------------------+
        | Step 1 -- Ingestion & Deterministic Parse |
        |  (no AI yet; cheap, verifiable)          |
        |  - detect stack from manifest keys       |
        |  - presence flags: Dockerfile? CI? tests?|
        |    migrations? cache lib? DB driver?     |
        |  - collect declared features from README |
        +------------------------------------------+
               |  -> SignalSet (typed, see §6)
               v
        +------------------------------------------+
        | Step 2 -- AI Signal Structuring          |
        |  ai.chat (Stage 1 prompt), model=MODEL   |
        |  - turn raw signals into candidate claims|
        |  - mark each claim: grounded | needs-drill|
        +------------------------------------------+
               |  -> ClaimSet
               v
        +------------------------------------------+
        | Step 3 -- Truth Drill (micro-interview)  |
        |  AI generates 2-3 questions ONLY for     |
        |  claims marked needs-drill, each tied to |
        |  a concrete signal (e.g. "you depend on  |
        |  ioredis -- what did Redis hold?")       |
        |  - short-answer or multiple-choice       |
        +------------------------------------------+
               |  -> user answers merged into ClaimSet
               v
        +------------------------------------------+
        | Step 4 -- Synthesis + Defense            |
        |  ai.chat (Stage 2 prompt), model=MODEL   |
        |  - 3 bullets (X-Y-Z), one per category   |
        |  - 1 Interview Defense Card per bullet    |
        |  - VALIDATION PASS (see §8) strips/flags  |
        |    any ungrounded number before display   |
        +------------------------------------------+
               |  -> BulletSet (rendered)
               v
        Output view (copy, persist, later export)
```

Two AI calls total in v1 (Stage 1 structuring, Stage 2 synthesis), plus one for question generation if we don't fold it into Stage 1. Keeping calls few matters for latency and Puter cost. All calls use `MODEL` (§4.1).

---

## 6. Data Model (TypeScript shapes)

These are the contracts between pipeline steps. Final field names may shift slightly in implementation but the shape is fixed here.

```ts
// What the deterministic parser produces.
interface SignalSet {
  stack: {
    language: string | null;          // "TypeScript", "Go", "Python"...
    runtime: string | null;           // "Node", ...
    frameworks: string[];              // ["Express", "React"]
    databases: string[];               // ["PostgreSQL"] (from driver dep)
    caches: string[];                  // ["Redis"] (from ioredis/redis dep)
    externalApis: string[];            // best-effort from README/deps
  };
  presence: {
    hasDockerfile: boolean;
    hasCI: boolean;                    // .github/workflows, etc.
    hasTests: boolean;
    hasMigrations: boolean;
    hasEnvExample: boolean;
  };
  declaredFeatures: string[];          // bullet-y lines pulled from README
  rawSource: string;                   // original text, kept for traceability
}

// A candidate claim with its grounding status.
interface Claim {
  id: string;
  category: "systems" | "api" | "reliability";
  text: string;                        // the mechanism, no metrics yet
  evidence: string[];                  // which signals back it (traceability)
  status: "grounded" | "needs-drill";
  // populated after the drill:
  drillQuestion?: string;
  drillAnswer?: string;
}

interface Bullet {
  category: "systems" | "api" | "reliability";
  text: string;                        // Google X-Y-Z form
  grounding: string[];                 // signal ids + drill answers used
  defense: {
    question: string;                  // likely interviewer question
    script: string;                    // how to answer truthfully
  };
  flags: string[];                     // e.g. "metric omitted: not measured"
}

interface ProjectSession {
  id: string;
  createdAt: number;
  sourceType: "paste" | "github";
  sourceRef: string;                   // repo URL or "pasted notes"
  signals: SignalSet;
  claims: Claim[];
  bullets: Bullet[];
  phase: "input" | "analysis" | "drill" | "output";
}
```

**Persistence:** one KV entry per session, key `proof:session:<uuid>`, value = `JSON.stringify(ProjectSession)`. Mirrors Resumind's `resume:<uuid>` pattern. Parsing goes through a tolerant `parseAIJson` helper (ported from Resumind) so a malformed AI payload never crashes a load.

---

## 7. GitHub Ingestion (v2 — spec now, build later)

**Rate-limit reality:** unauthenticated `api.github.com` is **60 req/hour per IP**. Shared campus/demo IPs blow through that fast, and a dead demo is worse than a missing feature. Mitigation, in order:

1. **Prefer the raw CDN** for the two files we always need: `https://raw.githubusercontent.com/{owner}/{repo}/{branch}/README.md` and the manifest (`package.json`, `go.mod`, `requirements.txt`). The raw CDN does not share the API's 60/hr budget.
2. **Hit `api.github.com` only for the tree** (`/git/trees/{branch}?recursive=1`), filtered to the top 2 levels, and only to compute the `presence.*` flags.
3. **Degrade gracefully:** on `403 rate limit` or any failure, surface a clear banner — "GitHub is rate-limiting right now; paste your README instead" — and switch to the paste path. The paste path is always available, so GitHub is strictly an accelerator.
4. Default branch detection: try `main`, then `master`, then one `api.github.com/repos/{owner}/{repo}` call to read `default_branch` (counts against the 60/hr, so last resort).

No token in v1/v2. A user-supplied token is a possible v3 power-user option, not a student default.

---

## 8. The Anti-Fabrication Guarantee (how we actually enforce it)

This is the product; it cannot be left to the model being well-behaved. It must hold regardless of which model (§4.1) is selected. Three layers:

1. **Prompt constraints (Stage 2 system prompt):**
   - Never emit a percentage, latency, throughput, user count, or data volume unless it appears verbatim in the source text or in a Truth Drill answer.
   - Banned fluff: "spearheaded", "leveraged", "utilized", "participated in", "responsible for".
   - Focus on *mechanisms*: trade-offs, protocols, algorithms, schemas, error states, consistency/durability properties.
   - When a quantified claim would strengthen a bullet but no number exists, write the qualitative version and emit a `flag`: "metric omitted — not measured".

2. **Deterministic validation pass (our code, after the AI returns):**
   - Regex-scan each bullet for number-like tokens (`\d+%`, `\d+ms`, `\d+x`, "millions", etc.).
   - For each hit, require a matching source in `grounding`. If none, **strip the number and attach a flag** rather than trusting the model. This runs in `app/lib/grounding.ts` and is unit-tested. Because this layer is model-independent, you can swap the model freely without weakening the guarantee.

3. **Visible traceability in the UI:** each bullet can expand to show *why* each claim is allowed (which signal or drill answer backs it). The Defense Card is the user-facing payoff of this same data.

**Acceptance test for the guarantee:** feed a README with zero numbers and give drill answers with zero numbers → assert no output bullet contains a number-like token. This test must pass before v1 is "done".

---

## 9. UI / State Machine

Four views, driven by `ProjectSession.phase`. Split-screen on desktop (left = input/drill, right = results), single-pane stacked on mobile.

| Phase | Left pane | Right pane | Transition |
|---|---|---|---|
| `input` | Paste box (v2: URL tab) + "Scan Architecture" | Empty / explainer | on scan → run Steps 1–2 → `analysis` |
| `analysis` | Detected **stack badges** + presence flags | "Generating your Truth Drill…" | questions ready → `drill` |
| `drill` | 2–3 questions (short answer / MCQ) + Synthesize | live preview of grounded claims | on submit → run Step 4 → `output` |
| `output` | collapsible source + signals (traceability) | 3 bullets, each with copy button + Defense Card | copy / export / "new project" |

Loading states are honest ("Reading your repo", "Writing defensible bullets") — no fake progress bars, consistent with the grounding ethos.

---

## 10. Project / File Layout (planned — not created yet)

```
proofcheck/
  app/
    root.tsx                 # loads Puter script, inits store
    routes.ts                # index, /auth, /project/:id, /wipe
    routes/
      home.tsx               # project library (list saved sessions)
      auth.tsx               # Puter sign-in (ported pattern)
      project.tsx            # the 4-phase state machine (the app)
      wipe.tsx               # data reset (ported pattern)
    components/
      StackBadges.tsx
      TruthDrill.tsx
      BulletCard.tsx
      DefenseCard.tsx
      SourceInput.tsx
    lib/
      puter.ts               # ported Zustand store (auth/kv/ai)
      parse.ts               # Step 1 deterministic parser (manifests, presence)
      prompts.ts             # MODEL constant + Stage 1 / Stage 2 / drill prompt builders
      grounding.ts           # §8 validation pass (unit-tested)
      github.ts              # v2 ingestion adapter
      utils.ts               # cn, parseAIJson, extractAIText (ported)
  types/
    index.d.ts               # SignalSet, Claim, Bullet, ProjectSession
    puter.d.ts               # window.puter types (ported)
  docs/
    ARCHITECTURE.md          # this file
```

Ported-from-Resumind files are marked; they are proven and reduce v1 risk.

---

## 11. Build Order (when approved)

**v1 — vertical slice (proves the core loop):**
1. Scaffold React Router v7 SPA + Tailwind + Puter store (port from Resumind).
2. `types/` shapes (§6) + `lib/parse.ts` deterministic parser + its unit tests.
3. `lib/prompts.ts` (incl. the `MODEL` constant, §4.1) + `lib/grounding.ts` + the anti-fabrication acceptance test (§8).
4. `project.tsx` state machine with **paste input only**, wiring Steps 1→4.
5. Output view: bullets + Defense Cards + copy + KV persistence.
6. Verify: `typecheck`, `lint`, `build`, and the §8 acceptance test all green.

**v2 — GitHub ingestion & library:**
7. `lib/github.ts` (raw CDN + tree API + graceful fallback, §7).
8. URL tab in `SourceInput`; project library on `home.tsx`; export.

Each v1 step is small enough to verify independently. We do not start v2 until the §8 acceptance test passes.

---

## 12. Open Questions (for Kentaro before build)

1. **Name** — keep "Proof", or one of Defensible / Ground Truth / Receipts? (Affects titles, nothing structural.)
2. **Niche confirmation** — student / new-grad *software* engineers specifically? That tunes the prompt's vocabulary and the three bullet categories.
3. **Deadline / context** — is this tied to a competition or hackathon submission? That changes how much we invest in v1 polish vs. breadth.
4. **MCQ vs short-answer** for the Truth Drill — MCQ is faster for the user and easier to ground; short-answer is richer but needs more validation. v1 could do MCQ-with-"other" to get both.
5. **Model** — default is `alibaba:qwen/qwen-max` (§4.1), swappable via one constant. Confirm Qwen, or name a preferred default. A user-facing picker is an easy post-v1 add.
```

