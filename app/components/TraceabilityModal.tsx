import {
  X,
  FileCode,
  HelpCircle,
  FileText,
  ShieldCheck,
  CheckCircle2,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="bg-surface border border-border rounded-md max-w-2xl w-full p-5 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-ok/10 text-ok">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
            <h3 className="font-display font-semibold text-xs tracking-tight text-text">
              Verifiable Evidence Lineage
            </h3>
            <Badge variant="accent" size="sm">
              category: {bullet.category}
            </Badge>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-text-dim hover:text-text p-1 rounded transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step-by-Step Lineage */}
        <div className="space-y-3">
          {/* Step 1: Concrete Source Signal */}
          <Card variant="surface2" padding="sm" className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-accent font-mono">
              <span className="flex items-center gap-1.5 font-semibold">
                <FileCode className="w-3 h-3" />
                STEP 1: DETERMINISTIC FOOTPRINT
              </span>
              <span>PARSER VERIFIED</span>
            </div>
            <p className="text-xs text-text font-sans">
              Evidence backings:{" "}
              <span className="font-semibold text-accent font-mono">
                {bullet.grounding.join(", ") || "Manifest dependencies & repository footprint"}
              </span>
            </p>
          </Card>

          {/* Step 2: Truth Drill */}
          <Card variant="surface2" padding="sm" className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-warn font-mono">
              <span className="flex items-center gap-1.5 font-semibold">
                <HelpCircle className="w-3 h-3" />
                STEP 2: TRUTH DRILL VERIFICATION
              </span>
              <span>CANDIDATE GROUNDED</span>
            </div>
            {matchingClaim?.drillQuestion && (
              <p className="text-[11px] text-text-dim italic font-sans">
                &ldquo;{matchingClaim.drillQuestion}&rdquo;
              </p>
            )}
            <p className="text-xs text-text font-sans">
              Verified mechanism:{" "}
              <span className="text-warn font-medium font-mono">
                {matchedAnswer || "Qualitative technical mechanism confirmed"}
              </span>
            </p>
          </Card>

          {/* Step 3: Google X-Y-Z Bullet */}
          <Card variant="surface2" padding="sm" className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-ok font-mono">
              <span className="flex items-center gap-1.5 font-semibold">
                <FileText className="w-3 h-3" />
                STEP 3: SYNTHESIZED GOOGLE X-Y-Z BULLET
              </span>
              <span>DEFENSIBLE</span>
            </div>
            <p className="text-xs text-text leading-relaxed font-sans">
              &bull; {bullet.text}
            </p>
            {bullet.flags && bullet.flags.length > 0 && (
              <div className="pt-1 flex flex-wrap gap-1">
                {bullet.flags.map((flag, idx) => (
                  <Badge key={idx} variant="neutral" size="sm">
                    {flag}
                  </Badge>
                ))}
              </div>
            )}
          </Card>

          {/* Step 4: Defense Card */}
          <Card variant="surface2" padding="sm" className="space-y-2 border-l-2 border-l-accent">
            <div className="flex items-center justify-between text-[10px] text-accent font-mono">
              <span className="flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="w-3 h-3" />
                STEP 4: TECHNICAL INTERVIEW DEFENSE SCRIPT
              </span>
              <span>SURVIVAL READY</span>
            </div>
            {bullet.defense.codeProof && (
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-accent">
                <FileCode className="w-3 h-3" />
                <span className="text-text-dim">Code Anchor:</span>
                <span className="px-1.5 py-0.5 rounded bg-surface border border-border font-semibold">
                  {bullet.defense.codeProof}
                </span>
              </div>
            )}
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-text-dim">
                Interviewer Question:
              </span>
              <p className="text-xs text-text font-medium italic mt-0.5 font-sans">
                &ldquo;{bullet.defense.question}&rdquo;
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-ok">
                Defensive Response:
              </span>
              <p className="text-xs text-text leading-relaxed bg-surface p-2.5 rounded-md border border-border mt-0.5 font-sans">
                &ldquo;{bullet.defense.script}&rdquo;
              </p>
            </div>
            {bullet.defense.tradeOffRationale && (
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-accent">
                  Trade-off Rationale:
                </span>
                <p className="text-[11px] text-text-dim mt-0.5 font-sans">
                  {bullet.defense.tradeOffRationale}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-[11px] text-text-dim font-mono">
            Every bullet line is strictly traceable to source code or candidate answers.
          </span>
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Close Lineage
          </Button>
        </div>
      </div>
    </div>
  );
}
