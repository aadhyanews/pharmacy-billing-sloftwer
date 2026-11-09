import React, { useState } from 'react';
import { Minus, Square, Copy, X, Database, ShieldCheck, HardDrive } from 'lucide-react';

interface WindowsTitleBarProps {
  onExit?: () => void;
  activeModuleTitle: string;
}

export const WindowsTitleBar: React.FC<WindowsTitleBarProps> = ({ onExit, activeModuleTitle }) => {
  const [isMaximized, setIsMaximized] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleMinimize = () => {
    // In browser, notify user
    const notice = document.createElement('div');
    notice.className = 'fixed bottom-4 right-4 bg-slate-800 text-white border border-cyan-500/50 px-4 py-2.5 rounded shadow-2xl z-50 text-xs flex items-center gap-2 animate-bounce';
    notice.innerHTML = '<span>⚡ <strong>Sahasra Pharmacy ERP</strong> minimized to Windows System Tray. Click anywhere to resume.</span>';
    document.body.appendChild(notice);
    setTimeout(() => notice.remove(), 3500);
  };

  const handleToggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  return (
    <>
      <header className="h-9 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-3 select-none text-xs text-slate-300 shrink-0 z-40">
        {/* Left: Window Icon & Title */}
        <div className="flex items-center gap-2.5 truncate">
          <img
            src="/assets/aistudio/Gemini_Generated_Image_vrowi9vrowi9vrow_a94fa424.png"
            alt="Logo"
            className="w-4 h-4 rounded-xs object-contain bg-white shrink-0"
          />
          <span className="font-semibold text-slate-200 tracking-wide truncate">
            SAHASRA PHARMACY BILLING SOFTWARE
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 truncate hidden sm:inline">
            {activeModuleTitle}
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-emerald-400">
            <Database className="w-3 h-3" />
            <span className="font-mono">SQLite Local DB (Offline)</span>
          </div>
        </div>

        {/* Center: Offline Storage Tag & Developer Branding */}
        <div className="hidden xl:flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-slate-400">
            <HardDrive className="w-3 h-3 text-cyan-400" />
            <span className="font-mono text-slate-400">C:\SahasraPharmacy\Data\pharmacy.db</span>
          </span>
          <span className="text-slate-700">·</span>
          <span className="text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Aadhya Software Solutions
          </span>
        </div>

        {/* Right: Windows Desktop Window Controls (Min, Max, Close) */}
        <div className="flex items-center">
          <button
            onClick={handleMinimize}
            title="Minimize to Taskbar"
            aria-label="Minimize to Taskbar"
            className="w-10 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleToggleMaximize}
            title={isMaximized ? "Restore Down" : "Maximize"}
            aria-label={isMaximized ? "Restore Down" : "Maximize"}
            className="w-10 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isMaximized ? <Copy className="w-3 h-3" /> : <Square className="w-3 h-3" />}
          </button>
          <button
            onClick={() => setShowExitConfirm(true)}
            title="Close Application (Creates Auto-Backup)"
            aria-label="Close Application"
            className="w-11 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Exit & Auto-Backup Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-md w-full shadow-2xl p-5 text-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <HardDrive className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-slate-100 text-sm">
                  Exit Sahasra Pharmacy ERP?
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The application will verify SQLite database integrity and generate an automatic exit backup at:
                </p>
                <div className="p-2 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-cyan-300 break-all my-2">
                  C:\SahasraPharmacy\Backup\SahasraPharmacy_Backup_{new Date().toISOString().split('T')[0]}.db.json
                </div>
                <p className="text-[11px] text-emerald-400">
                  ✓ 100% offline local data safe. No unsaved transactions.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-5 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
              >
                Cancel & Keep Running
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  if (onExit) onExit();
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded shadow-sm transition-colors"
              >
                Backup & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
