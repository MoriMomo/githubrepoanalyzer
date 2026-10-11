import { describe, it, expect } from "vitest";
import {
  enforceGrounding,
  extractMetricTokens,
  stripNumberPhrase,
  detectFluffWords,
  auditBulletRisk,
} from "~/lib/grounding";
import type { Bullet } from "~/../types";

describe("Anti-Fabrication Grounding Guarantee (lib/grounding.ts)", () => {
  it("does not strip release years or library version numbers", () => {
    const text =
      "Built with React 19 and Node 20 released in 2024 following ES2022 specifications";
    const tokens = extractMetricTokens(text);

    // Bare numbers 19, 20, 2024 or identifiers ES2022 should not be treated as metric tokens
    expect(tokens).toEqual([]);
  });

  it("identifies metric-like performance and scale tokens", () => {
    const text =
      "Reduced p99 query latency by 45ms and boosted throughput 3x to handle 10k requests/sec with 500 rows";
    const tokens = extractMetricTokens(text);

    expect(tokens).toContain("45ms");
    expect(tokens).toContain("3x");
    expect(tokens).toContain("10k requests/sec");
    expect(tokens).toContain("500 rows");
  });

  it("strips number phrases cleanly while maintaining grammatical integrity", () => {
    const text =
      "Optimized PostgreSQL query response times by 40% through composite B-tree indexing on user_id.";
    const stripped = stripNumberPhrase(text, "40%");

    expect(stripped).toBe(
      "Optimized PostgreSQL query response times through composite B-tree indexing on user_id.",
    );
  });

  it("preserves metrics that ARE legitimately grounded in the source text or drill answers", () => {
    const groundedSource =
      "Benchmark testing with autocannon confirmed the API sustained 250 requests/sec with a 15ms response window.";
    const bullets: Bullet[] = [
      {
        category: "systems",
        text: "Structured Redis caching to maintain 15ms latency under load",
        grounding: ["benchmark in readme"],
        defense: {
          question: "How did you measure 15ms?",
          script: "Autocannon load test locally.",
        },
        flags: [],
      },
    ];

    const result = enforceGrounding(bullets, groundedSource);

    expect(result[0].text).toContain("15ms");
    expect(result[0].flags).toEqual([]);
  });

  // §8 Acceptance Test (Contract Non-Negotiable)
  it("§8 ACCEPTANCE TEST: strips AI-fabricated metrics when README and drill answers contain zero numbers", () => {
    const zeroMetricsReadme = `
# AuthVault
Secure microservice implementing JWT authentication and rate limiting.
Tech stack: Express, Redis, PostgreSQL.
Configured Docker container and automated schema migrations.
`;
    const zeroMetricsDrillAnswers = {
      c1: "Stored revoked token hashes in Redis with a TTL matching token expiration.",
      c2: "Used composite indexing on user lookup queries.",
    };

    const corpus =
      zeroMetricsReadme + " " + Object.values(zeroMetricsDrillAnswers).join(" ");

    // Deliberately simulate an unruly AI response fabricating numbers ("improved performance by 40%")
    const mockedAiFabricatingBullets: Bullet[] = [
      {
        category: "systems",
        text: "Engineered Redis token revocation blacklist, improving verification latency by 40% through atomic SETNX operations.",
        grounding: ["Redis"],
        defense: {
          question: "Where did the 40% come from?",
          script: "Fabricated by LLM without grounding.",
        },
        flags: [],
      },
      {
        category: "api",
        text: "Hardened authentication endpoints by handling 5k requests/sec with zero drops.",
        grounding: ["Express"],
        defense: {
          question: "What load tool was used?",
          script: "None measured.",
        },
        flags: [],
      },
      {
        category: "reliability",
        text: "Containerized app using Docker in 2024 with zero measured downtime.",
        grounding: ["Dockerfile"],
        defense: {
          question: "How is it deployed?",
          script: "Docker container.",
        },
        flags: [],
      },
    ];

    const auditedBullets = enforceGrounding(mockedAiFabricatingBullets, corpus);

    // Assert bullet 1 had "40%" stripped and flagged
    expect(auditedBullets[0].text).not.toContain("40%");
    expect(auditedBullets[0].text).toBe(
      "Engineered Redis token revocation blacklist, improving verification latency through atomic SETNX operations.",
    );
    expect(auditedBullets[0].flags).toContain(
      "metric removed (ungrounded): 40%",
    );

    // Assert bullet 2 had "5k requests/sec" stripped and flagged
    expect(auditedBullets[1].text).not.toContain("5k requests/sec");
    expect(auditedBullets[1].flags).toContain(
      "metric removed (ungrounded): 5k requests/sec",
    );

    // Assert release year 2024 was NOT stripped from bullet 3
    expect(auditedBullets[2].text).toContain("2024");
  });

  it("detects forbidden fluff words that weaken technical credibility", () => {
    const text =
      "Spearheaded database optimization and leveraged Redis while utilized Docker containers.";
    const fluff = detectFluffWords(text);

    expect(fluff).toContain("spearheaded");
    expect(fluff).toContain("leveraged");
    expect(fluff).toContain("utilized");
  });

  it("audits bullet risk by flagging ungrounded metrics and passive buzzwords", () => {
    const candidate =
      "Spearheaded Redis caching to accelerate latency by 40% and support 10k users.";
    const emptyCorpus = "A basic project without metrics.";
    const report = auditBulletRisk(candidate, emptyCorpus);

    expect(report.riskLevel).toBe("CRITICAL");
    expect(report.fluffHits).toContain("spearheaded");
    expect(report.ungroundedHits).toContain("40%");
    expect(report.ungroundedHits).toContain("10k users");
  });
});
