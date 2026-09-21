import { ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

const PROBLEMS = [
  { id: '01', label: 'LOCAL APPLICATION', desc: 'Connection refused' },
  { id: '02', label: 'NETWORK', desc: 'Connected without internet' },
  { id: '03', label: 'CONFIGURATION', desc: 'Missing environment variable' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'DROP A SCREENSHOT', body: 'Drag any error screenshot into the capture panel. PNG, JPG, or WEBP. No account needed.' },
  { step: '02', title: 'DESCRIBE WHAT HAPPENED', body: 'Optionally add context — what you were doing when the error appeared.' },
  { step: '03', title: 'AI READS THE IMAGE', body: 'A multimodal vision model reads the visible error text, UI state, and signals in the screenshot.' },
  { step: '04', title: 'GET A STRUCTURED DIAGNOSIS', body: 'Evidence, root cause, confidence score, and a numbered action plan. Not a wall of text.' },
];

const FEATURES = [
  { label: 'AGENTIC MEMORY', body: 'Powered by Cognee. Stores past diagnoses in a knowledge graph to augment future analyses with historical context.' },
  { label: 'EVIDENCE EXTRACTION', body: 'Pulls concrete signals from your screenshot — error codes, ports, stack traces.' },
  { label: 'CONFIDENCE SCORING', body: 'The AI states its certainty. No fake precision. Unknown is stated as unknown.' },
  { label: 'ACTION PLAN', body: 'Numbered, ordered steps. Each one with an expected outcome so you know when it worked.' },
  { label: 'TECHNICAL / SIMPLE', body: 'Toggle between an engineering explanation and a plain-language summary.' },
  { label: 'SAFETY GUARDRAILS', body: 'Warns before suggesting any destructive action. Never deletes, never executes.' },
];

export default function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col">

      {/* ── TOP NAV ── */}
      <nav className="border-b border-primary px-6 sm:px-12 py-4 flex justify-between items-center">
        <div>
          <span className="text-2xl font-bold uppercase tracking-tight">FixFlow</span>
          <span className="font-mono text-xs text-secondary ml-4 hidden sm:inline">v1.0 · AI Day 2026</span>
        </div>
        <button
          onClick={onEnter}
          className="btn-primary text-sm py-2 px-5"
        >
          OPEN APP <ArrowRight className="w-4 h-4 ml-3" />
        </button>
      </nav>

      {/* ── HERO ── */}
      <section className="border-b border-primary px-6 sm:px-12 py-16 md:py-24 grid md:grid-cols-[1fr_auto] gap-12 items-end">
        <div>
          <div className="font-mono text-xs text-secondary tracking-widest uppercase mb-6">
            Visual Troubleshooting Intelligence
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold uppercase tracking-tight leading-none max-w-3xl">
            Turn any error screenshot into a diagnosis.
          </h1>
          <p className="mt-8 text-lg max-w-xl text-secondary leading-relaxed">
            Drop a screenshot. Describe what happened. Get structured evidence, 
            root cause analysis, and a numbered action plan — in under 10 seconds.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button onClick={onEnter} className="btn-primary text-base py-4 px-8">
              LET'S GET STARTED <ArrowRight className="w-5 h-5 ml-4" />
            </button>
          </div>
        </div>

        {/* Terminal-style sample output */}
        <div className="border border-primary bg-primary text-background font-mono text-xs p-6 w-full md:w-80 shrink-0 self-stretch flex flex-col justify-between">
          <div className="text-secondary tracking-widest uppercase mb-4 border-b border-background/10 pb-3">
            SAMPLE OUTPUT
          </div>
          <div className="space-y-3 leading-relaxed flex-1">
            <div><span className="text-secondary">PROBLEM  </span>Connection refused</div>
            <div><span className="text-secondary">TARGET   </span>localhost:8000</div>
            <div><span className="text-secondary">SEVERITY </span><span className="text-warning">MEDIUM</span></div>
            <div><span className="text-secondary">CONFID.  </span>87%</div>
            <div className="border-t border-background/10 pt-3 mt-3">
              <div className="text-secondary mb-1">CAUSE</div>
              <div>Backend service stopped.</div>
              <div className="text-secondary text-[10px] mt-1">HIGH</div>
            </div>
            <div className="border-t border-background/10 pt-3 mt-3">
              <div className="text-secondary mb-1">ACTION 01</div>
              <div>Check the backend process.</div>
            </div>
            <div>
              <div className="text-secondary mb-1">ACTION 02</div>
              <div>Verify port configuration.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM STATEMENT ── */}
      <section className="border-b border-primary px-6 sm:px-12 py-14 grid md:grid-cols-[1fr_1fr] gap-12">
        <div>
          <div className="font-mono text-xs text-secondary tracking-widest uppercase mb-4">The Problem</div>
          <h2 className="text-3xl font-bold uppercase tracking-tight mb-6">
            The gap between seeing an error and knowing what to do.
          </h2>
          <p className="text-base leading-relaxed text-secondary">
            A senior engineer reads <span className="font-mono text-primary">ECONNREFUSED</span> and knows exactly what to do. 
            Everyone else pastes it into Google and spends 30 minutes reading Stack Overflow threads from 2014.
          </p>
          <p className="text-base leading-relaxed text-secondary mt-4">
            FixFlow bridges that gap. It accepts exactly what you already have — a screenshot — 
            and returns exactly what you need — a structured, actionable diagnosis.
          </p>
        </div>
        <div className="flex flex-col gap-0">
          <div className="font-mono text-xs text-secondary tracking-widest uppercase mb-4 border-b border-primary pb-3">
            Target Users
          </div>
          {[
            ['Junior Developers', 'Understand errors without knowing what to search for'],
            ['Students', 'Get immediate feedback on what went wrong and why'],
            ['Support Teams', 'Rapid triage from screenshots without reproducing environments'],
            ['Non-Technical PMs', 'Self-diagnose basic issues without blocking an engineer'],
          ].map(([role, desc]) => (
            <div key={role} className="border-b border-primary/20 py-4 grid grid-cols-[140px_1fr] gap-4">
              <div className="font-bold text-sm uppercase tracking-wide">{role}</div>
              <div className="text-sm text-secondary">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="border-b border-primary px-6 sm:px-12 py-14">
        <div className="font-mono text-xs text-secondary tracking-widest uppercase mb-10">How It Works</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
          {HOW_IT_WORKS.map((item, idx) => (
            <div key={item.step} className={`p-6 border-primary/30 ${idx < 3 ? 'border-r' : ''} ${idx >= 2 ? 'border-t sm:border-t-0' : ''}`}>
              <div className="font-mono text-4xl font-bold text-primary/10 mb-4">{item.step}</div>
              <div className="font-bold text-sm uppercase tracking-wide mb-3">{item.title}</div>
              <div className="text-sm text-secondary leading-relaxed">{item.body}</div>
            </div>
          ))}
        </div>

        {/* Flow diagram */}
        <div className="mt-12 border border-primary/20 bg-surface p-6 font-mono text-xs overflow-x-auto">
          <div className="text-secondary tracking-widest uppercase mb-4">End-to-End Flow</div>
          <div className="flex items-center gap-2 flex-nowrap min-w-max">
            {['SCREENSHOT', 'UPLOAD', 'VISION AI READS IMAGE', 'JSON SCHEMA', 'VALIDATE', 'STRUCTURED DIAGNOSIS'].map((label, i, arr) => (
              <div key={label} className="flex items-center gap-2">
                <div className="border border-primary px-3 py-2 bg-background whitespace-nowrap">{label}</div>
                {i < arr.length - 1 && <span className="text-secondary">→</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="border-b border-primary px-6 sm:px-12 py-14">
        <div className="font-mono text-xs text-secondary tracking-widest uppercase mb-10">What You Get</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
          {FEATURES.map((f, idx) => (
            <div key={f.label} className={`p-6 border-primary/20 ${idx % 3 < 2 ? 'border-r' : ''} ${idx >= 3 ? 'border-t' : ''}`}>
              <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-3">{f.label}</div>
              <div className="text-sm text-secondary leading-relaxed">{f.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BUILT-IN DEMOS ── */}
      <section className="border-b border-primary px-6 sm:px-12 py-14 grid md:grid-cols-[1fr_2fr] gap-12">
        <div>
          <div className="font-mono text-xs text-secondary tracking-widest uppercase mb-4">No Setup Required</div>
          <h2 className="text-3xl font-bold uppercase tracking-tight mb-4">
            3 built-in demos. No API key needed.
          </h2>
          <p className="text-sm text-secondary leading-relaxed">
            Try FixFlow instantly with pre-built scenarios. 
            No image upload, no API key, no configuration. 
            See the full diagnosis flow in seconds.
          </p>
        </div>
        <div className="flex flex-col gap-0">
          {PROBLEMS.map((p) => (
            <div key={p.id} className="border border-primary border-t-0 first:border-t p-5 flex gap-5 items-start">
              <div className="font-mono text-xs text-secondary mt-0.5">{p.id}</div>
              <div>
                <div className="font-bold tracking-wide">{p.label}</div>
                <div className="font-mono text-xs text-secondary mt-1">{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI SECTION ── */}
      <section className="border-b border-primary px-6 sm:px-12 py-14 grid md:grid-cols-2 gap-12">
        <div>
          <div className="font-mono text-xs text-secondary tracking-widest uppercase mb-4">The AI</div>
          <h2 className="text-3xl font-bold uppercase tracking-tight mb-6">
            Multimodal vision + Agentic Memory.
          </h2>
          <p className="text-sm text-secondary leading-relaxed mb-4">
            FixFlow uses <span className="text-primary font-bold">qwen/qwen3.8-27b</span> via the Groq Cloud API — 
            a multimodal model that reads both your image and your description simultaneously.
          </p>
          <p className="text-sm text-secondary leading-relaxed mb-4">
            It is paired with <span className="text-primary font-bold">Cognee</span>, an agentic memory system. Every diagnosis is stored in a local knowledge graph. When you upload a new error, FixFlow recalls similar past cases and injects them into the AI's context so it learns over time.
          </p>
          <p className="text-sm text-secondary leading-relaxed mb-4">
            The output passes through three validation layers before reaching you: 
            JSON extraction, type coercion, and Pydantic schema enforcement. 
            If the model returns garbage, you see a clean error. Not garbage.
          </p>
        </div>
        <div className="border border-primary p-6 font-mono text-xs">
          <div className="text-secondary tracking-widest uppercase mb-4 border-b border-primary/20 pb-3">
            Output Schema (Always Enforced)
          </div>
          <div className="space-y-2 text-sm leading-relaxed">
            {[
              ['problem', 'string', 'One-line summary'],
              ['severity', 'CRITICAL|HIGH|MEDIUM|LOW', ''],
              ['confidence', 'integer 0–100', 'Model states uncertainty'],
              ['evidence', 'string[]', 'Facts from image only'],
              ['possible_causes', '{ cause, likelihood }[]', ''],
              ['diagnosis', 'string', 'Root cause explanation'],
              ['recommended_actions', '{ title, description, expected }[]', ''],
              ['warnings', 'string[]', 'Before destructive actions'],
              ['simple_explanation', 'string', 'Plain English'],
              ['technical_explanation', 'string', 'Precise technical detail'],
            ].map(([field, type, note]) => (
              <div key={field} className="grid grid-cols-[140px_1fr] gap-2 border-b border-primary/10 pb-2">
                <span className="text-accent">{field}</span>
                <span className="text-secondary">{type}{note ? ` — ${note}` : ''}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="px-6 sm:px-12 py-20 flex flex-col items-start">
        <div className="font-mono text-xs text-secondary tracking-widest uppercase mb-6">
          Ready to Diagnose
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold uppercase tracking-tight mb-6 max-w-2xl leading-none">
          Show us what's broken.
        </h2>
        <p className="text-base text-secondary mb-10 max-w-lg">
          Drop a screenshot. Get a diagnosis. No account. No installation. 
          Demo mode works with zero configuration.
        </p>
        <button onClick={onEnter} className="btn-primary text-base py-4 px-10">
          LET'S GET STARTED <ArrowRight className="w-5 h-5 ml-4" />
        </button>
        <div className="mt-8 font-mono text-xs text-secondary">
          Built for AI Day 2026 · Groq + Qwen Vision + FastAPI + React
        </div>
      </section>

    </div>
  );
}

