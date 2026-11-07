import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal } from "lucide-react";

export function TerminalBootLoader({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  // Derived state: computed synchronously during render from progress
  const logIndex = progress < 30 ? 0 : progress < 65 ? 1 : progress < 90 ? 2 : 3;

  const BOOT_LOGS = [
    "connecting to raw github cdn...",
    "mounting AST manifest engine [go.mod, package.json]...",
    "validating anti-hallucination defense net...",
    "proofcheck runtime ready.",
  ];

  useEffect(() => {
    const startTime = Date.now();
    const duration = 1200;
    let doneTimer: ReturnType<typeof setTimeout> | undefined;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        doneTimer = setTimeout(() => {
          setIsDone(true);
          onComplete?.();
        }, 150);
      }
    }, 40);

    return () => {
      clearInterval(interval);
      if (doneTimer) clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          key="terminal-boot-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: "easeInOut" } }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#05070a] text-zinc-300 font-mono select-none px-4"
        >
          <div className="w-full max-w-md space-y-4 rounded-xl border border-white/10 bg-[#090d14] p-5 sm:p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs text-zinc-500">
              <span className="flex items-center gap-2 text-emerald-400 font-semibold font-mono">
                <Terminal className="w-3.5 h-3.5" />
                <span>PROOFCHECK // RUNTIME</span>
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">v1.2.0</span>
            </div>

            {/* Terminal logs */}
            <div className="space-y-1.5 text-xs text-zinc-400 font-mono min-h-[72px]">
              {BOOT_LOGS.slice(0, logIndex + 1).map((log, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">›</span>
                  <span className={idx === logIndex ? "text-zinc-200" : "text-zinc-500"}>
                    {log}
                  </span>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5 pt-1">
              <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] transition-all duration-75"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                <span>INITIALIZING ENGINE</span>
                <span className="text-emerald-400 font-bold">{progress}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

