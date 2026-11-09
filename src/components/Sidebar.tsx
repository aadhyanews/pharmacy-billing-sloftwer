import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Pill,
  Boxes,
  Truck,
  Building2,
  Users,
  Receipt,
  RotateCcw,
  Undo2,
  SlidersHorizontal,
  Wallet,
  FileSpreadsheet,
  LineChart,
  BarChart3,
  UserCheck,
  Save,
  Settings,
  Info,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { User } from '../types/pharmacy';

export type ModuleId =
  | 'dashboard'
  | 'pos'
  | 'medicines'
  | 'inventory'
  | 'purchases'
  | 'suppliers'
  | 'customers'
  | 'sales'
  | 'sales_return'
  | 'purchase_return'
  | 'stock_adjustment'
  | 'expenses'
  | 'gst'
  | 'financials'
  | 'reports'
  | 'users'
  | 'backup'
  | 'settings'
  | 'about';

interface SidebarProps {
  activeModule: ModuleId;
  onSelectModule: (module: ModuleId) => void;
  currentUser: User | null;
  onLogout: () => void;
  lowStockCount: number;
  nearExpiryCount: number;
}

interface NavItem {
  id: ModuleId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  badge?: number;
  badgeColor?: string;
  adminOnly?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  currentUser,
  onLogout,
  lowStockCount,
  nearExpiryCount,
}) => {
  const navSections: { title: string; items: NavItem[] }[] = [
    {
      title: 'PRIMARY OPERATIONS',
      items: [
        { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard, shortcut: 'F5' },
        { id: 'pos', label: '2. Pharmacy Billing (POS)', icon: ShoppingCart, shortcut: 'F1' },
        { id: 'medicines', label: '3. Medicine Master', icon: Pill, shortcut: 'F2' },
        {
          id: 'inventory',
          label: '4. Inventory Management',
          icon: Boxes,
          shortcut: 'F3',
          badge: lowStockCount > 0 ? lowStockCount : undefined,
          badgeColor: 'text-amber-400 bg-amber-950/60 border border-amber-800/60',
        },
      ],
    },
    {
      title: 'PURCHASE & VENDORS',
      items: [
        { id: 'purchases', label: '5. Purchase Entry (Inward)', icon: Truck, shortcut: 'F4', adminOnly: false },
        { id: 'suppliers', label: '6. Supplier Management', icon: Building2 },
        { id: 'customers', label: '7. Customer Management', icon: Users },
      ],
    },
    {
      title: 'SALES & RETURNS',
      items: [
        { id: 'sales', label: '8. Sales Invoices History', icon: Receipt },
        { id: 'sales_return', label: '9. Sales Return (Refund)', icon: RotateCcw },
        { id: 'purchase_return', label: '10. Purchase Return', icon: Undo2 },
        {
          id: 'stock_adjustment',
          label: '11. Stock Adjustment',
          icon: SlidersHorizontal,
          badge: nearExpiryCount > 0 ? nearExpiryCount : undefined,
          badgeColor: 'text-rose-400 bg-rose-950/60 border border-rose-800/60',
        },
      ],
    },
    {
      title: 'ACCOUNTS & TAXATION',
      items: [
        { id: 'expenses', label: '12. Expense Management', icon: Wallet },
        { id: 'gst', label: '13. GST & HSN Tax Ledger', icon: FileSpreadsheet },
        { id: 'financials', label: '14. Cash Book & P&L', icon: LineChart },
        { id: 'reports', label: '15. Reports & Analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'SYSTEM & SETTINGS',
      items: [
        { id: 'users', label: '16. User & Role Control', icon: UserCheck, adminOnly: true },
        { id: 'backup', label: '17. Backup & Restore (Local)', icon: Save, shortcut: 'F9' },
        { id: 'settings', label: '18. Software Settings', icon: Settings, adminOnly: true },
        { id: 'about', label: '19. About Software', icon: Info },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col h-full shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-3.5 border-b border-slate-800/90 bg-gradient-to-b from-slate-900/80 to-slate-950">
        <div className="flex items-center gap-3">
          <img
            src="/assets/aistudio/Gemini_Generated_Image_vrowi9vrowi9vrow_a94fa424.png"
            alt="Sahasra Pharmacy Official Logo"
            className="w-11 h-11 rounded-lg object-contain bg-white/95 p-0.5 border border-cyan-500/40 shadow-md shadow-cyan-950/40 shrink-0"
          />
          <div className="min-w-0">
            <h1 className="font-bold text-slate-100 text-[13px] leading-tight tracking-tight truncate">
              SAHASRA PHARMACY
            </h1>
            <p className="text-[10px] text-cyan-400 font-medium tracking-wide truncate">
              BILLING ERP ENTERPRISE
            </p>
          </div>
        </div>

        {/* Developer Tagline Badge */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
          <span className="truncate">By Aadhya Software</span>
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-800/90 text-cyan-300 border border-slate-700/80">
            v4.2 PRO
          </span>
        </div>
      </div>

      {/* Navigation Modules (Scrollable) */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-0.5">
            <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-500 tracking-wider">
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              const isLocked = item.adminOnly && currentUser?.role !== 'admin';

              return (
                <button
                  key={item.id}
                  onClick={() => !isLocked && onSelectModule(item.id)}
                  disabled={isLocked}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md transition-all text-left group ${
                    isActive
                      ? 'bg-cyan-600/15 text-cyan-300 font-semibold border border-cyan-500/30 shadow-xs'
                      : isLocked
                      ? 'text-slate-600 opacity-60 cursor-not-allowed'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-cyan-400'
                          : isLocked
                          ? 'text-slate-600'
                          : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge !== undefined && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                    {item.shortcut && (
                      <span className="font-mono text-[9px] text-slate-400 group-hover:text-slate-300">
                        {item.shortcut}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Operator User Profile & Logout */}
      <div className="p-3 border-t border-slate-800/90 bg-slate-950/90 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-cyan-400 shrink-0">
              {currentUser?.fullName.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">
                {currentUser?.fullName || 'Active User'}
              </p>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className={`font-semibold capitalize ${currentUser?.role === 'admin' ? 'text-amber-400' : 'text-cyan-400'}`}>
                  {currentUser?.role || 'cashier'}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-emerald-400">Online</span>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Log Out & Lock Register"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Corporate Developer Signature */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/70 text-center">
          <div className="text-[10px] text-slate-400 tracking-tight">
            Developed & Designed by
          </div>
          <div className="text-[11px] font-bold text-slate-300 tracking-wide mt-0.5 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            AADHYA SOFTWARE SOLUTIONS
          </div>
        </div>
      </div>
    </aside>
  );
};
