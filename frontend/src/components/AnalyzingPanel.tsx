import { LoaderCircle } from 'lucide-react';

export default function AnalyzingPanel() {
  return (
    <div className="panel mt-8 min-h-[360px] flex flex-col items-center justify-center text-center">
      <LoaderCircle className="w-10 h-10 animate-spin text-accent mb-6" />
      <div className="font-mono text-xs text-secondary tracking-[0.2em] uppercase mb-3">Processing visual evidence</div>
      <h2 className="text-2xl font-bold uppercase tracking-tight">Building diagnosis</h2>
      <p className="max-w-md text-sm text-primary/70 mt-3">The AI is separating visible evidence from likely causes and preparing a safe action plan.</p>
    </div>
  );
}
