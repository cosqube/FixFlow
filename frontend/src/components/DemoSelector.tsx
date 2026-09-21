import { ArrowRight, FlaskConical } from 'lucide-react';

interface DemoSelectorProps {
  onSelectDemo: (demoId: string) => void;
}

const demos = [
  { id: 'local_application', title: 'LOCAL APPLICATION', detail: 'Connection refused' },
  { id: 'network', title: 'NETWORK', detail: 'Connected without internet' },
  { id: 'configuration', title: 'CONFIGURATION', detail: 'Missing environment variable' },
];

export default function DemoSelector({ onSelectDemo }: DemoSelectorProps) {
  return (
    <aside className="panel h-fit">
      <div className="flex items-center gap-3 mb-3"><FlaskConical className="w-5 h-5 text-accent" /><div className="font-mono text-xs text-secondary tracking-widest uppercase">Demo mode</div></div>
      <p className="text-sm text-primary/70 leading-relaxed mb-6">Explore deterministic scenarios without an API key. Useful for a fast offline walkthrough.</p>
      <div className="flex flex-col gap-3">
        {demos.map((demo) => (
          <button key={demo.id} type="button" onClick={() => onSelectDemo(demo.id)} className="btn-secondary w-full text-left">
            <span><span className="block text-xs">{demo.title}</span><span className="block text-[10px] text-secondary normal-case tracking-normal mt-1">{demo.detail}</span></span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ))}
      </div>
    </aside>
  );
}
