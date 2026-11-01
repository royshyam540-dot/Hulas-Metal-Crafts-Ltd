import React, { useState } from 'react';
import { UserRole, AdminUser } from '../../types';
import { 
  ShieldCheck, 
  Users, 
  Plus, 
  Check, 
  X, 
  Trash2, 
  Edit3, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useStore, store } from '../../services/store';
import { useToast } from '../common/Toast';

export const UserManagementView: React.FC = () => {
  const { adminUsers, currentUser } = useStore();
  const { success, error } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Sales Manager' as UserRole
  });

  const roles: UserRole[] = [
    'Super Admin',
    'Admin',
    'Inventory Manager',
    'Sales Manager',
    'Staff / Viewer'
  ];

  const permissionsList = [
    { key: 'products', label: 'Manage Products (Add, Edit, Delete)' },
    { key: 'categories', label: 'Manage Categories & Subcategories' },
    { key: 'inventory', label: 'Record Stock Movements & Audits' },
    { key: 'inquiries', label: 'View & Update Inquiries Pipeline' },
    { key: 'customers', label: 'Manage Customer Directory & Notes' },
    { key: 'reports', label: 'View & Export Financial Reports' },
    { key: 'settings', label: 'Corporate Website & WhatsApp Settings' },
    { key: 'users', label: 'Manage Administrators & Roles' }
  ];

  const rolePermissionMatrix: Record<UserRole, string[]> = {
    'Super Admin': ['products', 'categories', 'inventory', 'inquiries', 'customers', 'reports', 'settings', 'users'],
    'Admin': ['products', 'categories', 'inventory', 'inquiries', 'customers', 'reports'],
    'Inventory Manager': ['products', 'inventory', 'reports'],
    'Sales Manager': ['inquiries', 'customers', 'reports'],
    'Staff / Viewer': ['reports']
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) {
      error('Please enter user name and email.');
      return;
    }

    try {
      store.addAdminUser({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isActive: true,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
      });
      success(`Added ${newUser.name} as ${newUser.role}.`);
      setIsAddModalOpen(false);
      setNewUser({ name: '', email: '', role: 'Sales Manager' });
    } catch (err) {
      error('Failed to add user.');
    }
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (adminUsers.length <= 1) {
      error('Cannot delete the last administrative account.');
      return;
    }
    if (window.confirm(`Remove user ${name} from admin team?`)) {
      store.deleteAdminUser(id);
      success(`User ${name} removed.`);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="font-heading text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#F47B20]" />
            Team Accounts & Role-Based Authorization (RBAC)
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Enforce granular access control across Super Admins, Inventory Clerks, and Sales Executives.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F47B20] hover:bg-[#DE6810] text-white text-xs font-bold transition shadow cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Team Users Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <h3 className="font-heading text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Active Administrative Staff ({adminUsers.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
              <tr>
                <th className="py-3 px-3 font-semibold">User</th>
                <th className="py-3 px-3 font-semibold">Role</th>
                <th className="py-3 px-3 font-semibold">Last Authentication</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {adminUsers.map((u) => {
                const isCurrent = currentUser?.id === u.id;

                return (
                  <tr key={u.id} className="hover:bg-zinc-50 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 text-white flex items-center justify-center font-bold">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            u.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                            {u.name}
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded bg-orange-100 text-[#DE6810] text-[10px] font-bold">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-400 font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.role === 'Super Admin'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'Inventory Manager'
                          ? 'bg-blue-100 text-blue-800'
                          : u.role === 'Sales Manager'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-zinc-100 text-zinc-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-zinc-500 font-mono text-[11px]">
                      {u.lastLogin.includes('T') ? new Date(u.lastLogin).toLocaleString() : u.lastLogin}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {!isCurrent && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-1 rounded text-red-500 hover:bg-red-50 transition"
                          title="Remove user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-6 space-y-4">
        <div className="border-b border-zinc-100 pb-3">
          <h3 className="font-heading text-sm font-bold text-zinc-900 uppercase tracking-wider">
            Role Permission Matrix
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            Enforced through application layer authorization and Supabase PostgreSQL Row Level Security (RLS) rules.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-zinc-200 rounded-xl overflow-hidden">
            <thead className="bg-zinc-800 text-white font-semibold">
              <tr>
                <th className="py-3 px-4">System Capability / Module</th>
                {roles.map((r) => (
                  <th key={r} className="py-3 px-3 text-center whitespace-nowrap">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {permissionsList.map((perm) => (
                <tr key={perm.key} className="hover:bg-zinc-50 transition">
                  <td className="py-3 px-4 font-medium text-zinc-900">
                    {perm.label}
                  </td>
                  {roles.map((r) => {
                    const hasAccess = rolePermissionMatrix[r].includes(perm.key);
                    return (
                      <td key={r} className="py-3 px-3 text-center">
                        {hasAccess ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
                            <X className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-zinc-200 space-y-4">
            <h3 className="font-heading text-lg font-bold text-zinc-900">
              Add Administrative Staff Member
            </h3>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Shyam Karki"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="shyam@hulasmetal.com"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Assigned Role *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-300 font-semibold text-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#F47B20] text-white font-bold hover:bg-[#DE6810]"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
