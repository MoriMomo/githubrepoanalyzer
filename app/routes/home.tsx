import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ShieldCheck,
  ArrowRight,
  GitBranch,
  Sparkles,
  HelpCircle,
  Lock,
  Terminal,
  Cpu,
  Flame,
  Check,
  X,
  Code2,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Copy,
} from "lucide-react";
import { generateUUID } from "~/lib/utils";
import { auditBulletRisk, type BulletAuditReport } from "~/lib/grounding";
import {
  Button,
  Badge,
  Card,
  InteractiveCodeHero,
} from "~/components/ui";
import {
  GoIcon,
  RedisIcon,
  PostgresIcon,
  DockerIcon,
  TypeScriptIcon,
} from "~/components/ui/hero-01-utils/hero-01-icons";
import { Navbar } from "~/components/Navbar";

const HERO_EXAMPLES = [
  {
    id: "redis-worker",
    title: "Distributed Job Queue (Go + Redis)",
    genericBullet:
      "Engineered high-performance microservices architecture using Redis and Kafka, improving query efficiency by 40% across distributed workloads.",
    genericInterviewer:
      "How did you measure that 40%? What was your benchmark baseline? Which profiling tool did you use, and how did you configure consumer group partition offsets?",
    genericRisk: "HIGH FABRICATION RISK",
    genericOutcome: "Candidate freezes. Red flag for unsubstantiated metrics.",
    proofBullet:
      "Architected asynchronous job queue in Go using Redis streams and worker pools, handling 1,500 jobs/sec with sub-10ms dispatch latency verified via benchmark suite.",
    proofCodeProof: "pkg/worker/pool.go:L42-L78",
    proofDefense:
      "When asked about the 10ms dispatch latency, explain how Redis streams XREADGROUP was coupled with buffered channels in pkg/worker/pool.go, avoiding database locking during burst traffic.",
    proofOutcome: "Demonstrates architectural ownership and mechanical sympathy. Immediate hire signal.",
  },
  {
    id: "api-service",
    title: "E-Commerce Ingestion (Node + Postgres)",
    genericBullet:
      "Spearheaded database optimization and scalable REST APIs with Redis caching, boosting throughput by 300% and reducing database load.",
    genericInterviewer:
      "Where did the 300% number come from? Did you measure read or write throughput? What cache invalidation strategy prevented stale reads on inventory?",
    genericRisk: "UNMEASURED METRIC",
    genericOutcome: "Interviewer flags buzzword padding. Fails technical audit.",
    proofBullet:
      "Engineered idempotent webhook ingestion pipeline with Postgres advisory locks and Redis token-bucket rate limiter, guaranteeing exactly-once charge execution.",
    proofCodeProof: "src/webhooks/ledger.ts:L18-L55",
    proofDefense:
      "Explain how Postgres SELECT FOR UPDATE was replaced with advisory locks to serialize concurrent webhook deliveries without table-level lock contention.",
    proofOutcome: "Answers trade-offs with production precision. Verified pass.",
  },
];

const PRESET_AUDIT_BULLETS = [
  {
    label: "Generic AI Fluff",
    text: "Spearheaded database optimization with Redis caching, increasing query speeds by 40% and handling 10k requests/sec.",
  },
  {
    label: "Vague Action",
    text: "Leveraged cutting-edge microservices architecture to streamline cross-functional cloud workflows.",
  },
  {
    label: "Defensible Grounded",
    text: "Implemented transactional outbox pattern using Postgres CDC and Debezium, ensuring reliable event dispatch across distributed services.",
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  const [activeHeroTab, setActiveHeroTab] = useState(0);
  const [copiedProof, setCopiedProof] = useState(false);

  // Mini Risk Auditor state
  const [auditInput, setAuditInput] = useState(PRESET_AUDIT_BULLETS[0].text);
  const [auditResult, setAuditResult] = useState<BulletAuditReport>(() =>
    auditBulletRisk(PRESET_AUDIT_BULLETS[0].text, ""),
  );

  const handleLaunchSample = () => {
    const newId = generateUUID();
    navigate(`/project/${newId}`);
  };

  const handleRunAudit = (text: string) => {
    setAuditInput(text);
    setAuditResult(auditBulletRisk(text, ""));
  };

  const currentExample = HERO_EXAMPLES[activeHeroTab];

  const handleCopyProof = async () => {
    try {
      await navigator.clipboard.writeText(currentExample.proofBullet);
      setCopiedProof(true);
      setTimeout(() => setCopiedProof(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      {/* Top Floating Pure Notch Navbar */}
      <Navbar mode="home" />

      {/* Main Content */}
      <main className="flex-1 space-y-24 pt-24 pb-16 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        {/* HERO SECTION - ANIMATED INTERACTIVE AST CODE ENGINE */}
        <InteractiveCodeHero
          badge={
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-mono shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Deterministic Resume Engineering &amp; Hotseat Defense</span>
            </div>
          }
          headline={
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text leading-[1.14]">
              Turn raw repositories into{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-emerald-300 to-teal-200">
                interview-defensible
              </span>{" "}
              resume bullets.
            </h1>
          }
          description={
            <p className="text-sm sm:text-base text-text-dim leading-relaxed font-sans">
              Generic AI invents metrics like{" "}
              <span className="text-flag font-mono font-medium bg-flag/10 px-1.5 py-0.5 rounded border border-flag/20">
                &ldquo;improved query efficiency by 40%&rdquo;
              </span>{" "}
              that collapse at the first senior interview question. Proof extracts verifiable architecture signals directly from your code tree and executes a Truth Drill to ground every bullet with verbatim code proof.
            </p>
          }
          primaryAction={{
            label: "Launch Main Workspace →",
            onClick: () => navigate("/app"),
          }}
          secondaryAction={{
            label: ">_ Audit Sample Repository",
            onClick: handleLaunchSample,
          }}
          trustNotes="Zero third-party tracking • 100% Client-side Puter.js • Anti-Fabrication Net (§8)"
          techItems={[
            { icon: <GoIcon />, title: "Go 1.22" },
            { icon: <RedisIcon />, title: "Redis Streams" },
            { icon: <PostgresIcon />, title: "PostgreSQL" },
            { icon: <DockerIcon />, title: "Docker" },
            { icon: <TypeScriptIcon />, title: "TypeScript" },
          ]}
          fileName="pkg/worker/pool.go"
        />

        {/* INTERACTIVE REALITY CHECK TERMINAL (THE PROOF OF VALUE) */}
        <section id="reality-check" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="warn" size="sm">
                  <Flame className="w-3 h-3" />
                  <span>The Technical Reality Check</span>
                </Badge>
                <span className="text-xs font-mono text-text-dim hidden sm:inline">
                  Interactive Side-by-Side Comparison
                </span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-text mt-1">
                Why Senior Interviewers Reject Generic AI Bullets
              </h2>
            </div>

            {/* Example Tabs */}
            <div className="flex items-center gap-1.5 p-0.5 rounded-md bg-surface-2 border border-border">
              {HERO_EXAMPLES.map((ex, idx) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => setActiveHeroTab(idx)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer ${
                    activeHeroTab === idx
                      ? "bg-surface text-accent font-semibold border border-border shadow-xs"
                      : "text-text-dim hover:text-text"
                  }`}
                >
                  {idx === 0 ? "Redis Worker" : "E-Commerce Webhooks"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {/* LEFT PANE: Generic AI / ChatGPT Fluff */}
            <Card
              variant="default"
              padding="lg"
              className="border-flag/30 bg-flag/[0.03] space-y-4 flex flex-col justify-between rounded-lg glow-card"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-flag/20 pb-2.5">
                  <Badge variant="flag" size="sm">
                    <X className="w-3 h-3" />
                    <span>Generic AI / ChatGPT Resume Bullet</span>
                  </Badge>
                  <span className="text-xs font-mono font-medium text-flag">
                    {currentExample.genericRisk}
                  </span>
                </div>

                <div className="p-3.5 rounded-md bg-bg/90 border border-flag/25 font-mono text-xs text-text leading-relaxed">
                  &ldquo;{currentExample.genericBullet}&rdquo;
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-flag font-medium font-sans text-xs">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Anticipated challenge:</span>
                  </div>
                  <p className="text-text-dim italic bg-surface-2/60 p-3 rounded-md border border-border leading-relaxed font-sans">
                    &ldquo;{currentExample.genericInterviewer}&rdquo;
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-md bg-flag/10 border border-flag/25 text-flag text-xs font-mono flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Outcome: {currentExample.genericOutcome}</span>
              </div>
            </Card>

            {/* RIGHT PANE: Proof Defensible Bullet */}
            <Card
              variant="default"
              padding="lg"
              className="border-accent/40 bg-accent/[0.03] space-y-4 flex flex-col justify-between rounded-lg glow-card top-highlight"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-accent/20 pb-2.5">
                  <Badge variant="ok" size="sm">
                    <Check className="w-3 h-3" />
                    <span>Proof Grounded Bullet (§8 Net)</span>
                  </Badge>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium text-accent">
                      Verified Grounding
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyProof}
                      className="p-1 rounded text-text-dim hover:text-accent transition cursor-pointer"
                      title="Copy bullet"
                    >
                      {copiedProof ? (
                        <Check className="w-3.5 h-3.5 text-accent" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-md bg-bg/90 border border-accent/30 font-mono text-xs text-text leading-relaxed">
                  &ldquo;{currentExample.proofBullet}&rdquo;
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-accent font-semibold font-mono text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verifiable Spoken Defense Script:</span>
                    </div>
                    <span className="font-mono text-[10px] text-accent/80 bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20">
                      {currentExample.proofCodeProof}
                    </span>
                  </div>
                  <p className="text-text bg-surface-2/60 p-3 rounded-md border border-border leading-relaxed font-sans">
                    &ldquo;{currentExample.proofDefense}&rdquo;
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-md bg-ok/10 border border-ok/25 text-ok text-xs font-mono flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Outcome: {currentExample.proofOutcome}</span>
              </div>
            </Card>
          </div>
        </section>

        {/* TRUST PILLARS / ENGINEERING STANDARDS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <Card variant="surface2" padding="md" className="space-y-2 top-highlight">
            <div className="flex items-center justify-between">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <Badge variant="accent" size="sm">§8 Standard</Badge>
            </div>
            <h3 className="text-sm font-semibold font-sans text-text">
              0% Hallucinations
            </h3>
            <p className="text-xs text-text-dim leading-relaxed font-sans">
              Strict deterministic validation pass strips ungrounded numbers or invented benchmarks before you copy.
            </p>
          </Card>

          <Card variant="surface2" padding="md" className="space-y-2 top-highlight">
            <div className="flex items-center justify-between">
              <span className="w-2 h-2 rounded-full bg-ok" />
              <Badge variant="ok" size="sm">Format</Badge>
            </div>
            <h3 className="text-sm font-semibold font-sans text-text">
              Google X-Y-Z Standard
            </h3>
            <p className="text-xs text-text-dim leading-relaxed font-sans">
              Every bullet is structured as: Accomplished [X], measured by [Y], by implementing [Z].
            </p>
          </Card>

          <Card variant="surface2" padding="md" className="space-y-2 top-highlight">
            <div className="flex items-center justify-between">
              <span className="w-2 h-2 rounded-full bg-warn" />
              <Badge variant="warn" size="sm">Interviews</Badge>
            </div>
            <h3 className="text-sm font-semibold font-sans text-text">
              Hotseat Scripts
            </h3>
            <p className="text-xs text-text-dim leading-relaxed font-sans">
              Pre-computed spoken scripts and verbatim code proof anchors for senior interviewer challenges.
            </p>
          </Card>

          <Card variant="surface2" padding="md" className="space-y-2 top-highlight">
            <div className="flex items-center justify-between">
              <span className="w-2 h-2 rounded-full bg-info" />
              <Badge variant="neutral" size="sm">Privacy</Badge>
            </div>
            <h3 className="text-sm font-semibold font-sans text-text">
              Client-Only Storage
            </h3>
            <p className="text-xs text-text-dim leading-relaxed font-sans">
              Zero centralized backend database. Stored safely in your browser and personal Puter cloud KV.
            </p>
          </Card>
        </section>

        {/* HOW IT WORKS / 4-STAGE PIPELINE */}
        <section id="pipeline" className="space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <Badge variant="accent" size="sm">
              The 4-Stage Architectural Pipeline
            </Badge>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text">
              From Raw Manifests to Interview Receipts
            </h2>
            <p className="text-xs text-text-dim">
              Grounded, defensible resume points generated in under 60 seconds with zero hallucination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            <Card variant="default" padding="md" className="space-y-3 relative group hover:border-accent/40 transition">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="font-mono text-accent font-bold text-xs">STAGE 01</span>
                <GitBranch className="w-4 h-4 text-text-dim group-hover:text-accent transition" />
              </div>
              <h3 className="font-display font-semibold text-sm text-text">
                Ingestion & Manifests
              </h3>
              <p className="text-xs text-text-dim font-sans leading-relaxed">
                Paste your README or link a public GitHub repo. Proof reads package manifests (package.json, go.mod, Cargo.toml) via raw CDN without cloning.
              </p>
              <div className="pt-2 text-[10px] font-mono text-accent/80">
                &bull; Zero auth needed for public repos
              </div>
            </Card>

            <Card variant="default" padding="md" className="space-y-3 relative group hover:border-accent/40 transition">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="font-mono text-accent font-bold text-xs">STAGE 02</span>
                <Cpu className="w-4 h-4 text-text-dim group-hover:text-accent transition" />
              </div>
              <h3 className="font-display font-semibold text-sm text-text">
                Deterministic Parsing
              </h3>
              <p className="text-xs text-text-dim font-sans leading-relaxed">
                Deterministic regex pipelines detect languages, frameworks, cache layers, databases, and message brokers with verifiable accuracy.
              </p>
              <div className="pt-2 text-[10px] font-mono text-accent/80">
                &bull; Footprint detection: Docker, CI, Migrations
              </div>
            </Card>

            <Card variant="default" padding="md" className="space-y-3 relative group hover:border-warn/40 transition">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="font-mono text-warn font-bold text-xs">STAGE 03</span>
                <HelpCircle className="w-4 h-4 text-text-dim group-hover:text-warn transition" />
              </div>
              <h3 className="font-display font-semibold text-sm text-text">
                Ground Truth Drill
              </h3>
              <p className="text-xs text-text-dim font-sans leading-relaxed">
                A Socratic interview drill asks 2–3 questions about your real trade-offs: failure recovery, rate limits, and unverified boilerplate.
              </p>
              <div className="pt-2 text-[10px] font-mono text-warn/80">
                &bull; 1-click purge for template boilerplate
              </div>
            </Card>

            <Card variant="default" padding="md" className="space-y-3 relative group hover:border-ok/40 transition">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="font-mono text-ok font-bold text-xs">STAGE 04</span>
                <ShieldCheck className="w-4 h-4 text-text-dim group-hover:text-ok transition" />
              </div>
              <h3 className="font-display font-semibold text-sm text-text">
                Grounded Synthesis
              </h3>
              <p className="text-xs text-text-dim font-sans leading-relaxed">
                Synthesizes Google X-Y-Z bullets, complete with verbatim evidence lineage badges, code proof anchors, and spoken defense scripts.
              </p>
              <div className="pt-2 text-[10px] font-mono text-ok/80">
                &bull; Anti-Fabrication Net validates output
              </div>
            </Card>
          </div>
        </section>

        {/* INTERACTIVE MINI RISK AUDITOR (LIVE UTILITY TEST-BENCH) */}
        <section id="auditor" className="space-y-5">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <Badge variant="warn" size="sm">
              Live Test Bench
            </Badge>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text">
              Test Your Existing Resume Bullets for Interview Risk
            </h2>
            <p className="text-xs text-text-dim">
              See how senior technical interviewers evaluate typical ChatGPT claims in real-time.
            </p>
          </div>

          <Card variant="default" padding="lg" className="space-y-5 rounded-lg glow-card max-w-3xl mx-auto">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-medium text-text-dim font-sans">
                  Test a candidate bullet point:
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-text-dim font-mono">Quick Presets:</span>
                  {PRESET_AUDIT_BULLETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleRunAudit(p.text)}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-2 hover:bg-surface-3 border border-border text-text transition cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={auditInput}
                onChange={(e) => handleRunAudit(e.target.value)}
                rows={3}
                className="w-full bg-bg border border-border rounded-md p-3 text-xs font-mono text-text placeholder:text-text-dim focus:outline-none focus:ring-1 focus:ring-accent leading-relaxed transition"
                placeholder="Paste any bullet point to test for ungrounded metrics and interview risks..."
              />
            </div>

            {/* Audit Verdict Banner */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-md bg-surface-2 border border-border">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-text-dim font-mono">Interview Risk Score:</span>
                  <Badge
                    variant={
                      auditResult.riskLevel === "CRITICAL"
                        ? "flag"
                        : auditResult.riskLevel === "MODERATE"
                          ? "warn"
                          : "ok"
                    }
                    size="sm"
                  >
                    {auditResult.riskLevel} RISK
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-mono text-text-dim">
                  <span>Fluff Buzzwords: {auditResult.fluffHits.length}</span>
                  <span>Ungrounded Metrics: {auditResult.ungroundedHits.length}</span>
                </div>
              </div>

              <p className="text-xs text-text bg-bg/80 p-3 rounded-md border border-border leading-relaxed font-sans">
                {auditResult.diagnosis}
              </p>
            </div>
          </Card>
        </section>

        {/* ENGINE CAPABILITIES GRID */}
        <section id="capabilities" className="space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <Badge variant="neutral" size="sm">
              Engine Capabilities
            </Badge>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text">
              Engineered for Senior Developers
            </h2>
            <p className="text-xs text-text-dim">
              Built specifically to pass senior software engineering resume screens and system design interview rounds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card variant="surface2" padding="md" className="space-y-2.5 top-highlight hover:border-accent/40 transition">
              <div className="w-8 h-8 rounded-md bg-accent/10 border border-accent/25 flex items-center justify-center text-accent">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-text font-display">
                Anti-Fabrication Net (§8)
              </h3>
              <p className="text-xs text-text-dim leading-relaxed">
                Every generated metric and claim is tested against the source corpus. Unsubstantiated claims are immediately stripped or flagged.
              </p>
            </Card>

            <Card variant="surface2" padding="md" className="space-y-2.5 top-highlight hover:border-warn/40 transition">
              <div className="w-8 h-8 rounded-md bg-warn/10 border border-warn/25 flex items-center justify-center text-warn">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-text font-display">
                Interviewer Hotseat Simulator
              </h3>
              <p className="text-xs text-text-dim leading-relaxed">
                Interactive modal simulates grilling by senior staff engineers, offering targeted follow-up questions to test your depth.
              </p>
            </Card>

            <Card variant="surface2" padding="md" className="space-y-2.5 top-highlight hover:border-ok/40 transition">
              <div className="w-8 h-8 rounded-md bg-ok/10 border border-ok/25 flex items-center justify-center text-ok">
                <GitBranch className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-text font-display">
                Traceable Evidence Lineage
              </h3>
              <p className="text-xs text-text-dim leading-relaxed">
                Click any bullet to inspect its exact source evidence: README sections, manifest packages, and your verified Truth Drill answers.
              </p>
            </Card>

            <Card variant="surface2" padding="md" className="space-y-2.5 top-highlight hover:border-info/40 transition">
              <div className="w-8 h-8 rounded-md bg-info/10 border border-info/25 flex items-center justify-center text-info">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-text font-display">
                Swappable Puter Models
              </h3>
              <p className="text-xs text-text-dim leading-relaxed">
                Choose between OpenAI GPT-5, Alibaba Qwen Max, Anthropic Claude, and Google Gemini with lightning-fast low-latency execution.
              </p>
            </Card>

            <Card variant="surface2" padding="md" className="space-y-2.5 top-highlight hover:border-accent/40 transition">
              <div className="w-8 h-8 rounded-md bg-accent/10 border border-accent/25 flex items-center justify-center text-accent">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-text font-display">
                Zero-Backend Architecture
              </h3>
              <p className="text-xs text-text-dim leading-relaxed">
                No third-party databases, no telemetry, and no centralized storage. Your session data is safely stored in your own Puter KV store.
              </p>
            </Card>

            <Card variant="surface2" padding="md" className="space-y-2.5 top-highlight hover:border-ok/40 transition">
              <div className="w-8 h-8 rounded-md bg-ok/10 border border-ok/25 flex items-center justify-center text-ok">
                <Code2 className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-text font-display">
                Multi-Format Export
              </h3>
              <p className="text-xs text-text-dim leading-relaxed">
                Instantly copy or export to ATS-friendly Plain Text, Overleaf-compatible LaTeX (\resumeItem), Markdown, or structured JSON.
              </p>
            </Card>
          </div>
        </section>

        {/* BOTTOM CTA BANNER */}
        <section className="rounded-xl border border-border bg-gradient-to-b from-surface to-surface-2 p-8 sm:p-12 text-center space-y-6 glow-card top-highlight">
          <div className="max-w-xl mx-auto space-y-3">
            <Badge variant="accent" size="sm">
              <Zap className="w-3 h-3" />
              <span>Get Started in 60 Seconds</span>
            </Badge>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text">
              Ready to build interview-proof bullets?
            </h2>
            <p className="text-xs sm:text-sm text-text-dim leading-relaxed">
              Scan your repository, answer the Socratic Truth Drill, and arm yourself with pre-computed technical defense scripts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/app" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md shadow-accent/20">
                <span>Launch Main Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleLaunchSample}
              className="w-full sm:w-auto"
            >
              <Terminal className="w-4 h-4 text-accent" />
              <span>Try Live Demo (No Login)</span>
            </Button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border py-8 px-6 bg-surface/30">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-dim font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-text font-display">Proof</span>
            <span>&bull;</span>
            <span>Architectural Extraction & Grounding Engine</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/app" className="hover:text-text transition">
              Main App
            </Link>
            <Link to="/login" className="hover:text-text transition">
              Sign In
            </Link>
            <Link to="/wipe" className="hover:text-text transition">
              Reset Data
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
