import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Calendar,
  Printer,
  Download,
  RotateCcw,
  Eye,
  X,
  CreditCard,
  Banknote,
  QrCode,
  BookOpen,
} from 'lucide-react';
import { storage } from '../services/storageService';
import { SaleInvoice } from '../types/pharmacy';
import { InvoicePrintModal } from '../components/InvoicePrintModal';

interface SalesManagementViewProps {
  onNavigateToReturn?: (invoiceNumber: string) => void;
}

export const SalesManagementView: React.FC<SalesManagementViewProps> = ({
  onNavigateToReturn,
}) => {
  const [invoices, setInvoices] = useState<SaleInvoice[]>(storage.getInvoices());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<SaleInvoice | null>(null);
  const [reprintInvoice, setReprintInvoice] = useState<SaleInvoice | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  const totalSalesAmount = invoices.reduce((s, i) => s + i.grandTotal, 0);

  const filtered = invoices.filter((i) => {
    const matchesSearch =
      i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.customerPhone.includes(searchQuery) ||
      i.doctorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPayment = paymentFilter === 'all' || i.paymentMethod === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  const handleExportCSV = () => {
    let csv = 'Invoice No,Date,Time,Customer,Phone,Doctor,Subtotal,Discount,Taxable,CGST,SGST,Roundoff,Grand Total,Payment,Cashier\n';
    filtered.forEach((i) => {
      csv += `"${i.invoiceNumber}","${i.date}","${i.time}","${i.customerName}","${i.customerPhone}","${i.doctorName}",${i.subTotal},${i.totalDiscount},${i.taxableAmount},${i.cgstTotal},${i.sgstTotal},${i.roundOff},${i.grandTotal},"${i.paymentMethod}","${i.cashierName}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SahasraPharmacy_SalesHistory_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-5.5rem)] select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-cyan-400" />
            Sales Management & Invoices Register
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Archived tax invoices, audit trails, and multi-format reprint capabilities
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Sales CSV</span>
        </button>
      </div>

      {/* Summary KPI */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400">Total Billed Turnover (All Recorded Bills)</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
            ₹{totalSalesAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Total Invoices: <strong className="text-slate-200">{invoices.length}</strong>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice number, customer phone/name or doctor..."
            className="w-full h-8 pl-8 pr-3 bg-slate-950 border border-slate-700 rounded text-slate-100 placeholder-slate-400 font-mono"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Payment:</span>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="h-8 px-2 bg-slate-950 border border-slate-700 rounded text-slate-200"
          >
            <option value="all">All Payment Modes</option>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
            <option value="credit">Credit Book</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950 text-slate-400 text-[11px] font-semibold border-b border-slate-800">
            <tr>
              <th className="p-3">Invoice Number</th>
              <th className="p-3">Date & Time</th>
              <th className="p-3 font-sans">Patient Name</th>
              <th className="p-3 font-sans">Doctor</th>
              <th className="p-3 text-center">Items</th>
              <th className="p-3 text-right">Taxable</th>
              <th className="p-3 text-right">GST Total</th>
              <th className="p-3 text-right">Net Amount</th>
              <th className="p-3 text-center font-sans">Payment</th>
              <th className="p-3 text-center font-sans">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filtered.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-850 transition-colors">
                <td className="p-3 font-bold text-cyan-300">{inv.invoiceNumber}</td>
                <td className="p-3 text-slate-400">
                  <div>{inv.date}</div>
                  <div className="text-[10px]">{inv.time}</div>
                </td>
                <td className="p-3 font-sans">
                  <div className="font-semibold text-slate-100">{inv.customerName}</div>
                  {inv.customerPhone && <div className="text-[10px] font-mono text-slate-400">{inv.customerPhone}</div>}
                </td>
                <td className="p-3 font-sans text-slate-300">{inv.doctorName}</td>
                <td className="p-3 text-center">{inv.items.length}</td>
                <td className="p-3 text-right text-slate-400">₹{inv.taxableAmount.toFixed(2)}</td>
                <td className="p-3 text-right text-slate-400">₹{inv.totalTax.toFixed(2)}</td>
                <td className="p-3 text-right font-bold text-slate-100 text-sm">
                  ₹{inv.grandTotal.toFixed(2)}
                </td>
                <td className="p-3 text-center font-sans">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      inv.paymentMethod === 'cash'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                        : inv.paymentMethod === 'upi'
                        ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80'
                        : inv.paymentMethod === 'card'
                        ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/80'
                        : 'bg-purple-950/80 text-purple-300 border border-purple-800/80'
                    }`}
                  >
                    {inv.paymentMethod}
                  </span>
                </td>
                <td className="p-3 text-center font-sans">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      title="View Line Items"
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setReprintInvoice(inv)}
                      title="Reprint Invoice (Thermal / A4)"
                      className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    {onNavigateToReturn && (
                      <button
                        onClick={() => onNavigateToReturn(inv.invoiceNumber)}
                        title="Sales Return (Refund)"
                        className="p-1 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full p-6 text-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 shrink-0">
              <div>
                <h3 className="font-bold text-sm text-cyan-300">
                  Bill Details: {selectedInvoice.invoiceNumber}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Billed on {selectedInvoice.date} at {selectedInvoice.time} by {selectedInvoice.cashierName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const inv = selectedInvoice;
                    setSelectedInvoice(null);
                    setReprintInvoice(inv);
                  }}
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button onClick={() => setSelectedInvoice(null)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mt-4 space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded border border-slate-800">
                <div>Patient: <strong className="text-slate-100 font-sans">{selectedInvoice.customerName}</strong></div>
                <div>Phone: <span className="text-cyan-300">{selectedInvoice.customerPhone || 'N/A'}</span></div>
                <div>Doctor: <span className="text-slate-200 font-sans">{selectedInvoice.doctorName}</span></div>
                <div>Payment Mode: <strong className="uppercase text-emerald-400">{selectedInvoice.paymentMethod}</strong></div>
              </div>

              <table className="w-full text-left border border-slate-800 mt-2">
                <thead className="bg-slate-950 text-slate-400 text-[11px]">
                  <tr>
                    <th className="p-2 font-sans">Item Formulation</th>
                    <th className="p-2">Batch</th>
                    <th className="p-2 text-right">Rate</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-center">Disc%</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {selectedInvoice.items.map((i, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-sans font-bold text-slate-200">{i.brandName}</td>
                      <td className="p-2 text-cyan-300">{i.batchNumber}</td>
                      <td className="p-2 text-right">₹{i.unitPrice.toFixed(2)}</td>
                      <td className="p-2 text-center font-bold">{i.quantity}</td>
                      <td className="p-2 text-center text-slate-400">{i.discountPercent}%</td>
                      <td className="p-2 text-right font-bold text-slate-100">₹{i.totalAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end gap-6 pt-3 text-slate-300">
                <div>Subtotal: ₹{selectedInvoice.subTotal.toFixed(2)}</div>
                <div>Discount: -₹{selectedInvoice.totalDiscount.toFixed(2)}</div>
                <div>GST: ₹{selectedInvoice.totalTax.toFixed(2)}</div>
                <div className="text-base font-bold text-emerald-400">
                  Grand Total: ₹{selectedInvoice.grandTotal.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reprint Modal */}
      {reprintInvoice && (
        <InvoicePrintModal
          invoice={reprintInvoice}
          onClose={() => setReprintInvoice(null)}
        />
      )}
    </div>
  );
};
