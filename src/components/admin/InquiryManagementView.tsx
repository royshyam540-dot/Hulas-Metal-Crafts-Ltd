import React, { useState, useMemo } from 'react';
import { Inquiry, InquiryStatus } from '../../types';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Download, 
  ArrowUpRight, 
  Phone, 
  Mail, 
  UserCheck, 
  Calendar, 
  CheckCircle2, 
  RotateCcw, 
  Trash2 
} from 'lucide-react';
import { useStore, store } from '../../services/store';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import { InquiryDetailModal } from './InquiryDetailModal';
import { useToast } from '../common/Toast';

interface InquiryManagementViewProps {
  selectedInquiryId?: string | null;
  onClearSelectedInquiry?: () => void;
}

export const InquiryManagementView: React.FC<InquiryManagementViewProps> = ({
  selectedInquiryId,
  onClearSelectedInquiry
}) => {
  const { inquiries, settings } = useStore();
  const { success, error: toastError } = useToast();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncSupabase = async () => {
    if (!isSupabaseConfigured()) {
      toastError('Supabase credentials not configured yet. Go to Admin Settings > Supabase Connection to set URL & Anon Key.');
      return;
    }

    setIsSyncing(true);
    try {
      await store.fetchInquiriesFromSupabase();
      const res = await store.syncAllInquiriesToSupabase();
      success(`Supabase sync complete! Synced ${res.synced} inquiries to cloud database.`);
    } catch (err: any) {
      toastError(`Supabase sync error: ${err.message || 'Check network connection'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const [activeInquiryModal, setActiveInquiryModal] = useState<Inquiry | null>(null);

  // If passed from parent dashboard
  React.useEffect(() => {
    if (selectedInquiryId) {
      const match = inquiries.find((i) => i.id === selectedInquiryId);
      if (match) setActiveInquiryModal(match);
    }
  }, [selectedInquiryId, inquiries]);

  const statuses: InquiryStatus[] = [
    'New',
    'Pending',
    'Contacted',
    'Quotation Sent',
    'Negotiation',
    'Converted',
    'Closed',
    'Rejected'
  ];

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      if (selectedStatus !== 'All' && inq.status !== selectedStatus) return false;
      if (selectedCategory !== 'All' && inq.category !== selectedCategory) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          inq.inquiryNumber.toLowerCase().includes(q) ||
          inq.customerName.toLowerCase().includes(q) ||
          (inq.companyName && inq.companyName.toLowerCase().includes(q)) ||
          inq.productName.toLowerCase().includes(q) ||
          inq.phone.includes(q) ||
          inq.email.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [inquiries, selectedStatus, selectedCategory, search]);

  const handleExportCSV = () => {
    const headers = [
      'Inquiry No', 'Customer Name', 'Company', 'Phone', 'WhatsApp', 'Email',
      'Product', 'Code', 'Category', 'Required Qty', 'Unit', 'Grade', 'Size',
      'Status', 'Assigned Staff', 'Follow Up Date', 'Created At'
    ];
    const rows = filteredInquiries.map((i) => [
      `"${i.inquiryNumber}"`,
      `"${i.customerName.replace(/"/g, '""')}"`,
      `"${(i.companyName || '').replace(/"/g, '""')}"`,
      `"${i.phone}"`,
      `"${i.whatsappNumber || ''}"`,
      `"${i.email}"`,
      `"${i.productName.replace(/"/g, '""')}"`,
      `"${i.productCode || ''}"`,
      `"${i.category || ''}"`,
      i.requiredQuantity,
      `"${i.unit}"`,
      `"${i.requiredGrade || ''}"`,
      `"${i.requiredSize || ''}"`,
      `"${i.status}"`,
      `"${i.assignedStaff || 'Unassigned'}"`,
      `"${i.followUpDate || ''}"`,
      `"${i.createdAt}"`
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hulas-customer-inquiries-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleQuickWhatsApp = (inquiry: Inquiry) => {
    const rawNumber = inquiry.whatsappNumber || inquiry.phone;
    const text = `Hello ${inquiry.customerName}, this is Hulas Metal Crafts regarding your inquiry ${inquiry.inquiryNumber} for ${inquiry.productName}.`;
    const url = store.getWhatsAppUrl(rawNumber, text);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="font-heading text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-600" />
            Customer Inquiries & WhatsApp Sales Pipeline
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Track B2B quotations, assign sales engineers, follow-ups, and convert contractor requests into purchase orders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${
            isSupabaseConfigured() ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured() ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            {isSupabaseConfigured() ? 'Supabase Live Connected' : 'Local Storage Mode'}
          </span>

          <button
            onClick={handleSyncSupabase}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
            title="Push local inquiries to Supabase and pull newest from cloud"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync with Supabase'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Pipeline Status Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {statuses.map((st) => {
          const count = inquiries.filter((i) => i.status === st).length;
          const isSelected = selectedStatus === st;

          return (
            <button
              key={st}
              onClick={() => setSelectedStatus(isSelected ? 'All' : st)}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                isSelected
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-md'
                  : 'bg-white hover:bg-zinc-50 border-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-orange-400' : 'text-zinc-500'}`}>
                  {st}
                </span>
                <span className={`text-xs font-bold px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-700'}`}>
                  {count}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-2xs grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inquiry no, customer name, company, phone..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#F47B20]"
          >
            <option value="All">All Pipeline Statuses</option>
            {statuses.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#F47B20]"
          >
            <option value="All">All Categories</option>
            <option value="SS Utensils">SS Utensils</option>
            <option value="SS Pipes">SS Pipes</option>
          </select>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
              <tr>
                <th className="py-3 px-3 font-semibold">Inquiry No & Date</th>
                <th className="py-3 px-3 font-semibold">Client Name / Company</th>
                <th className="py-3 px-3 font-semibold">Product & SKU</th>
                <th className="py-3 px-3 font-semibold">Requested Qty</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold">Assigned Staff</th>
                <th className="py-3 px-3 font-semibold">Follow-up</th>
                <th className="py-3 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredInquiries.map((inq) => (
                <tr key={inq.id} className="hover:bg-zinc-50 transition">
                  <td className="py-3 px-3">
                    <div className="font-mono font-bold text-zinc-900">{inq.inquiryNumber}</div>
                    <div className="text-[10px] text-zinc-400">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-zinc-900">{inq.customerName}</div>
                    <div className="text-[10px] text-zinc-500">{inq.companyName || 'Individual'}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">{inq.phone}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-zinc-900 truncate max-w-xs">{inq.productName}</div>
                    <div className="text-[10px] text-[#DE6810] font-semibold">{inq.category}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-zinc-900 text-sm">
                      {inq.requiredQuantity} {inq.unit}
                    </span>
                    {inq.requiredGrade && (
                      <div className="text-[10px] text-zinc-500 font-mono">{inq.requiredGrade}</div>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      inq.status === 'New'
                        ? 'bg-emerald-100 text-emerald-800'
                        : inq.status === 'Converted'
                        ? 'bg-purple-100 text-purple-800'
                        : inq.status === 'Rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-orange-100 text-[#DE6810]'
                    }`}>
                      {inq.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-zinc-600">
                    {inq.assignedStaff ? (
                      <span className="font-medium text-zinc-800">{inq.assignedStaff.split(' ')[0]}</span>
                    ) : (
                      <span className="text-zinc-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-zinc-600">
                    {inq.followUpDate ? (
                      <span className="font-medium text-zinc-800 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#F47B20]" />
                        {inq.followUpDate}
                      </span>
                    ) : (
                      <span className="text-zinc-400">None</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleQuickWhatsApp(inq)}
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                        title="Chat Customer on WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4 fill-emerald-600" />
                      </button>

                      <button
                        onClick={() => setActiveInquiryModal(inq)}
                        className="px-2.5 py-1 rounded-lg bg-[#252525] hover:bg-[#DE6810] text-white text-[11px] font-semibold transition"
                      >
                        Manage
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInquiries.length === 0 && (
          <div className="p-12 text-center text-zinc-400 text-xs">
            No inquiries match the active status or search query.
          </div>
        )}
      </div>

      {/* Inquiry Detail & Workflow Modal */}
      <InquiryDetailModal
        inquiry={activeInquiryModal}
        isOpen={Boolean(activeInquiryModal)}
        onClose={() => {
          setActiveInquiryModal(null);
          if (onClearSelectedInquiry) onClearSelectedInquiry();
        }}
        onSuccess={() => {
          // Updates automatically
        }}
      />

    </div>
  );
};
