import React, { useState } from 'react';
import { Inquiry, InquiryStatus } from '../../types';
import { 
  X, 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  UserCheck, 
  Calendar, 
  CheckCircle2, 
  Trash2, 
  Send, 
  FileText, 
  Building2, 
  AlertCircle 
} from 'lucide-react';
import { useStore, store } from '../../services/store';
import { useToast } from '../common/Toast';

interface InquiryDetailModalProps {
  inquiry: Inquiry | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InquiryDetailModal: React.FC<InquiryDetailModalProps> = ({
  inquiry,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { adminUsers, settings } = useStore();
  const { success, error } = useToast();

  const [currentStatus, setCurrentStatus] = useState<InquiryStatus>(inquiry?.status || 'New');
  const [assignedStaff, setAssignedStaff] = useState<string>(inquiry?.assignedStaff || '');
  const [followUpDate, setFollowUpDate] = useState<string>(inquiry?.followUpDate || '');
  const [newNote, setNewNote] = useState<string>('');
  const [statusRemarks, setStatusRemarks] = useState<string>('');

  if (!isOpen || !inquiry) return null;

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

  const handleUpdateStatus = () => {
    store.updateInquiryStatus(inquiry.id, currentStatus, statusRemarks);
    success(`Inquiry ${inquiry.inquiryNumber} status updated to ${currentStatus}.`);
    setStatusRemarks('');
  };

  const handleAssignStaff = () => {
    store.assignInquiryStaff(inquiry.id, assignedStaff);
    success(`Assigned to ${assignedStaff}.`);
  };

  const handleSetFollowUp = () => {
    store.setInquiryFollowUp(inquiry.id, followUpDate);
    success(`Follow up scheduled for ${followUpDate}.`);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    store.addInquiryNote(inquiry.id, newNote.trim());
    setNewNote('');
    success('Note appended to timeline.');
  };

  const handleDelete = () => {
    if (window.confirm(`Delete inquiry ${inquiry.inquiryNumber} permanently?`)) {
      store.deleteInquiry(inquiry.id);
      success(`Inquiry ${inquiry.inquiryNumber} deleted.`);
      onClose();
    }
  };

  const handleWhatsAppCustomer = () => {
    const rawNumber = inquiry.whatsappNumber || inquiry.phone;
    const lines = [
      `Hello ${inquiry.customerName},`,
      `Thank you for your inquiry ${inquiry.inquiryNumber} regarding *${inquiry.productName}* (${inquiry.requiredQuantity} ${inquiry.unit}).`,
      `This is ${assignedStaff || 'the technical sales team'} from *Hulas Metal Crafts Ltd.*`,
      `We have reviewed your specifications and would be delighted to assist you with formal pricing and dispatch timelines.`
    ];
    const url = store.getWhatsAppUrl(rawNumber, lines.join('\n'));
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden my-6 animate-fadeIn">
        
        {/* Header */}
        <div className="bg-[#252525] p-5 text-white flex items-center justify-between border-b-2 border-[#F47B20]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-[#F47B20]">
                {inquiry.inquiryNumber}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                inquiry.status === 'New'
                  ? 'bg-emerald-500 text-white'
                  : inquiry.status === 'Converted'
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#F47B20] text-white'
              }`}>
                {inquiry.status}
              </span>
            </div>
            <h3 className="font-heading text-lg font-bold text-white mt-1">
              {inquiry.productName} ({inquiry.requiredQuantity} {inquiry.unit})
            </h3>
          </div>

          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 text-xs">
          
          {/* Quick Direct Actions Toolbar */}
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-700">Direct Actions:</span>
              <button
                onClick={handleWhatsAppCustomer}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-white" />
                <span>WhatsApp Customer</span>
              </button>

              <a
                href={`tel:${inquiry.phone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition"
              >
                <Phone className="w-3.5 h-3.5 text-[#F47B20]" />
                <span>Call Phone</span>
              </a>

              <a
                href={`mailto:${inquiry.email}?subject=Hulas Metal Crafts Quotation - ${inquiry.inquiryNumber}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold border border-zinc-300 transition"
              >
                <Mail className="w-3.5 h-3.5 text-[#F47B20]" />
                <span>Send Email</span>
              </a>
            </div>

            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 p-1.5 flex items-center gap-1 font-semibold"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>

          {/* Customer & Product Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: Customer Info */}
            <div className="p-4 rounded-xl border border-zinc-200 space-y-2.5">
              <h4 className="font-heading text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#F47B20]" />
                Customer Contact Details
              </h4>
              <div className="space-y-1.5 text-zinc-700">
                <div><span className="text-zinc-400">Name:</span> <strong className="text-zinc-900">{inquiry.customerName}</strong></div>
                <div><span className="text-zinc-400">Company:</span> {inquiry.companyName || 'Not specified'}</div>
                <div><span className="text-zinc-400">Phone:</span> {inquiry.phone}</div>
                <div><span className="text-zinc-400">WhatsApp:</span> {inquiry.whatsappNumber || inquiry.phone}</div>
                <div><span className="text-zinc-400">Email:</span> {inquiry.email}</div>
                <div><span className="text-zinc-400">Location:</span> {inquiry.address || 'Not provided'}</div>
                <div><span className="text-zinc-400">Preferred Channel:</span> <span className="font-semibold text-[#DE6810]">{inquiry.preferredContactMethod}</span></div>
              </div>
            </div>

            {/* Right: Technical Requirements */}
            <div className="p-4 rounded-xl border border-zinc-200 space-y-2.5">
              <h4 className="font-heading text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#F47B20]" />
                Requested Metallurgy Specs
              </h4>
              <div className="space-y-1.5 text-zinc-700">
                <div><span className="text-zinc-400">Product SKU:</span> <span className="font-mono">{inquiry.productCode || 'N/A'}</span></div>
                <div><span className="text-zinc-400">Category:</span> {inquiry.category}</div>
                <div><span className="text-zinc-400">Required Qty:</span> <strong className="text-zinc-900">{inquiry.requiredQuantity} {inquiry.unit}</strong></div>
                {inquiry.requiredGrade && <div><span className="text-zinc-400">Grade:</span> {inquiry.requiredGrade}</div>}
                {inquiry.requiredSize && <div><span className="text-zinc-400">Size / OD:</span> {inquiry.requiredSize}</div>}
                {inquiry.gauge && <div><span className="text-zinc-400">Gauge / Thickness:</span> {inquiry.gauge}</div>}
                <div className="pt-2 border-t border-zinc-100">
                  <span className="text-zinc-400 block mb-0.5">Message / Requirements:</span>
                  <p className="p-2 rounded bg-zinc-50 border border-zinc-100 text-zinc-800 italic">
                    "{inquiry.message}"
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Workflow Management Section */}
          <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-200 space-y-4">
            <h4 className="font-heading text-xs font-bold text-[#DE6810] uppercase tracking-wider">
              Inquiry Pipeline & Assignment Workflow
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Status Updater */}
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Pipeline Status</label>
                <div className="flex gap-1.5">
                  <select
                    value={currentStatus}
                    onChange={(e) => setCurrentStatus(e.target.value as InquiryStatus)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-zinc-300 bg-white"
                  >
                    {statuses.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleUpdateStatus}
                    className="px-2.5 py-1.5 rounded-lg bg-[#252525] text-white font-bold hover:bg-[#DE6810] transition shrink-0"
                  >
                    Set
                  </button>
                </div>
              </div>

              {/* Assign Staff */}
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Assigned Sales Engineer</label>
                <div className="flex gap-1.5">
                  <select
                    value={assignedStaff}
                    onChange={(e) => setAssignedStaff(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-zinc-300 bg-white"
                  >
                    <option value="">Unassigned</option>
                    {adminUsers.map((u) => (
                      <option key={u.id} value={`${u.name} (${u.role})`}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignStaff}
                    className="px-2.5 py-1.5 rounded-lg bg-[#252525] text-white font-bold hover:bg-[#DE6810] transition shrink-0"
                  >
                    Assign
                  </button>
                </div>
              </div>

              {/* Follow-up Date */}
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Follow-up Reminder Date</label>
                <div className="flex gap-1.5">
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-zinc-300 bg-white"
                  />
                  <button
                    onClick={handleSetFollowUp}
                    className="px-2.5 py-1.5 rounded-lg bg-[#252525] text-white font-bold hover:bg-[#DE6810] transition shrink-0"
                  >
                    Schedule
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-zinc-700 font-semibold mb-1">Status Change Log Remarks</label>
              <input
                type="text"
                value={statusRemarks}
                onChange={(e) => setStatusRemarks(e.target.value)}
                placeholder="e.g. Sent proforma invoice with 5% contractor concession..."
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs"
              />
            </div>
          </div>

          {/* Internal Notes & Timeline */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Internal Team Notes & Timeline
            </h4>

            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                placeholder="Append internal sales note or phone call discussion..."
                className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 text-xs"
              />
              <button
                type="button"
                onClick={handleAddNote}
                className="px-4 py-2 rounded-lg bg-[#252525] hover:bg-[#DE6810] text-white font-bold transition shrink-0"
              >
                Add Note
              </button>
            </div>

            {inquiry.internalNotes && inquiry.internalNotes.length > 0 ? (
              <div className="space-y-1.5 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                {inquiry.internalNotes.map((nt, idx) => (
                  <div key={idx} className="p-2 rounded bg-white border border-zinc-100 text-zinc-700">
                    {nt}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-zinc-400 text-xs italic">
                No internal notes recorded yet.
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
          <span className="text-[11px] text-zinc-400">
            Received: {new Date(inquiry.createdAt).toLocaleString()}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 text-white font-semibold text-xs hover:bg-zinc-900 transition"
          >
            Close Drawer
          </button>
        </div>

      </div>
    </div>
  );
};
