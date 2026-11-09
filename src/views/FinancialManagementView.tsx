import React, { useState } from 'react';
import {
  LineChart,
  DollarSign,
  TrendingUp,
  CreditCard,
  Banknote,
  QrCode,
  BookOpen,
  Calendar,
  Wallet,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { storage } from '../services/storageService';
import { SaleInvoice, Expense, PurchaseInvoice } from '../types/pharmacy';

export const FinancialManagementView: React.FC = () => {
  const [openingDrawerCash, setOpeningDrawerCash] = useState<number>(5000); // Standard morning float
  const [invoices] = useState<SaleInvoice[]>(storage.getInvoices());
  const [expenses] = useState<Expense[]>(storage.getExpenses());
  const [purchases] = useState<PurchaseInvoice[]>(storage.getPurchases());
  const [batches] = useState(storage.getBatches());

  const todayStr = new Date().toISOString().split('T')[0];

  // Today's collections
  const todayInvoices = invoices.filter((i) => i.date === todayStr && i.status === 'completed');
  const todayCashSales = todayInvoices
    .filter((i) => i.paymentMethod === 'cash')
    .reduce((s, i) => s + i.grandTotal, 0);

  const todayUpiSales = todayInvoices
    .filter((i) => i.paymentMethod === 'upi')
    .reduce((s, i) => s + i.grandTotal, 0);

  const todayCardSales = todayInvoices
    .filter((i) => i.paymentMethod === 'card')
    .reduce((s, i) => s + i.grandTotal, 0);

  const todayCreditSales = todayInvoices
    .filter((i) => i.paymentMethod === 'credit')
    .reduce((s, i) => s + i.grandTotal, 0);

  const totalSalesToday = todayInvoices.reduce((s, i) => s + i.grandTotal, 0);

  // Today's cash expenses
  const todayCashExpenses = expenses
    .filter((e) => e.date === todayStr && e.paymentMode === 'cash')
    .reduce((s, e) => s + e.amount, 0);

  // Cash Drawer Closing Math
  const expectedClosingCash = +(openingDrawerCash + todayCashSales - todayCashExpenses).toFixed(2);

  // Profit and Loss Computations (All time or monthly)
  const totalRevenue = invoices.reduce((s, i) => s + i.grandTotal, 0);

  let totalCOGS = 0; // Cost of Goods Sold
  invoices.forEach((inv) => {
    inv.items.forEach((item) => {
      const b = batches.find((b) => b.batchNumber === item.batchNumber);
      const cost = b ? b.purchasePrice : item.unitPrice * 0.7;
      totalCOGS += cost * item.quantity;
    });
  });

  const grossProfit = Math.max(0, totalRevenue - totalCOGS);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = +(grossProfit - totalExpenses).toFixed(2);
  const profitMarginPct = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  const [drawerClosed, setDrawerClosed] = useState(false);

  return (
    <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-5.5rem)] select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-cyan-400" />
            Financial Management & Daily Cash Book
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cash drawer float reconciliation, digital collections and net pharmacy P&L accounts
          </p>
        </div>

        <button
          onClick={() => {
            setDrawerClosed(true);
            storage.addAuditLog('cashier', 'DAY_END_CLOSE', 'Cash Book', `Cash drawer balanced at ₹${expectedClosingCash}`);
          }}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{drawerClosed ? 'Day Closed ✓' : 'Close Day & Balance Cash Drawer'}</span>
        </button>
      </div>

      {/* Daily Cash Drawer Book Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <Banknote className="w-4 h-4 text-emerald-400" />
            Daily Cash Drawer (Counter Cash Balance)
          </h3>
          <span className="text-xs font-mono text-cyan-300">Date: {todayStr}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 font-sans block text-[11px] mb-1">Morning Opening Float:</span>
            <div className="flex items-center gap-1.5">
              <span>₹</span>
              <input
                type="number"
                value={openingDrawerCash}
                onChange={(e) => setOpeningDrawerCash(parseFloat(e.target.value) || 0)}
                className="w-24 h-7 px-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-bold"
              />
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 font-sans block text-[11px] mb-1">(+) Cash Sales Received:</span>
            <div className="text-base font-bold text-emerald-400">₹{todayCashSales.toFixed(2)}</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 font-sans block text-[11px] mb-1">(-) Counter Cash Expenses:</span>
            <div className="text-base font-bold text-rose-400">-₹{todayCashExpenses.toFixed(2)}</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-cyan-800/60 bg-gradient-to-br from-slate-950 to-cyan-950/30">
            <span className="text-cyan-300 font-sans block text-[11px] font-semibold mb-1">(=) Expected Counter Cash:</span>
            <div className="text-lg font-bold text-cyan-400">₹{expectedClosingCash.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Payment Modes Distribution Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Cash Tendered</span>
            <Banknote className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
            ₹{todayCashSales.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Physical currency</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>UPI Instant VPA</span>
            <QrCode className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold font-mono text-cyan-400 mt-1">
            ₹{todayUpiSales.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Google Pay / PhonePe / Paytm</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Card POS Terminal</span>
            <CreditCard className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-lg font-bold font-mono text-indigo-400 mt-1">
            ₹{todayCardSales.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Debit / Credit swipe</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Patient Credit Due</span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg font-bold font-mono text-purple-300 mt-1">
            ₹{todayCreditSales.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Booked to patient account</div>
        </div>
      </div>

      {/* Comprehensive Profit & Loss Statement */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Pharmacy Profit & Loss Statement (Operating Summary)
          </h3>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            Net Margin: {profitMarginPct}%
          </span>
        </div>

        <div className="space-y-2.5 font-mono text-xs">
          <div className="flex justify-between py-1 border-b border-slate-800">
            <span className="font-sans text-slate-300">1. Gross Pharmacy Sales Revenue (A):</span>
            <span className="font-bold text-slate-100">₹{totalRevenue.toFixed(2)}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
            <span className="font-sans">2. Cost of Goods Sold / COGS (B):</span>
            <span>-₹{totalCOGS.toFixed(2)}</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-800 text-cyan-300 font-bold bg-slate-950/40 px-2 rounded">
            <span className="font-sans">3. Gross Margin / Gross Profit (A - B):</span>
            <span>₹{grossProfit.toFixed(2)}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
            <span className="font-sans">4. Operating Expenses (Rent, Utilities, Staff, Materials):</span>
            <span>-₹{totalExpenses.toFixed(2)}</span>
          </div>

          <div className="flex justify-between py-2 text-sm font-bold text-emerald-400 bg-slate-950 px-3 rounded border border-emerald-800/40">
            <span className="font-sans">NET PHARMACY EARNINGS / PROFIT:</span>
            <span className="text-base">₹{netProfit.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
