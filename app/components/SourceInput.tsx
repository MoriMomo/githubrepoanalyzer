import { useState } from "react";
import {
  FileText,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertTriangle,
  X,
  Layers,
  Terminal,
  FolderGit2,
} from "lucide-react";
import { ingestGitHubRepo } from "~/lib/github";
import { formatErrorMessage } from "~/lib/utils";
import { Button } from "~/components/ui";

interface SourceInputProps {
  onScan: (
    rawText: string,
    sourceType?: "paste" | "github",
    sourceRef?: string,
  ) => void;
  isLoading: boolean;
}

const SHOWCASES = [
  {
    title: "TaskFlow Worker",
    tag: "Express + Redis + Postgres",
    content: `# TaskFlow Engine
A resilient distributed background job worker and task orchestration service.

\`\`\`json
{
  "name": "taskflow-engine",
  "dependencies": {
    "express": "^4.19.2",
    "ioredis": "^5.3.2",
    "pg": "^8.11.3",
    "prisma": "^5.10.0"
  },
  "devDependencies": {
    "typescript": "^5.4.2",
    "vitest": "^1.3.1"
  }
}
\`\`\`

## Architecture & Infrastructure
- Containerized using Docker and Docker Compose for reproducible local orchestration.
- PostgreSQL manages relational state and audit history with Prisma schema migrations.
- Redis manages fast in-memory job queues, locks, and task rate limits.
- Automated CI pipeline runs unit and integration tests on push via .github/workflows/ci.yml.
- Environment variables configured via .env.example.

## Features
- Exponential backoff retry handler with dead-letter queue (DLQ) support
- Distributed worker locks utilizing Redis atomic tokens to prevent duplicate task execution
- RESTful HTTP endpoints for task dispatch, status polling, and health checks
`,
  },
  {
    title: "Go Event Broker",
    tag: "Go + PostgreSQL + Docker",
    content: `# EventBridge Daemon
A lightweight distributed event broker written in Go for high-throughput stream ingestion.

## Architecture
- Written in Go utilizing goroutines and sync channels for concurrent worker pools.
- Backed by PostgreSQL for durable event log storage.
- Deployed via Docker with a multi-stage Dockerfile and healthcheck probes.
- Continuous Integration managed with GitHub Actions (.github/workflows/test.yml).

## Capabilities
- Batch ingestion of webhook payloads with transactional atomic commits
- Worker thread pool throttling to protect downstream consumer databases
- Automated schema migration runner on container bootstrap
`,
  },
  {
    title: "Next.js SaaS Platform",
    tag: "Next.js + Prisma + Stripe",
    content: `# SubscriptionsApp
Modern SaaS subscription management and invoicing portal.

\`\`\`json
{
  "name": "subscription-portal",
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "@prisma/client": "^5.12.0",
    "stripe": "^14.21.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vitest": "^1.4.0"
  }
}
\`\`\`

## Infrastructure
- Hosted on Node runtime with database migrations handled by Prisma migrate.
- Secure environment separation using .env.example templates.
- Stripe webhook verification with cryptographic signature validation.

## Features
- Webhook idempotency ledger preventing duplicate invoice charges
- Role-based team access control (RBAC) with optimistic UI updates
- Automated unit and integration test coverage via Vitest
`,
  },
];

export function SourceInput({ onScan, isLoading }: SourceInputProps) {
  const [activeTab, setActiveTab] = useState<"github" | "paste">("paste");
  const [githubUrl, setGithubUrl] = useState("");
  const [pasteContent, setPasteContent] = useState("");
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);

  const handleGitHubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl.trim() || isFetchingGithub || isLoading) return;

    setGithubError(null);
    setIsFetchingGithub(true);

    try {
      const result = await ingestGitHubRepo(githubUrl);
      onScan(result.rawSource, "github", result.repoRef);
    } catch (err) {
      const msg = formatErrorMessage(err);
      setGithubError(
        `Failed to fetch GitHub repository directly: ${msg}. You can paste the README.md content below instead.`,
      );
    } finally {
      setIsFetchingGithub(false);
    }
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteContent.trim() || isLoading) return;
    onScan(pasteContent, "paste", "Pasted Project Source");
  };

  const handleSelectShowcase = (content: string, title: string) => {
    setPasteContent(content);
    setActiveTab("paste");
    onScan(content, "paste", `Showcase: ${title}`);
  };

  return (
    <div className="rounded-md border border-border bg-surface p-5 space-y-5">
      {/* Tab Switcher & Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-1.5 p-0.5 rounded bg-surface-2 border border-border">
          <button
            type="button"
            onClick={() => setActiveTab("paste")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition flex items-center gap-2 cursor-pointer ${
              activeTab === "paste"
                ? "bg-surface text-accent shadow-sm border border-border"
                : "text-text-dim hover:text-text"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste README / Notes</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("github")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition flex items-center gap-2 cursor-pointer ${
              activeTab === "github"
                ? "bg-surface text-accent shadow-sm border border-border"
                : "text-text-dim hover:text-text"
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>GitHub URL Ingestion</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-text-dim font-mono">
          <Terminal className="w-3.5 h-3.5 text-accent" />
          <span>Anti-Fabrication Engine</span>
        </div>
      </div>

      {/* Architecture Showcase Quick-Pills */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3 h-3 text-text-dim" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-dim">
            Load Verified Architecture Showcase:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SHOWCASES.map((sc) => (
            <button
              key={sc.title}
              type="button"
              onClick={() => handleSelectShowcase(sc.content, sc.title)}
              disabled={isLoading || isFetchingGithub}
              className="px-2.5 py-1 rounded-md bg-surface-2 hover:bg-surface-2/80 border border-border hover:border-slate-600 text-[11px] text-text transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span className="font-medium text-accent">{sc.title}</span>
              <span className="text-text-dim font-mono text-[10px]">
                ({sc.tag})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* GitHub Fallback Warning Banner */}
      {githubError && (
        <div className="p-3 rounded-md bg-warn/10 border border-warn/30 text-xs text-warn flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{githubError}</span>
          </div>
          <button
            onClick={() => setGithubError(null)}
            className="text-warn hover:opacity-80 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TAB 1: GitHub URL Ingestion */}
      {activeTab === "github" ? (
        <form onSubmit={handleGitHubSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-text">
              Public GitHub Repository URL
            </label>
            <div className="relative">
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/owner/repository (e.g. facebook/react)"
                disabled={isLoading || isFetchingGithub}
                required
                className="w-full bg-bg border border-border rounded-md px-3.5 py-2 text-xs font-mono text-text placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
              />
            </div>
            <p className="text-[11px] text-text-dim leading-relaxed">
              Proof fetches README and manifests directly via raw CDN (bypassing rate limits) and inspects top-level architecture trees.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!githubUrl.trim() || isFetchingGithub || isLoading}
            >
              {isFetchingGithub || isLoading ? (
                <>
                  <Loader2 className="animate-spin h-3.5 w-3.5" />
                  <span>Ingesting Repository...</span>
                </>
              ) : (
                <>
                  <span>Fetch & Scan Repo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        /* TAB 2: Paste Raw README / Notes */
        <form onSubmit={handlePasteSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              disabled={isLoading}
              placeholder={`Paste markdown here (e.g. # Project Name \n\n## Tech Stack\n- Express, Redis, PostgreSQL\n\n\`\`\`json\n{\n  "dependencies": { "ioredis": "^5.3.0" }\n}\n\`\`\`)...`}
              className="w-full h-72 bg-bg border border-border rounded-md p-3.5 text-xs font-mono text-text placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none leading-relaxed transition-all"
              required
            />
            <div className="absolute bottom-2.5 right-3 text-[11px] text-text-dim font-mono">
              {pasteContent.length > 0 ? `${pasteContent.length} chars` : "Empty"}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            {pasteContent.length > 0 ? (
              <button
                type="button"
                onClick={() => setPasteContent("")}
                disabled={isLoading}
                className="text-xs text-text-dim hover:text-text transition cursor-pointer"
              >
                Clear buffer
              </button>
            ) : (
              <span />
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!pasteContent.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-3.5 w-3.5" />
                  <span>Extracting Architecture Signals...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Scan Architecture</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
