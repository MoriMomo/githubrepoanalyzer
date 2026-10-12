import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Copy, Check, FileCode2, Cpu, ShieldCheck, Activity, Sparkles, ArrowRight } from 'lucide-react';
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

export interface FeatureProof {
  label: string;
  lines: Array<{ text: string; dim: boolean }>;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  glow: string;
  proof: FeatureProof;
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
    { text: '    Group: ', className: 'text-zinc-500' },
    { text: '"billing-workers"', className: 'text-amber-300' },
    { text: ', Streams: []string{', className: 'text-zinc-500' },
    { text: '"jobs:stream"', className: 'text-amber-300' },
    { text: ', ">"}, Count: 50,', className: 'text-zinc-500' }
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

const PROOF_EXPLANATIONS: Record<number, string> = {
  4: "AST parses Pool.DispatchJobs to ground the 'Distributed Job Queue (Go + Redis)' resume bullet.",
  5: "Discovers Redis XReadGroup consumer group: proves architectural ownership against concurrent locking.",
  9: "Maps worker pool dispatch to verbatim line proof: justifies sub-10ms latency in technical hotseats."
};

const PROOF_FEATURES: FeatureItem[] = [
  {
    id: 'anti-fabrication',
    title: 'Anti-Fabrication Net (§8)',
    description: 'Strict deterministic validation pass. We strip ungrounded numbers or invented benchmarks before you copy — protecting you from senior interviewer traps.',
    icon: ShieldCheck,
    accent: 'text-emerald-400',
    glow: 'group-hover:shadow-[0_0_35px_-5px_rgba(52,211,153,0.2)]',
    proof: {
      label: 'Grounding Verification',
      lines: [
        { text: '✓ Verified source: pkg/worker/pool.go:L42-L78', dim: true },
        { text: '✓ 0.0% Hallucinated metrics permitted', dim: false },
        { text: '↳ Spoken defense script compiled', dim: true }
      ]
    }
  },
  {
    id: 'truth-drill',
    title: 'Socratic Truth Drill',
    description: 'A focused 3-question drill forces you to articulate trade-offs, failure modes, and benchmark baselines long before sitting in the interview hotseat.',
    icon: Terminal,
    accent: 'text-amber-400',
    glow: 'group-hover:shadow-[0_0_35px_-5px_rgba(251,191,36,0.2)]',
    proof: {
      label: 'Hotseat Simulator',
      lines: [
        { text: 'Q: "How did you measure that 10ms dispatch latency?"', dim: true },
        { text: '↳ "Redis XREADGROUP was coupled with buffered channels"', dim: false },
        { text: 'Outcome: Senior Pass (Immediate Hire Signal)', dim: true }
      ]
    }
  },
  {
    id: 'zero-backend',
    title: 'Zero-Infra Client Runtime',
    description: '100% static client-side React Router SPA. Your private code manifests never leave your browser. Zero third-party telemetry, powered by Puter.js KV.',
    icon: Cpu,
    accent: 'text-rose-400',
    glow: 'group-hover:shadow-[0_0_35px_-5px_rgba(251,113,133,0.2)]',
    proof: {
      label: 'Privacy & Storage Engine',
      lines: [
        { text: 'Storage: Browser localStorage + Puter KV', dim: true },
        { text: 'Network: 0 Server DB calls • Zero data retention', dim: false },
        { text: 'Security: Client-side cryptographic isolation', dim: true }
      ]
    }
  }
];




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
  explanations?: Record<number, string>;
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
  techItems,
  fileName = "pkg/worker/pool.go",
  code = PROOF_DEMO_CODE,
  explanations = PROOF_EXPLANATIONS,
  activeLines = [4, 5, 9],
  onActionClick,
  actionLabel = "Try Interactive Demo",
  className,
}: InteractiveCodeHeroProps) {
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    const rawText = code.map(c => c.text ?? c.tokens?.map(t => t.text).join('') ?? '').join('\n');
    navigator.clipboard.writeText(rawText).catch(() => {});
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn("py-6 sm:py-10", className)}
    >
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left Column: Explanations & Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-4">
            {typeof badge === "string" ? (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-border text-xs font-mono text-accent shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{badge}</span>
              </motion.div>
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
              <p className="text-text-dim leading-relaxed text-sm sm:text-base font-sans">
                {subtitle}
              </p>
            )}
          </div>

          {(primaryAction || secondaryAction) && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              {primaryAction && (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto px-6 py-3 text-sm font-bold shadow-md shadow-accent/20 cursor-pointer"
                  onClick={primaryAction.onClick}
                >
                  {primaryAction.label}
                </Button>
              )}
              {secondaryAction && (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-5 py-3 text-sm border-border hover:bg-surface-2 cursor-pointer font-mono"
                  onClick={secondaryAction.onClick}
                >
                  {secondaryAction.label}
                </Button>
              )}
            </div>
          )}

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-mono font-semibold text-text-muted uppercase tracking-wider">
                Interactive Code Line Traceability
              </p>
              <span className="text-[10px] font-mono text-accent">Click line to inspect AST</span>
            </div>

            <div className="space-y-1.5">
              {activeLines.map((lineNum) => {
                const isSelected = activeLine === lineNum;
                return (
                  <motion.button
                    key={lineNum}
                    type="button"
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                    onClick={() => setActiveLine(isSelected ? null : lineNum)}
                    className={`w-full text-left p-2.5 sm:p-3 rounded-lg border transition-all duration-200 group cursor-pointer ${
                      isSelected
                        ? 'bg-surface-3/90 border-accent/40 shadow-sm'
                        : 'bg-surface/50 border-border/70 hover:border-border-strong hover:bg-surface-2/60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`mt-0.5 flex items-center justify-center w-5 h-5 rounded-md border text-[10px] font-mono font-bold shrink-0 transition-colors ${
                          isSelected
                            ? 'border-accent text-accent bg-accent/15'
                            : 'border-border-strong text-text-muted group-hover:text-text-dim'
                        }`}
                      >
                        L{lineNum}
                      </div>
                      <p
                        className={`text-xs font-sans leading-relaxed transition-colors ${
                          isSelected ? 'text-text font-medium' : 'text-text-dim group-hover:text-text'
                        }`}
                      >
                        {explanations[lineNum] ?? `Trace signal on line ${lineNum}`}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {onActionClick && (
            <div className="pt-1">
              <button
                type="button"
                onClick={onActionClick}
                className="inline-flex items-center gap-2 text-xs font-mono text-accent hover:text-accent-glow font-semibold transition cursor-pointer"
              >
                <span>{actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {trustNotes && (
            <div className="text-[11px] font-mono text-text-dim/80 pt-0.5">
              {trustNotes}
            </div>
          )}

        </div>

        {/* Right Column: Code Sandbox Window with Animated Scanner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-6 relative group"
        >
          {/* Subtle Outer Ambient Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 via-teal-500/10 to-transparent rounded-2xl blur-lg opacity-40 group-hover:opacity-75 transition duration-700 pointer-events-none" />

          <div className="relative rounded-xl overflow-hidden bg-[#090b10] border border-border-strong shadow-2xl">
            {/* Window Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-surface-2/90 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1 bg-bg/80 rounded-md border border-border/80 text-xs text-text-dim font-mono">
                  <FileCode2 className="w-3.5 h-3.5 text-accent" />
                  <span>{fileName}</span>
                </div>
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={handleCopy}
                aria-label="Copy demo code"
                className="text-text-muted hover:text-text transition-colors p-1.5 rounded-md hover:bg-surface-3 cursor-pointer"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isCopied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                    >
                      <Check className="w-4 h-4 text-accent" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                    >
                      <Copy className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Code Body */}
            <div className="p-4 sm:p-5 font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto relative select-text">
              {code.map((line, idx) => {
                const isTargetLine = activeLines.includes(line.num);
                const isActive = activeLine === line.num;
                const isDimmed = activeLine !== null && activeLine !== line.num;
                return (
                  <motion.div
                    key={idx}
                    animate={{ opacity: isDimmed ? 0.35 : 1 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => {
                      if (isTargetLine) {
                        setActiveLine(isActive ? null : line.num);
                      }
                    }}
                    className={`flex relative py-0.5 ${
                      isTargetLine ? 'cursor-pointer hover:bg-surface-2/40 rounded transition-colors' : ''
                    }`}
                  >
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          layoutId="active-line-bg"
                          className="absolute inset-y-0 -inset-x-5 bg-accent/[0.09] border-l-2 border-accent pointer-events-none rounded-r"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.18 }}
                        />
                      )}
                    </AnimatePresence>

                    <span
                      className={`w-8 flex-shrink-0 text-right pr-4 select-none relative z-10 font-mono text-xs ${
                        isActive ? 'text-accent font-bold' : isTargetLine ? 'text-text-dim' : 'text-text-muted'
                      }`}
                    >
                      {line.num}
                    </span>

                    <span className={`relative z-10 whitespace-pre ${line.indent ? 'pl-4' : ''}`}>
                      {line.type === 'comment' && (
                        <span className="text-text-muted italic">{line.text}</span>
                      )}
                      {line.type === 'code' &&
                        line.tokens?.map((token, tIdx) => (
                          <span key={tIdx} className={token.className}>
                            {token.text}
                          </span>
                        ))}
                      {line.type === 'empty' && <span>{'\n'}</span>}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Full-Width Verified Systems Strip */}
        {techItems && techItems.length > 0 && (
          <div className="col-span-12 pt-6 sm:pt-8 border-t border-border/50">
            <div className="flex items-center justify-center flex-wrap gap-5 sm:gap-8">
              {techItems.map((tech, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-2 text-text-dim hover:text-text transition-colors select-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                >
                  {tech.icon}
                  <span className="text-xs font-mono font-medium whitespace-nowrap">{tech.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}

// ----------------------------------------------------------------------
// 3. Claims & Proof Features Section
// ----------------------------------------------------------------------
export interface ClaimAndProofFeaturesProps {
  badge?: string;
  title?: string;
  subtitle?: string;
  features?: FeatureItem[];
}

export function ClaimAndProofFeatures({
  badge = "The Technical Safeguards",
  title = "Engineered for technical hotseats.",
  subtitle = "We didn't build another generic resume AI to generate padded fluff. We built it to enforce strict mechanical boundaries between claims, measurements, and verifiable git proof.",
  features = PROOF_FEATURES,
}: ClaimAndProofFeaturesProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="py-12 md:py-20"
    >
      <div className="max-w-5xl mx-auto space-y-12 w-full">
        <div className="space-y-3.5 max-w-2xl text-left">
          {badge && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-border text-xs font-mono text-accent">
              <Activity className="w-3.5 h-3.5" />
              <span>{badge}</span>
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-text tracking-tight">
            {title}
          </h2>
          <p className="text-text-dim text-sm sm:text-base leading-relaxed font-sans">
            {subtitle}
          </p>
        </div>

        <div className="space-y-4">
          {features.map((feature, fIdx) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: fIdx * 0.1 }}
              onMouseEnter={() => setHoveredId(feature.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`group relative flex flex-col md:flex-row items-stretch bg-surface border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-border-strong hover:bg-surface-2/80 ${feature.glow}`}
            >
              {/* Feature Description Left Half */}
              <div className="flex-1 p-6 md:p-8 flex flex-col justify-center relative z-10">
                <div className="flex items-center gap-3.5 mb-3.5">
                  <div
                    className={`p-2.5 rounded-lg bg-surface-2 border border-border ${feature.accent} transition-transform duration-300 group-hover:scale-105`}
                  >
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-display font-semibold text-text">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-text-dim text-xs sm:text-sm leading-relaxed max-w-md font-sans">
                  {feature.description}
                </p>
              </div>

              {/* Feature Proof Terminal Right Half */}
              <div className="md:w-80 border-t md:border-t-0 md:border-l border-border bg-[#090b10] relative overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-2/80">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-text-muted font-bold">
                    {feature.proof.label}
                  </span>
                  <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <div className="w-1.5 h-1.5 rounded-full bg-border-strong" />
                    <div className="w-1.5 h-1.5 rounded-full bg-border-strong" />
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-center font-mono text-xs leading-relaxed relative min-h-[110px]">
                  {/* Subtle Placeholder Bars */}
                  <div className="absolute inset-4 flex flex-col justify-center transition-opacity duration-300 opacity-100 group-hover:opacity-0">
                    <div className="h-2 w-3/4 bg-border/60 rounded mb-2.5" />
                    <div className="h-2 w-1/2 bg-border/60 rounded mb-2.5" />
                    <div className="h-2 w-5/6 bg-border/60 rounded" />
                  </div>

                  {/* Active Diagnostics Lines */}
                  <div className="relative z-10 transition-all duration-300 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 space-y-1">
                    {feature.proof.lines.map((line, idx) => (
                      <motion.div
                        key={idx}
                        className={`whitespace-pre text-[11px] ${
                          line.dim ? 'text-text-muted' : feature.accent
                        }`}
                      >
                        {line.text}
                      </motion.div>
                    ))}
                  </div>

                  {/* Animated Scanner Beam */}
                  <AnimatePresence>
                    {hoveredId === feature.id && (
                      <motion.div
                        initial={{ top: 0, opacity: 0 }}
                        animate={{ top: '100%', opacity: [0, 0.7, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.4, ease: 'linear', repeat: Infinity }}
                        className="absolute left-0 right-0 h-8 bg-gradient-to-b from-transparent via-accent/15 to-transparent pointer-events-none"
                        style={{ borderBottom: '1px solid rgba(16, 185, 129, 0.25)' }}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// ----------------------------------------------------------------------
// 4. Combined Component
// ----------------------------------------------------------------------
export interface DevToolLandingPageProps {
  interactiveHero?: InteractiveCodeHeroProps;
  claimsAndProof?: ClaimAndProofFeaturesProps;
}

export function Component({ interactiveHero, claimsAndProof }: DevToolLandingPageProps = {}) {
  return (
    <div className="text-text selection:bg-accent/30 space-y-12">
      <InteractiveCodeHero {...interactiveHero} />
      <ClaimAndProofFeatures {...claimsAndProof} />
    </div>
  );
}

export const DevToolLandingPage = Component;

export default Component;
