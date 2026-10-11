import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  Loader2,
  Copy,
  CheckCircle2,
  Lock,
  ChevronDown,
} from "lucide-react";
import { usePuterStore } from "~/lib/puter";
import { parseSource } from "~/lib/parse";
import {
  MODEL,
  AVAILABLE_MODELS,
  DEFAULT_AI_OPTIONS,
  buildStage1Prompt,
  buildStage2Prompt,
} from "~/lib/prompts";
import { enforceGrounding } from "~/lib/grounding";
import {
  generateSimulationClaims,
  generateSimulationBullets,
} from "~/lib/fallback";
import { extractAIText, parseAIJson, formatErrorMessage } from "~/lib/utils";
import { SessionStorageAdapter } from "~/lib/storage";
import { SourceInput } from "~/components/SourceInput";
import { StackBadges } from "~/components/StackBadges";
import { TruthDrill } from "~/components/TruthDrill";
import { BulletCard } from "~/components/BulletCard";
import { BulletAuditor } from "~/components/BulletAuditor";
import { CommandMenu } from "~/components/CommandMenu";
import { ExportDropdown } from "~/components/ui/ExportDropdown";
import { toast } from "sonner";
import { Button, Badge, Card, Panel, MotionView, Tooltip } from "~/components/ui";
import type {
  ProjectSession,
  SignalSet,
  Claim,
  TruthDrillQuestion,
  Bullet,
  SessionPhase,
} from "~/../types";

export default function ProjectPage() {
  const params = useParams();
  const { auth, kv, ai } = usePuterStore();

  const projectId = params.id || "new";

  const [phase, setPhase] = useState<SessionPhase>("input");
  const [selectedModel, setSelectedModel] = useState<string>(MODEL);
  const [sourceType, setSourceType] = useState<"paste" | "github" | "file">("paste");
  const [sourceRef, setSourceRef] = useState<string>("Pasted Project");
  const [signals, setSignals] = useState<SignalSet | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [drillQuestions, setDrillQuestions] = useState<TruthDrillQuestion[]>([]);
  const [drillAnswers, setDrillAnswers] = useState<Record<string, string>>({});
  const [bullets, setBullets] = useState<Bullet[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [statusError, setStatusError] = useState<string | null>(null);
  const [rawPastedSource, setRawPastedSource] = useState("");
  const [isPersisting, setIsPersisting] = useState(false);

  // Compute grounded corpus for live anti-fabrication audits
  const activeSource = signals?.rawSource || rawPastedSource;
  const groundedCorpus =
    activeSource + " " + Object.values(drillAnswers).join(" ");

  const createdAtRef = useRef<number>(Date.now());
  const versionRef = useRef<number>(1);

  // Restore session from local-first storage (localStorage + Puter KV)
  useEffect(() => {
    async function loadSavedSession() {
      if (projectId === "new") return;

      try {
        const session = await SessionStorageAdapter.getSession(
          projectId,
          kv,
          auth.isAuthenticated,
        );
        if (session) {
          if (session.createdAt) createdAtRef.current = session.createdAt;
          if (session.version) versionRef.current = session.version;
          setPhase(session.phase);
          setSignals(session.signals);
          setClaims(session.claims || []);
          setDrillQuestions(session.drillQuestions || []);
          setDrillAnswers(session.drillAnswers || {});
          setBullets(session.bullets || []);
          setSourceType(session.sourceType || "paste");
          setSourceRef(session.sourceRef || "Project");
          if (session.modelUsed) setSelectedModel(session.modelUsed);
        }
      } catch (err) {
        console.error("Failed to restore session from storage", err);
      }
    }

    loadSavedSession();
  }, [projectId, auth.isAuthenticated, kv]);

  // Persist current session state (always saves to localStorage; syncs to Puter KV if authenticated)
  const persistSession = useCallback(
    async (updates: Partial<ProjectSession> = {}) => {
      setIsPersisting(true);
      versionRef.current += 1;

      const sessionData: ProjectSession = {
        id: projectId,
        phase: updates.phase || phase,
        sourceType: updates.sourceType || sourceType,
        sourceRef: updates.sourceRef || sourceRef,
        signals: updates.signals || signals || parseSource(""),
        claims: updates.claims || claims,
        drillQuestions: updates.drillQuestions || drillQuestions,
        drillAnswers: updates.drillAnswers || drillAnswers,
        bullets: updates.bullets || bullets,
        modelUsed: updates.modelUsed || selectedModel,
        createdAt: updates.createdAt || createdAtRef.current,
        updatedAt: Date.now(),
        version: updates.version || versionRef.current,
      };

      try {
        await SessionStorageAdapter.saveSession(
          sessionData,
          kv,
          auth.isAuthenticated,
        );
      } catch (err) {
        console.error("Failed to persist session to storage", err);
      } finally {
        setIsPersisting(false);
      }
    },
    [
      auth.isAuthenticated,
      projectId,
      phase,
      sourceType,
      sourceRef,
      signals,
      claims,
      drillQuestions,
      drillAnswers,
      bullets,
      selectedModel,
      kv,
    ],
  );

  // STEP 1: Source Ingested -> Deterministic Parse -> AI Claim Structuring (Stage 1)
  const handleScanSource = async (
    rawText: string,
    newSourceType: "paste" | "github" | "file" = "paste",
    newSourceRef: string = "Project Source",
  ) => {
    setStatusError(null);
    setRawPastedSource(rawText);
    setSourceType(newSourceType);
    setSourceRef(newSourceRef);

    // 1. Deterministic parse (pure, instant, zero AI)
    const extractedSignals = parseSource(rawText);
    setSignals(extractedSignals);
    setPhase("analysis");
    setIsLoading(true);
    setLoadingMessage(
      `Structuring candidate claims with ${selectedModel}...`,
    );

    try {
      let resolvedClaims: Claim[] = [];
      let resolvedQuestions: TruthDrillQuestion[] = [];

      try {
        const prompt = buildStage1Prompt(extractedSignals);
        const res = await ai.chat(prompt, { ...DEFAULT_AI_OPTIONS, model: selectedModel });
        const rawAiText = extractAIText(res?.message?.content);
        if (rawAiText) {
          const parsed = parseAIJson<{
            claims: Claim[];
            questions: TruthDrillQuestion[];
          }>(rawAiText);
          if (parsed?.claims && parsed.claims.length > 0) {
            resolvedClaims = parsed.claims;
            resolvedQuestions = parsed.questions || [];
          }
        }
      } catch (aiErr) {
        console.warn("Live AI chat unavailable, using architectural simulation", aiErr);
      }

      // If AI didn't return or was offline, generate deterministic simulated claims
      if (resolvedClaims.length === 0) {
        const sim = generateSimulationClaims(extractedSignals);
        resolvedClaims = sim.claims;
        resolvedQuestions = sim.questions;
      }

      setClaims(resolvedClaims);
      setDrillQuestions(resolvedQuestions);

      if (resolvedQuestions.length > 0) {
        setPhase("drill");
        await persistSession({
          signals: extractedSignals,
          claims: resolvedClaims,
          drillQuestions: resolvedQuestions,
          sourceType: newSourceType,
          sourceRef: newSourceRef,
          phase: "drill",
          modelUsed: selectedModel,
        });
      } else {
        await handleSynthesize(resolvedClaims, {}, extractedSignals);
      }
    } catch (err) {
      console.error("Stage 1 analysis failed", err);
      setStatusError(
        `AI structuring encountered an issue: ${formatErrorMessage(err)}. You can retry or verify your input.`,
      );
      setPhase("input");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  // STEP 3 & 4: Truth Drill answers submitted -> Stage 2 synthesis -> Grounding validation
  const handleSynthesize = async (
    targetClaims: Claim[],
    answers: Record<string, string>,
    targetSignals?: SignalSet,
  ) => {
    setStatusError(null);
    setIsLoading(true);
    setLoadingMessage(
      "Synthesizing Google X-Y-Z bullets and running anti-fabrication validation...",
    );

    const activeSignals = targetSignals || signals || parseSource(rawPastedSource);
    setDrillAnswers(answers);

    try {
      let generatedBullets: Bullet[] = [];

      try {
        const prompt = buildStage2Prompt(activeSignals, targetClaims, answers);
        const res = await ai.chat(prompt, { ...DEFAULT_AI_OPTIONS, model: selectedModel });
        const rawAiText = extractAIText(res?.message?.content);
        if (rawAiText) {
          const parsed = parseAIJson<Bullet[]>(rawAiText);
          if (Array.isArray(parsed) && parsed.length > 0) {
            generatedBullets = parsed;
          }
        }
      } catch (aiErr) {
        console.warn("Live synthesis call unavailable, using simulation", aiErr);
      }

      // If AI was offline or returned empty, generate simulated bullets
      if (generatedBullets.length === 0) {
        generatedBullets = generateSimulationBullets(activeSignals, targetClaims, answers);
      }

      // 4. Deterministic Anti-Fabrication Pass (ARCHITECTURE.md §8)
      const currentCorpus =
        activeSignals.rawSource + " " + Object.values(answers).join(" ");
      const validatedBullets = enforceGrounding(generatedBullets, currentCorpus);

      setBullets(validatedBullets);
      setPhase("output");

      await persistSession({
        signals: activeSignals,
        claims: targetClaims,
        drillAnswers: answers,
        bullets: validatedBullets,
        phase: "output",
        modelUsed: selectedModel,
      });
    } catch (err) {
      console.error("Stage 2 synthesis failed", err);
      setStatusError(`Bullet synthesis failed: ${formatErrorMessage(err)}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleUpdateBullet = (index: number, updated: Bullet) => {
    const nextBullets = [...bullets];
    nextBullets[index] = updated;
    setBullets(nextBullets);
    persistSession({ bullets: nextBullets });
  };

  const handleStartOver = () => {
    if (confirm("Reset current project workspace and begin a new scan?")) {
      setPhase("input");
      setSignals(null);
      setClaims([]);
      setDrillQuestions([]);
      setDrillAnswers({});
      setBullets([]);
      setRawPastedSource("");
      setStatusError(null);
    }
  };

  // One-Click Export Handlers
  const handleExportText = () => {
    const textOutput = bullets
      .map((b) => `• [${b.category.toUpperCase()}] ${b.text}`)
      .join("\n\n");

    const blob = new Blob([textOutput], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `proof-${projectId}-bullets.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportLatex = () => {
    const latexLines = [
      "% Proof Generated Defensible Resume Bullets (Overleaf / Jake's Resume format)",
      "\\resumeItemListStart",
      ...bullets.map(
        (b) =>
          `  \\resumeItem{${b.text.replace(/%/g, "\\%").replace(/&/g, "\\&").replace(/_/g, "\\_")}}`,
      ),
      "\\resumeItemListEnd",
    ].join("\n");

    const blob = new Blob([latexLines], { type: "text/x-tex;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `proof-${projectId}-bullets.tex`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    const mdLines = [
      `# Resume Bullets — ${sourceRef}`,
      "",
      ...bullets.map((b) => `- **${b.category.toUpperCase()}**: ${b.text}`),
      "",
      "## Interview Defense Playbook",
      ...bullets.map(
        (b) =>
          `### ${b.category.toUpperCase()}\n- **Question:** "${b.defense.question}"\n- **Defense Script:** "${b.defense.script}"${
            b.defense.codeProof ? `\n- **Code Proof Anchor:** \`${b.defense.codeProof}\`` : ""
          }${
            b.defense.tradeOffRationale ? `\n- **Trade-off Rationale:** ${b.defense.tradeOffRationale}` : ""
          }\n- **Traceability:** ${b.grounding.join(", ")}`,
      ),
    ].join("\n\n");

    const blob = new Blob([mdLines], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `proof-${projectId}-bullets.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const payload = {
      projectId,
      sourceType,
      sourceRef,
      modelUsed: selectedModel,
      bullets,
      signals,
      drillAnswers,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `proof-${projectId}-export.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      {/* Top Application Header */}
      <header className="border-b border-border bg-bg/85 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/app"
              className="text-xs text-text-dim hover:text-text transition-colors flex items-center gap-1.5 font-mono"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </Link>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-accent/15 border border-accent/30 text-accent font-mono font-bold text-xs flex items-center justify-center">
                P
              </span>
              <span className="font-display font-extrabold text-sm tracking-tight text-text">
                PROOF
              </span>
              <Badge variant="accent" size="sm">
                ANALYSIS
              </Badge>
            </div>

            {/* Model Selector Dropdown */}
            <div className="relative hidden sm:block">
              <select
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  persistSession({ modelUsed: e.target.value });
                }}
                disabled={isLoading}
                className="bg-surface border border-border text-[11px] font-mono text-accent rounded-md px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer hover:border-border-strong transition-colors"
                title="Swappable AI Model (Anti-fabrication safety net enforces grounding regardless of model)"
              >
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.vendor})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <CommandMenu
              selectedModel={selectedModel}
              onSelectModel={(m) => {
                setSelectedModel(m);
                persistSession({ modelUsed: m });
              }}
              onCopyAll={
                bullets.length > 0
                  ? () => {
                      const allText = bullets.map((b) => `• ${b.text}`).join("\n\n");
                      navigator.clipboard.writeText(allText);
                      toast.success(`Copied all ${bullets.length} bullets to clipboard`);
                    }
                  : undefined
              }
              onExport={
                bullets.length > 0
                  ? (format) => {
                      if (format === "latex") handleExportLatex();
                      else if (format === "markdown") handleExportMarkdown();
                      else if (format === "txt") handleExportText();
                      else if (format === "json") handleExportJson();
                    }
                  : undefined
              }
            />
            {isPersisting ? (
              <span className="text-[11px] text-accent font-mono animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span>Syncing KV...</span>
              </span>
            ) : auth.isAuthenticated ? (
              <span className="text-[11px] text-text-dim font-mono hidden md:flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-ok" />
                <span>Encrypted Vault Active</span>
              </span>
            ) : null}

            {!auth.isAuthenticated && (
              <Link
                to={`/auth?next=/project/${projectId}`}
                className="text-warn hover:underline transition-colors text-[11px] font-mono flex items-center gap-1"
              >
                <Lock className="w-3 h-3" />
                <span>Sign in to save</span>
              </Link>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleStartOver}
              className="font-mono text-[11px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Scan</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Sticky Horizontal Phase Stepper Bar */}
      <div className="border-b border-border bg-surface/95 backdrop-blur-md sticky top-14 z-20 top-highlight shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto">
            {/* Step 1: Ingest */}
            <Tooltip content="Ingest architecture via README, package manifests, file dropzone, or GitHub CDN" side="bottom">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                  phase === "input"
                    ? "bg-accent/15 border border-accent/40 text-accent font-semibold"
                    : signals
                      ? "text-ok bg-ok/10 border border-ok/20"
                      : "text-text-dim bg-surface-2/40 border border-border"
                }`}
              >
                <span className="font-bold">
                  {signals ? "✓" : "1."}
                </span>
                <span>Ingest</span>
              </div>
            </Tooltip>

            <span className="text-border text-[11px]">/</span>

            {/* Step 2: Signals */}
            <Tooltip content="Deterministic AST regex parsing & candidate claim extraction" side="bottom">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                  phase === "analysis"
                    ? "bg-accent/15 border border-accent/40 text-accent font-semibold animate-pulse"
                    : signals
                      ? "text-ok bg-ok/10 border border-ok/20"
                      : "text-text-dim bg-surface-2/40 border border-border"
                }`}
              >
                <span className="font-bold">
                  {signals ? "✓" : "2."}
                </span>
                <span>Signals & Claims</span>
              </div>
            </Tooltip>

            <span className="text-border text-[11px]">/</span>

            {/* Step 3: Truth Drill */}
            <Tooltip content="Interactive 2-question interview cross-examination to uncover real implementation details" side="bottom">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                  phase === "drill"
                    ? "bg-warn/15 border border-warn/40 text-warn font-semibold animate-pulse"
                    : phase === "output"
                      ? "text-ok bg-ok/10 border border-ok/20"
                      : "text-text-dim bg-surface-2/40 border border-border"
                }`}
              >
                <span className="font-bold">
                  {phase === "output" ? "✓" : "3."}
                </span>
                <span>Truth Drill</span>
              </div>
            </Tooltip>

            <span className="text-border text-[11px]">/</span>

            {/* Step 4: Output */}
            <Tooltip content="Audited Google X-Y-Z bullets and spoken defense scripts" side="bottom">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                  phase === "output"
                    ? "bg-accent/15 border border-accent/40 text-accent font-semibold"
                    : "text-text-dim bg-surface-2/40 border border-border"
                }`}
              >
                <span className="font-bold">4.</span>
                <span>Defense Playbook</span>
              </div>
            </Tooltip>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-text-dim hidden md:flex font-mono">
            <span className="text-text-muted">Target:</span>
            <span className="text-text font-medium truncate max-w-xs">{sourceRef}</span>
          </div>
        </div>
      </div>

      {/* Status Bar / Error Banner */}
      {statusError && (
        <div className="bg-flag/10 border-b border-flag/30 px-6 py-2.5 text-xs text-flag flex items-center justify-between gap-3 animate-fade-in font-mono">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{statusError}</span>
          </div>
          <button
            onClick={() => setStatusError(null)}
            className="text-flag hover:opacity-80 p-1 cursor-pointer font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Main Split-Screen Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Input, Badges, or Source Traceability */}
        <div className="lg:col-span-5 space-y-5">
          {phase === "input" ? (
            <SourceInput
              onScan={handleScanSource}
              isLoading={isLoading}
            />
          ) : (
            <div className="space-y-4">
              {/* Stack Badges Card */}
              {signals && (
                <Panel
                  title="Verifiable Signals"
                  subtitle={`${sourceRef} (${sourceType})`}
                  badge={
                    <Badge variant="ok" size="sm">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>AST Parse OK</span>
                    </Badge>
                  }
                >
                  <StackBadges signals={signals} />
                </Panel>
              )}

              {/* Declared Features / Traceability Panel */}
              {signals && signals.declaredFeatures.length > 0 && (
                <Panel title="Extracted Capabilities">
                  <ul className="space-y-2 text-xs text-text font-sans">
                    {signals.declaredFeatures.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-accent font-bold mr-1">&bull;</span>
                        <span className="leading-relaxed">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </Panel>
              )}

              {/* Collapsible Raw Source Viewer for Truth Audit */}
              {signals?.rawSource && (
                <details className="rounded-lg border border-border bg-surface p-3.5 text-xs group shadow-xs">
                  <summary className="font-mono text-[11px] text-text-dim cursor-pointer hover:text-text list-none flex items-center justify-between select-none">
                    <span className="font-medium">Inspect Raw Source (Audit Trail)</span>
                    <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
                  </summary>
                  <pre className="mt-3 p-3 bg-bg rounded-lg text-[11px] font-mono text-text-dim overflow-x-auto max-h-60 leading-normal border border-border">
                    {signals.rawSource}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Pipeline Progress, Truth Drill, or Final Bullets */}
        <div className="lg:col-span-7 space-y-5">
          {isLoading ? (
            <div className="h-96 rounded-xl bg-surface border border-border flex flex-col items-center justify-center p-8 text-center space-y-4 shadow-xs">
              <div className="relative">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-display font-bold text-sm tracking-tight text-text">
                  Grounding Pipeline Active
                </h3>
                <p className="text-xs text-text-dim max-w-sm font-mono text-[11px] leading-relaxed">
                  {loadingMessage || "Processing architecture signals..."}
                </p>
              </div>
            </div>
          ) : phase === "input" ? (
            /* Explainer Panel for Input Phase */
            <div className="rounded-xl border border-border bg-surface p-6 sm:p-7 space-y-6 shadow-xs">
              <div className="space-y-2">
                <Badge variant="accent" size="sm">
                  <ShieldCheck className="w-3 h-3" />
                  <span>The Anti-Fabrication Guarantee</span>
                </Badge>
                <h2 className="font-display font-bold text-lg sm:text-xl text-text tracking-tight">
                  Why Other AI Resume Checkers Fail You
                </h2>
                <p className="text-xs text-text-dim leading-relaxed font-sans">
                  Generic tools invent metrics like <span className="text-flag font-mono font-medium">&ldquo;improved query efficiency by 40%&rdquo;</span> for candidates who never ran a benchmark. In technical interviews, senior engineers ask: <span className="text-warn italic font-medium">&ldquo;How did you measure that 40%? What profiling tool did you use?&rdquo;</span> — and candidates freeze.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Card variant="surface2" padding="md" className="space-y-1.5 border-border">
                  <span className="text-xs font-bold text-accent font-mono">
                    01. Extraction
                  </span>
                  <p className="text-[11px] text-text-dim font-sans leading-relaxed">
                    We parse concrete dependencies (Redis, Postgres, Docker, CI) directly from manifests or GitHub CDN.
                  </p>
                </Card>
                <Card variant="surface2" padding="md" className="space-y-1.5 border-border">
                  <span className="text-xs font-bold text-warn font-mono">
                    02. Truth Drill
                  </span>
                  <p className="text-[11px] text-text-dim font-sans leading-relaxed">
                    2–3 targeted questions uncover the exact mechanisms you genuinely implemented.
                  </p>
                </Card>
                <Card variant="surface2" padding="md" className="space-y-1.5 border-border">
                  <span className="text-xs font-bold text-ok font-mono">
                    03. Defense Playbook
                  </span>
                  <p className="text-[11px] text-text-dim font-sans leading-relaxed">
                    Every Google X-Y-Z bullet includes a ready-to-speak interview defense answer.
                  </p>
                </Card>
              </div>

              <div className="p-4 rounded-lg bg-surface-2 border border-border text-xs text-text-dim space-y-1">
                <span className="font-bold text-text font-mono text-[11px]">
                  Deterministic Safety Pass (§8 Contract):
                </span>
                <p className="font-sans leading-relaxed text-[11px]">
                  Even if an underlying AI model outputs an ungrounded metric, our validator strips it and flags the omission before you copy or export the bullet.
                </p>
              </div>
            </div>
          ) : phase === "drill" ? (
            /* Truth Drill Phase with Motion */
            <MotionView animationKey="drill">
              <TruthDrill
                questions={drillQuestions}
                claims={claims}
                onSubmit={(answers) => handleSynthesize(claims, answers)}
                isLoading={isLoading}
              />
            </MotionView>
          ) : phase === "output" ? (
            /* Output Phase with Motion */
            <MotionView animationKey="output" className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface border border-border rounded-xl p-4.5 shadow-xs">
                <div>
                  <h3 className="font-display font-bold text-xs sm:text-sm tracking-tight text-text">
                    Grounded Resume Bullets & Defense Playbook
                  </h3>
                  <p className="text-[11px] text-text-dim font-mono">
                    Audited with {selectedModel} in Google X-Y-Z standard.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const allText = bullets.map((b) => `• ${b.text}`).join("\n\n");
                      navigator.clipboard.writeText(allText);
                      toast.success(`Copied all ${bullets.length} bullets to clipboard`);
                    }}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy All</span>
                  </Button>
                  <ExportDropdown
                    onExportLatex={handleExportLatex}
                    onExportMarkdown={handleExportMarkdown}
                    onExportText={handleExportText}
                    onExportJson={handleExportJson}
                  />
                </div>
              </div>

              <div className="space-y-4">
                {bullets.map((bullet, idx) => (
                  <div key={idx} className="bullet-card-item">
                    <BulletCard
                      bullet={bullet}
                      claims={claims}
                      drillAnswers={drillAnswers}
                      activeModel={selectedModel}
                      groundedCorpus={groundedCorpus}
                      onUpdateBullet={(updated) => handleUpdateBullet(idx, updated)}
                    />
                  </div>
                ))}
              </div>

              {/* Existing Bullet Auditor (Before vs After) */}
              <BulletAuditor
                groundedCorpus={groundedCorpus}
                recommendedBullets={bullets}
              />
            </MotionView>
          ) : null}
        </div>
      </div>
    </div>
  );
}
