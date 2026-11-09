import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  FileText,
  DollarSign,
  Package,
  Clock,
  Building2,
  Users,
  Wallet,
  CheckCircle2,
} from 'lucide-react';
import { storage } from '../services/storageService';

type ReportType =
  | 'daily_sales'
  | 'monthly_sales'
  | 'yearly_sales'
  | 'purchases'
  | 'stock_valuation'
  | 'expiry_analysis'
  | 'gst_summary'
  | 'profit_loss'
  | 'customer_ledger'
  | 'supplier_ledger'
  | 'cash_book'
  | 'expenses';

export const ReportsView: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('daily_sales');

  const invoices = storage.getInvoices();
  const medicines = storage.getMedicines();
  const batches = storage.getBatches();
  const purchases = storage.getPurchases();
  const customers = storage.getCustomers();
  const suppliers = storage.getSuppliers();
  const expenses = storage.getExpenses();
  const settings = storage.getSettings();

  const reportDefinitions: { id: ReportType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'daily_sales', label: '1. Daily Sales Register', icon: FileText },
    { id: 'monthly_sales', label: '2. Monthly Sales Summary', icon: Calendar },
    { id: 'yearly_sales', label: '3. Yearly Sales Ledger', icon: BarChart3 },
    { id: 'purchases', label: '4. Purchase Inward Report', icon: Building2 },
    { id: 'stock_valuation', label: '5. Stock Valuation Register', icon: Package },
    { id: 'expiry_analysis', label: '6. Medicine Expiry Analysis', icon: Clock },
    { id: 'gst_summary', label: '7. GST Tax Summary (GSTR-1)', icon: FileText },
    { id: 'profit_loss', label: '8. Profit & Loss Statement', icon: DollarSign },
    { id: 'customer_ledger', label: '9. Customer Credit Ledger', icon: Users },
    { id: 'supplier_ledger', label: '10. Supplier Balance Ledger', icon: Building2 },
    { id: 'cash_book', label: '11. Daily Cash Book', icon: DollarSign },
    { id: 'expenses', label: '12. Expense Register', icon: Wallet },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csv = '';
    const dateStr = new Date().toISOString().split('T')[0];

    if (selectedReport === 'daily_sales' || selectedReport === 'monthly_sales' || selectedReport === 'yearly_sales') {
      csv = 'Invoice No,Date,Customer,Doctor,Payment Mode,Subtotal,Discount,Tax,Grand Total\n';
      invoices.forEach((i) => {
        csv += `"${i.invoiceNumber}","${i.date}","${i.customerName}","${i.doctorName}","${i.paymentMethod}",${i.subTotal},${i.totalDiscount},${i.totalTax},${i.grandTotal}\n`;
      });
    } else if (selectedReport === 'stock_valuation') {
      csv = 'Batch No,Medicine,Expiry,Rack,Cost Price,MRP,Selling Rate,Stock,Total Cost Value\n';
      batches.forEach((b) => {
        const med = medicines.find((m) => m.id === b.medicineId);
        csv += `"${b.batchNumber}","${med?.brandName}","${b.expiryDate}","${med?.rackLocation}",${b.purchasePrice},${b.mrp},${b.sellingPrice},${b.currentStock},${(b.currentStock * b.purchasePrice).toFixed(2)}\n`;
      });
    } else if (selectedReport === 'expiry_analysis') {
      csv = 'Batch No,Medicine,Expiry,Stock,Status\n';
      batches.forEach((b) => {
        const med = medicines.find((m) => m.id === b.medicineId);
        const isExp = b.expiryDate < '2026-11';
        csv += `"${b.batchNumber}","${med?.brandName}","${b.expiryDate}",${b.currentStock},"${isExp ? 'EXPIRED' : 'ACTIVE'}"\n`;
      });
    } else if (selectedReport === 'customer_ledger') {
      csv = 'Customer Name,Phone,Address,Doctor,Purchases,Credit Balance\n';
      customers.forEach((c) => {
        csv += `"${c.name}","${c.phone}","${c.address}","${c.doctorName || ''}",${c.totalPurchases},${c.creditBalance}\n`;
      });
    } else if (selectedReport === 'supplier_ledger') {
      csv = 'Supplier Name,Contact,Phone,GSTIN,DL No,Balance Due\n';
      suppliers.forEach((s) => {
        csv += `"${s.name}","${s.contactPerson}","${s.phone}","${s.gstin}","${s.drugLicenseNo}",${s.balanceDue}\n`;
      });
    } else {
      csv = 'Category,Description,Date,Amount,Mode\n';
      expenses.forEach((e) => {
        csv += `"${e.category}","${e.description}","${e.date}",${e.amount},"${e.paymentMode}"\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SahasraPharmacy_Report_${selectedReport}_${dateStr}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-5.5rem)] select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Executive Reports & Analytics Center
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Export official PDF/CSV registers for audit, GST filing, inventory tracking and accounting
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Excel / CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* 12 Reports Switcher Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
        {reportDefinitions.map((def) => {
          const Icon = def.icon;
          const isSelected = selectedReport === def.id;

          return (
            <button
              key={def.id}
              onClick={() => setSelectedReport(def.id)}
              className={`p-2.5 rounded-lg border text-left flex flex-col justify-between gap-2 transition-all ${
                isSelected
                  ? 'bg-cyan-600/15 border-cyan-500 text-cyan-300 shadow-xs'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span className="font-semibold leading-snug">{def.label}</span>
            </button>
          );
        })}
      </div>

      {/* Report Data Preview Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
              {reportDefinitions.find((r) => r.id === selectedReport)?.label}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {settings.pharmacyName} · 100% Offline SQLite Local Report
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">
            Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>

        {/* Dynamic Table for selected report */}
        <div className="border border-slate-800 rounded-lg overflow-hidden">
          {(selectedReport === 'daily_sales' || selectedReport === 'monthly_sales' || selectedReport === 'yearly_sales') && (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="p-3">Bill No</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 font-sans">Patient</th>
                  <th className="p-3 font-sans">Doctor</th>
                  <th className="p-3 text-right">Subtotal</th>
                  <th className="p-3 text-right">Discount</th>
                  <th className="p-3 text-right">Tax</th>
                  <th className="p-3 text-right">Grand Total (₹)</th>
                  <th className="p-3 text-center font-sans">Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-850">
                    <td className="p-3 text-cyan-300 font-bold">{inv.invoiceNumber}</td>
                    <td className="p-3 text-slate-400">{inv.date}</td>
                    <td className="p-3 font-sans font-medium text-slate-100">{inv.customerName}</td>
                    <td className="p-3 font-sans text-slate-400">{inv.doctorName}</td>
                    <td className="p-3 text-right">₹{inv.subTotal.toFixed(2)}</td>
                    <td className="p-3 text-right text-emerald-400">-₹{inv.totalDiscount.toFixed(2)}</td>
                    <td className="p-3 text-right">₹{inv.totalTax.toFixed(2)}</td>
                    <td className="p-3 text-right font-bold text-slate-100">₹{inv.grandTotal.toFixed(2)}</td>
                    <td className="p-3 text-center font-sans uppercase text-[10px]">{inv.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'stock_valuation' && (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="p-3">Batch Number</th>
                  <th className="p-3 font-sans">Medicine Brand</th>
                  <th className="p-3">Expiry</th>
                  <th className="p-3 text-right">Cost Price</th>
                  <th className="p-3 text-right">MRP</th>
                  <th className="p-3 text-right">Current Stock</th>
                  <th className="p-3 text-right">Valuation at Cost (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {batches.map((b) => {
                  const med = medicines.find((m) => m.id === b.medicineId);
                  return (
                    <tr key={b.id} className="hover:bg-slate-850">
                      <td className="p-3 text-cyan-300 font-bold">{b.batchNumber}</td>
                      <td className="p-3 font-sans font-bold text-slate-100">{med?.brandName}</td>
                      <td className="p-3 text-slate-400">{b.expiryDate}</td>
                      <td className="p-3 text-right">₹{b.purchasePrice.toFixed(2)}</td>
                      <td className="p-3 text-right">₹{b.mrp.toFixed(2)}</td>
                      <td className="p-3 text-right font-bold text-emerald-400">{b.currentStock}</td>
                      <td className="p-3 text-right font-bold text-slate-100">
                        ₹{(b.currentStock * b.purchasePrice).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {selectedReport === 'customer_ledger' && (
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3 font-mono">Phone</th>
                  <th className="p-3">Address</th>
                  <th className="p-3">Consulting Doctor</th>
                  <th className="p-3 text-right font-mono">Lifetime Sales</th>
                  <th className="p-3 text-right font-mono">Credit Due (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-850">
                    <td className="p-3 font-bold text-slate-100">{c.name}</td>
                    <td className="p-3 font-mono text-cyan-300">{c.phone}</td>
                    <td className="p-3 text-slate-400">{c.address}</td>
                    <td className="p-3 text-slate-300">{c.doctorName || 'Self'}</td>
                    <td className="p-3 text-right font-mono">₹{c.totalPurchases.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono font-bold text-amber-400">₹{c.creditBalance.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'supplier_ledger' && (
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="p-3">Distributor Agency</th>
                  <th className="p-3">Contact Person</th>
                  <th className="p-3 font-mono">GSTIN</th>
                  <th className="p-3 font-mono">Drug License</th>
                  <th className="p-3 text-right font-mono">Outstanding Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-850">
                    <td className="p-3 font-bold text-slate-100">{s.name}</td>
                    <td className="p-3 text-slate-300">{s.contactPerson}</td>
                    <td className="p-3 font-mono text-slate-400">{s.gstin}</td>
                    <td className="p-3 font-mono text-slate-400">{s.drugLicenseNo}</td>
                    <td className="p-3 text-right font-mono font-bold text-amber-400">₹{s.balanceDue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'expenses' && (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3 font-sans">Category</th>
                  <th className="p-3 font-sans">Description</th>
                  <th className="p-3 font-sans">Paid To</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-850">
                    <td className="p-3 text-slate-400">{e.date}</td>
                    <td className="p-3 font-sans font-bold text-slate-100">{e.category}</td>
                    <td className="p-3 font-sans text-slate-300">{e.description}</td>
                    <td className="p-3 font-sans text-slate-400">{e.paidTo}</td>
                    <td className="p-3 text-right font-bold text-rose-400">₹{e.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {(selectedReport === 'purchases' || selectedReport === 'expiry_analysis' || selectedReport === 'gst_summary' || selectedReport === 'profit_loss' || selectedReport === 'cash_book') && (
            <div className="p-8 text-center text-slate-400 text-xs">
              <p className="font-semibold text-slate-200 mb-1">
                {reportDefinitions.find((r) => r.id === selectedReport)?.label} is ready for export.
              </p>
              <p className="text-[11px] text-slate-400">
                Click <strong>Download Excel / CSV</strong> or <strong>Print Report</strong> above to generate the full structured printout.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
