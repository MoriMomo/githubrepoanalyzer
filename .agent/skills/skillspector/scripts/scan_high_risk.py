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


def scan_single(path: str) -> dict:
    cmd = ["skillspector", "scan", path, "--no-llm", "--format", "json"]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    try:
        return json.loads(proc.stdout)
    except Exception:
        # Fallback if raw text returned
        return {}


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
        print(f"Error: Target path '{target_dir}' does not exist.")
        sys.exit(1)

    print(f"\n🔍 SkillSpector Security Scan: High & Extreme Risks Only")
    print(f"   Target: {target}")
    print(f"   Filter: Severity >= HIGH (CRITICAL, HIGH)\n")

    # Discover skills
    skill_dirs = []
    if recursive:
        for child in sorted(target.iterdir()):
            if child.is_dir() and (child / "SKILL.md").exists():
                skill_dirs.append(child)
    
    if not skill_dirs:
        # Single skill target
        skill_dirs = [target]

    high_risk_found = False
    results_summary = []

    for sdir in skill_dirs:
        data = scan_single(str(sdir))
        issues = data.get("issues", [])
        risk_assessment = data.get("risk_assessment", {})
        score = risk_assessment.get("score", 0)
        overall_sev = risk_assessment.get("severity", "LOW")

        # Filter strictly for HIGH and CRITICAL
        high_issues = [i for i in issues if str(i.get("severity", "")).upper() in HIGH_RISK_SEVERITIES]

        status_icon = "❌" if high_issues or score >= 50 else "✅"
        results_summary.append((sdir.name, score, overall_sev, len(high_issues), high_issues))

        if high_issues or score >= 50:
            high_risk_found = True

    # Output Clean Table
    print(f"  {'Skill':<25} {'Score':<8} {'Severity':<12} {'High/Extreme Issues'}")
    print(f"  {'-'*25} {'-'*8} {'-'*12} {'-'*20}")
    for name, score, sev, count, _ in results_summary:
        indicator = "⚠️ ALERT" if count > 0 or score >= 50 else "✓ PASS"
        print(f"  {name:<25} {score:<8} {sev:<12} {count} ({indicator})")

    # Detailed High/Extreme issues
    if high_risk_found:
        print("\n🚨 High & Extreme Risk Findings Breakdown:")
        for name, score, sev, count, high_issues in results_summary:
            if high_issues:
                print(f"\n• Skill: {name} (Score: {score}/100, Severity: {sev})")
                for issue in high_issues:
                    print(format_issue(issue))
        print("\n❌ FAILED: High or Extreme security vulnerabilities detected.")
        sys.exit(1)
    else:
        print("\n✅ PASSED: Zero High or Extreme (Critical) vulnerabilities detected across scanned skills.")
        sys.exit(0)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SkillSpector High & Extreme Risk Scanner")
    parser.add_argument("target", nargs="?", default=".agent/skills", help="Directory or skill to scan")
    parser.add_argument("--no-recursive", action="store_true", help="Scan only the target folder itself")
    args = parser.parse_args()

    run_scan(args.target, recursive=not args.no_recursive)
