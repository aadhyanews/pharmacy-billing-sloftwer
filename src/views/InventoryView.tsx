import React, { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  Clock,
  Skull,
  Download,
  Search,
  Filter,
  DollarSign,
  Package,
} from 'lucide-react';
import { storage } from '../services/storageService';
import { MedicineBatch, Medicine } from '../types/pharmacy';

export const InventoryView: React.FC = () => {
  const [medicines] = useState<Medicine[]>(storage.getMedicines());
  const [batches] = useState<MedicineBatch[]>(storage.getBatches());
  const [activeTab, setActiveTab] = useState<'all' | 'low_stock' | 'near_expiry' | 'expired'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const currentYM = '2026-11';
  const nearExpiryThresholds = ['2026-11', '2026-12', '2027-01', '2027-02'];

  // Total valuation
  const totalCostVal = batches.reduce((s, b) => s + b.currentStock * b.purchasePrice, 0);
  const totalMrpVal = batches.reduce((s, b) => s + b.currentStock * b.mrp, 0);
  const totalUnits = batches.reduce((s, b) => s + b.currentStock, 0);

  // Filter batches
  const enrichedBatches = batches.map((b) => {
    const med = medicines.find((m) => m.id === b.medicineId);
    const isExpired = b.expiryDate < currentYM;
    const isNearExpiry = b.expiryDate >= currentYM && nearExpiryThresholds.includes(b.expiryDate);
    const isLowStock = b.currentStock <= (med?.minStockAlert || 20);

    return {
      ...b,
      brandName: med?.brandName || 'Unknown Medicine',
      genericName: med?.genericName || '',
      rackLocation: med?.rackLocation || 'Unassigned',
      category: med?.category || 'Tablets',
      minAlert: med?.minStockAlert || 20,
      isExpired,
      isNearExpiry,
      isLowStock,
    };
  });

  const filtered = enrichedBatches.filter((item) => {
    const matchSearch =
      item.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.barcode.includes(searchQuery) ||
      item.rackLocation.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;

    if (activeTab === 'low_stock') return item.isLowStock;
    if (activeTab === 'near_expiry') return item.isNearExpiry;
    if (activeTab === 'expired') return item.isExpired;
    return true;
  });

  const handleExportCSV = () => {
    let csv = 'Batch No,Brand Name,Generic,Rack Location,Barcode,Expiry,Cost Price,MRP,Selling Rate,Stock,Total Cost Value\n';
    filtered.forEach((b) => {
      csv += `"${b.batchNumber}","${b.brandName}","${b.genericName}","${b.rackLocation}","${b.barcode}","${b.expiryDate}",${b.purchasePrice},${b.mrp},${b.sellingPrice},${b.currentStock},${(b.currentStock * b.purchasePrice).toFixed(2)}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SahasraPharmacy_InventoryStock_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-5.5rem)] select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-cyan-400" />
            Inventory Valuation & Batch Stock Control
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            FEFO batch tracking, expiry monitoring and warehouse rack management
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold border border-slate-700 flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Inventory Register</span>
        </button>
      </div>

      {/* Valuation Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Stock Valuation (Cost Price)</span>
            <div className="text-lg font-bold text-slate-100 font-mono mt-0.5">
              ₹{totalCostVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-9 h-9 rounded bg-cyan-950/60 text-cyan-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Stock Valuation (Retail MRP)</span>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
              ₹{totalMrpVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-9 h-9 rounded bg-emerald-950/60 text-emerald-400 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Total Units in Stock</span>
            <div className="text-lg font-bold text-slate-100 font-mono mt-0.5">
              {totalUnits} Units
            </div>
          </div>
          <div className="w-9 h-9 rounded bg-indigo-950/60 text-indigo-400 flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 font-semibold rounded transition-colors ${
              activeTab === 'all'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Batches ({batches.length})
          </button>
          <button
            onClick={() => setActiveTab('low_stock')}
            className={`px-3 py-1 font-semibold rounded flex items-center gap-1.5 transition-colors ${
              activeTab === 'low_stock'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock</span>
          </button>
          <button
            onClick={() => setActiveTab('near_expiry')}
            className={`px-3 py-1 font-semibold rounded flex items-center gap-1.5 transition-colors ${
              activeTab === 'near_expiry'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-orange-400 hover:text-orange-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Near Expiry</span>
          </button>
          <button
            onClick={() => setActiveTab('expired')}
            className={`px-3 py-1 font-semibold rounded flex items-center gap-1.5 transition-colors ${
              activeTab === 'expired'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-400 hover:text-rose-300'
            }`}
          >
            <Skull className="w-3.5 h-3.5" />
            <span>Expired</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by brand, batch #, barcode or rack..."
            className="w-full h-8 pl-8 pr-3 bg-slate-950 border border-slate-700 rounded text-slate-100 placeholder-slate-400 font-mono text-xs"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Inventory Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950 text-slate-400 text-[11px] font-semibold border-b border-slate-800">
            <tr>
              <th className="p-3">Batch Number</th>
              <th className="p-3 font-sans">Medicine Brand</th>
              <th className="p-3">Expiry Date</th>
              <th className="p-3">Rack Location</th>
              <th className="p-3 text-right">Cost Price</th>
              <th className="p-3 text-right">MRP</th>
              <th className="p-3 text-right">Selling Price</th>
              <th className="p-3 text-center">GST</th>
              <th className="p-3 text-right">Stock Qty</th>
              <th className="p-3 text-right">Cost Value</th>
              <th className="p-3 text-center font-sans">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-850 transition-colors">
                <td className="p-3 font-bold text-cyan-300">{item.batchNumber}</td>
                <td className="p-3 font-sans">
                  <div className="font-bold text-slate-100">{item.brandName}</div>
                  <div className="text-[10px] text-slate-400">{item.genericName}</div>
                </td>
                <td className="p-3">
                  <span
                    className={
                      item.isExpired
                        ? 'text-rose-400 font-bold'
                        : item.isNearExpiry
                        ? 'text-orange-400 font-bold'
                        : 'text-slate-300'
                    }
                  >
                    {item.expiryDate}
                  </span>
                </td>
                <td className="p-3 text-cyan-300">{item.rackLocation}</td>
                <td className="p-3 text-right text-slate-400">₹{item.purchasePrice.toFixed(2)}</td>
                <td className="p-3 text-right text-slate-400">₹{item.mrp.toFixed(2)}</td>
                <td className="p-3 text-right font-bold text-slate-100">₹{item.sellingPrice.toFixed(2)}</td>
                <td className="p-3 text-center text-slate-400">{item.gstRate}%</td>
                <td className="p-3 text-right font-bold">
                  <span className={item.isLowStock ? 'text-amber-400' : 'text-emerald-400'}>
                    {item.currentStock}
                  </span>
                </td>
                <td className="p-3 text-right font-bold text-slate-100">
                  ₹{(item.currentStock * item.purchasePrice).toFixed(2)}
                </td>
                <td className="p-3 text-center font-sans">
                  {item.isExpired ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800/80">
                      Expired
                    </span>
                  ) : item.isNearExpiry ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-950/80 text-orange-300 border border-orange-800/80">
                      Near Expiry
                    </span>
                  ) : item.isLowStock ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/80">
                      Low Stock
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                      Optimal
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
