# Agent Instructions — Collaboration Scorecard App

## Project Overview

This is a performance-based partnership qualification tool. The purpose is to capture honest signals without coaching and provide clear decision bands for collaboration decisions.

**What this is NOT:**
- Not a CRM
- Not marketing automation
- Not lead nurturing
- Not a quiz funnel

## Tech Stack

- **Frontend**: React + TypeScript
- **Backend**: Node.js + TypeScript/Express
- **Database**: PostgreSQL
- **Hosting**: Railway
- **Testing**: Jest (backend), Vitest (frontend)

## Key Concepts

### Scoring System
- Maximum score: **70 points**
- Decision bands:
  - **55-70**: Proceed
  - **45-54**: Proceed w/ Safeguards
  - **<45**: Pause

### Core Entities
1. **Assessment** - Parent container for a full evaluation
2. **Section** - Groups related questions
3. **Question** - Individual assessment item (numeric, checkbox, text)
4. **Response** - User answers
5. **Score** - Calculated results
6. **DecisionBand** - Final recommendation output

## Development Patterns

### Story Size
Each user story should be small enough to complete in one context window:
- Add a single model/schema
- Create one API endpoint
- Build one UI component
- Add one feature to existing component

### Quality Checks
Before each commit:
- Run `npm run typecheck` (both frontend/backend)
- Run `npm test`
- For UI stories: verify in browser using dev-browser skill

### Browser Verification
UI stories must include acceptance criteria: "Verify in browser"
- Start dev server
- Navigate to component/page
- Interact with UI
- Confirm visual/functional correctness

## File Structure

```
collaboration-scorecard-app/
├── backend/
│   ├── src/
│   │   ├── models/       # TypeScript entity models
│   │   ├── scoring/      # Score calculation logic
│   │   ├── api/          # Express routes
│   │   ├── export/       # PDF/export functionality
│   │   └── config/       # Environment configuration
├── frontend/
│   ├── src/
│   │   ├── pages/        # Page components (intake, admin, summary)  
│   │   └── components/   # Reusable UI components
├── docs/                 # Sprint documentation
├── scripts/ralph/        # Ralph autonomous agent files
└── progress.txt          # Ralph iteration learnings
```

## Commands

```bash
# Backend
cd backend
npm install
npm run dev          # Start dev server
npm run typecheck    # Type checking
npm test             # Run tests

# Frontend  
cd frontend
npm install
npm run dev          # Start dev server
npm run typecheck    # Type checking
npm test             # Run tests

# Ralph
./scripts/ralph/ralph.sh [iterations]
```

## Gotchas

### Signal Capture Principle
The intake UI must NEVER "coach" the respondent. Questions should be neutral and honest signal capture is the priority.

### Admin Override Logging
Any admin score override MUST be logged for audit purposes. Never allow silent overrides.

### Compliance Questions
Compliance questions are conditional - they only appear based on earlier responses. Implement careful conditional logic.

## Sprint Progress

Current sprint objectives detailed in `docs/SPRINT_OBJECTIVES.md`

## Patterns Discovered

(Ralph will add learnings here as development progresses)
