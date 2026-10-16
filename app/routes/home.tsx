import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ShieldCheck,
  GitBranch,
  Sparkles,
  HelpCircle,
  Lock,
  Terminal,
  Cpu,
  Flame,
  Code2,
  CheckCircle2,
  Check,
  X,
} from "lucide-react";
import { generateUUID } from "~/lib/utils";
import {
  auditBulletRisk,
  stripNumberPhrase,
  type BulletAuditReport,
} from "~/lib/grounding";
import { Badge, Card, Dither } from "~/components/ui";
import {
  InteractiveCodeHero,
  InteractiveRealityCheckDemo,
} from "~/features/landing";
import { InlineLinterView } from "~/features/audit";
import { Navbar, Footer } from "~/components/layout";


function SectionDivider() {
  return (
    <div
      className="w-full border-t border-white/[0.05] relative my-8 sm:my-14 after:absolute after:top-0 after:left-1/2 after:-translate-x-1/2 after:w-1/2 after:h-px after:bg-gradient-to-r after:from-transparent after:via-emerald-500/30 after:to-transparent"
      aria-hidden="true"
    />
  );
}

const PRESET_AUDIT_BULLETS = [
  {
    label: "Generic AI Fluff",
    riskDot: "bg-red-400",
    text: "Spearheaded database optimization with Redis caching, increasing query speeds by 40% and handling 10k requests/sec.",
    rewrite: "Configured Redis session caching layer with sliding key TTL expiration, eliminating redundant PostgreSQL queries for authenticated endpoints.",
    script: "When asked about query speeds, explain that session lookups were redirected from Postgres to Redis in-memory key-value lookups, bounding round-trip latency to network hop overhead.",
  },
  {
    label: "Vague Action",
    riskDot: "bg-amber-400",
    text: "Leveraged cutting-edge microservices architecture to streamline cross-functional cloud workflows.",
    rewrite: "Decoupled user authentication and payment webhook domains into modular service boundaries with explicit REST contracts and isolated Prisma schemas.",
    script: "Explain the domain boundary: why user auth was isolated from billing to allow independent schema migrations without coordinated deployment lock-steps.",
  },
  {
    label: "Defensible Grounded",
    riskDot: "bg-emerald-400",
    text: "Implemented transactional outbox pattern using Postgres CDC and Debezium, ensuring reliable event dispatch across distributed services.",
    rewrite: "Implemented transactional outbox pattern using Postgres CDC and Debezium, ensuring reliable event dispatch across distributed services.",
    script: "Walk through the outbox schema: mutations write to the business table and outbox ledger in the same database transaction, guaranteeing at-least-once message relay.",
  },
];

export default function HomePage() {
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text relative selection:bg-accent/20 selection:text-accent">
      {/* FULL-VIEWPORT FIXED BACKGROUND DITHER CANVAS */}
      <div
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
        style={{ willChange: "transform", transform: "translateZ(0)" }}
        aria-hidden="true"
      >
        <Dither
          waveColor="#10b981"
          backgroundColor="transparent"
          ditherMode="bayer"
          colorNum={4}
          pixelSize={3}
          waveSpeed={0.03}
          waveFrequency={2.2}
          waveAmplitude={0.2}
          contrast={1.0}
          brightness={-0.18}
          mouseEffect="reveal"
          mouseRadius={0.35}
          mouseStrength={1.2}
          trail={0.35}
          clickRipple={true}
          intro={false}
          dpr={1}
        />
        {/* Subtle radial vignette overlay to keep text contrast crisp and hero focused */}
        <div className="absolute inset-0 bg-radial-[at_50%_15%] from-transparent via-[#05070a]/45 to-[#05070a]/85 pointer-events-none" />
      </div>

      {/* Top Floating Pure Notch Navbar */}
      <Navbar mode="home" />

      {/* Main Content */}
      <main className="relative z-10 flex-1 space-y-24 pt-24 pb-16 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        {/* HERO SECTION - ANIMATED INTERACTIVE AST CODE ENGINE */}
        <InteractiveCodeHero
          showDither={false}
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
            label: "Audit a Public Repo (Free, No Sign-up) →",
            onClick: () => navigate("/app"),
          }}
          secondaryAction={{
            label: ">_ Try Sample Project",
            onClick: handleLaunchSample,
          }}
          trustNotes={
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono text-text-dim">
              <span className="flex items-center gap-1.5 text-accent font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Client-Side Privacy
              </span>
              <span>&bull;</span>
              <span>No Account Required</span>
              <span>&bull;</span>
              <span>Zero Model Training</span>
            </div>
          }
          fileName="pkg/worker/pool.go"
        />

        {/* INTERACTIVE REALITY CHECK DEMO (GSAP + TIMELINE MORPHING) */}
        <InteractiveRealityCheckDemo />

        <SectionDivider />

        {/* HOW IT WORKS / 4-STAGE PIPELINE */}
        <section id="pipeline" className="space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <Badge variant="accent" size="sm">
              The 4-Stage Architectural Pipeline
            </Badge>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text">
              From Raw Manifests to Interview Receipts
            </h2>
            <p className="text-xs text-zinc-400">
              Grounded, defensible resume points generated in under 60 seconds with zero hallucination.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 relative">
            {/* STAGE 01 */}
            <div className="relative group">
              <div className="h-full p-4 rounded-xl border border-cyan-500/20 bg-surface/60 hover:bg-surface/90 hover:border-cyan-500/40 transition-all duration-300 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="font-mono text-cyan-400 font-bold text-xs bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/25">
                      STAGE 01
                    </span>
                    <GitBranch className="w-4 h-4 text-cyan-400/80 group-hover:text-cyan-300 transition" />
                  </div>
                  <h3 className="font-display font-semibold text-sm text-text">
                    Ingestion &amp; Manifests
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Paste your README or link a public GitHub repo. Proof reads package manifests (package.json, go.mod, Cargo.toml) via raw CDN without cloning.
                  </p>
                </div>
                <div className="pt-2 text-[10px] font-mono text-cyan-400/80 border-t border-white/5">
                  &bull; Zero auth needed for public repos
                </div>
              </div>

              {/* Directional Connector Arrow */}
              <div
                className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-[#111116] border border-cyan-500/30 items-center justify-center text-cyan-400 text-xs shadow-md font-mono pointer-events-none"
                aria-hidden="true"
              >
                →
              </div>
              <div
                className="flex lg:hidden justify-center py-1 text-cyan-400/60 text-xs font-mono pointer-events-none"
                aria-hidden="true"
              >
                ↓
              </div>
            </div>

            {/* STAGE 02 */}
            <div className="relative group">
              <div className="h-full p-4 rounded-xl border border-cyan-500/20 bg-surface/60 hover:bg-surface/90 hover:border-cyan-500/40 transition-all duration-300 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="font-mono text-cyan-400 font-bold text-xs bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/25">
                      STAGE 02
                    </span>
                    <Cpu className="w-4 h-4 text-cyan-400/80 group-hover:text-cyan-300 transition" />
                  </div>
                  <h3 className="font-display font-semibold text-sm text-text">
                    Deterministic Parsing
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Deterministic regex pipelines detect languages, frameworks, cache layers, databases, and message brokers with verifiable accuracy.
                  </p>
                </div>
                <div className="pt-2 text-[10px] font-mono text-cyan-400/80 border-t border-white/5">
                  &bull; Footprint detection: Docker, CI, Migrations
                </div>
              </div>

              {/* Directional Connector Arrow */}
              <div
                className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-[#111116] border border-amber-500/30 items-center justify-center text-amber-400 text-xs shadow-md font-mono pointer-events-none"
                aria-hidden="true"
              >
                →
              </div>
              <div
                className="flex lg:hidden justify-center py-1 text-amber-400/60 text-xs font-mono pointer-events-none"
                aria-hidden="true"
              >
                ↓
              </div>
            </div>

            {/* STAGE 03 */}
            <div className="relative group">
              <div className="h-full p-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.02] hover:bg-amber-500/[0.05] hover:border-amber-500/50 transition-all duration-300 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="font-mono text-amber-400 font-bold text-xs bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 shadow-[0_0_10px_-2px_rgba(245,158,11,0.2)]">
                      STAGE 03
                    </span>
                    <HelpCircle className="w-4 h-4 text-amber-400/80 group-hover:text-amber-300 transition" />
                  </div>
                  <h3 className="font-display font-semibold text-sm text-text">
                    Ground Truth Drill
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    A Socratic interview drill asks 2–3 questions about your real trade-offs: failure recovery, rate limits, and unverified boilerplate.
                  </p>
                </div>
                <div className="pt-2 text-[10px] font-mono text-amber-400/80 border-t border-white/5">
                  &bull; 1-click purge for template boilerplate
                </div>
              </div>

              {/* Directional Connector Arrow */}
              <div
                className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-[#111116] border border-emerald-500/40 items-center justify-center text-emerald-400 text-xs shadow-md font-mono pointer-events-none"
                aria-hidden="true"
              >
                →
              </div>
              <div
                className="flex lg:hidden justify-center py-1 text-emerald-400/60 text-xs font-mono pointer-events-none"
                aria-hidden="true"
              >
                ↓
              </div>
            </div>

            {/* STAGE 04 */}
            <div className="relative group">
              <div className="h-full p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/[0.03] hover:bg-emerald-500/[0.06] hover:border-emerald-500/60 shadow-[0_0_30px_-10px_rgba(16,185,129,0.2)] transition-all duration-300 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="font-mono text-emerald-400 font-bold text-xs bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/40 shadow-[0_0_12px_-2px_rgba(16,185,129,0.3)]">
                      STAGE 04
                    </span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="font-display font-semibold text-sm text-text">
                    Grounded Synthesis
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Synthesizes Google X-Y-Z bullets, complete with verbatim evidence lineage badges, code proof anchors, and spoken defense scripts.
                  </p>
                </div>
                <div className="pt-2 text-[10px] font-mono text-emerald-400 border-t border-white/5">
                  &bull; Anti-Fabrication Net validates output
                </div>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* INTERACTIVE MINI RISK AUDITOR (LIVE UTILITY TEST-BENCH) */}
        <section id="auditor" className="space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <Badge variant="warn" size="sm">
              Live Test Bench
            </Badge>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text">
              Test Your Existing Resume Bullets for Interview Risk
            </h2>
            <p className="text-xs text-zinc-400">
              See how senior technical interviewers evaluate typical ChatGPT claims in real-time.
            </p>
          </div>

          <div className="relative w-full max-w-4xl lg:max-w-5xl mx-auto">
            {/* Dynamic ambient radial background glow shifting on risk state */}
            <div
              className={`absolute -inset-2 sm:-inset-4 rounded-3xl ${auditResult.riskLevel === "CRITICAL"
                  ? "bg-red-500/10 shadow-[0_0_60px_-15px_rgba(239,68,68,0.25)]"
                  : auditResult.riskLevel === "MODERATE"
                    ? "bg-amber-500/10 shadow-[0_0_60px_-15px_rgba(245,158,11,0.25)]"
                    : "bg-emerald-500/10 shadow-[0_0_60px_-15px_rgba(16,185,129,0.25)]"
                } blur-2xl opacity-60 pointer-events-none transition-all duration-500`}
              aria-hidden="true"
            />

            <Card
              variant="default"
              padding="lg"
              className="relative space-y-5 rounded-xl border border-white/10 bg-surface/95 shadow-2xl backdrop-blur-xl"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="text-xs font-semibold text-text font-sans">
                    Test a candidate bullet point:
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-zinc-400 font-mono">Quick Presets:</span>
                    {PRESET_AUDIT_BULLETS.map((p) => {
                      const isActive = auditInput.trim() === p.text.trim();
                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => handleRunAudit(p.text)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer ${isActive
                              ? "border border-white/30 bg-white/10 text-white shadow-sm font-semibold"
                              : "border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                            }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${p.riskDot}`} />
                          <span>{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <textarea
                  value={auditInput}
                  onChange={(e) => handleRunAudit(e.target.value)}
                  rows={3}
                  className="w-full bg-bg/90 border border-border rounded-lg p-3.5 text-xs font-mono text-text placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-accent leading-relaxed transition"
                  placeholder="Paste any bullet point to test for ungrounded metrics and interview risks..."
                />

                {/* Inline Linter View with Token Highlights & Legend */}
                <InlineLinterView
                  text={auditInput}
                  fluffHits={auditResult.fluffHits}
                  ungroundedHits={auditResult.ungroundedHits}
                />
              </div>

              {/* Audit Verdict Banner */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-surface-2 border border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-400 font-mono">Interview Risk Score:</span>
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

                  <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
                    <span>
                      Fluff Buzzwords:{" "}
                      <span className="text-amber-400 font-semibold">
                        {auditResult.fluffHits.length}
                      </span>
                    </span>
                    <span>
                      Ungrounded Metrics:{" "}
                      <span className="text-red-400 font-semibold">
                        {auditResult.ungroundedHits.length}
                      </span>
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 bg-bg/80 p-3.5 rounded-lg border border-border leading-relaxed font-sans">
                  {auditResult.diagnosis}
                </p>

                {/* LIVE DEFENSIBLE GROUNDED REWRITE */}
                {(() => {
                  const activePreset = PRESET_AUDIT_BULLETS.find(
                    (p) => p.text.trim() === auditInput.trim(),
                  );
                  const dynamicCleaned = auditResult.ungroundedHits
                    .reduce(
                      (acc, token) => stripNumberPhrase(acc, token),
                      auditInput,
                    )
                    .replace(
                      /\b(spearheaded|leveraged|utilized|participated in|responsible for)\b/gi,
                      "engineered",
                    );

                  return (
                    <div className="p-4 rounded-lg bg-accent/[0.04] border border-accent/30 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-accent font-semibold font-mono text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>How Proof Rewrites This Defensibly:</span>
                        </div>
                        <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                          Zero Hallucination
                        </span>
                      </div>
                      <p className="font-mono text-xs text-text leading-relaxed">
                        &ldquo;{activePreset?.rewrite ?? dynamicCleaned}&rdquo;
                      </p>
                      {activePreset?.script ? (
                        <div className="pt-2 border-t border-accent/20 text-xs text-zinc-400 font-sans leading-relaxed">
                          <span className="text-accent font-mono text-[11px] font-semibold">
                            Spoken Interview Defense:{" "}
                          </span>
                          {activePreset.script}
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-accent/20 text-[11px] text-zinc-400 font-sans leading-relaxed">
                          ↳ Strips unmeasured metrics and buzzwords, shifting focus to verifiable implementation mechanisms.
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </Card>
          </div>
        </section>

        <SectionDivider />

        {/* ASYMMETRIC BENTO GRID: ENGINE CAPABILITIES */}
        <section id="capabilities" className="space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <Badge variant="neutral" size="sm">
              Engine Capabilities
            </Badge>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text">
              Built to Survive Senior Engineering Screens
            </h2>
            <p className="text-xs text-zinc-400">
              Built specifically so junior and mid-level developers pass rigorous technical screens and system design interview rounds without getting caught in AI fabrication traps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bento Card 1: Anti-Fabrication Engine (md:col-span-2) */}
            <div className="md:col-span-2 p-5 sm:p-6 rounded-xl border border-white/10 bg-surface/70 hover:border-accent/40 transition-all duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="w-8 h-8 rounded-md bg-accent/10 border border-accent/25 flex items-center justify-center text-accent">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-text font-display">
                  Anti-Fabrication Engine
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Every generated metric and claim is tested against your source code corpus. Unsubstantiated claims are immediately stripped or flagged.
                </p>
              </div>

              {/* Compact visual micro-artifact: claim stripped vs AST manifest anchor */}
              <div className="p-3 rounded-lg bg-black/70 border border-white/10 font-mono text-[11px] space-y-2">
                <div className="flex items-center justify-between text-zinc-400 border-b border-white/5 pb-1.5">
                  <span className="flex items-center gap-1.5 text-zinc-300">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>AST Manifest Grounding Net</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">Deterministic Verifier</span>
                </div>
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex items-start gap-2 text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">
                    <X className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">❌ &ldquo;10k req/s&rdquo; stripped</span>
                      <p className="text-[10px] text-red-300/80">No benchmark harness or load test found in repo tree.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-emerald-400 bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                    <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">✓ Verified: redis@^4.6.0 TTL config</span>
                      <p className="text-[10px] text-emerald-300/80">Matched `src/cache.ts:L42` with 300s session eviction policy.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Card 2: Interviewer Hotseat Simulator (md:col-span-1) */}
            <div className="md:col-span-1 p-5 sm:p-6 rounded-xl border border-white/10 bg-surface/70 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="w-8 h-8 rounded-md bg-warn/10 border border-warn/25 flex items-center justify-center text-warn">
                  <Flame className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-text font-display">
                  Interviewer Hotseat Simulator
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Interactive modal simulates grilling by senior staff engineers, offering targeted follow-up questions to test your architectural depth.
                </p>
              </div>

              {/* Skeptical Staff Engineer Prompt Bubble Micro-Artifact */}
              <div className="p-3 rounded-lg bg-black/70 border border-white/10 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-[10px] font-bold">
                    L6
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-300">Staff Systems Engineer</span>
                </div>
                <div className="p-2 rounded-md bg-surface-2 border border-border text-[11px] text-zinc-300 italic leading-snug">
                  &ldquo;Walk me through how you measured that 40% query speedup under load?&rdquo;
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Scripted Defense Ready</span>
                </div>
              </div>
            </div>

            {/* Bento Card 3: Traceable Evidence Lineage (md:col-span-1) */}
            <div className="md:col-span-1 p-5 sm:p-6 rounded-xl border border-white/10 bg-surface/70 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="w-8 h-8 rounded-md bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
                  <GitBranch className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-text font-display">
                  Traceable Evidence Lineage
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Click any bullet to inspect its exact source evidence: README sections, manifest packages, and your verified Truth Drill answers.
                </p>
              </div>

              {/* Visual Lineage Tree Badge Micro-Artifact */}
              <div className="p-3 rounded-lg bg-black/70 border border-white/10 font-mono text-[11px] space-y-1.5">
                <div className="flex items-center gap-2 text-zinc-400">
                  <span className="px-2 py-0.5 rounded bg-surface-2 border border-white/10 text-cyan-400 text-[10px]">
                    package.json
                  </span>
                  <span className="text-zinc-600">→</span>
                </div>
                <div className="flex items-center gap-2 pl-3 border-l-2 border-cyan-500/30 text-zinc-400">
                  <span className="px-2 py-0.5 rounded bg-surface-2 border border-white/10 text-amber-400 text-[10px]">
                    src/cache.ts:L42
                  </span>
                  <span className="text-zinc-600">→</span>
                </div>
                <div className="flex items-center gap-2 pl-6 border-l-2 border-emerald-500/30 text-zinc-400">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold text-[10px]">
                    Resume Bullet
                  </span>
                </div>
              </div>
            </div>

            {/* Bento Card 4: Multi-Model Consensus, Privacy & Multi-Format Export (md:col-span-2) */}
            <div className="md:col-span-2 p-5 sm:p-6 rounded-xl border border-white/10 bg-surface/70 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-accent/10 border border-accent/25 flex items-center justify-center text-accent">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="w-8 h-8 rounded-md bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div className="w-8 h-8 rounded-md bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                    <Code2 className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-semibold text-sm text-text font-display">
                  Local-First Privacy, Multi-Model Consensus &amp; Exports
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  No third-party databases, no telemetry, and no model training on your code. Compare results across leading frontier models and export directly to your workflow.
                </p>
              </div>

              {/* Crisp Visual Badges */}
              <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
                <span className="px-2.5 py-1 rounded-md bg-accent/10 border border-accent/25 text-accent flex items-center gap-1.5">
                  <Lock className="w-3 h-3" />
                  Local-First / Zero Telemetry
                </span>
                <span className="px-2.5 py-1 rounded-md bg-surface-2 border border-white/10 text-zinc-300 flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-cyan-400" />
                  GPT-5 / Claude / Gemini / Qwen
                </span>
                <span className="px-2.5 py-1 rounded-md bg-surface-2 border border-white/10 text-zinc-300 flex items-center gap-1.5">
                  <Code2 className="w-3 h-3 text-emerald-400" />
                  Overleaf LaTeX (\resumeItem)
                </span>
                <span className="px-2.5 py-1 rounded-md bg-surface-2 border border-white/10 text-zinc-300">
                  Markdown
                </span>
                <span className="px-2.5 py-1 rounded-md bg-surface-2 border border-white/10 text-zinc-300">
                  JSON
                </span>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER SECTION: Overlapping Floating Card & Obsidian Curved Sheet */}
      <Footer onLaunchSample={handleLaunchSample} />
    </div>
  );
}
