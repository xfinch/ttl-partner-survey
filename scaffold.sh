#!/bin/bash

set -e

PROJECT_NAME="collaboration-scorecard-app"

echo "🚀 Initializing $PROJECT_NAME..."

# -------------------------
# Root Structure
# -------------------------
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

mkdir -p docs scripts
touch README.md

# -------------------------
# Sprint 0 — Product Definition & Guardrails
# -------------------------
mkdir -p docs/sprint-0-product-definition

cat <<EOF > docs/sprint-0-product-definition/scope.md
# Sprint 0 — Product Definition & Guardrails

## Purpose
Qualify performance-based collaborations using structured signals.

## Non-Goals
- Not a CRM
- Not marketing automation
- Not lead nurturing
- Not a quiz funnel

## Success Criteria
- Faster disqualification
- Clear signal-based decisions
- Energy + compliance protection
EOF

# -------------------------
# Sprint 1 — Data Model & Scoring Logic
# -------------------------
mkdir -p docs/sprint-1-data-model
mkdir -p backend/src/models backend/src/scoring

cat <<EOF > docs/sprint-1-data-model/schema.md
# Sprint 1 — Data Model

Entities:
- Assessment
- Section
- Question
- Response
- Score
- DecisionBand

Max Score: 70
Decision Bands:
- 55–70 → Proceed
- 45–54 → Proceed w/ Safeguards
- <45 → Pause
EOF

touch backend/src/scoring/calculateScore.ts
touch backend/src/models/Assessment.ts

# -------------------------
# Sprint 2 — Respondent Intake UI
# -------------------------
mkdir -p frontend/src/pages/intake
mkdir -p frontend/src/components

cat <<EOF > docs/sprint-2-intake-ui.md
# Sprint 2 — Respondent Intake UI

Goals:
- Honest signal capture
- No coaching
- No skipping required fields

UI Notes:
- Numeric scores (0–10)
- Checkboxes for signals
- Conditional compliance questions
EOF

touch frontend/src/pages/intake/index.tsx
touch frontend/src/components/SectionForm.tsx

# -------------------------
# Sprint 3 — Admin Review Dashboard
# -------------------------
mkdir -p frontend/src/pages/admin
mkdir -p backend/src/api/admin

cat <<EOF > docs/sprint-3-admin-dashboard.md
# Sprint 3 — Admin Review Dashboard

Admin Capabilities:
- View assessments
- See signal strength
- Override scores (logged)
- Final decision control
EOF

touch frontend/src/pages/admin/index.tsx
touch backend/src/api/admin/review.ts

# -------------------------
# Sprint 4 — Output & Artifacts
# -------------------------
mkdir -p backend/src/export
mkdir -p frontend/src/pages/summary

cat <<EOF > docs/sprint-4-output.md
# Sprint 4 — Outputs & Artifacts

Outputs:
- Final score summary
- Decision band explanation
- Risk flags
- Non-negotiables

Optional:
- PDF export
- Read-only share link
EOF

touch backend/src/export/pdf.ts
touch frontend/src/pages/summary/index.tsx

# -------------------------
# Sprint 5 — Infrastructure & Deployment
# -------------------------
mkdir -p docs/sprint-5-infra
mkdir -p backend/src/config

cat <<EOF > docs/sprint-5-infra/deployment.md
# Sprint 5 — Infrastructure

Target:
- Railway hosting
- Postgres database
- API + frontend services

Includes:
- Env vars
- Logging
- Error handling
EOF

touch backend/src/config/env.ts
touch railway.json

# -------------------------
# Sprint 6 — V2 Backlog (Parked)
# -------------------------
mkdir -p docs/sprint-6-v2-backlog

cat <<EOF > docs/sprint-6-v2-backlog/ideas.md
# Sprint 6 — V2 Backlog

- Weighted scoring by engagement type
- AI risk commentary
- Agreement generation
- Multi-collaborator assessments
- Historical scoring trends
EOF

# -------------------------
# Final
# -------------------------
echo "✅ Project scaffold complete."
echo "📁 Navigate to $PROJECT_NAME to begin development."
