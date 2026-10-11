import { useState } from "react";
import {
  Copy,
  Check,
  GitBranch,
  Edit3,
  AlertTriangle,
  Flame,
  CheckCircle2,
} from "lucide-react";
import type { Bullet, Claim } from "~/../types";
import { MODEL } from "~/lib/prompts";
import { DefenseCard } from "./DefenseCard";
import { TraceabilityModal } from "./TraceabilityModal";
import { MockInterviewModal } from "./MockInterviewModal";
import { extractMetricTokens, normalize } from "~/lib/grounding";
import { Button, Badge, Card, Tooltip } from "~/components/ui";

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
    badgeVariant: "accent" as const,
  },
  api: {
    label: "API & Business Logic",
    badgeVariant: "default" as const,
  },
  reliability: {
    label: "Reliability & DX",
    badgeVariant: "ok" as const,
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
    badgeVariant: "default" as const,
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
        padding="lg"
        className="space-y-4 rounded-xl border-border hover:border-border-strong transition-all glow-card top-highlight"
      >
        {/* Header Row: Category Badge + Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Badge variant={meta.badgeVariant} size="md">
              <span>{meta.label}</span>
            </Badge>
            <span className="text-[11px] font-mono text-accent/80 hidden sm:inline">
              Google X-Y-Z Standard
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Tooltip content="Inspect cryptographic HMAC hashes and source evidence lineage">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTraceModal(true)}
              >
                <GitBranch className="w-3.5 h-3.5 text-accent" />
                <span>Trace Lineage</span>
              </Button>
            </Tooltip>

            <Tooltip content="Practice defending this bullet against senior staff engineer grilling">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowMockModal(true)}
                className="border-warn/40 text-warn hover:bg-warn/10 hover:border-warn"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Practice Defense</span>
              </Button>
            </Tooltip>

            <Tooltip content="Edit bullet text with live deterministic grounding validation">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? "Cancel" : "Edit"}</span>
              </Button>
            </Tooltip>

            <Tooltip content="Copy bullet to clipboard (Google X-Y-Z standard)">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCopy}
                className="font-mono text-[11px]"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-ok" />
                    <span className="text-ok">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Bullet Statement Body */}
        {isEditing ? (
          <div className="space-y-3 p-3.5 rounded-lg bg-surface-2 border border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-text-dim font-sans">
                Live grounding editor
              </label>
              {ungroundedInEdit.length > 0 ? (
                <span className="text-[10px] font-mono text-flag bg-flag/10 px-2 py-0.5 rounded border border-flag/30 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Warning: ungrounded metric detected ({ungroundedInEdit.join(", ")})</span>
                </span>
              ) : (
                <span className="text-[10px] font-mono text-ok bg-ok/10 px-2 py-0.5 rounded border border-ok/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Grounding Net Satisfied</span>
                </span>
              )}
            </div>

            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-md bg-bg border border-border text-xs font-sans text-text placeholder:text-text-dim focus:outline-none focus:ring-1 focus:ring-accent leading-relaxed"
            />

            <div className="flex items-center justify-end gap-2 pt-1">
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
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
              <p className="text-xs sm:text-sm font-sans font-medium text-text leading-relaxed">
                {bullet.text}
              </p>
            </div>

            {/* Evidence & Omission Flags Line */}
            <div className="flex flex-wrap items-center gap-2 pt-1 pl-4.5">
              {bullet.grounding && bullet.grounding.length > 0 && (
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-text-dim">
                  <span className="text-text-muted">Evidence Lineage:</span>
                  {bullet.grounding.map((g, idx) => (
                    <Badge key={idx} variant="neutral" size="sm">
                      {g}
                    </Badge>
                  ))}
                </div>
              )}

              {bullet.flags && bullet.flags.length > 0 && (
                <div className="flex items-center gap-1.5">
                  {bullet.flags.map((flag, idx) => (
                    <Badge key={idx} variant="flag" size="sm">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span>{flag}</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expandable Interview Defense Card */}
        {bullet.defense && <DefenseCard defense={bullet.defense} />}
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
