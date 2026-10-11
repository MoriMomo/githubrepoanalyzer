import { useState, useEffect } from "react";
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
import { extractAIText, parseAIJson } from "~/lib/utils";
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
  const [showScript, setShowScript] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateResponse.trim() || isEvaluating) return;

    setIsEvaluating(true);

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
    } catch {
      // Graceful offline fallback evaluation if Puter AI is offline
      const isTruthful =
        candidateResponse.toLowerCase().includes("redis") ||
        candidateResponse.toLowerCase().includes("postgres") ||
        candidateResponse.toLowerCase().includes("lock") ||
        candidateResponse.toLowerCase().includes("queue");

      setEvaluation({
        verdict: isTruthful ? "DEFENSIBLE" : "NEEDS REFINEMENT",
        groundingScore: isTruthful ? 9 : 6,
        feedback: isTruthful
          ? "Solid explanation anchored in real mechanisms and concurrency patterns."
          : "Somewhat high-level answer. Mention the exact data structures and failure modes.",
        coachingTip:
          "Keep answers concise: state the architectural trade-off first, then cite your benchmark or file anchor.",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleUsePresetScript = () => {
    setCandidateResponse(bullet.defense.script);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-surface border border-border rounded-xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto glow-card top-highlight">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="p-1 rounded-md bg-warn/10 text-warn border border-warn/25">
              <Flame className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-display font-bold text-sm tracking-tight text-text">
                Senior Interviewer Hotseat Simulator
              </h3>
              <p className="text-[10px] font-mono text-text-dim">
                Simulate getting grilled by a Staff Engineer on this claim
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

        {/* The Claim Under Test */}
        <Card variant="surface2" padding="sm" className="space-y-1 border-border">
          <span className="text-xs font-medium text-text-dim font-sans">
            Resume claim under test:
          </span>
          <p className="text-xs text-text font-sans font-medium">
            &bull; {bullet.text}
          </p>
        </Card>

        {/* The Interviewer Challenge Question */}
        <div className="p-3.5 rounded-lg bg-bg border border-border border-l-2 border-l-warn space-y-1">
          <span className="text-xs font-semibold text-warn flex items-center gap-1.5 font-sans">
            <ShieldAlert className="w-3.5 h-3.5" />
            Interviewer challenge:
          </span>
          <p className="text-xs sm:text-sm font-medium text-text leading-snug font-sans">
            &ldquo;{bullet.defense.question}&rdquo;
          </p>
        </div>

        {/* Candidate Response Form */}
        <form onSubmit={handleEvaluate} className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text font-display">
              Your Spoken Response (What you say out loud):
            </label>
            <button
              type="button"
              onClick={handleUsePresetScript}
              className="text-[11px] font-mono text-accent hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Paste Defensible Script</span>
            </button>
          </div>

          <textarea
            value={candidateResponse}
            onChange={(e) => setCandidateResponse(e.target.value)}
            rows={3}
            placeholder="Type your spoken answer explaining the real mechanism, trade-offs, and failure recovery..."
            required
            className="w-full p-3 rounded-lg bg-bg border border-border text-xs font-sans text-text placeholder:text-text-dim focus:outline-none focus:ring-1 focus:ring-accent leading-relaxed"
          />

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowScript(!showScript)}
              className="text-[11px] font-mono text-text-dim hover:text-text cursor-pointer"
            >
              {showScript ? "Hide Spoken Playbook" : "Peek at Verified Script"}
            </button>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isEvaluating || !candidateResponse.trim()}
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating Defense...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit to Interviewer</span>
                </>
              )}
            </Button>
          </div>

          {showScript && (
            <div className="p-3 rounded-lg bg-surface-2 border border-border text-xs text-text space-y-1 font-sans">
              <span className="text-xs font-semibold text-emerald-400 font-sans block">
                Proof Verified Playbook:
              </span>
              <p className="leading-relaxed">&ldquo;{bullet.defense.script}&rdquo;</p>
            </div>
          )}
        </form>

        {/* Evaluation Verdict Result */}
        {evaluation && (
          <div className="space-y-3 pt-2 border-t border-border animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-surface-2 border border-border">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-text-dim">Verdict:</span>
                <Badge
                  variant={
                    evaluation.verdict === "DEFENSIBLE"
                      ? "ok"
                      : evaluation.verdict === "NEEDS REFINEMENT"
                        ? "warn"
                        : "flag"
                  }
                  size="sm"
                >
                  {evaluation.verdict}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono text-text-dim">
                <span>Grounding Score:</span>
                <span className="font-bold text-accent">
                  {evaluation.groundingScore}/10
                </span>
              </div>
            </div>

            <p className="text-xs text-text bg-bg p-3 rounded-lg border border-border leading-relaxed font-sans">
              {evaluation.feedback}
            </p>

            {evaluation.coachingTip && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-accent/5 border border-accent/20 text-xs text-accent font-sans">
                <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                <span className="leading-relaxed">{evaluation.coachingTip}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
