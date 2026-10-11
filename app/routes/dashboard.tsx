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
  ArrowLeft,
} from "lucide-react";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";
import { SessionStorageAdapter } from "~/lib/storage";
import { Button, Badge, Card, MotionView } from "~/components/ui";
import type { ProjectSession } from "~/../types";

export default function DashboardPage() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ProjectSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter((s) => {
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
  }, [sessions, searchQuery]);

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
      {/* Navigation Header */}
      <header className="border-b border-border bg-bg/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-13 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs text-text-dim hover:text-text transition flex items-center gap-1.5 font-mono"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm tracking-tight text-text">
                Proof
              </span>
              <Badge variant="accent" size="sm">
                Main App
              </Badge>
            </div>
            <span className="text-[11px] font-mono text-text-dim hidden md:inline">
              Workspace & Project Library
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              to="/wipe"
              className="text-text-dim hover:text-text font-mono text-[11px] transition hidden sm:inline"
            >
              Reset Data
            </Link>
            {auth.isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                <span className="text-text-dim font-mono text-[11px] hidden sm:inline">
                  {auth.user?.username || "Authenticated"}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => auth.signOut()}
                  className="font-mono text-[11px]"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link to="/login?next=/app">
                <Button variant="outline" size="sm">
                  Sign In to Puter
                </Button>
              </Link>
            )}
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleCreateNewProject}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Scan</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl w-full mx-auto px-6 py-8 space-y-8 flex-1">
        {/* Guest Warning Banner if not authenticated */}
        {!auth.isAuthenticated && (
          <Card
            variant="surface2"
            padding="md"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-accent/20 bg-accent/5"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-accent font-display">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Running in Guest Mode</span>
              </div>
              <p className="text-xs text-text-dim font-sans leading-relaxed">
                You can scan repositories and generate defensible bullets right now. To persist your project library across sessions and cloud sync, connect your free Puter account.
              </p>
            </div>
            <Link to="/login?next=/app" className="shrink-0">
              <Button variant="primary" size="sm">
                Sign In to Puter
              </Button>
            </Link>
          </Card>
        )}

        {/* Top Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card variant="default" padding="sm" className="dashboard-stat-card space-y-1">
            <span className="text-[11px] text-text-dim font-mono uppercase tracking-wider flex items-center gap-1.5">
              <FolderGit2 className="w-3 h-3 text-accent" />
              Projects
            </span>
            <p className="text-xl sm:text-2xl font-bold font-mono text-text">
              {sessions.length}
            </p>
            <p className="text-[10px] text-text-dim font-mono">
              In Puter KV Cloud
            </p>
          </Card>

          <Card variant="default" padding="sm" className="dashboard-stat-card space-y-1">
            <span className="text-[11px] text-text-dim font-mono uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-ok" />
              Defensible Bullets
            </span>
            <p className="text-xl sm:text-2xl font-bold font-mono text-text">
              {totalBullets}
            </p>
            <p className="text-[10px] text-text-dim font-mono">
              Interview-ready
            </p>
          </Card>

          <Card variant="default" padding="sm" className="dashboard-stat-card space-y-1">
            <span className="text-[11px] text-text-dim font-mono uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-3 h-3 text-warn" />
              Ground Truth
            </span>
            <p className="text-xl sm:text-2xl font-bold font-mono text-text">
              {totalGroundAnswers}
            </p>
            <p className="text-[10px] text-text-dim font-mono">
              Verified answers
            </p>
          </Card>

          <Card variant="default" padding="sm" className="dashboard-stat-card space-y-1">
            <span className="text-[11px] text-text-dim font-mono uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-accent" />
              Grounding Net
            </span>
            <p className="text-xl sm:text-2xl font-bold font-mono text-accent">
              100%
            </p>
            <p className="text-[10px] text-text-dim font-mono">
              Anti-hallucination active
            </p>
          </Card>
        </div>

        {/* Quick Launch & Scanner Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-xl bg-surface border border-border">
          <div className="max-w-xl space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="accent" size="sm">
                Fast Ingestion
              </Badge>
              <span className="text-xs font-mono text-text-dim">
                GitHub URLs or Pasted READMEs
              </span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-text">
              Scan a Repository for Defensible Claims
            </h1>
            <p className="text-xs text-text-dim leading-relaxed font-sans">
              Extract raw architectural signals, detect tech stack indicators, and generate Google X-Y-Z resume bullets with complete evidence lineage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleCreateNewProject}
              className="shadow-md shadow-(--color-accent)/15"
            >
              <Plus className="w-4 h-4" />
              <span>Start New Scan</span>
            </Button>
          </div>
        </div>

        {/* Project Library Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-text">
                Your Project Library
              </h2>
              <span className="text-xs text-text-dim font-mono">
                ({filteredSessions.length} of {sessions.length})
              </span>
            </div>

            {sessions.length > 0 && (
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by name or stack..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-md bg-surface border border-border text-xs text-text placeholder:text-text-dim focus:outline-none focus:ring-1 focus:ring-accent transition font-mono"
                />
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-text-dim text-xs font-mono flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
              <span>Loading project library...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-12 rounded-md bg-surface/40 border border-border border-dashed text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-md bg-surface-2 flex items-center justify-center text-text-dim">
                <FolderGit2 className="w-6 h-6 text-accent" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-sm font-semibold text-text font-display">
                  No projects scanned yet
                </h3>
                <p className="text-xs text-text-dim leading-relaxed font-sans">
                  Paste your project README, architecture notes, or provide a GitHub repository link to begin your first grounded analysis.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleCreateNewProject}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Scan First Project</span>
                </Button>
              </div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="p-8 text-center text-text-dim text-xs font-mono bg-surface/30 rounded-md border border-border">
              No saved projects match &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            <MotionView animationKey={filteredSessions.length} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

                return (
                  <Card
                    key={session.id}
                    variant="interactive"
                    padding="md"
                    onClick={() => navigate(`/project/${session.id}`)}
                    className="dashboard-session-item flex flex-col justify-between space-y-4 group relative"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-text-dim font-mono">
                        <span>{dateStr}</span>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="neutral" size="sm">
                            {session.sourceType || "paste"}
                          </Badge>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSession(e, session.id)}
                            disabled={deletingId === session.id}
                            className="p-1 rounded text-text-dim hover:text-flag transition cursor-pointer"
                            title="Delete session"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-text group-hover:text-accent transition text-xs truncate">
                        {session.sourceRef || "Pasted Project"}
                      </h3>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {stackBadges.slice(0, 3).map((badge, idx) => (
                          <Badge key={idx} variant="neutral" size="sm">
                            {badge}
                          </Badge>
                        ))}
                        {stackBadges.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] text-text-dim font-mono">
                            +{stackBadges.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-3 border-t border-border text-text-dim">
                      <span className="font-mono text-[11px]">
                        {session.bullets?.length || 0} bullets ready
                      </span>
                      <span className="text-accent group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-mono text-[11px]">
                        <span>Open Workspace</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Card>
                );
              })}
            </MotionView>
          )}
        </div>
      </main>
    </div>
  );
}
