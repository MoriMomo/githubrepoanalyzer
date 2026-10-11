import * as React from "react";
import { Link, useNavigate } from "react-router";
import { ShieldCheck, ArrowRight, Plus } from "lucide-react";
import { usePuterStore } from "~/lib/puter";
import { CommandMenu } from "~/components/CommandMenu";
import { AVAILABLE_MODELS } from "~/lib/prompts";

export interface NavbarProps {
  mode?: "home" | "app" | "project";
  projectMeta?: {
    projectId: string;
    phase: string;
    selectedModel?: string;
    onSelectModel?: (model: string) => void;
    onExport?: () => void;
    onReset?: () => void;
  };
}

export function Navbar({ mode = "home", projectMeta }: NavbarProps) {
  const { auth } = usePuterStore();
  const navigate = useNavigate();

  const handleCreateNewProject = () => {
    navigate("/project/new");
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
      <div className="relative pointer-events-auto flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 py-2 bg-black text-white border-b border-x border-white/10 rounded-b-[20px] shadow-2xl backdrop-blur-2xl max-w-5xl w-full sm:w-auto">
        {/* Left Concave Notch Ear Fillet */}
        <svg
          className="absolute -left-4 top-0 w-4 h-4 text-black fill-current pointer-events-none hidden sm:block"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path d="M0,0 A 16 16 0 0 0 16 16 L 16 0 Z" />
        </svg>

        {/* Right Concave Notch Ear Fillet */}
        <svg
          className="absolute -right-4 top-0 w-4 h-4 text-black fill-current pointer-events-none hidden sm:block"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path d="M16,0 A 16 16 0 0 1 0 16 L 0 0 Z" />
        </svg>

        {/* Brand Section (Glossy squircle app icon + Proof wordmark) */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to={mode === "home" ? "/" : "/app"}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            {/* macOS / iOS style glossy squircle app icon */}
            <div className="relative w-7 h-7 rounded-[8px] bg-gradient-to-b from-sky-400 via-blue-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 ring-1 ring-white/30 overflow-hidden group-hover:scale-105 transition-transform">
              {/* Glossy top shine */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-white/30 rounded-t-[7px] pointer-events-none" />
              <ShieldCheck className="w-4 h-4 drop-shadow-sm" />
            </div>

            <span className="font-display font-bold text-sm tracking-tight text-white group-hover:text-neutral-200 transition-colors">
              Proof
            </span>
          </Link>
        </div>

        {/* Middle Navigation Links (Pure text, NO dots, NO status badges) */}
        {mode === "home" && (
          <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-xs font-medium text-neutral-400 font-sans">
            <a
              href="#reality-check"
              className="hover:text-white transition-colors duration-150"
            >
              Reality Check
            </a>
            <a
              href="#pipeline"
              className="hover:text-white transition-colors duration-150"
            >
              How It Works
            </a>
            <a
              href="#auditor"
              className="hover:text-white transition-colors duration-150"
            >
              Risk Auditor
            </a>
            <a
              href="#capabilities"
              className="hover:text-white transition-colors duration-150"
            >
              Playbook
            </a>
          </nav>
        )}

        {mode === "app" && (
          <nav className="hidden sm:flex items-center gap-5 text-xs font-medium text-neutral-400 font-sans">
            <Link to="/app" className="text-white hover:text-white transition-colors">
              Projects
            </Link>
            <Link
              to="/project/new"
              className="hover:text-white transition-colors"
            >
              New Audit
            </Link>
            <Link
              to="/project/audit-demo"
              className="hover:text-white transition-colors"
            >
              Audit Demo
            </Link>
          </nav>
        )}

        {mode === "project" && (
          <div className="hidden md:flex items-center gap-3 text-xs font-medium text-neutral-400 font-sans">
            <Link to="/app" className="hover:text-white transition-colors">
              Projects
            </Link>
            <span className="text-neutral-600">/</span>
            <span className="text-white font-mono text-[11px]">
              {projectMeta?.phase === "input"
                ? "Ingest"
                : projectMeta?.phase === "analysis"
                  ? "Signals"
                  : projectMeta?.phase === "drill"
                    ? "Truth Drill"
                    : "Playbook"}
            </span>
          </div>
        )}

        {/* Right CTA / Action Section */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <CommandMenu />

          {mode === "home" && (
            <>
              {auth.isAuthenticated ? (
                <Link
                  to="/app"
                  className="bg-white text-black font-semibold text-xs px-3.5 py-1.5 rounded-full hover:bg-neutral-200 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-xs text-neutral-400 hover:text-white transition-colors px-2 py-1 hidden sm:inline"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/project/new"
                    className="bg-white text-black font-semibold text-xs px-3.5 py-1.5 rounded-full hover:bg-neutral-200 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </>
          )}

          {mode === "app" && (
            <button
              type="button"
              onClick={handleCreateNewProject}
              className="bg-white text-black font-semibold text-xs px-3.5 py-1.5 rounded-full hover:bg-neutral-200 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Scan</span>
            </button>
          )}

          {mode === "project" && (
            <div className="flex items-center gap-2">
              {projectMeta?.selectedModel && (
                <select
                  value={projectMeta.selectedModel}
                  onChange={(e) => projectMeta.onSelectModel?.(e.target.value)}
                  className="bg-transparent text-[11px] font-mono text-neutral-400 hover:text-white cursor-pointer focus:outline-none border-none py-1 hidden lg:block"
                >
                  {AVAILABLE_MODELS.map((m) => (
                    <option key={m.id} value={m.id} className="bg-black text-white">
                      {m.name}
                    </option>
                  ))}
                </select>
              )}
              {projectMeta?.onReset && (
                <button
                  type="button"
                  onClick={projectMeta.onReset}
                  className="text-xs text-neutral-400 hover:text-white transition-colors px-2 py-1 font-mono hidden sm:inline cursor-pointer"
                >
                  Reset
                </button>
              )}
              <Link
                to="/app"
                className="bg-white text-black font-semibold text-xs px-3.5 py-1.5 rounded-full hover:bg-neutral-200 transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
              >
                <span>Workspace</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
