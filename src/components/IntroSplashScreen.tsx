import React, { useEffect, useState } from 'react';
import { Database, ShieldCheck, Cpu, HardDrive, Sparkles, CheckCircle2 } from 'lucide-react';

interface IntroSplashScreenProps {
  onComplete: () => void;
}

const APP_LOGO_SRC = '/assets/aistudio/Gemini_Generated_Image_vrowi9vrowi9vrow_a94fa424.png';

export const IntroSplashScreen: React.FC<IntroSplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing application runtime...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const steps = [
      { pct: 15, text: 'Checking Windows 10/11 desktop environment & permissions...' },
      { pct: 35, text: 'Opening local SQLite database: C:\\SahasraPharmacy\\Data\\pharmacy.db...' },
      { pct: 58, text: 'Loading 14 medicine masters, FEFO batches & GST tax rates...' },
      { pct: 78, text: 'Verifying automated rolling 30-day backups (C:\\SahasraPharmacy\\Backup)...' },
      { pct: 92, text: 'Initializing POS hardware, 80mm thermal printer & barcode scanner audio...' },
      { pct: 100, text: 'Ready! Launching Sahasra Pharmacy ERP terminal...' },
    ];

    let currentStepIndex = 0;
    const interval = setInterval(() => {
      if (currentStepIndex < steps.length) {
        const step = steps[currentStepIndex];
        setProgress(step.pct);
        setStatusText(step.text);
        currentStepIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(onComplete, 500);
        }, 400);
      }
    }, 450);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        clearInterval(interval);
        setIsFadingOut(true);
        setTimeout(onComplete, 200);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950 transition-opacity duration-500 select-none overflow-hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Dynamic Background Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.18)_0%,rgba(15,23,42,0.95)_70%,rgba(2,6,23,1)_100%)] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Splash Modal Container */}
      <div className="relative z-10 max-w-2xl w-full mx-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in zoom-in-95 duration-500">
        {/* Windows Styled Top Mini Header */}
        <div className="h-8 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between px-3 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-300 font-semibold">SAHASRA PHARMACY ERP v4.2 PRO</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Standalone Windows Desktop EXE</span>
            <span className="text-slate-700">·</span>
            <span className="text-cyan-400">100% Offline SQLite</span>
          </div>
        </div>

        {/* Center Banner with Official App Logo */}
        <div className="p-8 text-center flex flex-col items-center">
          {/* Official App Logo Display with Subtle Breathing Halo */}
          <div className="relative group mb-5">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 opacity-30 blur-lg group-hover:opacity-50 transition duration-1000 animate-pulse" />
            <div className="relative rounded-xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950 p-2 max-w-md">
              <img
                src={APP_LOGO_SRC}
                alt="Sahasra Pharmacy Billing Software Official Logo"
                className="w-full max-h-56 object-contain rounded-lg shadow-inner"
              />
            </div>
          </div>

          {/* Software Title & Developer Subtitle */}
          <h1 className="text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 tracking-tight">
            SAHASRA PHARMACY BILLING SOFTWARE
          </h1>

          <div className="mt-1 flex items-center justify-center gap-2 text-xs text-slate-400">
            <span>POWERED BY</span>
            <strong className="text-cyan-400 font-bold tracking-wide">
              AADHYA SOFTWARE SOLUTIONS
            </strong>
          </div>

          {/* System Spec Badges */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
              <HardDrive className="w-3 h-3 text-cyan-400" />
              <span>C:\SahasraPharmacy\Data</span>
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
              <Database className="w-3 h-3 text-emerald-400" />
              <span>SQLite Local Engine</span>
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              <span>Zero Cloud Dependency</span>
            </span>
          </div>

          {/* Progress Bar & Status Text */}
          <div className="w-full max-w-md mt-6 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-300 truncate max-w-[320px]">{statusText}</span>
              <span className="text-cyan-400 font-bold">{progress}%</span>
            </div>

            {/* Glowing Multi-segment Progress Bar */}
            <div className="w-full h-2.5 bg-slate-950 border border-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                style={{ width: `${progress}%` }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 shadow-md shadow-cyan-500/50 transition-all duration-300 ease-out"
              />
            </div>
          </div>

          {/* Skip Button */}
          <div className="mt-6 flex items-center justify-between w-full max-w-md text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
            <span>Press Space or Esc to skip</span>
            <button
              onClick={() => {
                setIsFadingOut(true);
                setTimeout(onComplete, 200);
              }}
              className="text-cyan-400 hover:text-cyan-300 hover:underline font-mono"
            >
              Skip Intro →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
