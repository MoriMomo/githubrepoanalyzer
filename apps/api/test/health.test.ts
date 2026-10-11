import { describe, it, expect } from "vitest";
import { app } from "../src/app.js";

describe("API Health & Routing (apps/api/test/health.test.ts)", () => {
  it("GET / returns service information", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.service).toBe("Proof Engine API");
    expect(data.version).toBe("1.0.0");
  });

  it("GET /healthz returns status ok and database indicator", async () => {
    const res = await app.request("/healthz");
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.status).toBe("ok");
    expect(typeof data.uptime).toBe("number");
    expect(["connected", "disconnected"]).toContain(data.db);
    expect(typeof data.timestamp).toBe("string");
  });

  it("GET /api/v1/projects lists initial projects", async () => {
    const res = await app.request("/api/v1/projects");
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.total).toBe(0);
  });

  it("PUT /api/v1/projects/:id enforces server-side anti-fabrication grounding pass", async () => {
    const payload = {
      session: {
        id: "11111111-2222-3333-4444-555555555555",
        createdAt: Date.now(),
        sourceType: "paste",
        sourceRef: "Pasted Project",
        signals: {
          stack: {
            language: "TypeScript",
            runtime: "Node",
            frameworks: ["Express"],
            databases: ["PostgreSQL"],
            caches: ["Redis"],
            externalApis: [],
          },
          presence: {
            hasDockerfile: true,
            hasCI: true,
            hasTests: true,
            hasMigrations: true,
            hasEnvExample: true,
          },
          declaredFeatures: ["Caching"],
          rawSource: "Tech stack: Express, Redis, PostgreSQL with Docker and CI.",
        },
        claims: [
          {
            id: "c1",
            category: "systems",
            text: "Engineered Redis caching layer",
            evidence: ["Redis"],
            status: "grounded",
          },
        ],
        bullets: [
          {
            category: "systems",
            // Deliberately include ungrounded number "40%"
            text: "Engineered Redis session caching by 40% to reduce DB load",
            grounding: ["Redis"],
            defense: {
              question: "How did you measure 40%?",
              script: "We tested it locally.",
            },
            flags: [],
          },
        ],
        phase: "output",
      },
    };

    const res = await app.request("/api/v1/projects/11111111-2222-3333-4444-555555555555", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    // Server must strip the ungrounded 40% and attach flag
    const savedBullet = data.session.bullets[0];
    expect(savedBullet.text).not.toContain("40%");
    expect(savedBullet.flags.some((f: string) => f.includes("ungrounded"))).toBe(true);
  });
});
