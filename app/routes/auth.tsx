import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import {
  Lock,
  Loader2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  AlertTriangle,
  UserCheck,
  LogOut,
  Globe,
  Database,
  RefreshCw,
} from "lucide-react";
import { usePuterStore } from "~/lib/puter";
import { resolveNext } from "~/lib/utils";
import { Button, Card, Badge, Divider } from "~/components/ui";

export default function AuthPage() {
  const { auth, isLoading, puterReady, error, clearError } = usePuterStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Default redirect is /app (Main App) if no specific ?next= is specified
  const rawDestination = resolveNext(location.search);
  const destination = rawDestination === "/" ? "/app" : rawDestination;

  // Auto-redirect if already authenticated when visiting with a specific redirect request
  useEffect(() => {
    // If the user arrived with an explicit redirect and is already logged in, navigate there
    if (auth.isAuthenticated && location.search.includes("next=")) {
      navigate(destination, { replace: true });
    }
  }, [auth.isAuthenticated, navigate, destination, location.search]);

  const handleSignIn = async () => {
    clearError();
    setIsSigningIn(true);
    try {
      await auth.signIn();
      // If sign in succeeded, navigate to destination
      if (auth.isAuthenticated) {
        navigate(destination, { replace: true });
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    clearError();
    await auth.signOut();
  };

  const handleProceedToApp = () => {
    navigate(destination);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      {/* Top Header */}
      <header className="border-b border-border bg-bg/80 backdrop-blur-md px-6 h-14 flex items-center justify-between sticky top-0 z-20">
        <Link
          to="/"
          className="text-xs text-text-dim hover:text-text transition flex items-center gap-1.5 font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-sm tracking-tight text-text">
            Proof
          </span>
          <Badge variant="accent" size="sm">
            Puter Auth
          </Badge>
        </div>

        {/* Live Puter SDK Status Indicator */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              puterReady ? "bg-ok animate-pulse" : "bg-warn animate-spin"
            }`}
          />
          <span className="text-text-dim hidden sm:inline">
            {puterReady ? "Puter v2 Connected" : "Connecting SDK..."}
          </span>
        </div>
      </header>

      {/* Main Login Screen */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Column: Product Value Proposition */}
          <div className="space-y-6 hidden md:block">
            <div className="space-y-3">
              <Badge variant="accent" size="sm">
                Decentralized Client Architecture
              </Badge>
              <h1 className="font-display text-3xl font-bold tracking-tight text-text leading-tight">
                Grounded resume engineering with zero centralized servers.
              </h1>
              <p className="text-xs text-text-dim leading-relaxed font-sans">
                Proof runs 100% in your browser. All authentication, private cloud KV storage, and LLM synthesis calls are powered directly through your Puter account.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded bg-ok/10 text-ok mt-0.5">
                  <Database className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-text">
                    Personal Cloud KV Store
                  </h4>
                  <p className="text-[11px] text-text-dim">
                    Your scanned repositories and bullet history stay in your personal Puter cloud storage.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 rounded bg-accent/10 text-accent mt-0.5">
                  <KeyRound className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-text">
                    Zero API Keys Required
                  </h4>
                  <p className="text-[11px] text-text-dim">
                    Access OpenAI GPT-5, Qwen, Claude, and Gemini without provisioning personal API keys or payment cards.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 rounded bg-warn/10 text-warn mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-text">
                    100% Anti-Fabrication Guarantee
                  </h4>
                  <p className="text-[11px] text-text-dim">
                    Deterministic regex parsing and verbatim evidence lineage badges on every bullet point.
                  </p>
                </div>
              </div>
            </div>

            {/* Puter Network Status Pill */}
            <div className="p-3 rounded-md bg-surface-2/60 border border-border flex items-center justify-between text-[11px] font-mono text-text-dim">
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-accent" />
                <span>js.puter.com/v2</span>
              </div>
              <span className="text-ok flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-ok" />
                Direct Client-to-Cloud TLS
              </span>
            </div>
          </div>

          {/* Right Column: Sign In Card */}
          <Card
            variant="default"
            padding="lg"
            className="space-y-6 border-border shadow-2xl relative bg-surface"
          >
            {auth.isAuthenticated ? (
              /* Already Authenticated View */
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-ok/10 border border-ok/30 text-ok mb-1">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h2 className="font-display text-xl font-bold tracking-tight text-text">
                    Connected to Puter
                  </h2>
                  <p className="text-xs text-text-dim font-sans">
                    You are currently authenticated as:
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-surface-2 border border-border text-center space-y-1">
                  <span className="text-xs font-mono font-semibold text-accent block">
                    @{auth.user?.username || "authenticated_user"}
                  </span>
                  <span className="text-[11px] text-text-dim font-mono block">
                    Puter Cloud Storage Active
                  </span>
                </div>

                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={handleProceedToApp}
                    className="w-full shadow-md shadow-(--color-accent)/15"
                  >
                    <span>Continue to Main App</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={handleSignOut}
                    className="w-full font-mono text-xs text-text-dim hover:text-flag"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Switch Account / Sign Out</span>
                  </Button>
                </div>
              </div>
            ) : (
              /* Unauthenticated View */
              <div className="space-y-6">
                <div className="text-center space-y-1.5">
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-surface-2 border border-border text-accent font-bold text-base mb-2 font-display">
                    P
                  </div>
                  <h2 className="font-display text-xl font-bold tracking-tight text-text">
                    Sign In to Proof
                  </h2>
                  <p className="text-xs text-text-dim font-sans leading-relaxed">
                    Authenticate via Puter to access your persistent project library and AI synthesis quota.
                  </p>
                </div>

                {/* Error Banner if sign-in failed */}
                {error && (
                  <div className="p-3 rounded-md bg-flag/10 border border-flag/30 text-flag text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <p className="font-medium">{error}</p>
                      <button
                        type="button"
                        onClick={handleSignIn}
                        className="text-[11px] underline flex items-center gap-1 hover:opacity-80 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Try again</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={handleSignIn}
                    disabled={isSigningIn || isLoading || !puterReady}
                    className="w-full shadow-md shadow-(--color-accent)/15"
                  >
                    {isSigningIn || isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Authenticating with Puter...</span>
                      </>
                    ) : !puterReady ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Initializing Puter.js...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Sign In with Puter</span>
                      </>
                    )}
                  </Button>

                  <Divider label="or" />

                  <Link to="/app" className="block w-full">
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      className="w-full"
                    >
                      <span>Continue as Guest</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>

                <div className="p-3.5 rounded-md bg-surface-2/60 border border-border text-[11px] text-text-dim space-y-1">
                  <span className="font-semibold text-text font-mono block">
                    Zero-Backend Privacy Guarantee:
                  </span>
                  <p className="leading-relaxed font-sans">
                    No third-party databases, tracking cookies, or backend servers. When you authenticate with Puter, your browser communicates directly with Puter&rsquo;s personal cloud service.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
