import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  DollarSign,
  Calendar,
  X,
  CheckCircle2,
  Stethoscope,
} from 'lucide-react';
import { storage } from '../services/storageService';
import { Customer } from '../types/pharmacy';

export const CustomerManagementView: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(storage.getCustomers());
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [recoveringCustomer, setRecoveringCustomer] = useState<Customer | null>(null);
  const [recoveryAmount, setRecoveryAmount] = useState<number>(0);
  const [recoveryMode, setRecoveryMode] = useState<'cash' | 'upi'>('cash');

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [creditLimit, setCreditLimit] = useState(5000);

  const refresh = () => {
    setCustomers(storage.getCustomers());
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      doctorName: doctorName.trim(),
      creditBalance: 0,
      creditLimit: Number(creditLimit) || 3000,
      totalPurchases: 0,
      lastVisitDate: new Date().toISOString().split('T')[0],
    };

    storage.saveCustomer(newCust);
    refresh();
    setShowAddModal(false);
    setName('');
    setPhone('');
    setAddress('');
    setDoctorName('');
  };

  const handleCollectCredit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveringCustomer || recoveryAmount <= 0) return;

    storage.recordCustomerCreditPayment(recoveringCustomer.id, recoveryAmount, recoveryMode);
    refresh();
    setRecoveringCustomer(null);
    setRecoveryAmount(0);
  };

  const totalCreditDue = customers.reduce((s, c) => s + c.creditBalance, 0);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.doctorName && c.doctorName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-5.5rem)] select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Customer & Patient Master (Credit Book)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Total {customers.length} registered patients, chronic medication histories & credit tracking
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Credit Metric Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400">Total Customer Credit Outstanding</span>
          <div className="text-xl font-bold font-mono text-purple-300 mt-0.5">
            ₹{totalCreditDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="w-9 h-9 rounded bg-purple-950/60 text-purple-400 flex items-center justify-center">
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
            placeholder="Search patient name, mobile phone or consulting doctor..."
            className="w-full h-8 pl-8 pr-3 bg-slate-950 border border-slate-700 rounded text-slate-100 placeholder-slate-400 font-mono"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-slate-950 text-slate-400 text-[11px] font-semibold border-b border-slate-800">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Patient / Customer Name</th>
              <th className="p-3">Mobile Contact</th>
              <th className="p-3">Consulting Doctor</th>
              <th className="p-3 text-right">Lifetime Purchases</th>
              <th className="p-3 text-right">Credit Balance (₹)</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filtered.map((c, idx) => (
              <tr key={c.id} className="hover:bg-slate-850 transition-colors">
                <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                <td className="p-3">
                  <div className="font-bold text-slate-100">{c.name}</div>
                  <div className="text-[11px] text-slate-400">{c.address}</div>
                </td>
                <td className="p-3 text-cyan-300 font-mono">{c.phone}</td>
                <td className="p-3 text-slate-300">
                  {c.doctorName ? (
                    <span className="flex items-center gap-1">
                      <Stethoscope className="w-3 h-3 text-slate-400" />
                      {c.doctorName}
                    </span>
                  ) : (
                    <span className="text-slate-500 italic">Direct / OTC</span>
                  )}
                </td>
                <td className="p-3 text-right font-mono font-bold text-slate-300">
                  ₹{c.totalPurchases.toFixed(2)}
                </td>
                <td className="p-3 text-right font-mono font-bold text-sm">
                  <span className={c.creditBalance > 0 ? 'text-purple-300' : 'text-slate-400'}>
                    ₹{c.creditBalance.toFixed(2)}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => {
                      setRecoveringCustomer(c);
                      setRecoveryAmount(c.creditBalance);
                    }}
                    disabled={c.creditBalance <= 0}
                    className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-white rounded font-bold text-xs transition-colors"
                  >
                    Collect Credit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-6 text-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm flex items-center gap-2 text-slate-100">
                <Users className="w-4 h-4 text-cyan-400" />
                Add Patient / Customer Record
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="text-slate-300 block font-semibold mb-1">Customer / Patient Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. P. Venkat Reddy"
                  className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block font-semibold mb-1">Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9849123456"
                    className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block font-semibold mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 5000)}
                    className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block font-semibold mb-1">Address / Locality</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. H.No 3-4-12, KPHB Colony, Hyderabad"
                  className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-300 block font-semibold mb-1">Consulting Doctor Name</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. C. Mohan Rao (MD)"
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
                  Save Patient Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collect Credit Modal */}
      {recoveringCustomer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-6 text-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-cyan-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-cyan-400" />
                Collect Customer Credit Due
              </h3>
              <button onClick={() => setRecoveringCustomer(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCollectCredit} className="space-y-3.5 mt-4 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                <div className="font-bold text-slate-200">{recoveringCustomer.name}</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Current Balance: <strong className="text-purple-300 font-mono">₹{recoveringCustomer.creditBalance.toFixed(2)}</strong>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block font-semibold mb-1">Amount Received (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  max={recoveringCustomer.creditBalance}
                  required
                  value={recoveryAmount}
                  onChange={(e) => setRecoveryAmount(parseFloat(e.target.value) || 0)}
                  className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-emerald-400 font-bold font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-slate-300 block font-semibold mb-1">Receipt Mode</label>
                <select
                  value={recoveryMode}
                  onChange={(e) => setRecoveryMode(e.target.value as any)}
                  className="w-full h-8 px-2 bg-slate-950 border border-slate-700 rounded text-slate-100"
                >
                  <option value="cash">Cash (Counter)</option>
                  <option value="upi">UPI (Instant VPA)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRecoveringCustomer(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Record Credit Clearance</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
