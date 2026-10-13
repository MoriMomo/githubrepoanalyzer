import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
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
  Code2,
  Upload,
  FileCheck2,
  Trash2,
} from "lucide-react";
import { ingestGitHubRepo } from "~/lib/github";
import { formatErrorMessage, formatSize } from "~/lib/utils";
import { Button, Badge, Tooltip } from "~/components/ui";

interface SourceInputProps {
  onScan: (
    rawText: string,
    sourceType?: "paste" | "github" | "file",
    sourceRef?: string,
  ) => void;
  isLoading: boolean;
}

interface LoadedFileMeta {
  name: string;
  size: number;
}

const SHOWCASES = [
  {
    title: "TaskFlow Worker",
    tag: "Express + Redis + Postgres",
    badge: "Distributed Queue",
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

## Core Mechanisms
- Exponential backoff retry handler with dead-letter queue (DLQ) for failed jobs.
- Distributed worker locks utilizing Redis atomic tokens to prevent duplicate task execution.
- RESTful HTTP endpoints for task dispatch, status polling, and health check probes.
`,
  },
  {
    title: "Go Event Broker",
    tag: "Go + PostgreSQL + Docker",
    badge: "Event Streaming",
    content: `# EventBridge Go
High-throughput event streaming broker and webhook dispatch daemon.

\`\`\`
module github.com/acme/eventbridge

go 1.22.0

require (
    github.com/redis/go-redis/v9 v9.5.1
    github.com/jackc/pgx/v5 v5.5.5
    github.com/gin-gonic/gin v1.9.1
)
\`\`\`

## Infrastructure & DX
- Containerized daemon using multi-stage Dockerfile builds.
- Database schema versioning with golang-migrate in scripts/migrations/.
- Prometheus metrics endpoint on :9090 exporting p99 latency counters.
- Benchmark suite in benchmark_test.go executing sub-10ms dispatch stress tests.

## Key Capabilities
- Consumer groups using Redis streams (XREADGROUP) for parallel event fan-out.
- Transactional outbox ledger in PostgreSQL with background commit flushers.
- Worker thread pool throttling to protect downstream consumer databases.
`,
  },
  {
    title: "Next.js SaaS Platform",
    tag: "Next.js + Prisma + Stripe",
    badge: "SaaS Billing",
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
- Webhook idempotency ledger preventing duplicate invoice charges.
- Role-based team access control (RBAC) with optimistic UI updates.
- Automated unit and integration test coverage via Vitest.
`,
  },
];

export function SourceInput({ onScan, isLoading }: SourceInputProps) {
  const [activeTab, setActiveTab] = useState<"paste" | "upload" | "github">("paste");
  const [githubUrl, setGithubUrl] = useState("");
  const [pasteContent, setPasteContent] = useState("");
  const [loadedFileMeta, setLoadedFileMeta] = useState<LoadedFileMeta | null>(null);
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);

  // File drop handler with FileReader (Client-side, 100% zero-infrastructure)
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];

      // Read text content
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        setPasteContent(text);
        setLoadedFileMeta({ name: file.name, size: file.size });
        toast.success(`Loaded ${file.name} (${formatSize(file.size)})`);
      };
      reader.onerror = () => {
        toast.error(`Failed to read file ${file.name}`);
      };
      reader.readAsText(file);
    },
    [],
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
  } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB limit
    accept: {
      "text/*": [".md", ".txt", ".json", ".yaml", ".yml", ".ts", ".tsx", ".js", ".jsx", ".go", ".rs", ".py", ".toml", ".sql", ".env.example"],
      "application/json": [".json"],
    },
  });

  const handleGitHubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl.trim() || isFetchingGithub || isLoading) return;

    setGithubError(null);
    setIsFetchingGithub(true);

    try {
      const result = await ingestGitHubRepo(githubUrl);
      onScan(result.rawSource, "github", result.repoRef);
      toast.success(`Ingested ${result.repoRef} via GitHub CDN`);
    } catch (err) {
      const msg = formatErrorMessage(err);
      setGithubError(
        `Failed to fetch GitHub repository directly: ${msg}. You can paste or drop the README.md content directly instead.`,
      );
    } finally {
      setIsFetchingGithub(false);
    }
  };

  const handleContentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteContent.trim() || isLoading) return;

    if (loadedFileMeta) {
      onScan(pasteContent, "file", loadedFileMeta.name);
    } else {
      onScan(pasteContent, "paste", "Pasted Project Source");
    }
  };

  const handleSelectShowcase = (content: string, title: string) => {
    setPasteContent(content);
    setLoadedFileMeta(null);
    setActiveTab("paste");
    onScan(content, "paste", `Showcase: ${title}`);
  };

  const handleClearContent = () => {
    setPasteContent("");
    setLoadedFileMeta(null);
  };

  const lineCount = pasteContent.trim()
    ? pasteContent.split("\n").length
    : 0;

  return (
    <div className="rounded-xl border border-border bg-surface p-5 sm:p-6 space-y-5 glow-card top-highlight">
      {/* Tab Switcher & Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-1.5 p-0.5 rounded-md bg-surface-2 border border-border">
          <button
            type="button"
            onClick={() => setActiveTab("paste")}
            className={`px-3 py-1.5 rounded text-xs font-mono transition flex items-center gap-2 cursor-pointer ${
              activeTab === "paste"
                ? "bg-surface text-accent font-semibold shadow-xs border border-border"
                : "text-text-dim hover:text-text"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Spec Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`px-3 py-1.5 rounded text-xs font-mono transition flex items-center gap-2 cursor-pointer ${
              activeTab === "upload"
                ? "bg-surface text-accent font-semibold shadow-xs border border-border"
                : "text-text-dim hover:text-text"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Drop / Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("github")}
            className={`px-3 py-1.5 rounded text-xs font-mono transition flex items-center gap-2 cursor-pointer ${
              activeTab === "github"
                ? "bg-surface text-accent font-semibold shadow-xs border border-border"
                : "text-text-dim hover:text-text"
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>GitHub CDN</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-text-dim font-mono">
          <Terminal className="w-3.5 h-3.5 text-accent" />
          <span>Stage 1: Source Ingestion</span>
        </div>
      </div>

      {/* Verified Architecture Showcase Quick-Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-dim font-sans flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-accent" />
            Sample architectures:
          </span>
          <span className="text-[11px] text-text-dim font-mono hidden sm:inline">
            1-click instant audit
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {SHOWCASES.map((sc) => (
            <Tooltip
              key={sc.title}
              content={`Load pre-verified ${sc.tag} spec into AST parser`}
              side="bottom"
            >
              <button
                type="button"
                onClick={() => handleSelectShowcase(sc.content, sc.title)}
                disabled={isLoading || isFetchingGithub}
                className="w-full p-2.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border hover:border-accent/40 text-left transition flex flex-col gap-0.5 cursor-pointer disabled:opacity-50 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-text group-hover:text-accent transition">
                    {sc.title}
                  </span>
                  <span className="text-[9px] font-mono text-accent/80 bg-accent/10 px-1 py-0.2 rounded">
                    {sc.badge}
                  </span>
                </div>
                <span className="text-text-dim font-mono text-[10px] truncate">
                  {sc.tag}
                </span>
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* GitHub Fallback Error Banner */}
      {githubError && (
        <div className="p-3 rounded-md bg-warn/10 border border-warn/30 text-xs text-warn flex items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{githubError}</span>
          </div>
          <button
            onClick={() => setGithubError(null)}
            className="text-warn hover:opacity-80 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Loaded File Meta Banner (if any) */}
      {loadedFileMeta && (
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-2 border border-border text-xs">
          <div className="flex items-center gap-2 font-mono">
            <FileCheck2 className="w-4 h-4 text-ok shrink-0" />
            <span className="text-text font-medium">{loadedFileMeta.name}</span>
            <span className="text-text-dim text-[11px]">
              ({formatSize(loadedFileMeta.size)})
            </span>
          </div>
          <Tooltip content="Detach loaded file and reset editor" side="left">
            <button
              type="button"
              onClick={handleClearContent}
              className="text-text-dim hover:text-flag p-1 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
      )}

      {/* TAB 1: Direct Editor (With Drag-and-Drop capability) */}
      {activeTab === "paste" && (
        <form onSubmit={handleContentSubmit} className="space-y-3.5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-text font-display">
                Architecture Spec / README.md Content
              </label>
              <div className="flex items-center gap-2 text-[10px] font-mono text-text-dim">
                <span>{lineCount} lines</span>
                <span>&bull;</span>
                <span>{pasteContent.length} chars</span>
                {pasteContent && (
                  <button
                    type="button"
                    onClick={handleClearContent}
                    className="text-flag hover:underline cursor-pointer ml-1"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Code Editor Frame with embedded dropzone detection */}
            <div
              {...getRootProps()}
              className={`rounded-lg border bg-bg overflow-hidden transition ${
                isDragActive
                  ? "border-accent ring-2 ring-accent/30 bg-accent/5"
                  : "border-border focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/50"
              }`}
            >
              <input {...getInputProps()} />
              <div className="px-3 py-1.5 bg-surface-2 border-b border-border flex items-center justify-between text-[11px] font-mono text-text-dim">
                <div className="flex items-center gap-1.5">
                  <Code2 className="w-3 h-3 text-accent" />
                  <span>Raw Spec Editor</span>
                  {isDragActive && (
                    <span className="text-accent text-[10px] animate-pulse">
                      (Release file to load)
                    </span>
                  )}
                </div>
                <span>Drop .md or paste text</span>
              </div>
              <textarea
                value={pasteContent}
                onChange={(e) => {
                  setPasteContent(e.target.value);
                  if (loadedFileMeta) setLoadedFileMeta(null);
                }}
                rows={11}
                disabled={isLoading}
                required
                className="w-full bg-transparent p-3 text-xs font-mono text-text placeholder:text-text-dim focus:outline-none leading-relaxed resize-y"
                placeholder={`Paste markdown here (e.g. # Project Name

## Tech Stack
- Express, Redis, PostgreSQL

\`\`\`json
{
  "dependencies": { "ioredis": "^5.3.0" }
}
\`\`\`
)...`}
              />
            </div>
            <p className="text-[11px] text-text-dim font-sans leading-relaxed">
              Include dependencies, databases, Dockerfiles, and background worker descriptions. You can also drag and drop any file directly onto the editor box above.
            </p>
          </div>

          <div className="pt-1 flex items-center justify-between">
            <span className="text-[11px] font-mono text-text-dim">
              Stage 1: Signals & Claims
            </span>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isLoading || !pasteContent.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Structuring Claims...</span>
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

      {/* TAB 2: Dedicated Dropzone File Ingestion (from past creation resumind pattern) */}
      {activeTab === "upload" && (
        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`rounded-xl border-2 border-dashed p-8 sm:p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3.5 select-none ${
              isDragActive
                ? "border-accent bg-accent/10 scale-[1.01]"
                : isDragReject
                  ? "border-flag bg-flag/10"
                  : "border-border hover:border-accent/60 bg-surface-2/40 hover:bg-surface-2/80"
            }`}
          >
            <input {...getInputProps()} />
            <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center text-accent shadow-xs">
              <Upload className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <p className="font-display font-semibold text-sm text-text">
                {isDragActive
                  ? "Drop your project file here..."
                  : "Drag and drop your project spec or source file"}
              </p>
              <p className="text-xs text-text-dim font-sans">
                Supports README.md, package.json, Dockerfile, go.mod, schema.prisma, or raw text (up to 5MB)
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              {[".md", ".json", ".yaml", ".txt", ".ts", ".go", ".rs", ".py"].map((ext) => (
                <Badge key={ext} variant="neutral" size="sm">
                  {ext}
                </Badge>
              ))}
            </div>

            <div className="pt-2">
              <span className="px-3 py-1.5 rounded-md bg-surface border border-border text-xs font-mono text-text hover:text-accent transition">
                Browse from computer
              </span>
            </div>
          </div>

          {pasteContent.trim() && (
            <div className="p-3 rounded-lg bg-surface-2 border border-border flex items-center justify-between">
              <div className="text-xs font-mono text-text-dim">
                <span className="text-text font-semibold">Ready to scan:</span>{" "}
                {loadedFileMeta ? loadedFileMeta.name : "Loaded content"} ({lineCount} lines)
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleContentSubmit}
                disabled={isLoading}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Scan Architecture</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GitHub URL Ingestion */}
      {activeTab === "github" && (
        <form onSubmit={handleGitHubSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-text font-display">
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
                className="w-full bg-bg border border-border rounded-lg px-3.5 py-2.5 text-xs font-mono text-text placeholder:text-text-dim focus:outline-none focus:ring-1 focus:ring-accent transition shadow-inner"
              />
            </div>
            <p className="text-[11px] text-text-dim leading-relaxed font-sans">
              Proof fetches README and dependency manifests directly via raw GitHub CDN (bypassing API rate limits) without downloading git history or cloning large binaries.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isLoading || isFetchingGithub || !githubUrl.trim()}
            >
              {isFetchingGithub ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Inspecting CDN Manifests...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Scan GitHub Repository</span>
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
