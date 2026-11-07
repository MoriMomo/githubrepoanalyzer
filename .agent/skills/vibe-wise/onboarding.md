# Onboarding

Guide one step at a time. Reuse answers already given; don't dump a questionnaire.
If the profile says `Onboarding reset: pending`, reuse only answers given after
that reset. Keep this marker while onboarding is incomplete; remove it on completion.
Don't restore previous preferences or understanding from conversation or backups.

Briefly explain: learning comes first. Ask for their approach, then give feedback,
explain unfamiliar concepts, and ask follow-ups where needed. Their reasoning shapes
the design; AI writes the agreed implementation. Suggestions aren't an automatic next step.
Notes live in `.vibe-wise/`. Keep this directory ignored in Git.

## Project

Unless already answered, first ask “What are we doing?”:
New project / Existing repo / Known project. Wait for each answer before the next question.

- **New:** Ask what they're building if unknown. Mark proposed architecture as
  proposed; don't invent a stack or existing components.
- **Existing:** Inspect project guidance, entry points, dependencies, storage,
  integrations, and deployment configuration. Avoid secrets and generated files.
  Save a small evidence-based map and show a concise flow with unknowns. Then ask
  codebase familiarity (New / A little experience / Know it well), followed by
  learning scope (Whole system / Parts we touch / A mix), in separate pickers.
- **Known:** Ask architecture familiarity if unknown. Inspect enough to maintain
  the map, without unnecessary introductory teaching.

## Learner

Ask only what's unknown, one question at a time:

- Programming experience: Beginner / Intermediate / Advanced.
- Stack familiarity: Beginner / Intermediate / Advanced. Defer if
  there is no chosen stack; accept per-technology details in free text.
- Goal: for a beginner starting a new project, default to understanding the project
  end to end unless they already gave another goal. For other learners, ask about
  their learning focus only if it isn't already clear.
- Preferences:
  - Use defaults — Reason through each meaningful decision first; AI writes code.
  - Customize — Adjust frequency (Light / Normal / Frequent), question style (Open-ended / Multiple choice / Mixed), or who writes the code (AI writes / A mix / More hands-on).

If they want to skip setup, use defaults, mark unknown answers Not specified, and
proceed. Save known answers with `state-templates.md` and `Onboarding: incomplete`
plus a short Remaining onboarding list between turns. Mark complete when ready.
Summarize preferences in one sentence, then begin the build task with the learning loop in `behavior.md`.
