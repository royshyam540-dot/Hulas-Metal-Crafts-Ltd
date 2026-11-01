import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  X, 
  CheckCircle2, 
  UserCheck, 
  AlertCircle, 
  KeyRound 
} from 'lucide-react';
import { store, useStore } from '../../services/store';
import { UserRole } from '../../types';
import { useToast } from '../common/Toast';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { adminUsers, currentUser } = useStore();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Super Admin');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      error('Please enter an admin email address.');
      return;
    }

    try {
      store.login(email, selectedRole);
      success(`Welcome back! Logged in as ${selectedRole}.`);
      onSuccess();
    } catch (err) {
      error('Authentication failed.');
    }
  };

  const handleQuickLoginAs = (userEmail: string, role: UserRole) => {
    store.login(userEmail, role);
    success(`Logged in as ${role} (${userEmail})`);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-fadeIn">
        
        {/* Header */}
        <div className="bg-[#252525] p-6 text-white text-center relative border-b-4 border-[#F47B20]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-[#F47B20] text-white flex items-center justify-center mx-auto mb-3 shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="font-heading text-xl font-bold tracking-tight">
            Hulas Corporate Admin Portal
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Enterprise Management & Inventory Control System
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Quick Demo Role Selector */}
          <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200/80">
            <span className="text-[11px] font-bold text-[#DE6810] uppercase tracking-wider block mb-2">
              Quick Role-Based Access:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {adminUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLoginAs(u.email, u.role)}
                  className="p-2 text-left rounded-lg bg-white hover:bg-orange-100/70 border border-orange-200 text-xs transition flex flex-col cursor-pointer"
                >
                  <span className="font-bold text-zinc-900 truncate">{u.name}</span>
                  <span className="text-[10px] text-[#DE6810] font-semibold">{u.role}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Admin Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hulasmetal.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Assign System Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#F47B20]"
              >
                <option value="Super Admin">Super Admin (Full Authorization)</option>
                <option value="Admin">Admin</option>
                <option value="Inventory Manager">Inventory Manager (Stock & Transactions)</option>
                <option value="Sales Manager">Sales Manager (Inquiries & Customer Pipeline)</option>
                <option value="Staff / Viewer">Staff / Viewer (Read Only)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#252525] hover:bg-[#DE6810] text-white font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-[#F47B20]" />
              <span>Sign In to Admin Workspace</span>
            </button>
          </form>

          <div className="text-[11px] text-zinc-400 text-center flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            <span>Protected by PostgreSQL Row Level Security (RLS)</span>
          </div>

        </div>

      </div>
    </div>
  );
};
