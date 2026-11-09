/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAHASRA PHARMACY BILLING SOFTWARE
 * Developed & Designed by AADHYA SOFTWARE SOLUTIONS
 * Enterprise Windows Desktop Pharmacy Management ERP (100% Offline SQLite)
 */

import React, { useState, useEffect } from 'react';
import { User, SaleInvoice } from './types/pharmacy';
import { storage } from './services/storageService';
import { WindowsTitleBar } from './components/WindowsTitleBar';
import { Sidebar, ModuleId } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { LoginScreen } from './components/LoginScreen';
import { InvoicePrintModal } from './components/InvoicePrintModal';
import { IntroSplashScreen } from './components/IntroSplashScreen';

// Views
import { DashboardView } from './views/DashboardView';
import { BillingPOSView } from './views/BillingPOSView';
import { MedicineManagementView } from './views/MedicineManagementView';
import { InventoryView } from './views/InventoryView';
import { PurchaseManagementView } from './views/PurchaseManagementView';
import { SupplierManagementView } from './views/SupplierManagementView';
import { CustomerManagementView } from './views/CustomerManagementView';
import { SalesManagementView } from './views/SalesManagementView';
import { SalesReturnView } from './views/SalesReturnView';
import { PurchaseReturnView } from './views/PurchaseReturnView';
import { StockAdjustmentView } from './views/StockAdjustmentView';
import { ExpenseManagementView } from './views/ExpenseManagementView';
import { GSTManagementView } from './views/GSTManagementView';
import { FinancialManagementView } from './views/FinancialManagementView';
import { ReportsView } from './views/ReportsView';
import { UserManagementView } from './views/UserManagementView';
import { BackupRestoreView } from './views/BackupRestoreView';
import { SettingsView } from './views/SettingsView';
import { AboutView } from './views/AboutView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Default logged in as admin for immediate exploration, or can lock/logout
    const users = storage.getUsers();
    return users[0] || null;
  });

  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');
  const [initialSearchQuery, setInitialSearchQuery] = useState('');
  const [returnInvoiceNo, setReturnInvoiceNo] = useState('');
  const [reprintModalInvoice, setReprintModalInvoice] = useState<SaleInvoice | null>(null);
  const [showIntro, setShowIntro] = useState<boolean>(true);

  // Expiry & stock counters for sidebar notification badges
  const kpis = storage.getDashboardKPIs();

  // Handle Global Hotkeys (F1: POS, F2: Medicine, F3: Stock, F4: Purchase, F5: Dashboard, F9: Backup)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!currentUser) return;

      if (e.key === 'F1') {
        e.preventDefault();
        setActiveModule('pos');
      } else if (e.key === 'F2') {
        e.preventDefault();
        setActiveModule('medicines');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setActiveModule('inventory');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setActiveModule('purchases');
      } else if (e.key === 'F5') {
        e.preventDefault();
        setActiveModule('dashboard');
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [currentUser]);

  // Handle Global Search from Top Header
  const handleGlobalSearch = (query: string) => {
    setInitialSearchQuery(query);
    setActiveModule('pos');
  };

  // Handle Return Navigation from Sales History
  const handleNavigateToReturn = (invoiceNumber: string) => {
    setReturnInvoiceNo(invoiceNumber);
    setActiveModule('sales_return');
  };

  // Exit App Handler (Triggers Auto-Backup)
  const handleAppExit = () => {
    storage.createBackup('auto_exit');
    setCurrentUser(null);
  };

  // 1. Opening Intro Animation Splash Screen
  if (showIntro) {
    return <IntroSplashScreen onComplete={() => setShowIntro(false)} />;
  }

  // 2. If locked or logged out, show LoginScreen
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={(u) => setCurrentUser(u)}
        onReplayIntro={() => setShowIntro(true)}
      />
    );
  }

  // Active module title mapping
  const titleMap: Record<ModuleId, string> = {
    dashboard: 'Executive Dashboard',
    pos: 'Pharmacy Billing (POS Counter)',
    medicines: 'Medicine Master ERP',
    inventory: 'Inventory & Batch Stock',
    purchases: 'Purchase Entry (Stock Inward)',
    suppliers: 'Supplier Accounts',
    customers: 'Customer & Patient Records',
    sales: 'Sales Management History',
    sales_return: 'Sales Return & Refund',
    purchase_return: 'Purchase Return (Debit Note)',
    stock_adjustment: 'Stock Adjustment & Audit',
    expenses: 'Expense Management',
    gst: 'GST & HSN Tax Ledger',
    financials: 'Daily Cash Book & Financials',
    reports: 'Reports & Analytics',
    users: 'User Access Control',
    backup: 'Offline Backup & Disaster Recovery',
    settings: 'Software Settings',
    about: 'About Software',
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 select-none">
      {/* 1. Native Windows 10/11 Desktop Title Bar */}
      <WindowsTitleBar
        onExit={handleAppExit}
        activeModuleTitle={titleMap[activeModule] || 'Pharmacy ERP'}
      />

      {/* 2. Main Desktop Window Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar with all 19 Modules */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={(mod) => {
            if (mod === 'pos') setInitialSearchQuery('');
            setActiveModule(mod);
          }}
          currentUser={currentUser}
          onLogout={() => setCurrentUser(null)}
          lowStockCount={kpis.lowStockAlerts}
          nearExpiryCount={kpis.nearExpiryMedicines + kpis.expiredMedicines}
        />

        {/* Center Main Application Viewport */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-900">
          {/* Top Bar with Search & IST Clock */}
          <TopHeader
            activeModule={activeModule}
            onSelectModule={setActiveModule}
            onLockScreen={() => setCurrentUser(null)}
            onGlobalSearch={handleGlobalSearch}
            onReplayIntro={() => setShowIntro(true)}
          />

          {/* Dynamic Module Content View */}
          <main className="flex-1 overflow-hidden bg-slate-900">
            {activeModule === 'dashboard' && (
              <DashboardView
                onNavigate={setActiveModule}
                onReprintInvoice={(inv) => setReprintModalInvoice(inv)}
              />
            )}
            {activeModule === 'pos' && (
              <BillingPOSView
                currentUser={currentUser}
                initialSearchQuery={initialSearchQuery}
              />
            )}
            {activeModule === 'medicines' && <MedicineManagementView />}
            {activeModule === 'inventory' && <InventoryView />}
            {activeModule === 'purchases' && <PurchaseManagementView />}
            {activeModule === 'suppliers' && <SupplierManagementView />}
            {activeModule === 'customers' && <CustomerManagementView />}
            {activeModule === 'sales' && (
              <SalesManagementView onNavigateToReturn={handleNavigateToReturn} />
            )}
            {activeModule === 'sales_return' && (
              <SalesReturnView initialInvoiceNo={returnInvoiceNo} />
            )}
            {activeModule === 'purchase_return' && <PurchaseReturnView />}
            {activeModule === 'stock_adjustment' && <StockAdjustmentView />}
            {activeModule === 'expenses' && <ExpenseManagementView />}
            {activeModule === 'gst' && <GSTManagementView />}
            {activeModule === 'financials' && <FinancialManagementView />}
            {activeModule === 'reports' && <ReportsView />}
            {activeModule === 'users' && <UserManagementView />}
            {activeModule === 'backup' && <BackupRestoreView />}
            {activeModule === 'settings' && <SettingsView />}
            {activeModule === 'about' && <AboutView />}
          </main>
        </div>
      </div>

      {/* Global Invoice Reprint Modal */}
      {reprintModalInvoice && (
        <InvoicePrintModal
          invoice={reprintModalInvoice}
          onClose={() => setReprintModalInvoice(null)}
        />
      )}
    </div>
  );
}
