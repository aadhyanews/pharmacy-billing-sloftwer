import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  DollarSign,
  Phone,
  Mail,
  FileText,
  X,
  CheckCircle2,
} from 'lucide-react';
import { storage } from '../services/storageService';
import { Supplier } from '../types/pharmacy';

export const SupplierManagementView: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(storage.getSuppliers());
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [payingSupplier, setPayingSupplier] = useState<Supplier | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'bank' | 'cash' | 'cheque'>('bank');
  const [paymentNotes, setPaymentNotes] = useState('');

  // New Supplier Form
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [drugLicenseNo, setDrugLicenseNo] = useState('');
  const [creditDays, setCreditDays] = useState(30);

  const refresh = () => {
    setSuppliers(storage.getSuppliers());
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      name: name.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      gstin: gstin.trim().toUpperCase(),
      drugLicenseNo: drugLicenseNo.trim(),
      balanceDue: 0,
      creditDays: Number(creditDays) || 30,
    };

    storage.saveSupplier(newSup);
    refresh();
    setShowAddModal(false);
    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
    setGstin('');
    setDrugLicenseNo('');
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingSupplier || paymentAmount <= 0) return;

    storage.recordSupplierPayment(
      payingSupplier.id,
      paymentAmount,
      paymentMode,
      paymentNotes || 'Supplier payment clearance'
    );
    refresh();
    setPayingSupplier(null);
    setPaymentAmount(0);
    setPaymentNotes('');
  };

  const totalOutstanding = suppliers.reduce((s, sup) => s + sup.balanceDue, 0);

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.gstin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery)
  );

  return (
    <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-5.5rem)] select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            Supplier & Pharmaceutical Distributor Directory
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Total {suppliers.length} authorized wholesale distributors with D.L. & GSTIN validation
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Supplier</span>
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400">Total Trade Payables (Supplier Outstanding)</span>
          <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
            ₹{totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="w-9 h-9 rounded bg-amber-950/60 text-amber-400 flex items-center justify-center">
          <DollarSign className="w-5 h-5" />
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center gap-3 text-xs">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search supplier name, contact person, phone or GSTIN..."
            className="w-full h-8 pl-8 pr-3 bg-slate-950 border border-slate-700 rounded text-slate-100 placeholder-slate-400 font-mono"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-slate-950 text-slate-400 text-[11px] font-semibold border-b border-slate-800">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Distributor Company</th>
              <th className="p-3">Contact Person & Phone</th>
              <th className="p-3">GSTIN & Drug License</th>
              <th className="p-3 text-center">Credit Period</th>
              <th className="p-3 text-right">Outstanding (₹)</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filtered.map((sup, idx) => (
              <tr key={sup.id} className="hover:bg-slate-850 transition-colors">
                <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                <td className="p-3">
                  <div className="font-bold text-slate-100">{sup.name}</div>
                  <div className="text-[11px] text-slate-400">{sup.address}</div>
                </td>
                <td className="p-3">
                  <div className="font-medium text-slate-200">{sup.contactPerson}</div>
                  <div className="text-[11px] text-cyan-300 font-mono">{sup.phone}</div>
                </td>
                <td className="p-3 font-mono text-[11px]">
                  <div className="text-slate-300">GST: {sup.gstin}</div>
                  <div className="text-slate-400">DL: {sup.drugLicenseNo}</div>
                </td>
                <td className="p-3 text-center font-mono">{sup.creditDays} Days</td>
                <td className="p-3 text-right font-mono font-bold text-sm">
                  <span className={sup.balanceDue > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                    ₹{sup.balanceDue.toFixed(2)}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => {
                      setPayingSupplier(sup);
                      setPaymentAmount(sup.balanceDue);
                    }}
                    disabled={sup.balanceDue <= 0}
                    className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-white rounded font-bold text-xs transition-colors"
                  >
                    Pay Supplier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full p-6 text-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm flex items-center gap-2 text-slate-100">
                <Building2 className="w-4 h-4 text-cyan-400" />
                Register New Wholesale Supplier
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="text-slate-300 block font-semibold mb-1">Company / Agency Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apollo Pharma Wholesale Distributors"
                  className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block font-semibold mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Venkatesh Babu"
                    className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block font-semibold mb-1">Phone / Mobile *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98480 11223"
                    className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block font-semibold mb-1">GSTIN Number *</label>
                  <input
                    type="text"
                    required
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="36AABCA1122K1Z1"
                    className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block font-semibold mb-1">Drug License (20B/21B)</label>
                  <input
                    type="text"
                    value={drugLicenseNo}
                    onChange={(e) => setDrugLicenseNo(e.target.value)}
                    placeholder="TG/HYD/20B/4412"
                    className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block font-semibold mb-1">Office / Warehouse Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Plot 42, IDA Kukatpally, Hyderabad"
                  className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {payingSupplier && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-6 text-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-cyan-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-cyan-400" />
                Record Supplier Payment
              </h3>
              <button onClick={() => setPayingSupplier(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 mt-4 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                <div className="font-bold text-slate-200">{payingSupplier.name}</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Current Due: <strong className="text-amber-400 font-mono">₹{payingSupplier.balanceDue.toFixed(2)}</strong>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block font-semibold mb-1">Payment Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  max={payingSupplier.balanceDue}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-emerald-400 font-bold font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block font-semibold mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full h-8 px-2 bg-slate-950 border border-slate-700 rounded text-slate-100"
                  >
                    <option value="bank">Bank / NEFT / RTGS</option>
                    <option value="cash">Cash (Counter)</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block font-semibold mb-1">Reference / Cheque No</label>
                  <input
                    type="text"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="e.g. UTR-982104"
                    className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPayingSupplier(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
