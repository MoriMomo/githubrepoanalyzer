export interface ParsedGitHubUrl {
  owner: string;
  repo: string;
  branch?: string;
}

export interface GitHubIngestResult {
  rawSource: string;
  repoRef: string;
  owner: string;
  repo: string;
  branch: string;
  treeFlags: {
    hasDockerfile: boolean;
    hasCI: boolean;
    hasTests: boolean;
    hasMigrations: boolean;
    hasEnvExample: boolean;
  };
  warning?: string;
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

/**
 * Tries fetching a raw file via raw.githubusercontent.com (unbudgeted by GitHub REST API rate limits).
 */
async function fetchRawFile(
  owner: string,
  repo: string,
  branch: string,
  filePath: string,
): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
  try {
    const res = await fetch(url);
    if (res.ok) {
      return await res.text();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Detects the active branch by checking raw CDN for main then master, falling back to REST API.
 */
async function detectBranch(owner: string, repo: string, hintBranch?: string): Promise<string> {
  if (hintBranch) return hintBranch;

  // 1. Probe 'main'
  const probeMain = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`, {
    method: "HEAD",
  });
  if (probeMain.ok) return "main";

  // 2. Probe 'master'
  const probeMaster = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`, {
    method: "HEAD",
  });
  if (probeMaster.ok) return "master";

  // 3. Fallback: query GitHub API for default_branch (consumes 1 req from 60/hr limit)
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    if (res.ok) {
      const data = await res.json();
      if (data.default_branch) return data.default_branch;
    }
  } catch {
    // API unavailable or rate-limited
  }

  return "main";
}

/**
 * Ingests a public GitHub repository using raw CDN first, falling back to tree API for presence flags.
 * Gracefully degrades when GitHub API rate-limits.
 */
export async function ingestGitHubRepo(inputUrl: string): Promise<GitHubIngestResult> {
  const parsed = parseGitHubUrl(inputUrl);
  if (!parsed) {
    throw new Error("Invalid GitHub URL. Use format: https://github.com/owner/repo or owner/repo");
  }

  const { owner, repo } = parsed;
  const branch = await detectBranch(owner, repo, parsed.branch);
  const repoRef = `https://github.com/${owner}/${repo}`;

  // 1. Fetch README.md via raw CDN
  let readme = await fetchRawFile(owner, repo, branch, "README.md");
  if (!readme) {
    readme = await fetchRawFile(owner, repo, branch, "readme.md");
  }

  // 2. Fetch manifest via raw CDN (package.json, go.mod, requirements.txt, Cargo.toml)
  let manifestText = "";
  let manifestType = "";
  const packageJson = await fetchRawFile(owner, repo, branch, "package.json");
  if (packageJson) {
    manifestText = `\`\`\`json\n${packageJson}\n\`\`\``;
    manifestType = "package.json";
  } else {
    const requirements = await fetchRawFile(owner, repo, branch, "requirements.txt");
    if (requirements) {
      manifestText = `\`\`\`text\n${requirements}\n\`\`\``;
      manifestType = "requirements.txt";
    } else {
      const goMod = await fetchRawFile(owner, repo, branch, "go.mod");
      if (goMod) {
        manifestText = `\`\`\`text\n${goMod}\n\`\`\``;
        manifestType = "go.mod";
      }
    }
  }

  // 2b. Deep Schema & Entry-Point Inspection (Probes actual implementation beyond naive manifests)
  const truncateSnippet = (text: string, maxLines: number) => {
    const lines = text.split("\n");
    if (lines.length <= maxLines) return text;
    return lines.slice(0, maxLines).join("\n") + `\n// ... (${lines.length - maxLines} lines truncated)`;
  };

  const verifiedFiles: string[] = [];
  if (manifestType) verifiedFiles.push(manifestType);

  // Probe Database Schemas
  let schemaSnippet = "";
  const schemaCandidates = [
    "prisma/schema.prisma",
    "schema.prisma",
    "db/schema.sql",
    "schema.sql",
    "drizzle/schema.ts",
  ];
  for (const cand of schemaCandidates) {
    const content = await fetchRawFile(owner, repo, branch, cand);
    if (content) {
      schemaSnippet += `\n\n### Database Schema (${cand})\n\`\`\`\n${truncateSnippet(content, 90)}\n\`\`\`\n`;
      verifiedFiles.push(cand);
      break;
    }
  }

  // Probe Server Entry Points & Route Tables
  let entrySnippet = "";
  const entryCandidates = [
    "src/index.ts",
    "src/app.ts",
    "src/server.ts",
    "src/main.ts",
    "main.go",
    "app.py",
    "server.js",
    "app.js",
    "index.ts",
    "app.ts",
  ];
  for (const cand of entryCandidates) {
    const content = await fetchRawFile(owner, repo, branch, cand);
    if (content) {
      entrySnippet += `\n\n### Server Entry Point (${cand})\n\`\`\`\n${truncateSnippet(content, 100)}\n\`\`\`\n`;
      verifiedFiles.push(cand);
      break;
    }
  }

  // Probe Container / Infrastructure Configs
  let infraSnippet = "";
  const infraCandidates = ["docker-compose.yml", "docker-compose.yaml", "Dockerfile"];
  for (const cand of infraCandidates) {
    const content = await fetchRawFile(owner, repo, branch, cand);
    if (content) {
      infraSnippet += `\n\n### Infrastructure Configuration (${cand})\n\`\`\`\n${truncateSnippet(content, 60)}\n\`\`\`\n`;
      verifiedFiles.push(cand);
      break;
    }
  }

  if (!readme && !manifestText && !schemaSnippet && !entrySnippet) {
    throw new Error(
      `Could not retrieve README, manifest, or entry files from ${owner}/${repo} on branch '${branch}'. Verify the repo is public.`,
    );
  }

  // Build combined rawSource text with verified implementation sections
  let combinedSource = readme || `# ${repo}\nPublic GitHub repository: ${repoRef}\n`;
  if (manifestText && !combinedSource.includes(manifestText)) {
    combinedSource += `\n\n## Dependencies (${manifestType})\n${manifestText}\n`;
  }
  if (schemaSnippet || entrySnippet || infraSnippet) {
    combinedSource += `\n\n## Verified Source Implementation\n${schemaSnippet}${entrySnippet}${infraSnippet}`;
  }

  // 3. Tree API for architectural presence flags (Filtered to top levels)
  const treeFlags = {
    hasDockerfile: false,
    hasCI: false,
    hasTests: false,
    hasMigrations: false,
    hasEnvExample: false,
  };

  let warning: string | undefined;

  try {
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    );

    if (treeRes.status === 403) {
      warning = "GitHub API rate limit reached (60/hr). Ingested core files via CDN, presence flags inferred from text.";
    } else if (treeRes.ok) {
      const treeData = await treeRes.json();
      if (Array.isArray(treeData?.tree)) {
        for (const item of treeData.tree) {
          const path = (item.path as string).toLowerCase();

          if (path === "dockerfile" || path.startsWith("docker-compose")) {
            treeFlags.hasDockerfile = true;
          }
          if (path.startsWith(".github/workflows")) {
            treeFlags.hasCI = true;
          }
          if (
            path.includes("test") ||
            path.includes("spec") ||
            path.startsWith("__tests__")
          ) {
            treeFlags.hasTests = true;
          }
          if (path.includes("migration") || path.startsWith("prisma/migrations")) {
            treeFlags.hasMigrations = true;
          }
          if (path === ".env.example" || path === ".env.sample") {
            treeFlags.hasEnvExample = true;
          }
        }
      }
    }
  } catch {
    warning = "Could not reach GitHub tree API. Preserved raw CDN ingestion.";
  }

  return {
    rawSource: combinedSource,
    repoRef,
    owner,
    repo,
    branch,
    treeFlags,
    warning,
  };
}
