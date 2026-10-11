import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  // Determine the appropriate unit by calculating the log
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Format with 2 decimal places and round
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export const generateUUID = () => crypto.randomUUID();

/**
 * Extracts the text content from a Puter AI chat response, which may be either a
 * plain string or an array of content parts.
 */
export function extractAIText(content: unknown): string | null {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    const firstText = content.find(
      (part) => part && typeof part === "object" && typeof (part as any).text === "string",
    ) as { text?: string } | undefined;
    return firstText?.text ?? null;
  }
  return null;
}

/**
 * Parses AI-produced JSON that may be wrapped in Markdown code fences or padded
 * with surrounding prose. Returns the parsed object, or null when nothing
 * parseable is found. Never throws.
 */
export function parseAIJson<T = unknown>(raw: string | null | undefined): T | null {
  if (!raw || typeof raw !== "string") return null;

  let text = raw.trim();

  // Strip a leading/trailing Markdown code fence (```json ... ``` or ``` ... ```).
  const fenced = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenced) {
    text = fenced[1].trim();
  }

  // First attempt: parse the (de-fenced) text as-is.
  try {
    return JSON.parse(text) as T;
  } catch {
    // Fall through to a best-effort extraction below.
  }

  // Fallback: grab the first balanced-looking JSON object/array in the text.
  const start = text.search(/[{[]/);
  if (start === -1) return null;
  const open = text[start];
  const close = open === "{" ? "}" : "]";
  const end = text.lastIndexOf(close);
  if (end <= start) return null;

  try {
    return JSON.parse(text.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

/**
 * Extracts a human-readable message from an error of unknown type,
 * including Puter.js plain error objects that would otherwise format as "[object Object]".
 */
export function formatErrorMessage(err: unknown): string {
  if (!err) return "Unknown error";
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (typeof err === "object") {
    const obj = err as Record<string, unknown>;
    if (typeof obj.message === "string" && obj.message.trim()) return obj.message;
    if (typeof obj.error === "string" && obj.error.trim()) return obj.error;
    if (obj.error && typeof obj.error === "object") {
      const inner = obj.error as Record<string, unknown>;
      if (typeof inner.message === "string" && inner.message.trim()) return inner.message;
      if (typeof inner.error === "string" && inner.error.trim()) return inner.error;
    }
    if (Array.isArray(obj.failedItems) && obj.failedItems.length > 0) {
      const first = obj.failedItems[0] as Record<string, unknown>;
      if (typeof first?.message === "string") return first.message;
    }
    try {
      const json = JSON.stringify(err);
      if (json && json !== "{}") return json;
    } catch {
      // fallback
    }
  }
  return String(err);
}
