import { describe, it, expect } from "vitest";
import { auditBulletRisk, detectFluffWords, extractMetricTokens } from "~/lib/grounding";

describe("Interactive Demo Scenario Integrity & Risk Audit", () => {
  const scenarios = [
    {
      name: "Redis Worker (Go)",
      genericBullet:
        "Engineered high-performance microservices architecture using Redis and Kafka, improving query efficiency by 40% across distributed workloads.",
      expectedMetrics: ["by 40%"],
    },
    {
      name: "E-Commerce Webhooks (Node)",
      genericBullet:
        "Spearheaded database optimization and scalable REST APIs with Redis caching, boosting throughput by 300% and reducing database load.",
      expectedMetrics: ["by 300%"],
    },
    {
      name: "Event Bus & CDC (Postgres)",
      genericBullet:
        "Leveraged cutting-edge microservices architecture and event streaming to streamline cross-functional cloud workflows across production environments.",
      expectedFluff: "leveraged",
    },
  ];

  it("detects unmeasured metric tokens in Redis and Webhook demo scenarios", () => {
    const redisTokens = extractMetricTokens(scenarios[0].genericBullet);
    expect(redisTokens.some((t) => t.includes("40%"))).toBe(true);

    const webhookTokens = extractMetricTokens(scenarios[1].genericBullet);
    expect(webhookTokens.some((t) => t.includes("300%"))).toBe(true);
  });

  it("detects banned fluff words in CDC Event Bus scenario", () => {
    const fluff = detectFluffWords(scenarios[2].genericBullet);
    expect(fluff).toContain(scenarios[2].expectedFluff);
  });

  it("accurately audits risk level on ungrounded AI bullets against an empty corpus", () => {
    for (const s of scenarios) {
      const audit = auditBulletRisk(s.genericBullet, "");
      // All ungrounded demo bullets should flag risk (either ungrounded metrics or fluff)
      expect(audit.fluffHits.length + audit.ungroundedHits.length).toBeGreaterThan(0);
      expect(audit.riskLevel).not.toBe("CLEAN");
    }
  });
});
