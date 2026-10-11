import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Download, ChevronDown, FileText, Code2, FileCode } from "lucide-react";

interface ExportDropdownProps {
  onExportLatex: () => void;
  onExportMarkdown: () => void;
  onExportText: () => void;
  onExportJson: () => void;
}

export function ExportDropdown({
  onExportLatex,
  onExportMarkdown,
  onExportText,
  onExportJson,
}: ExportDropdownProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md border border-border bg-surface-2 hover:bg-surface-3 hover:border-border-strong text-text transition-all duration-150 cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          aria-label="Export options"
        >
          <Download className="w-3.5 h-3.5 text-text-dim" />
          <span>Export as</span>
          <ChevronDown className="w-3.5 h-3.5 text-text-muted ml-0.5" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-44 rounded-lg border border-border-strong bg-surface-2 p-1 text-text shadow-xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 font-sans text-xs"
        >
          <DropdownMenu.Item
            onClick={onExportLatex}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer hover:bg-surface-3 hover:text-text focus:bg-surface-3 outline-none transition-colors"
          >
            <div className="flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-info" />
              <span>LaTeX (\resumeItem)</span>
            </div>
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onClick={onExportMarkdown}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer hover:bg-surface-3 hover:text-text focus:bg-surface-3 outline-none transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Markdown (.md)</span>
            </div>
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onClick={onExportText}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer hover:bg-surface-3 hover:text-text focus:bg-surface-3 outline-none transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-text-dim" />
              <span>Plain Text (.txt)</span>
            </div>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-border my-1" />

          <DropdownMenu.Item
            onClick={onExportJson}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer hover:bg-surface-3 hover:text-text focus:bg-surface-3 outline-none transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Structured JSON (.json)</span>
            </div>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
