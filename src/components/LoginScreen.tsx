import React, { useState } from 'react';
import { ShieldCheck, Lock, User, KeyRound, Database, Sparkles, CheckCircle2 } from 'lucide-react';
import { User as UserType } from '../types/pharmacy';
import { storage } from '../services/storageService';

interface LoginScreenProps {
  onLoginSuccess: (user: UserType) => void;
  onReplayIntro?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onReplayIntro }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const users = storage.getUsers();
      const matched = users.find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase()
      );

      // Offline credentials check
      if (
        (username === 'admin' && password === 'admin123') ||
        (username === 'cashier' && password === 'cash123') ||
        (matched && password.length >= 4)
      ) {
        const loggedUser: UserType = matched || {
          id: username === 'admin' ? 'u1' : 'u2',
          username,
          fullName: username === 'admin' ? 'Dr. K. Srinivas Rao (Pharmacist)' : 'M. Ramesh (Billing Executive)',
          role: username === 'admin' ? 'admin' : 'cashier',
          phone: '+91 98490 12345',
          email: `${username}@sahasrapharma.local`,
          active: true,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };

        storage.addAuditLog(loggedUser.username, 'USER_LOGIN', 'Authentication', `Successful login: ${loggedUser.fullName} (${loggedUser.role})`);
        onLoginSuccess(loggedUser);
      } else {
        setError('Invalid credentials! Default: admin / admin123 or cashier / cash123');
      }
      setLoading(false);
    }, 300);
  };

  const setFastLogin = (userType: 'admin' | 'cashier') => {
    if (userType === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('cashier');
      setPassword('cash123');
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 flex flex-col justify-between p-6 select-none overflow-hidden">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* Top Windows Desktop Brand Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/assets/aistudio/Gemini_Generated_Image_vrowi9vrowi9vrow_a94fa424.png"
            alt="Sahasra Pharmacy"
            className="w-12 h-12 rounded-lg object-contain bg-white/95 p-1 border border-cyan-500/40 shadow-lg shadow-cyan-900/30"
          />
          <div>
            <h1 className="text-base font-bold text-slate-100 tracking-tight">
              SAHASRA PHARMACY BILLING SOFTWARE
            </h1>
            <p className="text-xs text-cyan-400 font-medium">
              Enterprise Pharmacy ERP · Windows 10/11 Edition
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full text-xs text-emerald-400 font-mono shadow-xs">
          <Database className="w-3.5 h-3.5" />
          <span>100% Offline SQLite Database Engine</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 max-w-md w-full mx-auto my-auto">
        <div className="bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl p-7 backdrop-blur-md">
          {/* Card Header with Branding */}
          <div className="text-center pb-5 border-b border-slate-800/80 mb-5">
            <div className="mb-3 max-w-[280px] mx-auto rounded-lg overflow-hidden border border-slate-800 bg-slate-950 p-1.5 shadow-md">
              <img
                src="/assets/aistudio/Gemini_Generated_Image_vrowi9vrowi9vrow_a94fa424.png"
                alt="Sahasra Pharmacy Logo"
                className="w-full h-24 object-contain rounded"
              />
            </div>
            <h2 className="text-base font-bold text-slate-100 tracking-tight">
              Sign In to Billing Terminal
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Protected Windows Desktop Local Workstation
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 mb-5 rounded bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username or Operator ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="admin or cashier"
                  className="w-full h-10 pl-9 pr-3 text-sm bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Terminal Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-10 pl-9 pr-3 text-sm bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Quick Demo Credentials Selector */}
            <div className="pt-1">
              <span className="text-[11px] text-slate-400 block mb-1.5">
                Quick Role Selector (Auto-fill credentials):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFastLogin('admin')}
                  className={`py-1.5 px-3 rounded text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors ${
                    username === 'admin'
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin / Owner</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFastLogin('cashier')}
                  className={`py-1.5 px-3 rounded text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors ${
                    username === 'cashier'
                      ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Cashier / Operator</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 mt-3 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-semibold text-sm rounded-lg shadow-lg shadow-cyan-950/50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Authenticating with SQLite Database...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Access Billing Terminal</span>
                </>
              )}
            </button>
          </form>

          {/* Database Specs Note & Replay Intro */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 text-center space-y-2">
            <p className="text-[11px] text-slate-400">
              Database Path: <span className="font-mono text-cyan-400">C:\SahasraPharmacy\Data\pharmacy.db</span>
            </p>
            <p className="text-[10px] text-emerald-400/90">
              Zero cloud latency · 100% offline security · Automatic daily backups
            </p>
            {onReplayIntro && (
              <button
                type="button"
                onClick={onReplayIntro}
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 hover:underline font-medium"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Replay Opening Intro Animation</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Developer Branding Footer */}
      <footer className="relative z-10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-4 gap-2">
        <div className="flex items-center gap-2">
          <img
            src="/src/assets/images/aadhya_solutions_logo_1794220461139.jpg"
            alt="Aadhya Software Solutions"
            referrerPolicy="no-referrer"
            className="w-6 h-6 rounded object-contain bg-white p-0.5"
          />
          <span className="text-slate-300 font-semibold tracking-wide">
            AADHYA SOFTWARE SOLUTIONS
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">
            Enterprise Pharmacy ERP Architecture
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-slate-400">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Standalone Windows Desktop EXE
          </span>
          <span className="text-slate-700">·</span>
          <span className="font-mono text-slate-400">v4.2.0 (Build 2026.11)</span>
        </div>
      </footer>
    </div>
  );
};
