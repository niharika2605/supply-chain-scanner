# Supply Chain Risk Scanner

A full-stack security tool that scans `package.json` files for npm supply chain risks — typosquatting and dependency confusion — and uses the Claude API to generate plain-English risk explanations and remediation guidance.

**Live app:** https://supply-chain-scanner.vercel.app
**Backend API:** https://supply-chain-scanner-backend.onrender.com/api/health

> Note: the backend is hosted on Render's free tier, which sleeps after inactivity. The first request after idle time may take 30–60 seconds to respond.

---

## Why this project

This project extends research I've contributed to the security community. I have two merged pull requests to [OWASP CheatSheetSeries](https://github.com/OWASP/CheatSheetSeries) — one documenting dependency confusion attack prevention, and one covering slopsquatting (AI-hallucinated package name squatting), which I identified as a documentation gap and wrote independently.

This scanner turns that research into a working detection tool: it implements the actual heuristics needed to catch these attack patterns in a real `package.json`, rather than just describing them.

---

## What it detects

**1. Typosquatting** — dependencies with names suspiciously similar to popular npm packages (e.g. `expres` vs `express`), verified using:
- Levenshtein distance against a cached list of the top 5,000 npm packages by download count
- Real npm registry metadata (package age, weekly downloads) to reduce false positives — a name-only match isn't enough; an old, well-downloaded package with a similar name is treated very differently from a brand-new, barely-downloaded one

**2. Dependency confusion** — dependencies that look like they were meant to be private/internal packages (e.g. `internal-auth-service`, `@company-internal/payments`) but already exist publicly on npm, which is the exact vulnerability pattern used in real dependency confusion attacks.

Each finding gets a computed 0–100 risk score based on match distance, package age, and download volume — not just a static severity label.

---

## AI-powered explanations

Findings are sent to the Claude API (Haiku 4.5) to generate a plain-English explanation and concrete remediation steps for each risk, so results are understandable by developers without a security background.

The AI layer is designed to be **additive, not load-bearing**: if the AI call fails for any reason (rate limits, no credit, network issues), the scan still completes successfully with full detection results — only the AI explanation fields are omitted. This was deliberately tested by triggering a real API billing failure during development to confirm the fallback path works end-to-end.

---

## Security features

- **JWT authentication** with bcrypt password hashing
- **User-scoped data access** — the single-scan retrieval endpoint (`GET /api/scan/:id`) queries by both scan ID *and* authenticated user ID, preventing one user from viewing another user's scan data by guessing/incrementing IDs (an IDOR vulnerability class)
- **Rate limiting** on the scan endpoint (20 requests per 15 minutes per IP), since each scan triggers real external npm API calls
- **Helmet** middleware for standard security headers
- Vague, non-enumerable login error messages (doesn't reveal whether an email is registered)
- Graceful handling of malformed/unexpected input at every layer — including a real bug found during testing where an npm registry API returned an unexpected status code for a malformed scoped package name, which previously crashed the scan; fixed so any lookup failure degrades safely instead of taking down the whole request

---

## Tech stack

**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcrypt
**Frontend:** React (Vite)
**AI:** Anthropic Claude API
**Deployment:** Render (backend), Vercel (frontend), MongoDB Atlas

---

## Architecture

```
User submits package.json
        │
        ▼
Parse dependencies (name + version)
        │
        ├──▶ Typosquat Detector ───▶ compares against cached top-5000
        │                            npm packages (Levenshtein distance)
        │                            + live npm registry metadata check
        │
        └──▶ Dependency Confusion Detector ───▶ checks internal-looking
                                                  names against public
                                                  npm registry
        │
        ▼
Combined findings, risk-scored and sorted
        │
        ▼
Claude API enrichment (plain-English explanation + remediation)
   — fails gracefully if unavailable
        │
        ▼
Saved to MongoDB, scoped to authenticated user
        │
        ▼
Returned to frontend, rendered as a color-coded risk dashboard
```

---

## Running locally

**Backend:**
```bash
cd backend
npm install
# create a .env file with:
# MONGO_URI=
# JWT_SECRET=
# JWT_EXPIRES_IN=7d
# ANTHROPIC_API_KEY=
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Backend runs on `http://localhost:5000`, frontend on `http://localhost:5173`.

---

## Project structure

```
backend/
  src/
    detectors/       typosquat + dependency confusion detection logic
    services/        npm registry client, Claude API client, scan orchestration
    models/           MongoDB schemas (User, Scan, PopularPackage)
    routes/           auth + scan API endpoints
    middleware/       JWT auth middleware
    scripts/          test scripts + popular package seed script
frontend/
  src/
    components/       ScanInput, ResultsDashboard, FindingCard, ScanHistory, AuthForm
    services/          API client (axios)
```

---

## Future improvements

- Maintainer/ownership change tracking (requires historical registry data not currently available)
- Scheduled re-scans with alerting on newly detected risk
- GitHub integration for scanning a repo directly via URL instead of manual paste/upload

---

## Author

Niharika Jain — [GitHub](https://github.com/niharika2605)
