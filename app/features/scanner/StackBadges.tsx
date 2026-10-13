import {
  Box,
  CheckCircle2,
  XCircle,
  Database,
  Workflow,
  TestTube,
  FileCode,
  KeyRound,
  Cpu,
  Layers,
} from "lucide-react";
import type { SignalSet } from "~/types";
import { Badge } from "~/components/ui";

interface StackBadgesProps {
  signals: SignalSet;
}

export function StackBadges({ signals }: StackBadgesProps) {
  const { stack, presence } = signals;

  const hasAnyStack =
    stack.language ||
    stack.frameworks.length > 0 ||
    stack.databases.length > 0 ||
    stack.caches.length > 0 ||
    stack.externalApis.length > 0;

  const presenceItems = [
    { label: "Dockerfile / Compose", active: presence.hasDockerfile, icon: Box },
    { label: "CI Workflow", active: presence.hasCI, icon: Workflow },
    { label: "Test Suite", active: presence.hasTests, icon: TestTube },
    { label: "Schema Migrations", active: presence.hasMigrations, icon: Database },
    { label: ".env.example", active: presence.hasEnvExample, icon: KeyRound },
  ];

  return (
    <div className="space-y-4">
      {/* Detected Stack Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-medium text-text-dim">
            <Cpu className="w-3.5 h-3.5 text-accent" />
            <span>Detected stack</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Verified from AST
          </span>
        </div>

        {hasAnyStack ? (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {stack.language && (
              <Badge variant="accent" size="md">
                <FileCode className="w-3 h-3" />
                <span>
                  {stack.language} {stack.runtime ? `(${stack.runtime})` : ""}
                </span>
              </Badge>
            )}
            {stack.frameworks.map((fw) => (
              <Badge key={fw} variant="neutral" size="md">
                <Layers className="w-3 h-3 text-accent" />
                <span>{fw}</span>
              </Badge>
            ))}
            {stack.databases.map((db) => (
              <Badge key={db} variant="neutral" size="md">
                <Database className="w-3 h-3 text-emerald-400" />
                <span>{db}</span>
              </Badge>
            ))}
            {stack.caches.map((c) => (
              <Badge key={c} variant="neutral" size="md">
                <Box className="w-3 h-3 text-amber-400" />
                <span>{c}</span>
              </Badge>
            ))}
            {stack.externalApis.map((api) => (
              <Badge key={api} variant="neutral" size="md">
                <Workflow className="w-3 h-3 text-purple-400" />
                <span>{api}</span>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-text-dim italic font-mono bg-bg/50 p-2.5 rounded border border-border">
            No explicit framework dependencies matched in manifests. Analysis will extract signals from declared features and Truth Drill answers.
          </p>
        )}
      </div>

      {/* Presence Flags Section */}
      <div className="space-y-2 pt-1 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs font-medium text-text-dim">
          <Box className="w-3.5 h-3.5 text-text-dim" />
          <span>Infrastructure footprint</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {presenceItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                  item.active
                    ? "bg-surface-2 border-border text-text shadow-xs"
                    : "bg-surface/30 border-border/40 text-text-dim/40"
                }`}
              >
                {item.active ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-ok shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-text-dim/30 shrink-0" />
                )}
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    item.active ? "text-accent" : "text-text-dim/30"
                  }`}
                />
                <span className="truncate text-[11px]">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
