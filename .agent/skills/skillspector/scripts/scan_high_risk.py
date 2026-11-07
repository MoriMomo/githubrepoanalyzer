"""
SkillSpector High & Extreme Risk Filter
Filters SkillSpector scans to only report and alert on HIGH and CRITICAL (Extreme) severity risks.
Suppresses all LOW and MEDIUM informational notices.
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path

HIGH_RISK_SEVERITIES = {"HIGH", "CRITICAL"}


def format_issue(issue: dict) -> str:
    sev = issue.get("severity", "UNKNOWN")
    rule_id = issue.get("id", "UNKNOWN")
    loc = issue.get("location", {})
    file_loc = loc.get("file", "unknown")
    line = loc.get("start_line")
    loc_str = f"{file_loc}:{line}" if line else file_loc
    pattern = issue.get("pattern") or issue.get("finding") or "Unknown security finding"
    return f"  [{sev}] {rule_id} in {loc_str}\n    ↳ {pattern}"


def run_scan(target_dir: str, recursive: bool = True):
    target = Path(target_dir).resolve()
    if not target.exists():
        print(f"Error: Target path '{target_dir}' does not exist.", flush=True)
        sys.exit(1)

    print(f"\n🔍 SkillSpector Security Scan: High & Extreme Risks Only", flush=True)
    print(f"   Target: {target}", flush=True)
    print(f"   Filter: Severity in {{HIGH, CRITICAL}} (Risk Score >= 50)\n", flush=True)

    cmd = ["skillspector", "scan", str(target), "--no-llm", "--format", "json"]
    if recursive and target.is_dir() and not (target / "SKILL.md").exists():
        cmd.insert(2, "--recursive")

    proc = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    
    stdout = proc.stdout.strip()
    if not stdout:
        if proc.stderr:
            print(f"Error running SkillSpector:\n{proc.stderr}", flush=True)
        sys.exit(proc.returncode if proc.returncode != 0 else 1)

    try:
        data = json.loads(stdout)
    except json.JSONDecodeError:
        # Fallback if mixed text before json
        start_idx = stdout.find("{")
        if start_idx != -1:
            data = json.loads(stdout[start_idx:])
        else:
            print("Error parsing SkillSpector JSON output.", flush=True)
            print(stdout[:500], flush=True)
            sys.exit(1)

    # Handle multi-skill vs single skill JSON
    is_multi = data.get("multi_skill", False)
    skills = data.get("skills", []) if is_multi else [data]

    high_risk_found = False
    results_summary = []

    for s in skills:
        name = s.get("name") or s.get("skill", {}).get("name") or "unknown"
        score = s.get("risk_score") or s.get("risk_assessment", {}).get("score", 0)
        overall_sev = str(s.get("risk_severity") or s.get("risk_assessment", {}).get("severity", "LOW")).upper()
        issues = s.get("issues", [])

        # Filter strictly for HIGH and CRITICAL
        high_issues = [i for i in issues if str(i.get("severity", "")).upper() in HIGH_RISK_SEVERITIES]

        is_high = len(high_issues) > 0 or score >= 50 or overall_sev in HIGH_RISK_SEVERITIES
        if is_high:
            high_risk_found = True

        results_summary.append((name, score, overall_sev, len(high_issues), high_issues, is_high))

    # Output Clean Table
    print(f"  {'Skill':<25} {'Score':<8} {'Severity':<12} {'High/Extreme Issues'}", flush=True)
    print(f"  {'-'*25} {'-'*8} {'-'*12} {'-'*20}", flush=True)
    for name, score, sev, count, _, is_high in results_summary:
        indicator = "⚠️ ALERT" if is_high else "✓ PASS"
        print(f"  {name:<25} {score:<8} {sev:<12} {count} ({indicator})", flush=True)

    # Detailed High/Extreme issues
    if high_risk_found:
        print("\n🚨 High & Extreme Risk Findings Breakdown:", flush=True)
        for name, score, sev, count, high_issues, is_high in results_summary:
            if is_high:
                print(f"\n• Skill: {name} (Score: {score}/100, Severity: {sev})", flush=True)
                if high_issues:
                    for issue in high_issues:
                        print(format_issue(issue), flush=True)
                else:
                    print(f"  Overall skill risk level is {sev} (score {score}/100)", flush=True)
        print("\n❌ FAILED: High or Extreme security vulnerabilities detected.", flush=True)
        sys.exit(1)
    else:
        print("\n✅ PASSED: Zero High or Extreme (Critical) vulnerabilities detected across scanned skills.", flush=True)
        sys.exit(0)


if __name__ == "__main__":
    default_target = ".agent/skills" if Path(".agent/skills").exists() else "."
    parser = argparse.ArgumentParser(description="SkillSpector High & Extreme Risk Scanner")
    parser.add_argument("target", nargs="?", default=default_target, help="Directory, skill, or repo to scan (default: .agent/skills or .)")
    parser.add_argument("--no-recursive", action="store_true", help="Scan only the target folder itself")
    args = parser.parse_args()

    run_scan(args.target, recursive=not args.no_recursive)
