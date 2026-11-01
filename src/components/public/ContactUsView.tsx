import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Building2, 
  Factory, 
  Facebook, 
  Linkedin, 
  Twitter, 
  Youtube 
} from 'lucide-react';
import { useStore, store } from '../../services/store';
import { useToast } from '../common/Toast';

export const ContactUsView: React.FC = () => {
  const { settings } = useStore();
  const { success, error } = useToast();

  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.message) {
      error('Please fill in your name, email, phone, and message.');
      return;
    }

    try {
      store.addContactMessage({
        name: form.name,
        company: form.company,
        email: form.email,
        phone: form.phone,
        subject: form.subject || 'General Inquiry',
        message: form.message
      });

      setSubmitted(true);
      success('Your message has been received! Our sales desk will respond promptly.');
      setForm({ name: '', company: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      error('Failed to submit message. Please try again.');
    }
  };

  const handleWhatsApp = () => {
    const text = `Hello Hulas Metal Crafts Ltd.! I am contacting you through the website contact page for business inquiries.`;
    const url = store.getWhatsAppUrl(settings.whatsappNumber, text);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-[#F7F7F7] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="bg-[#252525] text-white rounded-3xl p-8 sm:p-10 border-b-4 border-[#F47B20] shadow-xl">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-[#F47B20] text-xs font-bold uppercase tracking-wider border border-[#F47B20]/40">
              <Phone className="w-3.5 h-3.5" />
              <span>Direct Corporate & Factory Desk</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold">
              Get in Touch with Hulas Metal Crafts
            </h1>
            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
              Whether you need formal B2B proforma quotations, dealership application forms, custom pipe fabrication, or factory plant visits — our engineering sales desk is here to assist.
            </p>
          </div>
        </div>

        {/* Contact Grid: Details + Interactive Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Contact Info Cards (Col 1-5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Corporate Head Office */}
            <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#DE6810] flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-zinc-900">
                    Corporate Head Office
                  </h3>
                  <span className="text-[11px] text-zinc-500">Kathmandu, Nepal</span>
                </div>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed pl-13">
                {settings.headOfficeAddress}
              </p>
              <div className="pl-13 text-xs text-zinc-600 space-y-1">
                <div>Phone: <strong className="text-zinc-900">{settings.primaryPhone}</strong></div>
                <div>Sales Desk: <strong className="text-zinc-900">{settings.salesEmail}</strong></div>
              </div>
            </div>

            {/* Factory Complex */}
            <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 text-[#F47B20] flex items-center justify-center">
                  <Factory className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-zinc-900">
                    Manufacturing Complex
                  </h3>
                  <span className="text-[11px] text-zinc-500">Morang, Biratnagar Corridor</span>
                </div>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed pl-13">
                {settings.factoryAddress}
              </p>
              <div className="pl-13 text-xs text-zinc-600 space-y-1">
                <div>Factory Phone: <strong className="text-zinc-900">{settings.secondaryPhone}</strong></div>
                <div>Corporate Email: <strong className="text-zinc-900">{settings.primaryEmail}</strong></div>
              </div>
            </div>

            {/* Working Hours & Direct WhatsApp Line */}
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-4">
              <div className="flex items-center gap-2 font-bold text-sm">
                <MessageSquare className="w-5 h-5 text-emerald-700" />
                <span>Instant WhatsApp Communication</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Connect directly with our senior sales engineers for real-time dispatch updates, price per metric ton, and immediate stock confirmations.
              </p>
              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-white text-emerald-600" />
                <span>Chat on WhatsApp (+{settings.whatsappNumber})</span>
              </button>
              <div className="flex items-center gap-2 text-[11px] text-emerald-700 pt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{settings.businessHours}</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-700">Follow Our Updates:</span>
              <div className="flex items-center gap-2">
                <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-zinc-100 hover:bg-[#F47B20] text-zinc-600 hover:text-white transition">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href={settings.linkedinUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-zinc-100 hover:bg-[#F47B20] text-zinc-600 hover:text-white transition">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href={settings.twitterUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-zinc-100 hover:bg-[#F47B20] text-zinc-600 hover:text-white transition">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href={settings.youtubeUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-zinc-100 hover:bg-[#F47B20] text-zinc-600 hover:text-white transition">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>

          {/* Right: Contact Form & Embedded Map (Col 6-12) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Interactive Form */}
            <div className="p-8 rounded-2xl bg-white border border-zinc-200 shadow-xs">
              <div className="border-b border-zinc-100 pb-4 mb-6">
                <h3 className="font-heading text-xl font-bold text-zinc-900">
                  Send a Direct Message
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Saved automatically to our customer inquiries and communication database.
                </p>
              </div>

              {submitted ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-heading text-xl font-bold text-zinc-900">
                    Message Dispatched Successfully!
                  </h4>
                  <p className="text-xs text-zinc-600 max-w-sm mx-auto">
                    Your inquiry has been logged in our corporate management portal. A representative will contact you shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold shadow hover:bg-zinc-800 transition"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Ramesh Shrestha"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        placeholder="e.g. Nepal Hardware Traders"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="contact@company.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Phone / Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+977-98XXXXXXXX"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="e.g., Bulk SS Utensils Supply / SS 304 Railing Pipe Rates"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Message / Specifications *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Describe your requirement, quantity needed, or inquiry details..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#F47B20] hover:bg-[#DE6810] text-white font-bold text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Message to Management</span>
                  </button>
                </form>
              )}
            </div>

            {/* Embedded Google Map */}
            <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-white shadow-xs">
              <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#F47B20]" />
                  Corporate Head Office Map Location
                </span>
                <span className="text-zinc-500">Tinkune, Kathmandu</span>
              </div>
              <iframe
                title="Google Maps Location"
                src={settings.googleMapsEmbedUrl}
                width="100%"
                height="280"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
