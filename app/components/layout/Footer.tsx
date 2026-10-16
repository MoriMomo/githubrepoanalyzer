import * as React from "react";
import { Link, useNavigate } from "react-router";
import {
  ShieldCheck,
  ArrowRight,
  GitBranch,
  Terminal,
  Zap,
  Lock,
  Code2,
  Sparkles,
} from "lucide-react";
import { generateUUID } from "~/lib/utils";

export interface FooterProps {
  onLaunchSample?: () => void;
  className?: string;
}

export function Footer({ onLaunchSample, className = "" }: FooterProps) {
  const navigate = useNavigate();
  const [repoInput, setRepoInput] = React.useState("");

  const handleAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = repoInput.trim();
    if (query) {
      navigate(`/app?repo=${encodeURIComponent(query)}`);
    } else {
      navigate("/app");
    }
  };

  const handleSampleClick = () => {
    if (onLaunchSample) {
      onLaunchSample();
    } else {
      const newId = generateUUID();
      navigate(`/project/${newId}`);
    }
  };

  return (
    <footer className={`relative w-full pt-16 sm:pt-24 bg-bg overflow-hidden ${className}`}>
      {/* Floating Callout Card Overlapping the Curved Sheet */}
      <div className="relative z-20 max-w-4xl lg:max-w-5xl mx-auto px-4 -mb-28 sm:-mb-36 md:-mb-40">
        <div className="relative rounded-[28px] sm:rounded-[36px] p-8 sm:p-12 md:p-14 overflow-hidden border border-white/10 sm:border-white/15 bg-gradient-to-b from-[#11141c]/95 via-[#0c0f16]/95 to-[#07090d] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-2xl text-center glow-card">
          {/* Subtle architectural grid pattern with radial vignette */}
          <div
            className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"
            aria-hidden="true"
          />

          {/* Electric Emerald Aurora Glow */}
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/15 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            {/* Top Micro Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-mono shadow-xs">
              <Zap className="w-3.5 h-3.5" />
              <span>Get Started in 60 Seconds &bull; Zero Sign-Up</span>
            </div>

            {/* High-Converting Display Headline */}
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl md:text-5xl text-text tracking-tight leading-[1.14]">
              Ready to build{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-emerald-300 to-teal-200">
                interview-proof
              </span>{" "}
              bullets?
            </h2>

            {/* Benefit-Driven Subtitle */}
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed font-sans">
              Scan any public repository to extract AST anchors, pass the Socratic Truth Drill, and arm yourself with pre-computed technical defense scripts.
            </p>

            {/* Action Input Capsule (Signature Overlapping Capsule UX) */}
            <form
              onSubmit={handleAuditSubmit}
              className="mt-6 sm:mt-8 w-full max-w-xl mx-auto relative flex flex-col sm:flex-row items-center bg-black/90 p-2 sm:p-1.5 sm:pl-4 rounded-2xl sm:rounded-full shadow-2xl border border-white/15 focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-accent/20 transition-all gap-2 sm:gap-0"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0 w-full px-2 sm:px-0">
                <GitBranch className="w-4 h-4 text-accent shrink-0" />
                <input
                  type="text"
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  placeholder="Paste GitHub URL (e.g. facebook/react) or package..."
                  className="w-full bg-transparent text-xs sm:text-sm text-text placeholder:text-zinc-500 focus:outline-none font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-accent text-black font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-full hover:bg-accent-dim hover:text-white transition-all duration-200 shrink-0 flex items-center justify-center gap-1.5 shadow-md shadow-accent/25 cursor-pointer"
              >
                <span>Audit Repo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Secondary Action & Trust Proof */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-zinc-400">
              <button
                type="button"
                onClick={handleSampleClick}
                className="text-zinc-400 hover:text-accent flex items-center gap-1.5 transition cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-accent" />
                <span>Try Live Demo (No Login) &rarr;</span>
              </button>
              <span className="text-zinc-700 hidden sm:inline">&bull;</span>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                100% Client-Side Privacy
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Curved Dark Obsidian Sheet with Emerald Top Border Glow */}
      <div className="relative z-10 bg-[#0a0d14] text-text rounded-t-[36px] sm:rounded-t-[52px] pt-36 sm:pt-48 md:pt-52 pb-10 sm:pb-12 px-6 sm:px-12 lg:px-20 border-t border-emerald-500/35 shadow-[0_-25px_60px_-15px_rgba(16,185,129,0.15)]">
        {/* Centered radial top highlight hairline */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        <div className="max-w-6xl mx-auto flex flex-col justify-between space-y-12 sm:space-y-16">
          {/* Top Row: Brand & Multi-Column Links */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 sm:gap-12">
            {/* Brand Section */}
            <div className="space-y-3 shrink-0">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="relative w-7 h-7 rounded-[8px] bg-gradient-to-b from-emerald-400 via-teal-500 to-emerald-600 flex items-center justify-center text-black shadow-md shadow-emerald-500/25 ring-1 ring-white/30 overflow-hidden group-hover:scale-105 transition-transform">
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-white/30 rounded-t-[7px] pointer-events-none" />
                  <ShieldCheck className="w-4 h-4 drop-shadow-xs" />
                </div>
                <span className="font-display font-extrabold text-base sm:text-lg tracking-tight text-white">
                  Proof
                </span>
              </Link>
              <p className="text-xs text-zinc-400 max-w-xs font-sans leading-relaxed">
                Deterministic resume extraction &amp; hotseat defense. Turn raw repositories into interview receipts.
              </p>
            </div>

            {/* Navigation Columns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12 text-xs font-sans">
              {/* Column 1: MENU */}
              <div className="space-y-3">
                <span className="block font-mono font-bold text-[11px] uppercase tracking-wider text-zinc-500">
                  Menu
                </span>
                <ul className="space-y-2 font-medium text-zinc-300">
                  <li>
                    <a
                      href="#reality-check"
                      className="hover:text-accent transition"
                    >
                      Reality Check
                    </a>
                  </li>
                  <li>
                    <a
                      href="#pipeline"
                      className="hover:text-accent transition"
                    >
                      How It Works
                    </a>
                  </li>
                  <li>
                    <a
                      href="#auditor"
                      className="hover:text-accent transition"
                    >
                      Risk Auditor
                    </a>
                  </li>
                  <li>
                    <a
                      href="#capabilities"
                      className="hover:text-accent transition"
                    >
                      Playbook
                    </a>
                  </li>
                </ul>
              </div>

              {/* Column 2: WORKSPACE */}
              <div className="space-y-3">
                <span className="block font-mono font-bold text-[11px] uppercase tracking-wider text-zinc-500">
                  Workspace
                </span>
                <ul className="space-y-2 font-medium text-zinc-300">
                  <li>
                    <Link
                      to="/app"
                      className="hover:text-accent transition"
                    >
                      Start New Audit
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={handleSampleClick}
                      className="hover:text-accent transition text-left cursor-pointer"
                    >
                      Try Sample Repo
                    </button>
                  </li>
                  <li>
                    <Link
                      to="/login"
                      className="hover:text-accent transition"
                    >
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/wipe"
                      className="hover:text-accent transition"
                    >
                      Reset Local Data
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3: ARCHITECTURE */}
              <div className="space-y-3">
                <span className="block font-mono font-bold text-[11px] uppercase tracking-wider text-zinc-500">
                  Verification
                </span>
                <ul className="space-y-2 font-medium text-zinc-400">
                  <li className="flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-accent" />
                    <span>Local-First</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>AST Grounding</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Code2 className="w-3 h-3 text-emerald-400" />
                    <span>LaTeX \resumeItem</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 text-zinc-500" />
                    <span>Zero Telemetry</span>
                  </li>
                </ul>
              </div>

              {/* Column 4: SOCIAL */}
              <div className="space-y-3 col-span-2 sm:col-span-1">
                <span className="block font-mono font-bold text-[11px] uppercase tracking-wider text-zinc-500">
                  Social
                </span>
                <ul className="space-y-2 font-medium text-zinc-300">
                  <li>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-accent transition"
                    >
                      GitHub Repo
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://x.com"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-accent transition"
                    >
                      X (Twitter)
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-accent transition"
                    >
                      LinkedIn
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Status Pill */}
          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
            <p>
              &copy; {new Date().getFullYear()} Proof &bull; Verifiable Resume Engineering. All rights reserved.
            </p>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-2 border border-white/5 text-[11px] text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span>Zero-Hallucination Engine Online</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
