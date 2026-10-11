import { useState } from "react";
import {
  Copy,
  Check,
  GitBranch,
  ShieldAlert,
  Edit3,
  AlertTriangle,
} from "lucide-react";
import type { Bullet, Claim } from "~/../types";
import { MODEL } from "~/lib/prompts";
import { DefenseCard } from "./DefenseCard";
import { TraceabilityModal } from "./TraceabilityModal";
import { MockInterviewModal } from "./MockInterviewModal";
import { extractMetricTokens, normalize } from "~/lib/grounding";
import { Button, Badge, Card } from "~/components/ui";

interface BulletCardProps {
  bullet: Bullet;
  claims?: Claim[];
  drillAnswers?: Record<string, string>;
  activeModel?: string;
  groundedCorpus?: string;
  onUpdateBullet?: (updatedBullet: Bullet) => void;
}

const CATEGORY_META = {
  systems: {
    label: "Systems & Data Flow",
    variant: "accent" as const,
  },
  api: {
    label: "API & Business Logic",
    variant: "default" as const,
  },
  reliability: {
    label: "Reliability & DX",
    variant: "ok" as const,
  },
};

export function BulletCard({
  bullet,
  claims = [],
  drillAnswers = {},
  activeModel = MODEL,
  groundedCorpus = "",
  onUpdateBullet,
}: BulletCardProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(bullet.text);
  const [showTraceModal, setShowTraceModal] = useState(false);
  const [showMockModal, setShowMockModal] = useState(false);

  const meta = CATEGORY_META[bullet.category] || {
    label: bullet.category,
    variant: "default" as const,
  };

  // Real-time live grounding check while editing
  const liveTokens = extractMetricTokens(editText);
  const normalizedCorpus = groundedCorpus.toLowerCase().replace(/\s+/g, " ");
  const compactCorpus = normalize(groundedCorpus);

  const ungroundedInEdit = liveTokens.filter((token) => {
    const normToken = normalize(token);
    const tokenLower = token.toLowerCase();
    const isPresent =
      normalizedCorpus.includes(tokenLower) ||
      compactCorpus.includes(normToken);
    return !isPresent;
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bullet.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleSaveEdit = () => {
    if (!editText.trim()) return;

    let updatedFlags = [...(bullet.flags || [])];
    if (ungroundedInEdit.length > 0) {
      updatedFlags = [
        ...updatedFlags,
        `warning: edit contains ungrounded ${ungroundedInEdit.join(", ")}`,
      ];
    }

    onUpdateBullet?.({
      ...bullet,
      text: editText.trim(),
      flags: updatedFlags,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(bullet.text);
    setIsEditing(false);
  };

  return (
    <>
      <Card
        variant="default"
        padding="md"
        className="space-y-4 hover:border-slate-700/80 transition-colors"
      >
        {/* Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <Badge variant={meta.variant} size="md">
            <span>{meta.label}</span>
          </Badge>

          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowTraceModal(true)}
              title="Inspect verifiable evidence lineage"
            >
              <GitBranch className="w-3 h-3 text-accent" />
              <span>Trace Lineage</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowMockModal(true)}
              className="border-warn/40 text-warn hover:bg-warn/10"
              title="Practice defending this bullet against senior interview questions"
            >
              <ShieldAlert className="w-3 h-3" />
              <span>Practice Defense</span>
            </Button>

            {onUpdateBullet && !isEditing && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </Button>
            )}

            <Button
              type="button"
              variant={copied ? "primary" : "secondary"}
              size="sm"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-bg" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-text-dim" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Bullet Content or Inline Linter Editor */}
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-3 rounded-md bg-bg border border-accent text-xs font-mono text-text focus:outline-none focus:ring-2 focus:ring-accent resize-none h-24 leading-relaxed"
            />

            {/* Real-time live grounding warning */}
            {ungroundedInEdit.length > 0 && (
              <div className="p-3 rounded-md bg-flag/10 border border-flag/30 text-xs text-flag space-y-1">
                <span className="font-semibold flex items-center gap-1.5 font-mono">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Anti-Fabrication Alert
                </span>
                <p className="font-sans text-[11px] leading-relaxed">
                  The metric token{ungroundedInEdit.length > 1 ? "s" : ""}{" "}
                  <span className="font-mono font-bold underline">
                    {ungroundedInEdit.join(", ")}
                  </span>{" "}
                  cannot be traced to your source files or Truth Drill answers. Interviewers will challenge ungrounded metrics.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSaveEdit}
              >
                Save Bullet
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-md bg-bg border border-border text-xs leading-relaxed text-text font-sans">
            <span className="text-accent font-bold mr-1.5">&bull;</span>
            {bullet.text}
          </div>
        )}

        {/* Traceability & Grounding Badges */}
        <div className="space-y-2">
          {bullet.grounding && bullet.grounding.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-text-dim font-mono text-[10px] uppercase tracking-wider">
                Evidence Lineage:
              </span>
              {bullet.grounding.map((g, i) => (
                <Badge key={i} variant="neutral" size="sm">
                  {g}
                </Badge>
              ))}
            </div>
          )}

          {/* Anti-fabrication Audit Flags */}
          {bullet.flags && bullet.flags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              {bullet.flags.map((flag, idx) => {
                const isRemoved = flag.includes("removed") || flag.includes("omitted");
                const isWarning = flag.includes("warning");
                return (
                  <Badge
                    key={idx}
                    variant={isRemoved || isWarning ? "flag" : "neutral"}
                    size="sm"
                  >
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>{flag}</span>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        {/* Integrated Defense Card */}
        <DefenseCard defense={bullet.defense} />
      </Card>

      {/* Modals */}
      {showTraceModal && (
        <TraceabilityModal
          bullet={bullet}
          claims={claims}
          drillAnswers={drillAnswers}
          onClose={() => setShowTraceModal(false)}
        />
      )}

      {showMockModal && (
        <MockInterviewModal
          bullet={bullet}
          model={activeModel}
          onClose={() => setShowMockModal(false)}
        />
      )}
    </>
  );
}
