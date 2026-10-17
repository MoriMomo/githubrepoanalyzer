import * as React from "react";
import { Search, AlertTriangle, Flame } from "lucide-react";
import { tokenizeForLinter, type LinterToken } from "./linterUtils";


interface InlineLinterViewProps {
  text: string;
  fluffHits?: string[];
  ungroundedHits?: string[];
  className?: string;
}

export function InlineLinterView({
  text,
  fluffHits = [],
  ungroundedHits = [],
  className = "",
}: InlineLinterViewProps) {
  const tokens = React.useMemo(
    () => tokenizeForLinter(text, fluffHits, ungroundedHits),
    [text, fluffHits, ungroundedHits],
  );

  const hasIssues = fluffHits.length > 0 || ungroundedHits.length > 0;

  return (
    <div className={`p-3.5 rounded-lg bg-surface border border-border space-y-2.5 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono border-b border-border/70 pb-2">
        <span className="text-text-dim flex items-center gap-1.5 font-medium">
          <Search className="w-3.5 h-3.5 text-accent" />
          <span>Inline AST Linter Analysis</span>
        </span>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="inline-flex items-center gap-1 text-red-300 font-medium">
            <span className="w-2.5 h-0.5 bg-red-400 inline-block border-b border-dashed border-red-300" />
            Unverified Metric
          </span>
          <span className="inline-flex items-center gap-1 text-amber-300 font-medium">
            <span className="w-2.5 h-0.5 bg-amber-400 inline-block" />
            AI Fluff Verb
          </span>
        </div>
      </div>

      <div className="p-3 rounded-md bg-bg border border-border font-mono text-xs leading-relaxed text-text select-text">
        {tokens.map((token, idx) => {
          if (token.type === "fluff") {
            return (
              <mark
                key={idx}
                className="bg-amber-500/15 text-amber-300 border-b-2 border-amber-400/80 px-1 py-0.5 rounded-xs not-italic font-mono font-medium mx-0.5"
                title="Banned AI fluff verb"
              >
                {token.text}
              </mark>
            );
          }
          if (token.type === "metric") {
            return (
              <mark
                key={idx}
                className="bg-red-500/15 text-red-300 border-b-2 border-dashed border-red-400 px-1 py-0.5 rounded-xs not-italic font-mono font-medium mx-0.5"
                title="Ungrounded metric without source proof"
              >
                {token.text}
              </mark>
            );
          }
          return <span key={idx}>{token.text}</span>;
        })}
      </div>

      {hasIssues ? (
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono pt-0.5">
          {ungroundedHits.length > 0 && (
            <span className="text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span>{ungroundedHits.length} unverified metric{ungroundedHits.length > 1 ? "s" : ""}</span>
            </span>
          )}
          {fluffHits.length > 0 && (
            <span className="text-amber-400 flex items-center gap-1">
              <Flame className="w-3 h-3 shrink-0" />
              <span>{fluffHits.length} fluff buzzword{fluffHits.length > 1 ? "s" : ""}</span>
            </span>
          )}
        </div>
      ) : (
        <div className="text-[10px] font-mono text-emerald-400 pt-0.5">
          ✓ No ungrounded metrics or banned fluff detected in current bullet.
        </div>
      )}
    </div>
  );
}
