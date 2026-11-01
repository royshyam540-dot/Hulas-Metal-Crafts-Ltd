import React, { useState } from 'react';
import { Customer } from '../../types';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  Building2, 
  Award, 
  Edit3, 
  Ban, 
  CheckCircle2, 
  Sparkles, 
  Clock 
} from 'lucide-react';
import { useStore, store } from '../../services/store';
import { useToast } from '../common/Toast';

export const CustomerManagementView: React.FC = () => {
  const { customers } = useStore();
  const { success, error } = useToast();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter((c) => {
    if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        c.phone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleToggleBlock = (cust: Customer) => {
    store.toggleCustomerBlock(cust.id);
    success(cust.isBlocked ? `Unblocked customer ${cust.name}` : `Blocked customer ${cust.name}`);
  };

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    store.updateCustomer(editingCustomer.id, {
      notes: editingCustomer.notes,
      category: editingCustomer.category,
      company: editingCustomer.company,
      address: editingCustomer.address
    });
    success(`Updated details for ${editingCustomer.name}.`);
    setEditingCustomer(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="font-heading text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#F47B20]" />
            B2B Customer Directory & Wholesaler Accounts
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Track repeat corporate buyers, industrial contractors, inquiry frequencies, and custom notes.
          </p>
        </div>

        <div className="text-xs text-zinc-600 bg-white px-4 py-2 rounded-xl border border-zinc-200">
          Total Customers: <strong className="text-zinc-900">{customers.length}</strong>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-2xs grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, company, phone, email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#F47B20]"
          >
            <option value="All">All Customer Categories</option>
            <option value="Wholesaler">Wholesaler</option>
            <option value="Industrial Contractor">Industrial Contractor</option>
            <option value="Fabricator">Fabricator</option>
            <option value="Retailer">Retailer</option>
            <option value="Institutional Buyer">Institutional Buyer</option>
          </select>
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((cust) => {
          const isRepeat = cust.totalInquiries > 1;

          return (
            <div
              key={cust.id}
              className={`p-5 bg-white rounded-2xl border shadow-xs flex flex-col justify-between transition ${
                cust.isBlocked ? 'border-red-300 bg-red-50/20' : 'border-zinc-200 hover:border-[#F47B20]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading text-base font-bold text-zinc-900 flex items-center gap-1.5">
                      {cust.name}
                      {cust.isBlocked && (
                        <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">
                          Blocked
                        </span>
                      )}
                    </h3>
                    <div className="text-xs text-zinc-500 font-medium flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{cust.company || 'Individual Client'}</span>
                    </div>
                  </div>

                  {isRepeat && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      <Sparkles className="w-3 h-3" />
                      Repeat ({cust.totalInquiries})
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-zinc-600 pt-2 border-t border-zinc-100">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#F47B20]" />
                    <span>{cust.phone}</span>
                  </div>
                  {cust.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#F47B20]" />
                      <span className="truncate">{cust.email}</span>
                    </div>
                  )}
                  {cust.address && (
                    <div className="text-zinc-500 text-[11px]">
                      Location: {cust.address}
                    </div>
                  )}
                </div>

                {/* Notes */}
                {cust.notes && (
                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 italic">
                    "{cust.notes}"
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-[10px] font-semibold">
                  {cust.category}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingCustomer(cust)}
                    className="p-1.5 rounded-lg hover:bg-zinc-100 text-blue-600 transition"
                    title="Edit Notes & Category"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleToggleBlock(cust)}
                    className={`p-1.5 rounded-lg transition ${
                      cust.isBlocked ? 'text-emerald-600 hover:bg-emerald-50' : 'text-zinc-400 hover:text-red-600 hover:bg-red-50'
                    }`}
                    title={cust.isBlocked ? 'Unblock customer' : 'Block customer'}
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Edit Customer Notes Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-zinc-200 space-y-4">
            <h3 className="font-heading text-lg font-bold text-zinc-900">
              Edit Customer Profile: {editingCustomer.name}
            </h3>

            <form onSubmit={handleSaveNotes} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Company</label>
                <input
                  type="text"
                  value={editingCustomer.company || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, company: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Category</label>
                <select
                  value={editingCustomer.category}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white"
                >
                  <option value="Wholesaler">Wholesaler</option>
                  <option value="Industrial Contractor">Industrial Contractor</option>
                  <option value="Fabricator">Fabricator</option>
                  <option value="Retailer">Retailer</option>
                  <option value="Institutional Buyer">Institutional Buyer</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Address / Hub</label>
                <input
                  type="text"
                  value={editingCustomer.address || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Internal Notes</label>
                <textarea
                  rows={3}
                  value={editingCustomer.notes || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 rounded-lg border border-zinc-300 font-semibold text-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#F47B20] text-white font-bold hover:bg-[#DE6810]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
