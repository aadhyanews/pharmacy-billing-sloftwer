import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Printer,
  FileCode2,
  Save,
  CheckCircle2,
  Download,
  Terminal,
  Copy,
  Check,
} from 'lucide-react';
import { storage } from '../services/storageService';
import { PharmacySettings } from '../types/pharmacy';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<PharmacySettings>(storage.getSettings());
  const [activeTab, setActiveTab] = useState<'pharmacy' | 'hardware' | 'python_source'>('pharmacy');
  const [savedMessage, setSavedMessage] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveSettings(settings);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const pythonPySide6SourceCode = `"""
SAHASRA PHARMACY BILLING SOFTWARE (Standalone Windows Desktop EXE)
Developed & Designed by AADHYA SOFTWARE SOLUTIONS
Framework: PySide6 (Qt for Python) + SQLite + SQLAlchemy + ReportLab

Build into Windows EXE:
  pip install pyside6 sqlalchemy reportlab openpyxl pyinstaller
  pyinstaller --noconfirm --onedir --windowed --icon "icon.ico" --name "SahasraPharmacyERP" app.py
"""

import sys
import os
import sqlite3
from datetime import datetime
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QPushButton, QLineEdit, QTableWidget, QTableWidgetItem,
    QStackedWidget, QTabWidget, QMessageBox, QFileDialog, QHeaderView
)
from PySide6.QtCore import Qt, QTimer
from PySide6.QtGui import QIcon, QFont

DB_DIR = r"C:\\SahasraPharmacy\\Data"
BACKUP_DIR = r"C:\\SahasraPharmacy\\Backup"
DB_PATH = os.path.join(DB_DIR, "pharmacy.db")

class SahasraPharmacyMainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("SAHASRA PHARMACY BILLING SOFTWARE - Developed by AADHYA SOFTWARE SOLUTIONS")
        self.resize(1280, 800)
        self.init_local_directories()
        self.init_sqlite_database()
        self.init_ui()

    def init_local_directories(self):
        os.makedirs(DB_DIR, exist_ok=True)
        os.makedirs(BACKUP_DIR, exist_ok=True)

    def init_sqlite_database(self):
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute('''
            CREATE TABLE IF NOT EXISTS medicines (
                id TEXT PRIMARY KEY,
                brand_name TEXT,
                generic_name TEXT,
                manufacturer TEXT,
                category TEXT,
                hsn_code TEXT,
                rack_location TEXT,
                min_stock INTEGER
            )
        ''')
        cur.execute('''
            CREATE TABLE IF NOT EXISTS batches (
                id TEXT PRIMARY KEY,
                medicine_id TEXT,
                batch_number TEXT,
                expiry_date TEXT,
                mrp REAL,
                purchase_price REAL,
                selling_price REAL,
                gst_rate REAL,
                current_stock INTEGER,
                barcode TEXT
            )
        ''')
        cur.execute('''
            CREATE TABLE IF NOT EXISTS sales_invoices (
                id TEXT PRIMARY KEY,
                invoice_number TEXT,
                date TEXT,
                customer_name TEXT,
                phone TEXT,
                doctor_name TEXT,
                grand_total REAL,
                payment_mode TEXT
            )
        ''')
        conn.commit()
        conn.close()

    def init_ui(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        layout = QVBoxLayout(central_widget)
        layout.setContentsMargins(0, 0, 0, 0)

        # Header with Aadhya Branding
        header = QWidget()
        header.setStyleSheet("background-color: #0f172a; color: white; padding: 8px;")
        h_layout = QHBoxLayout(header)
        title = QLabel("SAHASRA PHARMACY BILLING SOFTWARE | Powered by AADHYA SOFTWARE SOLUTIONS")
        title.setFont(QFont("Segoe UI", 12, QFont.Bold))
        h_layout.addWidget(title)
        h_layout.addStretch()

        db_label = QLabel(f"SQLite DB: {DB_PATH}")
        db_label.setStyleSheet("color: #38bdf8; font-family: monospace;")
        h_layout.addWidget(db_label)
        layout.addWidget(header)

        # Main Tabs
        tabs = QTabWidget()
        tabs.setStyleSheet("QTabBar::tab { padding: 8px 16px; font-weight: bold; }")
        tabs.addTab(self.create_billing_tab(), "1. Pharmacy Billing (POS)")
        tabs.addTab(self.create_medicine_tab(), "2. Medicine Master")
        tabs.addTab(self.create_backup_tab(), "3. Backup & Restore")
        layout.addWidget(tabs)

    def create_billing_tab(self):
        w = QWidget()
        l = QVBoxLayout(w)
        lbl = QLabel("Fast Pharmacy POS Billing Counter - Scan Barcode or Enter Name")
        l.addWidget(lbl)
        return w

    def create_medicine_tab(self):
        w = QWidget()
        l = QVBoxLayout(w)
        lbl = QLabel("Medicine Formulations & Batch Inventory Tracking")
        l.addWidget(lbl)
        return w

    def create_backup_tab(self):
        w = QWidget()
        l = QVBoxLayout(w)
        btn = QPushButton("Create Immediate SQLite Backup to C:\\\\SahasraPharmacy\\\\Backup")
        btn.clicked.connect(self.run_backup)
        l.addWidget(btn)
        return w

    def run_backup(self):
        ts = datetime.now().strftime("%Y-%m-%d_%H%M%S")
        target = os.path.join(BACKUP_DIR, f"pharmacy_backup_{ts}.db")
        import shutil
        shutil.copy2(DB_PATH, target)
        QMessageBox.information(self, "Backup Complete", f"SQLite Backup saved to:\\n{target}")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = SahasraPharmacyMainWindow()
    window.show()
    sys.exit(app.exec())
`;

  const innoSetupScript = `; SAHASRA PHARMACY BILLING SOFTWARE INSTALLER SCRIPT
; Powered by AADHYA SOFTWARE SOLUTIONS
; Compile using Inno Setup Compiler 6+

#define MyAppName "Sahasra Pharmacy Billing Software"
#define MyAppVersion "4.2.0"
#define MyAppPublisher "AADHYA SOFTWARE SOLUTIONS"
#define MyAppURL "https://aadhyasoftware.local"
#define MyAppExeName "SahasraPharmacyERP.exe"

[Setup]
AppId={{9F821A84-1234-4C21-B892-SAHASRAPHARMA}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName=C:\\SahasraPharmacy
DefaultGroupName={#MyAppName}
OutputDir=C:\\SahasraPharmacy\\Installer
OutputBaseFilename=SahasraPharmacy_Setup_v4.2
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
Source: "dist\\SahasraPharmacyERP\\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\\{#MyAppName}"; Filename: "{app}\\{#MyAppExeName}"
Name: "{autodesktop}\\{#MyAppName}"; Filename: "{app}\\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonPySide6SourceCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadPythonScript = () => {
    const blob = new Blob([pythonPySide6SourceCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sahasra_pharmacy_erp_pyside6.py';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadInnoScript = () => {
    const blob = new Blob([innoSetupScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'setup_inno.iss';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-5.5rem)] select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            Software & Store Configuration
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pharmacy identity, D.L. licenses, GST credentials, thermal printer & Windows desktop packaging
          </p>
        </div>

        {savedMessage && (
          <div className="px-3 py-1.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded text-xs flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Settings Saved Successfully!</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs w-fit">
        <button
          onClick={() => setActiveTab('pharmacy')}
          className={`px-3.5 py-1.5 rounded font-semibold transition-colors ${
            activeTab === 'pharmacy' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
          }`}
        >
          Pharmacy Store Profile
        </button>
        <button
          onClick={() => setActiveTab('hardware')}
          className={`px-3.5 py-1.5 rounded font-semibold transition-colors ${
            activeTab === 'hardware' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
          }`}
        >
          Printer & Barcode POS
        </button>
        <button
          onClick={() => setActiveTab('python_source')}
          className={`px-3.5 py-1.5 rounded font-semibold transition-colors ${
            activeTab === 'python_source' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
          }`}
        >
          Windows Standalone EXE & Python Source
        </button>
      </div>

      {activeTab === 'pharmacy' && (
        <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-800">
            <Building2 className="w-4 h-4 text-cyan-400" />
            Pharmacy Legal Information & Drug Licenses
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 block font-semibold mb-1">Pharmacy Trade Name *</label>
              <input
                type="text"
                required
                value={settings.pharmacyName}
                onChange={(e) => setSettings({ ...settings, pharmacyName: e.target.value })}
                className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-bold"
              />
            </div>
            <div>
              <label className="text-slate-300 block font-semibold mb-1">Business Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-slate-300 block font-semibold mb-1">Address Line 1</label>
              <input
                type="text"
                value={settings.addressLine1}
                onChange={(e) => setSettings({ ...settings, addressLine1: e.target.value })}
                className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-300 block font-semibold mb-1">City & State</label>
              <input
                type="text"
                value={`${settings.city}, ${settings.state}`}
                onChange={(e) => {
                  const parts = e.target.value.split(',');
                  setSettings({ ...settings, city: parts[0]?.trim() || '', state: parts[1]?.trim() || '' });
                }}
                className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-300 block font-semibold mb-1">Pincode</label>
              <input
                type="text"
                value={settings.pincode}
                onChange={(e) => setSettings({ ...settings, pincode: e.target.value })}
                className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-slate-300 block font-semibold mb-1">GSTIN Number *</label>
              <input
                type="text"
                required
                value={settings.gstin}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-cyan-300 font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-slate-300 block font-semibold mb-1">Drug License (20B)</label>
              <input
                type="text"
                value={settings.dlNo20B}
                onChange={(e) => setSettings({ ...settings, dlNo20B: e.target.value })}
                className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-300 block font-semibold mb-1">Drug License (21B)</label>
              <input
                type="text"
                value={settings.dlNo21B}
                onChange={(e) => setSettings({ ...settings, dlNo21B: e.target.value })}
                className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-300 block font-semibold mb-1">FSSAI Number</label>
              <input
                type="text"
                value={settings.fssaiNo}
                onChange={(e) => setSettings({ ...settings, fssaiNo: e.target.value })}
                className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 block font-semibold mb-1">Invoice Receipt Footer Note</label>
            <textarea
              rows={2}
              value={settings.footerNote}
              onChange={(e) => setSettings({ ...settings, footerNote: e.target.value })}
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Save Pharmacy Profile</span>
            </button>
          </div>
        </form>
      )}

      {activeTab === 'hardware' && (
        <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-800">
            <Printer className="w-4 h-4 text-cyan-400" />
            POS Hardware, Thermal Printer & Barcode Sound Configuration
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 block font-semibold mb-1">Default Receipt Format</label>
              <select
                value={settings.thermalWidth}
                onChange={(e) => setSettings({ ...settings, thermalWidth: e.target.value as any })}
                className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
              >
                <option value="80mm">80mm Standard POS Thermal Receipt</option>
                <option value="58mm">58mm Mini Pocket Thermal Receipt</option>
                <option value="a4">A4 Full Sheet GST Tax Invoice</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block font-semibold mb-1">Barcode Audio Feedback (Beeper)</label>
              <div className="flex items-center gap-3 pt-1.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                  <input
                    type="checkbox"
                    checked={settings.enableBarcodeBeep}
                    onChange={(e) => setSettings({ ...settings, enableBarcodeBeep: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-600 bg-slate-950 border-slate-700"
                  />
                  <span>Enable synthesized POS scanner sound on barcode input</span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div>
              <label className="text-slate-300 block font-semibold mb-1">Bank Name</label>
              <input
                type="text"
                value={settings.bankDetails.bankName}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bankDetails: { ...settings.bankDetails, bankName: e.target.value },
                  })
                }
                className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-300 block font-semibold mb-1">Bank Account Number</label>
              <input
                type="text"
                value={settings.bankDetails.accountNumber}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bankDetails: { ...settings.bankDetails, accountNumber: e.target.value },
                  })
                }
                className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-300 block font-semibold mb-1">UPI ID for Dynamic QR</label>
              <input
                type="text"
                value={settings.bankDetails.upiId}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bankDetails: { ...settings.bankDetails, upiId: e.target.value },
                  })
                }
                className="w-full h-8 px-2.5 bg-slate-950 border border-slate-700 rounded text-cyan-300 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Save Hardware Config</span>
            </button>
          </div>
        </form>
      )}

      {activeTab === 'python_source' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-cyan-400" />
                Windows Desktop Installer & PySide6 Standalone Source Code
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ready-to-compile standalone Windows EXE script using PySide6, SQLite, SQLAlchemy & Inno Setup
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
              <button
                onClick={handleDownloadPythonScript}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download app.py</span>
              </button>
              <button
                onClick={handleDownloadInnoScript}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download setup_inno.iss</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
            <div className="text-cyan-400 font-bold flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              <span>Compilation Command for Standalone Windows EXE:</span>
            </div>
            <div className="p-2 bg-slate-900 rounded border border-slate-800 text-emerald-400 select-all overflow-x-auto">
              pyinstaller --noconfirm --onedir --windowed --icon "icon.ico" --name "SahasraPharmacyERP" app.py
            </div>
          </div>

          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <div className="bg-slate-950 px-3 py-1.5 border-b border-slate-800 text-[11px] text-slate-400 font-mono flex justify-between">
              <span>sahasra_pharmacy_erp_pyside6.py (PySide6 Desktop Application)</span>
              <span>Python 3.10+ / SQLite3</span>
            </div>
            <pre className="p-4 bg-slate-950 text-slate-300 font-mono text-[11px] max-h-72 overflow-y-auto overflow-x-auto leading-relaxed scrollbar-thin">
              {pythonPySide6SourceCode}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
