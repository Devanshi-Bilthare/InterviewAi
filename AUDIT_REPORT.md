# Platform Audit Report

Generated: June 24, 2026

## Services Used (All Free)

| Service | Purpose | Free Tier Limit | Status |
|---|---|---|---|
| MongoDB Atlas M0 | Database | 512MB forever | ✅ Configured |
| Google Gemini 2.5 Flash | AI / LLM (interviews, resume, reports) | ~15 RPM, quota via AI Studio | ✅ Active (`gemini-2.5-flash` + `gemini-2.5-flash-lite` fallback) |
| Groq Whisper | Speech-to-text | ~6,000 min/month | ✅ Active (`whisper-large-v3`) |
| Judge0 CE (`ce.judge0.com`) | Code execution | Public free instance (rate-limited) | ✅ Active — **replaces Piston** |
| Piston API (`emkc.org`) | Code execution (planned) | Was unlimited | ⚠️ **Whitelist-only since Feb 2026** — not used |
| Cloudinary | Avatar & resume file storage | 25GB storage / bandwidth | ✅ Optional (analysis works without it) |
| NextAuth.js v5 | Authentication | Self-hosted | ✅ Active |
| Resend | Transactional email | 3,000 emails/month | ✅ Optional |
| Vercel Hobby | Deployment | Free tier | ✅ Compatible |
| OpenAI | — | Paid | ❌ **Removed** — `lib/openai.ts` re-exports Groq only |

> **Note:** The original spec listed Gemini 1.5 Flash and Piston API. Gemini 1.5 Flash returns 404 on the current API. Piston public access is blocked; **Judge0 CE** is the free replacement with no API key required.

---

## Feature Status

### Auth Module

| Feature | Status | Notes |
|---|---|---|
| `app/(auth)/login/page.tsx` | ✅ EXISTS | NextAuth `signIn()` via `LoginForm` |
| `app/(auth)/register/page.tsx` | ✅ EXISTS | Posts to `/api/users/register` |
| `app/(auth)/forgot-password/page.tsx` | ✅ EXISTS | Email reset via Resend |
| `app/api/users/register/route.ts` | ✅ EXISTS | bcryptjs password hashing |
| `app/api/auth/[...nextauth]/route.ts` | ✅ EXISTS | Credentials provider |
| `middleware.ts` | ✅ EXISTS | Protects dashboard, admin, interview, coding, etc. |
| `lib/mongodb.ts` | ✅ EXISTS | Global connection pooling + indexes |

### Resume Module

| Feature | Status | Notes |
|---|---|---|
| `app/(dashboard)/resume/page.tsx` | ✅ EXISTS | Upload UI + score + skills display |
| `app/api/resume/upload/route.ts` | ⚠️ PARTIAL | Combined into **`POST /api/resume`** |
| `app/api/resume/analyze/route.ts` | ⚠️ PARTIAL | Combined into **`POST /api/resume`** (pdf-parse + Gemini) |
| `lib/gemini.ts` | ✅ EXISTS | `GEMINI_API_KEY`, `parseJsonResponse()` |
| `models/Resume.ts` | ✅ EXISTS | Full schema |
| `components/resume/ResumeUploader.tsx` | ✅ EXISTS | Drag-and-drop + paste text |
| `components/resume/SkillsAnalysis.tsx` | ✅ EXISTS | Animated skill/gap tags |

### Interview Engine

| Feature | Status | Notes |
|---|---|---|
| `app/(dashboard)/interview/page.tsx` | ✅ EXISTS | 8 category cards |
| `app/api/interview/generate/route.ts` | ✅ EXISTS | Gemini → `{ sessionId, questions }` |
| `app/(dashboard)/interview/[sessionId]/page.tsx` | ✅ EXISTS | Live session via `LiveInterviewSession` |
| `app/api/speech/transcribe/route.ts` | ✅ EXISTS | **Groq Whisper** (not OpenAI) |
| `app/api/interview/evaluate/route.ts` | ✅ EXISTS | Gemini evaluation + notifications |
| `app/(dashboard)/interview/results/[sessionId]/page.tsx` | ✅ EXISTS | Score ring + radar chart |
| `hooks/useAudioRecorder.ts` | ✅ EXISTS | MediaRecorder wrapper |
| `components/interview/AudioRecorder.tsx` | ✅ EXISTS | Waveform animation |
| `models/InterviewSession.ts` | ✅ EXISTS | — |
| `models/Evaluation.ts` | ✅ EXISTS | — |

### AI Conversational Interviewer

| Feature | Status | Notes |
|---|---|---|
| `app/api/interview/ai-chat/route.ts` | ✅ EXISTS | Multi-turn Gemini chat |
| `app/(dashboard)/interview/ai-mode/page.tsx` | ✅ EXISTS | AI mode entry |
| `components/interview/AIInterviewer.tsx` | ✅ EXISTS | Alex avatar + typewriter |
| Conversation history to Gemini | ✅ EXISTS | `startChat` with history |
| Session ends 8–10 exchanges | ✅ EXISTS | `AI_INTERVIEW_MIN/MAX_EXCHANGES` |

### Coding Module

| Feature | Status | Notes |
|---|---|---|
| `app/(dashboard)/coding/page.tsx` | ✅ EXISTS | Filters + pagination |
| `app/(dashboard)/coding/[problemId]/page.tsx` | ✅ EXISTS | Problem + Monaco editor + console |
| `app/api/coding/problems/route.ts` | ✅ EXISTS | Paginated list |
| `app/api/coding/execute/route.ts` | ✅ EXISTS | **Judge0 CE** (free, no key) |
| `app/api/coding/submit/route.ts` | ✅ EXISTS | All test cases + DB save |
| `lib/judge0.ts` | ✅ EXISTS | Primary executor |
| `lib/piston.ts` | ⚠️ PARTIAL | Shim → re-exports Judge0 (Piston blocked) |
| `components/coding/CodeEditor.tsx` | ✅ EXISTS | `dynamic()` + `ssr: false` |
| `components/coding/ProblemStatement.tsx` | ✅ EXISTS | Wraps `MarkdownRenderer` |
| `models/CodingProblem.ts` | ✅ EXISTS | — |
| `models/CodingSubmission.ts` | ✅ EXISTS | — |
| `scripts/seedProblems.ts` + `scripts/seed.ts` | ✅ EXISTS | **36 coding problems** seeded |

### Dashboard & Progress

| Feature | Status | Notes |
|---|---|---|
| `app/(dashboard)/dashboard/page.tsx` | ✅ EXISTS | Bento-style grid + stagger animations |
| `components/dashboard/ScoreRing.tsx` | ✅ EXISTS | Animated SVG ring |
| `components/dashboard/StatsCard.tsx` | ✅ EXISTS | Count-up animation |
| `components/dashboard/ProgressChart.tsx` | ✅ EXISTS | Recharts wrapper |
| `app/(dashboard)/progress/page.tsx` | ✅ EXISTS | Full analytics |
| `app/api/progress/route.ts` | ✅ EXISTS | Aggregates scores |
| `app/(dashboard)/reports/page.tsx` | ✅ EXISTS | Career reports UI |
| `app/api/reports/generate/route.ts` | ⚠️ PARTIAL | **`POST /api/reports`** (same file) |

### Admin Module

| Feature | Status | Notes |
|---|---|---|
| `app/(admin)/admin/page.tsx` | ✅ EXISTS | Platform overview |
| `app/(admin)/admin/users/page.tsx` | ✅ EXISTS | User management |
| `app/(admin)/admin/questions/page.tsx` | ✅ EXISTS | Question CRUD |
| `app/api/admin/stats/route.ts` | ✅ EXISTS | MongoDB aggregation |
| `app/api/admin/users/route.ts` | ✅ EXISTS | Admin-only |

### Layout & Shared Components

| Feature | Status | Notes |
|---|---|---|
| `components/layout/Sidebar.tsx` | ✅ EXISTS | Collapsible + mobile sheet |
| `components/layout/Topbar.tsx` | ✅ EXISTS | Notification bell + user menu |
| `app/(dashboard)/layout.tsx` | ✅ EXISTS | Sidebar + topbar + onboarding guard |
| `components/ui/GlowCard.tsx` | ✅ EXISTS | Glass morphism + hover scale |
| `app/error.tsx` + `app/not-found.tsx` | ✅ EXISTS | Error pages |
| `app/onboarding` | ✅ EXISTS | 4-step wizard |
| `app/(dashboard)/profile` | ✅ EXISTS | Avatar, skills, password, delete |
| Notifications (`NotificationBell`) | ✅ EXISTS | In-app bell + `/api/notifications` |

---

## Issues Found & Fixed

| # | Issue | Fix Applied |
|---|---|---|
| 1 | OpenAI Whisper used (paid) | Replaced with **Groq** in `lib/groq.ts` + `toFile()` |
| 2 | `gemini-1.5-flash` returns 404 | Upgraded to **`gemini-2.5-flash`** with lite fallback |
| 3 | Piston API whitelist-only (Feb 2026) | Switched to **Judge0 CE** (`https://ce.judge0.com`) |
| 4 | `/resume` page missing (404) | Created page + `POST/GET /api/resume` |
| 5 | Cloudinary typo blocked resume analysis | Upload wrapped in try/catch; analysis continues |
| 6 | Gemini JSON parse failures | Added `parseJsonResponse()` with fence stripping |
| 7 | Monaco SSR errors | `dynamic()` import with `ssr: false` |
| 8 | MongoDB dynamic import RSC error | Static import of `mongodb-indexes` |
| 9 | `Button` ref warning in dropdowns | `React.forwardRef` on `Button` |
| 10 | Stale `.next` cache → chunk 404s | Documented: `rm -rf .next && npm run dev` |
| 11 | Missing resume components | Created `ResumeUploader`, `SkillsAnalysis` |
| 12 | Missing onboarding page | Recreated 4-step wizard at `/onboarding` |
| 13 | Email/notifications on interview complete | Wired in `evaluate`, `ai-chat`, `reports` routes |
| 14 | Duplicate `NotificationBell` import | Fixed in `Topbar.tsx` |

---

## Issues Still Remaining

| # | Item | Action Required |
|---|---|---|
| 1 | **Piston API unavailable** | Use Judge0 CE (current default). For production scale, self-host Piston or Judge0 on Railway. |
| 2 | **`openai` npm package** | Still in `package.json` but unused — safe to `npm uninstall openai` |
| 3 | **Gemini quota (429)** | If rate-limited, set `GEMINI_MODEL=gemini-2.5-flash-lite` in `.env.local` |
| 4 | **Judge0 CE rate limits** | Public instance may throttle under heavy load — retry or self-host |
| 5 | **`.env.local` secrets** | Must be filled manually (never commit to git) |
| 6 | **Database seed** | Run `npm run seed` once if collections are empty |
| 7 | **Dev + build conflict** | Do not run `npm run build` while `npm run dev` is active |
| 8 | Split API routes** | Spec lists `/api/resume/upload` + `/analyze` and `/api/reports/generate` — functionally merged into single routes |

---

## Environment Variables

Documented in **`.env.example`**:

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `NEXTAUTH_SECRET` | Yes | Session encryption |
| `NEXTAUTH_URL` | Yes | App URL (e.g. `http://localhost:3000`) |
| `GEMINI_API_KEY` | Yes | Google AI Studio key |
| `GEMINI_MODEL` | No | Default: `gemini-2.5-flash` |
| `GEMINI_FALLBACK_MODEL` | No | Default: `gemini-2.5-flash-lite` |
| `GROQ_API_KEY` | Yes | Groq Whisper transcription |
| `CLOUDINARY_CLOUD_NAME` | No | File uploads |
| `CLOUDINARY_API_KEY` | No | File uploads |
| `CLOUDINARY_API_SECRET` | No | File uploads |
| `RESEND_API_KEY` | No | Email notifications |
| `RESEND_FROM_EMAIL` | No | Sender address |
| `JUDGE0_API_URL` | No | Default: `https://ce.judge0.com` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | No | Google OAuth (optional) |

**Deprecated (leave empty):** `OPENAI_API_KEY`, `JUDGE0_API_KEY`, `JUDGE0_RAPIDAPI_KEY`

---

## Final Checklist

- [x] No paid API is used anywhere in the codebase (OpenAI removed; Judge0 RapidAPI optional/unused)
- [x] All `.env` variables are documented in `.env.example`
- [x] Monaco editor uses `dynamic` import with `ssr: false`
- [x] All Gemini **JSON** responses go through `parseJsonResponse()` via `generateGeminiJSON()`
- [ ] Piston API for code execution — **not viable**; Judge0 CE used instead
- [x] Groq used for speech-to-text (not OpenAI)
- [x] MongoDB uses connection pooling pattern (`global.mongooseCache`)
- [x] All DB-backed API routes call `connectDB()` (20/22 routes; auth + transcribe exempt)
- [x] Protected routes checked in `middleware.ts` via NextAuth
- [x] `AUDIT_REPORT.md` generated at project root

---

## How to Run

```bash
npm install
cp .env.example .env.local
# Fill in: MONGODB_URI, NEXTAUTH_SECRET, GEMINI_API_KEY, GROQ_API_KEY
npm run seed    # optional: seed 36 problems, questions, admin user
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Test accounts (after seed):**
- Admin: `admin@interviewai.com` / `Admin@123`
- Or register a new candidate account

**If you see 404 on `/_next/static/...` chunks:**

```bash
# Stop dev server (Ctrl+C), then:
rm -rf .next
npm run dev
# Hard refresh browser: Cmd+Shift+R
```
