import React, { useState } from 'react';
import {
  Pill,
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  Filter,
  CheckCircle2,
  Layers,
  MapPin,
  X,
} from 'lucide-react';
import { Medicine, MedicineBatch, MedicineCategory, ScheduleCategory } from '../types/pharmacy';
import { storage } from '../services/storageService';

export const MedicineManagementView: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>(storage.getMedicines());
  const [batches, setBatches] = useState<MedicineBatch[]>(storage.getBatches());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [scheduleFilter, setScheduleFilter] = useState<string>('all');

  // Modals
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);
  const [viewingBatchesMed, setViewingBatchesMed] = useState<Medicine | null>(null);
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);

  // New Medicine Form State
  const [brandName, setBrandName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [composition, setComposition] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [category, setCategory] = useState<MedicineCategory>('Tablets');
  const [schedule, setSchedule] = useState<ScheduleCategory>('Schedule H');
  const [hsnCode, setHsnCode] = useState('30049099');
  const [rackLocation, setRackLocation] = useState('RACK-A1 / SHELF-1');
  const [minStockAlert, setMinStockAlert] = useState(25);
  const [unit, setUnit] = useState('Strip (10 tabs)');
  const [description, setDescription] = useState('');

  // New Batch Form State
  const [newBatchNum, setNewBatchNum] = useState('');
  const [newBatchExp, setNewBatchExp] = useState('2028-06');
  const [newBatchMrp, setNewBatchMrp] = useState(120);
  const [newBatchPurPrice, setNewBatchPurPrice] = useState(80);
  const [newBatchSellPrice, setNewBatchSellPrice] = useState(110);
  const [newBatchGst, setNewBatchGst] = useState(12);
  const [newBatchStock, setNewBatchStock] = useState(50);
  const [newBatchBarcode, setNewBatchBarcode] = useState('');

  const refresh = () => {
    setMedicines(storage.getMedicines());
    setBatches(storage.getBatches());
  };

  const handleOpenAddMed = () => {
    setEditingMed(null);
    setBrandName('');
    setGenericName('');
    setComposition('');
    setManufacturer('');
    setCategory('Tablets');
    setSchedule('Schedule H');
    setHsnCode('30049099');
    setRackLocation('RACK-A1');
    setMinStockAlert(25);
    setUnit('Strip (10 tabs)');
    setDescription('');
    setShowAddMedModal(true);
  };

  const handleOpenEditMed = (med: Medicine) => {
    setEditingMed(med);
    setBrandName(med.brandName);
    setGenericName(med.genericName);
    setComposition(med.composition);
    setManufacturer(med.manufacturer);
    setCategory(med.category);
    setSchedule(med.schedule);
    setHsnCode(med.hsnCode);
    setRackLocation(med.rackLocation);
    setMinStockAlert(med.minStockAlert);
    setUnit(med.unit);
    setDescription(med.description || '');
    setShowAddMedModal(true);
  };

  const handleSaveMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;

    const med: Medicine = {
      id: editingMed ? editingMed.id : `med-${Date.now()}`,
      brandName: brandName.trim(),
      genericName: genericName.trim(),
      composition: composition.trim(),
      manufacturer: manufacturer.trim(),
      category,
      schedule,
      hsnCode: hsnCode.trim(),
      rackLocation: rackLocation.trim(),
      minStockAlert: Number(minStockAlert) || 20,
      unit: unit.trim(),
      description: description.trim(),
    };

    storage.saveMedicine(med);
    refresh();
    setShowAddMedModal(false);
  };

  const handleDeleteMedicine = (id: string) => {
    if (confirm('Are you sure you want to delete this medicine and all associated batches?')) {
      storage.deleteMedicine(id);
      refresh();
    }
  };

  // Add Batch
  const handleSaveBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingBatchesMed || !newBatchNum.trim()) return;

    const batch: MedicineBatch = {
      id: `b-${Date.now()}`,
      medicineId: viewingBatchesMed.id,
      batchNumber: newBatchNum.trim().toUpperCase(),
      expiryDate: newBatchExp,
      mrp: Number(newBatchMrp),
      purchasePrice: Number(newBatchPurPrice),
      sellingPrice: Number(newBatchSellPrice),
      gstRate: Number(newBatchGst),
      currentStock: Number(newBatchStock),
      barcode: newBatchBarcode.trim() || `890${Math.floor(100000000 + Math.random() * 900000000)}`,
      supplierId: 'sup-1',
      purchaseDate: new Date().toISOString().split('T')[0],
    };

    storage.saveBatch(batch);
    refresh();
    setShowAddBatchModal(false);
    setNewBatchNum('');
  };

  // Export to CSV
  const handleExportCSV = () => {
    let csv = 'ID,Brand Name,Generic Name,Manufacturer,Category,Schedule,HSN,Rack Location,Min Stock,Current Stock\n';
    medicines.forEach((m) => {
      const totalStock = batches
        .filter((b) => b.medicineId === m.id)
        .reduce((sum, b) => sum + b.currentStock, 0);
      csv += `"${m.id}","${m.brandName}","${m.genericName}","${m.manufacturer}","${m.category}","${m.schedule}","${m.hsnCode}","${m.rackLocation}",${m.minStockAlert},${totalStock}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SahasraPharmacy_MedicineMaster_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filtered List
  const filtered = medicines.filter((m) => {
    const matchesSearch =
      m.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.composition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.rackLocation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || m.category === categoryFilter;
    const matchesSchedule = scheduleFilter === 'all' || m.schedule === scheduleFilter;

    return matchesSearch && matchesCategory && matchesSchedule;
  });

  return (
    <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-5.5rem)] select-none">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Pill className="w-5 h-5 text-cyan-400" />
            Medicine Master & Formulations Catalog
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Total {medicines.length} registered pharmaceutical formulations with rack locator
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAddMed}
            className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Medicine</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medicine brand, generic composition or rack location..."
            className="w-full h-8 pl-8 pr-3 bg-slate-950 border border-slate-700 rounded text-slate-100 placeholder-slate-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-8 px-2 bg-slate-950 border border-slate-700 rounded text-slate-200"
          >
            <option value="all">All Categories</option>
            <option value="Tablets">Tablets</option>
            <option value="Capsules">Capsules</option>
            <option value="Syrups">Syrups</option>
            <option value="Injections">Injections</option>
            <option value="Ointments">Ointments</option>
            <option value="Medical Equipment">Medical Equipment</option>
          </select>

          <select
            value={scheduleFilter}
            onChange={(e) => setScheduleFilter(e.target.value)}
            className="h-8 px-2 bg-slate-950 border border-slate-700 rounded text-slate-200"
          >
            <option value="all">All Schedules</option>
            <option value="OTC">OTC</option>
            <option value="Schedule H">Schedule H</option>
            <option value="Schedule H1">Schedule H1</option>
            <option value="Schedule X">Schedule X</option>
          </select>
        </div>
      </div>

      {/* Medicines Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 text-[11px] font-semibold border-b border-slate-800">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Brand Name</th>
              <th className="p-3">Generic & Composition</th>
              <th className="p-3">Manufacturer</th>
              <th className="p-3">Category</th>
              <th className="p-3">Rack Locator</th>
              <th className="p-3 text-center">Batches</th>
              <th className="p-3 text-right">Total Stock</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans text-slate-200">
            {filtered.map((med, idx) => {
              const medBatches = batches.filter((b) => b.medicineId === med.id);
              const totalStock = medBatches.reduce((s, b) => s + b.currentStock, 0);

              return (
                <tr key={med.id} className="hover:bg-slate-850 transition-colors">
                  <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                  <td className="p-3">
                    <div className="font-bold text-slate-100 flex items-center gap-1.5">
                      <span>{med.brandName}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                        {med.schedule}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">HSN: {med.hsnCode}</div>
                  </td>
                  <td className="p-3">
                    <div className="text-slate-300 font-medium">{med.genericName}</div>
                    <div className="text-[10px] text-slate-400">{med.composition}</div>
                  </td>
                  <td className="p-3 text-slate-400">{med.manufacturer}</td>
                  <td className="p-3 text-slate-300">{med.category}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 text-cyan-300 font-mono text-[11px] bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/50">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      {med.rackLocation}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setViewingBatchesMed(med)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs border border-slate-700 transition-colors"
                    >
                      {medBatches.length} Batches
                    </button>
                  </td>
                  <td className="p-3 text-right font-mono font-bold">
                    <span
                      className={
                        totalStock <= med.minStockAlert ? 'text-amber-400' : 'text-emerald-400'
                      }
                    >
                      {totalStock} {med.unit.split(' ')[0]}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEditMed(med)}
                        title="Edit Medicine"
                        className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMedicine(med.id)}
                        title="Delete Medicine"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Medicine Modal */}
      {showAddMedModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-xl w-full p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Pill className="w-4 h-4 text-cyan-400" />
                {editingMed ? 'Edit Medicine Master' : 'Add New Medicine Formulation'}
              </h3>
              <button
                onClick={() => setShowAddMedModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMedicine} className="space-y-3.5 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Dolo 650 Tablet"
                    className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Generic Formula *</label>
                  <input
                    type="text"
                    required
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    placeholder="e.g. Paracetamol 650mg"
                    className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Composition</label>
                <input
                  type="text"
                  value={composition}
                  onChange={(e) => setComposition(e.target.value)}
                  placeholder="e.g. Paracetamol IP 650 mg"
                  className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Manufacturer *</label>
                  <input
                    type="text"
                    required
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    placeholder="e.g. Micro Labs Ltd"
                    className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MedicineCategory)}
                    className="w-full h-8 px-2 bg-slate-950 border border-slate-700 rounded text-slate-100"
                  >
                    <option value="Tablets">Tablets</option>
                    <option value="Capsules">Capsules</option>
                    <option value="Syrups">Syrups</option>
                    <option value="Injections">Injections</option>
                    <option value="Ointments">Ointments</option>
                    <option value="Medical Equipment">Medical Equipment</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Drug Schedule</label>
                  <select
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value as ScheduleCategory)}
                    className="w-full h-8 px-2 bg-slate-950 border border-slate-700 rounded text-slate-100"
                  >
                    <option value="OTC">OTC</option>
                    <option value="Schedule H">Schedule H</option>
                    <option value="Schedule H1">Schedule H1</option>
                    <option value="Schedule X">Schedule X</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">HSN Code</label>
                  <input
                    type="text"
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min Stock Alert</label>
                  <input
                    type="number"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(parseInt(e.target.value) || 10)}
                    className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Rack / Shelf Location *</label>
                  <input
                    type="text"
                    required
                    value={rackLocation}
                    onChange={(e) => setRackLocation(e.target.value)}
                    placeholder="e.g. RACK-A1 / SHELF-2"
                    className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Packing Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. Strip (15 tabs)"
                    className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold shadow-sm"
                >
                  Save Formulation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batches Manager Drawer / Modal */}
      {viewingBatchesMed && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full p-6 text-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div>
                <h3 className="font-bold text-sm text-cyan-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Batches for: {viewingBatchesMed.brandName}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Rack: {viewingBatchesMed.rackLocation} · HSN: {viewingBatchesMed.hsnCode}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddBatchModal(true)}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Batch</span>
                </button>
                <button
                  onClick={() => setViewingBatchesMed(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mt-4">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="p-2.5">Batch #</th>
                    <th className="p-2.5">Expiry</th>
                    <th className="p-2.5 text-right">Cost</th>
                    <th className="p-2.5 text-right">Selling Rate</th>
                    <th className="p-2.5 text-right">MRP</th>
                    <th className="p-2.5 text-center">GST%</th>
                    <th className="p-2.5 text-right">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {batches
                    .filter((b) => b.medicineId === viewingBatchesMed.id)
                    .map((b) => (
                      <tr key={b.id} className="hover:bg-slate-850">
                        <td className="p-2.5 font-bold text-cyan-300">{b.batchNumber}</td>
                        <td className="p-2.5">{b.expiryDate}</td>
                        <td className="p-2.5 text-right text-slate-400">₹{b.purchasePrice.toFixed(2)}</td>
                        <td className="p-2.5 text-right font-bold text-slate-100">₹{b.sellingPrice.toFixed(2)}</td>
                        <td className="p-2.5 text-right text-slate-400">₹{b.mrp.toFixed(2)}</td>
                        <td className="p-2.5 text-center">{b.gstRate}%</td>
                        <td className="p-2.5 text-right font-bold text-emerald-400">{b.currentStock}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Quick Add Batch Sub-Modal */}
            {showAddBatchModal && (
              <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-lg">
                <h4 className="font-bold text-xs text-slate-200 mb-3">Add Inward Batch Stock</h4>
                <form onSubmit={handleSaveBatch} className="grid grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <label className="text-slate-400 text-[11px] block">Batch Number *</label>
                    <input
                      type="text"
                      required
                      value={newBatchNum}
                      onChange={(e) => setNewBatchNum(e.target.value)}
                      placeholder="e.g. BTH-8842"
                      className="w-full h-7 px-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px] block">Expiry (YYYY-MM) *</label>
                    <input
                      type="text"
                      required
                      value={newBatchExp}
                      onChange={(e) => setNewBatchExp(e.target.value)}
                      placeholder="2028-06"
                      className="w-full h-7 px-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px] block">Barcode / EAN</label>
                    <input
                      type="text"
                      value={newBatchBarcode}
                      onChange={(e) => setNewBatchBarcode(e.target.value)}
                      placeholder="890123..."
                      className="w-full h-7 px-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px] block">Cost Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newBatchPurPrice}
                      onChange={(e) => setNewBatchPurPrice(parseFloat(e.target.value) || 0)}
                      className="w-full h-7 px-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px] block">Selling Rate (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newBatchSellPrice}
                      onChange={(e) => setNewBatchSellPrice(parseFloat(e.target.value) || 0)}
                      className="w-full h-7 px-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px] block">MRP (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newBatchMrp}
                      onChange={(e) => setNewBatchMrp(parseFloat(e.target.value) || 0)}
                      className="w-full h-7 px-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px] block">GST Rate (%)</label>
                    <select
                      value={newBatchGst}
                      onChange={(e) => setNewBatchGst(parseInt(e.target.value) || 12)}
                      className="w-full h-7 px-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
                    >
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px] block">Stock Qty *</label>
                    <input
                      type="number"
                      required
                      value={newBatchStock}
                      onChange={(e) => setNewBatchStock(parseInt(e.target.value) || 0)}
                      className="w-full h-7 px-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      type="submit"
                      className="flex-1 h-7 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold"
                    >
                      Save Batch
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddBatchModal(false)}
                      className="px-2 h-7 bg-slate-800 text-slate-300 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
