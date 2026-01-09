# Setup Complete ✅

## Repository Initialized

**Location**: `/Users/xavierfinch/sites/paid-perfomance-partnership/collaboration-scorecard-app`  
**Remote**: `git@github.com:xfinch/ttl-partner-survey.git`  
**Branch**: `main` (pushed)

## Framework: Ralph Wiggum

Selected **Ralph** over DOE because:
- ✅ Designed for full-stack web application development
- ✅ Works with PRDs → user stories → autonomous iterations
- ✅ Built-in quality checks (typecheck, tests, browser verification)
- ✅ Integrates with Amp for fresh context per iteration
- ✅ Perfect fit for sprint-based feature development

DOE is better suited for orchestration/automation tasks (email campaigns, scraping).

## Project Structure

```
collaboration-scorecard-app/
├── AGENTS.md              # Agent context & patterns
├── prd.json               # Sprint 1 user stories (14 stories)
├── progress.txt           # Ralph iteration learnings
├── scripts/ralph/         # Ralph autonomous agent
│   ├── ralph.sh          # Main loop script
│   └── prompt.md         # Agent instructions
├── docs/
│   ├── SPRINT_OBJECTIVES.md
│   ├── sprint-0-product-definition/
│   ├── sprint-1-data-model/
│   ├── sprint-2-intake-ui.md
│   ├── sprint-3-admin-dashboard.md
│   ├── sprint-4-output.md
│   ├── sprint-5-infra/
│   └── sprint-6-v2-backlog/
├── backend/src/
│   ├── models/
│   ├── scoring/
│   ├── api/
│   ├── export/
│   └── config/
└── frontend/src/
    ├── pages/
    └── components/
```

## Sprint 1: Data Model & Scoring Logic

**Status**: Ready to execute with Ralph or Claude Code  
**Stories**: 14 user stories defined in `prd.json`

### Key Stories
1. Backend TypeScript setup
2. Frontend React setup
3. Entity models (Assessment, Section, Question, Response, Score, DecisionBand)
4. Scoring calculation logic
5. Decision band determination (55-70, 45-54, <45)
6. Risk flag detection
7. PostgreSQL schema migrations
8. Seed data for testing
9. End-to-end scoring pipeline test

## Next Steps

### Option 1: Run Ralph Autonomous Agent

```bash
cd /Users/xavierfinch/sites/paid-perfomance-partnership/collaboration-scorecard-app
./scripts/ralph/ralph.sh 15
```

Ralph will:
- Create branch `sprint-1-data-model`
- Implement stories one at a time
- Run quality checks (typecheck + tests)
- Commit after each story passes
- Update `prd.json` marking stories as `passes: true`
- Append learnings to `progress.txt`

### Option 2: Hand Off to Claude Code

Transfer orchestration to Claude Code with:
- `prd.json` as the task list
- `AGENTS.md` for context
- `docs/SPRINT_OBJECTIVES.md` for sprint goals

## Scoring System Reference

- **Max Score**: 70 points
- **Decision Bands**:
  - 55-70 → **Proceed**
  - 45-54 → **Proceed w/ Safeguards**
  - <45 → **Pause**

## Key Principles

1. **No coaching** in UI - capture honest signals
2. **Admin overrides must be logged** for audit
3. **Small stories** - each completable in one context window
4. **Quality gates** - typecheck + tests before every commit
5. **Browser verification** - all UI changes verified visually

## Tech Stack

- **Backend**: Node.js + TypeScript + Express
- **Frontend**: React + TypeScript + Vite
- **Database**: PostgreSQL (Prisma recommended)
- **Hosting**: Railway
- **Testing**: Jest (backend), Vitest (frontend)

## Repository Status

✅ Initial scaffold committed  
✅ Ralph framework committed  
✅ Pushed to `origin/main`  
✅ Ready for autonomous development or handoff

---

**Ready to begin Sprint 1 implementation!**
