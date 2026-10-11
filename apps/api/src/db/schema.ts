import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  smallint,
  bigserial,
  jsonb,
  pgEnum,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// Enums
export const bulletCategoryEnum = pgEnum("bullet_category", [
  "systems",
  "api",
  "reliability",
]);

export const sessionPhaseEnum = pgEnum("session_phase", [
  "input",
  "analysis",
  "drill",
  "output",
]);

export const sourceTypeEnum = pgEnum("source_type", ["paste", "github"]);

// 1. Users Table
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    name: text("name"),
    image: text("image"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
  ]
);

// 2. Accounts Table (OAuth & Credentials)
export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    provider: text("provider").notNull(), // 'github' | 'credential' | 'puter'
    providerAccountId: text("provider_account_id").notNull(),
    accessTokenEnc: text("access_token_enc"),
    passwordHash: text("password_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("accounts_provider_account_idx").on(
      table.provider,
      table.providerAccountId
    ),
  ]
);

// 3. Auth Sessions Table
export const authSessions = pgTable(
  "auth_sessions",
  {
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("auth_sessions_user_idx").on(table.userId),
  ]
);

// 4. Projects Table
export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey(), // Client-generated UUID preserved
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    sourceType: sourceTypeEnum("source_type").notNull().default("paste"),
    sourceRef: text("source_ref").notNull().default("Pasted Source"),
    phase: sessionPhaseEnum("phase").notNull().default("input"),
    modelUsed: text("model_used"),
    signals: jsonb("signals").notNull(),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("projects_user_updated_idx").on(table.userId, table.updatedAt),
  ]
);

// 5. Project Sources Table (Separated for size & deduplication)
export const projectSources = pgTable("project_sources", {
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .primaryKey(),
  rawSource: text("raw_source").notNull(),
  contentHash: text("content_hash").notNull(),
});

// 6. Claims Table
export const claims = pgTable(
  "claims",
  {
    projectId: uuid("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    claimKey: text("claim_key").notNull(),
    category: bulletCategoryEnum("category").notNull(),
    text: text("text").notNull(),
    evidence: text("evidence").array().notNull().default([]),
    status: text("status").notNull(), // 'grounded' | 'needs-drill'
    purged: boolean("purged").notNull().default(false),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.claimKey] }),
  ]
);

// 7. Drill Questions Table
export const drillQuestions = pgTable(
  "drill_questions",
  {
    projectId: uuid("project_id").notNull(),
    claimKey: text("claim_key").notNull(),
    question: text("question").notNull(),
    options: text("options").array(),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.claimKey] }),
  ]
);

// 8. Drill Answers Table
export const drillAnswers = pgTable(
  "drill_answers",
  {
    projectId: uuid("project_id").notNull(),
    claimKey: text("claim_key").notNull(),
    answer: text("answer").notNull(),
    answeredAt: timestamp("answered_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.claimKey] }),
  ]
);

// 9. Bullets Table
export const bullets = pgTable(
  "bullets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    position: smallint("position").notNull(), // 0, 1, 2
    category: bulletCategoryEnum("category").notNull(),
    text: text("text").notNull(),
    grounding: text("grounding").array().notNull().default([]),
    defense: jsonb("defense").notNull(),
    flags: text("flags").array().notNull().default([]),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("bullets_project_position_idx").on(table.projectId, table.position),
  ]
);

// 10. Bullet Revisions Table (User edits & audit history)
export const bulletRevisions = pgTable("bullet_revisions", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  bulletId: uuid("bullet_id")
    .references(() => bullets.id, { onDelete: "cascade" })
    .notNull(),
  text: text("text").notNull(),
  flags: text("flags").array().notNull().default([]),
  source: text("source").notNull(), // 'ai' | 'user'
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 11. AI Runs Table (Observability & anti-fabrication metrics)
export const aiRuns = pgTable("ai_runs", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  stage: text("stage").notNull(), // 'stage1' | 'stage2' | 'mock'
  model: text("model").notNull(),
  status: text("status").notNull(), // 'ok' | 'fallback' | 'error'
  latencyMs: integer("latency_ms"),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  ungroundedStripped: integer("ungrounded_stripped").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 12. Mock Interview Attempts Table
export const mockInterviewAttempts = pgTable("mock_interview_attempts", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  bulletId: uuid("bullet_id")
    .references(() => bullets.id, { onDelete: "cascade" })
    .notNull(),
  response: text("response").notNull(),
  verdict: text("verdict").notNull(), // 'DEFENSIBLE' | 'NEEDS REFINEMENT' | 'FABRICATION RISK'
  score: smallint("score"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
