import React from 'react';
import {
  Info,
  ShieldCheck,
  HardDrive,
  Database,
  Cpu,
  Sparkles,
  CheckCircle2,
  Phone,
  Mail,
  Award,
  Keyboard,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-5.5rem)] select-none">
      {/* Hero Branding Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-cyan-950 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-5">
          <img
            src="/assets/aistudio/Gemini_Generated_Image_vrowi9vrowi9vrow_a94fa424.png"
            alt="Sahasra Pharmacy"
            className="w-24 h-24 rounded-2xl object-contain bg-white/95 p-1.5 border-2 border-cyan-500/40 shadow-xl shadow-cyan-950/50 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                SAHASRA PHARMACY BILLING SOFTWARE
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/80 font-mono font-semibold">
                v4.2.0 PRO
              </span>
            </div>
            <p className="text-xs text-cyan-400 font-semibold tracking-wide mt-1">
              Enterprise Pharmacy ERP · Standalone Windows Desktop Architecture
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              100% Offline Pharmacy Management Solution with Zero Cloud Dependency, Local SQLite Database Engine, FEFO Batch Control & GST Compliance.
            </p>
          </div>
        </div>

        {/* Developer Emblem */}
        <div className="flex items-center gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 shrink-0">
          <img
            src="/src/assets/images/aadhya_solutions_logo_1794220461139.jpg"
            alt="Aadhya Software Solutions"
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-lg object-contain bg-white p-1 shrink-0"
          />
          <div>
            <div className="text-[10px] text-slate-400 tracking-wider">DEVELOPED & DESIGNED BY</div>
            <div className="text-sm font-bold text-slate-100 tracking-tight">
              AADHYA SOFTWARE SOLUTIONS
            </div>
            <div className="text-[11px] text-cyan-400 font-mono">Enterprise Software Division</div>
          </div>
        </div>
      </div>

      {/* Specifications & System Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-slate-400 font-sans block text-[11px]">Application Category:</span>
          <strong className="text-slate-100 text-sm block">Pharmacy Management ERP</strong>
          <span className="text-cyan-400 text-[11px]">Retail & Wholesale Chemist</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-slate-400 font-sans block text-[11px]">Target OS Platform:</span>
          <strong className="text-slate-100 text-sm block">Windows 10 / Windows 11</strong>
          <span className="text-emerald-400 text-[11px]">Standalone Desktop EXE</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-slate-400 font-sans block text-[11px]">Database Engine:</span>
          <strong className="text-slate-100 text-sm block">SQLite 3 + SQLAlchemy</strong>
          <span className="text-cyan-400 text-[11px]">C:\SahasraPharmacy\Data</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-slate-400 font-sans block text-[11px]">Connectivity Mode:</span>
          <strong className="text-emerald-400 text-sm block">100% Offline (Local Only)</strong>
          <span className="text-slate-400 text-[11px]">Zero Cloud · No Subscriptions</span>
        </div>
      </div>

      {/* Core ERP Capabilities Checklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-800">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Certified Architectural Modules & Standard Compliance
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-slate-300">
          {[
            'Ultra-fast POS Medicine search with barcode laser scanner support',
            'First-Expired-First-Out (FEFO) batch tracking & automated alerts',
            'Complete Indian GST & HSN calculation (0%, 5%, 12%, 18%)',
            'Multi-format thermal printing (58mm, 80mm & full A4 GST invoices)',
            'Dynamic UPI QR generation for instant counter cashless payments',
            'Inward stock purchase orders & automated vendor ledger credits',
            'Patient credit ledger tracking & credit limit enforcement',
            'Sales return & purchase debit note return processing with restocking',
            'Daily cash book reconciliation & operating Profit & Loss reports',
            'Quarantine write-off & stock adjustment audit logs',
            'Automatic rolling 30 daily backups & pendrive export',
            'Role-based permissions (Administrator vs Cashier security locks)',
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-slate-950 p-2.5 rounded border border-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Fast Keyboard Shortcuts Legend */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-800">
          <Keyboard className="w-4 h-4 text-cyan-400" />
          Windows POS Hotkey Acceleration Keys
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">New Bill (POS Counter)</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono font-bold border border-slate-700">F1</kbd>
          </div>
          <div className="p-2.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Medicine Master</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono font-bold border border-slate-700">F2</kbd>
          </div>
          <div className="p-2.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Inventory Stock</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono font-bold border border-slate-700">F3</kbd>
          </div>
          <div className="p-2.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Purchase Inward Entry</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono font-bold border border-slate-700">F4</kbd>
          </div>
          <div className="p-2.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Executive Dashboard</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono font-bold border border-slate-700">F5</kbd>
          </div>
          <div className="p-2.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Save & Print Bill</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono font-bold border border-slate-700">F9</kbd>
          </div>
          <div className="p-2.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Clear Cart / Cancel</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-800 text-rose-300 font-mono font-bold border border-slate-700">Esc</kbd>
          </div>
          <div className="p-2.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Focus Barcode Scanner</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono font-bold border border-slate-700">Enter</kbd>
          </div>
        </div>
      </div>

      {/* Developer Information Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-100 text-sm">
              AADHYA SOFTWARE SOLUTIONS
            </span>
          </div>
          <p className="text-slate-400 mt-1 max-w-xl">
            Custom Enterprise ERP Systems, Offline Point-of-Sale Solutions & Desktop Software Development.
          </p>
        </div>

        <div className="flex items-center gap-4 text-slate-300 font-mono">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-cyan-400" />
            <span>+91 98490 12345</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            <span>support@aadhyasoftware.local</span>
          </div>
        </div>
      </div>
    </div>
  );
};
