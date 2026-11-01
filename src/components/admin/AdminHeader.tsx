import React, { useState } from 'react';
import { 
  Bell, 
  ExternalLink, 
  LogOut, 
  ShieldCheck, 
  User, 
  Check, 
  ChevronDown, 
  Layers, 
  AlertTriangle, 
  MessageSquare, 
  X, 
  Database 
} from 'lucide-react';
import { useStore, store } from '../../services/store';
import { UserRole } from '../../types';

interface AdminHeaderProps {
  onBackToWebsite: () => void;
  onOpenSqlModal: () => void;
  onNavigateTab: (tab: string) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onBackToWebsite,
  onOpenSqlModal,
  onNavigateTab
}) => {
  const { currentUser, notifications } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const roles: UserRole[] = [
    'Super Admin',
    'Admin',
    'Inventory Manager',
    'Sales Manager',
    'Staff / Viewer'
  ];

  const handleRoleSelect = (role: UserRole) => {
    store.switchRole(role);
    setShowRoleMenu(false);
  };

  const handleNotificationClick = (id: string, link?: string) => {
    store.markNotificationRead(id);
    if (link) {
      onNavigateTab(link);
      setShowNotifications(false);
    }
  };

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 h-16 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
      
      {/* Left Title / Branding */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#252525] text-[#F47B20] font-black flex items-center justify-center font-heading text-lg border border-[#F47B20]">
            H
          </div>
          <div className="hidden sm:block">
            <h2 className="font-heading text-sm font-bold text-zinc-900 tracking-tight">
              HULAS METAL CRAFTS
            </h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
              Business Management Portal
            </p>
          </div>
        </div>

        {/* Supabase Schema Shortcut */}
        <button
          onClick={onOpenSqlModal}
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold border border-zinc-300 transition cursor-pointer"
          title="View PostgreSQL / Supabase Schema & RLS"
        >
          <Database className="w-3.5 h-3.5 text-[#DE6810]" />
          <span>Database SQL & RLS</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        
        {/* Switch Role Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-xs font-bold text-[#DE6810] transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Role:</span>
            <span>{currentUser?.role || 'Super Admin'}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-zinc-200 py-1.5 z-50 animate-fadeIn">
              <div className="px-3 py-1.5 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Switch Operational Role:
              </div>
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleSelect(r)}
                  className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-orange-50 transition cursor-pointer ${
                    currentUser?.role === r ? 'text-[#DE6810] bg-orange-50/50' : 'text-zinc-700'
                  }`}
                >
                  <span>{r}</span>
                  {currentUser?.role === r && <Check className="w-3.5 h-3.5 text-[#DE6810]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#F47B20] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden z-50 animate-fadeIn">
              <div className="p-3.5 bg-[#252525] text-white flex items-center justify-between border-b-2 border-[#F47B20]">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#F47B20]" />
                  <span className="font-heading text-xs font-bold uppercase tracking-wider">
                    Operational Alerts ({unreadCount} unread)
                  </span>
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={() => store.clearAllNotifications()}
                    className="text-[11px] text-zinc-400 hover:text-white"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n.id, n.link)}
                      className={`p-3 text-xs cursor-pointer hover:bg-zinc-50 transition ${
                        !n.isRead ? 'bg-orange-50/40 font-medium' : 'text-zinc-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-zinc-900">{n.title}</span>
                        <span className="text-[10px] text-zinc-400 shrink-0">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 mt-1">{n.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-zinc-400">
                    No active notifications.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* View Public Website Button */}
        <button
          onClick={onBackToWebsite}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#F47B20]" />
          <span className="hidden md:inline">Public Website</span>
        </button>

        {/* User Info & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-zinc-200">
          <div className="w-8 h-8 rounded-full bg-zinc-800 text-white flex items-center justify-center font-bold text-xs overflow-hidden border border-zinc-300">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              currentUser?.name.charAt(0) || 'A'
            )}
          </div>
          <button
            onClick={() => store.logout()}
            className="p-1.5 text-zinc-500 hover:text-red-600 rounded-lg hover:bg-zinc-100 transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>

    </header>
  );
};
