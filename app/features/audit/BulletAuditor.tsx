import { useState } from "react";
import {
  Scale,
  AlertOctagon,
  CheckCircle2,
} from "lucide-react";
import { auditBulletRisk, type BulletAuditReport } from "~/lib/grounding";
import type { Bullet } from "~/types";
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
    <Card variant="default" padding="lg" className="space-y-4.5 shadow-xs">
      <div className="border-b border-border pb-3.5 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-md bg-warn/15 text-warn border border-warn/30">
            <Scale className="w-4 h-4" />
          </span>
          <h3 className="font-display font-bold text-sm tracking-tight text-text">
            Interview Risk Auditor (Before vs. After)
          </h3>
          <Badge variant="warn" size="sm">
            Live Diagnostic
          </Badge>
        </div>
        <p className="text-xs text-text-dim font-sans leading-relaxed">
          Paste an existing bullet you previously wrote or generated. Proof evaluates why cynical senior interviewers challenge it and contrasts it with a defensible alternative.
        </p>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-text">
          Audit Candidate Resume Bullet:
        </label>
        <textarea
          value={candidateBullet}
          onChange={(e) => handleAudit(e.target.value)}
          placeholder="Paste an existing resume bullet here to audit its interview defensibility..."
          className="w-full h-22 p-3.5 rounded-lg bg-bg border border-border text-xs font-mono text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition resize-none leading-relaxed"
        />
      </div>

      {/* Audit Report */}
      {report && (
        <div className="space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-surface-2 border border-border">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-text-dim font-mono font-medium">
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
              <span>Fluff Words: <span className="text-flag font-semibold">{report.fluffHits.length}</span></span>
              <span>Ungrounded Metrics: <span className="text-warn font-semibold">{report.ungroundedHits.length}</span></span>
            </div>
          </div>

          <p className="text-xs text-text leading-relaxed bg-bg p-3.5 rounded-lg border border-border font-sans">
            {report.diagnosis}
          </p>

          {/* Side-by-side comparison with a recommended bullet */}
          {recommendedBullets.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              <div className="p-3.5 rounded-lg bg-flag/5 border border-flag/30 space-y-2">
                <span className="text-xs font-semibold text-flag flex items-center gap-1.5 font-sans">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  Vulnerable (Generic AI Claim)
                </span>
                <p className="text-xs text-text leading-relaxed italic font-sans">
                  &ldquo;{candidateBullet}&rdquo;
                </p>
                <div className="text-[11px] text-flag/90 pt-1 font-sans leading-relaxed border-t border-flag/20">
                  Senior challenge: &ldquo;How did you measure that metric? Show me your benchmark harness.&rdquo;
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-ok/5 border border-ok/30 space-y-2">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 font-sans">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Defensible (Proof Replacement)
                </span>
                <p className="text-xs text-text leading-relaxed font-sans font-medium">
                  &bull; {recommendedBullets[0].text}
                </p>
                <div className="text-[11px] text-emerald-400/90 pt-1 font-sans leading-relaxed border-t border-ok/20">
                  Verifiable defense: &ldquo;{recommendedBullets[0].defense.script}&rdquo;
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
