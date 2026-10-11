import { useState, useRef } from "react";
import { ShieldAlert, MessageSquareCode, FileCode, Scale, ChevronDown, ChevronUp } from "lucide-react";
import type { BulletDefense } from "~/../types";
import { useGSAP, fadeIn } from "~/lib/gsap";

interface DefenseCardProps {
  defense: BulletDefense;
}

export function DefenseCard({ defense }: DefenseCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // GSAP micro-animation for expanding defense script
  useGSAP(
    () => {
      if (isOpen) {
        fadeIn(".defense-content-pane", { duration: 0.22 });
      }
    },
    [isOpen],
    contentRef,
  );

  return (
    <div className="rounded-md bg-surface-2/90 border border-border border-l-2 border-l-accent overflow-hidden text-xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-surface-2 hover:bg-surface text-left transition cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 font-mono text-[11px] font-semibold tracking-wide text-accent">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>INTERVIEW DEFENSE SCRIPT</span>
          </span>
          {defense.codeProof && (
            <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] font-mono text-text-dim">
              <FileCode className="w-2.5 h-2.5 text-accent" />
              <span>{defense.codeProof}</span>
            </span>
          )}
        </div>
        <span className="flex items-center gap-1.5 text-[11px] text-text-dim font-mono">
          <span>{isOpen ? "Hide" : "Expand"}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </span>
      </button>

      {isOpen && (
        <div ref={contentRef} className="defense-content-pane p-3.5 space-y-3.5 border-t border-border">
          {/* Code Proof Lineage Anchor */}
          {defense.codeProof && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-md bg-surface border border-border">
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <FileCode className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="text-text-dim font-medium">Code Proof Anchor:</span>
                <span className="px-1.5 py-0.5 rounded bg-surface-2 border border-border text-accent font-semibold">
                  {defense.codeProof}
                </span>
              </div>
              <span className="text-[10px] text-text-dim font-mono">
                Mental anchor for: &ldquo;Where in code is this handled?&rdquo;
              </span>
            </div>
          )}

          <div>
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-text-dim">
              Anticipated Senior Interviewer Challenge:
            </span>
            <p className="text-text font-medium mt-1 pl-2 border-l border-slate-700 italic">
              &ldquo;{defense.question}&rdquo;
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <MessageSquareCode className="w-3 h-3 text-ok" />
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-ok">
                Verifiable Spoken Defense (What to Say Out Loud):
              </span>
            </div>
            <p className="text-text bg-surface p-3 rounded-md border border-border text-xs leading-relaxed font-sans font-normal">
              &ldquo;{defense.script}&rdquo;
            </p>
          </div>

          {/* Trade-off Rationale */}
          {defense.tradeOffRationale && (
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Scale className="w-3 h-3 text-accent" />
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-accent">
                  Architectural Trade-Off Justification:
                </span>
              </div>
              <p className="text-text-dim bg-surface/60 p-2.5 rounded-md border border-border text-[11px] leading-relaxed font-sans">
                {defense.tradeOffRationale}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
