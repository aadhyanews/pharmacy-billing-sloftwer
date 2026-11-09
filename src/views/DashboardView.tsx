import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  AlertTriangle,
  Clock,
  Skull,
  Users,
  Building2,
  Calendar,
  Printer,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { storage } from '../services/storageService';
import { ModuleId } from '../components/Sidebar';
import { SaleInvoice } from '../types/pharmacy';

interface DashboardViewProps {
  onNavigate: (module: ModuleId) => void;
  onReprintInvoice: (invoice: SaleInvoice) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onReprintInvoice,
}) => {
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const kpis = storage.getDashboardKPIs();
  const medicines = storage.getMedicines();
  const batches = storage.getBatches();
  const invoices = storage.getInvoices();

  // Find low stock items
  const lowStockItems = medicines
    .map((m) => {
      const totalStock = batches
        .filter((b) => b.medicineId === m.id)
        .reduce((sum, b) => sum + b.currentStock, 0);
      return { ...m, totalStock };
    })
    .filter((m) => m.totalStock <= m.minStockAlert)
    .slice(0, 5);

  // Find near-expiry or expired batches
  const currentYM = '2026-11';
  const alertBatches = batches
    .filter((b) => b.expiryDate <= '2027-01')
    .map((b) => {
      const med = medicines.find((m) => m.id === b.medicineId);
      const isExpired = b.expiryDate < currentYM;
      return { ...b, medicineName: med?.brandName || 'Medicine', isExpired };
    })
    .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate))
    .slice(0, 5);

  // Daily Hourly Chart Data
  const hourlyData = [
    { label: '08 AM', sales: 420, profit: 95 },
    { label: '10 AM', sales: 1250, profit: 340 },
    { label: '12 PM', sales: 2480, profit: 620 },
    { label: '02 PM', sales: 1100, profit: 280 },
    { label: '04 PM', sales: 3150, profit: 890 },
    { label: '06 PM', sales: 4800, profit: 1350 },
    { label: '08 PM', sales: 3900, profit: 1100 },
    { label: '10 PM', sales: 850, profit: 230 },
  ];

  // Weekly Revenue Data
  const weeklyData = [
    { label: 'Mon', sales: 14200, profit: 3950 },
    { label: 'Tue', sales: 18500, profit: 5120 },
    { label: 'Wed', sales: 16800, profit: 4620 },
    { label: 'Thu', sales: 21300, profit: 5900 },
    { label: 'Fri', sales: 19400, profit: 5350 },
    { label: 'Sat', sales: 27800, profit: 7800 },
    { label: 'Sun (Today)', sales: 17950, profit: 4900 },
  ];

  // Monthly Revenue Data
  const monthlyData = [
    { label: 'Jun', sales: 480000, profit: 135000 },
    { label: 'Jul', sales: 520000, profit: 146000 },
    { label: 'Aug', sales: 510000, profit: 142000 },
    { label: 'Sep', sales: 560000, profit: 158000 },
    { label: 'Oct', sales: 610000, profit: 172000 },
    { label: 'Nov (Est)', sales: 595000, profit: 168000 },
  ];

  const currentChartData =
    chartPeriod === 'daily' ? hourlyData : chartPeriod === 'weekly' ? weeklyData : monthlyData;

  const maxSales = Math.max(...currentChartData.map((d) => d.sales));

  return (
    <div className="p-5 space-y-6 overflow-y-auto max-h-[calc(100vh-5.5rem)] select-none">
      {/* Top Banner with Developer Stamp */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-cyan-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <img
            src="/assets/aistudio/Gemini_Generated_Image_vrowi9vrowi9vrow_a94fa424.png"
            alt="Sahasra Pharmacy"
            className="w-14 h-14 rounded-xl object-contain bg-white/95 p-1 border border-cyan-500/40 shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100 tracking-tight">
                Sahasra Pharmacy & Surgicals Management Console
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 font-mono">
                Live Store
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              100% Offline Windows Desktop ERP · Developed & Designed by{' '}
              <strong className="text-cyan-400 font-semibold">AADHYA SOFTWARE SOLUTIONS</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <button
            onClick={() => onNavigate('pos')}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-md shadow-cyan-950/40 flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open POS Counter (F1)</span>
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <span>Reports Register</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* 10 ERP Dashboard KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* 1. Total Sales Today */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Today's Total Sales</span>
            <div className="w-7 h-7 rounded bg-cyan-950/60 text-cyan-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-slate-100 font-mono tabular-nums">
              ₹{kpis.totalSalesToday.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <span>↑ Active Billing Day</span>
            </div>
          </div>
        </div>

        {/* 2. Total Purchase Today */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Today's Purchases</span>
            <div className="w-7 h-7 rounded bg-indigo-950/60 text-indigo-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-slate-100 font-mono tabular-nums">
              ₹{kpis.totalPurchaseToday.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <div className="text-[11px] text-slate-400 mt-1">
              <span>Inward stock receipts</span>
            </div>
          </div>
        </div>

        {/* 3. Today's Profit */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Today's Gross Profit</span>
            <div className="w-7 h-7 rounded bg-emerald-950/60 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-emerald-400 font-mono tabular-nums">
              ₹{kpis.todaysProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <div className="text-[11px] text-slate-400 mt-1">
              <span>Margin ~28.5% avg</span>
            </div>
          </div>
        </div>

        {/* 4. Total Stock Value */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Stock Valuation</span>
            <div className="w-7 h-7 rounded bg-blue-950/60 text-blue-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-slate-100 font-mono tabular-nums">
              ₹{kpis.totalStockValue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
            </span>
            <div className="text-[11px] text-slate-400 mt-1">
              <span>MRP: ₹{kpis.totalStockMrpValue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>

        {/* 5. Total Medicines */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Medicines</span>
            <div className="w-7 h-7 rounded bg-teal-950/60 text-teal-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-slate-100 font-mono tabular-nums">
              {kpis.totalMedicines}
            </span>
            <div className="text-[11px] text-slate-400 mt-1">
              <span>{kpis.totalBatches} inventory batches</span>
            </div>
          </div>
        </div>

        {/* 6. Low Stock Alerts */}
        <div
          onClick={() => onNavigate('inventory')}
          className="bg-slate-900 border border-amber-800/40 rounded-lg p-3.5 flex flex-col justify-between hover:border-amber-600 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-amber-400">
            <span>Low Stock Alerts</span>
            <div className="w-7 h-7 rounded bg-amber-950/60 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-amber-400 font-mono tabular-nums">
              {kpis.lowStockAlerts} Items
            </span>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>Needs reordering →</span>
            </div>
          </div>
        </div>

        {/* 7. Near Expiry Medicines */}
        <div
          onClick={() => onNavigate('inventory')}
          className="bg-slate-900 border border-orange-800/40 rounded-lg p-3.5 flex flex-col justify-between hover:border-orange-600 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-orange-400">
            <span>Near Expiry (&lt; 90d)</span>
            <div className="w-7 h-7 rounded bg-orange-950/60 text-orange-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-orange-400 font-mono tabular-nums">
              {kpis.nearExpiryMedicines} Batches
            </span>
            <div className="text-[11px] text-slate-400 mt-1">
              <span>Expiring in 30–90 days</span>
            </div>
          </div>
        </div>

        {/* 8. Expired Medicines */}
        <div
          onClick={() => onNavigate('inventory')}
          className="bg-slate-900 border border-rose-800/50 rounded-lg p-3.5 flex flex-col justify-between hover:border-rose-600 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-rose-400">
            <span>Expired Medicines</span>
            <div className="w-7 h-7 rounded bg-rose-950/60 text-rose-400 flex items-center justify-center">
              <Skull className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-rose-400 font-mono tabular-nums">
              {kpis.expiredMedicines} Batches
            </span>
            <div className="text-[11px] text-rose-300 mt-1">
              <span>Quarantine & return</span>
            </div>
          </div>
        </div>

        {/* 9. Customer Outstanding */}
        <div
          onClick={() => onNavigate('customers')}
          className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between hover:border-slate-700 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Customer Credit Due</span>
            <div className="w-7 h-7 rounded bg-purple-950/60 text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-purple-300 font-mono tabular-nums">
              ₹{kpis.customerOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <div className="text-[11px] text-slate-400 mt-1">
              <span>Receivables book</span>
            </div>
          </div>
        </div>

        {/* 10. Supplier Outstanding */}
        <div
          onClick={() => onNavigate('suppliers')}
          className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between hover:border-slate-700 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Supplier Payables</span>
            <div className="w-7 h-7 rounded bg-amber-950/60 text-amber-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-amber-300 font-mono tabular-nums">
              ₹{kpis.supplierOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <div className="text-[11px] text-slate-400 mt-1">
              <span>Trade payables</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Sales Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Chart: Sales & Profit Bar Graph */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Revenue & Profit Performance Analytics
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time sales revenue vs estimated gross earnings
              </p>
            </div>

            {/* Timeframe Selector */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setChartPeriod('daily')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  chartPeriod === 'daily'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Today Hourly
              </button>
              <button
                onClick={() => setChartPeriod('weekly')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  chartPeriod === 'weekly'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Weekly Trend
              </button>
              <button
                onClick={() => setChartPeriod('monthly')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  chartPeriod === 'monthly'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Register
              </button>
            </div>
          </div>

          {/* Chart Graphic (Interactive SVG representation) */}
          <div className="pt-6">
            <div className="h-60 flex items-end justify-between gap-3 px-2">
              {currentChartData.map((d) => {
                const heightPct = Math.max(12, (d.sales / maxSales) * 100);
                const profitHeightPct = Math.max(6, (d.profit / maxSales) * 100);

                return (
                  <div key={d.label} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="text-[10px] font-mono text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity mb-1 whitespace-nowrap">
                      ₹{d.sales.toLocaleString('en-IN')}
                    </div>
                    <div className="w-full max-w-[38px] flex items-end justify-center gap-1 h-full">
                      {/* Sales Bar */}
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-sm shadow-sm transition-all group-hover:brightness-125"
                      />
                      {/* Profit Bar */}
                      <div
                        style={{ height: `${profitHeightPct}%` }}
                        className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm shadow-sm transition-all group-hover:brightness-125"
                      />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 mt-2 truncate w-full text-center">
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-cyan-500 inline-block" />
                <span className="text-slate-300">Gross Sales Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
                <span className="text-slate-300">Gross Operating Profit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel: Pharmacy Categories & Quick Action Cards */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 pb-3 border-b border-slate-800">
              Department Inventory Breakdown
            </h3>
            <div className="mt-3.5 space-y-3">
              {[
                { name: 'Tablets & Capsules', count: 9, pct: '64%', color: 'bg-cyan-500' },
                { name: 'Syrups & Suspensions', count: 1, pct: '7%', color: 'bg-indigo-500' },
                { name: 'Ointments & Creams', count: 1, pct: '7%', color: 'bg-amber-500' },
                { name: 'Medical Equipment / Inhalers', count: 1, pct: '7%', color: 'bg-emerald-500' },
                { name: 'Vitamins & OTC Supplements', count: 2, pct: '15%', color: 'bg-rose-500' },
              ].map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{cat.name}</span>
                    <span className="font-mono text-slate-400">
                      {cat.count} meds ({cat.pct})
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div className={`h-full ${cat.color}`} style={{ width: cat.pct }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick ERP Shortcuts */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Frequent Actions
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onNavigate('pos')}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-left transition-colors"
              >
                <span className="font-bold text-cyan-400 block font-mono">F1 · POS</span>
                <span className="text-slate-400 text-[11px]">Generate Bill</span>
              </button>
              <button
                onClick={() => onNavigate('purchases')}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-left transition-colors"
              >
                <span className="font-bold text-emerald-400 block font-mono">F4 · Purchase</span>
                <span className="text-slate-400 text-[11px]">Inward Stock</span>
              </button>
              <button
                onClick={() => onNavigate('medicines')}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-left transition-colors"
              >
                <span className="font-bold text-indigo-400 block font-mono">F2 · Master</span>
                <span className="text-slate-400 text-[11px]">Add Medicine</span>
              </button>
              <button
                onClick={() => onNavigate('backup')}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-left transition-colors"
              >
                <span className="font-bold text-amber-400 block font-mono">F9 · Backup</span>
                <span className="text-slate-400 text-[11px]">Snapshot DB</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts & Recent Invoices Dual Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Table 1: Low Stock & Expiry Critical Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Inventory Attention Alerts (Low Stock & Expiry)
            </h3>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs text-cyan-400 hover:underline font-medium"
            >
              View Full Stock →
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-800/80">
            {lowStockItems.length === 0 && alertBatches.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                All inventory levels are within normal safety thresholds.
              </p>
            ) : (
              <>
                {lowStockItems.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-semibold text-slate-200">{item.brandName}</span>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{item.rackLocation}</span>
                        <span>·</span>
                        <span className="text-amber-400 font-mono font-medium">
                          Current Stock: {item.totalStock} {item.unit}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/80 text-[10px] font-semibold whitespace-nowrap">
                      Min: {item.minStockAlert} (Reorder)
                    </span>
                  </div>
                ))}

                {alertBatches.map((b) => (
                  <div key={b.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-semibold text-slate-200">{b.medicineName}</span>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                        <span>Batch: {b.batchNumber}</span>
                        <span>·</span>
                        <span>Stock: {b.currentStock}</span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap font-mono ${
                        b.isExpired
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
                          : 'bg-orange-950/80 text-orange-300 border border-orange-800/80'
                      }`}
                    >
                      {b.isExpired ? `EXPIRED (${b.expiryDate})` : `Exp: ${b.expiryDate}`}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Table 2: Recent Today's Invoices */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Recent Pharmacy Billing Invoices
            </h3>
            <button
              onClick={() => onNavigate('sales')}
              className="text-xs text-cyan-400 hover:underline font-medium"
            >
              All Invoices →
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-800/80">
            {invoices.slice(0, 5).map((inv) => (
              <div key={inv.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-300">{inv.invoiceNumber}</span>
                    <span className="text-[10px] text-slate-400">{inv.time}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{inv.customerName || 'Walk-in Patient'}</span>
                    <span>·</span>
                    <span className="capitalize font-medium text-slate-300">
                      {inv.paymentMethod.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-100 text-sm tabular-nums">
                    ₹{inv.grandTotal.toFixed(2)}
                  </span>
                  <button
                    onClick={() => onReprintInvoice(inv)}
                    title="Reprint Bill (Thermal / A4)"
                    className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
