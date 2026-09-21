import { useState } from 'react';
import { ArrowLeft, AlertTriangle, Download } from 'lucide-react';
import type { DiagnosisResponse } from '../types';

interface DiagnosisPanelProps {
  result: DiagnosisResponse;
  imagePreview: string | null;
  onReset: () => void;
}

export default function DiagnosisPanel({ result, imagePreview, onReset }: DiagnosisPanelProps) {
  const [viewMode, setViewMode] = useState<'TECHNICAL' | 'SIMPLE'>('TECHNICAL');

  const handleExportSkill = () => {
    // Generate an agent-executable SKILL.md file
    const safeTitle = result.problem.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const content = `---
name: fixflow-auto-remediation
description: Auto-generated remediation instructions for ${result.problem}
---

# FixFlow Diagnostic Context
An error was captured with the following details:
- **Category**: ${result.category}
- **Severity**: ${result.severity}

## Extracted Evidence
${result.evidence.map(e => `- ${e}`).join('\n')}

## Root Cause Diagnosis
${result.diagnosis}

# Agent Directives
You are an autonomous AI coding agent. The user has provided this SKILL.md file to instruct you on how to resolve the issue above.

Execute the following instructions precisely:
${result.ide_agent_instructions}

# Verification
Once you have applied the changes, ensure the code builds successfully and the error is no longer reproducible.
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeTitle}-SKILL.md`;
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-12 pb-24">
      {/* Header Controls */}
      <div className="flex justify-between items-center border-b border-primary pb-4">
        <button 
          onClick={onReset}
          className="font-mono text-xs hover:text-accent flex items-center gap-2 uppercase tracking-widest cursor-pointer"
        >
          <ArrowLeft className="w-3 h-3" /> NEW ANALYSIS
        </button>
        
        <div className="flex gap-4">
          <button 
            onClick={handleExportSkill}
            className="font-mono text-xs hover:text-accent flex items-center gap-2 uppercase tracking-widest cursor-pointer"
          >
            <Download className="w-3 h-3" /> EXPORT SKILL.MD
          </button>

          <div className="flex font-mono text-xs uppercase tracking-widest cursor-pointer">
            <div 
              className={`px-4 py-1 border border-primary border-r-0 ${viewMode === 'TECHNICAL' ? 'bg-primary text-background' : 'hover:bg-surface'}`}
              onClick={() => setViewMode('TECHNICAL')}
            >
              TECHNICAL
            </div>
            <div 
              className={`px-4 py-1 border border-primary ${viewMode === 'SIMPLE' ? 'bg-primary text-background' : 'hover:bg-surface'}`}
              onClick={() => setViewMode('SIMPLE')}
            >
              SIMPLE
            </div>
          </div>
        </div>
      </div>

      {/* Main Diagnosis Block */}
      <div className="flex flex-col gap-4">
        <div className="font-mono text-xs text-secondary tracking-widest uppercase">
          01 / DIAGNOSIS
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold uppercase tracking-tight max-w-3xl leading-none">
          {result.problem}
        </h2>
        <div className="text-lg mt-4 max-w-2xl text-primary/80">
          {viewMode === 'TECHNICAL' ? result.technical_explanation : result.simple_explanation}
        </div>
      </div>

      <hr className="border-primary" />

      {/* Assessment Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="font-mono text-xs text-secondary tracking-widest uppercase mb-4">
            EVIDENCE
          </div>
          <div className="font-mono text-sm flex flex-col gap-1">
            {result.evidence.map((ev, i) => (
              <div key={i}>{ev}</div>
            ))}
          </div>
          {imagePreview && (
            <div className="mt-4 border border-primary/20 bg-black/5 p-1 inline-block">
              <img src={imagePreview} className="max-h-32 object-contain" alt="Evidence" />
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="font-mono text-xs text-secondary tracking-widest uppercase mb-4">
              SEVERITY
            </div>
            <div className={`font-mono text-lg ${
              result.severity === 'CRITICAL' ? 'text-critical' : 
              result.severity === 'HIGH' ? 'text-warning' : ''
            }`}>
              {result.severity}
            </div>
          </div>
          <div>
            <div className="font-mono text-xs text-secondary tracking-widest uppercase mb-4">
              CONFIDENCE
            </div>
            <div className="font-mono text-lg">
              {result.confidence}%
            </div>
          </div>
          <div className="col-span-2 mt-4">
             <div className="font-mono text-xs text-secondary tracking-widest uppercase mb-4">
              CATEGORY
            </div>
            <div className="font-mono text-sm">
              {result.category}
            </div>
          </div>
        </div>
      </div>

      <hr className="border-primary" />

      {/* Why / Causes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <div className="font-mono text-xs text-secondary tracking-widest uppercase mb-4">
            WHY THIS DIAGNOSIS?
          </div>
          <div className="text-base leading-relaxed">
            {result.diagnosis}
          </div>
        </div>
        
        <div>
          <div className="font-mono text-xs text-secondary tracking-widest uppercase mb-4">
            POSSIBLE CAUSES
          </div>
          <div className="flex flex-col gap-4">
            {result.possible_causes.map((cause, i) => (
              <div key={i} className="flex gap-4 items-baseline">
                <span className="font-mono text-xs text-secondary">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <div className="text-sm">{cause.cause}</div>
                  <div className="font-mono text-[10px] text-secondary mt-1">{cause.likelihood}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="border border-warning bg-warning/5 p-6 mt-4">
          <div className="font-mono text-xs text-warning tracking-widest uppercase mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> CAUTION
          </div>
          <div className="flex flex-col gap-2 text-sm">
            {result.warnings.map((w, i) => (
              <div key={i}>{w}</div>
            ))}
          </div>
        </div>
      )}

      {/* Action Plan */}
      <div className="mt-8">
        <div className="font-mono text-xs text-secondary tracking-widest uppercase mb-8">
          ACTION PLAN
        </div>
        <div className="flex flex-col gap-8">
          {result.recommended_actions.map((action, i) => (
            <div key={i} className="pl-0 md:pl-8 border-l border-primary/20 relative">
              <div className="absolute -left-3 top-0 bg-background text-xs font-mono px-1 hidden md:block">
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 className="text-xl font-bold uppercase tracking-wide mb-2 flex gap-4 md:block">
                <span className="md:hidden text-secondary">{String(i + 1).padStart(2, '0')}</span>
                {action.title}
              </h3>
              <p className="mb-4 text-primary/90">
                {action.description}
              </p>
              <div className="bg-surface p-4 border border-primary/10">
                <div className="font-mono text-[10px] text-secondary tracking-widest uppercase mb-1">
                  EXPECTED
                </div>
                <div className="text-sm">
                  {action.expected_result}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Directives */}
      <div className="mt-8 border border-primary bg-primary text-background p-6">
        <div className="font-mono text-xs text-background/70 tracking-widest uppercase mb-4">
          IDE AGENT DIRECTIVES (SKILL)
        </div>
        <p className="text-sm mb-4 text-background/90">
          These instructions are optimized for autonomous execution by AI coding assistants (like Cursor, Copilot, or Antigravity). Export the SKILL.md file and feed it to your IDE agent to auto-apply the fix.
        </p>
        <div className="font-mono text-sm whitespace-pre-wrap leading-relaxed">
          {result.ide_agent_instructions}
        </div>
        <button 
          onClick={handleExportSkill}
          className="mt-6 bg-background text-primary px-6 py-2 text-sm font-bold uppercase tracking-widest hover:bg-accent hover:text-background transition-colors"
        >
          DOWNLOAD SKILL.MD
        </button>
      </div>

    </div>
  );
}

