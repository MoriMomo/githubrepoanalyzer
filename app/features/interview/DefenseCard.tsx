import { useState } from "react";
import {
  ShieldAlert,
  MessageSquareCode,
  FileCode,
  Scale,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";
import type { BulletDefense } from "~/types";
import { MotionView, Tooltip } from "~/components/ui";

interface DefenseCardProps {
  defense: BulletDefense;
}

export function DefenseCard({ defense }: DefenseCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  const handleCopyScript = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(defense.script);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="rounded-lg bg-surface-2/60 border border-border border-l-2 border-l-accent overflow-hidden text-xs shadow-xs transition-colors hover:border-border-strong">
      {/* Header bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-surface-2/40 hover:bg-surface-2 text-left transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-sans text-xs font-semibold text-text">
            <ShieldAlert className="w-3.5 h-3.5 text-accent" />
            <span>Interview Defense Playbook</span>
          </span>
          {defense.codeProof && (
            <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface border border-border text-[11px] font-mono text-text-dim">
              <FileCode className="w-2.5 h-2.5 text-accent" />
              <span>{defense.codeProof}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-dim hover:text-text font-sans">
          <span>{isOpen ? "Hide defense" : "Inspect defense playbook"}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isOpen && (
        <MotionView animationKey="defense-pane" className="p-3.5 space-y-3.5 border-t border-border bg-surface/40">
          {/* Code Proof Lineage Anchor */}
          {defense.codeProof && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-md bg-surface-2/80 border border-border">
              <div className="flex items-center gap-2 font-mono text-xs">
                <FileCode className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="text-text-muted">Code anchor:</span>
                <span className="px-1.5 py-0.5 rounded bg-surface border border-border text-accent font-medium">
                  {defense.codeProof}
                </span>
              </div>
              <span className="text-[11px] text-text-muted font-mono hidden sm:inline">
                Verifiable code location for interview defense
              </span>
            </div>
          )}

          {/* Anticipated Interviewer Question */}
          <div className="space-y-1">
            <span className="text-xs font-medium text-amber-400 flex items-center gap-1.5">
              Senior interviewer challenge:
            </span>
            <div className="p-2.5 rounded-md bg-surface-2/60 border border-border text-text font-medium italic text-xs leading-relaxed font-sans">
              &ldquo;{defense.question}&rdquo;
            </div>
          </div>

          {/* Spoken Defense Script with 1-Click Copy */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <MessageSquareCode className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">
                  Verifiable spoken response:
                </span>
              </div>
              <Tooltip content="Copy ready-to-speak interview defense answer" side="left">
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-surface hover:bg-surface-3 border border-border text-[11px] font-sans text-text-dim hover:text-text transition-colors cursor-pointer"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-3 h-3 text-ok" />
                      <span className="text-ok">Copied script</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy spoken response</span>
                    </>
                  )}
                </button>
              </Tooltip>
            </div>
            <div className="p-2.5 rounded-md bg-surface-2/60 border border-border text-xs leading-relaxed font-sans text-text">
              &ldquo;{defense.script}&rdquo;
            </div>
          </div>

          {/* Trade-off Rationale */}
          {defense.tradeOffRationale && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-info" />
                <span className="text-xs font-medium text-info">
                  Architectural trade-off:
                </span>
              </div>
              <div className="p-2.5 rounded-md bg-surface-2/40 border border-border text-xs leading-relaxed font-sans text-text-dim">
                {defense.tradeOffRationale}
              </div>
            </div>
          )}
        </MotionView>
      )}
    </div>
  );
}
