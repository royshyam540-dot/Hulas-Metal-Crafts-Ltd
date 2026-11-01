import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Boxes, 
  MessageSquare, 
  Users, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  Database, 
  Flame, 
  ChevronRight 
} from 'lucide-react';
import { useStore } from '../../services/store';

export type AdminTab = 
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'inventory'
  | 'inquiries'
  | 'customers'
  | 'reports'
  | 'settings'
  | 'team'
  | 'sql-schema';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab
}) => {
  const { inquiries, products, inventoryTransactions } = useStore();

  const newInquiriesCount = inquiries.filter((inq) => inq.status === 'New').length;
  const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStockLevel).length;

  const menuItems = [
    {
      id: 'dashboard' as AdminTab,
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'products' as AdminTab,
      label: 'Product Management',
      icon: Package,
      badge: `${products.length}`
    },
    {
      id: 'categories' as AdminTab,
      label: 'Categories & Subcategories',
      icon: Layers,
      badge: null
    },
    {
      id: 'inventory' as AdminTab,
      label: 'Inventory & Stock Movements',
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} alert` : null,
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      id: 'inquiries' as AdminTab,
      label: 'Inquiries & WhatsApp Pipeline',
      icon: MessageSquare,
      badge: newInquiriesCount > 0 ? `${newInquiriesCount} new` : null,
      badgeColor: 'bg-emerald-600 text-white'
    },
    {
      id: 'customers' as AdminTab,
      label: 'Customer Directory',
      icon: Users,
      badge: null
    },
    {
      id: 'reports' as AdminTab,
      label: 'Reports & Export Center',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'team' as AdminTab,
      label: 'Team & RBAC Permissions',
      icon: ShieldCheck,
      badge: null
    },
    {
      id: 'settings' as AdminTab,
      label: 'Website & Corporate Settings',
      icon: Settings,
      badge: null
    },
    {
      id: 'sql-schema' as AdminTab,
      label: 'SQL Studio & Tables',
      icon: Database,
      badge: 'Editor'
    }
  ];

  return (
    <aside className="w-64 bg-[#1e1e1e] text-zinc-300 flex flex-col shrink-0 border-r border-zinc-800 min-h-screen">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-zinc-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#DE6810] flex items-center justify-center text-white font-black text-lg shadow-sm">
          <span className="font-heading">H</span>
        </div>
        <div>
          <h1 className="font-heading text-sm font-bold text-white tracking-wide">
            HULAS METAL CRAFTS
          </h1>
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
            ADMIN ERP v3.2
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
          Main Modules
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer group ${
                isActive
                  ? 'bg-[#F47B20] text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-[#F47B20]'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400')
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Production Status */}
      <div className="p-4 border-t border-zinc-800/80 text-[11px] text-zinc-400 space-y-2">
        <div className="flex items-center justify-between text-[10px] text-zinc-400">
          <span>Server Engine:</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Online • Synced
          </span>
        </div>
        <div className="text-[10px] text-zinc-500 font-mono">
          Biratnagar Plant Hub • Morang
        </div>
      </div>

    </aside>
  );
};
