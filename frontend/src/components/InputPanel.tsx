import { ImagePlus, Play } from 'lucide-react';
import type { ChangeEvent } from 'react';

interface InputPanelProps {
  onFileSelected: (file: File) => void;
  filePreview: string | null;
  description: string;
  onDescriptionChange: (value: string) => void;
  onAnalyze: () => void;
  canAnalyze: boolean;
}

export default function InputPanel({ onFileSelected, filePreview, description, onDescriptionChange, onAnalyze, canAnalyze }: InputPanelProps) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onFileSelected(file);
  };

  return (
    <section className="panel flex flex-col gap-7">
      <div>
        <div className="font-mono text-xs text-secondary tracking-widest uppercase mb-3">01 / Input evidence</div>
        <h2 className="text-2xl font-bold uppercase tracking-tight">Show us the problem.</h2>
        <p className="text-sm text-primary/70 mt-3 leading-relaxed">Upload a screenshot of the error, network panel, or configuration and add any context that may help.</p>
      </div>

      <label className="border border-dashed border-primary/40 min-h-48 flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:bg-surface transition-colors">
        {filePreview ? (
          <div className="w-full flex flex-col items-center gap-4">
            <img src={filePreview} alt="Selected evidence preview" className="max-h-40 max-w-full object-contain" />
            <span className="font-mono text-xs text-secondary uppercase tracking-wider">Replace evidence</span>
          </div>
        ) : (
          <>
            <ImagePlus className="w-8 h-8 mb-4 text-accent" />
            <span className="font-bold uppercase tracking-wide text-sm">Drop visual evidence here</span>
            <span className="font-mono text-[10px] text-secondary mt-2 uppercase">PNG, JPG, WEBP / max 10MB</span>
          </>
        )}
        <input className="hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} />
      </label>

      <div>
        <label htmlFor="issue-description" className="font-mono text-xs text-secondary tracking-widest uppercase block mb-3">Problem description</label>
        <textarea id="issue-description" value={description} onChange={(event) => onDescriptionChange(event.target.value)} placeholder="What were you trying to do when this happened?" className="w-full min-h-28 bg-transparent border border-primary/30 p-4 text-sm resize-y focus:outline-accent" />
      </div>

      <button className="btn-primary w-full" type="button" disabled={!canAnalyze} onClick={onAnalyze}>
        ANALYZE EVIDENCE <Play className="w-5 h-5 ml-4" />
      </button>
    </section>
  );
}
