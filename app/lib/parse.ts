import type { SignalSet } from "~/../types";

const DEP_TO_CACHE: Record<string, string> = {
  ioredis: "Redis",
  redis: "Redis",
  memcached: "Memcached",
};

const DEP_TO_DB: Record<string, string> = {
  pg: "PostgreSQL",
  postgres: "PostgreSQL",
  prisma: "Prisma (ORM)",
  "@prisma/client": "Prisma (ORM)",
  mysql: "MySQL",
  mysql2: "MySQL",
  mongodb: "MongoDB",
  mongoose: "MongoDB",
  sqlite3: "SQLite",
  "better-sqlite3": "SQLite",
  drizzle: "Drizzle (ORM)",
  "drizzle-orm": "Drizzle (ORM)",
  typeorm: "TypeORM",
};

const DEP_TO_FRAMEWORK: Record<string, string> = {
  express: "Express",
  fastify: "Fastify",
  next: "Next.js",
  react: "React",
  vue: "Vue",
  svelte: "Svelte",
  hono: "Hono",
  koa: "Koa",
  nestjs: "NestJS",
  "@nestjs/core": "NestJS",
  gatsby: "Gatsby",
  remix: "Remix",
  "react-router": "React Router",
};

const DEP_TO_API: Record<string, string> = {
  stripe: "Stripe",
  "@aws-sdk/client-s3": "AWS S3",
  "aws-sdk": "AWS SDK",
  resend: "Resend",
  "@sendgrid/mail": "SendGrid",
  twilio: "Twilio",
  openai: "OpenAI API",
  "@google/genai": "Gemini API",
};

const TEST_PACKAGES = [
  "jest",
  "vitest",
  "mocha",
  "cypress",
  "playwright",
  "@testing-library/react",
  "supertest",
  "ava",
  "jasmine",
];

const MIGRATION_PACKAGES = [
  "knex",
  "prisma",
  "drizzle-kit",
  "typeorm",
  "sequelize",
  "flyway",
  "alembic",
];

/**
 * Extracts JSON blocks from markdown that contain dependency manifests.
 */
function extractPackageJson(rawText: string): Record<string, unknown> | null {
  const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/gi;
  let match: RegExpExecArray | null;

  while ((match = jsonBlockRegex.exec(rawText)) !== null) {
    const blockContent = match[1].trim();
    if (
      blockContent.includes('"dependencies"') ||
      blockContent.includes('"devDependencies"') ||
      blockContent.includes('"name"')
    ) {
      try {
        const parsed = JSON.parse(blockContent);
        if (
          parsed &&
          typeof parsed === "object" &&
          (parsed.dependencies || parsed.devDependencies)
        ) {
          return parsed as Record<string, unknown>;
        }
      } catch {
        // Keep searching other code blocks
      }
    }
  }

  // Also check if the raw text itself is directly a package.json
  const trimmed = rawText.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (
        parsed &&
        typeof parsed === "object" &&
        (parsed.dependencies || parsed.devDependencies)
      ) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      // not direct JSON
    }
  }

  return null;
}

/**
 * Scans markdown text for bullet points under feature-like headings or general bullet points.
 */
function extractDeclaredFeatures(rawText: string): string[] {
  const lines = rawText.split("\n");
  const features: string[] = [];
  let inFeatureSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check heading
    const headingMatch = line.match(/^#{1,4}\s+(.*)$/i);
    if (headingMatch) {
      const headingTitle = headingMatch[1].toLowerCase();
      if (
        headingTitle.includes("feature") ||
        headingTitle.includes("what it does") ||
        headingTitle.includes("capabilities")
      ) {
        inFeatureSection = true;
      } else {
        inFeatureSection = false;
      }
      continue;
    }

    // Bullet detection: '- ...' or '* ...'
    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      const bulletText = bulletMatch[1].trim();
      // Skip badges or raw links: e.g. [![...](...)](...) or [Text](url) only
      if (bulletText.startsWith("[![") || bulletText.startsWith("<img")) {
        continue;
      }
      if (bulletText.length > 5) {
        features.push(bulletText);
      }
    } else if (inFeatureSection && line.length > 15 && !line.startsWith("!")) {
      features.push(line);
    }
  }

  return Array.from(new Set(features)).slice(0, 12);
}

/**
 * Step 1 deterministic parser for project README / manifest text.
 * Pure function: strictly deterministic, zero network or AI dependencies.
 */
export function parseSource(rawSource: string): SignalSet {
  const cleanSource = rawSource || "";

  const frameworks = new Set<string>();
  const databases = new Set<string>();
  const caches = new Set<string>();
  const externalApis = new Set<string>();

  const hasDockerfile =
    /\bdockerfile\b/i.test(cleanSource) || /\bdocker-compose\b/i.test(cleanSource);
  const hasCI =
    /\.github\/workflows\b/i.test(cleanSource) ||
    /\bci\/cd\b/i.test(cleanSource) ||
    /\bgithub actions\b/i.test(cleanSource) ||
    /\bcircleci\b/i.test(cleanSource);
  let hasTests =
    /\b(unit tests?|integration tests?|e2e tests?|test coverage|pytest|vitest|jest)\b/i.test(
      cleanSource,
    );
  let hasMigrations =
    /\bmigrations?\b/i.test(cleanSource) ||
    /\bprisma migrate\b/i.test(cleanSource) ||
    /\bdrizzle-kit\b/i.test(cleanSource);
  const hasEnvExample =
    /\.env\.example\b/i.test(cleanSource) ||
    /\.env\.sample\b/i.test(cleanSource) ||
    /\.env\.template\b/i.test(cleanSource);

  let language: string | null = null;
  let runtime: string | null = null;

  // 1. Check for embedded package.json
  const manifest = extractPackageJson(cleanSource);
  if (manifest) {
    const allDeps: Record<string, string> = {
      ...((manifest.dependencies as Record<string, string>) || {}),
      ...((manifest.devDependencies as Record<string, string>) || {}),
    };

    runtime = "Node";

    if (allDeps["typescript"] || allDeps["@types/node"]) {
      language = "TypeScript";
    } else {
      language = "JavaScript";
    }

    for (const dep of Object.keys(allDeps)) {
      const lowerDep = dep.toLowerCase();

      if (DEP_TO_CACHE[lowerDep]) {
        caches.add(DEP_TO_CACHE[lowerDep]);
      }
      if (DEP_TO_DB[lowerDep]) {
        databases.add(DEP_TO_DB[lowerDep]);
      }
      if (DEP_TO_FRAMEWORK[lowerDep]) {
        frameworks.add(DEP_TO_FRAMEWORK[lowerDep]);
      }
      if (DEP_TO_API[lowerDep]) {
        externalApis.add(DEP_TO_API[lowerDep]);
      }
      if (TEST_PACKAGES.includes(lowerDep)) {
        hasTests = true;
      }
      if (MIGRATION_PACKAGES.includes(lowerDep)) {
        hasMigrations = true;
      }
    }
  }

  // 2. Prose stack detection fallback or enrichment
  if (!language) {
    if (/\btypescript\b/i.test(cleanSource) || /\.tsx?\b/i.test(cleanSource)) {
      language = "TypeScript";
    } else if (/\bpython\b/i.test(cleanSource) || /\.py\b/i.test(cleanSource)) {
      language = "Python";
    } else if (
      /\b(golang|go\.mod)\b/i.test(cleanSource) ||
      /\b(?:built in|written in|built with|using|service in)\s+go\b/i.test(cleanSource) ||
      /\bgo language\b/i.test(cleanSource)
    ) {
      language = "Go";
    } else if (/\brust\b/i.test(cleanSource) || /\bcargo\.toml\b/i.test(cleanSource)) {
      language = "Rust";
    } else if (/\bjavascript\b/i.test(cleanSource)) {
      language = "JavaScript";
    }
  }

  if (!runtime && language) {
    if (language === "TypeScript" || language === "JavaScript") {
      runtime = /\bbun\b/i.test(cleanSource)
        ? "Bun"
        : /\bdeno\b/i.test(cleanSource)
          ? "Deno"
          : "Node";
    } else if (language === "Python") {
      runtime = "Python 3";
    } else if (language === "Go") {
      runtime = "Go runtime";
    }
  }

  // Prose database/cache clues if not already in manifest
  if (/\b(redis|ioredis)\b/i.test(cleanSource)) caches.add("Redis");
  if (/\b(postgresql|postgres|pgvector)\b/i.test(cleanSource)) databases.add("PostgreSQL");
  if (/\b(mongodb|mongo)\b/i.test(cleanSource)) databases.add("MongoDB");
  if (/\bmysql\b/i.test(cleanSource)) databases.add("MySQL");
  if (/\bsqlite\b/i.test(cleanSource)) databases.add("SQLite");
  if (/\bprisma\b/i.test(cleanSource)) databases.add("Prisma (ORM)");

  // Prose frameworks clues
  if (/\bexpress(\.js)?\b/i.test(cleanSource)) frameworks.add("Express");
  if (/\bfastify\b/i.test(cleanSource)) frameworks.add("Fastify");
  if (/\bnext(\.js)?\b/i.test(cleanSource)) frameworks.add("Next.js");
  if (/\breact(\.js)?\b/i.test(cleanSource)) frameworks.add("React");
  if (/\bfastapi\b/i.test(cleanSource)) frameworks.add("FastAPI");
  if (/\bflask\b/i.test(cleanSource)) frameworks.add("Flask");
  if (/\bdjango\b/i.test(cleanSource)) frameworks.add("Django");

  // 3. Extract declared features
  const declaredFeatures = extractDeclaredFeatures(cleanSource);

  return {
    stack: {
      language,
      runtime,
      frameworks: Array.from(frameworks),
      databases: Array.from(databases),
      caches: Array.from(caches),
      externalApis: Array.from(externalApis),
    },
    presence: {
      hasDockerfile,
      hasCI,
      hasTests,
      hasMigrations,
      hasEnvExample,
    },
    declaredFeatures,
    rawSource: cleanSource,
  };
}
