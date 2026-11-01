import React, { useState } from 'react';
import { Product, Inquiry } from '../../types';
import { 
  X, 
  Send, 
  MessageSquare, 
  Phone, 
  Mail, 
  Building2, 
  MapPin, 
  CheckCircle2, 
  Package, 
  Layers, 
  HelpCircle 
} from 'lucide-react';
import { store, useStore } from '../../services/store';
import { useToast } from '../common/Toast';

interface InquiryModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const { settings } = useStore();
  const { success, error } = useToast();

  const [submittedInquiry, setSubmittedInquiry] = useState<Inquiry | null>(null);
  const [formData, setFormData] = useState<{
    customerName: string;
    companyName: string;
    phone: string;
    whatsappNumber: string;
    email: string;
    address: string;
    requiredSize: string;
    requiredGrade: string;
    requiredThickness: string;
    gauge: string;
    requiredQuantity: number;
    unit: string;
    message: string;
    preferredContactMethod: 'WhatsApp' | 'Phone Call' | 'Email';
  }>({
    customerName: '',
    companyName: '',
    phone: '',
    whatsappNumber: '',
    email: '',
    address: '',
    requiredSize: product?.size || product?.pipeSize || '',
    requiredGrade: (product?.grade as string) || 'SS 304',
    requiredThickness: product?.thickness || '',
    gauge: product?.gauge || '',
    requiredQuantity: product?.minimumOrderQuantity || 10,
    unit: product?.unitOfMeasurement || 'Pcs',
    message: '',
    preferredContactMethod: 'WhatsApp'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName || !formData.phone || !formData.email) {
      error('Please fill in your name, phone number, and email.');
      return;
    }

    try {
      const created = store.addInquiry({
        customerName: formData.customerName,
        companyName: formData.companyName,
        phone: formData.phone,
        whatsappNumber: formData.whatsappNumber || formData.phone,
        email: formData.email,
        address: formData.address,
        productId: product?.id,
        productName: product ? product.name : 'General Catalog Inquiry',
        productCode: product?.code || 'N/A',
        category: product?.category || 'General',
        requiredSize: formData.requiredSize,
        requiredGrade: formData.requiredGrade,
        requiredThickness: formData.requiredThickness,
        gauge: formData.gauge,
        requiredQuantity: Number(formData.requiredQuantity) || 1,
        unit: formData.unit,
        message: formData.message || `Requesting formal pricing and delivery schedule for ${product?.name || 'materials'}.`,
        preferredContactMethod: formData.preferredContactMethod
      });

      setSubmittedInquiry(created);
      success(`Inquiry ${created.inquiryNumber} submitted successfully! Our sales desk will contact you.`);
    } catch (err) {
      error('Failed to submit inquiry. Please try again.');
    }
  };

  const handleOpenWhatsAppChat = () => {
    if (!submittedInquiry) return;
    const lines = [
      `*Formal Inquiry Submitted - ${submittedInquiry.inquiryNumber}*`,
      `• *Client Name:* ${submittedInquiry.customerName} (${submittedInquiry.companyName || 'Individual'})`,
      `• *Phone:* ${submittedInquiry.phone}`,
      `• *Product:* ${submittedInquiry.productName} [${submittedInquiry.productCode}]`,
      `• *Quantity:* ${submittedInquiry.requiredQuantity} ${submittedInquiry.unit}`,
      submittedInquiry.requiredGrade ? `• *Grade:* ${submittedInquiry.requiredGrade}` : '',
      submittedInquiry.requiredSize ? `• *Size:* ${submittedInquiry.requiredSize}` : '',
      submittedInquiry.gauge ? `• *Gauge:* ${submittedInquiry.gauge}` : '',
      `• *Message:* ${submittedInquiry.message}`,
      `\nPlease review and send the official proforma quotation.`
    ].filter(Boolean);

    const url = store.getWhatsAppUrl(settings.whatsappNumber, lines.join('\n'));
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden my-8 animate-fadeIn">
        
        {/* Header */}
        <div className="bg-[#252525] p-5 text-white flex items-center justify-between border-b-2 border-[#F47B20]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#DE6810] flex items-center justify-center text-white shadow">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white tracking-wide">
                Request Formal Factory Quotation
              </h3>
              <p className="text-xs text-zinc-400">
                Direct procurement inquiry to Hulas Metal Crafts Ltd.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        {submittedInquiry ? (
          /* Success Screen */
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h4 className="font-heading text-2xl font-bold text-zinc-900">
                Inquiry Received Successfully!
              </h4>
              <p className="text-sm text-zinc-600 max-w-md mx-auto">
                Thank you, <strong>{submittedInquiry.customerName}</strong>. Your inquiry reference number is:
              </p>
              <div className="inline-block py-2 px-5 rounded-xl bg-orange-50 border border-orange-200 text-[#DE6810] font-mono font-bold text-lg">
                {submittedInquiry.inquiryNumber}
              </div>
            </div>

            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-700 text-left space-y-1.5 max-w-lg mx-auto">
              <div className="flex justify-between">
                <span className="text-zinc-400">Product:</span>
                <span className="font-semibold text-zinc-900">{submittedInquiry.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Quantity:</span>
                <span className="font-semibold text-zinc-900">{submittedInquiry.requiredQuantity} {submittedInquiry.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Preferred Channel:</span>
                <span className="font-semibold text-zinc-900">{submittedInquiry.preferredContactMethod}</span>
              </div>
            </div>

            <p className="text-xs text-zinc-500">
              Our industrial sales engineering desk will prepare the proforma invoice within 2-4 business hours.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                onClick={handleOpenWhatsAppChat}
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open Instant WhatsApp Chat</span>
              </button>

              <button
                onClick={onClose}
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-sm transition cursor-pointer"
              >
                Done / Close
              </button>
            </div>
          </div>
        ) : (
          /* Inquiry Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Product Summary Banner */}
            {product && (
              <div className="p-3.5 rounded-xl bg-orange-50/80 border border-orange-200/80 flex items-center gap-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-14 h-14 rounded-lg object-cover border border-orange-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-[#DE6810] uppercase tracking-wider block">
                    {product.category} • SKU: {product.code}
                  </span>
                  <h4 className="font-bold text-zinc-900 text-sm truncate">
                    {product.name}
                  </h4>
                  <span className="text-xs text-zinc-600">
                    MOQ: {product.minimumOrderQuantity} {product.unitOfMeasurement}
                  </span>
                </div>
              </div>
            )}

            {/* Section: Customer Information */}
            <div>
              <h5 className="font-heading text-xs font-bold text-zinc-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#F47B20]" />
                Customer & Company Details
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="e.g., Rajesh Sharma"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Company / Organization Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g., Himalayan Kitchenware Traders"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Phone / Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+977-98XXXXXXXX"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    placeholder="+977-98XXXXXXXX"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sales@company.com"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Delivery / Project Location
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="City, District, Province"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section: Technical Requirements */}
            <div className="pt-2 border-t border-zinc-100">
              <h5 className="font-heading text-xs font-bold text-zinc-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#F47B20]" />
                Technical & Quantity Requirements
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Required Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.requiredQuantity}
                    onChange={(e) => setFormData({ ...formData, requiredQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="Pcs, Sets, Meters"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Stainless Grade
                  </label>
                  <select
                    value={formData.requiredGrade}
                    onChange={(e) => setFormData({ ...formData, requiredGrade: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none bg-white"
                  >
                    <option value="SS 304">SS 304 (Standard)</option>
                    <option value="SS 316L">SS 316L (Acid/Marine)</option>
                    <option value="SS 201">SS 201 (Economy)</option>
                    <option value="SS 430">SS 430 (Ferritic)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Gauge / Thickness
                  </label>
                  <input
                    type="text"
                    value={formData.gauge || formData.requiredThickness}
                    onChange={(e) => setFormData({ ...formData, gauge: e.target.value, requiredThickness: e.target.value })}
                    placeholder="e.g., 18G / 1.5mm"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Custom Size / Specification Notes
                </label>
                <input
                  type="text"
                  value={formData.requiredSize}
                  onChange={(e) => setFormData({ ...formData, requiredSize: e.target.value })}
                  placeholder="e.g., 2 Inch Round, 24cm Cookpot, 6 Meter Length"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
                />
              </div>

              <div className="mt-3">
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Additional Message / Requirements
                </label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please specify delivery timeline, mill test certificates needed, or any special packaging requirements..."
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
                />
              </div>

              <div className="mt-3">
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Preferred Contact Method
                </label>
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="preferredContactMethod"
                      value="WhatsApp"
                      checked={formData.preferredContactMethod === 'WhatsApp'}
                      onChange={() => setFormData({ ...formData, preferredContactMethod: 'WhatsApp' })}
                      className="text-[#F47B20] focus:ring-[#F47B20]"
                    />
                    <span>WhatsApp</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="preferredContactMethod"
                      value="Phone Call"
                      checked={formData.preferredContactMethod === 'Phone Call'}
                      onChange={() => setFormData({ ...formData, preferredContactMethod: 'Phone Call' })}
                      className="text-[#F47B20] focus:ring-[#F47B20]"
                    />
                    <span>Phone Call</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="preferredContactMethod"
                      value="Email"
                      checked={formData.preferredContactMethod === 'Email'}
                      onChange={() => setFormData({ ...formData, preferredContactMethod: 'Email' })}
                      className="text-[#F47B20] focus:ring-[#F47B20]"
                    />
                    <span>Email</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-zinc-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#F47B20] hover:bg-[#DE6810] text-white text-xs font-bold transition shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Formal Inquiry</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
