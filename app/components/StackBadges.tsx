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
import type { SignalSet } from "~/../types";
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
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Cpu className="w-3.5 h-3.5 text-accent" />
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-text-dim">
            Detected Tech Stack Signals
          </h4>
        </div>

        {hasAnyStack ? (
          <div className="flex flex-wrap gap-1.5">
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
          <p className="text-xs text-text-dim italic font-mono">
            No specific dependencies found in text. Analysis will rely on declared features and Truth Drill answers.
          </p>
        )}
      </div>

      {/* Presence Flags Section */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Box className="w-3.5 h-3.5 text-text-dim" />
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-text-dim">
            Architectural Footprints
          </h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {presenceItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-mono transition-colors ${
                  item.active
                    ? "bg-surface-2 border-border text-text"
                    : "bg-surface/40 border-border/50 text-text-dim/50"
                }`}
              >
                {item.active ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-ok shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-text-dim/40 shrink-0" />
                )}
                <Icon className={`w-3.5 h-3.5 shrink-0 ${item.active ? "text-accent" : "text-text-dim/30"}`} />
                <span className="truncate text-[11px]">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
