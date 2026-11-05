import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  GitBranch,
  Cpu,
  HelpCircle,
  ShieldCheck,
  Check,
  ArrowRight,
  Terminal,
  Sparkles,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface PipelineStageData {
  id: string;
  stageNum: string;
  title: string;
  tag: string;
  description: string;
  bullet: string;
  codeSnippet: string;
  simulatedOutput: string;
  icon: typeof GitBranch;
  accentHex: string;
  badgeClass: string;
}

const STAGES: PipelineStageData[] = [
  {
    id: "stage-01",
    stageNum: "STAGE 01",
    title: "Ingestion & Manifests",
    tag: "CDN Manifest Ingestion",
    description:
      "Paste your README or link a public GitHub repo. Proof reads package manifests via raw CDN without cloning.",
    bullet: "Zero auth needed for public repos",
    codeSnippet: "GET /contents/package.json",
    simulatedOutput: "HTTP 200 OK · 1.4KB manifests parsed",
    icon: GitBranch,
    accentHex: "#06b6d4",
    badgeClass: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  },
  {
    id: "stage-02",
    stageNum: "STAGE 02",
    title: "Deterministic Parsing",
    tag: "AST & Dependency Signatures",
    description:
      "Deterministic AST parsers extract real architectural signals: databases, worker pools, cache layers, and message brokers.",
    bullet: "Discovers Docker, Redis, Prisma, Kafka",
    codeSnippet: "SIGNALS: redis/v9 · pgx/v5 · docker",
    simulatedOutput: "AST: Bounded stream consumer group identified",
    icon: Cpu,
    accentHex: "#06b6d4",
    badgeClass: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  },
  {
    id: "stage-03",
    stageNum: "STAGE 03",
    title: "Ground Truth Drill",
    tag: "Socratic Interview Engine",
    description:
      "A Socratic drill prompts you on the real trade-offs: failure modes, rate limits, concurrency bounds, and boilerplate purges.",
    bullet: "Prepares spoken defense rationale",
    codeSnippet: "Why Redis Streams over Kafka?",
    simulatedOutput: "Atomic consumer offsets without JVM overhead",
    icon: HelpCircle,
    accentHex: "#f59e0b",
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  {
    id: "stage-04",
    stageNum: "STAGE 04",
    title: "Grounded Synthesis",
    tag: "Defensible Engineering Bullets",
    description:
      "Synthesizes defensible engineering bullets with exact source line citations, verifiable proof anchors, and spoken defense scripts.",
    bullet: "Deterministic AST validation",
    codeSnippet: "RECEIPT: pkg/worker/pool.go#L4-L10",
    simulatedOutput: "VERIFIED: Lineage stamped to pool.go:L4-L10",
    icon: ShieldCheck,
    accentHex: "#10b981",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
];

export function ScrollPipelineDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinWrapperRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const beamsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (!containerRef.current || !pinWrapperRef.current) return;

    // Use gsap.context for bulletproof cleanup in React
    const ctx = gsap.context(() => {
      const isDesktop = window.innerWidth >= 1024;

      if (!isDesktop) {
        // Mobile fallback: simple reveal on enter without scroll pinning
        cardsRef.current.forEach((card, i) => {
          if (!card) return;
          gsap.fromTo(
            card,
            { opacity: 0.5, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              scrollTrigger: {
                trigger: card,
                start: "top 80%",
                toggleActions: "play none none reverse",
              },
            }
          );
        });
        return;
      }

      // Desktop: Pinned interactive scrub timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          pin: pinWrapperRef.current,
          start: "top 15%",
          end: "+=1200",
          scrub: 0.6,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            setScrollProgress(Math.round(p * 100));

            // Determine active stage based on progress
            if (p < 0.25) setActiveStageIndex(0);
            else if (p < 0.5) setActiveStageIndex(1);
            else if (p < 0.75) setActiveStageIndex(2);
            else setActiveStageIndex(3);
          },
        },
      });

      // Animate progress bar scrubber
      if (progressBarRef.current) {
        tl.to(
          progressBarRef.current,
          {
            scaleX: 1,
            ease: "none",
          },
          0
        );
      }

      // Stage 1 -> 2 transition
      if (cardsRef.current[0]) {
        tl.to(cardsRef.current[0], { borderColor: "#06b6d4", scale: 1.02, duration: 0.2 }, 0);
      }
      if (beamsRef.current[0]) {
        tl.to(beamsRef.current[0], { scaleX: 1, opacity: 1, duration: 0.2 }, 0.15);
      }

      // Stage 2 -> 3 transition
      if (cardsRef.current[1]) {
        tl.to(cardsRef.current[1], { borderColor: "#06b6d4", scale: 1.02, duration: 0.2 }, 0.25);
      }
      if (beamsRef.current[1]) {
        tl.to(beamsRef.current[1], { scaleX: 1, opacity: 1, duration: 0.2 }, 0.4);
      }

      // Stage 3 -> 4 transition
      if (cardsRef.current[2]) {
        tl.to(cardsRef.current[2], { borderColor: "#f59e0b", scale: 1.02, duration: 0.2 }, 0.5);
      }
      if (beamsRef.current[2]) {
        tl.to(beamsRef.current[2], { scaleX: 1, opacity: 1, duration: 0.2 }, 0.65);
      }

      // Stage 4 completion
      if (cardsRef.current[3]) {
        tl.to(cardsRef.current[3], { borderColor: "#10b981", scale: 1.03, duration: 0.2 }, 0.75);
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div ref={pinWrapperRef} className="w-full space-y-6 py-6">
        {/* Scrubber Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-mono text-zinc-300 font-medium">
              LIVE GSAP SCRUBBER:{" "}
              <span className="text-accent uppercase">
                {STAGES[activeStageIndex].stageNum} · {STAGES[activeStageIndex].title}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="hidden sm:inline">Scroll to simulate:</span>
            <span className="text-accent font-bold px-2 py-0.5 rounded bg-surface-2 border border-border">
              {scrollProgress}% COMPLETE
            </span>
          </div>
        </div>

        {/* Global Progress Track Line */}
        <div className="relative h-1 w-full rounded-full bg-white/5 overflow-hidden">
          <div
            ref={progressBarRef}
            className="h-full bg-gradient-to-r from-cyan-500 via-amber-500 to-emerald-500 origin-left"
            style={{ transform: "scaleX(0)" }}
          />
        </div>

        {/* 4 Cards Grid with Connecting Laser Beams */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 relative pt-2">
          {STAGES.map((stage, idx) => {
            const isActive = activeStageIndex === idx;
            const isCompleted = activeStageIndex > idx;
            const Icon = stage.icon;

            return (
              <div key={stage.id} className="relative flex flex-col">
                <div
                  ref={(el) => {
                    cardsRef.current[idx] = el;
                  }}
                  onClick={() => setActiveStageIndex(idx)}
                  className={`h-full p-4 sm:p-5 rounded-xl border transition-all duration-300 flex flex-col justify-between space-y-4 cursor-pointer select-none ${
                    isActive
                      ? "bg-surface/90 shadow-xl"
                      : isCompleted
                      ? "bg-surface/60 border-white/10"
                      : "bg-surface/40 border-white/5 opacity-60"
                  }`}
                  style={{
                    borderColor: isActive ? stage.accentHex : undefined,
                    boxShadow: isActive ? `0 0 25px -5px ${stage.accentHex}33` : undefined,
                  }}
                >
                  <div className="space-y-3">
                    {/* Header Row */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                      <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded border ${stage.badgeClass}`}>
                        {stage.stageNum}
                      </span>
                      <Icon className="w-4 h-4 text-zinc-400" style={{ color: isActive ? stage.accentHex : undefined }} />
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-display font-semibold text-sm text-text">
                        {stage.title}
                      </h3>
                      <p className="text-xs text-zinc-400 font-sans leading-relaxed mt-1">
                        {stage.description}
                      </p>
                    </div>

                    {/* Interactive Code Chip */}
                    <div className="p-2.5 rounded-lg bg-black/60 border border-white/5 font-mono text-[11px] space-y-1">
                      <div className="text-zinc-400 truncate text-[10px]">
                        {stage.codeSnippet}
                      </div>
                      <div
                        className="text-[10px] font-semibold truncate transition-colors duration-200"
                        style={{ color: isActive ? stage.accentHex : "#71717a" }}
                      >
                        ↳ {stage.simulatedOutput}
                      </div>
                    </div>
                  </div>

                  {/* Footer status */}
                  <div className="pt-2.5 text-[10px] font-mono border-t border-white/5 flex items-center justify-between">
                    <span className="text-zinc-400">&bull; {stage.bullet}</span>
                    {isCompleted && (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>DONE</span>
                      </span>
                    )}
                    {isActive && (
                      <span className="animate-pulse font-bold" style={{ color: stage.accentHex }}>
                        ACTIVE
                      </span>
                    )}
                  </div>
                </div>

                {/* Connecting Arrow / Laser Beam for Desktop (only between cards) */}
                {idx < STAGES.length - 1 && (
                  <div
                    className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-[#0a0d14] border border-white/10 items-center justify-center text-xs shadow-md pointer-events-none"
                    aria-hidden="true"
                  >
                    <div
                      ref={(el) => {
                        beamsRef.current[idx] = el;
                      }}
                      className="w-full h-full rounded-full flex items-center justify-center transition-opacity origin-left"
                      style={{
                        transform: "scaleX(0)",
                        color: stage.accentHex,
                      }}
                    >
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
