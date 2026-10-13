import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import {
  Play,
  Pause,
  RotateCcw,
  Flame,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Check,
  Copy,
  Terminal,
  FileCode2,
  Gauge,
  Split,
  Eye,
} from "lucide-react";
import { Badge } from "./Badge";
import { Card } from "./Card";

interface DemoScenario {
  id: string;
  name: string;
  tag: string;
  codeFile: string;
  codeAnchor: string;
  astSnippet: string;
  genericBullet: string;
  genericHighlightWords: string[];
  genericRiskLevel: string;
  genericRiskScore: number;
  genericInterviewer: string;
  genericOutcome: string;
  proofBullet: string;
  proofEvidenceLineage: string[];
  proofDefense: string;
  proofOutcome: string;
}

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "redis-worker",
    name: "Redis Worker (Go)",
    tag: "Distributed Concurrency",
    codeFile: "pkg/worker/pool.go",
    codeAnchor: "pkg/worker/pool.go:L42-L78",
    astSnippet: `func (p *Pool) DispatchJobs(ctx context.Context) error {
  entries, err := p.redis.XReadGroup(ctx, &redis.XReadGroupArgs{
    Group: "billing-workers", Streams: []string{"jobs:stream", ">"},
  })
  p.workerPool.Submit(func() { p.executeIdempotentCharge(entries) })
}`,
    genericBullet:
      "Engineered high-performance microservices architecture using Redis and Kafka, improving query efficiency by 40% across distributed workloads.",
    genericHighlightWords: ["high-performance", "by 40%"],
    genericRiskLevel: "CRITICAL RISK",
    genericRiskScore: 92,
    genericInterviewer:
      "How did you measure that 40%? What was your benchmark baseline? Which profiling tool did you use, and how did you configure consumer group partition offsets?",
    genericOutcome: "Candidate freezes. Red flag for fabricated metrics and buzzwords.",
    proofBullet:
      "Architected asynchronous job queue in Go using Redis streams and worker pools, handling 1,500 jobs/sec with sub-10ms dispatch latency verified via benchmark suite.",
    proofEvidenceLineage: ["go.mod: redis/v9", "pkg/worker/pool.go: XReadGroup", "bench_test.go: 1.5k ops/s"],
    proofDefense:
      "When asked about the 10ms dispatch latency, explain how Redis streams XREADGROUP was coupled with buffered worker channels in pkg/worker/pool.go, bounding latency to memory cache operations and avoiding database locks.",
    proofOutcome: "Demonstrates mechanical sympathy and architectural ownership. Immediate hire signal.",
  },
  {
    id: "api-service",
    name: "E-Commerce Webhooks (Node)",
    tag: "Database Locking & DX",
    codeFile: "src/webhooks/ledger.ts",
    codeAnchor: "src/webhooks/ledger.ts:L18-L55",
    astSnippet: `export async function processWebhook(chargeId: string) {
  const acquired = await redis.set(\`lock:\${chargeId}\`, "1", "NX", "EX", 30);
  if (!acquired) return { status: "duplicate_skipped" };
  await prisma.$transaction(async (tx) => {
    await tx.chargeLedger.create({ data: { chargeId, processedAt: new Date() } });
  });
}`,
    genericBullet:
      "Spearheaded database optimization and scalable REST APIs with Redis caching, boosting throughput by 300% and reducing database load.",
    genericHighlightWords: ["Spearheaded", "by 300%"],
    genericRiskLevel: "UNMEASURED METRIC",
    genericRiskScore: 88,
    genericInterviewer:
      "Where did the 300% number come from? Did you measure read or write throughput? What cache invalidation strategy prevented stale reads on inventory?",
    genericOutcome: "Interviewer flags buzzword padding. Fails technical audit.",
    proofBullet:
      "Engineered idempotent webhook ingestion pipeline with Postgres transactions and Redis atomic distributed locks, guaranteeing exactly-once charge execution.",
    proofEvidenceLineage: ["package.json: ioredis", "src/webhooks/ledger.ts: set(NX)", "schema.prisma: chargeLedger"],
    proofDefense:
      "Explain how Postgres SELECT FOR UPDATE was replaced with Redis atomic NX lock tokens to serialize concurrent webhook retries without table-level locking.",
    proofOutcome: "Answers trade-offs with production precision. Verified pass.",
  },
  {
    id: "outbox-broker",
    name: "Event Bus & CDC (Postgres)",
    tag: "Data Consistency",
    codeFile: "internal/outbox/relay.go",
    codeAnchor: "internal/outbox/relay.go:L28-L64",
    astSnippet: `func (r *Relay) PublishTx(tx *sql.Tx, event Event) error {
  _, err := tx.Exec("INSERT INTO outbox (topic, payload) VALUES ($1, $2)",
    event.Topic, event.Payload)
  return err // Atomic transaction: business record + outbox ledger
}`,
    genericBullet:
      "Leveraged cutting-edge microservices architecture and event streaming to streamline cross-functional cloud workflows across production environments.",
    genericHighlightWords: ["Leveraged", "cutting-edge", "cross-functional"],
    genericRiskLevel: "FLUFF RISK",
    genericRiskScore: 84,
    genericInterviewer:
      "What concrete architectural pattern did you implement? If the publisher dies between database commit and message broker send, how did you prevent dual-write corruption?",
    genericOutcome: "Stumbles on dual-write failure modes. Evaluated as junior boilerplate.",
    proofBullet:
      "Implemented transactional outbox pattern using Postgres CDC and atomic table mutations, guaranteeing zero message loss and at-least-once event delivery.",
    proofEvidenceLineage: ["internal/outbox/relay.go: sql.Tx", "migrations/003_outbox.sql", "Debezium connector config"],
    proofDefense:
      "Walk through the transactional boundary: mutations write to the domain table and outbox ledger in the exact same database transaction, eliminating dual-write race conditions.",
    proofOutcome: "Demonstrates distributed systems reliability. Verified senior pass.",
  },
];

const DEMO_STAGES = [
  {
    index: 0,
    label: "1. AI Fluff Claim",
    badge: "Generic AI Fluff",
    badgeVariant: "flag" as const,
    subtitle: "Typical ChatGPT generation with unverified numbers",
  },
  {
    index: 1,
    label: "2. Interviewer Grill",
    badge: "Senior Skepticism",
    badgeVariant: "warn" as const,
    subtitle: "Senior interviewer challenges the unmeasured claim",
  },
  {
    index: 2,
    label: "3. AST Code Anchor",
    badge: "Proof Grounding Net",
    badgeVariant: "accent" as const,
    subtitle: "Verbatim code AST parsed; fabricated 40% stripped",
  },
  {
    index: 3,
    label: "4. Defensible Bullet",
    badge: "Google X-Y-Z Standard",
    badgeVariant: "ok" as const,
    subtitle: "Grounded resume bullet synthesized with real proxies",
  },
  {
    index: 4,
    label: "5. Defense Script",
    badge: "Hotseat Defense Pass",
    badgeVariant: "ok" as const,
    subtitle: "Candidate speaks verified trade-offs; hire signal",
  },
];

export function InteractiveRealityCheckDemo() {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<0.5 | 1>(0.5); // Default to 0.5x slow motion as user requested!
  const [viewMode, setViewMode] = useState<"demo" | "compare">("demo");
  const [copied, setCopied] = useState(false);

  // GSAP animated text container reference
  const bulletTextRef = useRef<HTMLParagraphElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const scenario = DEMO_SCENARIOS[selectedScenarioIndex];

  // Stage advancement timer
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Pacing: slow motion gives plenty of time to read and observe
    const stepDurationMs = speed === 0.5 ? 4200 : 2500;

    timerRef.current = setInterval(() => {
      setCurrentStage((prev) => (prev + 1) % DEMO_STAGES.length);
    }, stepDurationMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, selectedScenarioIndex]);

  // GSAP subtle morph/fade tween on stage change
  useEffect(() => {
    if (bulletTextRef.current) {
      gsap.fromTo(
        bulletTextRef.current,
        { opacity: 0.4, y: 4, filter: "blur(2px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: speed === 0.5 ? 0.8 : 0.45,
          ease: "power2.out",
        }
      );
    }
  }, [currentStage, selectedScenarioIndex, speed]);

  const handleCopyProof = async () => {
    try {
      await navigator.clipboard.writeText(scenario.proofBullet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleSelectScenario = (idx: number) => {
    setSelectedScenarioIndex(idx);
    setCurrentStage(0);
  };

  const handleSetStage = (idx: number) => {
    setCurrentStage(idx);
    setIsPlaying(false); // Pause so user can inspect this exact stage
  };

  // Compute live animated risk score based on stage
  const getRiskScore = useCallback(() => {
    if (currentStage === 0) return scenario.genericRiskScore;
    if (currentStage === 1) return Math.min(98, scenario.genericRiskScore + 5);
    if (currentStage === 2) return Math.round(scenario.genericRiskScore * 0.45);
    if (currentStage === 3) return 0;
    return 0;
  }, [currentStage, scenario.genericRiskScore]);

  const riskScore = getRiskScore();

  return (
    <section id="reality-check" className="space-y-6">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="warn" size="sm">
              <Flame className="w-3.5 h-3.5" />
              <span>Interactive Reality Check</span>
            </Badge>
            <span className="text-xs font-mono text-text-dim hidden sm:inline">
              Live Bullet Transformation Demo
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-text mt-1.5">
            Watch Vulnerable AI Bullets Transform into Defensible Proof
          </h2>
          <p className="text-xs sm:text-sm text-text-dim mt-1 max-w-2xl font-sans">
            Senior interviewers quickly dismantle ungrounded AI claims. Watch how Proof’s AST extraction purges fabricated metrics and anchors every bullet to production code receipts.
          </p>
        </div>

        {/* View Mode & Scenario Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-2 border border-border">
            {DEMO_SCENARIOS.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectScenario(idx)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-mono transition cursor-pointer ${
                  selectedScenarioIndex === idx
                    ? "bg-surface text-accent font-semibold border border-border shadow-xs"
                    : "text-text-dim hover:text-text"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* Toggle between Interactive Morph Demo and Side-by-Side View */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-2 border border-border">
            <button
              type="button"
              onClick={() => setViewMode("demo")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono transition cursor-pointer ${
                viewMode === "demo"
                  ? "bg-accent/15 text-accent font-semibold border border-accent/30"
                  : "text-text-dim hover:text-text"
              }`}
              title="Animated Step Demo"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live Demo</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("compare")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono transition cursor-pointer ${
                viewMode === "compare"
                  ? "bg-accent/15 text-accent font-semibold border border-accent/30"
                  : "text-text-dim hover:text-text"
              }`}
              title="Side-by-Side Comparison"
            >
              <Split className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compare</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: INTERACTIVE LIVE MORPH DEMO (GSAP + TIMELINE) */}
      {viewMode === "demo" ? (
        <Card
          variant="default"
          padding="lg"
          className="relative overflow-hidden rounded-xl border-border-strong bg-[#090b10] glow-card space-y-6"
        >
          {/* Top Control Bar: Progress, Play/Pause, Step Scrubber, Speed Toggle */}
          <div className="space-y-3 pb-3 border-b border-border/80">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Play / Pause / Replay Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent text-slate-950 font-bold text-xs font-mono hover:bg-accent-glow transition cursor-pointer shadow-xs"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Pause Demo</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play Demo</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentStage(0);
                    setIsPlaying(true);
                  }}
                  className="p-1.5 rounded-md bg-surface-2 hover:bg-surface-3 text-text-dim hover:text-text border border-border transition cursor-pointer"
                  title="Replay from Step 1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Speed Toggle: 0.5x Slow Motion vs 1x Normal */}
                <div className="flex items-center gap-1 p-0.5 rounded-md bg-surface-2 border border-border text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() => setSpeed(0.5)}
                    className={`px-2 py-0.5 rounded transition cursor-pointer ${
                      speed === 0.5
                        ? "bg-surface text-accent font-semibold"
                        : "text-text-dim hover:text-text"
                    }`}
                    title="Slow Motion Transformation"
                  >
                    0.5x Slow
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeed(1)}
                    className={`px-2 py-0.5 rounded transition cursor-pointer ${
                      speed === 1
                        ? "bg-surface text-accent font-semibold"
                        : "text-text-dim hover:text-text"
                    }`}
                    title="Normal Speed"
                  >
                    1x Normal
                  </button>
                </div>
              </div>

              {/* Real-time Dynamic Risk Meter */}
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-surface-2/80 border border-border">
                <Gauge className="w-4 h-4 text-text-dim" />
                <span className="text-xs font-mono text-text-dim">Risk Level:</span>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    riskScore > 50
                      ? "bg-flag/15 text-flag border border-flag/30"
                      : riskScore > 0
                      ? "bg-warn/15 text-warn border border-warn/30"
                      : "bg-ok/15 text-ok border border-ok/30"
                  }`}
                >
                  {riskScore > 50
                    ? `${riskScore}% CRITICAL RISK`
                    : riskScore > 0
                    ? `${riskScore}% MITIGATING`
                    : "0% GROUNDED PASS"}
                </span>
              </div>
            </div>

            {/* Step Pills & Timeline Scrubber */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
              {DEMO_STAGES.map((stg) => {
                const isActive = currentStage === stg.index;
                const isPassed = currentStage > stg.index;
                return (
                  <button
                    key={stg.index}
                    type="button"
                    onClick={() => handleSetStage(stg.index)}
                    className={`relative p-2 rounded-lg text-left transition cursor-pointer border ${
                      isActive
                        ? "bg-surface border-accent shadow-xs"
                        : isPassed
                        ? "bg-surface-2/40 border-border/80 text-text"
                        : "bg-surface-2/20 border-border/40 text-text-dim hover:border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className={isActive ? "text-accent font-bold" : "text-text-dim"}>
                        {stg.label}
                      </span>
                      {isPassed && <Check className="w-3 h-3 text-ok" />}
                    </div>
                    {/* Active highlight line */}
                    {isActive && (
                      <motion.div
                        layoutId="active-stage-indicator"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent rounded-full"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN STAGE: THE LIVE TRANSFORMING BULLET BOX */}
          <div className="space-y-5">
            {/* Stage Title and Status Tag */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    currentStage === 0
                      ? "flag"
                      : currentStage === 1
                      ? "warn"
                      : currentStage === 2
                      ? "accent"
                      : "ok"
                  }
                  size="sm"
                >
                  {currentStage === 0 ? (
                    <X className="w-3 h-3" />
                  ) : currentStage === 1 ? (
                    <Flame className="w-3 h-3" />
                  ) : currentStage === 2 ? (
                    <Terminal className="w-3 h-3" />
                  ) : (
                    <ShieldCheck className="w-3 h-3" />
                  )}
                  <span>{DEMO_STAGES[currentStage].badge}</span>
                </Badge>
                <span className="text-xs text-text-dim font-mono hidden sm:inline">
                  {DEMO_STAGES[currentStage].subtitle}
                </span>
              </div>

              {/* Copy Grounded Bullet Button (Available on stages 3 & 4) */}
              {currentStage >= 3 && (
                <button
                  type="button"
                  onClick={handleCopyProof}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono bg-surface-2 hover:bg-surface-3 text-accent border border-accent/30 transition cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-accent" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Bullet</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* The Morphing Resume Bullet Card */}
            <div
              className={`p-5 rounded-xl border transition-all duration-500 font-mono text-xs sm:text-sm leading-relaxed ${
                currentStage <= 1
                  ? "bg-flag/[0.04] border-flag/30 text-text"
                  : currentStage === 2
                  ? "bg-accent/[0.04] border-accent/40 text-text"
                  : "bg-ok/[0.04] border-ok/40 text-text shadow-lg shadow-ok/5"
              }`}
            >
              <div className="text-[11px] font-mono uppercase tracking-wider text-text-dim mb-2 flex items-center justify-between">
                <span>
                  {currentStage <= 1
                    ? "Resume Bullet (Vulnerable AI Fluff):"
                    : currentStage === 2
                    ? "AST Grounding & Metric Stripping:"
                    : "Synthesized Resume Bullet (Grounded & Defensible):"}
                </span>
                <span className="font-mono text-[10px] text-text-dim">
                  {currentStage <= 1
                    ? "ChatGPT / Claude Prompt"
                    : `${scenario.codeFile} AST Proof`}
                </span>
              </div>

              {/* Dynamic Text Display with GSAP ref */}
              <p ref={bulletTextRef} className="leading-relaxed">
                {currentStage === 0 && (
                  <span>
                    &ldquo;Engineered{" "}
                    <span className="text-flag bg-flag/15 px-1 py-0.5 rounded border border-flag/30 font-semibold">
                      high-performance
                    </span>{" "}
                    microservices architecture using Redis and Kafka,{" "}
                    <span className="text-flag bg-flag/15 px-1 py-0.5 rounded border border-flag/30 font-semibold underline decoration-wavy">
                      improving query efficiency by 40%
                    </span>{" "}
                    across distributed workloads.&rdquo;
                  </span>
                )}

                {currentStage === 1 && (
                  <span>
                    &ldquo;Engineered{" "}
                    <span className="line-through decoration-flag text-text-dim bg-flag/10 px-1 py-0.5 rounded">
                      high-performance
                    </span>{" "}
                    microservices architecture using Redis and Kafka,{" "}
                    <span className="bg-flag/20 text-flag px-1 py-0.5 rounded border border-flag/40 font-bold animate-pulse">
                      [UNVERIFIED: by 40%]
                    </span>{" "}
                    across distributed workloads.&rdquo;
                  </span>
                )}

                {currentStage === 2 && (
                  <span>
                    &ldquo;
                    <span className="text-accent font-semibold">
                      [AST Extracted: {scenario.codeAnchor}]
                    </span>{" "}
                    Purging fabricated &lsquo;40%&rsquo; claim &rarr; grounding into measured dispatch latency &amp; consumer groups via benchmark test suite...&rdquo;
                  </span>
                )}

                {currentStage >= 3 && (
                  <span className="text-text font-medium">
                    &ldquo;{scenario.proofBullet}&rdquo;
                  </span>
                )}
              </p>
            </div>

            {/* DYNAMIC SECONDARY CONTEXT BOX (Changes per stage) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box A: Senior Interviewer Challenge or AST Code Extraction */}
              <div className="p-4 rounded-lg bg-surface border border-border space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-warn font-semibold">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Senior Interviewer Hotseat Challenge:</span>
                  </span>
                  <span className="text-[10px] text-text-dim">Behavioral Screen</span>
                </div>
                <p className="text-xs text-text-dim italic font-sans leading-relaxed bg-surface-2/60 p-3 rounded-md border border-border">
                  &ldquo;{scenario.genericInterviewer}&rdquo;
                </p>
                <div className="text-[11px] font-mono text-flag flex items-center gap-1.5 pt-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Risk: {scenario.genericOutcome}</span>
                </div>
              </div>

              {/* Box B: Verbatim Spoken Defense Script & Mechanical Sympathy */}
              <div
                className={`p-4 rounded-lg border space-y-2 transition-all ${
                  currentStage >= 3
                    ? "bg-accent/[0.04] border-accent/40"
                    : "bg-surface border-border opacity-70"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-accent font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verifiable Spoken Defense Script:</span>
                  </span>
                  <span className="font-mono text-[10px] text-accent/80 bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20">
                    {scenario.codeAnchor}
                  </span>
                </div>
                <p className="text-xs text-text font-sans leading-relaxed bg-surface-2/60 p-3 rounded-md border border-border">
                  &ldquo;{scenario.proofDefense}&rdquo;
                </p>
                <div className="text-[11px] font-mono text-ok flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Outcome: {scenario.proofOutcome}</span>
                </div>
              </div>
            </div>

            {/* AST Code Anchor Lineage Accordion (Real Receipts) */}
            <div className="p-3.5 rounded-lg bg-surface-2/60 border border-border font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-text-dim">
                <span className="flex items-center gap-1.5 text-accent font-medium">
                  <FileCode2 className="w-3.5 h-3.5" />
                  <span>AST Code Anchor &amp; Evidence Lineage:</span>
                </span>
                <span className="text-[11px] text-text-dim">{scenario.codeFile}</span>
              </div>
              <pre className="p-2.5 rounded bg-[#07090d] border border-border/80 text-[11px] text-text-dim overflow-x-auto leading-relaxed">
                <code>{scenario.astSnippet}</code>
              </pre>
            </div>
          </div>
        </Card>
      ) : (
        /* VIEW MODE 2: CLASSIC SIDE-BY-SIDE COMPARISON */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* LEFT: Generic AI / Fluff */}
          <Card
            variant="default"
            padding="lg"
            className="border-flag/30 bg-flag/[0.03] space-y-4 flex flex-col justify-between rounded-xl glow-card"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-flag/20 pb-2.5">
                <Badge variant="flag" size="sm">
                  <X className="w-3 h-3" />
                  <span>Generic AI / ChatGPT Resume Bullet</span>
                </Badge>
                <span className="text-xs font-mono font-medium text-flag">
                  {scenario.genericRiskLevel}
                </span>
              </div>

              <div className="p-3.5 rounded-md bg-bg/90 border border-flag/25 font-mono text-xs text-text leading-relaxed">
                &ldquo;{scenario.genericBullet}&rdquo;
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-flag font-medium font-sans text-xs">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Anticipated challenge:</span>
                </div>
                <p className="text-text-dim italic bg-surface-2/60 p-3 rounded-md border border-border leading-relaxed font-sans">
                  &ldquo;{scenario.genericInterviewer}&rdquo;
                </p>
              </div>
            </div>

            <div className="p-3 rounded-md bg-flag/10 border border-flag/25 text-flag text-xs font-mono flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Outcome: {scenario.genericOutcome}</span>
            </div>
          </Card>

          {/* RIGHT: Proof Grounded Bullet */}
          <Card
            variant="default"
            padding="lg"
            className="border-accent/40 bg-accent/[0.03] space-y-4 flex flex-col justify-between rounded-xl glow-card top-highlight"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-accent/20 pb-2.5">
                <Badge variant="ok" size="sm">
                  <Check className="w-3 h-3" />
                  <span>Proof Grounded Bullet (Zero Hallucination)</span>
                </Badge>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium text-accent">
                    Verbatim Code Anchor
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyProof}
                    className="p-1 rounded text-text-dim hover:text-accent transition cursor-pointer"
                    title="Copy bullet"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-accent" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-md bg-bg/90 border border-accent/30 font-mono text-xs text-text leading-relaxed">
                &ldquo;{scenario.proofBullet}&rdquo;
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-accent font-semibold font-mono text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verifiable Spoken Defense Script:</span>
                  </div>
                  <span className="font-mono text-[10px] text-accent/80 bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20">
                    {scenario.codeAnchor}
                  </span>
                </div>
                <p className="text-text bg-surface-2/60 p-3 rounded-md border border-border leading-relaxed font-sans">
                  &ldquo;{scenario.proofDefense}&rdquo;
                </p>
              </div>
            </div>

            <div className="p-3 rounded-md bg-ok/10 border border-ok/25 text-ok text-xs font-mono flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Outcome: {scenario.proofOutcome}</span>
            </div>
          </Card>
        </div>
      )}
    </section>
  );
}
