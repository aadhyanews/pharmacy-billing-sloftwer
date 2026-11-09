import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Plus,
  AlertTriangle,
  FileText,
  X,
  CheckCircle2,
} from 'lucide-react';
import { storage } from '../services/storageService';
import { StockAdjustment, Medicine, MedicineBatch } from '../types/pharmacy';

export const StockAdjustmentView: React.FC = () => {
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>(storage.getStockAdjustments());
  const [medicines] = useState<Medicine[]>(storage.getMedicines());
  const [batches, setBatches] = useState<MedicineBatch[]>(storage.getBatches());

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id || '');
  const [adjustmentType, setAdjustmentType] = useState<StockAdjustment['adjustmentType']>('breakage');
  const [quantityChange, setQuantityChange] = useState<number>(-1);
  const [reason, setReason] = useState('');

  const refresh = () => {
    setAdjustments(storage.getStockAdjustments());
    setBatches(storage.getBatches());
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const batch = batches.find((b) => b.id === selectedBatchId);
    const med = medicines.find((m) => m.id === batch?.medicineId);

    if (!batch || !med || !reason.trim() || quantityChange === 0) return;

    const newStock = Math.max(0, batch.currentStock + quantityChange);

    const adj: StockAdjustment = {
      id: `adj-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      medicineId: med.id,
      medicineName: med.brandName,
      batchNumber: batch.batchNumber,
      adjustmentType,
      quantityChange,
      previousStock: batch.currentStock,
      newStock,
      reason: reason.trim(),
      recordedBy: 'Dr. K. Srinivas Rao (Pharmacist)',
    };

    storage.recordStockAdjustment(adj);
    refresh();
    setShowModal(false);
    setReason('');
  };

  return (
    <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-5.5rem)] select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
            Stock Adjustment & Physical Audit Control
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log damage, breakage, expired batch quarantine and physical count reconciliations
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Stock Adjustment</span>
        </button>
      </div>

      {/* Adjustments Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950 text-slate-400 text-[11px] font-semibold border-b border-slate-800">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3 font-sans">Medicine Brand</th>
              <th className="p-3">Batch Number</th>
              <th className="p-3 font-sans">Adjustment Type</th>
              <th className="p-3 text-right">Prev Stock</th>
              <th className="p-3 text-center">Qty Change</th>
              <th className="p-3 text-right">New Stock</th>
              <th className="p-3 font-sans">Reason & Remarks</th>
              <th className="p-3 font-sans">Recorded By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {adjustments.map((adj) => (
              <tr key={adj.id} className="hover:bg-slate-850">
                <td className="p-3 text-slate-400">{adj.date}</td>
                <td className="p-3 font-sans font-bold text-slate-100">{adj.medicineName}</td>
                <td className="p-3 text-cyan-300 font-bold">{adj.batchNumber}</td>
                <td className="p-3 font-sans">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      adj.adjustmentType === 'expired'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
                        : adj.adjustmentType === 'breakage'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                        : 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/80'
                    }`}
                  >
                    {adj.adjustmentType.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-3 text-right text-slate-400">{adj.previousStock}</td>
                <td className="p-3 text-center font-bold">
                  <span className={adj.quantityChange < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                    {adj.quantityChange > 0 ? `+${adj.quantityChange}` : adj.quantityChange}
                  </span>
                </td>
                <td className="p-3 text-right font-bold text-slate-100">{adj.newStock}</td>
                <td className="p-3 font-sans text-slate-300 text-[11px] truncate max-w-xs">{adj.reason}</td>
                <td className="p-3 font-sans text-slate-400 text-[11px]">{adj.recordedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Adjustment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full p-6 text-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm flex items-center gap-2 text-slate-100">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                Physical Stock Adjustment Entry
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="text-slate-300 block font-semibold mb-1">Select Medicine Batch *</label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full h-8 px-2 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono text-[11px]"
                >
                  {batches.map((b) => {
                    const med = medicines.find((m) => m.id === b.medicineId);
                    return (
                      <option key={b.id} value={b.id}>
                        {med?.brandName} | Batch: {b.batchNumber} (Current Stock: {b.currentStock})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block font-semibold mb-1">Adjustment Type</label>
                  <select
                    value={adjustmentType}
                    onChange={(e) => setAdjustmentType(e.target.value as any)}
                    className="w-full h-8 px-2 bg-slate-950 border border-slate-700 rounded text-slate-100"
                  >
                    <option value="breakage">Bottle Breakage / Leakage</option>
                    <option value="expired">Expired Quarantine Disposal</option>
                    <option value="damaged">Damaged Foil / Packaging</option>
                    <option value="recount_loss">Physical Recount Shortage (-)</option>
                    <option value="recount_gain">Physical Recount Surplus (+)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block font-semibold mb-1">
                    Quantity Change (e.g. -2 or +5) *
                  </label>
                  <input
                    type="number"
                    required
                    value={quantityChange}
                    onChange={(e) => setQuantityChange(parseInt(e.target.value) || 0)}
                    className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block font-semibold mb-1">Reason & Audit Justification *</label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why stock was adjusted (e.g. 1 syrup bottle accidentally dropped and shattered during shelf cleaning)..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
                />
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
                  <span>Apply Stock Correction</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
