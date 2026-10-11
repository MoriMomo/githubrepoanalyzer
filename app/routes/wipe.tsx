import { useState, useEffect } from "react";
import { Link } from "react-router";
import { AlertTriangle, Trash2, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { usePuterStore } from "~/lib/puter";
import { Button, Badge, Card } from "~/components/ui";

export default function WipePage() {
  const { kv, auth, puterReady } = usePuterStore();
  const [sessionKeys, setSessionKeys] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWiping, setIsWiping] = useState(false);
  const [wipeReport, setWipeReport] = useState<string | null>(null);

  useEffect(() => {
    async function fetchKeys() {
      if (!puterReady || !auth.isAuthenticated) {
        setIsLoading(false);
        return;
      }
      try {
        const items = await kv.list("proof:session:*", false);
        if (Array.isArray(items)) {
          setSessionKeys(items as string[]);
        }
      } catch (err) {
        console.error("Failed to list keys", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchKeys();
  }, [puterReady, auth.isAuthenticated, kv]);

  const handleWipe = async () => {
    setIsWiping(true);
    setWipeReport(null);

    try {
      // 1. Delete all individual session keys using Promise.allSettled
      const deletePromises = sessionKeys.map((key) => kv.delete(key));
      const results = await Promise.allSettled(deletePromises);

      const fulfilled = results.filter((r) => r.status === "fulfilled").length;
      const rejected = results.filter((r) => r.status === "rejected").length;

      // 2. Perform kv.flush()
      try {
        await kv.flush();
      } catch (flushErr) {
        console.warn("kv.flush() had an issue", flushErr);
      }

      setWipeReport(
        `Reset complete. Successfully purged ${fulfilled} session keys${
          rejected > 0 ? ` (${rejected} failed)` : ""
        }.`,
      );
      setSessionKeys([]);
    } catch (err) {
      setWipeReport(`Wipe encountered an error: ${String(err)}`);
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card variant="default" padding="lg" className="max-w-md w-full space-y-5 border-border">
        <div className="space-y-2">
          <Badge variant="flag" size="sm">
            <AlertTriangle className="w-3 h-3" />
            <span>Danger Zone</span>
          </Badge>
          <h1 className="font-display text-xl font-bold text-text">
            Reset Proof Data
          </h1>
          <p className="text-xs text-text-dim leading-relaxed font-sans">
            This operation completely wipes all saved project sessions and cached Truth Drill answers from your Puter KV cloud store.
          </p>
        </div>

        <Card variant="surface2" padding="md" className="space-y-2 text-xs">
          <div className="flex justify-between items-center text-text">
            <span>Detected saved sessions:</span>
            <span className="font-mono font-semibold text-flag">
              {isLoading ? "Counting..." : sessionKeys.length}
            </span>
          </div>
          <p className="text-text-dim text-[11px] leading-relaxed">
            This action cannot be undone. All resume bullets and interview defense scripts will be permanently destroyed.
          </p>
        </Card>

        {wipeReport && (
          <div className="p-3 rounded-md bg-ok/10 border border-ok/30 text-ok text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{wipeReport}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Link
            to="/"
            className="text-xs text-text-dim hover:text-text font-mono transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>

          <Button
            type="button"
            variant="destructive"
            size="md"
            onClick={handleWipe}
            disabled={isWiping || isLoading || sessionKeys.length === 0}
          >
            {isWiping ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Purging KV...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm & Delete</span>
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
