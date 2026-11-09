import React, { useState } from 'react';
import {
  UserCheck,
  ShieldCheck,
  User,
  Plus,
  KeyRound,
  History,
  Lock,
  X,
  CheckCircle2,
} from 'lucide-react';
import { storage } from '../services/storageService';
import { User as UserType, AuditLog } from '../types/pharmacy';

export const UserManagementView: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>(storage.getUsers());
  const [auditLogs] = useState<AuditLog[]>(storage.getAuditLogs());
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'admin' | 'cashier'>('cashier');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const refresh = () => {
    setUsers(storage.getUsers());
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !fullName.trim()) return;

    const newUser: UserType = {
      id: `u-${Date.now()}`,
      username: username.trim().toLowerCase(),
      fullName: fullName.trim(),
      role,
      phone: phone.trim(),
      email: email.trim(),
      active: true,
      createdAt: new Date().toISOString(),
      lastLogin: undefined,
    };

    storage.saveUser(newUser);
    refresh();
    setShowAddModal(false);
    setUsername('');
    setFullName('');
    setPhone('');
    setEmail('');
  };

  return (
    <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-5.5rem)] select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-cyan-400" />
            User Access Security & RBAC Permissions
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Role-based operator controls (Admin Pharmacist vs Cashier) and security audit logs
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Operator Account</span>
        </button>
      </div>

      {/* Users List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-3">
        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Active Workstation Accounts
        </h3>

        <div className="border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950 text-slate-400 text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Operator Name</th>
                <th className="p-3 font-mono">Username</th>
                <th className="p-3">Role & Permissions</th>
                <th className="p-3 font-mono">Contact Phone</th>
                <th className="p-3 font-mono">Last Terminal Login</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-850">
                  <td className="p-3 font-bold text-slate-100">{u.fullName}</td>
                  <td className="p-3 font-mono text-cyan-300">{u.username}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        u.role === 'admin'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                          : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80'
                      }`}
                    >
                      {u.role === 'admin' ? 'Administrator (Full Access)' : 'Cashier (Billing POS Only)'}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-400">{u.phone}</td>
                  <td className="p-3 font-mono text-slate-400">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleString('en-IN') : 'Never'}
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 text-[10px] font-bold">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Audit Trail */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-3">
        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          System Security & Transaction Audit Trail
        </h3>

        <div className="border border-slate-800 rounded-lg overflow-hidden max-h-72 overflow-y-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 text-[11px] font-semibold border-b border-slate-800 sticky top-0">
              <tr>
                <th className="p-2.5">Timestamp</th>
                <th className="p-2.5 font-sans">User</th>
                <th className="p-2.5">Action Code</th>
                <th className="p-2.5 font-sans">ERP Module</th>
                <th className="p-2.5 font-sans">Audit Activity Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-850">
                  <td className="p-2.5 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="p-2.5 font-sans font-bold text-cyan-300">{log.userName}</td>
                  <td className="p-2.5 font-bold text-amber-400">{log.action}</td>
                  <td className="p-2.5 font-sans text-slate-300">{log.module}</td>
                  <td className="p-2.5 font-sans text-slate-200">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-6 text-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm flex items-center gap-2 text-slate-100">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                Add New Terminal Operator
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="text-slate-300 block font-semibold mb-1">Full Operator Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. K. Suresh Kumar"
                  className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block font-semibold mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="suresh"
                    className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block font-semibold mb-1">Role / Access Level</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full h-8 px-2 bg-slate-950 border border-slate-700 rounded text-slate-100"
                  >
                    <option value="cashier">Cashier (Billing POS)</option>
                    <option value="admin">Administrator (Full Access)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98490..."
                    className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="suresh@pharma.local"
                    className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-400">
                Initial temporary password will be set to: <strong className="font-mono text-cyan-300">pass123</strong>
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
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
