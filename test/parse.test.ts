import { describe, it, expect } from "vitest";
import { parseSource } from "~/lib/parse";

describe("Deterministic Parser (lib/parse.ts)", () => {
  it("extracts stack and presence flags from package.json in fenced code block", () => {
    const readme = `
# StoreAPI
A high-throughput catalog service.

\`\`\`json
{
  "name": "store-api",
  "dependencies": {
    "express": "^4.19.2",
    "ioredis": "^5.3.2",
    "pg": "^8.11.3",
    "prisma": "^5.10.0"
  },
  "devDependencies": {
    "typescript": "^5.4.2",
    "vitest": "^1.3.1"
  }
}
\`\`\`

## Architecture
Runs in a Dockerfile with container orchestration.
CI configured via .github/workflows/deploy.yml.
Includes migrations in prisma/migrations and .env.example.

## Features
- Distributed rate limiting via Redis token bucket
- Automated schema migrations on container startup
- Full CRUD endpoints for inventory management
`;

    const signals = parseSource(readme);

    expect(signals.stack.language).toBe("TypeScript");
    expect(signals.stack.runtime).toBe("Node");
    expect(signals.stack.frameworks).toContain("Express");
    expect(signals.stack.caches).toContain("Redis");
    expect(signals.stack.databases).toContain("PostgreSQL");
    expect(signals.stack.databases).toContain("Prisma (ORM)");

    expect(signals.presence.hasDockerfile).toBe(true);
    expect(signals.presence.hasCI).toBe(true);
    expect(signals.presence.hasTests).toBe(true);
    expect(signals.presence.hasMigrations).toBe(true);
    expect(signals.presence.hasEnvExample).toBe(true);

    expect(signals.declaredFeatures.length).toBeGreaterThanOrEqual(2);
    expect(signals.declaredFeatures[0]).toContain("Distributed rate limiting");
    expect(signals.rawSource).toBe(readme);
  });

  it("extracts signals from prose when no manifest is included", () => {
    const readme = `
# DataPipeline
A lightweight microservice built in Go with PostgreSQL for analytical queries.
Deployed with docker-compose. Has integration tests and unit tests.
`;

    const signals = parseSource(readme);

    expect(signals.stack.language).toBe("Go");
    expect(signals.stack.databases).toContain("PostgreSQL");
    expect(signals.presence.hasDockerfile).toBe(true); // matches docker-compose
    expect(signals.presence.hasTests).toBe(true);
  });

  it("handles thin / empty README by returning an empty but valid SignalSet", () => {
    const signals = parseSource("");

    expect(signals.stack.language).toBeNull();
    expect(signals.stack.frameworks).toEqual([]);
    expect(signals.stack.databases).toEqual([]);
    expect(signals.stack.caches).toEqual([]);
    expect(signals.presence.hasDockerfile).toBe(false);
    expect(signals.presence.hasCI).toBe(false);
    expect(signals.presence.hasTests).toBe(false);
    expect(signals.declaredFeatures).toEqual([]);
    expect(signals.rawSource).toBe("");
  });
});
