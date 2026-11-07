import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Copy, Check, Sparkles } from "lucide-react";
import { Button, Dither, type DitherProps } from "~/components/ui";
import { cn } from "~/lib/utils";

export interface CodeLine {
  num: number;
  type: "code" | "comment" | "empty";
  indent?: boolean;
  text?: string;
  tokens?: Array<{ text: string; className: string }>;
}

const PROOF_DEMO_CODE: CodeLine[] = [
  { num: 1, type: "comment", text: "// Real codebase: pkg/worker/pool.go (Redis Stream Worker)" },
  { num: 2, type: "comment", text: "// Proof AST engine extracts verifiable concurrency signals" },
  { num: 3, type: "empty", text: "" },
  {
    num: 4,
    type: "code",
    tokens: [
      { text: "func ", className: "text-rose-400" },
      { text: "(p *Pool) ", className: "text-amber-300" },
      { text: "DispatchJobs", className: "text-emerald-400 font-bold" },
      { text: "(ctx context.Context) error {", className: "text-zinc-300" },
    ],
  },
  {
    num: 5,
    type: "code",
    indent: true,
    tokens: [
      { text: "entries, err := p.redis.", className: "text-zinc-400" },
      { text: "XReadGroup", className: "text-emerald-300 font-semibold" },
      { text: "(ctx, &redis.XReadGroupArgs{", className: "text-zinc-400" },
    ],
  },
  {
    num: 6,
    type: "code",
    indent: true,
    tokens: [
      { text: "    Group: ", className: "text-zinc-400" },
      { text: '"billing-workers"', className: "text-amber-300" },
      { text: ", Streams: []string{", className: "text-zinc-400" },
      { text: '"jobs:stream"', className: "text-amber-300" },
      { text: ', ">"}, Count: 50,', className: "text-zinc-400" },
    ],
  },
  {
    num: 7,
    type: "code",
    indent: true,
    tokens: [{ text: "})", className: "text-zinc-400" }],
  },
  { num: 8, type: "comment", indent: true, text: "// Grounded: 1,500 jobs/sec with sub-10ms dispatch latency" },
  {
    num: 9,
    type: "code",
    indent: true,
    tokens: [
      { text: "p.workerPool.", className: "text-zinc-400" },
      { text: "Submit", className: "text-teal-300 font-semibold" },
      { text: "(func() { p.executeIdempotentCharge(entries) })", className: "text-zinc-300" },
    ],
  },
  {
    num: 10,
    type: "code",
    tokens: [{ text: "}", className: "text-zinc-400" }],
  },
  { num: 11, type: "empty", text: "" },
];

export interface CodeExplanationItem {
  line: number;
  stepNumber: string;
  stepName: string;
  shortLabel: string;
  title: string;
  type: string;
  explanation: string;
  bullet: string;
  statusBadge: string;
  statusType: "info" | "flag" | "ok";
}

const PROOF_EXPLANATIONS: Record<number, CodeExplanationItem> = {
  4: {
    line: 4,
    stepNumber: "STAGE 1",
    stepName: "Ingest Repository",
    shortLabel: "1. Ingest Repo",
    title: "Raw GitHub CDN Parse",
    type: "Ingestion",
    statusBadge: "Scanned: Go 1.22 · Redis v9 (Streams) · Concurrency Dispatcher",
    statusType: "info",
    explanation:
      "Proof reads your repository manifests and Go source code via raw GitHub CDN without cloning. Detects your real asynchronous worker architecture rather than superficial boilerplate.",
    bullet:
      "Detected true concurrency implementation: asynchronous worker pool consuming Redis stream 'jobs:stream'.",
  },
  5: {
    line: 5,
    stepNumber: "STAGE 2",
    stepName: "Strip AI Fluff",
    shortLabel: "2. Strip AI Fluff",
    title: "Deterministic AST Audit",
    type: "Anti-Hallucination",
    statusBadge: "❌ STRIPPED: 'improved query speed by 40%' (No benchmark harness in repo)",
    statusType: "flag",
    explanation:
      "Generic ChatGPT bullets hallucinate fake 40% performance boosts that get junior and mid devs trapped in technical interviews. Proof strips unmeasured claims and anchors to verifiable Redis Streams offsets.",
    bullet:
      "AI fluff removed. Bounded claim to verifiable Redis stream consumer group offsets without database lock contention.",
  },
  9: {
    line: 9,
    stepNumber: "STAGE 3",
    stepName: "Defend in Interview",
    shortLabel: "3. Defend in Interview",
    title: "Spoken Defense Script",
    type: "Interview Receipt",
    statusBadge: "✓ GROUNDED: 1,500 jobs/sec bounded worker pool (pool.go:L9)",
    statusType: "ok",
    explanation:
      "When the interviewer asks 'Why Redis streams over Kafka?': Explain that Redis Streams provided atomic consumer group offsets with sub-10ms in-memory lookups without Kafka JVM cluster overhead.",
    bullet:
      "Architected asynchronous worker pool in Go using Redis streams, processing 1,500 jobs/sec with sub-10ms dispatch latency.",
  },
};

export interface InteractiveCodeHeroProps {
  badge?: React.ReactNode;
  headline?: React.ReactNode;
  title?: string;
  description?: React.ReactNode;
  subtitle?: string;
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  trustNotes?: React.ReactNode;
  fileName?: string;
  code?: CodeLine[];
  explanations?: Record<number, CodeExplanationItem>;
  activeLines?: number[];
  className?: string;
  ditherProps?: Partial<DitherProps>;
  showDither?: boolean;
}

export function InteractiveCodeHero({
  badge = "Deterministic AST Engine",
  headline,
  title = "Zero-hallucination code extraction.",
  description,
  subtitle = "Proof inspects your repository tree and package manifests, parses the real concurrency primitives, and anchors every bullet to verbatim code lines.",
  primaryAction,
  secondaryAction,
  trustNotes,
  fileName = "pkg/worker/pool.go",
  code = PROOF_DEMO_CODE,
  explanations = PROOF_EXPLANATIONS,
  activeLines = [4, 5, 9],
  className,
  ditherProps,
  showDither = false,
}: InteractiveCodeHeroProps) {
  const [activeLine, setActiveLine] = useState<number>(5);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    const rawText = code.map((c) => c.text ?? c.tokens?.map((t) => t.text).join("") ?? "").join("\n");
    navigator.clipboard.writeText(rawText).catch(() => { });
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <section
      className={cn(
        "relative rounded-3xl border border-white/[0.08] bg-[#07090d]/65 backdrop-blur-xl overflow-hidden p-6 sm:p-8 lg:p-10 shadow-2xl glow-card",
        className
      )}
    >
      {/* Background WebGL2 Dither Canvas */}
      {showDither && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <Dither
            waveColor="#10b981"
            backgroundColor="transparent"
            ditherMode="bayer"
            colorNum={4}
            pixelSize={2}
            waveSpeed={0.035}
            waveFrequency={2.5}
            waveAmplitude={0.2}
            contrast={1.0}
            brightness={-0.15}
            mouseEffect="reveal"
            mouseRadius={0.35}
            mouseStrength={1.2}
            trail={0.35}
            clickRipple={true}
            intro={false}
            {...ditherProps}
          />
        </div>
      )}

      <div className="relative z-10 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left Column: Narrative & CTAs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-4">
            {typeof badge === "string" ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-border text-xs font-mono text-accent shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{badge}</span>
              </div>
            ) : (
              badge
            )}

            {headline ?? (
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-text tracking-tight leading-[1.12]">
                {title}
              </h1>
            )}

            {description ?? (
              <p className="text-sm sm:text-base text-text-dim leading-relaxed max-w-xl font-sans">
                {subtitle}
              </p>
            )}
          </div>

          {/* Action CTAs */}
          {(primaryAction || secondaryAction) && (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {primaryAction && (
                <Button
                  size="lg"
                  variant="primary"
                  onClick={primaryAction.onClick}
                  className="font-mono text-xs shadow-md shadow-accent/15 cursor-pointer"
                >
                  {primaryAction.label}
                </Button>
              )}
              {secondaryAction && (
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={secondaryAction.onClick}
                  className="font-mono text-xs cursor-pointer"
                >
                  {secondaryAction.label}
                </Button>
              )}
            </div>
          )}

          {/* Trust Footprint */}
          {trustNotes && <div className="pt-2">{trustNotes}</div>}
        </div>

        {/* Right Column: Code Terminal */}
        <div className="lg:col-span-6">
          <div className="rounded-xl border border-border bg-[#07090d] shadow-2xl overflow-hidden glow-card">
            {/* Terminal Titlebar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-2/90">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                </div>
                <span className="text-xs font-mono text-text-dim flex items-center gap-1.5 ml-2">
                  <Terminal className="w-3.5 h-3.5 text-accent" />
                  <span>{fileName}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded hover:bg-surface text-text-dim hover:text-text transition cursor-pointer"
                title="Copy snippet"
              >
                {isCopied ? (
                  <Check className="w-3.5 h-3.5 text-accent" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Code Body with Line Highlights */}
            <div className="p-4 font-mono text-xs leading-relaxed overflow-x-auto space-y-0.5 bg-[#07090d]">
              {code.map((line) => {
                const isHighlight = activeLines.includes(line.num);
                const isSelected = activeLine === line.num;
                return (
                  <div
                    key={line.num}
                    onClick={() => isHighlight && setActiveLine(line.num)}
                    className={cn(
                      "flex items-center gap-3 px-2 py-0.5 rounded transition-colors group",
                      isHighlight && "cursor-pointer hover:bg-surface-2",
                      isSelected && "bg-accent/10 border-l-2 border-accent pl-1.5"
                    )}
                  >
                    <span className="w-5 text-right text-text-dim select-none text-[11px]">
                      {line.num}
                    </span>
                    <span className={cn(line.indent && "pl-4", "flex-1")}>
                      {line.type === "comment" && (
                        <span className="text-zinc-400 italic">{line.text}</span>
                      )}
                      {line.type === "code" &&
                        line.tokens?.map((token, idx) => (
                          <span key={`${idx}-${token.text}`} className={token.className}>
                            {token.text}
                          </span>
                        ))}
                      {line.type === "empty" && <span>{"\n"}</span>}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Proof Drawer: Step-by-Step Workflow Explainer */}
            <div className="border-t border-border/80 bg-surface/95 backdrop-blur-sm p-4 space-y-3">
              {/* Workflow Step Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-surface-2/80 rounded-lg border border-border/60">
                {activeLines.map((lineNum) => {
                  const isSelected = activeLine === lineNum;
                  const item = explanations[lineNum];
                  return (
                    <button
                      key={lineNum}
                      type="button"
                      onClick={() => setActiveLine(lineNum)}
                      className={`flex-1 py-1.5 px-2 rounded-md text-xs font-mono transition cursor-pointer text-center ${isSelected
                          ? "bg-bg text-accent font-semibold shadow-xs border border-border/80"
                          : "text-text-dim hover:text-text"
                        }`}
                    >
                      {item?.shortLabel ?? `Step ${lineNum}`}
                    </button>
                  );
                })}
              </div>

              {/* Code-to-Bullet Bridge */}
              <AnimatePresence mode="wait">
                {explanations[activeLine] && (
                  <motion.div
                    key={activeLine}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-2.5 rounded-lg bg-bg/90 border border-border p-3.5"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                          {explanations[activeLine].stepNumber ?? "STEP"}
                        </span>
                        <span className="text-accent font-medium">
                          {explanations[activeLine].stepName ?? `Line ${activeLine}`}
                        </span>
                      </div>
                      <span className="text-text-dim text-[11px] hidden sm:inline">
                        {explanations[activeLine].title}
                      </span>
                    </div>

                    {/* Status Pill */}
                    {explanations[activeLine].statusBadge && (
                      <div
                        className={cn(
                          "px-2.5 py-1.5 rounded text-[11px] font-mono leading-relaxed border",
                          explanations[activeLine].statusType === "flag" &&
                            "bg-red-500/10 text-red-300 border-red-500/25",
                          explanations[activeLine].statusType === "info" &&
                            "bg-cyan-500/10 text-cyan-300 border-cyan-500/25",
                          explanations[activeLine].statusType === "ok" &&
                            "bg-emerald-500/10 text-emerald-300 border-emerald-500/25"
                        )}
                      >
                        {explanations[activeLine].statusBadge}
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-text-dim uppercase tracking-wider">
                        ↳ Output:
                      </div>
                      <p className="text-xs text-text font-medium leading-relaxed font-sans">
                        &ldquo;{explanations[activeLine].bullet}&rdquo;
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border/60 text-xs text-text-dim leading-relaxed font-sans">
                      <span className="text-accent font-mono text-[11px] font-semibold">
                        {activeLine === 9 ? "Spoken Defense Script: " : "How Proof Works: "}
                      </span>
                      {explanations[activeLine].explanation}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
