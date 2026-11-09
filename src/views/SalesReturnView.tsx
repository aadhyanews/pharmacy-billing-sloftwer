import React, { useState } from 'react';
import {
  RotateCcw,
  Search,
  CheckCircle2,
  DollarSign,
  Receipt,
  AlertCircle,
} from 'lucide-react';
import { storage } from '../services/storageService';
import { SaleInvoice, SalesReturn, SalesReturnItem, PaymentMethod } from '../types/pharmacy';

interface SalesReturnViewProps {
  initialInvoiceNo?: string;
}

export const SalesReturnView: React.FC<SalesReturnViewProps> = ({
  initialInvoiceNo = '',
}) => {
  const [invoices] = useState<SaleInvoice[]>(storage.getInvoices());
  const [salesReturns, setSalesReturns] = useState<SalesReturn[]>(storage.getSalesReturns());
  const [invoiceLookup, setInvoiceLookup] = useState(initialInvoiceNo);
  const [matchedInvoice, setMatchedInvoice] = useState<SaleInvoice | null>(() => {
    if (initialInvoiceNo) {
      return invoices.find((i) => i.invoiceNumber === initialInvoiceNo) || null;
    }
    return null;
  });

  // Return Processing Form State
  const [selectedItems, setSelectedItems] = useState<{ [itemId: string]: { selected: boolean; returnQty: number; reason: string } }>({});
  const [refundMode, setRefundMode] = useState<PaymentMethod>('cash');
  const [successMessage, setSuccessMessage] = useState('');

  const refresh = () => {
    setSalesReturns(storage.getSalesReturns());
  };

  const handleSearchInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    const found = invoices.find(
      (i) => i.invoiceNumber.toLowerCase() === invoiceLookup.trim().toLowerCase()
    );
    if (found) {
      setMatchedInvoice(found);
      const initialMap: { [itemId: string]: { selected: boolean; returnQty: number; reason: string } } = {};
      found.items.forEach((item, idx) => {
        initialMap[`item-${idx}`] = {
          selected: false,
          returnQty: 1,
          reason: 'Doctor changed prescription',
        };
      });
      setSelectedItems(initialMap);
    } else {
      alert(`Invoice "${invoiceLookup}" not found in local database!`);
      setMatchedInvoice(null);
    }
  };

  const handleToggleSelect = (key: string) => {
    setSelectedItems({
      ...selectedItems,
      [key]: {
        ...selectedItems[key],
        selected: !selectedItems[key]?.selected,
      },
    });
  };

  const handleQtyChange = (key: string, qty: number, maxQty: number) => {
    setSelectedItems({
      ...selectedItems,
      [key]: {
        ...selectedItems[key],
        returnQty: Math.max(1, Math.min(maxQty, qty)),
      },
    });
  };

  const handleReasonChange = (key: string, reason: string) => {
    setSelectedItems({
      ...selectedItems,
      [key]: {
        ...selectedItems[key],
        reason,
      },
    });
  };

  // Compute Refund Amount
  let calculatedRefund = 0;
  if (matchedInvoice) {
    matchedInvoice.items.forEach((item, idx) => {
      const state = selectedItems[`item-${idx}`];
      if (state?.selected) {
        const itemEffectiveRate = item.totalAmount / item.quantity;
        calculatedRefund += itemEffectiveRate * state.returnQty;
      }
    });
  }
  calculatedRefund = Math.round(calculatedRefund);

  const handleProcessReturn = () => {
    if (!matchedInvoice) return;
    if (calculatedRefund <= 0) {
      alert('Please check at least one item to return');
      return;
    }

    const returnItems: SalesReturnItem[] = [];
    matchedInvoice.items.forEach((item, idx) => {
      const state = selectedItems[`item-${idx}`];
      if (state?.selected) {
        const itemEffectiveRate = item.totalAmount / item.quantity;
        returnItems.push({
          medicineId: item.medicineId,
          brandName: item.brandName,
          batchNumber: item.batchNumber,
          quantity: state.returnQty,
          unitPrice: item.unitPrice,
          refundAmount: +(itemEffectiveRate * state.returnQty).toFixed(2),
          reason: state.reason,
        });
      }
    });

    const returnRecord: SalesReturn = {
      id: `ret-${Date.now()}`,
      returnNumber: `SRN-2026-${String(salesReturns.length + 120).padStart(4, '0')}`,
      originalInvoiceNumber: matchedInvoice.invoiceNumber,
      date: new Date().toISOString().split('T')[0],
      customerName: matchedInvoice.customerName,
      customerPhone: matchedInvoice.customerPhone,
      items: returnItems,
      totalRefund: calculatedRefund,
      paymentMethod: refundMode,
      reason: returnItems.map((i) => i.reason).join(', '),
      handledBy: 'M. Ramesh (Cashier)',
    };

    storage.recordSalesReturn(returnRecord);
    refresh();
    setSuccessMessage(`Sales return voucher ${returnRecord.returnNumber} processed successfully! Refunded ₹${calculatedRefund.toFixed(2)} to customer.`);
    setMatchedInvoice(null);
    setInvoiceLookup('');
  };

  return (
    <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-5.5rem)] select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-cyan-400" />
            Sales Return & Customer Refund Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Process medicine returns against previous tax invoices, restock batches and issue cash/credit refunds
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-lg text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Invoice Lookup Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-4">
        <h3 className="font-bold text-sm text-slate-200">
          Step 1: Look up Original Sales Invoice
        </h3>
        <form onSubmit={handleSearchInvoice} className="flex gap-2 max-w-xl">
          <div className="relative flex-1">
            <input
              type="text"
              value={invoiceLookup}
              onChange={(e) => setInvoiceLookup(e.target.value)}
              placeholder="Enter invoice number (e.g. SPS-2026-00839)..."
              className="w-full h-9 pl-9 pr-3 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 font-mono text-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>
          <button
            type="submit"
            className="px-4 h-9 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Fetch Invoice
          </button>
        </form>

        {/* Matched Invoice Items Selection */}
        {matchedInvoice && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="font-bold text-cyan-300 font-mono">{matchedInvoice.invoiceNumber}</span>
                <span className="text-slate-400 ml-2">({matchedInvoice.date} {matchedInvoice.time})</span>
              </div>
              <div>
                Patient: <strong className="text-slate-100">{matchedInvoice.customerName}</strong>
                {matchedInvoice.customerPhone && <span className="font-mono text-cyan-300 ml-1">({matchedInvoice.customerPhone})</span>}
              </div>
              <div>
                Original Bill: <strong className="font-mono text-emerald-400">₹{matchedInvoice.grandTotal.toFixed(2)}</strong>
              </div>
            </div>

            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="p-3 text-center">Select</th>
                    <th className="p-3 font-sans">Medicine Brand</th>
                    <th className="p-3">Batch</th>
                    <th className="p-3">Expiry</th>
                    <th className="p-3 text-right">Sold Qty</th>
                    <th className="p-3 text-right">Rate</th>
                    <th className="p-3 text-center">Return Qty</th>
                    <th className="p-3 font-sans">Reason for Return</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {matchedInvoice.items.map((item, idx) => {
                    const key = `item-${idx}`;
                    const state = selectedItems[key] || { selected: false, returnQty: 1, reason: '' };

                    return (
                      <tr
                        key={key}
                        className={state.selected ? 'bg-cyan-950/20' : 'hover:bg-slate-850'}
                      >
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={state.selected}
                            onChange={() => handleToggleSelect(key)}
                            className="w-4 h-4 rounded text-cyan-600 bg-slate-950 border-slate-700 focus:ring-0"
                          />
                        </td>
                        <td className="p-3 font-sans font-bold text-slate-100">{item.brandName}</td>
                        <td className="p-3 text-cyan-300">{item.batchNumber}</td>
                        <td className="p-3 text-slate-400">{item.expiryDate}</td>
                        <td className="p-3 text-right font-bold">{item.quantity}</td>
                        <td className="p-3 text-right">₹{item.unitPrice.toFixed(2)}</td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="1"
                            max={item.quantity}
                            value={state.returnQty}
                            disabled={!state.selected}
                            onChange={(e) => handleQtyChange(key, parseInt(e.target.value) || 1, item.quantity)}
                            className="w-14 h-7 text-center bg-slate-950 border border-slate-700 rounded text-slate-100 font-bold disabled:opacity-40"
                          />
                        </td>
                        <td className="p-3 font-sans">
                          <select
                            value={state.reason}
                            disabled={!state.selected}
                            onChange={(e) => handleReasonChange(key, e.target.value)}
                            className="h-7 px-2 bg-slate-950 border border-slate-700 rounded text-slate-200 text-xs disabled:opacity-40"
                          >
                            <option value="Doctor changed prescription">Doctor changed prescription</option>
                            <option value="Wrong medicine purchased">Wrong medicine purchased</option>
                            <option value="Patient recovered / excess">Patient recovered / excess tablets</option>
                            <option value="Adverse reaction">Adverse reaction / intolerance</option>
                            <option value="Defective / damaged strip">Defective / damaged strip</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Refund Settlement */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-sans">Refund Payment Mode:</span>
                <select
                  value={refundMode}
                  onChange={(e) => setRefundMode(e.target.value as PaymentMethod)}
                  className="h-8 px-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-sans"
                >
                  <option value="cash">Cash Refund</option>
                  <option value="upi">UPI Transfer</option>
                  <option value="credit">Credit to Patient Ledger</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px] font-sans">Total Refund Amount:</span>
                  <span className="text-xl font-bold text-emerald-400">₹{calculatedRefund.toFixed(2)}</span>
                </div>

                <button
                  type="button"
                  onClick={handleProcessReturn}
                  disabled={calculatedRefund <= 0}
                  className="px-5 h-9 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded font-bold font-sans flex items-center gap-1.5 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Issue Return & Restock</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Historical Sales Return Register */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-3">
        <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-cyan-400" />
          Processed Sales Return Register
        </h3>

        {salesReturns.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 text-center">
            No sales returns processed yet. All sales transactions remain intact.
          </p>
        ) : (
          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Return Note #</th>
                  <th className="p-3">Original Invoice</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 font-sans">Customer</th>
                  <th className="p-3 text-center">Items</th>
                  <th className="p-3 text-right">Refund Amount</th>
                  <th className="p-3 text-center font-sans">Mode</th>
                  <th className="p-3 font-sans">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {salesReturns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-slate-850">
                    <td className="p-3 font-bold text-cyan-300">{ret.returnNumber}</td>
                    <td className="p-3 text-slate-400">{ret.originalInvoiceNumber}</td>
                    <td className="p-3 text-slate-400">{ret.date}</td>
                    <td className="p-3 font-sans font-medium text-slate-100">{ret.customerName}</td>
                    <td className="p-3 text-center font-bold">{ret.items.length}</td>
                    <td className="p-3 text-right font-bold text-emerald-400">
                      ₹{ret.totalRefund.toFixed(2)}
                    </td>
                    <td className="p-3 text-center font-sans uppercase text-[11px]">
                      {ret.paymentMethod}
                    </td>
                    <td className="p-3 font-sans text-slate-400 text-[11px] truncate max-w-xs">
                      {ret.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
