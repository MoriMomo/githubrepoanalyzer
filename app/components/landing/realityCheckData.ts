export interface DemoScenario {
  id: string;
  name: string;
  tag: string;
  codeFile: string;
  codeAnchor: string;
  genericBullet: string;
  genericHighlightWords: string[];
  genericRiskScore: number;
  proofBullet: string;
}

export interface DemoStage {
  index: number;
  label: string;
  badge: string;
  badgeVariant: "flag" | "warn" | "accent" | "ok";
  subtitle: string;
}

export const DEMO_STAGES: DemoStage[] = [
  {
    index: 0,
    label: "1. AI Fluff Claim",
    badge: "Generic AI Fluff",
    badgeVariant: "flag",
    subtitle: "Typical ChatGPT generation with unverified numbers",
  },
  {
    index: 1,
    label: "2. Interviewer Grill",
    badge: "Senior Skepticism",
    badgeVariant: "warn",
    subtitle: "Senior interviewer challenges the unmeasured claim",
  },
  {
    index: 2,
    label: "3. AST Code Anchor",
    badge: "Proof Grounding Net",
    badgeVariant: "accent",
    subtitle: "Verbatim code AST parsed; fabricated metrics stripped",
  },
  {
    index: 3,
    label: "4. Defensible Proof",
    badge: "Verified Pass",
    badgeVariant: "ok",
    subtitle: "Grounded resume bullet synthesized with real proxies",
  },
];

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "redis-worker",
    name: "Redis Worker (Go)",
    tag: "Distributed Concurrency",
    codeFile: "pkg/worker/pool.go",
    codeAnchor: "pkg/worker/pool.go:L42-L78",
    genericBullet:
      "Engineered high-performance microservices architecture using Redis and Kafka, improving query efficiency by 40% across distributed workloads.",
    genericHighlightWords: ["high-performance", "improving query efficiency by 40%"],
    genericRiskScore: 92,
    proofBullet:
      "Architected asynchronous job queue in Go using Redis streams and worker pools, handling 1,500 jobs/sec with sub-10ms dispatch latency verified via benchmark suite.",
  },
  {
    id: "api-service",
    name: "E-Commerce Webhooks (Node)",
    tag: "Database Locking & DX",
    codeFile: "src/webhooks/ledger.ts",
    codeAnchor: "src/webhooks/ledger.ts:L18-L55",
    genericBullet:
      "Spearheaded database optimization and scalable REST APIs with Redis caching, boosting throughput by 300% and reducing database load.",
    genericHighlightWords: ["Spearheaded", "boosting throughput by 300%"],
    genericRiskScore: 88,
    proofBullet:
      "Engineered idempotent webhook ingestion pipeline with Postgres transactions and Redis atomic distributed locks, guaranteeing exactly-once charge execution.",
  },
  {
    id: "outbox-broker",
    name: "Event Bus & CDC (Postgres)",
    tag: "Data Consistency",
    codeFile: "internal/outbox/relay.go",
    codeAnchor: "internal/outbox/relay.go:L28-L64",
    genericBullet:
      "Leveraged cutting-edge microservices architecture and event streaming to streamline cross-functional cloud workflows across production environments.",
    genericHighlightWords: ["Leveraged", "cutting-edge", "streamline cross-functional cloud workflows"],
    genericRiskScore: 84,
    proofBullet:
      "Implemented transactional outbox pattern using Postgres CDC and atomic table mutations, guaranteeing zero message loss and at-least-once event delivery.",
  },
];
