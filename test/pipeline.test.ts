import { describe, it, expect } from "vitest";
import { parseSource } from "~/lib/parse";
import { enforceGrounding } from "~/lib/grounding";
import type { Claim, Bullet } from "~/types";

describe("End-to-End Pipeline Integration (test/pipeline.test.ts)", () => {
  it("executes the full pipeline: parse -> drill merge -> synthesis -> grounding audit", () => {
    // 1. Raw pasted project with package.json
    const rawReadme = `# CloudCache Worker
A high-throughput queue processor.

\`\`\`json
{
  "name": "cloudcache-worker",
  "dependencies": {
    "ioredis": "^5.3.0",
    "pg": "^8.11.0",
    "express": "^4.19.0"
  },
  "devDependencies": {
    "vitest": "^1.3.0"
  }
}
\`\`\`

## Infrastructure
Includes Dockerfile and .github/workflows/deploy.yml.
`;

    // Step 1: Deterministic Parse
    const signals = parseSource(rawReadme);
    expect(signals.stack.caches).toContain("Redis");
    expect(signals.stack.databases).toContain("PostgreSQL");
    expect(signals.stack.frameworks).toContain("Express");
    expect(signals.presence.hasDockerfile).toBe(true);
    expect(signals.presence.hasCI).toBe(true);
    expect(signals.presence.hasTests).toBe(true);

    // Step 2: Simulated Stage 1 structuring produces candidate claims
    const candidateClaims: Claim[] = [
      {
        id: "c1",
        category: "systems",
        text: "Designed in-memory caching layer with Redis to bypass database queries",
        evidence: ["ioredis"],
        status: "needs-drill",
        drillQuestion: "What specific data did Redis hold?",
      },
      {
        id: "c2",
        category: "api",
        text: "Implemented RESTful API endpoints for job status polling",
        evidence: ["express"],
        status: "grounded",
      },
      {
        id: "c3",
        category: "reliability",
        text: "Packaged service into immutable container with Docker and CI pipelines",
        evidence: ["Dockerfile", ".github/workflows"],
        status: "grounded",
      },
    ];
    expect(candidateClaims.length).toBe(3);

    // Step 3: Truth Drill answers submitted by user
    const drillAnswers: Record<string, string> = {
      c1: "Stored short-lived auth tokens with a 15-minute sliding TTL.",
    };

    // Step 4: Simulated Stage 2 synthesis (deliberately injects an ungrounded 35% metric)
    const simulatedAiBullets: Bullet[] = [
      {
        category: "systems",
        text: "Engineered Redis token cache with 15-minute sliding TTL, accelerating query turnaround by 35% through connection pooling.",
        grounding: ["ioredis", "drill answer: 15-minute sliding TTL"],
        defense: {
          question: "How did you manage connection pooling in ioredis?",
          script: "Configured a single shared connection instance with automated reconnect handlers.",
        },
        flags: [],
      },
      {
        category: "api",
        text: "Developed Express HTTP endpoints with structured error handling middleware for job dispatch.",
        grounding: ["express"],
        defense: {
          question: "How did you handle uncaught exceptions?",
          script: "Utilized centralized Express error middleware returning standardized JSON error envelopes.",
        },
        flags: ["metric omitted — not measured"],
      },
      {
        category: "reliability",
        text: "Containerized application using multi-stage Docker build verified by automated GitHub Actions CI pipeline.",
        grounding: ["Dockerfile", ".github/workflows"],
        defense: {
          question: "Why multi-stage build?",
          script: "To keep the final runtime container slim without devDependencies or build tooling.",
        },
        flags: ["metric omitted — not measured"],
      },
    ];

    // Step 5: Deterministic Grounding Pass
    const groundedCorpus =
      signals.rawSource + " " + Object.values(drillAnswers).join(" ");
    const auditedBullets = enforceGrounding(simulatedAiBullets, groundedCorpus);

    // Verification of Anti-Fabrication Guarantee:
    // Bullet 1 had "35%" stripped and flagged
    expect(auditedBullets[0].text).not.toContain("35%");
    expect(auditedBullets[0].flags).toContain("metric removed (ungrounded): 35%");

    // Grounded detail from drill ("15-minute") was preserved
    expect(auditedBullets[0].text).toContain("15-minute");

    // All categories present
    expect(auditedBullets.map((b) => b.category)).toEqual([
      "systems",
      "api",
      "reliability",
    ]);

    // All defense scripts preserved
    expect(auditedBullets[0].defense.script).toBeTruthy();
    expect(auditedBullets[1].defense.script).toBeTruthy();
    expect(auditedBullets[2].defense.script).toBeTruthy();
  });

  it("generates 4 scaffolded trade-off options with boilerplate escape hatch", async () => {
    const { generateSimulationClaims, generateSimulationBullets } = await import("~/lib/fallback");
    const { parseSource } = await import("~/lib/parse");

    const signals = parseSource(`{
      "dependencies": { "ioredis": "^5.0.0", "express": "^4.18.0" }
    }`);

    const { questions } = generateSimulationClaims(signals);
    expect(questions.length).toBeGreaterThan(0);
    const q1 = questions[0];
    expect(q1.options).toBeDefined();
    expect(q1.options?.length).toBe(4);
    // Verifies 3 concrete options + 1 boilerplate escape hatch
    expect(q1.options?.[0]).toContain("[A]");
    expect(q1.options?.[1]).toContain("[B]");
    expect(q1.options?.[2]).toContain("[C]");
    expect(q1.options?.[3]).toContain("[D] Template boilerplate");

    // When user selects boilerplate option [D], the candidate claim is purged
    const purgedBullets = generateSimulationBullets(signals, [], {
      c1: "[D] Template boilerplate / Did not implement directly",
    });
    // Systems bullet was skipped because it was template boilerplate
    expect(purgedBullets.find((b) => b.category === "systems")).toBeUndefined();
    // Non-boilerplate bullets (api, reliability) remain
    expect(purgedBullets.find((b) => b.category === "api")).toBeDefined();
  });

  it("attaches Code Proof Lineage Anchors and Trade-off Rationales to defense cards", async () => {
    const { generateSimulationBullets } = await import("~/lib/fallback");
    const { parseSource } = await import("~/lib/parse");

    const signals = parseSource(`
      Dockerfile
      package.json with express
    `);

    const bullets = generateSimulationBullets(signals, [], {
      c1: "[A] Cache-aside: Read from cache, fallback to Postgres on miss",
    });

    for (const b of bullets) {
      expect(b.defense.codeProof).toBeDefined();
      expect(b.defense.codeProof?.length).toBeGreaterThan(0);
      expect(b.defense.tradeOffRationale).toBeDefined();
      expect(b.defense.tradeOffRationale?.length).toBeGreaterThan(0);
    }
  });

  it("verifies LocalStorage fallback in SessionStorageAdapter for anonymous guests", async () => {
    const store: Record<string, string> = {};
    const mockStorage = {
      getItem: (k: string) => store[k] || null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      key: (i: number) => Object.keys(store)[i] || null,
      get length() {
        return Object.keys(store).length;
      },
    };
    (globalThis as unknown as { localStorage: unknown }).localStorage = mockStorage;

    const { SessionStorageAdapter } = await import("~/lib/storage");

    const mockKV = {
      get: async () => null,
      set: async () => true,
      list: async () => [],
      delete: async () => true,
    };

    const dummySession: import("~/types").ProjectSession = {
      id: "guest-test-123",
      createdAt: Date.now(),
      sourceType: "paste",
      sourceRef: "Guest Workspace",
      signals: {
        stack: { language: "TypeScript", runtime: "Node", frameworks: [], databases: [], caches: [], externalApis: [] },
        presence: { hasDockerfile: false, hasCI: false, hasTests: false, hasMigrations: false, hasEnvExample: false },
        declaredFeatures: [],
        rawSource: "test",
      },
      claims: [],
      bullets: [],
      phase: "input",
    };

    // Anonymous guest (isAuthenticated = false)
    await SessionStorageAdapter.saveSession(dummySession, mockKV, false);

    const loaded = await SessionStorageAdapter.getSession("guest-test-123", mockKV, false);
    expect(loaded).toBeDefined();
    expect(loaded?.id).toBe("guest-test-123");
    expect(loaded?.sourceRef).toBe("Guest Workspace");

    const sessions = await SessionStorageAdapter.listSessions(mockKV, false);
    expect(sessions.some((s) => s.id === "guest-test-123")).toBe(true);

    await SessionStorageAdapter.deleteSession("guest-test-123", mockKV, false);
    const afterDelete = await SessionStorageAdapter.getSession("guest-test-123", mockKV, false);
    expect(afterDelete).toBeNull();
  });
});
