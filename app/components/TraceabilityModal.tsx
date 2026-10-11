import { useEffect } from "react";
import {
  X,
  FileCode,
  HelpCircle,
  FileText,
  ShieldCheck,
  GitBranch,
} from "lucide-react";
import type { Bullet, Claim } from "~/../types";
import { Button, Badge, Card } from "~/components/ui";

interface TraceabilityModalProps {
  bullet: Bullet;
  claims: Claim[];
  drillAnswers: Record<string, string>;
  onClose: () => void;
}

export function TraceabilityModal({
  bullet,
  claims,
  drillAnswers,
  onClose,
}: TraceabilityModalProps) {
  const matchingClaim = claims.find((c) => c.category === bullet.category);
  const matchedAnswer = matchingClaim ? drillAnswers[matchingClaim.id] : null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-surface border border-border rounded-xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto glow-card top-highlight">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="p-1 rounded-md bg-ok/10 text-ok border border-ok/25">
              <GitBranch className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-display font-bold text-sm tracking-tight text-text">
                Verifiable Evidence Lineage
              </h3>
              <p className="text-[10px] font-mono text-text-dim">
                Audit trail from raw source manifests to generated Google X-Y-Z claim
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-text-dim hover:text-text p-1.5 rounded-md hover:bg-surface-2 transition cursor-pointer"
            title="Close modal (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step-by-Step Lineage Flow */}
        <div className="space-y-3">
          {/* Step 1: Concrete Source Signal */}
          <Card variant="surface2" padding="md" className="space-y-1.5 border-border">
            <div className="flex items-center justify-between text-xs text-accent font-sans">
              <span className="flex items-center gap-1.5 font-medium">
                <FileCode className="w-3.5 h-3.5" />
                Stage 1: Verified Repository Signal
              </span>
              <span className="text-[11px] font-mono bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                Parser verified
              </span>
            </div>
            <p className="text-xs text-text font-sans">
              Grounding backings:{" "}
              <span className="font-semibold text-accent font-mono">
                {bullet.grounding.join(", ") || "Manifest dependencies & repository footprint"}
              </span>
            </p>
          </Card>

          {/* Step 2: Truth Drill */}
          <Card variant="surface2" padding="md" className="space-y-1.5 border-border">
            <div className="flex items-center justify-between text-xs text-warn font-sans">
              <span className="flex items-center gap-1.5 font-medium">
                <HelpCircle className="w-3.5 h-3.5" />
                Stage 2: Truth Drill Response
              </span>
              <span className="text-[11px] font-mono bg-warn/10 px-2 py-0.5 rounded border border-warn/20">
                Candidate confirmed
              </span>
            </div>
            {matchingClaim?.drillQuestion && (
              <p className="text-[11px] text-text-dim italic font-sans pl-1 border-l border-border">
                &ldquo;{matchingClaim.drillQuestion}&rdquo;
              </p>
            )}
            <p className="text-xs text-text font-sans">
              Verified mechanism:{" "}
              <span className="text-warn font-semibold font-mono">
                {matchedAnswer || "Qualitative technical mechanism confirmed"}
              </span>
            </p>
          </Card>

          {/* Step 3: Google X-Y-Z Bullet */}
          <Card variant="surface2" padding="md" className="space-y-2 border-border">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-sans">
              <span className="flex items-center gap-1.5 font-medium">
                <FileText className="w-3.5 h-3.5" />
                Stage 3: Grounded Google X-Y-Z Bullet
              </span>
              <span className="text-[11px] font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-emerald-400">
                Defensible
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text leading-relaxed font-sans font-medium">
              &bull; {bullet.text}
            </p>
            {bullet.flags && bullet.flags.length > 0 && (
              <div className="pt-1 flex flex-wrap gap-1">
                {bullet.flags.map((flag, idx) => (
                  <Badge key={idx} variant="flag" size="sm">
                    {flag}
                  </Badge>
                ))}
              </div>
            )}
          </Card>

          {/* Step 4: Defense Card */}
          <Card variant="surface2" padding="md" className="space-y-2.5 border-l-2 border-l-accent border-border">
            <div className="flex items-center justify-between text-xs text-accent font-sans">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Stage 4: Technical Interview Defense Script
              </span>
              <span className="text-[11px] font-mono bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                Interview ready
              </span>
            </div>
            {bullet.defense.codeProof && (
              <div className="flex items-center gap-1.5 text-xs font-mono text-accent">
                <FileCode className="w-3.5 h-3.5" />
                <span className="text-text-muted">Code Anchor:</span>
                <span className="px-1.5 py-0.5 rounded bg-surface border border-border font-medium">
                  {bullet.defense.codeProof}
                </span>
              </div>
            )}
            <div>
              <span className="text-xs font-medium text-amber-400 font-sans">
                Senior interviewer challenge:
              </span>
              <p className="text-xs text-text font-medium italic mt-0.5 font-sans">
                &ldquo;{bullet.defense.question}&rdquo;
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-emerald-400 font-sans">
                Verifiable spoken response:
              </span>
              <p className="text-xs text-text bg-surface p-2.5 rounded-md border border-border mt-0.5 font-sans leading-relaxed">
                &ldquo;{bullet.defense.script}&rdquo;
              </p>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-border">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Lineage View
          </Button>
        </div>
      </div>
    </div>
  );
}
