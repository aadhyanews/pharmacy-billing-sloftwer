import React, { useState } from 'react';
import {
  Undo2,
  Plus,
  Building2,
  Package,
  Calendar,
  CheckCircle2,
  X,
} from 'lucide-react';
import { storage } from '../services/storageService';
import { PurchaseReturn, Supplier, Medicine, MedicineBatch } from '../types/pharmacy';

export const PurchaseReturnView: React.FC = () => {
  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>(storage.getPurchaseReturns());
  const [suppliers] = useState<Supplier[]>(storage.getSuppliers());
  const [medicines] = useState<Medicine[]>(storage.getMedicines());
  const [batches] = useState<MedicineBatch[]>(storage.getBatches());

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [purchaseInvoiceNo, setPurchaseInvoiceNo] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id || '');
  const [returnQty, setReturnQty] = useState<number>(5);
  const [returnReason, setReturnReason] = useState('Damaged packaging / leakage');

  const refresh = () => {
    setPurchaseReturns(storage.getPurchaseReturns());
  };

  const handleSavePurchaseReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === supplierId);
    const batch = batches.find((b) => b.id === selectedBatchId);
    const med = medicines.find((m) => m.id === batch?.medicineId);

    if (!sup || !batch || !med || returnQty <= 0) return;

    if (returnQty > batch.currentStock) {
      alert(`Cannot return more than current stock (${batch.currentStock})`);
      return;
    }

    const itemTotal = +(returnQty * batch.purchasePrice).toFixed(2);

    const ret: PurchaseReturn = {
      id: `pret-${Date.now()}`,
      returnNumber: `DBN-2026-${String(purchaseReturns.length + 80).padStart(4, '0')}`,
      supplierId: sup.id,
      supplierName: sup.name,
      purchaseInvoiceNo: purchaseInvoiceNo.trim() || 'INWARD-REC',
      date: new Date().toISOString().split('T')[0],
      items: [
        {
          medicineName: med.brandName,
          batchNumber: batch.batchNumber,
          quantity: returnQty,
          purchaseRate: batch.purchasePrice,
          amount: itemTotal,
          reason: returnReason,
        },
      ],
      totalAmount: itemTotal,
      reason: returnReason,
      status: 'credited',
    };

    storage.recordPurchaseReturn(ret);
    refresh();
    setShowModal(false);
    setPurchaseInvoiceNo('');
  };

  return (
    <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-5.5rem)] select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Undo2 className="w-5 h-5 text-cyan-400" />
            Purchase Return & Debit Note Register
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Return expired, short-dated or damaged stock to wholesale suppliers with debit notes
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase Return Note</span>
        </button>
      </div>

      {/* Return Notes Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950 text-slate-400 text-[11px] font-semibold border-b border-slate-800">
            <tr>
              <th className="p-3">Debit Note #</th>
              <th className="p-3">Date</th>
              <th className="p-3 font-sans">Supplier Agency</th>
              <th className="p-3 font-sans">Returned Drug Formulation</th>
              <th className="p-3">Batch</th>
              <th className="p-3 text-right">Return Qty</th>
              <th className="p-3 text-right">Debit Amount (₹)</th>
              <th className="p-3 font-sans">Return Reason</th>
              <th className="p-3 text-center font-sans">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {purchaseReturns.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-slate-500 font-sans">
                  No outward purchase returns logged yet.
                </td>
              </tr>
            ) : (
              purchaseReturns.map((ret) => (
                <tr key={ret.id} className="hover:bg-slate-850">
                  <td className="p-3 font-bold text-cyan-300">{ret.returnNumber}</td>
                  <td className="p-3 text-slate-400">{ret.date}</td>
                  <td className="p-3 font-sans font-medium text-slate-100">{ret.supplierName}</td>
                  <td className="p-3 font-sans font-semibold text-slate-200">
                    {ret.items[0]?.medicineName}
                  </td>
                  <td className="p-3 text-cyan-300">{ret.items[0]?.batchNumber}</td>
                  <td className="p-3 text-right font-bold">{ret.items[0]?.quantity}</td>
                  <td className="p-3 text-right font-bold text-amber-400">
                    ₹{ret.totalAmount.toFixed(2)}
                  </td>
                  <td className="p-3 font-sans text-slate-400 text-[11px] truncate max-w-xs">
                    {ret.reason}
                  </td>
                  <td className="p-3 text-center font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 uppercase">
                      {ret.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Return Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full p-6 text-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Undo2 className="w-4 h-4 text-cyan-400" />
                Issue Debit Note to Supplier
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePurchaseReturn} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="text-slate-300 block font-semibold mb-1">Select Supplier *</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full h-8 px-2 bg-slate-950 border border-slate-700 rounded text-slate-100"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 block font-semibold mb-1">Select Batch to Return *</label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full h-8 px-2 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono text-[11px]"
                >
                  {batches.map((b) => {
                    const med = medicines.find((m) => m.id === b.medicineId);
                    return (
                      <option key={b.id} value={b.id}>
                        {med?.brandName} | Batch: {b.batchNumber} (Stock: {b.currentStock}) - Cost: ₹{b.purchasePrice}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block font-semibold mb-1">Return Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={returnQty}
                    onChange={(e) => setReturnQty(parseInt(e.target.value) || 1)}
                    className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block font-semibold mb-1">Original Inward Bill No</label>
                  <input
                    type="text"
                    value={purchaseInvoiceNo}
                    onChange={(e) => setPurchaseInvoiceNo(e.target.value)}
                    placeholder="e.g. APL-88219"
                    className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block font-semibold mb-1">Reason for Return</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full h-8 px-2 bg-slate-950 border border-slate-700 rounded text-slate-100"
                >
                  <option value="Damaged packaging / leakage">Damaged packaging / leakage</option>
                  <option value="Near expiry return to manufacturer">Near expiry return to manufacturer</option>
                  <option value="Slow moving drug stock exchange">Slow moving drug stock exchange</option>
                  <option value="Incorrect supply item sent">Incorrect supply item sent</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Issue Debit Note</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
