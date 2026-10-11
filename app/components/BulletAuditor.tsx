import { useState } from "react";
import {
  Scale,
  AlertOctagon,
  CheckCircle2,
} from "lucide-react";
import { auditBulletRisk, type BulletAuditReport } from "~/lib/grounding";
import type { Bullet } from "~/../types";
import { Badge, Card } from "~/components/ui";

interface BulletAuditorProps {
  groundedCorpus: string;
  recommendedBullets: Bullet[];
}

export function BulletAuditor({
  groundedCorpus,
  recommendedBullets,
}: BulletAuditorProps) {
  const [candidateBullet, setCandidateBullet] = useState(
    "Spearheaded database optimization with Redis caching, increasing query speeds by 40% and handling 10k requests/sec.",
  );
  const [report, setReport] = useState<BulletAuditReport | null>(() =>
    auditBulletRisk(
      "Spearheaded database optimization with Redis caching, increasing query speeds by 40% and handling 10k requests/sec.",
      groundedCorpus,
    ),
  );

  const handleAudit = (text: string) => {
    setCandidateBullet(text);
    if (text.trim()) {
      setReport(auditBulletRisk(text, groundedCorpus));
    } else {
      setReport(null);
    }
  };

  return (
    <Card variant="default" padding="md" className="space-y-4">
      <div className="border-b border-border pb-3 space-y-1">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-warn/10 text-warn">
            <Scale className="w-3.5 h-3.5" />
          </span>
          <h3 className="font-display font-semibold text-xs tracking-tight text-text">
            Interview Risk Auditor (Before vs. After)
          </h3>
        </div>
        <p className="text-xs text-text-dim font-sans">
          Paste an existing bullet you previously wrote or generated. Proof evaluates why senior interviewers challenge it and contrasts it with a defensible alternative.
        </p>
      </div>

      {/* Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-text">
          Audit Candidate Resume Bullet:
        </label>
        <textarea
          value={candidateBullet}
          onChange={(e) => handleAudit(e.target.value)}
          placeholder="Paste an existing resume bullet here to audit its interview defensibility..."
          className="w-full h-20 p-3 rounded-md bg-bg border border-border text-xs font-sans text-text placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition resize-none leading-relaxed"
        />
      </div>

      {/* Audit Report */}
      {report && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-md bg-surface-2 border border-border">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-text-dim font-mono">
                Risk Assessment:
              </span>
              <Badge
                variant={
                  report.riskLevel === "CRITICAL"
                    ? "flag"
                    : report.riskLevel === "MODERATE"
                      ? "warn"
                      : "ok"
                }
                size="sm"
              >
                {report.riskLevel} RISK
              </Badge>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono text-text-dim">
              <span>Fluff Words: {report.fluffHits.length}</span>
              <span>Ungrounded Metrics: {report.ungroundedHits.length}</span>
            </div>
          </div>

          <p className="text-xs text-text leading-relaxed bg-bg p-3 rounded-md border border-border font-sans">
            {report.diagnosis}
          </p>

          {/* Side-by-side comparison with a recommended bullet */}
          {recommendedBullets.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-md bg-flag/5 border border-flag/30 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-flag flex items-center gap-1.5">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  Vulnerable (Old Generic Bullet)
                </span>
                <p className="text-xs text-text leading-relaxed italic font-sans">
                  &ldquo;{candidateBullet}&rdquo;
                </p>
                <div className="text-[11px] text-flag pt-1 font-mono">
                  &bull; Senior interviewer challenge: &ldquo;How did you measure that metric? Show me your benchmark harness.&rdquo;
                </div>
              </div>

              <div className="p-3.5 rounded-md bg-ok/5 border border-ok/30 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ok flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Defensible (Proof Replacement)
                </span>
                <p className="text-xs text-text leading-relaxed font-sans font-medium">
                  &bull; {recommendedBullets[0].text}
                </p>
                <div className="text-[11px] text-ok pt-1 font-mono">
                  &bull; Verifiable defense script: &ldquo;{recommendedBullets[0].defense.script}&rdquo;
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
