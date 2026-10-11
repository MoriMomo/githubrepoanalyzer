import { useRef } from "react";
import { Link, useNavigate } from "react-router";
import {
  ShieldCheck,
  ArrowRight,
  GitBranch,
  Sparkles,
  HelpCircle,
  Lock,
  Terminal,
  Cpu,
  Flame,
  Check,
  X,
  Code2,
} from "lucide-react";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";
import { Button, Badge, Card } from "~/components/ui";
import { useGSAP, staggerFadeUp } from "~/lib/gsap";

export default function HomePage() {
  const { auth } = usePuterStore();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);

  // GSAP micro-animation for hero section
  useGSAP(
    () => {
      staggerFadeUp(".hero-anim-item", {
        stagger: 0.08,
        duration: 0.4,
        y: 12,
      });
    },
    [],
    heroRef,
  );

  const handleLaunchSample = () => {
    const newId = generateUUID();
    navigate(`/project/${newId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      {/* Navigation Header */}
      <header className="border-b border-border bg-bg/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-display font-bold text-base tracking-tight text-text">
                Proof
              </span>
              <Badge variant="accent" size="sm">
                v1.0
              </Badge>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-text-dim">
            <a href="#how-it-works" className="hover:text-text transition">
              How It Works
            </a>
            <a href="#comparison" className="hover:text-text transition">
              Reality Check
            </a>
            <a href="#features" className="hover:text-text transition">
              Features
            </a>
          </nav>

          <div className="flex items-center gap-3 text-xs">
            {auth.isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-text-dim font-mono text-[11px] hidden sm:inline">
                  {auth.user?.username}
                </span>
                <Link to="/app">
                  <Button variant="primary" size="sm">
                    <span>Go to Main App</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-mono text-xs">
                    Sign In
                  </Button>
                </Link>
                <Link to="/app">
                  <Button variant="primary" size="sm">
                    <span>Launch App</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 space-y-24 py-16 px-6 max-w-6xl mx-auto w-full">
        {/* Hero Section */}
        <section ref={heroRef} className="text-center space-y-6 pt-4 max-w-3xl mx-auto">
          <div className="hero-anim-item inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Architectural Extraction & Grounding Engine</span>
          </div>

          <h1 className="hero-anim-item font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text leading-[1.1]">
            Turn raw repositories into{" "}
            <span className="text-accent underline decoration-accent/40 underline-offset-8">
              interview-defensible
            </span>{" "}
            resume bullets.
          </h1>

          <p className="hero-anim-item text-sm sm:text-base text-text-dim leading-relaxed max-w-2xl mx-auto font-sans">
            Generic AI invents metrics like <span className="text-flag font-mono font-medium">&ldquo;improved query efficiency by 40%&rdquo;</span> that collapse at the first senior engineering question. Proof extracts verifiable architecture signals from your code and conducts a Truth Drill to ground every single claim.
          </p>

          <div className="hero-anim-item flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link to="/app" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full shadow-lg shadow-(--color-accent)/15">
                <span>Open Main App</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleLaunchSample}
              className="w-full sm:w-auto"
            >
              <Terminal className="w-4 h-4" />
              <span>Try Live Demo</span>
            </Button>
          </div>

          <p className="hero-anim-item text-[11px] text-text-dim font-mono pt-2">
            Zero third-party tracking &bull; Free AI synthesis via Puter.js &bull; 100% Anti-Fabrication Guarantee (§8)
          </p>
        </section>

        {/* Pillars / Trust Signals Banner */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-y border-border py-8">
          <div className="space-y-1">
            <span className="text-xs font-mono font-semibold text-accent uppercase tracking-wider">
              0% Hallucinations
            </span>
            <p className="text-xs text-text-dim">
              Strict deterministic validation rejects invented benchmarks.
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-mono font-semibold text-ok uppercase tracking-wider">
              Google X-Y-Z
            </span>
            <p className="text-xs text-text-dim">
              Accomplished [X] measured by [Y] by doing [Z] standard.
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-mono font-semibold text-warn uppercase tracking-wider">
              Hotseat Scripts
            </span>
            <p className="text-xs text-text-dim">
              Pre-computed spoken defense for senior interviewer challenges.
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-mono font-semibold text-text uppercase tracking-wider">
              Client-Side Privacy
            </span>
            <p className="text-xs text-text-dim">
              Zero backend database. Stored safely in your private Puter KV.
            </p>
          </div>
        </section>

        {/* The Technical Interview Reality Check (Side-by-Side) */}
        <section id="comparison" className="space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <Badge variant="warn" size="sm">
              The Reality Check
            </Badge>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text">
              Why Senior Engineers Reject Generic AI Bullets
            </h2>
            <p className="text-xs text-text-dim">
              Engineering hiring managers spot ChatGPT-generated resumes within 10 seconds of the technical interview.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Generic AI halluncination card */}
            <Card variant="default" padding="lg" className="border-flag/40 bg-flag/5 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="flag" size="sm">
                    <X className="w-3 h-3" />
                    <span>Generic AI / ChatGPT Resume Bullet</span>
                  </Badge>
                  <span className="text-[11px] font-mono text-flag">HIGH INTERVIEW RISK</span>
                </div>

                <div className="p-3.5 rounded bg-bg border border-flag/20 font-mono text-xs text-text leading-relaxed">
                  &ldquo;Engineered high-performance microservices architecture using Redis and Kafka, improving query efficiency by 40% across distributed workloads.&rdquo;
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-flag font-semibold font-mono text-[11px]">
                    <Flame className="w-3.5 h-3.5" />
                    <span>The Hotseat Question You Will Face:</span>
                  </div>
                  <p className="text-text-dim italic bg-bg/50 p-3 rounded border border-border">
                    &ldquo;How did you measure that 40%? What was your benchmark baseline? Which profiling tool did you use, and how did you configure consumer group partition offsets?&rdquo;
                  </p>
                </div>
              </div>

              <div className="p-3 rounded bg-flag/10 border border-flag/20 text-flag text-xs font-mono">
                Outcome: Candidate freezes. Red flag for unsubstantiated metrics and resume fabrication.
              </div>
            </Card>

            {/* Proof Grounded Defensible card */}
            <Card variant="default" padding="lg" className="border-accent/40 bg-accent/5 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="ok" size="sm">
                    <Check className="w-3 h-3" />
                    <span>Proof Defensible Bullet (§8 Grounded)</span>
                  </Badge>
                  <span className="text-[11px] font-mono text-accent">100% DEFENDED</span>
                </div>

                <div className="p-3.5 rounded bg-bg border border-accent/20 font-mono text-xs text-text leading-relaxed">
                  &ldquo;Architected asynchronous job queue in Go using Redis streams and worker pools, handling 1,500 jobs/sec with sub-10ms dispatch latency verified via benchmark suite.&rdquo;
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-accent font-semibold font-mono text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Your Pre-Computed Spoken Defense:</span>
                  </div>
                  <p className="text-text-dim bg-bg/50 p-3 rounded border border-border">
                    &ldquo;When asked about the 10ms dispatch latency, explain how Redis streams XREADGROUP was coupled with buffered channels in <code className="text-accent font-mono">pkg/worker/pool.go</code>, avoiding database locking during burst traffic.&rdquo;
                  </p>
                </div>
              </div>

              <div className="p-3 rounded bg-ok/10 border border-ok/20 text-ok text-xs font-mono">
                Outcome: Candidate demonstrates deep architectural ownership. Immediate hire signal.
              </div>
            </Card>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <Badge variant="accent" size="sm">
              The 4-Stage Pipeline
            </Badge>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text">
              How Proof Builds Defensible Bullets
            </h2>
            <p className="text-xs text-text-dim">
              From raw codebase files to grounded, interview-tested claims in under 60 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card variant="default" padding="md" className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-accent font-bold text-xs">01</span>
                <GitBranch className="w-4 h-4 text-text-dim" />
              </div>
              <h3 className="font-display font-semibold text-sm text-text">
                Ingestion & Manifests
              </h3>
              <p className="text-xs text-text-dim font-sans leading-relaxed">
                Paste your README or connect a public GitHub repository. Proof extracts package manifests without cloning the repo.
              </p>
            </Card>

            <Card variant="default" padding="md" className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-accent font-bold text-xs">02</span>
                <Cpu className="w-4 h-4 text-text-dim" />
              </div>
              <h3 className="font-display font-semibold text-sm text-text">
                Signal Parsing
              </h3>
              <p className="text-xs text-text-dim font-sans leading-relaxed">
                Deterministic regex pipelines identify languages, frameworks, databases, cache layers, and message brokers with zero hallucination.
              </p>
            </Card>

            <Card variant="default" padding="md" className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-accent font-bold text-xs">03</span>
                <HelpCircle className="w-4 h-4 text-text-dim" />
              </div>
              <h3 className="font-display font-semibold text-sm text-text">
                Ground Truth Drill
              </h3>
              <p className="text-xs text-text-dim font-sans leading-relaxed">
                A Socratic interview drill asks the 2-3 critical questions that expose weak claims: scale, trade-offs, and failure recovery.
              </p>
            </Card>

            <Card variant="default" padding="md" className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-accent font-bold text-xs">04</span>
                <ShieldCheck className="w-4 h-4 text-text-dim" />
              </div>
              <h3 className="font-display font-semibold text-sm text-text">
                Grounded Synthesis
              </h3>
              <p className="text-xs text-text-dim font-sans leading-relaxed">
                Synthesizes Google X-Y-Z bullets, complete with verbatim evidence lineage badges and a spoken technical defense script.
              </p>
            </Card>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <Badge variant="neutral" size="sm">
              Engine Capabilities
            </Badge>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text">
              Engineered for Developers
            </h2>
            <p className="text-xs text-text-dim">
              Built specifically to pass senior software engineering resume screens and system design interview rounds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card variant="surface2" padding="md" className="space-y-2">
              <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center text-accent">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-text font-display">
                Anti-Fabrication Net (§8)
              </h3>
              <p className="text-xs text-text-dim leading-relaxed">
                Every generated metric and claim is tested against the source corpus. Unsubstantiated claims are immediately flagged or stripped.
              </p>
            </Card>

            <Card variant="surface2" padding="md" className="space-y-2">
              <div className="w-8 h-8 rounded bg-warn/10 flex items-center justify-center text-warn">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-text font-display">
                Interviewer Hotseat Simulator
              </h3>
              <p className="text-xs text-text-dim leading-relaxed">
                Interactive modal simulates grilling by senior staff engineers, offering targeted follow-up questions to test your depth.
              </p>
            </Card>

            <Card variant="surface2" padding="md" className="space-y-2">
              <div className="w-8 h-8 rounded bg-ok/10 flex items-center justify-center text-ok">
                <GitBranch className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-text font-display">
                Traceable Evidence Lineage
              </h3>
              <p className="text-xs text-text-dim leading-relaxed">
                Click any bullet to inspect its exact source evidence: README sections, manifest packages, and your verified Truth Drill answers.
              </p>
            </Card>

            <Card variant="surface2" padding="md" className="space-y-2">
              <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center text-accent">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-text font-display">
                Swappable Puter Models
              </h3>
              <p className="text-xs text-text-dim leading-relaxed">
                Choose between OpenAI GPT-5, Alibaba Qwen Max, Anthropic Claude, and Google Gemini with lightning-fast low-latency execution.
              </p>
            </Card>

            <Card variant="surface2" padding="md" className="space-y-2">
              <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center text-accent">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-text font-display">
                Zero-Backend Architecture
              </h3>
              <p className="text-xs text-text-dim leading-relaxed">
                No third-party databases, no telemetry, and no centralized storage. Your session data is safely stored in your own Puter KV store.
              </p>
            </Card>

            <Card variant="surface2" padding="md" className="space-y-2">
              <div className="w-8 h-8 rounded bg-ok/10 flex items-center justify-center text-ok">
                <Code2 className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-text font-display">
                Markdown & JSON Export
              </h3>
              <p className="text-xs text-text-dim leading-relaxed">
                Instantly copy or download clean, ATS-compliant bullet points and complete technical dossiers for your resume and prep notes.
              </p>
            </Card>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="rounded-xl border border-border bg-surface p-8 sm:p-12 text-center space-y-6">
          <div className="max-w-xl mx-auto space-y-3">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text">
              Ready to build interview-proof bullets?
            </h2>
            <p className="text-xs sm:text-sm text-text-dim">
              Launch the workspace and audit your first project in less than a minute.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/app" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full shadow-lg shadow-(--color-accent)/15">
                <span>Launch Main Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full">
                <span>Sign In to Puter</span>
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 bg-surface/30">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-dim font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-text font-display">Proof</span>
            <span>&bull;</span>
            <span>Architectural Extraction & Grounding Engine</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/app" className="hover:text-text transition">
              Main App
            </Link>
            <Link to="/login" className="hover:text-text transition">
              Sign In
            </Link>
            <Link to="/wipe" className="hover:text-text transition">
              Reset Data
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
