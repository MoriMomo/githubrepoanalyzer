import { useState } from "react";
import {
  Flame,
  X,
  Send,
  Loader2,
  Lightbulb,
  ShieldAlert,
} from "lucide-react";
import type { Bullet } from "~/../types";
import { usePuterStore } from "~/lib/puter";
import { DEFAULT_AI_OPTIONS } from "~/lib/prompts";
import { extractAIText, parseAIJson, formatErrorMessage } from "~/lib/utils";
import { Button, Badge, Card } from "~/components/ui";

interface MockInterviewModalProps {
  bullet: Bullet;
  model: string;
  onClose: () => void;
}

interface EvaluationResult {
  verdict: "DEFENSIBLE" | "NEEDS REFINEMENT" | "FABRICATION RISK";
  groundingScore: number; // 1-10
  feedback: string;
  coachingTip?: string;
}

export function MockInterviewModal({
  bullet,
  model,
  onClose,
}: MockInterviewModalProps) {
  const { ai } = usePuterStore();
  const [candidateResponse, setCandidateResponse] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [showScript, setShowScript] = useState(false);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateResponse.trim() || isEvaluating) return;

    setIsEvaluating(true);
    setEvalError(null);

    const prompt = `You are a cynical, senior technical interviewer at a top infrastructure company.
You are interviewing a candidate who has this bullet point on their resume:
"${bullet.text}"

You asked them:
"${bullet.defense.question}"

The candidate just replied:
"${candidateResponse}"

EVALUATE the candidate's spoken defense based on strict technical reality:
1. Did they stay grounded in real mechanisms, or did they invent numbers, fake metrics, or buzzwords?
2. Is the response technically coherent and defensible?
3. Assign a verdict: "DEFENSIBLE" (truthful & solid), "NEEDS REFINEMENT" (vague), or "FABRICATION RISK" (invented unmeasured claims).

Return JSON ONLY:
{
  "verdict": "DEFENSIBLE" | "NEEDS REFINEMENT" | "FABRICATION RISK",
  "groundingScore": 8,
  "feedback": "Concise 1-2 sentence feedback on their answer.",
  "coachingTip": "One actionable suggestion to sound more natural and truthful."
}`;

    try {
      const res = await ai.chat(prompt, { ...DEFAULT_AI_OPTIONS, model });
      const rawText = extractAIText(res?.message?.content);
      const parsed = parseAIJson<EvaluationResult>(rawText);
      if (parsed && parsed.verdict) {
        setEvaluation(parsed);
      } else {
        throw new Error("Could not parse interview evaluation response.");
      }
    } catch (err) {
      setEvalError(formatErrorMessage(err));
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="bg-surface border border-border rounded-md max-w-2xl w-full p-5 shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-flag/10 text-flag">
              <Flame className="w-3.5 h-3.5" />
            </span>
            <h3 className="font-display font-semibold text-xs tracking-tight text-text">
              Interviewer Hotseat Simulator
            </h3>
            <Badge variant="neutral" size="sm">
              evaluator: {model}
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

        {/* The Claim Under Test */}
        <Card variant="surface2" padding="sm" className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-dim">
            Resume Claim Under Grilling:
          </span>
          <p className="text-xs text-text font-sans italic">
            &bull; {bullet.text}
          </p>
        </Card>

        {/* The Question */}
        <div className="p-3.5 rounded-md bg-bg border border-border border-l-2 border-l-warn space-y-1">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-warn flex items-center gap-1.5">
            <ShieldAlert className="w-3 h-3" />
            The Interviewer Asks:
          </span>
          <p className="text-xs font-medium text-text">
            &ldquo;{bullet.defense.question}&rdquo;
          </p>
        </div>

        {/* Candidate Response Form */}
        <form onSubmit={handleEvaluate} className="space-y-3">
          <label className="block text-xs font-medium text-text">
            Your Spoken Response (Type what you would say out loud):
          </label>
          <textarea
            value={candidateResponse}
            onChange={(e) => setCandidateResponse(e.target.value)}
            disabled={isEvaluating}
            placeholder="e.g. We chose Redis because... our invalidation strategy relied on..."
            className="w-full h-28 p-3 rounded-md bg-bg border border-border text-xs font-sans text-text placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition resize-none leading-relaxed"
            required
          />

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowScript(!showScript)}
              className="text-xs text-text-dim hover:text-text transition cursor-pointer font-mono text-[11px]"
            >
              {showScript ? "Hide Reference Script" : "Peek at Verifiable Script"}
            </button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!candidateResponse.trim() || isEvaluating}
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="animate-spin h-3.5 w-3.5" />
                  <span>Evaluating Defense...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Evaluate Defense</span>
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Script Peek */}
        {showScript && (
          <div className="p-3 rounded-md bg-surface-2 border border-border text-xs space-y-1">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-ok">
              Verifiable Script Benchmark:
            </span>
            <p className="text-text italic font-sans text-xs">
              &ldquo;{bullet.defense.script}&rdquo;
            </p>
          </div>
        )}

        {evalError && (
          <div className="p-3 rounded-md bg-flag/10 border border-flag/30 text-xs text-flag">
            {evalError}
          </div>
        )}

        {/* Evaluation Result */}
        {evaluation && (
          <Card variant="surface2" padding="md" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge
                variant={
                  evaluation.verdict === "DEFENSIBLE"
                    ? "ok"
                    : evaluation.verdict === "NEEDS REFINEMENT"
                      ? "warn"
                      : "flag"
                }
                size="md"
              >
                Verdict: {evaluation.verdict}
              </Badge>
              <span className="text-xs text-text-dim font-mono">
                Grounding Score: {evaluation.groundingScore}/10
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-text-dim">
                Interviewer Assessment:
              </span>
              <p className="text-xs text-text mt-0.5 leading-relaxed font-sans">
                {evaluation.feedback}
              </p>
            </div>

            {evaluation.coachingTip && (
              <div className="p-2.5 rounded-md bg-accent/10 border border-accent/20 text-xs text-text space-y-0.5">
                <span className="font-semibold text-[11px] text-accent flex items-center gap-1 font-mono">
                  <Lightbulb className="w-3 h-3" />
                  Coaching Tip:
                </span>
                <p className="font-sans leading-relaxed">{evaluation.coachingTip}</p>
              </div>
            )}
          </Card>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-border">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Done Practicing
          </Button>
        </div>
      </div>
    </div>
  );
}
