export interface ParsedGitHubUrl {
  owner: string;
  repo: string;
  branch?: string;
}

/**
 * Parses user-provided GitHub URLs or "owner/repo" shorthand strings.
 */
export function parseGitHubUrl(input: string): ParsedGitHubUrl | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();

  // Pattern 1: https://github.com/owner/repo/tree/branch/...
  const fullTreeMatch = trimmed.match(
    /^https?:\/\/github\.com\/([^/\s]+)\/([^/\s]+)\/tree\/([^/\s]+)/i,
  );
  if (fullTreeMatch) {
    return {
      owner: fullTreeMatch[1],
      repo: fullTreeMatch[2].replace(/\.git$/i, ""),
      branch: fullTreeMatch[3],
    };
  }

  // Pattern 2: https://github.com/owner/repo
  const fullMatch = trimmed.match(
    /^https?:\/\/github\.com\/([^/\s]+)\/([^/\s]+)(?:\/.*)?$/i,
  );
  if (fullMatch) {
    return {
      owner: fullMatch[1],
      repo: fullMatch[2].replace(/\.git$/i, ""),
    };
  }

  // Pattern 3: owner/repo shorthand
  const shortMatch = trimmed.match(/^([^/\s]+)\/([^/\s]+)$/);
  if (shortMatch && !trimmed.startsWith("http")) {
    return {
      owner: shortMatch[1],
      repo: shortMatch[2].replace(/\.git$/i, ""),
    };
  }

  return null;
}
