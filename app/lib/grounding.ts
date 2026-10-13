import type { Bullet } from "~/types";

/**
 * Metric unit regex matching quantified performance, scale, or benchmark claims.
 * Matches metric units, multipliers, and compound units like "10k requests/sec",
 * while deliberately excluding bare integers (e.g. release year "2024", "Node 20", "React 19")
 * and alphanumeric version identifiers (e.g. "ES2022").
 */
export const METRIC_PATTERN =
  /(?<![a-zA-Z0-9_])(?:\d+(?:\.\d+)?\s*(?:k|m|b|million|billion|thousand)?\s*(?:%|x|ms|milliseconds?|seconds?|secs?|gb|mb|tb|kb|requests?(?:\/(?:sec|s))?|rps|qps|users?|rows?|records?)|(?:\d+(?:\.\d+)?\s*(?:k|m|b|million|billion|thousand))\b)(?![a-zA-Z0-9_])/gi;

/**
 * Forbidden resume buzzwords that trigger interviewer skepticism.
 * ARCHITECTURE.md §8 & BUILD_HANDOFF.md §5:
 * Banned: spearheaded, leveraged, utilized, participated in, responsible for.
 */
export const BANNED_FLUFF_WORDS = [
  "spearheaded",
  "leveraged",
  "utilized",
  "participated in",
  "responsible for",
];

/**
 * Enterprise architecture buzzwords that trigger senior interviewer skepticism
 * when claimed on a junior project without backing infrastructure in source corpus.
 */
export const INFLATED_ENTERPRISE_WORDS = [
  "high-availability",
  "fault-tolerant",
  "consensus algorithm",
  "split-brain",
  "cqrs",
];

/**
 * Detects occurrences of banned fluff words in a given text.
 */
export function detectFluffWords(text: string): string[] {
  const lower = text.toLowerCase();
  const hits: string[] = [];
  for (const fluff of BANNED_FLUFF_WORDS) {
    const regex = new RegExp(`\\b${fluff}\\b`, "i");
    if (regex.test(lower)) {
      hits.push(fluff);
    }
  }
  return hits;
}

/**
 * Detects ungrounded enterprise architecture claims that lack evidence in source corpus.
 */
export function detectEnterpriseInflation(
  text: string,
  groundedCorpus: string,
): string[] {
  const lowerText = text.toLowerCase();
  const lowerCorpus = groundedCorpus.toLowerCase();
  const hits: string[] = [];
  for (const term of INFLATED_ENTERPRISE_WORDS) {
    const regex = new RegExp(`\\b${term.replace("-", "[-\\s]")}\\b`, "i");
    if (regex.test(lowerText) && !regex.test(lowerCorpus)) {
      hits.push(term);
    }
  }
  return hits;
}

export interface BulletAuditReport {
  fluffHits: string[];
  ungroundedHits: string[];
  groundedHits: string[];
  inflatedTerms: string[];
  riskLevel: "CRITICAL" | "MODERATE" | "CLEAN";
  diagnosis: string;
}

/**
 * Audits an existing or user-supplied bullet for interview failure risks:
 * detects ungrounded metrics and fluff buzzwords against the project's evidence corpus.
 */
export function auditBulletRisk(
  candidateBulletText: string,
  groundedCorpus: string,
): BulletAuditReport {
  const fluffHits = detectFluffWords(candidateBulletText);
  const metricHits = extractMetricTokens(candidateBulletText);
  const inflatedTerms = detectEnterpriseInflation(candidateBulletText, groundedCorpus);

  const normalizedCorpus = groundedCorpus.toLowerCase().replace(/\s+/g, " ");
  const compactCorpus = normalize(groundedCorpus);

  const ungroundedHits = metricHits.filter((hit) => {
    const normHit = normalize(hit);
    const hitLower = hit.toLowerCase();
    const isPresent =
      normalizedCorpus.includes(hitLower) ||
      compactCorpus.includes(normHit);
    return !isPresent;
  });

  const groundedHits = metricHits.filter((hit) => !ungroundedHits.includes(hit));

  let riskLevel: "CRITICAL" | "MODERATE" | "CLEAN" = "CLEAN";
  if (ungroundedHits.length > 0 && fluffHits.length > 0) {
    riskLevel = "CRITICAL";
  } else if (
    ungroundedHits.length > 0 ||
    fluffHits.length > 0 ||
    inflatedTerms.length > 0
  ) {
    riskLevel = "MODERATE";
  }

  let diagnosis = "Clean and grounded. Mechanisms are supported without buzzword fluff.";
  if (riskLevel === "CRITICAL") {
    diagnosis = `High interview failure risk: contains ${fluffHits.length} fluff buzzwords (${fluffHits.join(", ")}) and ${ungroundedHits.length} ungrounded metric claims (${ungroundedHits.join(", ")}) that an interviewer will challenge.`;
  } else if (ungroundedHits.length > 0) {
    diagnosis = `Unverified metrics detected: ${ungroundedHits.join(", ")}. Without benchmark artifacts, interviewers will ask for profiling proofs.`;
  } else if (fluffHits.length > 0) {
    diagnosis = `Passive fluff buzzwords detected: ${fluffHits.join(", ")}. Replace with concrete mechanism verbs.`;
  } else if (inflatedTerms.length > 0) {
    diagnosis = `Unsubstantiated enterprise scope claimed: ${inflatedTerms.join(", ")}. Interviewers will probe failure modes you may not have implemented.`;
  }

  return {
    fluffHits,
    ungroundedHits,
    groundedHits,
    inflatedTerms,
    riskLevel,
    diagnosis,
  };
}

/**
 * Normalizes a metric string for fuzzy-matching against the ground truth corpus.
 * Trims whitespace, lowercases, and compresses spaces.
 */
export function normalize(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "").trim();
}

/**
 * Escapes special regex characters in a search string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Strips an ungrounded metric token and any surrounding comparative prepositions
 * (e.g., "by 40%", "up to 50ms", "over 10k requests/sec") to preserve natural grammar.
 */
export function stripNumberPhrase(text: string, token: string): string {
  const escaped = escapeRegex(token.trim());

  const patterns = [
    new RegExp(
      `(?:\\b(?:by|up to|over|approximately|approx\\.?|nearly|around|by over|by nearly)\\s+)?${escaped}(?:\\s*(?:faster|slower|improvement|reduction))?(?![a-zA-Z0-9])`,
      "gi",
    ),
  ];

  let cleaned = text;
  for (const pattern of patterns) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, "");
      break;
    }
  }

  // Clean up residual punctuation and redundant prepositions (e.g., "latency  through" or "by through")
  return cleaned
    .replace(/\b(?:by|over|to)\s+(by|over|to|through|via|using)\b/gi, "$1")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,;:])/g, "$1")
    .trim();
}

/**
 * Scans a text string for all metric-like tokens.
 */
export function extractMetricTokens(text: string): string[] {
  const matches = text.match(METRIC_PATTERN);
  if (!matches) return [];
  return Array.from(new Set(matches.map((m) => m.trim())));
}

/**
 * Deterministic validation pass enforcing the Anti-Fabrication Guarantee (ARCHITECTURE §8 Layer 2).
 *
 * Compares every numeric/metric claim in the synthesized bullets against the grounded corpus
 * (rawSource + student Truth Drill answers). If any metric is absent from the corpus, it is
 * excised and recorded in `flags`.
 */
export function enforceGrounding(bullets: Bullet[], groundedCorpus: string): Bullet[] {
  const normalizedCorpus = groundedCorpus.toLowerCase().replace(/\s+/g, " ");
  const compactCorpus = normalize(groundedCorpus);

  return bullets.map((bullet) => {
    const hits = extractMetricTokens(bullet.text);
    const inflatedTerms = detectEnterpriseInflation(bullet.text, groundedCorpus);

    const ungroundedHits = hits.filter((hit) => {
      const normHit = normalize(hit);
      const hitLower = hit.toLowerCase();
      const isPresent =
        normalizedCorpus.includes(hitLower) ||
        compactCorpus.includes(normHit);
      return !isPresent;
    });

    if (ungroundedHits.length === 0 && inflatedTerms.length === 0) {
      return bullet;
    }

    // Strip each ungrounded metric from the bullet text
    let updatedText = bullet.text;
    for (const ungrounded of ungroundedHits) {
      updatedText = stripNumberPhrase(updatedText, ungrounded);
    }

    const updatedFlags = [...(bullet.flags || [])];
    if (ungroundedHits.length > 0) {
      updatedFlags.push(`metric removed (ungrounded): ${ungroundedHits.join(", ")}`);
    }
    if (inflatedTerms.length > 0) {
      updatedFlags.push(`scope flag (unverified enterprise claim): ${inflatedTerms.join(", ")}`);
    }

    return {
      ...bullet,
      text: updatedText,
      flags: updatedFlags,
    };
  });
}
