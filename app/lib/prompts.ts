import type { SignalSet, Claim } from "~/../types";

/**
 * Single source of truth for the default AI model.
 * Defaults to gpt-5-mini with reasoning_effort: "low" & verbosity: "low"
 * for fast, low-cost, strictly constrained JSON extraction.
 */
export const MODEL = "gpt-5-mini";

/**
 * Tuned efficiency levers for Proof's structured extraction calls.
 * - reasoning_effort: "low" prevents unneeded thinking overhead on constrained JSON tasks.
 * - verbosity: "low" strips conversational fluff and preamble.
 */
export const DEFAULT_AI_OPTIONS: PuterChatOptions = {
  temperature: 0.2,
  reasoning_effort: "low",
  verbosity: "low",
};

export interface ModelOption {
  id: string;
  name: string;
  vendor: string;
  description: string;
  tier: "fast" | "flagship";
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: "gpt-5-mini",
    name: "GPT-5 Mini (Recommended Default)",
    vendor: "OpenAI",
    description: "Fastest JSON extraction with low reasoning overhead & zero fluff",
    tier: "fast",
  },
  {
    id: "alibaba:qwen/qwen-max",
    name: "Qwen Max (Top Non-OpenAI)",
    vendor: "Alibaba",
    description: "High constraint obedience & proven structured output discipline",
    tier: "fast",
  },
  {
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    vendor: "Google",
    description: "Sub-second multi-signal parsing and instant claim structuring",
    tier: "fast",
  },
  {
    id: "claude-haiku-5-5",
    name: "Claude Haiku 5.5",
    vendor: "Anthropic",
    description: "Fast high-precision technical wording and nuance",
    tier: "fast",
  },
  {
    id: "claude-opus-4-8",
    name: "Claude Opus 4.8",
    vendor: "Anthropic",
    description: "Deepest technical interview defense scripts for complex distributed architectures",
    tier: "flagship",
  },
];

/**
 * Stage 1 prompt builder: Structures raw signals into candidate claims and 2-3 Truth Drill questions.
 */
export function buildStage1Prompt(signals: SignalSet): string {
  return `You are a staff software engineer reviewing a student's real project to extract defensible, interview-survivable resume claims.

Source Project Data:
Stack: ${JSON.stringify(signals.stack, null, 2)}
Presence Flags: ${JSON.stringify(signals.presence, null, 2)}
Declared Features: ${JSON.stringify(signals.declaredFeatures, null, 2)}
Source Text:
"""
${signals.rawSource.slice(0, 4000)}
"""

YOUR TASK:
Produce candidate CLAIMS about what the student built, grouped into exactly three categories:
1. "systems": data flow, schemas, concurrency, caching, state management, background processing.
2. "api": endpoints, validation, authentication, rate limiting, error handling, contract design.
3. "reliability": testing, containerization (Docker), CI/CD workflows, database migrations, configuration hygiene.

For each claim:
- "status": "grounded" (if the mechanism is directly proven by the signals/text) OR "needs-drill" (if the claim would be 10x stronger if the student provides one concrete detail like what was cached, load volume tested, or why a schema decision was made).
- "evidence": array of concrete signals supporting it (e.g., ["ioredis dependency", "Docker presence"]).

FOR EVERY "needs-drill" CLAIM (and at most 3 questions total across all claims):
- Formulate ONE specific Truth Drill question identifying a real architectural trade-off.
- MUST provide exactly 4 options:
  - 3 concrete, educational implementation trade-offs prefixed with [A], [B], [C] (e.g. "[A] Cache-aside: Read cache, fallback to Postgres on miss", "[B] Write-through: Synchronously updated cache on write", "[C] Basic session store: Stored auth tokens only"). Explain the mechanism clearly so students who learned from tutorials can recognize what they built.
  - 1 boilerplate discard option: "[D] Template boilerplate / Did not implement directly"

JUNIOR SCOPE CALIBRATION & HARD RULES:
1. NEVER invent any percentage, latency, throughput, scale, or user count.
2. SCOPE CALIBRATION: Strictly PROHIBIT enterprise-tier buzzwords ("distributed", "fault-tolerant", "high-availability", "microservices", "consensus", "CQRS") UNLESS the repository explicitly contains distributed infrastructure dependencies (e.g., Kafka, RabbitMQ, multi-container Docker compose). Calibrate to the authentic engineering scope of a junior developer.
3. NEVER use forbidden fluff: "spearheaded", "leveraged", "utilized", "participated in", "responsible for".
4. For student repositories that are forks/templates, option [D] allows discarding unworked boilerplate before bullets are generated.
5. Return ONLY a valid JSON object matching the schema below. No Markdown code fences, no extra conversational text.

JSON Schema:
{
  "claims": [
    {
      "id": "c1",
      "category": "systems" | "api" | "reliability",
      "text": "Configured Redis caching layer for session storage to eliminate redundant database lookups",
      "evidence": ["ioredis"],
      "status": "grounded" | "needs-drill"
    }
  ],
  "questions": [
    {
      "claimId": "c1",
      "question": "Which caching pattern was implemented in this project?",
      "options": [
        "[A] Cache-aside: Read from cache, fallback to PostgreSQL on miss",
        "[B] Write-through: Updated cache synchronously on database mutation",
        "[C] Ephemeral session store: Stored auth tokens and rate-limit counters only",
        "[D] Template boilerplate / Did not implement directly"
      ]
    }
  ]
}`;
}

/**
 * Stage 2 prompt builder: Synthesizes final Google X-Y-Z resume bullets and Interview Defense Cards.
 */
export function buildStage2Prompt(
  signals: SignalSet,
  claims: Claim[],
  drillAnswers: Record<string, string>,
): string {
  // Purge claims that were tagged as template boilerplate / not implemented by candidate
  const activeClaims = claims.filter((c) => {
    if (c.purged) return false;
    const answer = drillAnswers[c.id] || "";
    if (
      answer.includes("[D]") ||
      answer.toLowerCase().includes("template boilerplate") ||
      answer.toLowerCase().includes("did not implement")
    ) {
      return false;
    }
    return true;
  });

  const mergedContext = activeClaims.map((c) => ({
    id: c.id,
    category: c.category,
    mechanism: c.text,
    evidence: c.evidence,
    drillAnswer: drillAnswers[c.id] || "No drill answer provided",
  }));

  return `You are a principal engineer synthesizing defensible resume bullets in Google's X-Y-Z format:
"Accomplished [X] as measured by [Y] by doing [Z]"
Produce one bullet per category: "systems", "api", "reliability" for the verified active claims.

Context from deterministic analysis and user Truth Drill:
${JSON.stringify(mergedContext, null, 2)}

Original Raw Source Context:
"""
${signals.rawSource.slice(0, 3500)}
"""

ANTI-FABRICATION GUARANTEE & JUNIOR SCOPE CALIBRATION:
1. ABSOLUTE METRIC PROOF: A numeric metric (percentages %, ms, latencies, requests/sec, rows, multiplier Nx, millions) may appear ONLY IF it is present verbatim in the source text or in the drill answers above.
2. LOCAL VERIFIABLE PROXIES FOR GOOGLE X-Y-Z [Y]:
   When no production scale metric exists (e.g., student project has 0 active users or unmeasured throughput), DO NOT leave [Y] blank or amputated. Instead, pivot [Y] to a verifiable local engineering quality proxy:
   - Test suites: "as measured by passing 100% of unit assertions across critical edge cases"
   - Type/schema contracts: "as measured by strict TypeScript compiler zero-type-error enforcement and Prisma schema validation"
   - Data integrity: "as measured by zero orphaned records via foreign key cascading constraints"
   - Failure resilience: "as measured by graceful recovery across 3 network retry and timeout scenarios"
   If even a local proxy cannot be grounded, write the clean mechanism and append "metric omitted — not measured" in the "flags" array.
3. ENTERPRISE SCOPE INFLATION BAN: Do NOT inflate simple implementations into enterprise buzzwords ("distributed", "fault-tolerant", "high-availability", "microservices") unless supported by explicit multi-service dependencies.
4. BANNED FLUFF WORDS: Never use "spearheaded", "leveraged", "utilized", "participated in", "responsible for".
5. BOILERPLATE PURGE: Claims discarded as boilerplate or template skeleton MUST NOT produce a bullet. Focus only on mechanisms authoritatively built.
6. For each bullet, create an Interview Defense Card:
   - "question": The sharpest technical interview question a skeptical senior interviewer would ask about this exact claim (e.g. "Why choose cache-aside over write-through?").
   - "script": A 1-2 sentence truthful response the candidate can speak verbatim, rooted in the trade-offs and facts they verified.
   - "codeProof": Precise file path and line or symbol reference based on the verified source implementation (e.g. "src/server.ts:L24" or "prisma/schema.prisma:model User" or "src/services/cache.ts").
   - "tradeOffRationale": 1-sentence technical explanation of why this architectural trade-off was chosen over alternatives (e.g. "Chose cache-aside over write-through to minimize write overhead and prevent cold record caching").

Return ONLY a JSON array of Bullet objects. No markdown code fences, no prose.

JSON Schema:
[
  {
    "category": "systems" | "api" | "reliability",
    "text": "Engineered Redis session caching layer, eliminating redundant PostgreSQL queries for authenticated endpoints by enforcing sliding key TTL invalidation",
    "grounding": ["ioredis dependency", "drill answer: session tokens"],
    "defense": {
      "question": "How did you handle cache invalidation when a user logged out or changed passwords?",
      "script": "We deleted the token key directly from Redis on logout and relied on a 24-hour TTL with refresh tokens for expiry.",
      "codeProof": "src/services/cache.ts:L18",
      "tradeOffRationale": "Chose cache-aside with TTL over write-through to keep database writes unblocked and bound cache memory to active sessions."
    },
    "flags": ["metric omitted — not measured"]
  }
]`;
}
