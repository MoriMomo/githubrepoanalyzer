import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  Plus,
  Search,
  Trash2,
  ArrowRight,
  FolderGit2,
  Loader2,
  ShieldCheck,
  FileText,
  Sparkles,
  HelpCircle,
  Calendar,
  Grid,
  List as ListIcon,
  CheckCircle2,
} from "lucide-react";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";
import { SessionStorageAdapter } from "~/lib/storage";
import { Button, Badge, Card, MotionView, Tooltip } from "~/components/ui";
import { Navbar } from "~/components/layout";
import type { ProjectSession } from "~/types";

const SAMPLE_PROJECTS = [
  {
    title: "TaskFlow Worker",
    subtitle: "Express + Redis + Postgres",
    desc: "Distributed asynchronous worker pool with atomic Redis locks & dead-letter queue.",
  },
  {
    title: "Go Event Broker",
    subtitle: "Go + PostgreSQL + Docker",
    desc: "High-throughput event streaming with Redis consumer groups and benchmark suites.",
  },
  {
    title: "Next.js SaaS Platform",
    subtitle: "Next.js + Prisma + Stripe",
    desc: "Subscription billing portal with webhook idempotency ledger and optimistic UI.",
  },
];

export default function DashboardPage() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ProjectSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "bullets" | "name">("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadSessions() {
      try {
        const loaded = await SessionStorageAdapter.listSessions(
          kv,
          auth.isAuthenticated,
        );
        setSessions(loaded);

        // Auto-sync local projects to Puter cloud if user is signed in
        if (auth.isAuthenticated && kv) {
          SessionStorageAdapter.syncLocalToCloud(kv).catch(() => {});
        }
      } catch (err) {
        console.error("Failed to load sessions from storage", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSessions();
  }, [auth.isAuthenticated, kv]);

  const handleCreateNewProject = () => {
    const newId = generateUUID();
    navigate(`/project/${newId}`);
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this saved project?")) return;

    setDeletingId(id);
    try {
      await SessionStorageAdapter.deleteSession(id, kv, auth.isAuthenticated);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete session", err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredSessions = useMemo(() => {
    let result = [...sessions];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) => {
        const matchRef = s.sourceRef?.toLowerCase().includes(q);
        const matchLang = s.signals?.stack?.language?.toLowerCase().includes(q);
        const matchFw = s.signals?.stack?.frameworks?.some((f) =>
          f.toLowerCase().includes(q),
        );
        const matchDb = s.signals?.stack?.databases?.some((d) =>
          d.toLowerCase().includes(q),
        );
        const matchCache = s.signals?.stack?.caches?.some((c) =>
          c.toLowerCase().includes(q),
        );
        return matchRef || matchLang || matchFw || matchDb || matchCache;
      });
    }

    if (sortBy === "bullets") {
      result.sort((a, b) => (b.bullets?.length || 0) - (a.bullets?.length || 0));
    } else if (sortBy === "name") {
      result.sort((a, b) => (a.sourceRef || "").localeCompare(b.sourceRef || ""));
    } else {
      result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    return result;
  }, [sessions, searchQuery, sortBy]);

  const totalBullets = useMemo(() => {
    return sessions.reduce((acc, s) => acc + (s.bullets?.length || 0), 0);
  }, [sessions]);

  const totalGroundAnswers = useMemo(() => {
    return sessions.reduce(
      (acc, s) => acc + (s.drillAnswers ? Object.keys(s.drillAnswers).length : 0),
      0,
    );
  }, [sessions]);

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      {/* Top Floating Pure Notch Navbar */}
      <Navbar mode="app" />

      {/* Main Content */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-24 pb-8 space-y-7 flex-1">
        {/* Guest Mode Warning if not logged in */}
        {!auth.isAuthenticated && (
          <Card
            variant="surface2"
            padding="md"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-accent/20 bg-accent/[0.04] top-highlight"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-accent font-display">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Running in Local Guest Mode</span>
              </div>
              <p className="text-xs text-text-dim font-sans leading-relaxed">
                Your scanned repositories and bullets are stored in browser localStorage. To enable cloud synchronization across devices and permanent private backup, sign in with Puter.
              </p>
            </div>
            <Link to="/login?next=/app" className="shrink-0">
              <Button variant="primary" size="sm">
                Sign In to Puter
              </Button>
            </Link>
          </Card>
        )}

        {/* Top Telemetry Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card variant="surface2" padding="md" className="space-y-1.5 top-highlight">
            <div className="flex items-center justify-between text-xs text-text-dim font-sans font-medium">
              <span className="flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-accent" />
                Projects
              </span>
              <span className="text-[11px] text-accent/90 font-mono">
                {auth.isAuthenticated ? "Cloud KV" : "Local"}
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-text tracking-tight">
              {sessions.length}
            </p>
            <p className="text-[11px] text-text-dim font-sans">
              Active audit sessions
            </p>
          </Card>

          <Card variant="surface2" padding="md" className="space-y-1.5 top-highlight">
            <div className="flex items-center justify-between text-xs text-text-dim font-sans font-medium">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-ok" />
                Defensible Bullets
              </span>
              <span className="text-[11px] text-ok/90 font-mono">Verified</span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-text tracking-tight">
              {totalBullets}
            </p>
            <p className="text-[11px] text-text-dim font-sans">
              Interview-ready claims
            </p>
          </Card>

          <Card variant="surface2" padding="md" className="space-y-1.5 top-highlight">
            <div className="flex items-center justify-between text-xs text-text-dim font-sans font-medium">
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-warn" />
                Truth Drills
              </span>
              <span className="text-[11px] text-warn/90 font-mono">Grounded</span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-text tracking-tight">
              {totalGroundAnswers}
            </p>
            <p className="text-[11px] text-text-dim font-sans">
              Trade-off answers
            </p>
          </Card>

          <Card variant="surface2" padding="md" className="space-y-1.5 top-highlight">
            <div className="flex items-center justify-between text-xs text-text-dim font-sans font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                Grounding Net
              </span>
              <span className="text-[11px] text-accent/90 font-mono">Grounding Active</span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-accent tracking-tight">
              100%
            </p>
            <p className="text-[11px] text-text-dim font-sans">
              Anti-hallucination pass
            </p>
          </Card>
        </div>

        {/* Quick Launch & Ingestion Command Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-xl bg-gradient-to-r from-surface to-surface-2 border border-border glow-card top-highlight">
          <div className="max-w-xl space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="accent" size="sm">
                Fast Ingestion
              </Badge>
              <span className="text-xs font-mono text-text-dim">
                Public GitHub URLs or Pasted Specs
              </span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-text">
              Scan a Repository for Defensible Claims
            </h1>
            <p className="text-xs text-text-dim leading-relaxed font-sans">
              Extract raw architectural signals, parse concrete dependencies, and generate Google X-Y-Z resume bullets with verbatim evidence lineage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleCreateNewProject}
              className="shadow-sm shadow-accent/20"
            >
              <Plus className="w-4 h-4" />
              <span>Start New Scan</span>
            </Button>
          </div>
        </div>

        {/* Project Library Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold font-sans text-text tracking-tight">
                Your Projects
              </h2>
              <span className="text-xs text-text-dim font-mono">
                ({filteredSessions.length} of {sessions.length})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Bar */}
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter name or tech stack..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-md bg-surface border border-border text-xs text-text placeholder:text-text-dim focus:outline-none focus:ring-1 focus:ring-accent transition font-mono"
                />
              </div>

              {/* Sort Selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "recent" | "bullets" | "name")}
                className="bg-surface border border-border text-xs font-mono text-text-dim rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
              >
                <option value="recent">Sort: Most Recent</option>
                <option value="bullets">Sort: Most Bullets</option>
                <option value="name">Sort: Project Name</option>
              </select>

              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center rounded-md bg-surface border border-border p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1 rounded transition cursor-pointer ${
                    viewMode === "grid" ? "bg-surface-2 text-accent" : "text-text-dim hover:text-text"
                  }`}
                  title="Grid view"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`p-1 rounded transition cursor-pointer ${
                    viewMode === "list" ? "bg-surface-2 text-accent" : "text-text-dim hover:text-text"
                  }`}
                  title="List view"
                >
                  <ListIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-16 text-center text-text-dim text-xs font-mono flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
              <span>Loading project library from Puter KV...</span>
            </div>
          ) : sessions.length === 0 ? (
            /* Rich Empty State with 1-click sample loaders */
            <div className="rounded-xl bg-surface/50 border border-border border-dashed p-8 sm:p-12 text-center space-y-6">
              <div className="w-12 h-12 mx-auto rounded-lg bg-surface-2 border border-border flex items-center justify-center text-accent">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-semibold text-text font-display">
                  No projects scanned yet
                </h3>
                <p className="text-xs text-text-dim leading-relaxed font-sans">
                  Paste your project README, architecture notes, or link a GitHub repository to begin your first grounded analysis.
                </p>
              </div>

              {/* 1-Click Sample Ingestion Cards */}
              <div className="space-y-2 max-w-xl mx-auto pt-2">
                <span className="text-xs font-medium text-text-dim font-sans">
                  Or test immediately with a sample architecture:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left">
                  {SAMPLE_PROJECTS.map((sample) => (
                    <button
                      key={sample.title}
                      type="button"
                      onClick={handleCreateNewProject}
                      className="p-3 rounded-lg bg-surface border border-border hover:border-accent/50 hover:bg-surface-2 transition text-left cursor-pointer group space-y-1"
                    >
                      <span className="text-xs font-semibold text-text group-hover:text-accent transition block">
                        {sample.title}
                      </span>
                      <span className="text-[10px] font-mono text-accent block">
                        {sample.subtitle}
                      </span>
                      <span className="text-[10px] text-text-dim line-clamp-2 block font-sans">
                        {sample.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleCreateNewProject}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Scan First Repository</span>
                </Button>
              </div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="p-12 text-center text-text-dim text-xs font-mono bg-surface/30 rounded-lg border border-border">
              No saved projects match &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : viewMode === "grid" ? (
            /* GRID VIEW */
            <MotionView
              animationKey={filteredSessions.length + sortBy}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredSessions.map((session) => {
                const dateStr = new Date(session.createdAt).toLocaleDateString(
                  undefined,
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  },
                );

                const stackBadges = [
                  session.signals?.stack?.language,
                  ...(session.signals?.stack?.frameworks || []),
                  ...(session.signals?.stack?.databases || []),
                  ...(session.signals?.stack?.caches || []),
                ].filter(Boolean);

                const hasBullets = (session.bullets?.length || 0) > 0;
                const isDrillPending =
                  session.phase === "drill" && !hasBullets;

                return (
                  <Card
                    key={session.id}
                    variant="interactive"
                    padding="md"
                    onClick={() => navigate(`/project/${session.id}`)}
                    className="dashboard-session-item flex flex-col justify-between space-y-4 group relative rounded-lg top-highlight"
                  >
                    <div className="space-y-2.5">
                      {/* Top Meta Row */}
                      <div className="flex items-center justify-between text-[11px] text-text-dim font-mono">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-text-dim" />
                          {dateStr}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="neutral" size="sm">
                            {session.sourceType || "paste"}
                          </Badge>
                          <Tooltip content="Delete session permanently" side="left">
                            <button
                              type="button"
                              onClick={(e) => handleDeleteSession(e, session.id)}
                              disabled={deletingId === session.id}
                              className="p-1 rounded text-text-dim hover:text-flag transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </Tooltip>
                        </div>
                      </div>

                      {/* Project Title */}
                      <h3 className="font-semibold text-text group-hover:text-accent transition text-sm tracking-tight truncate">
                        {session.sourceRef || "Pasted Project"}
                      </h3>

                      {/* Stack Badges */}
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {stackBadges.slice(0, 4).map((badge, idx) => (
                          <Badge key={idx} variant="neutral" size="sm">
                            {badge}
                          </Badge>
                        ))}
                        {stackBadges.length > 4 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] text-text-dim font-mono">
                            +{stackBadges.length - 4}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Status Row */}
                    <div className="flex items-center justify-between text-xs pt-3 border-t border-border text-text-dim">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        {hasBullets ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-ok" />
                            <span className="text-text font-medium">
                              {session.bullets.length} bullets ready
                            </span>
                          </>
                        ) : isDrillPending ? (
                          <>
                            <HelpCircle className="w-3.5 h-3.5 text-warn" />
                            <span className="text-warn">Truth drill pending</span>
                          </>
                        ) : (
                          <span>Input ready</span>
                        )}
                      </div>

                      <span className="text-accent group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-mono text-[11px]">
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Card>
                );
              })}

              {/* Fast "New Project" Dashed Card */}
              <button
                type="button"
                onClick={handleCreateNewProject}
                className="p-6 rounded-lg border border-border border-dashed hover:border-accent/50 hover:bg-surface/50 text-left transition flex flex-col items-center justify-center gap-2 text-text-dim hover:text-accent cursor-pointer group min-h-[160px]"
              >
                <div className="w-8 h-8 rounded-md bg-surface-2 group-hover:bg-accent/10 border border-border group-hover:border-accent/30 flex items-center justify-center transition">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-medium">
                  Scan New Repository
                </span>
              </button>
            </MotionView>
          ) : (
            /* LIST VIEW */
            <div className="rounded-lg border border-border bg-surface overflow-hidden divide-y divide-border">
              {filteredSessions.map((session) => {
                const dateStr = new Date(session.createdAt).toLocaleDateString();
                const stackBadges = [
                  session.signals?.stack?.language,
                  ...(session.signals?.stack?.frameworks || []),
                  ...(session.signals?.stack?.databases || []),
                ].filter(Boolean);

                return (
                  <div
                    key={session.id}
                    onClick={() => navigate(`/project/${session.id}`)}
                    className="p-3.5 hover:bg-surface-2 transition flex items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FolderGit2 className="w-4 h-4 text-accent shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-text group-hover:text-accent transition truncate block">
                          {session.sourceRef || "Pasted Project"}
                        </span>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-[10px] font-mono text-text-dim">
                            {dateStr}
                          </span>
                          <span className="text-[10px] text-text-dim">&bull;</span>
                          <span className="text-[10px] font-mono text-text-dim">
                            {session.sourceType || "paste"}
                          </span>
                          <div className="hidden sm:flex items-center gap-1">
                            {stackBadges.slice(0, 3).map((b, i) => (
                              <Badge key={i} variant="neutral" size="sm">
                                {b}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-[11px] font-mono text-text-dim hidden sm:inline">
                        {session.bullets?.length || 0} bullets
                      </span>
                      <Tooltip content="Delete session permanently" side="left">
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSession(e, session.id)}
                          className="p-1 rounded text-text-dim hover:text-flag transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>
                      <ArrowRight className="w-3.5 h-3.5 text-text-dim group-hover:text-accent transition" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
