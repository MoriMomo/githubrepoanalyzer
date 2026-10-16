import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Flame,
  Terminal,
  ShieldCheck,
  Check,
  Copy,
  X,
  Gauge,
} from "lucide-react";
import { Badge } from "~/components/ui/Badge";
import { Card } from "~/components/ui/Card";
import {
  DEMO_SCENARIOS,
  DEMO_STAGES,
  type DemoScenario,
} from "./realityCheckData";

function HighlightedFluffBullet({
  text,
  highlights,
  isWarning,
}: {
  text: string;
  highlights: string[];
  isWarning: boolean;
}) {
  if (!highlights.length) return <span>&ldquo;{text}&rdquo;</span>;

  const escaped = highlights.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));

  return (
    <span>
      &ldquo;
      {parts.map((part, i) => {
        const isMatch = highlights.some((w) => w.toLowerCase() === part.toLowerCase());
        if (!isMatch) return <span key={i}>{part}</span>;

        if (!isWarning) {
          return (
            <span
              key={i}
              className="text-flag bg-flag/15 px-1 py-0.5 rounded border border-flag/30 font-semibold underline decoration-wavy"
            >
              {part}
            </span>
          );
        }

        return (
          <span
            key={i}
            className="bg-flag/20 text-flag px-1 py-0.5 rounded border border-flag/40 font-bold inline-flex items-center gap-1 mx-0.5"
          >
            <span className="line-through decoration-flag opacity-70">{part}</span>
            <span className="text-[10px] uppercase font-mono px-1 py-0.2 bg-flag/30 rounded">
              [UNVERIFIED]
            </span>
          </span>
        );
      })}
      &rdquo;
    </span>
  );
}

function StageBulletText({
  scenario,
  stage,
}: {
  scenario: DemoScenario;
  stage: number;
}) {
  if (stage >= 3) {
    return <span className="text-text font-medium">&ldquo;{scenario.proofBullet}&rdquo;</span>;
  }
  if (stage === 2) {
    return (
      <span>
        &ldquo;
        <span className="text-accent font-semibold">[AST Extracted: {scenario.codeAnchor}]</span>{" "}
        Purging unverified fluff &rarr; grounding into measured {scenario.tag.toLowerCase()} proxies via codebase receipts...&rdquo;
      </span>
    );
  }
  return (
    <HighlightedFluffBullet
      text={scenario.genericBullet}
      highlights={scenario.genericHighlightWords}
      isWarning={stage === 1}
    />
  );
}

export function InteractiveRealityCheckDemo() {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<0.5 | 1>(0.5);
  const [copied, setCopied] = useState(false);

  const scenario = DEMO_SCENARIOS[selectedScenarioIndex];

  // Stage timer
  useEffect(() => {
    if (!isPlaying) return;
    const stepDurationMs = speed === 0.5 ? 4200 : 2500;
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev + 1) % DEMO_STAGES.length);
    }, stepDurationMs);
    return () => clearInterval(interval);
  }, [isPlaying, speed, selectedScenarioIndex]);

  const handleCopyProof = async () => {
    try {
      await navigator.clipboard.writeText(scenario.proofBullet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard fallback
    }
  };

  const handleSelectScenario = (idx: number) => {
    setSelectedScenarioIndex(idx);
    setCurrentStage(0);
  };

  const handleSetStage = (idx: number) => {
    setCurrentStage(idx);
    setIsPlaying(false);
  };

  const getRiskScore = useCallback(() => {
    if (currentStage === 0) return scenario.genericRiskScore;
    if (currentStage === 1) return Math.min(98, scenario.genericRiskScore + 5);
    if (currentStage === 2) return Math.round(scenario.genericRiskScore * 0.45);
    return 0;
  }, [currentStage, scenario.genericRiskScore]);

  const riskScore = getRiskScore();

  return (
    <section id="reality-check" className="space-y-6">
      {/* Header and Preset Selector */}
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

        {/* Preset Selector */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-2 border border-border">
          {DEMO_SCENARIOS.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelectScenario(idx)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-mono transition cursor-pointer ${selectedScenarioIndex === idx
                  ? "bg-surface text-accent font-semibold border border-border shadow-xs"
                  : "text-text-dim hover:text-text"
                }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Morph Demo Card */}
      <Card
        variant="default"
        padding="lg"
        className="relative overflow-hidden rounded-xl border-border-strong bg-[#090b10] glow-card space-y-6"
      >
        {/* Controls Bar */}
        <div className="space-y-3 pb-3 border-b border-border/80">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Playback Controls */}
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

              {/* Speed Toggle */}
              <div className="flex items-center gap-1 p-0.5 rounded-md bg-surface-2 border border-border text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setSpeed(0.5)}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${speed === 0.5 ? "bg-surface text-accent font-semibold" : "text-text-dim hover:text-text"
                    }`}
                  title="Slow Motion Transformation"
                >
                  0.5x Slow
                </button>
                <button
                  type="button"
                  onClick={() => setSpeed(1)}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${speed === 1 ? "bg-surface text-accent font-semibold" : "text-text-dim hover:text-text"
                    }`}
                  title="Normal Speed"
                >
                  1x Normal
                </button>
              </div>
            </div>

            {/* Risk Gauge */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-surface-2/80 border border-border">
              <Gauge className="w-4 h-4 text-text-dim" />
              <span className="text-xs font-mono text-text-dim">Risk Level:</span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${riskScore > 50
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

          {/* Stage Timeline Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
            {DEMO_STAGES.map((stg) => {
              const isActive = currentStage === stg.index;
              const isPassed = currentStage > stg.index;
              return (
                <button
                  key={stg.index}
                  type="button"
                  onClick={() => handleSetStage(stg.index)}
                  className={`relative p-2 rounded-lg text-left transition cursor-pointer border ${isActive
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

        {/* Live Transforming Bullet Box */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={DEMO_STAGES[currentStage].badgeVariant} size="sm">
                {currentStage === 0 && <X className="w-3 h-3" />}
                {currentStage === 1 && <Flame className="w-3 h-3" />}
                {currentStage === 2 && <Terminal className="w-3 h-3" />}
                {currentStage >= 3 && <ShieldCheck className="w-3 h-3" />}
                <span>{DEMO_STAGES[currentStage].badge}</span>
              </Badge>
              <span className="text-xs text-text-dim font-mono hidden sm:inline">
                {DEMO_STAGES[currentStage].subtitle}
              </span>
            </div>

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

          <div
            className={`p-5 rounded-xl border transition-all duration-500 font-mono text-xs sm:text-sm leading-relaxed ${currentStage <= 1
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
                {currentStage <= 1 ? "ChatGPT / Claude Prompt" : `${scenario.codeFile} AST Proof`}
              </span>
            </div>

            <motion.p
              key={`${selectedScenarioIndex}-${currentStage}`}
              initial={{ opacity: 0.3, y: 3, filter: "blur(2px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: speed === 0.5 ? 0.6 : 0.35, ease: "easeOut" }}
              className="leading-relaxed"
            >
              <StageBulletText scenario={scenario} stage={currentStage} />
            </motion.p>
          </div>
        </div>
      </Card>
    </section>
  );
}
