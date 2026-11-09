import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Trash2,
  Download,
  DollarSign,
  Calendar,
  X,
  CheckCircle2,
} from 'lucide-react';
import { storage } from '../services/storageService';
import { Expense, ExpenseCategory } from '../types/pharmacy';

export const ExpenseManagementView: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>(storage.getExpenses());
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [category, setCategory] = useState<ExpenseCategory>('Tea, Water & Refreshments');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(150);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'bank'>('cash');
  const [paidTo, setPaidTo] = useState('');

  const refresh = () => {
    setExpenses(storage.getExpenses());
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0) return;

    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      category,
      description: description.trim(),
      amount: Number(amount),
      paymentMode,
      paidTo: paidTo.trim() || 'Counter Petty Cash',
      recordedBy: 'M. Ramesh',
    };

    storage.addExpense(newExp);
    refresh();
    setShowAddModal(false);
    setDescription('');
    setAmount(150);
    setPaidTo('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this expense voucher?')) {
      storage.deleteExpense(id);
      refresh();
    }
  };

  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);

  const handleExportCSV = () => {
    let csv = 'ID,Date,Category,Description,Amount,Mode,Paid To,Recorded By\n';
    expenses.forEach((e) => {
      csv += `"${e.id}","${e.date}","${e.category}","${e.description}",${e.amount},"${e.paymentMode}","${e.paidTo}","${e.recordedBy}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SahasraPharmacy_Expenses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-5.5rem)] select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-cyan-400" />
            Shop Expense & Petty Cash Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log shop rent, utilities, staff salaries, packaging materials and daily miscellaneous expenditures
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Expense</span>
          </button>
        </div>
      </div>

      {/* Summary KPI */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400">Total Operating Expenses Logged</span>
          <div className="text-xl font-bold font-mono text-rose-400 mt-0.5">
            ₹{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Vouchers: <strong className="text-slate-200">{expenses.length}</strong>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950 text-slate-400 text-[11px] font-semibold border-b border-slate-800">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3 font-sans">Expense Category</th>
              <th className="p-3 font-sans">Description & Purpose</th>
              <th className="p-3 font-sans">Paid To</th>
              <th className="p-3 text-center font-sans">Mode</th>
              <th className="p-3 text-right">Amount (₹)</th>
              <th className="p-3 font-sans">Recorded By</th>
              <th className="p-3 text-center font-sans">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {expenses.map((exp) => (
              <tr key={exp.id} className="hover:bg-slate-850">
                <td className="p-3 text-slate-400">{exp.date}</td>
                <td className="p-3 font-sans font-bold text-slate-100">{exp.category}</td>
                <td className="p-3 font-sans text-slate-300">{exp.description}</td>
                <td className="p-3 font-sans text-slate-400">{exp.paidTo}</td>
                <td className="p-3 text-center font-sans uppercase text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {exp.paymentMode}
                  </span>
                </td>
                <td className="p-3 text-right font-bold text-rose-400 text-sm">
                  ₹{exp.amount.toFixed(2)}
                </td>
                <td className="p-3 font-sans text-slate-400 text-[11px]">{exp.recordedBy}</td>
                <td className="p-3 text-center font-sans">
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-6 text-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm flex items-center gap-2 text-slate-100">
                <Wallet className="w-4 h-4 text-cyan-400" />
                Record Shop Expense Voucher
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="text-slate-300 block font-semibold mb-1">Expense Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full h-8 px-2 bg-slate-950 border border-slate-700 rounded text-slate-100"
                >
                  <option value="Store Rent">Store Rent</option>
                  <option value="Electricity & Utilities">Electricity & Utilities</option>
                  <option value="Staff Salaries">Staff Salaries</option>
                  <option value="Packing Bags & Thermal Rolls">Packing Bags & Thermal Rolls</option>
                  <option value="Tea, Water & Refreshments">Tea, Water & Refreshments</option>
                  <option value="Courier & Freight">Courier & Freight</option>
                  <option value="Maintenance & Cleaning">Maintenance & Cleaning</option>
                  <option value="Software & IT">Software & IT</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block font-semibold mb-1">Purpose / Description *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 5 rolls 80mm thermal paper + carry bags"
                  className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block font-semibold mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-rose-400 font-bold font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block font-semibold mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full h-8 px-2 bg-slate-950 border border-slate-700 rounded text-slate-100"
                  >
                    <option value="cash">Cash (Counter)</option>
                    <option value="upi">UPI / Online</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block font-semibold mb-1">Paid To / Vendor</label>
                <input
                  type="text"
                  value={paidTo}
                  onChange={(e) => setPaidTo(e.target.value)}
                  placeholder="e.g. Sri Krishna Paper Mart"
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
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Expense</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
