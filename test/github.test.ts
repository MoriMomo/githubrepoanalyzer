import { describe, it, expect } from "vitest";
import { parseGitHubUrl } from "~/lib/github";

describe("GitHub URL Parser (lib/github.ts)", () => {
  it("parses standard https repository URLs", () => {
    const res = parseGitHubUrl("https://github.com/facebook/react");
    expect(res).toEqual({
      owner: "facebook",
      repo: "react",
    });
  });

  it("parses URLs with trailing slashes or .git suffix", () => {
    const res = parseGitHubUrl("https://github.com/torvalds/linux.git/");
    expect(res?.owner).toBe("torvalds");
    expect(res?.repo).toBe("linux");
  });

  it("parses branch-specific tree URLs", () => {
    const res = parseGitHubUrl("https://github.com/vercel/next.js/tree/canary");
    expect(res).toEqual({
      owner: "vercel",
      repo: "next.js",
      branch: "canary",
    });
  });

  it("parses shorthand owner/repo input", () => {
    const res = parseGitHubUrl("expressjs/express");
    expect(res).toEqual({
      owner: "expressjs",
      repo: "express",
    });
  });

  it("returns null on invalid URLs", () => {
    expect(parseGitHubUrl("")).toBeNull();
    expect(parseGitHubUrl("https://google.com")).toBeNull();
    expect(parseGitHubUrl("invalid url string")).toBeNull();
  });
});
