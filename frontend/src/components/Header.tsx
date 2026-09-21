import { ChevronLeft } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  onBack?: () => void;
}

export default function Header({ onReset, onBack }: HeaderProps) {
  return (
    <header className="flex justify-between items-end border-b border-primary pb-4 mb-12">
      <div>
        {onBack && (
          <button
            onClick={onBack}
            className="font-mono text-[10px] text-secondary hover:text-accent flex items-center gap-1 uppercase tracking-widest mb-2 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-3 h-3" /> BACK TO OVERVIEW
          </button>
        )}
        <h1
          className="text-4xl font-bold tracking-tight uppercase cursor-pointer hover:text-accent transition-colors"
          onClick={onReset}
        >
          FixFlow
        </h1>
        <p className="font-mono text-xs text-secondary mt-1 tracking-widest uppercase">
          Visual Troubleshooting Intelligence
        </p>
      </div>
      <div className="font-mono text-xs text-secondary hidden sm:block">
        v1.0.0-PRODUCTION
      </div>
    </header>
  );
}
