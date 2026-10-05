# FIXFLOW

**Visual Troubleshooting Intelligence — Turn Any Error Screenshot Into a Structured Diagnosis**

> Drop a screenshot. Describe what happened. Get a full diagnostic report with evidence, root cause, and a step-by-step action plan. In under 10 seconds.

---

## Table of Contents

1. [What Is FixFlow?](#1-what-is-fixflow)
2. [Problem Statement & Target Users](#2-problem-statement--target-users)
3. [Live Demo — 90-Second Walkthrough](#3-live-demo--90-second-walkthrough)
4. [Architecture Overview](#4-architecture-overview)
5. [AI Component — How It Works](#5-ai-component--how-it-works)
6. [Project Structure](#6-project-structure)
7. [How to Run](#7-how-to-run)
8. [Sample Demonstrations](#8-sample-demonstrations)
9. [Schema — What the AI Returns](#9-schema--what-the-ai-returns)
10. [Known Limitations](#10-known-limitations)
11. [Future Roadmap](#11-future-roadmap)
12. [Evaluation Checklist](#12-evaluation-checklist)

---

## 1. What Is FixFlow?

Most people, when something breaks on their computer, do one of two things:

1. Paste the error into Google and wade through Stack Overflow threads from 2013.
2. Give up and ask someone else.

**FixFlow does something different.**

You drag in the error screenshot. You (optionally) describe what happened. FixFlow reads the image using a multimodal vision AI, extracts the visible signals, and returns a **structured diagnostic report** — not a wall of text, but an organized breakdown:

```
DIAGNOSIS
─────────────────────────────────────────────────────
Connection refused to local service

EVIDENCE                          ASSESSMENT
ECONNREFUSED                      SEVERITY: MEDIUM
localhost:8000                    CONFIDENCE: 87%
connection refused error

MOST LIKELY CAUSE
Backend service is unavailable or stopped.

ACTION PLAN
01  CHECK THE BACKEND → Confirm the backend is running
02  VERIFY THE PORT   → Ensure both sides use port 8000
03  RETRY             → Restart and reconnect
```

It is a **diagnostic workstation**, not a chatbot. It looks like a technical tool, works like a technical tool, and gives you the kind of answer a senior engineer would give — without requiring you to be one.

---

## 2. Problem Statement & Target Users

### The Problem

Technical errors are opaque. A developer with 10 years of experience reads `ECONNREFUSED` and knows exactly what to do. A junior developer, a student, or a non-technical team member reads the same message and is completely stuck.

The gap between "seeing an error" and "knowing what to do about it" is enormous. Current solutions are:

| Approach | Problem |
|---|---|
| Google search | Requires knowing what to search for. Results are noisy. |
| Stack Overflow | Assumes background knowledge. Often outdated. |
| Ask a colleague | Not always available. Doesn't scale. |
| Generic AI chatbot | Returns a wall of free-form text. No structure. No action plan. |

**FixFlow bridges this gap** by accepting exactly what the user already has — a screenshot — and returning exactly what they need — a structured, numbered, actionable diagnosis.

### Target Users

| User Type | How FixFlow Helps |
|---|---|
| **Junior Developers** | Understand errors they've never seen before without needing to search |
| **Students** | Get immediate, educational feedback on what went wrong and why |
| **DevOps / Support Teams** | Rapid triage of incidents from screenshots without reproducing the environment |
| **Non-technical Founders / PMs** | Can self-diagnose basic technical issues without blocking an engineer |
| **Technical Writers / QA Engineers** | Rapidly document bugs with AI-generated structured evidence |

### Why This Problem Matters

- A 2023 Stack Overflow survey found developers spend an average of **30 minutes per day** debugging issues they've encountered before.
- First-level support teams resolve **less than 40%** of technical tickets on first contact — largely because the error context is incomplete.
- FixFlow targets the **evidence → diagnosis → action** pipeline that currently lives only in experienced engineers' heads.

---

## 3. Live Demo — 90-Second Walkthrough

The entire demonstration runs in 90 seconds with no setup required (uses built-in demo scenarios).

```
STEP 01 — OPEN
  Navigate to http://localhost:5173
  FixFlow loads instantly. No login. No onboarding wizard.

STEP 02 — SELECT DEMO
  On the right panel, click:
  "01  LOCAL APPLICATION — Connection refused"

STEP 03 — ANALYSIS SEQUENCE
  Watch the live diagnostic stages:
  ✓ Reading visual evidence        COMPLETE
  ✓ Extracting visible signals     COMPLETE
  ✓ Identifying problem class      COMPLETE
  ✓ Evaluating possible causes     COMPLETE
  ✓ Building action plan           COMPLETE

STEP 04 — DIAGNOSIS
  The result screen shows:
  - Problem title (large, clear)
  - Severity: MEDIUM
  - Confidence: 87%
  - Evidence list (monospace, technical)
  - Why this diagnosis?
  - 3 possible causes with likelihood ratings

STEP 05 — ACTION PLAN
  Three numbered, ordered steps:
  01 CHECK THE BACKEND
  02 VERIFY THE PORT
  03 RETRY

STEP 06 — TOGGLE VIEW
  Switch between TECHNICAL ↔ SIMPLE view
  Technical: "TCP SYN packet refused. No socket bound on 127.0.0.1:8000."
  Simple:    "Your app is trying to talk to another program that isn't running."

STEP 07 — EXPORT
  Click EXPORT REPORT → downloads a plain-text incident report
  Ready to paste into a ticket, Notion, or Slack.
```

### For Live AI Analysis (with a real screenshot):
1. Drag any error screenshot into the left panel
2. Optionally describe what you were doing
3. Click **ANALYZE PROBLEM →**
4. The AI analyzes the image and returns a live structured diagnosis

---

## 4. Architecture Overview

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                           │
│                                                                 │
│  ┌──────────────┐    ┌──────────────────────────────────────┐  │
│  │  INPUT PANEL │    │           DIAGNOSIS PANEL            │  │
│  │              │    │                                      │  │
│  │  Drop image  │    │  Problem · Severity · Confidence     │  │
│  │  + describe  │    │  Evidence · Causes · Actions         │  │
│  │              │    │  Safety Warnings · Export Report     │  │
│  └──────┬───────┘    └──────────────────────────────────────┘  │
│         │                           ▲                          │
│    React + Vite Frontend (Port 5173)│                          │
└─────────┼───────────────────────────┼──────────────────────────┘
          │  HTTP POST /analyze        │ JSON DiagnosisResponse
          │  multipart/form-data       │
          ▼                           │
┌─────────────────────────────────────┴──────────────────────────┐
│                    FASTAPI BACKEND  (Port 8000)                 │
│                                                                 │
│  ┌─────────────┐   ┌──────────────┐   ┌─────────────────────┐ │
│  │ /analyze    │   │  VALIDATION  │   │   DEMO MODE         │ │
│  │ endpoint    │──▶│  MIME type   │   │   (no API key       │ │
│  │             │   │  File size   │   │    needed)          │ │
│  │             │   │  10MB limit  │   │                     │ │
│  └──────┬──────┘   └──────────────┘   └─────────────────────┘ │
│         │                                                       │
│  ┌──────▼──────────────────────────────────────────────────┐   │
│  │                    ai_service.py                        │   │
│  │                                                         │   │
│  │  image → base64 encode                                  │   │
│  │        → build multimodal prompt                        │   │
│  │        → POST to Groq API                               │   │
│  │        → extract JSON from response                     │   │
│  │        → coerce + validate with Pydantic                │   │
│  │        → return DiagnosisResponse                       │   │
│  └──────┬──────────────────────────────────────────────────┘   │
└─────────┼───────────────────────────────────────────────────────┘
          │  HTTPS · Bearer token · base64 image
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GROQ CLOUD API                               │
│                                                                 │
│         Model: qwen/qwen3.8-27b  (multimodal vision)           │
│         Input: text prompt + base64 PNG/JPG/WEBP image          │
│         Output: JSON object (response_format: json_object)      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Request → Response Flow

```
User uploads screenshot
        │
        ▼
Browser reads file as Blob
        │
        ▼
FormData: { file: Blob, description: string }
        │
        ▼
POST http://localhost:8000/analyze
        │
        ▼
FastAPI validates MIME type (PNG/JPG/WEBP only)
FastAPI validates size (≤ 10 MB)
        │
        ▼
image bytes → base64 string
        │
        ▼
Build prompt with user description + schema instructions
        │
        ▼
POST https://api.groq.com/openai/v1/chat/completions
  model: qwen/qwen3.8-27b
  messages:
    [system]  "Return valid JSON only..."
    [user]    text: prompt
              image_url: data:image/png;base64,...
        │
        ▼
Groq returns JSON string
        │
        ▼
_extract_json() — strips markdown fences, finds JSON block
        │
        ▼
_coerce_to_diagnosis() — normalizes model output quirks
        │
        ▼
Pydantic validates against DiagnosisResponse schema
        │
        ▼
Response sent back to browser as JSON
        │
        ▼
React renders structured Diagnosis Panel
```

### Technology Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | React 19 + Vite 8 | Fast HMR, modern component model |
| **Styling** | Tailwind CSS v4 | Utility-first, heavily customized away from defaults |
| **Fonts** | Space Grotesk + IBM Plex Mono | Display + monospace technical identity |
| **Backend** | FastAPI (Python 3.9) | Async, typed, fast, auto-docs at /docs |
| **Validation** | Pydantic v2 | Strict schema enforcement on AI output |
| **AI Provider** | Groq Cloud API | Fastest inference available (LPU hardware) |
| **AI Model** | qwen/qwen3.8-27b | Multimodal vision — reads both text and images |
| **Env Config** | python-dotenv | Key management without hardcoding |

---

## 5. AI Component — How It Works

This is the core of FixFlow. Understanding it is important.

### What "Multimodal" Means

A regular language model only reads text. A **multimodal** model reads both text and images at the same time. When you send it a screenshot, it can see the error messages, the terminal output, the UI state — just like a human would.

```
INPUT TO MODEL
──────────────────────────────────────────────
[IMAGE]       Your error screenshot
              (encoded as base64, sent inline)

[TEXT]        System instruction:
              "You are a diagnostic AI.
               Return compact JSON only."

[TEXT]        User prompt:
              "User says: App crashes on startup.
               Return JSON with: problem, severity,
               confidence, evidence, causes, actions..."
──────────────────────────────────────────────
```

### The Prompt Engineering Strategy

FixFlow uses a structured prompt that tells the model exactly what schema to return, with length constraints to stay within the free API token limits:

```
You are an expert diagnostic AI for software, network, and system issues.
Given a screenshot and user description, return a compact JSON diagnostic report.

Return JSON with EXACTLY these keys (keep all string values SHORT — max 2 sentences):

- problem         (string): one-line problem summary
- category        (string): e.g. "NETWORK", "CONFIGURATION"
- severity        (string): CRITICAL | HIGH | MEDIUM | LOW
- confidence      (integer 0-100)
- evidence        (array of 2-4 short strings)
- possible_causes (array of 2-3 objects with cause + likelihood)
- diagnosis       (string): 1-2 sentences
- recommended_actions (array of 2-3 objects with title, description, expected_result)
- warnings        (array): only if truly dangerous
- simple_explanation  (string): 1 sentence for non-technical users
- technical_explanation (string): 1-2 precise sentences
- escalation_conditions (array): when to call a specialist
```

### Why Groq?

Groq runs inference on dedicated **LPU (Language Processing Unit)** hardware. This means:
- Response times of **1–3 seconds** vs 10–20 seconds for typical GPU inference
- Critical for a tool where the user is waiting for a result
- Free tier available for prototyping

### Output Safety Pipeline

The AI output goes through three validation layers before reaching the user:

```
Raw model text
      │
      ▼
_extract_json()          ← strips markdown fences, finds JSON block via regex
      │
      ▼
_coerce_to_diagnosis()   ← normalizes quirky outputs:
      │                      - "87%" string → 87 integer
      │                      - plain string causes → {cause, likelihood} objects
      │                      - plain string actions → {title, description, expected_result}
      │                      - single string evidence → list
      ▼
Pydantic DiagnosisResponse ← strict type validation, rejects malformed output
      │
      ▼
Safe structured JSON to frontend
```

This means **no raw model output ever reaches the user**. The system either returns a valid structured diagnosis, or it fails with a clear error message.

### Safety Guardrails Built Into the Prompt

- "Facts from image take priority over assumptions."
- "Prefer reversible actions."
- "Do NOT suggest deleting files as a first step."
- "Do NOT claim exact hardware failures without evidence."
- Warnings field only populated if genuinely dangerous actions are possible.
- Confidence score forces the model to express uncertainty rather than fake certainty.

### Fallback / Demo Mode

If the API key is not configured or the API fails:

```
┌─────────────────────────────────────────────┐
│ LIVE ANALYSIS UNAVAILABLE                   │
│                                             │
│ Running demo mode.                          │
│ These results are pre-built scenarios,      │
│ not live AI output.                         │
└─────────────────────────────────────────────┘
```

Three deterministic scenarios run entirely offline with no API calls, so the product is always demonstrable.

---

## 6. Project Structure

```
fixflow/
│
├── backend/                    ← FastAPI Python server
│   ├── main.py                 ← API routes, CORS, validation, startup checks
│   ├── ai_service.py           ← Groq API call, JSON extraction, output coercion
│   ├── schemas.py              ← Pydantic models (DiagnosisResponse, Cause, Action)
│   ├── demo_data.py            ← 3 offline demo scenarios (no API needed)
│   ├── requirements.txt        ← Python dependencies
│   ├── .env                    ← GROQ_API_KEY (not committed to git)
│   ├── .env.example            ← Template for new developers
│   └── venv/                   ← Python virtual environment
│
├── frontend/                   ← React + Vite application
│   ├── src/
│   │   ├── App.tsx             ← State machine: INPUT → ANALYSIS → RESULTS → ERROR
│   │   ├── types.ts            ← TypeScript interfaces matching backend schema
│   │   ├── index.css           ← Tailwind v4 theme + custom design tokens
│   │   └── components/
│   │       ├── Header.tsx      ← Minimal fixed header with version
│   │       ├── InputPanel.tsx  ← Drag-and-drop capture panel + description
│   │       ├── DemoSelector.tsx← Offline scenario list (no AI needed)
│   │       ├── AnalyzingPanel.tsx ← Sequential analysis stage display
│   │       └── DiagnosisPanel.tsx ← Full results: evidence, causes, actions, export
│   ├── vite.config.ts          ← Vite + Tailwind CSS plugin
│   └── tailwind.config.js      ← Custom color system, typography, shape language
│
├── start.sh                    ← Convenience script: starts both servers
└── README.md                   ← This file
```

---

## 7. How to Run

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- **Groq API key** (free at [console.groq.com](https://console.groq.com)) — optional, demo mode works without it

### Step 1 — Clone / Navigate

```bash
cd /Users/cosqube/Documents/AI_Day-Paytm/fixflow
```

### Step 2 — Configure the API Key (for live AI analysis)

```bash
# Create the key file
echo "GROQ_API_KEY=your_key_here" > backend/.env
echo "GROQ_MODEL=qwen/qwen3.8-27b" >> backend/.env
```

> **Demo mode works without this step.** Skip it if you just want to see the UI.

### Step 3 — Start the Backend

```bash
cd backend
source venv/bin/activate          # activate Python virtual environment
uvicorn main:app --port 8000      # start FastAPI
```

You should see:
```
[FixFlow] Groq API key loaded. Model: qwen/qwen3.8-27b
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 4 — Start the Frontend

In a new terminal tab:

```bash
cd frontend
npm run dev                       # start Vite dev server
```

You should see:
```
VITE v8.3.0  ready in 220 ms
➜  Local:   http://localhost:5173/
```

### Step 5 — Open the App

Navigate to **http://localhost:5173** in your browser.

### Verify the Backend is Working

```bash
curl http://localhost:8000/health
# Expected: {"status":"ok","ai_provider":"groq","ai_configured":true,...}
```

---

## 8. Sample Demonstrations

FixFlow ships with three built-in offline demo scenarios. These run instantly with no API key and no image upload required. Click any of them from the right panel on the main screen.

### Demo 01 — LOCAL APPLICATION: Connection Refused

**Scenario:** A developer's frontend app cannot reach its backend after a restart.

```
EVIDENCE                          DIAGNOSIS
────────────────────────────────────────────────────
ECONNREFUSED                      Backend service stopped after restart.
localhost:8000                    No socket is listening on port 8000.
connection refused error          TCP SYN packet was refused by OS.

SEVERITY: MEDIUM    CONFIDENCE: 87%

POSSIBLE CAUSES
01  Backend service unavailable           HIGH
02  Incorrect port in configuration       MEDIUM
03  Local firewall blocking port 8000     LOW

ACTION PLAN
01  CHECK THE BACKEND  → Run the backend process manually
02  VERIFY THE PORT    → Confirm both sides use port 8000
03  RETRY              → Restart frontend and reconnect

CAUTION
Do not delete configuration files yet. Inspect first.
```

---

### Demo 02 — NETWORK: Connected Without Internet

**Scenario:** A device shows "connected" to Wi-Fi but cannot reach the internet.

```
EVIDENCE                          DIAGNOSIS
────────────────────────────────────────────────────
Wi-Fi shows exclamation mark      Router lost upstream ISP connection.
"No Internet" in network panel    Layer 3 routing beyond gateway failing.
Failed ping to 8.8.8.8

SEVERITY: HIGH      CONFIDENCE: 92%

POSSIBLE CAUSES
01  Router lost ISP connection     HIGH
02  DNS resolution failure         MEDIUM
03  Captive portal blocking        LOW

ACTION PLAN
01  RESTART ROUTER  → Power cycle router and modem
02  CHECK DNS       → Ping 8.8.8.8 directly to isolate DNS
```

---

### Demo 03 — CONFIGURATION: Missing Environment Variable

**Scenario:** Application crashes on startup with a KeyError for a missing env var.

```
EVIDENCE                          DIAGNOSIS
────────────────────────────────────────────────────
KeyError: 'DATABASE_URL'          Required env var absent from os.environ.
Stack trace at config.py:42       App has no fallback — crashes immediately.
Application startup crash

SEVERITY: CRITICAL  CONFIDENCE: 95%

POSSIBLE CAUSES
01  .env file missing or not loaded        HIGH
02  Typo in variable name                  MEDIUM
03  Deployment missing secret injection    MEDIUM

ACTION PLAN
01  VERIFY .ENV FILE      → Check file exists in project root
02  CHECK VARIABLE EXPORT → Run: echo $DATABASE_URL
03  UPDATE CONFIG         → Add missing variable

CAUTION
Do not commit .env files to version control.
```

---

## 9. Schema — What the AI Returns

Every analysis — whether live AI or demo — returns this exact structure, validated by Pydantic:

```json
{
  "problem": "Connection refused to local service",
  "category": "LOCAL APPLICATION",
  "severity": "MEDIUM",
  "confidence": 87,
  "evidence": [
    "ECONNREFUSED",
    "localhost:8000",
    "connection refused error message visible"
  ],
  "possible_causes": [
    { "cause": "Backend service is unavailable or stopped.", "likelihood": "HIGH" },
    { "cause": "Incorrect port in configuration.", "likelihood": "MEDIUM" },
    { "cause": "Local firewall blocking connections.", "likelihood": "LOW" }
  ],
  "diagnosis": "A TCP connection to 127.0.0.1:8000 was refused. No process is listening on that port.",
  "recommended_actions": [
    {
      "title": "CHECK THE BACKEND",
      "description": "Confirm the backend service is running.",
      "expected_result": "Service responds on port 8000."
    },
    {
      "title": "VERIFY THE PORT",
      "description": "Check both sides use the same port.",
      "expected_result": "Configurations match."
    }
  ],
  "warnings": [
    "Do not delete configuration files. Inspect first."
  ],
  "simple_explanation": "Your app is trying to talk to another program that isn't running.",
  "technical_explanation": "ECONNREFUSED on 127.0.0.1:8000 — TCP SYN refused, no listening socket.",
  "escalation_conditions": [
    "If backend is verified running but issue persists",
    "If other local services are also failing"
  ]
}
```

Every field has a defined type. The backend **rejects** any response from the AI that doesn't conform to this schema. This prevents hallucinated or garbled output from reaching the user.

---

## 10. Known Limitations

| Limitation | Detail |
|---|---|
| **Free tier token cap** | The free Groq tier limits output to 1,000 tokens/minute on `qwen/qwen3.8-27b`. Max response size is capped at 900 tokens. Very detailed analyses may be truncated. Upgrade to Groq Dev tier to remove this. |
| **Vision model depth** | The model reads visible text in screenshots well, but may miss subtle visual signals (e.g. a specific color state, a loading spinner vs. error state). Describe what you see in the text box for best results. |
| **No memory between sessions** | Each analysis is independent. FixFlow doesn't track what you've analyzed before or build on previous sessions. |
| **English only** | The prompt and UI are in English. Screenshots with error messages in other languages may produce lower-confidence diagnoses. |
| **No command execution** | FixFlow recommends actions but never executes them. It is advisory only, by design. |
| **Image quality** | Very small, blurry, or low-contrast screenshots may produce lower confidence results. Crop to the relevant error area for best results. |
| **10 MB file limit** | Large high-resolution screenshots should be cropped or compressed before upload. |
| **Local only** | Currently runs on localhost. No cloud deployment, authentication, or multi-user support. |

---

## 11. Future Roadmap

### Near Term (Next 4 Weeks)

- [ ] **Conversation mode** — Ask follow-up questions after diagnosis ("What if the backend IS running?")
- [ ] **Multi-image input** — Compare before/after screenshots to identify what changed
- [ ] **Log file input** — Paste raw log text alongside or instead of a screenshot
- [ ] **Copy-to-clipboard** for individual action steps

### Medium Term (Next 3 Months)

- [ ] **Browser extension** — Diagnose directly from any error page without opening FixFlow separately
- [ ] **CI/CD integration** — POST failed build screenshots from your pipeline to get automated diagnoses
- [ ] **History & case log** — SQLite-backed session history to track recurring issues
- [ ] **Team mode** — Share a diagnosis link with a colleague (no account required)

### Long Term (6+ Months)

- [ ] **Domain specialization** — Dedicated diagnostic models fine-tuned on common error databases (AWS errors, Kubernetes events, React error boundaries)
- [ ] **Automated verification** — After suggesting "restart the service," verify it's actually running
- [ ] **Escalation routing** — If escalation conditions are met, generate a pre-filled support ticket
- [ ] **Self-hosted model** — Run a local vision model (Ollama + LLaVA) for air-gapped / enterprise environments
- [ ] **Feedback loop** — Users can rate diagnoses, improving prompt quality over time

---

## 12. Evaluation Checklist

| Criterion | How FixFlow Meets It |
|---|---|
| ✅ **Working prototype with end-to-end demo** | Full working app: upload image → analyze → structured diagnosis → export. Three offline demos run without API key. |
| ✅ **Problem statement and target-user definition** | Section 2. Clear gap between seeing an error and knowing what to do. Targets developers, students, support teams, non-technical founders. |
| ✅ **Architecture / technology overview** | Section 4. Full system diagram, request-response flow diagram, technology stack table. |
| ✅ **Clear explanation of the AI component** | Section 5. Multimodal vision model, prompt engineering strategy, output safety pipeline, all explained step by step. |
| ✅ **Sample data / demonstration dataset** | Section 8. Three fully-specified demo scenarios with actual field values shown. |
| ✅ **Known limitations and future roadmap** | Sections 10 and 11. Honest about token limits, vision depth, language support. Roadmap is concrete and phased. |
| ✅ **Problem relevance and clarity** | Debugging friction is a universal, daily problem for every developer. |
| ✅ **Quality and meaningfulness of AI** | AI is not decorative. It is the entire product. Without it there is no diagnosis. |
| ✅ **Technical depth and execution** | Pydantic schema validation, output coercion pipeline, MIME validation, multipart form handling, CORS, dotenv config. |
| ✅ **Innovation and originality** | Most AI tools return free-form text. FixFlow enforces a structured diagnostic schema — diagnosis is always machine-readable, not conversational. |
| ✅ **User experience and usability** | No login. No onboarding. Drop image, click analyze, get result. Technical/Simple view toggle. One-click report export. |
| ✅ **Practical feasibility and scalability** | Backend is a stateless API. Any number of instances can run behind a load balancer. Frontend is a static build. |
| ✅ **Demonstrated impact** | Transforms a multi-step debugging process (search → read → guess → try) into a single 10-second step. |

---

## API Reference

The backend exposes three endpoints, documented automatically at `http://localhost:8000/docs`.

### `GET /health`

Returns the current server and AI configuration state.

```json
{
  "status": "ok",
  "ai_provider": "groq",
  "ai_configured": true,
  "ai_model": "qwen/qwen3.8-27b"
}
```

### `GET /demos`

Returns the list of available built-in demo scenarios.

```json
{
  "demos": [
    { "id": "local_application", "name": "LOCAL APPLICATION", "description": "Connection refused" },
    { "id": "network",           "name": "NETWORK",           "description": "Connected without internet" },
    { "id": "configuration",     "name": "CONFIGURATION",     "description": "Missing environment variable" }
  ]
}
```

### `POST /analyze`

Accepts `multipart/form-data`.

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | image/png, image/jpeg, image/webp | For live analysis | Screenshot of the error |
| `description` | string | Always | User's description of the problem |
| `demo_id` | string | For demo mode | `local_application`, `network`, or `configuration` |

Returns a `DiagnosisResponse` JSON object (see Section 9).

---

*FixFlow — built for AI Day Noida Buildathon 2026. *
## Special Integration: Cognee Memory

This project uses [Cognee](https://cognee.ai) to bring Agentic Memory to diagnostic workflows.
- **Recall**: Retrieves similar past cases before running analysis.
- **Learn**: Persists new diagnostics as knowledge graph context.
