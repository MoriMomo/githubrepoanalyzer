import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  Loader2,
  Copy,
  FileCode,
  FileText,
  Download,
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
import { useGSAP, staggerFadeUp } from "~/lib/gsap";
import { SourceInput } from "~/components/SourceInput";
import { StackBadges } from "~/components/StackBadges";
import { TruthDrill } from "~/components/TruthDrill";
import { BulletCard } from "~/components/BulletCard";
import { BulletAuditor } from "~/components/BulletAuditor";
import { Button, Badge, Card, Panel, MotionView } from "~/components/ui";
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
  const [sourceType, setSourceType] = useState<"paste" | "github">("paste");
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

  const outputListRef = useRef<HTMLDivElement>(null);

  // GSAP animation: Stagger in bullet cards when output phase is active
  useGSAP(
    () => {
      if (phase === "output" && bullets.length > 0) {
        staggerFadeUp(".bullet-card-item", {
          stagger: 0.08,
          duration: 0.35,
          y: 12,
        });
      }
    },
    [phase, bullets.length],
    outputListRef,
  );

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
    newSourceType: "paste" | "github" = "paste",
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
    <div className="min-h-screen flex flex-col">
      {/* Top Header */}
      <header className="border-b border-border bg-bg/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-13 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/app"
              className="text-xs text-text-dim hover:text-text transition flex items-center gap-1.5 font-mono"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Main App</span>
            </Link>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xs tracking-tight text-text">
                Proof
              </span>
              <Badge variant="accent" size="sm">
                v1.0
              </Badge>
            </div>

            {/* Model Selector Dropdown */}
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  persistSession({ modelUsed: e.target.value });
                }}
                disabled={isLoading}
                className="bg-surface border border-border text-[11px] font-mono text-accent rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
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
            {isPersisting && (
              <span className="text-[11px] text-text-dim font-mono animate-pulse">
                Saving to Puter KV...
              </span>
            )}
            {!auth.isAuthenticated && (
              <Link
                to={`/auth?next=/project/${projectId}`}
                className="text-warn hover:underline transition text-[11px] font-mono flex items-center gap-1"
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
              <RotateCcw className="w-3 h-3" />
              <span>New Scan</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Status Bar / Error Banner */}
      {statusError && (
        <div className="bg-flag/10 border-b border-flag/30 px-6 py-2.5 text-xs text-flag flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{statusError}</span>
          </div>
          <button
            onClick={() => setStatusError(null)}
            className="text-flag hover:opacity-80 p-1"
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
                      <span>Deterministic Parse OK</span>
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
                <details className="rounded-md border border-border bg-surface p-3 text-xs group">
                  <summary className="font-mono text-[11px] text-text-dim cursor-pointer hover:text-text list-none flex items-center justify-between select-none">
                    <span>Inspect Raw Source (Audit Trail)</span>
                    <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
                  </summary>
                  <pre className="mt-3 p-3 bg-bg rounded-md text-[11px] font-mono text-text-dim overflow-x-auto max-h-60 leading-normal border border-border">
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
            <div className="h-96 rounded-md bg-surface border border-border flex flex-col items-center justify-center p-8 text-center space-y-4">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
              <div className="space-y-1">
                <h3 className="font-display font-semibold text-xs tracking-tight text-text">
                  Grounding Pipeline Active
                </h3>
                <p className="text-xs text-text-dim max-w-sm font-mono text-[11px]">
                  {loadingMessage || "Processing architecture signals..."}
                </p>
              </div>
            </div>
          ) : phase === "input" ? (
            /* Explainer Panel for Input Phase */
            <div className="rounded-md border border-border bg-surface p-6 space-y-6">
              <div className="space-y-2">
                <Badge variant="accent" size="sm">
                  <ShieldCheck className="w-3 h-3" />
                  <span>The Anti-Fabrication Guarantee</span>
                </Badge>
                <h2 className="font-display font-bold text-lg text-text tracking-tight">
                  Why Other AI Resume Checkers Fail You
                </h2>
                <p className="text-xs text-text-dim leading-relaxed font-sans">
                  Generic tools invent metrics like <span className="text-flag font-mono">&ldquo;improved query efficiency by 40%&rdquo;</span> for candidates who never ran a benchmark. In technical interviews, senior engineers ask: <span className="text-warn italic">&ldquo;How did you measure that 40%? What profiling tool did you use?&rdquo;</span> — and candidates freeze.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Card variant="surface2" padding="sm" className="space-y-1.5">
                  <span className="text-xs font-semibold text-accent font-mono">
                    1. Deterministic Extraction
                  </span>
                  <p className="text-[11px] text-text-dim font-sans leading-relaxed">
                    We parse concrete dependencies (Redis, Postgres, Docker, CI) directly from manifests or GitHub CDN.
                  </p>
                </Card>
                <Card variant="surface2" padding="sm" className="space-y-1.5">
                  <span className="text-xs font-semibold text-warn font-mono">
                    2. The Truth Drill
                  </span>
                  <p className="text-[11px] text-text-dim font-sans leading-relaxed">
                    2–3 targeted questions uncover the exact mechanisms you genuinely implemented.
                  </p>
                </Card>
                <Card variant="surface2" padding="sm" className="space-y-1.5">
                  <span className="text-xs font-semibold text-ok font-mono">
                    3. Defense Scripts
                  </span>
                  <p className="text-[11px] text-text-dim font-sans leading-relaxed">
                    Every Google X-Y-Z bullet includes a ready-to-speak interview defense answer.
                  </p>
                </Card>
              </div>

              <div className="p-3.5 rounded-md bg-surface-2 border border-border text-xs text-text-dim space-y-1">
                <span className="font-semibold text-text font-mono text-[11px]">
                  Deterministic Safety Pass:
                </span>
                <p className="font-sans leading-relaxed text-[11px]">
                  Even if an AI model outputs an ungrounded metric, our validator strips it and flags the omission before you copy or export the bullet.
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface border border-border rounded-md p-4">
                <div>
                  <h3 className="font-display font-semibold text-xs tracking-tight text-text">
                    3 Grounded Bullets & Defense Cards
                  </h3>
                  <p className="text-[11px] text-text-dim font-mono">
                    Audited with {selectedModel} in Google X-Y-Z form.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const allText = bullets.map((b) => `• ${b.text}`).join("\n\n");
                      navigator.clipboard.writeText(allText);
                    }}
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy All</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleExportLatex}
                    title="Export as LaTeX resume items (\resumeItem{...})"
                  >
                    <FileCode className="w-3 h-3 text-purple-400" />
                    <span>LaTeX</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleExportMarkdown}
                    title="Export formatted markdown document with defense playbook"
                  >
                    <FileText className="w-3 h-3 text-indigo-400" />
                    <span>Markdown</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleExportText}
                  >
                    <span>TXT</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleExportJson}
                  >
                    <Download className="w-3 h-3 text-accent" />
                    <span>JSON</span>
                  </Button>
                </div>
              </div>

              <div ref={outputListRef} className="space-y-4">
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
