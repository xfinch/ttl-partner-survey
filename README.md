# Collaboration Scorecard App

A performance-based partnership qualification tool that uses structured signals to make faster, clearer decisions about collaborations.

## Project Purpose

This application helps qualify performance-based collaborations by:
- Capturing honest signals without coaching
- Calculating objective scores based on key criteria
- Providing clear decision bands (Proceed, Proceed w/ Safeguards, Pause)
- Protecting energy and ensuring compliance

## What This Is NOT
- Not a CRM
- Not marketing automation
- Not lead nurturing
- Not a quiz funnel

## Sprint Structure

This project is organized into 6 sprints:

- **Sprint 0**: Product Definition & Guardrails
- **Sprint 1**: Data Model & Scoring Logic
- **Sprint 2**: Respondent Intake UI
- **Sprint 3**: Admin Review Dashboard
- **Sprint 4**: Output & Artifacts
- **Sprint 5**: Infrastructure & Deployment
- **Sprint 6**: V2 Backlog (Parked)

## Tech Stack

- **Backend**: TypeScript/Node.js
- **Frontend**: React/TypeScript
- **Database**: PostgreSQL
- **Hosting**: Railway

## Development

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or Railway)
- npm or yarn

### Local Development

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Running Tests
```bash
cd backend
npm test
```

### Type Checking
```bash
cd backend && npm run typecheck
cd frontend && npm run typecheck
```

## Deployment (Railway)

### Prerequisites
- Railway CLI installed (`npm i -g @railway/cli`)
- Railway account and project created

### Deploy Steps

1. **Link to Railway project:**
```bash
railway link
```

2. **Add PostgreSQL:**
   - In Railway dashboard, add PostgreSQL service
   - Copy the `DATABASE_URL` connection string

3. **Set environment variables:**
```bash
# Backend service
railway variables set DATABASE_URL="postgresql://..."
railway variables set NODE_ENV="production"
railway variables set FRONTEND_URL="https://your-frontend.railway.app"

# Frontend service
railway variables set VITE_API_URL="https://your-backend.railway.app"
```

4. **Deploy services:**
```bash
# Deploy backend
cd backend
railway up

# Deploy frontend
cd frontend
railway up
```

5. **Run database migrations:**
```bash
railway run npx prisma db push
railway run npx prisma db seed
```

### Health Check
Backend exposes `/health` endpoint for Railway health checks.

See individual sprint documentation in `docs/` for detailed specifications.

## Repository

- Remote: git@github.com:xfinch/ttl-partner-survey.git
- Orchestration: Claude Code (post-sprint planning)
