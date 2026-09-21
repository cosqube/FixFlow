import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { DiagnosisResponse } from './types';

// Components
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import AnalyzingPanel from './components/AnalyzingPanel';
import DiagnosisPanel from './components/DiagnosisPanel';
import DemoSelector from './components/DemoSelector';
import LandingPage from './components/LandingPage';

type AppState = 'INPUT' | 'ANALYSIS' | 'RESULTS' | 'ERROR';

function App() {
  const [showApp, setShowApp] = useState(false);
  const [appState, setAppState] = useState<AppState>('INPUT');
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<DiagnosisResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handlers
  const handleFileDrop = (droppedFile: File) => {
    setFile(droppedFile);
    setImagePreview(URL.createObjectURL(droppedFile));
  };

  const handleAnalyze = async (demoId?: string) => {
    if (!demoId && !file) return;

    setAppState('ANALYSIS');
    setErrorMsg(null);

    try {
      const formData = new FormData();
      if (demoId) {
        formData.append('demo_id', demoId);
        formData.append('description', 'Demo run');
      } else {
        formData.append('file', file as Blob);
        formData.append('description', description || 'No description provided.');
      }

      const res = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const raw = await res.text();
        let detail = raw;
        try {
          const parsed = JSON.parse(raw);
          detail = parsed?.detail ?? raw;
        } catch { /* raw is not JSON */ }
        throw new Error(detail);
      }

      const data: DiagnosisResponse = await res.json();
      setResult(data);
      setAppState('RESULTS');
    } catch (err: any) {
      const msg: string = err.message || 'Analysis failed.';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setErrorMsg('Cannot reach the backend at localhost:8000. Make sure the backend is running:\n\ncd fixflow/backend && source venv/bin/activate && uvicorn main:app --port 8000');
      } else {
        setErrorMsg(msg);
      }
      setAppState('ERROR');
    }
  };

  const resetApp = () => {
    setAppState('INPUT');
    setFile(null);
    setImagePreview(null);
    setDescription('');
    setResult(null);
    setErrorMsg(null);
  };

  // ── LANDING PAGE ──
  if (!showApp) {
    return <LandingPage onEnter={() => setShowApp(true)} />;
  }

  // ── MAIN APP ──
  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 sm:px-8">
      <div className="w-full max-w-5xl">
        <Header onReset={resetApp} onBack={() => setShowApp(false)} />

        {appState === 'INPUT' && (
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
            <InputPanel
              onFileSelected={handleFileDrop}
              filePreview={imagePreview}
              description={description}
              onDescriptionChange={setDescription}
              onAnalyze={() => handleAnalyze()}
              canAnalyze={!!file}
            />
            <DemoSelector onSelectDemo={handleAnalyze} />
          </div>
        )}

        {appState === 'ANALYSIS' && (
          <AnalyzingPanel />
        )}

        {appState === 'RESULTS' && result && (
          <DiagnosisPanel result={result} imagePreview={imagePreview} onReset={resetApp} />
        )}

        {appState === 'ERROR' && (
          <div className="panel mt-8">
            <div className="text-xl font-bold uppercase tracking-widest text-critical mb-4">ANALYSIS FAILED</div>
            <p className="font-mono text-sm mb-8 whitespace-pre-wrap leading-relaxed">{errorMsg}</p>
            <div className="flex gap-4">
              <button className="btn-primary" onClick={() => setAppState('INPUT')}>
                TRY AGAIN <ArrowRight className="w-5 h-5 ml-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
