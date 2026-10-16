export interface LinterToken {
  text: string;
  type: "normal" | "fluff" | "metric";
}

export function tokenizeForLinter(
  text: string,
  fluffHits: string[] = [],
  ungroundedHits: string[] = [],
): LinterToken[] {
  if (!text) return [];
  if (!fluffHits.length && !ungroundedHits.length) {
    return [{ text, type: "normal" }];
  }

  // Create list of targets with types, longest first so compound phrases match first
  const targets: { word: string; type: "fluff" | "metric" }[] = [
    ...fluffHits.map((w) => ({ word: w, type: "fluff" as const })),
    ...ungroundedHits.map((w) => ({ word: w, type: "metric" as const })),
  ].sort((a, b) => b.word.length - a.word.length);

  const escaped = targets.map((t) => t.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  if (!escaped) return [{ text, type: "normal" }];

  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return parts.filter(Boolean).map((part) => {
    const matched = targets.find((t) => t.word.toLowerCase() === part.toLowerCase());
    if (matched) {
      return { text: part, type: matched.type };
    }
    return { text: part, type: "normal" };
  });
}
