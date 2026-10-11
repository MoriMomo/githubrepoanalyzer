import { useState, useRef } from "react";
import {
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import type { TruthDrillQuestion, Claim } from "~/../types";
import { Button, Badge, Card } from "~/components/ui";
import { useGSAP, staggerFadeUp } from "~/lib/gsap";

interface TruthDrillProps {
  questions: TruthDrillQuestion[];
  claims: Claim[];
  onSubmit: (answers: Record<string, string>) => void;
  isLoading: boolean;
}

export function TruthDrill({
  questions,
  claims,
  onSubmit,
  isLoading,
}: TruthDrillProps) {
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({});
  const [customText, setCustomText] = useState<Record<string, string>>({});
  const drillFormRef = useRef<HTMLFormElement>(null);

  // GSAP animation: Stagger in Truth Drill questions smoothly
  useGSAP(
    () => {
      staggerFadeUp(".truth-drill-question-card", {
        stagger: 0.07,
        duration: 0.32,
        y: 10,
      });
    },
    [questions.length],
    drillFormRef,
  );

  const handleSelectChoice = (claimId: string, choice: string) => {
    setSelectedChoices((prev) => ({ ...prev, [claimId]: choice }));
  };

  const handleCustomChange = (claimId: string, text: string) => {
    setCustomText((prev) => ({ ...prev, [claimId]: text }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const finalAnswers: Record<string, string> = {};
    for (const q of questions) {
      const choice = selectedChoices[q.claimId];
      if (choice === "__OTHER__") {
        finalAnswers[q.claimId] = customText[q.claimId]?.trim() || "No custom detail specified";
      } else if (choice) {
        finalAnswers[q.claimId] = choice;
      } else {
        finalAnswers[q.claimId] = "Metric omitted — not measured";
      }
    }

    onSubmit(finalAnswers);
  };

  return (
    <div className="rounded-md border border-border bg-surface p-5 space-y-5">
      <div className="border-b border-border pb-4 space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="warn" size="sm">
            <HelpCircle className="w-3 h-3" />
            <span>Ground Truth Drill</span>
          </Badge>
          <span className="text-xs font-mono text-text-dim">
            {questions.length} critical question{questions.length === 1 ? "" : "s"}
          </span>
        </div>
        <h3 className="font-display font-semibold text-base text-text">
          Lock Down Your Verifiable Technical Trade-Offs
        </h3>
        <p className="text-xs text-text-dim leading-relaxed">
          Technical interviewers press for receipts when numbers smell arbitrary. Select your real architectural pattern in 1 click, or tag template boilerplate to purge unverified claims before bullets are generated.
        </p>
      </div>

      <form ref={drillFormRef} onSubmit={handleSubmit} className="space-y-5">
        {questions.map((q, idx) => {
          const matchedClaim = claims.find((c) => c.id === q.claimId);
          const currentChoice = selectedChoices[q.claimId];
          const isOther = currentChoice === "__OTHER__";
          const isBoilerplateSelected =
            currentChoice &&
            (currentChoice.includes("[D]") ||
              currentChoice.toLowerCase().includes("template boilerplate") ||
              currentChoice.toLowerCase().includes("did not implement"));

          return (
            <Card
              key={q.claimId}
              variant="surface2"
              padding="sm"
              className="truth-drill-question-card space-y-3"
            >
              <div className="flex items-start gap-2.5">
                <span className="shrink-0 w-5 h-5 rounded-full bg-accent/15 text-accent text-[11px] font-mono font-semibold flex items-center justify-center mt-0.5 border border-accent/30">
                  {idx + 1}
                </span>
                <div className="space-y-1">
                  <h4 className="text-xs font-medium text-text">
                    {q.question}
                  </h4>
                  {matchedClaim && (
                    <p className="text-[11px] text-text-dim font-mono">
                      Target Claim: <span className="text-text italic">{matchedClaim.text}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Scaffolded Options */}
              <div className="space-y-2 pt-1 pl-7">
                {q.options?.map((opt) => {
                  const isSelected = currentChoice === opt;
                  const isBoilerplateOpt =
                    opt.includes("[D]") ||
                    opt.toLowerCase().includes("boilerplate") ||
                    opt.toLowerCase().includes("did not implement");

                  return (
                    <label
                      key={opt}
                      className={`flex items-start gap-2.5 p-2.5 rounded-md border text-xs cursor-pointer transition select-none ${
                        isSelected
                          ? isBoilerplateOpt
                            ? "bg-flag/15 border-flag/50 text-text"
                            : "bg-accent/10 border-accent/50 text-text"
                          : isBoilerplateOpt
                            ? "bg-surface border-border/80 text-text-dim hover:text-text hover:border-flag/40"
                            : "bg-surface border-border text-text-dim hover:text-text hover:border-slate-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question_${q.claimId}`}
                        checked={isSelected}
                        onChange={() => handleSelectChoice(q.claimId, opt)}
                        className={`mt-0.5 cursor-pointer ${
                          isBoilerplateOpt ? "text-flag focus:ring-flag" : "text-accent focus:ring-accent"
                        }`}
                      />
                      <div className="flex-1 flex items-start justify-between gap-2">
                        <span>{opt}</span>
                        {isBoilerplateOpt && (
                          <Badge variant="flag" size="sm" className="shrink-0 text-[10px]">
                            <Trash2 className="w-2.5 h-2.5 mr-0.5" />
                            Purge Boilerplate
                          </Badge>
                        )}
                      </div>
                    </label>
                  );
                })}

                {/* Boilerplate Selected Feedback Banner */}
                {isBoilerplateSelected && (
                  <div className="p-2.5 rounded-md bg-flag/10 border border-flag/30 text-xs text-flag flex items-start gap-2 animate-fade-in">
                    <Trash2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      <span className="font-semibold">Boilerplate Discard Active:</span> This claim will be completely omitted from your synthesized resume bullets, shielding you from interview questions about skeleton/cloned code you did not author.
                    </p>
                  </div>
                )}

                {/* Other option for custom specifics */}
                <label
                  className={`flex items-start gap-2.5 p-2.5 rounded-md border text-xs cursor-pointer transition select-none ${
                    isOther
                      ? "bg-accent/10 border-accent/50 text-text"
                      : "bg-surface border-border text-text-dim hover:text-text hover:border-slate-600"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question_${q.claimId}`}
                    checked={isOther}
                    onChange={() => handleSelectChoice(q.claimId, "__OTHER__")}
                    className="mt-0.5 text-accent focus:ring-accent cursor-pointer"
                  />
                  <span>Other (Type custom implementation specifics)</span>
                </label>

                {isOther && (
                  <div className="pt-1.5 pl-6">
                    <input
                      type="text"
                      value={customText[q.claimId] || ""}
                      onChange={(e) => handleCustomChange(q.claimId, e.target.value)}
                      placeholder="e.g. Cached user session JSON with a 1-hour Redis TTL..."
                      className="w-full px-3 py-2 rounded-md bg-bg border border-border text-xs font-mono text-text placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                      required={isOther}
                    />
                  </div>
                )}
              </div>
            </Card>
          );
        })}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
          <p className="text-[11px] text-text-dim font-mono flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-warn" />
            <span>Unanswered questions default to defensible qualitative phrasing (no ungrounded metrics).</span>
          </p>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-3.5 w-3.5" />
                <span>Synthesizing & Auditing Bullets...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Synthesize Bullets & Defense Cards</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
