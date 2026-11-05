import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  Plus,
  Search,
  Trash2,
  ArrowRight,
  FolderGit2,
  Loader2,
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

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      {/* Top Floating Pure Notch Navbar */}
      <Navbar mode="app" />

      {/* Main Content */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 pt-24 pb-12 space-y-6 flex-1">
        {/* Guest Mode Notice */}
        {!auth.isAuthenticated && (
          <div className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-lg border border-border bg-surface text-xs">
            <div className="flex items-center gap-2 text-text-dim">
              <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
              <span>Guest mode: projects are saved locally in this browser.</span>
            </div>
            <Link
              to="/login?next=/app"
              className="text-accent hover:underline font-medium shrink-0 font-mono text-[11px]"
            >
              Sign in to sync &rarr;
            </Link>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-text tracking-tight">
              Projects
            </h1>
            <p className="text-xs text-text-dim mt-0.5">
              {sessions.length === 0
                ? "Scan repositories to extract signals and generate defensible bullets."
                : `${sessions.length} ${sessions.length === 1 ? "project" : "projects"} · ${totalBullets} verified ${totalBullets === 1 ? "bullet" : "bullets"}`}
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleCreateNewProject}
            className="shadow-sm shadow-accent/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Scan</span>
          </Button>
        </div>

        {/* Project Library Section */}
        <div className="space-y-4">
          {sessions.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter name or tech stack..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-md bg-surface border border-border text-xs text-text placeholder:text-text-dim focus:outline-none focus:ring-1 focus:ring-accent transition font-mono"
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
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
                <div className="flex items-center rounded-md bg-surface border border-border p-0.5">
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
          )}

          {isLoading ? (
            <div className="p-16 text-center text-text-dim text-xs font-mono flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
              <span>Loading projects...</span>
            </div>
          ) : sessions.length === 0 ? (
            /* Clean Minimal Empty State */
            <div className="rounded-xl bg-surface/30 border border-border border-dashed p-10 sm:p-14 text-center space-y-4 max-w-md mx-auto my-8">
              <div className="w-10 h-10 mx-auto rounded-lg bg-surface-2 border border-border flex items-center justify-center text-accent">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-text font-display">
                  No projects yet
                </h3>
                <p className="text-xs text-text-dim leading-relaxed font-sans">
                  Paste a README, architecture notes, or a GitHub repository to extract signals and generate grounded resume bullets.
                </p>
              </div>
              <div className="pt-1">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleCreateNewProject}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start First Scan</span>
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
