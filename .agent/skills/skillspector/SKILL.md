---
name: skillspector
description: Security scanner for AI agent skills, instruction files (SKILL.md), and MCP configs using NVIDIA SkillSpector. Detects prompt injection, data exfiltration, privilege escalation, and tool misuse.
---

# NVIDIA SkillSpector: AI Agent Skill Security Scanner

[NVIDIA SkillSpector](https://github.com/NVIDIA/SkillSpector) is an open-source security analyzer designed specifically for AI agent skills, custom instruction files (`SKILL.md`), and Model Context Protocol (MCP) tool configurations.

It combines fast parallel static analysis (and optional LLM-assisted semantic auditing) to detect prompt injections, data exfiltration, unauthorized privilege escalation, rogue shell execution, and supply-chain risks.

## Usage & Commands

### 1. High & Extreme Risk Filter (Recommended Default)
Run the high-risk filter script to alert **only on HIGH and CRITICAL (Extreme)** severity risks, suppressing low and medium informational notices:
```bash
python .agent/skills/skillspector/scripts/scan_high_risk.py .agent/skills/
```
To scan a single skill for high/extreme risks:
```bash
python .agent/skills/skillspector/scripts/scan_high_risk.py .agent/skills/<skill-name>/ --no-recursive
```

### 2. Standard Raw Scan (Single Skill)
Scan a specific skill directory using static analysis (fast, deterministic, zero API keys required):
```bash
skillspector scan .agent/skills/<skill-name>/ --no-llm
```

### 3. Scan All Skills Recursively (Raw)
Scan the entire workspace skill registry:
```bash
skillspector scan .agent/skills/ --recursive --no-llm
```

### 3. Generate Markdown or JSON Reports
Export structured audit reports for CI/CD or documentation:
```bash
# Markdown report
skillspector scan .agent/skills/ --recursive --no-llm --format markdown --output skills-security-report.md

# JSON report
skillspector scan .agent/skills/ --recursive --no-llm --format json --output skills-security-report.json
```

### 4. Updating SkillSpector
To update to the latest release:
```bash
uv tool update skillspector
```

## Vulnerability Categories Checked

- **Prompt Injection:** Instruction evasion, persona hijacking, and sandbox boundary bypass attempts.
- **Data Exfiltration:** Network requests leaking local files, environment variables, or API keys.
- **Privilege Escalation:** Arbitrary shell execution, dangerous destructive commands (`rm -rf`, disk wipes, credential tampering).
- **Supply Chain Risks:** Suspicious dependencies, unpinned scripts, or untrusted remote downloads.

