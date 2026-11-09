import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  FileText,
  Calendar,
  Building2,
  Trash2,
  X,
  CheckCircle2,
} from 'lucide-react';
import { storage } from '../services/storageService';
import { PurchaseInvoice, PurchaseItem, Supplier, Medicine } from '../types/pharmacy';

export const PurchaseManagementView: React.FC = () => {
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>(storage.getPurchases());
  const [suppliers] = useState<Supplier[]>(storage.getSuppliers());
  const [medicines] = useState<Medicine[]>(storage.getMedicines());
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showNewPurchaseModal, setShowNewPurchaseModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);

  // New Purchase Form
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState<'bank' | 'cash' | 'credit' | 'cheque'>('bank');
  const [paidAmount, setPaidAmount] = useState<number>(0);

  // Line item draft
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [draftMedId, setDraftMedId] = useState(medicines[0]?.id || '');
  const [draftBatch, setDraftBatch] = useState('');
  const [draftExp, setDraftExp] = useState('2028-06');
  const [draftQty, setDraftQty] = useState<number>(20);
  const [draftFreeQty, setDraftFreeQty] = useState<number>(0);
  const [draftPurPrice, setDraftPurPrice] = useState<number>(50);
  const [draftMrp, setDraftMrp] = useState<number>(85);
  const [draftSellPrice, setDraftSellPrice] = useState<number>(75);
  const [draftGst, setDraftGst] = useState<number>(12);

  const refresh = () => {
    setPurchases(storage.getPurchases());
  };

  const handleAddItemToPurchase = () => {
    const med = medicines.find((m) => m.id === draftMedId);
    if (!med || !draftBatch.trim()) {
      alert('Please select medicine and enter batch number');
      return;
    }

    const totalQty = draftQty;
    const baseAmt = totalQty * draftPurPrice;
    const taxAmt = (baseAmt * draftGst) / 100;
    const totalAmt = baseAmt + taxAmt;

    const newItem: PurchaseItem = {
      medicineId: med.id,
      brandName: med.brandName,
      genericName: med.genericName,
      batchNumber: draftBatch.trim().toUpperCase(),
      expiryDate: draftExp,
      hsnCode: med.hsnCode,
      mrp: draftMrp,
      purchasePrice: draftPurPrice,
      sellingPrice: draftSellPrice,
      quantity: draftQty,
      freeQuantity: draftFreeQty,
      gstRate: draftGst,
      taxAmount: +taxAmt.toFixed(2),
      totalAmount: +totalAmt.toFixed(2),
    };

    setItems([...items, newItem]);
    setDraftBatch('');
    setDraftQty(20);
    setDraftFreeQty(0);
  };

  const handleRemoveDraftItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Computations
  const subTotal = items.reduce((s, i) => s + i.purchasePrice * i.quantity, 0);
  const taxTotal = items.reduce((s, i) => s + i.taxAmount, 0);
  const grandTotal = +(subTotal + taxTotal).toFixed(2);
  const balanceDue = Math.max(0, +(grandTotal - paidAmount).toFixed(2));

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Please add at least one medicine item to this purchase invoice');
      return;
    }
    const sup = suppliers.find((s) => s.id === supplierId);
    if (!sup) return;

    const purchase: PurchaseInvoice = {
      id: `pur-${Date.now()}`,
      invoiceNumber: `PINV-2026-${String(purchases.length + 313).padStart(4, '0')}`,
      supplierInvoiceNo: supplierInvoiceNo.trim() || `BILL-${Date.now()}`,
      supplierId: sup.id,
      supplierName: sup.name,
      supplierGstin: sup.gstin,
      invoiceDate,
      receivedDate: new Date().toISOString().split('T')[0],
      items,
      subTotal: +subTotal.toFixed(2),
      taxTotal: +taxTotal.toFixed(2),
      grandTotal,
      paidAmount: Number(paidAmount) || 0,
      balanceDue,
      paymentMode,
      status: balanceDue === 0 ? 'paid' : paidAmount > 0 ? 'partial' : 'received',
    };

    storage.createPurchase(purchase);
    refresh();
    setShowNewPurchaseModal(false);
    setItems([]);
    setSupplierInvoiceNo('');
    setPaidAmount(0);
  };

  const filtered = purchases.filter(
    (p) =>
      p.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplierInvoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-5.5rem)] select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Truck className="w-5 h-5 text-cyan-400" />
            Purchase Management (Stock Inward Entry)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log supplier invoices, add batch stock, calculate GST input tax credit
          </p>
        </div>

        <button
          onClick={() => {
            setItems([]);
            setShowNewPurchaseModal(true);
          }}
          className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase Entry</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center gap-3 text-xs">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search supplier name, supplier bill number or purchase invoice #..."
            className="w-full h-8 pl-8 pr-3 bg-slate-950 border border-slate-700 rounded text-slate-100 placeholder-slate-400 font-mono"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Purchases Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950 text-slate-400 text-[11px] font-semibold border-b border-slate-800">
            <tr>
              <th className="p-3">Inward ID</th>
              <th className="p-3">Supplier Bill No</th>
              <th className="p-3 font-sans">Supplier & Agency</th>
              <th className="p-3">Date</th>
              <th className="p-3 text-center">Items</th>
              <th className="p-3 text-right">Taxable</th>
              <th className="p-3 text-right">GST Total</th>
              <th className="p-3 text-right">Grand Total</th>
              <th className="p-3 text-right">Balance Due</th>
              <th className="p-3 text-center font-sans">Status</th>
              <th className="p-3 text-center font-sans">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filtered.map((pur) => (
              <tr key={pur.id} className="hover:bg-slate-850 transition-colors">
                <td className="p-3 font-bold text-cyan-300">{pur.invoiceNumber}</td>
                <td className="p-3 text-slate-300">{pur.supplierInvoiceNo}</td>
                <td className="p-3 font-sans">
                  <div className="font-semibold text-slate-100">{pur.supplierName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">GSTIN: {pur.supplierGstin}</div>
                </td>
                <td className="p-3 text-slate-400">{pur.invoiceDate}</td>
                <td className="p-3 text-center text-slate-300">{pur.items.length}</td>
                <td className="p-3 text-right text-slate-400">₹{pur.subTotal.toFixed(2)}</td>
                <td className="p-3 text-right text-slate-400">₹{pur.taxTotal.toFixed(2)}</td>
                <td className="p-3 text-right font-bold text-slate-100">₹{pur.grandTotal.toFixed(2)}</td>
                <td className="p-3 text-right font-bold text-amber-400">₹{pur.balanceDue.toFixed(2)}</td>
                <td className="p-3 text-center font-sans">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      pur.status === 'paid'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                        : pur.status === 'partial'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                        : 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/80'
                    }`}
                  >
                    {pur.status}
                  </span>
                </td>
                <td className="p-3 text-center font-sans">
                  <button
                    onClick={() => setSelectedInvoice(pur)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-xs transition-colors"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Purchase Entry Modal */}
      {showNewPurchaseModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-4xl w-full p-6 text-slate-100 max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Truck className="w-4 h-4 text-cyan-400" />
                Inward Purchase Invoice Entry
              </h3>
              <button
                onClick={() => setShowNewPurchaseModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 py-4 text-xs">
              {/* Supplier & Bill Header Inputs */}
              <div className="grid grid-cols-4 gap-3 bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <div>
                  <label className="text-slate-400 block font-semibold mb-1">Select Supplier *</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full h-8 px-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block font-semibold mb-1">Supplier Bill No *</label>
                  <input
                    type="text"
                    required
                    value={supplierInvoiceNo}
                    onChange={(e) => setSupplierInvoiceNo(e.target.value)}
                    placeholder="e.g. APL-8921"
                    className="w-full h-8 px-2.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block font-semibold mb-1">Bill Date</label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full h-8 px-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block font-semibold mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full h-8 px-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
                  >
                    <option value="bank">Bank Transfer / NEFT</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="credit">Credit (Pending)</option>
                  </select>
                </div>
              </div>

              {/* Line Item Draft Form */}
              <div className="bg-slate-950 p-3.5 rounded-lg border border-cyan-800/40 space-y-3">
                <span className="font-bold text-cyan-300 block">Add Medicine Item</span>
                <div className="grid grid-cols-4 gap-2.5">
                  <div className="col-span-2">
                    <label className="text-slate-400 text-[11px] block">Medicine *</label>
                    <select
                      value={draftMedId}
                      onChange={(e) => setDraftMedId(e.target.value)}
                      className="w-full h-7 px-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
                    >
                      {medicines.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.brandName} ({m.genericName})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px] block">Batch Number *</label>
                    <input
                      type="text"
                      value={draftBatch}
                      onChange={(e) => setDraftBatch(e.target.value)}
                      placeholder="e.g. BTH-994"
                      className="w-full h-7 px-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px] block">Expiry (YYYY-MM)</label>
                    <input
                      type="text"
                      value={draftExp}
                      onChange={(e) => setDraftExp(e.target.value)}
                      placeholder="2028-06"
                      className="w-full h-7 px-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-2.5">
                  <div>
                    <label className="text-slate-400 text-[11px] block">Quantity *</label>
                    <input
                      type="number"
                      value={draftQty}
                      onChange={(e) => setDraftQty(parseInt(e.target.value) || 0)}
                      className="w-full h-7 px-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px] block">Free Qty</label>
                    <input
                      type="number"
                      value={draftFreeQty}
                      onChange={(e) => setDraftFreeQty(parseInt(e.target.value) || 0)}
                      className="w-full h-7 px-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px] block">Cost Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={draftPurPrice}
                      onChange={(e) => setDraftPurPrice(parseFloat(e.target.value) || 0)}
                      className="w-full h-7 px-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px] block">Retail MRP (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={draftMrp}
                      onChange={(e) => setDraftMrp(parseFloat(e.target.value) || 0)}
                      className="w-full h-7 px-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px] block">Selling Rate (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={draftSellPrice}
                      onChange={(e) => setDraftSellPrice(parseFloat(e.target.value) || 0)}
                      className="w-full h-7 px-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px] block">GST Rate</label>
                    <select
                      value={draftGst}
                      onChange={(e) => setDraftGst(parseInt(e.target.value) || 12)}
                      className="w-full h-7 px-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
                    >
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddItemToPurchase}
                    className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item to Bill</span>
                  </button>
                </div>
              </div>

              {/* Items Table in Draft */}
              {items.length > 0 && (
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950 text-slate-400 text-[11px] border-b border-slate-800">
                      <tr>
                        <th className="p-2">#</th>
                        <th className="p-2 font-sans">Medicine Brand</th>
                        <th className="p-2">Batch</th>
                        <th className="p-2">Exp</th>
                        <th className="p-2 text-right">Qty</th>
                        <th className="p-2 text-right">Free</th>
                        <th className="p-2 text-right">Cost</th>
                        <th className="p-2 text-right">GST</th>
                        <th className="p-2 text-right">Total (₹)</th>
                        <th className="p-2 text-center">Del</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-850">
                          <td className="p-2 text-slate-400">{idx + 1}</td>
                          <td className="p-2 font-sans font-bold text-slate-100">{item.brandName}</td>
                          <td className="p-2 text-cyan-300">{item.batchNumber}</td>
                          <td className="p-2 text-slate-400">{item.expiryDate}</td>
                          <td className="p-2 text-right font-bold">{item.quantity}</td>
                          <td className="p-2 text-right text-emerald-400">{item.freeQuantity || 0}</td>
                          <td className="p-2 text-right">₹{item.purchasePrice.toFixed(2)}</td>
                          <td className="p-2 text-right text-slate-400">₹{item.taxAmount.toFixed(2)} ({item.gstRate}%)</td>
                          <td className="p-2 text-right font-bold text-slate-100">₹{item.totalAmount.toFixed(2)}</td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveDraftItem(idx)}
                              className="p-1 text-slate-400 hover:text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Settlement Totals */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex items-center justify-between font-mono text-xs">
                <div className="space-y-1 text-slate-400">
                  <div>Subtotal: <strong className="text-slate-200">₹{subTotal.toFixed(2)}</strong></div>
                  <div>GST Total: <strong className="text-slate-200">₹{taxTotal.toFixed(2)}</strong></div>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <label className="text-slate-400 block text-[11px] mb-1 font-sans">Amount Paid Now (₹):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                      className="w-32 h-8 px-2 text-right bg-slate-900 border border-slate-700 rounded text-emerald-400 font-bold"
                    />
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px] font-sans">Grand Total:</span>
                    <span className="text-lg font-bold text-slate-100">₹{grandTotal.toFixed(2)}</span>
                    <span className="block text-amber-400 text-xs mt-0.5">Balance Due: ₹{balanceDue.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setShowNewPurchaseModal(false)}
                className="px-4 py-1.5 bg-slate-800 text-slate-300 rounded font-medium text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePurchase}
                disabled={items.length === 0}
                className="px-5 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Inward Stock & Update Inventory</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Purchase Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full p-6 text-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-cyan-300">
                  Purchase Invoice: {selectedInvoice.invoiceNumber}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Supplier: {selectedInvoice.supplierName} (Bill: {selectedInvoice.supplierInvoiceNo})
                </p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-4 text-slate-300">
                <div>GSTIN: {selectedInvoice.supplierGstin}</div>
                <div>Date: {selectedInvoice.invoiceDate}</div>
                <div>Payment Mode: {selectedInvoice.paymentMode.toUpperCase()}</div>
                <div>Status: {selectedInvoice.status.toUpperCase()}</div>
              </div>

              <table className="w-full text-left border border-slate-800 mt-3">
                <thead className="bg-slate-950 text-slate-400 text-[11px]">
                  <tr>
                    <th className="p-2">Item</th>
                    <th className="p-2">Batch</th>
                    <th className="p-2 text-right">Qty</th>
                    <th className="p-2 text-right">Cost</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {selectedInvoice.items.map((i, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-sans font-medium">{i.brandName}</td>
                      <td className="p-2 text-cyan-300">{i.batchNumber}</td>
                      <td className="p-2 text-right">{i.quantity}</td>
                      <td className="p-2 text-right">₹{i.purchasePrice.toFixed(2)}</td>
                      <td className="p-2 text-right font-bold">₹{i.totalAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end gap-6 pt-2 font-bold text-slate-200">
                <div>Grand Total: ₹{selectedInvoice.grandTotal.toFixed(2)}</div>
                <div className="text-amber-400">Balance Due: ₹{selectedInvoice.balanceDue.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
