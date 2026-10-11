# Build Handoff â€” Proof

> **Read `docs/ARCHITECTURE.md` first.** That is the product contract and the source of truth. This file is the *implementation* companion: everything an agent needs to build v1 without access to any other codebase or conversation. If the two ever disagree, ARCHITECTURE.md wins and you should flag the conflict rather than guessing.

**Audience:** an AI coding agent (or developer) building this fresh, with no prior context.
**Build target:** v1 vertical slice only (paste-only input; the extract â†’ Truth Drill â†’ synthesize â†’ defend loop). GitHub ingestion (ARCHITECTURE.md Â§7) is v2 â€” do **not** build it yet.
**Project root:** `D:\pasti_berhasil\codee\webdev\new\MAIN\track_applikasi\proofcheck`

---

## 0. Non-negotiables (read before writing code)

1. **The anti-fabrication guarantee is the product.** Implement ARCHITECTURE.md Â§8 in full, including the deterministic validation pass in `app/lib/grounding.ts` and the acceptance test. A pretty UI that lets the AI invent "40% faster" is a failed build.
2. **Paste-only input for v1.** No GitHub fetching. The `SourceInput` component has one path: a textarea.
3. **No server.** SPA mode (`ssr: false`). All auth / persistence / AI go through `window.puter`.
4. **Verify before claiming done:** `npm run typecheck`, `npm run lint`, `npm run build`, and the Â§8 acceptance test must all pass. Report the results.
5. **Do not fabricate values yourself** either â€” no placeholder production URLs, fake stats, or invented sample data beyond clearly-labelled fixtures used in tests.

---

## 1. Reusable code â€” lift these verbatim

The `reference/resumind/` folder in this project contains **proven, working files** from a prior app on the identical stack (React Router v7 SPA + Puter.js + Tailwind v4 + TS strict). Copy them into the new project at the mapped paths and adapt only where noted. They are known-good: `typecheck`, `lint`, and `build` all pass with them.

| Reference file | Copy to | Change needed |
|---|---|---|
| `reference/resumind/puter.ts` | `app/lib/puter.ts` | **None.** Full Zustand store: `auth`, `fs`, `kv`, `ai.chat`, `ai.feedback`, `ai.img2txt`, `init()`. Use `kv` for persistence and `ai.chat` for synthesis (pass the `MODEL` constant from Section 5.0, not a hardcoded string). You can delete `fs.*` and `ai.feedback`/`img2txt` if unused, but leaving them is harmless. |
| `reference/resumind/utils.ts` | `app/lib/utils.ts` | **None.** Provides `cn()`, `generateUUID()`, `extractAIText()`, and the tolerant `parseAIJson<T>()`. You will reuse `parseAIJson` for every AI response and KV load â€” never `JSON.parse` an AI payload directly. |
| `reference/resumind/puter.d.ts` | `types/puter.d.ts` | **None.** Global `window.puter` types (`ChatMessage`, `PuterChatOptions`, `AIResponse`, `KVItem`, etc.). |
| `reference/resumind/root.tsx` | `app/root.tsx` | Keep the `<script src="https://js.puter.com/v2/">` tag, the `init()` call in `Layout`, the viewport meta, and the `ErrorBoundary`. Change the font import / title to taste. |
| `reference/resumind/react-router.config.ts` | `react-router.config.ts` | **None** (`ssr: false`). |
| `reference/resumind/vite.config.ts` | `vite.config.ts` | **None.** |
| `reference/resumind/tsconfig.json` | `tsconfig.json` | **None** (strict, `~/*` â†’ `app/*` path alias). |
| `reference/resumind/package.json` | `package.json` | Rename `"name"`. You may **drop** `pdfjs-dist` and `react-dropzone` (not needed in v1). Keep react, react-dom, react-router, @react-router/*, zustand, clsx, tailwind-merge, tailwindcss, @tailwindcss/vite, and the eslint/prettier/typescript devDeps. Run `npm install` after. |

Key store facts the agent needs:
- `const { auth, kv, ai } = usePuterStore();`
- `await ai.chat(prompt, { model: MODEL, temperature: 0.3 })` returns `AIResponse | undefined`; get text via `extractAIText(res.message.content)`, then `parseAIJson<T>(text)`. `MODEL` is a single constant in `lib/prompts.ts` (see Section 5.0) — never hardcode a model string at the call site.
- `await kv.set(key, JSON.stringify(value))` / `await kv.get(key)` / `await kv.list("proof:session:*", true)` (returns `KVItem[]` when `true`).
- `auth.isAuthenticated`, `auth.signIn`, `auth.signOut`. Gate the app behind auth exactly like a standard protected route; redirect to `/auth?next=...`.

---

## 2. Files to build new (v1)

Per ARCHITECTURE.md Â§10, minus the GitHub pieces:

```
app/
  routes.ts                # index(home) , /auth , /project/:id , /wipe
  routes/
    home.tsx               # project library: kv.list("proof:session:*") â†’ cards
    auth.tsx               # Puter sign-in; resolveNext() open-redirect guard (see Â§4)
    project.tsx            # THE APP: 4-phase state machine (inputâ†’analysisâ†’drillâ†’output)
    wipe.tsx               # reset: list + delete sessions, kv.flush(), confirm step
  components/
    SourceInput.tsx        # v1: a single textarea + "Scan Architecture" button
    StackBadges.tsx        # render SignalSet.stack + presence flags as badges
    TruthDrill.tsx         # render 2-3 questions (MCQ-with-"other"), collect answers
    BulletCard.tsx         # one bullet + copy button + flags
    DefenseCard.tsx        # question + script, expandable
  lib/
    parse.ts               # Step 1 deterministic parser (see Â§3) â€” UNIT TESTED
    prompts.ts             # Stage 1 / drill / Stage 2 prompt builders (see Â§5)
    grounding.ts           # Â§8 validation pass â€” UNIT TESTED
types/
  index.d.ts               # SignalSet, Claim, Bullet, ProjectSession (ARCHITECTURE Â§6)
```

Add a test runner (Vitest â€” it is the natural fit for Vite) for `parse.ts` and `grounding.ts` and the acceptance test. Add `"test": "vitest run"` to scripts.

---

## 3. `lib/parse.ts` â€” the deterministic parser (Step 1)

Pure functions, no AI, no network. Input: the pasted markdown string. Output: `SignalSet` (ARCHITECTURE Â§6). This is unit-testable and must be, because it is the ground truth the whole guarantee rests on.

Responsibilities:
- **Manifest detection from pasted text:** if the paste includes a fenced ```json block that looks like `package.json`, parse `dependencies`/`devDependencies`. Map known deps to signals: `ioredis`/`redis` â†’ caches: ["Redis"]; `pg`/`postgres`/`prisma` â†’ databases; `express`/`fastify`/`next`/`react` â†’ frameworks; `jest`/`vitest`/`mocha` â†’ `presence.hasTests`. Keep the mapping table small, explicit, and extensible.
- **Presence flags from text mentions:** scan for "Dockerfile", "docker-compose", `.github/workflows`, "CI", "migration(s)", ".env.example". These are best-effort from prose in v1 (real file-tree detection is a v2 GitHub concern).
- **Declared features:** pull bullet-like lines (`- ...`, `* ...`) and headvy sentences under a "Features"/"What it does" heading.
- Always set `rawSource` to the original text (traceability for Â§8).

Never infer an architecture *pattern* (no "microservices"). Only concrete, pointable signals. If nothing is detected, return an empty-but-valid `SignalSet` â€” the UI handles the thin case by leaning harder on the Truth Drill.

---

## 4. Ports to copy from the reference app's patterns (small, inline)

These are tiny and were proven in the reference app; reimplement inline (not in the reference folder because they are route-specific):

- **`resolveNext(search)` in `auth.tsx`** â€” open-redirect guard. Only allow a single leading slash not followed by another slash; otherwise return `"/"`. (Rejects `//evil.com` and absolute URLs.)
- **Object-URL cleanup** â€” not needed in v1 (no blobs). Skip.
- **`wipe.tsx`** â€” list sessions, `Promise.allSettled` the deletes, `kv.flush()`, require a confirm click before destroying, report partial failures.

---

## 5. `lib/prompts.ts` â€” prompt drafts (tune, don't treat as final)

Two (optionally three) AI calls. All pass `{ model: MODEL, temperature: 0.3 }` (see Section 5.0 for the `MODEL` constant). Every response must be instructed to return **only JSON, no prose, no code fences** â€” and you still pass it through `parseAIJson` because models disobey.

### 5.0 The `MODEL` constant — single source of truth, defaults to `gpt-5-mini`

Do NOT hardcode a model string anywhere except here. `lib/prompts.ts` exports constants that AI calls reference:

```ts
// app/lib/prompts.ts
export const MODEL = "gpt-5-mini"; // swappable; see options below
export const DEFAULT_AI_OPTIONS: PuterChatOptions = {
  temperature: 0.2,
  reasoning_effort: "low", // suppresses unnecessary thinking tokens on structured JSON tasks
  verbosity: "low",        // eliminates conversational preamble and fluff
};
```

- **Default: `gpt-5-mini`** with `reasoning_effort: "low"` and `verbosity: "low"`. Fast, highly cost-effective, and minimal latency for structured JSON extraction.
- **Top Non-OpenAI Alternative: `alibaba:qwen/qwen-max`** — high instruction-following and structured constraint obedience.
- **Other Oct 2026 Live Options:** `gemini-3.6-flash` (sub-second extraction), `claude-haiku-5-5` (fast nuance), `claude-opus-4-8` (deep reasoning).
- **Why one constant matters:** the §8 grounding pass is model-independent, so the model can be swapped (or selected by the user via the UI dropdown) in one line without weakening the anti-fabrication guarantee.

### Stage 1 â€” structure signals into candidate claims + drill questions
System intent:
```
You are a senior engineer reviewing a student's project to extract DEFENSIBLE resume
material. You will receive extracted signals (stack, presence flags, declared features)
and the raw project text.

Produce candidate CLAIMS about what the student built, grouped into exactly three
categories: "systems" (data flow, concurrency, schema, caching, state), "api"
(validation, auth, rate-limiting, error boundaries), "reliability" (tests,
containerization, CI/CD, migrations).

For each claim, decide status:
- "grounded": the mechanism is clearly supported by the signals/text with NO invented numbers.
- "needs-drill": the claim would be much stronger with one specific fact only the student
  knows (what the cache held, the data volume tested, why a trade-off was made).

For every "needs-drill" claim, write ONE short, SPECIFIC question tied to a concrete
signal (reference the actual dependency/feature, e.g. "You depend on ioredis â€” what did
Redis store: query results, session state, or a job queue?"). Prefer multiple-choice with
an "other" escape. Generate at most 3 questions total across all claims.

HARD RULES:
- Never invent a percentage, latency, throughput, user count, or data volume.
- Never use: spearheaded, leveraged, utilized, participated in, responsible for.
Return JSON: { claims: Claim[], questions: {claimId, question, options?: string[]}[] }
```

### Stage 2 â€” synthesize bullets + defense cards (after drill answers)
System intent:
```
You are writing final resume bullets in the Google X-Y-Z form:
"Accomplished [X] as measured by [Y] by doing [Z]". One bullet per category
(systems, api, reliability). Use ONLY the claims and the student's drill answers below.

ANTI-FABRICATION (absolute):
- A number (%, ms, x, "millions", counts) may appear ONLY if it is present verbatim in
  the source text or in a drill answer. Otherwise write the qualitative version and add a
  flag "metric omitted â€” not measured".
- Banned words: spearheaded, leveraged, utilized, participated in, responsible for.
- Describe mechanisms and trade-offs, not vibes.

For each bullet also produce an Interview Defense Card:
- "question": the toughest likely interviewer question about THIS bullet.
- "script": a truthful 1-2 sentence answer the student can actually defend, grounded in
  their drill answers.

Return JSON: Bullet[] where Bullet = { category, text, grounding: string[],
defense: {question, script}, flags: string[] }.
```

Keep `temperature` low (e.g. 0.3) for the synthesis call to reduce drift.

---

## 6. `lib/grounding.ts` â€” the deterministic validation pass (ARCHITECTURE Â§8, layer 2)

Runs on `Bullet[]` returned by Stage 2, in our code, after the AI. This is the belt to the prompt's suspenders.

```ts
// Pseudocode contract â€” implement and unit-test.
const NUMBER_LIKE = /\b(\d+(\.\d+)?\s*(%|x|ms|s|k|m|gb|mb|requests?|users?|rows?))\b/i;

export function enforceGrounding(bullets: Bullet[], groundedCorpus: string): Bullet[] {
  // groundedCorpus = rawSource + all drill answers, lowercased.
  return bullets.map((b) => {
    const hits = [...b.text.matchAll(NUMBER_LIKE)].map((m) => m[0]);
    const ungrounded = hits.filter((h) => !groundedCorpus.includes(normalize(h)));
    if (ungrounded.length === 0) return b;
    // Strip the ungrounded number tokens and flag it. Do NOT trust the model.
    let text = b.text;
    for (const u of ungrounded) text = stripNumberPhrase(text, u);
    return { ...b, text, flags: [...b.flags, `metric removed (ungrounded): ${ungrounded.join(", ")}`] };
  });
}
```
Edge cases to test: year numbers ("2024") and version numbers ("ES2022", "React 19") must NOT be stripped â€” scope the regex to metric-like units, not bare integers. Document any token you deliberately allow.

### Acceptance test (must pass before v1 is "done")
```
Given a source README containing zero numeric metrics
And drill answers containing zero numeric metrics
When the full pipeline runs
Then no output bullet .text contains a NUMBER_LIKE token.
```
Implement this as a Vitest test that mocks the AI call with a deliberately
fabricating response (one that includes "improved performance by 40%") and asserts
`enforceGrounding` removes it and adds a flag.

---

## 7. Styling

Tailwind v4 via `@tailwindcss/vite` (already in the reference `vite.config.ts`). The reference `app.css` uses a `@theme` block with custom colors and a `Mona Sans` font import â€” you may copy that approach or start minimal. Split-screen layout on desktop, single stacked pane on mobile (ARCHITECTURE Â§9). No fake progress bars; honest loading labels.

---

## 8. Definition of done (v1)

- [ ] All files in Â§2 exist; reference files ported per Â§1.
- [ ] Paste a README â†’ stack badges render from `parse.ts`.
- [ ] 2â€“3 repo-specific drill questions generate and collect answers.
- [ ] Three bullets (one per category) render with copy buttons + Defense Cards.
- [ ] Session persists to KV (`proof:session:<uuid>`) and reloads on `/project/:id`.
- [ ] `home.tsx` lists saved sessions; `wipe.tsx` clears them behind a confirm.
- [ ] `enforceGrounding` + the Â§6 acceptance test pass.
- [ ] `npm run typecheck`, `npm run lint`, `npm run build` all green.
- [ ] No GitHub code shipped (that is v2).

## 9. Decisions still open (ask Kentaro; do not invent answers)
From ARCHITECTURE.md Â§12: product **name** (placeholder "Proof"), confirmed **niche** (student/new-grad software), any **deadline/competition** driving polish-vs-breadth, and **MCQ vs short-answer** for the drill (handoff assumes MCQ-with-"other"). If these block you, build to the assumptions stated here and leave a clearly-flagged TODO rather than fabricating a decision.
```

