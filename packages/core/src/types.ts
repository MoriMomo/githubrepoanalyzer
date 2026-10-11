export type BulletCategory = "systems" | "api" | "reliability";

export interface SignalSet {
  stack: {
    language: string | null;
    runtime: string | null;
    frameworks: string[];
    databases: string[];
    caches: string[];
    externalApis: string[];
  };
  presence: {
    hasDockerfile: boolean;
    hasCI: boolean;
    hasTests: boolean;
    hasMigrations: boolean;
    hasEnvExample: boolean;
  };
  declaredFeatures: string[];
  rawSource: string;
}

export interface Claim {
  id: string;
  category: BulletCategory;
  text: string;
  evidence: string[];
  status: "grounded" | "needs-drill";
  drillQuestion?: string;
  drillAnswer?: string;
  purged?: boolean;
}

export interface TruthDrillQuestion {
  claimId: string;
  question: string;
  options?: string[];
}

export interface BulletDefense {
  question: string;
  script: string;
  codeProof?: string;
  tradeOffRationale?: string;
}

export interface Bullet {
  category: BulletCategory;
  text: string;
  grounding: string[];
  defense: BulletDefense;
  flags: string[];
}

export type SessionPhase = "input" | "analysis" | "drill" | "output";

export interface ProjectSession {
  id: string;
  createdAt: number;
  updatedAt?: number;
  version?: number;
  sourceType: "paste" | "github";
  sourceRef: string;
  signals: SignalSet;
  claims: Claim[];
  drillQuestions?: TruthDrillQuestion[];
  drillAnswers?: Record<string, string>;
  bullets: Bullet[];
  phase: SessionPhase;
  modelUsed?: string;
}
