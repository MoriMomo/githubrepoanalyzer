import * as React from "react";
import { Command } from "cmdk";
import { useNavigate } from "react-router";
import {
  Search,
  FileText,
  Copy,
  Terminal,
  Cpu,
  Trash2,
  FolderKanban,
  Sparkles,
  ShieldCheck,
  Download,
} from "lucide-react";
import { toast } from "sonner";

interface CommandMenuProps {
  onExport?: (format: "latex" | "markdown" | "txt" | "json") => void;
  onCopyAll?: () => void;
  onMockInterview?: () => void;
  selectedModel?: string;
  onSelectModel?: (model: string) => void;
}

export function CommandMenu({
  onExport,
  onCopyAll,
  onMockInterview,
  selectedModel = "gpt-5-mini",
  onSelectModel,
}: CommandMenuProps) {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    command();
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:flex items-center gap-2 px-2.5 py-1 text-xs rounded-md border border-border bg-surface-2/60 hover:bg-surface-2 hover:border-border-strong text-text-dim hover:text-text transition-all duration-150 cursor-pointer shadow-xs"
        aria-label="Open Command Palette"
      >
        <Search className="w-3.5 h-3.5 text-text-muted" />
        <span className="font-normal">Quick actions...</span>
        <kbd className="ml-2 font-mono text-[10px] bg-surface-3 px-1.5 py-0.5 rounded border border-border text-text-muted">
          ⌘K
        </kbd>
      </button>

      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Proof Command Palette"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-surface-2 border border-border-strong rounded-xl shadow-2xl p-0 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl"
      >
        <div className="flex items-center px-3.5 border-b border-border bg-surface">
          <Search className="w-4 h-4 text-text-muted mr-2.5 shrink-0" />
          <Command.Input
            placeholder="Type a command or search..."
            className="w-full h-11 bg-transparent text-sm text-text placeholder:text-text-muted focus:outline-none font-sans"
          />
          <kbd className="text-[10px] font-mono text-text-muted bg-surface-2 px-1.5 py-0.5 rounded border border-border shrink-0">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-72 overflow-y-auto p-2 space-y-1 font-sans text-xs">
          <Command.Empty className="py-6 text-center text-text-muted text-xs">
            No matching commands found.
          </Command.Empty>

          <Command.Group heading="Navigation" className="text-[11px] font-medium text-text-muted px-2 py-1 uppercase tracking-wider">
            <Command.Item
              onSelect={() => runCommand(() => navigate("/app"))}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-text cursor-pointer hover:bg-surface-3 aria-selected:bg-surface-3 transition-colors"
            >
              <FolderKanban className="w-4 h-4 text-accent" />
              <span>Workspace Dashboard</span>
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => navigate("/project/new"))}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-text cursor-pointer hover:bg-surface-3 aria-selected:bg-surface-3 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-accent" />
              <span>Ingest New Project</span>
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => navigate("/"))}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-text cursor-pointer hover:bg-surface-3 aria-selected:bg-surface-3 transition-colors"
            >
              <Terminal className="w-4 h-4 text-text-muted" />
              <span>Landing Page</span>
            </Command.Item>
          </Command.Group>

          {onCopyAll && (
            <Command.Group heading="Audit Actions" className="text-[11px] font-medium text-text-muted px-2 py-1 uppercase tracking-wider">
              <Command.Item
                onSelect={() => runCommand(onCopyAll)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-text cursor-pointer hover:bg-surface-3 aria-selected:bg-surface-3 transition-colors"
              >
                <Copy className="w-4 h-4 text-emerald-400" />
                <span>Copy All Bullets</span>
              </Command.Item>
              {onMockInterview && (
                <Command.Item
                  onSelect={() => runCommand(onMockInterview)}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-text cursor-pointer hover:bg-surface-3 aria-selected:bg-surface-3 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Start Mock Interview Defense</span>
                </Command.Item>
              )}
            </Command.Group>
          )}

          {onExport && (
            <Command.Group heading="Export Formats" className="text-[11px] font-medium text-text-muted px-2 py-1 uppercase tracking-wider">
              <Command.Item
                onSelect={() => runCommand(() => onExport("latex"))}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-text cursor-pointer hover:bg-surface-3 aria-selected:bg-surface-3 transition-colors"
              >
                <Download className="w-4 h-4 text-info" />
                <span>Export as LaTeX (\resumeItem)</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => onExport("markdown"))}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-text cursor-pointer hover:bg-surface-3 aria-selected:bg-surface-3 transition-colors"
              >
                <FileText className="w-4 h-4 text-text-dim" />
                <span>Export as Markdown</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => onExport("json"))}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-text cursor-pointer hover:bg-surface-3 aria-selected:bg-surface-3 transition-colors"
              >
                <Download className="w-4 h-4 text-text-dim" />
                <span>Export as JSON</span>
              </Command.Item>
            </Command.Group>
          )}

          {onSelectModel && (
            <Command.Group heading="AI Verification Model" className="text-[11px] font-medium text-text-muted px-2 py-1 uppercase tracking-wider">
              <Command.Item
                onSelect={() =>
                  runCommand(() => {
                    onSelectModel("gpt-5-mini");
                    toast.success("Switched model to GPT-5 Mini");
                  })
                }
                className="flex items-center justify-between px-2.5 py-2 rounded-md text-text cursor-pointer hover:bg-surface-3 aria-selected:bg-surface-3 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-accent" />
                  <span>GPT-5 Mini</span>
                </div>
                {selectedModel === "gpt-5-mini" && (
                  <span className="text-[10px] text-accent font-mono">Active</span>
                )}
              </Command.Item>
              <Command.Item
                onSelect={() =>
                  runCommand(() => {
                    onSelectModel("claude-3-5-sonnet");
                    toast.success("Switched model to Claude 3.5 Sonnet");
                  })
                }
                className="flex items-center justify-between px-2.5 py-2 rounded-md text-text cursor-pointer hover:bg-surface-3 aria-selected:bg-surface-3 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-info" />
                  <span>Claude 3.5 Sonnet</span>
                </div>
                {selectedModel === "claude-3-5-sonnet" && (
                  <span className="text-[10px] text-info font-mono">Active</span>
                )}
              </Command.Item>
            </Command.Group>
          )}

          <Command.Group heading="Danger Zone" className="text-[11px] font-medium text-text-muted px-2 py-1 uppercase tracking-wider">
            <Command.Item
              onSelect={() => runCommand(() => navigate("/wipe"))}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-flag cursor-pointer hover:bg-flag/10 aria-selected:bg-flag/10 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-flag" />
              <span>Nuclear Data Wipe (Reset All Storage)</span>
            </Command.Item>
          </Command.Group>
        </Command.List>

        <div className="p-2 border-t border-border bg-surface flex items-center justify-between text-[11px] text-text-muted font-mono">
          <span>Navigate with ↑ ↓, press Enter to select</span>
          <span>Proof v1.2</span>
        </div>
      </Command.Dialog>
    </>
  );
}
