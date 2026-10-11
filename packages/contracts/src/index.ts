import { z } from "zod";

export const BulletCategorySchema = z.enum(["systems", "api", "reliability"]);
export type BulletCategory = z.infer<typeof BulletCategorySchema>;

export const StackSchema = z.object({
  language: z.string().nullable(),
  runtime: z.string().nullable(),
  frameworks: z.array(z.string()),
  databases: z.array(z.string()),
  caches: z.array(z.string()),
  externalApis: z.array(z.string()),
});
export type Stack = z.infer<typeof StackSchema>;

export const PresenceSchema = z.object({
  hasDockerfile: z.boolean(),
  hasCI: z.boolean(),
  hasTests: z.boolean(),
  hasMigrations: z.boolean(),
  hasEnvExample: z.boolean(),
});
export type Presence = z.infer<typeof PresenceSchema>;

export const SignalSetSchema = z.object({
  stack: StackSchema,
  presence: PresenceSchema,
  declaredFeatures: z.array(z.string()),
  rawSource: z.string(),
});
export type SignalSet = z.infer<typeof SignalSetSchema>;

export const ClaimStatusSchema = z.enum(["grounded", "needs-drill"]);
export type ClaimStatus = z.infer<typeof ClaimStatusSchema>;

export const ClaimSchema = z.object({
  id: z.string(),
  category: BulletCategorySchema,
  text: z.string(),
  evidence: z.array(z.string()),
  status: ClaimStatusSchema,
  drillQuestion: z.string().optional(),
  drillAnswer: z.string().optional(),
  purged: z.boolean().optional(),
});
export type Claim = z.infer<typeof ClaimSchema>;

export const TruthDrillQuestionSchema = z.object({
  claimId: z.string(),
  question: z.string(),
  options: z.array(z.string()).optional(),
});
export type TruthDrillQuestion = z.infer<typeof TruthDrillQuestionSchema>;

export const BulletDefenseSchema = z.object({
  question: z.string(),
  script: z.string(),
  codeProof: z.string().optional(),
  tradeOffRationale: z.string().optional(),
});
export type BulletDefense = z.infer<typeof BulletDefenseSchema>;

export const BulletSchema = z.object({
  category: BulletCategorySchema,
  text: z.string(),
  grounding: z.array(z.string()),
  defense: BulletDefenseSchema,
  flags: z.array(z.string()),
});
export type Bullet = z.infer<typeof BulletSchema>;

export const SessionPhaseSchema = z.enum(["input", "analysis", "drill", "output"]);
export type SessionPhase = z.infer<typeof SessionPhaseSchema>;

export const SourceTypeSchema = z.enum(["paste", "github"]);
export type SourceType = z.infer<typeof SourceTypeSchema>;

export const ProjectSessionSchema = z.object({
  id: z.string(),
  createdAt: z.number(),
  updatedAt: z.number().optional(),
  version: z.number().optional(),
  sourceType: SourceTypeSchema,
  sourceRef: z.string(),
  signals: SignalSetSchema,
  claims: z.array(ClaimSchema),
  drillQuestions: z.array(TruthDrillQuestionSchema).optional(),
  drillAnswers: z.record(z.string()).optional(),
  bullets: z.array(BulletSchema),
  phase: SessionPhaseSchema,
  modelUsed: z.string().optional(),
});
export type ProjectSession = z.infer<typeof ProjectSessionSchema>;

// API Contracts
export const UpsertProjectInputSchema = z.object({
  session: ProjectSessionSchema,
  expectedVersion: z.number().optional(),
});
export type UpsertProjectInput = z.infer<typeof UpsertProjectInputSchema>;

export const ProjectSummarySchema = z.object({
  id: z.string(),
  sourceType: SourceTypeSchema,
  sourceRef: z.string(),
  phase: SessionPhaseSchema,
  bulletCount: z.number(),
  language: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
  version: z.number(),
});
export type ProjectSummary = z.infer<typeof ProjectSummarySchema>;

export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  uptime: z.number(),
  db: z.enum(["connected", "disconnected"]),
  timestamp: z.string(),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
