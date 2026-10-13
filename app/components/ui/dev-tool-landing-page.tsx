import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Copy, Check, Sparkles } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { cn } from '~/lib/utils';

// ----------------------------------------------------------------------
// 1. Data Structures & Types
// ----------------------------------------------------------------------
export interface CodeLine {
  num: number;
  type: 'code' | 'comment' | 'empty';
  indent?: boolean;
  text?: string;
  tokens?: Array<{ text: string; className: string }>;
}

const PROOF_DEMO_CODE: CodeLine[] = [
  { num: 1, type: 'comment', text: '// Real codebase: pkg/worker/pool.go (Redis Stream Worker)' },
  { num: 2, type: 'comment', text: '// Proof AST engine extracts verifiable concurrency signals' },
  { num: 3, type: 'empty', text: '' },
  { num: 4, type: 'code', tokens: [
    { text: 'func ', className: 'text-rose-400' },
    { text: '(p *Pool) ', className: 'text-amber-300' },
    { text: 'DispatchJobs', className: 'text-emerald-400 font-bold' },
    { text: '(ctx context.Context) error {', className: 'text-zinc-300' }
  ]},
  { num: 5, type: 'code', indent: true, tokens: [
    { text: 'entries, err := p.redis.', className: 'text-zinc-400' },
    { text: 'XReadGroup', className: 'text-emerald-300 font-semibold' },
    { text: '(ctx, &redis.XReadGroupArgs{', className: 'text-zinc-400' }
  ]},
  { num: 6, type: 'code', indent: true, tokens: [
    { text: '    Group: ', className: 'text-zinc-400' },
    { text: '"billing-workers"', className: 'text-amber-300' },
    { text: ', Streams: []string{', className: 'text-zinc-400' },
    { text: '"jobs:stream"', className: 'text-amber-300' },
    { text: ', ">"}, Count: 50,', className: 'text-zinc-400' }
  ]},
  { num: 7, type: 'code', indent: true, tokens: [
    { text: '})', className: 'text-zinc-400' }
  ]},
  { num: 8, type: 'comment', indent: true, text: '// Grounded: 1,500 jobs/sec with sub-10ms dispatch latency' },
  { num: 9, type: 'code', indent: true, tokens: [
    { text: 'p.workerPool.', className: 'text-zinc-400' },
    { text: 'Submit', className: 'text-teal-300 font-semibold' },
    { text: '(func() { p.executeIdempotentCharge(entries) })', className: 'text-zinc-300' }
  ]},
  { num: 10, type: 'code', tokens: [
    { text: '}', className: 'text-zinc-400' }
  ]},
  { num: 11, type: 'empty', text: '' },
];

export interface CodeExplanationItem {
  line: number;
  shortLabel: string;
  title: string;
  type: string;
  explanation: string;
  bullet: string;
}

const PROOF_EXPLANATIONS: Record<number, CodeExplanationItem> = {
  4: {
    line: 4,
    shortLabel: "Worker Dispatcher",
    title: "func DispatchJobs",
    type: "Architecture",
    explanation: "Detects your asynchronous dispatcher. Proves you designed system architecture rather than superficial glue code.",
    bullet: "Architected asynchronous worker pool in Go using Redis streams, processing 1,500 jobs/sec with sub-10ms dispatch latency."
  },
  5: {
    line: 5,
    shortLabel: "Redis Streams",
    title: "redis.XReadGroup",
    type: "Stream Consumer",
    explanation: "Extracts consumer groups and stream offsets. Proves you handled concurrent worker locking and prevented database bottlenecks during traffic spikes.",
    bullet: "Integrated Redis Streams consumer groups to distribute worker payloads without database lock contention."
  },
  9: {
    line: 9,
    shortLabel: "Goroutine Pool",
    title: "workerPool.Submit",
    type: "Goroutine Pool",
    explanation: "Validates bounded worker dispatch with idempotent task execution. Defends your latency numbers against senior interviewer scrutiny.",
    bullet: "Implemented bounded goroutine worker pool with idempotent charge retry semantics."
  }
};

// ----------------------------------------------------------------------
// 2. Interactive Code Walkthrough Section
// ----------------------------------------------------------------------
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
  techItems?: Array<{
    icon: React.ReactNode;
    title: string;
  }>;
  fileName?: string;
  code?: CodeLine[];
  explanations?: Record<number, CodeExplanationItem>;
  activeLines?: number[];
  onActionClick?: () => void;
  actionLabel?: string;
  className?: string;
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
}: InteractiveCodeHeroProps) {
  const [activeLine, setActiveLine] = useState<number>(5);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    const rawText = code.map(c => c.text ?? c.tokens?.map(t => t.text).join('') ?? '').join('\n');
    navigator.clipboard.writeText(rawText).catch(() => {});
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <section className={cn("py-6 sm:py-10", className)}>
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left Column: Focused Pure Narrative & CTAs (Anti-Slop) */}
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

            {headline ? (
              headline
            ) : (
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-text tracking-tight leading-[1.12]">
                {title}
              </h1>
            )}

            {description ? (
              description
            ) : (
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

        {/* Right Column: Mechanical Code Terminal */}
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
                      {line.type === 'comment' && (
                        <span className="text-zinc-400 italic">{line.text}</span>
                      )}
                      {line.type === 'code' &&
                        line.tokens?.map((token, idx) => (
                          <span key={idx} className={token.className}>
                            {token.text}
                          </span>
                        ))}
                      {line.type === 'empty' && <span>{'\n'}</span>}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Integrated Plain-English Proof Drawer */}
            <div className="border-t border-border/80 bg-surface/95 backdrop-blur-sm p-4 space-y-3">
              {/* Clean Segment Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-surface-2/80 rounded-lg border border-border/60">
                {activeLines.map((lineNum) => {
                  const isSelected = activeLine === lineNum;
                  const item = explanations[lineNum];
                  return (
                    <button
                      key={lineNum}
                      type="button"
                      onClick={() => setActiveLine(lineNum)}
                      className={`flex-1 py-1.5 px-2 rounded-md text-xs font-mono transition cursor-pointer text-center ${
                        isSelected
                          ? 'bg-bg text-accent font-semibold shadow-xs border border-border/80'
                          : 'text-text-dim hover:text-text'
                      }`}
                    >
                      {item?.shortLabel ?? `Line ${lineNum}`}
                    </button>
                  );
                })}
              </div>

              {/* Direct Code-to-Bullet Bridge */}
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
                      <span className="text-accent font-medium">
                        pkg/worker/pool.go:L{activeLine}
                      </span>
                      <span className="text-text-dim text-[11px]">
                        {explanations[activeLine].title}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] font-mono text-text-dim uppercase tracking-wider">
                        ↳ Synthesized Resume Bullet:
                      </div>
                      <p className="text-xs text-text font-medium leading-relaxed font-sans">
                        &ldquo;{explanations[activeLine].bullet}&rdquo;
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border/60 text-xs text-text-dim leading-relaxed font-sans">
                      <span className="text-accent font-mono text-[11px] font-semibold">Defense Script: </span>
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
