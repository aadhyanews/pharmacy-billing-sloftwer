import React, { useEffect, useState } from 'react';
import {
  Search,
  Clock,
  CircleDot,
  FileText,
  Boxes,
  Lock,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import { ModuleId } from './Sidebar';
import { storage } from '../services/storageService';

interface TopHeaderProps {
  activeModule: ModuleId;
  onSelectModule: (module: ModuleId) => void;
  onLockScreen: () => void;
  onGlobalSearch: (query: string) => void;
  onReplayIntro?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeModule,
  onSelectModule,
  onLockScreen,
  onGlobalSearch,
  onReplayIntro,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setDateStr(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSoundToggle = () => {
    const s = storage.getSettings();
    s.enableBarcodeBeep = !soundEnabled;
    storage.saveSettings(s);
    setSoundEnabled(!soundEnabled);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      onGlobalSearch(searchVal.trim());
      onSelectModule('pos');
    }
  };

  const moduleTitles: Record<ModuleId, { title: string; subtitle: string }> = {
    dashboard: { title: 'Executive ERP Dashboard', subtitle: 'Real-time sales, inventory KPIs and expiry analytics' },
    pos: { title: 'Pharmacy Billing Counter (POS)', subtitle: 'Fast barcode scan, batch selection & multi-format printing' },
    medicines: { title: 'Medicine Master ERP', subtitle: 'Formulations, generics, HSN codes & rack locator' },
    inventory: { title: 'Inventory & Batch Stock', subtitle: 'Live stock valuation, batch tracking & min-stock alerts' },
    purchases: { title: 'Purchase Entry (Inward)', subtitle: 'Stock inward invoices, GST inputs & supplier bills' },
    suppliers: { title: 'Supplier & Vendor Accounts', subtitle: 'Distributor directory, D.L. records & credit ledgers' },
    customers: { title: 'Customer & Patient Records', subtitle: 'Patient database, doctor references & credit books' },
    sales: { title: 'Sales Management & History', subtitle: 'Archived tax invoices, audit trails & bill reprint' },
    sales_return: { title: 'Sales Return & Patient Refund', subtitle: 'Restock medicines & issue cash/credit refund notes' },
    purchase_return: { title: 'Purchase Return (Outward)', subtitle: 'Return damaged or near-expiry batches to suppliers' },
    stock_adjustment: { title: 'Stock Adjustment & Audit', subtitle: 'Breakage, expiry quarantine & inventory reconciliation' },
    expenses: { title: 'Shop Expense Management', subtitle: 'Daily shop expenditures, petty cash & utility logs' },
    gst: { title: 'GST & HSN Tax Management', subtitle: 'GSTR-1, GSTR-3B tax summaries & HSN-wise sales analysis' },
    financials: { title: 'Financial Management & Cash Book', subtitle: 'Daily cash drawer closing, payment modes & P&L' },
    reports: { title: 'Reports & Business Analytics', subtitle: 'Exportable CSV/Excel registers & financial statements' },
    users: { title: 'User & Access Security', subtitle: 'Role-based access permissions & security audit trail' },
    backup: { title: 'Offline Backup & Disaster Recovery', subtitle: 'Local SQLite snapshot, pendrive export & restoration' },
    settings: { title: 'Software & Pharmacy Settings', subtitle: 'Pharmacy profile, drug licenses, tax & printer setup' },
    about: { title: 'About Sahasra Pharmacy ERP', subtitle: 'Developed & Designed by AADHYA SOFTWARE SOLUTIONS' },
  };

  const activeInfo = moduleTitles[activeModule] || { title: 'Sahasra Pharmacy ERP', subtitle: 'Pharmacy Management' };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between gap-4 select-none shrink-0 z-30">
      {/* Module Title & Subtitle */}
      <div className="flex items-center gap-3 min-w-0">
        <div>
          <h2 className="text-sm font-bold text-slate-100 leading-tight truncate">
            {activeInfo.title}
          </h2>
          <p className="text-[11px] text-slate-400 truncate hidden md:block">
            {activeInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Global Quick Search / Barcode Trigger */}
      <div className="flex-1 max-w-md hidden md:block">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Scan barcode or search medicine / brand (Press Enter to bill)..."
            className="w-full h-8 pl-8 pr-3 text-xs bg-slate-950 border border-slate-700/80 rounded-md text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
        </form>
      </div>

      {/* Actions & Live Clock */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Fast Action Buttons */}
        <div className="hidden lg:flex items-center gap-1.5">
          <button
            onClick={() => onSelectModule('pos')}
            className={`px-2.5 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors ${
              activeModule === 'pos'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>F1 New Bill</span>
          </button>

          <button
            onClick={() => onSelectModule('inventory')}
            className="px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Boxes className="w-3.5 h-3.5 text-amber-400" />
            <span>F3 Stock</span>
          </button>
        </div>

        {/* Barcode Audio Beeper Toggle */}
        <button
          onClick={handleSoundToggle}
          title={soundEnabled ? 'Barcode Audio Beep: ON' : 'Barcode Audio Beep: OFF'}
          className={`p-1.5 rounded transition-colors ${
            soundEnabled
              ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/50'
              : 'text-slate-500 bg-slate-800'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Real-time Clock */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-slate-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{timeStr}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 text-[11px]">{dateStr}</span>
        </div>

        {/* Standalone Offline Status */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-950/40 border border-emerald-800/50 rounded text-[11px] text-emerald-400 font-medium">
          <CircleDot className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">100% Offline</span>
        </div>

        {/* Replay Opening Intro Animation */}
        {onReplayIntro && (
          <button
            onClick={onReplayIntro}
            title="Replay Opening Intro Animation"
            className="px-2 py-1 rounded text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 border border-slate-800 flex items-center gap-1.5 text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px]">Intro</span>
          </button>
        )}

        {/* Lock Screen */}
        <button
          onClick={onLockScreen}
          title="Lock POS Terminal"
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
