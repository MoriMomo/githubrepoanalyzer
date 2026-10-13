import { useState } from "react";
import {
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Trash2,
  Zap,
} from "lucide-react";
import type { TruthDrillQuestion, Claim } from "~/types";
import { Button, Badge, Card } from "~/components/ui";

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
        finalAnswers[q.claimId] =
          customText[q.claimId]?.trim() || "Custom architectural trade-off specified";
      } else if (choice) {
        finalAnswers[q.claimId] = choice;
      } else {
        finalAnswers[q.claimId] = "Metric omitted — not measured";
      }
    }

    onSubmit(finalAnswers);
  };

  const answeredCount = Object.keys(selectedChoices).length;
  const progressPct =
    questions.length > 0
      ? Math.round((answeredCount / questions.length) * 100)
      : 100;

  return (
    <div className="rounded-xl border border-border bg-surface p-5 sm:p-6 space-y-6 glow-card top-highlight">
      {/* Header with Progress Tracker */}
      <div className="border-b border-border pb-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="warn" size="sm">
              <HelpCircle className="w-3 h-3" />
              <span>Ground Truth Drill</span>
            </Badge>
            <span className="text-xs font-mono text-text-dim">
              {questions.length} critical question{questions.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-text-dim">
            <span>Progress: {answeredCount} / {questions.length}</span>
            <div className="w-20 h-1.5 rounded-full bg-surface-2 border border-border overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-display font-bold text-base sm:text-lg text-text tracking-tight">
            Lock Down Your Verifiable Technical Trade-Offs
          </h3>
          <p className="text-xs text-text-dim leading-relaxed font-sans pt-0.5">
            Senior interviewers challenge arbitrary metrics within 10 seconds. Select the actual pattern you implemented in 1 click, or tag template boilerplate to purge ungrounded claims before bullets are synthesized.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((q, idx) => {
          const matchedClaim = claims.find((c) => c.id === q.claimId);
          const currentChoice = selectedChoices[q.claimId];
          const isOther = currentChoice === "__OTHER__";

          return (
            <Card
              key={q.claimId}
              variant="surface2"
              padding="md"
              className="truth-drill-question-card space-y-3.5 rounded-lg border-border"
            >
              {/* Question Header */}
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-md bg-accent/15 text-accent text-xs font-mono font-bold flex items-center justify-center mt-0.5 border border-accent/30 shadow-xs">
                  {idx + 1}
                </span>
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-semibold text-text leading-snug">
                    {q.question}
                  </h4>
                  {matchedClaim && (
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-text-dim">
                      <span className="text-accent/80 font-medium">Target Claim:</span>
                      <span className="text-text italic bg-bg/50 px-1.5 py-0.5 rounded border border-border truncate max-w-md">
                        {matchedClaim.text}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Scaffolded Option Cards */}
              <div className="space-y-2 pt-1 pl-0 sm:pl-9">
                {q.options?.map((opt) => {
                  const isSelected = currentChoice === opt;
                  const isBoilerplateOpt =
                    opt.includes("[D]") ||
                    opt.toLowerCase().includes("boilerplate") ||
                    opt.toLowerCase().includes("did not implement");

                  // Extract letter prefix if present (e.g. "[A]")
                  const prefixMatch = opt.match(/^\[([A-Z])\]/);
                  const letter = prefixMatch ? prefixMatch[1] : null;
                  const cleanText = letter ? opt.replace(/^\[[A-Z]\]\s*/, "") : opt;

                  return (
                    <label
                      key={opt}
                      className={`flex items-start gap-3 p-3 rounded-lg border text-xs cursor-pointer transition select-none ${
                        isSelected
                          ? isBoilerplateOpt
                            ? "bg-flag/15 border-flag/60 text-text shadow-sm"
                            : "bg-accent/10 border-accent/60 text-text shadow-sm"
                          : isBoilerplateOpt
                            ? "bg-surface border-border hover:border-flag/40 text-text-dim hover:text-text hover:bg-surface-2"
                            : "bg-surface border-border hover:border-accent/40 text-text-dim hover:text-text hover:bg-surface-2"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question_${q.claimId}`}
                        checked={isSelected}
                        onChange={() => handleSelectChoice(q.claimId, opt)}
                        className={`mt-0.5 shrink-0 cursor-pointer ${
                          isBoilerplateOpt ? "text-flag focus:ring-flag" : "text-accent focus:ring-accent"
                        }`}
                      />

                      <div className="flex-1 flex flex-wrap items-center justify-between gap-2 min-w-0">
                        <span className="leading-relaxed font-sans font-normal text-text">
                          {letter && (
                            <span className="font-mono font-bold text-accent mr-1.5">
                              [{letter}]
                            </span>
                          )}
                          {cleanText}
                        </span>

                        {isBoilerplateOpt && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-flag bg-flag/10 px-1.5 py-0.5 rounded border border-flag/25 shrink-0">
                            <Trash2 className="w-2.5 h-2.5" />
                            <span>Purge Boilerplate</span>
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}

                {/* Option: Other (Custom trade-off) */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-lg border text-xs cursor-pointer transition select-none ${
                    isOther
                      ? "bg-accent/10 border-accent/60 text-text"
                      : "bg-surface border-border hover:border-slate-600 text-text-dim hover:text-text hover:bg-surface-2"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question_${q.claimId}`}
                    checked={isOther}
                    onChange={() => handleSelectChoice(q.claimId, "__OTHER__")}
                    className="mt-0.5 text-accent focus:ring-accent cursor-pointer"
                  />
                  <div className="flex-1 space-y-2">
                    <span className="font-sans font-normal text-text block">
                      Other / Type custom architectural details
                    </span>
                    {isOther && (
                      <div className="pt-1">
                        <textarea
                          value={customText[q.claimId] || ""}
                          onChange={(e) => handleCustomChange(q.claimId, e.target.value)}
                          placeholder="Describe the real trade-off or mechanism you implemented in 1-2 sentences..."
                          rows={2}
                          className="w-full p-2.5 rounded-md bg-bg border border-border text-xs font-mono text-text placeholder:text-text-dim focus:outline-none focus:ring-1 focus:ring-accent leading-relaxed"
                        />
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </Card>
          );
        })}

        {/* Bottom Action Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-[11px] text-text-dim font-mono">
            <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
            <span>Unanswered questions default to defensible qualitative phrasing.</span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isLoading}
            className="shadow-md shadow-accent/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing Defensible Bullets...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Synthesize Bullets & Defense Playbook</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
