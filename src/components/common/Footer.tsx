import React from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ExternalLink, 
  ArrowUpRight, 
  MessageSquare,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Award,
  FileCheck
} from 'lucide-react';
import { useStore, store } from '../../services/store';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdmin }) => {
  const { settings } = useStore();

  const handleWhatsApp = () => {
    const text = `Hello Hulas Metal Crafts Ltd., I would like to request product catalogs and formal company profile.`;
    const url = store.getWhatsAppUrl(settings.whatsappNumber, text);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <footer className="bg-[#1f1f1f] text-zinc-300 pt-16 pb-12 border-t-4 border-[#F47B20]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-zinc-800">
          {/* Column 1: Company Profile */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#2a2a2a] flex items-center justify-center text-[#F47B20] font-black text-xl border border-[#F47B20]">
                <span className="font-heading">H</span>
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-white tracking-wide">
                  HULAS METAL CRAFTS
                </h3>
                <p className="text-[11px] text-zinc-400 uppercase tracking-widest">
                  Industrial Manufacturing Ltd.
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Leading heavy-gauge stainless steel manufacturer in South Asia. Engineering precision SS 201, 304, and 316 grade utensils and industrial architectural pipes.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <div className="px-2.5 py-1 rounded bg-zinc-800 text-xs text-zinc-300 border border-zinc-700 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#F47B20]" />
                <span>ISO 9001:2015</span>
              </div>
              <div className="px-2.5 py-1 rounded bg-zinc-800 text-xs text-zinc-300 border border-zinc-700 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>ASTM A554 / A312</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-3">
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-[#F47B20] flex items-center justify-center text-zinc-300 hover:text-white transition"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={settings.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-[#F47B20] flex items-center justify-center text-zinc-300 hover:text-white transition"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href={settings.twitterUrl}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-[#F47B20] flex items-center justify-center text-zinc-300 hover:text-white transition"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-[#F47B20] flex items-center justify-center text-zinc-300 hover:text-white transition"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider border-l-2 border-[#F47B20] pl-2.5">
              Product Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <button
                  onClick={() => onNavigate('ss-utensils')}
                  className="hover:text-[#F47B20] transition flex items-center gap-1.5 text-left"
                >
                  <ArrowUpRight className="w-3 h-3 text-[#F47B20]" />
                  <span>Heavy Gauge SS Topes & Pots</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('ss-utensils')}
                  className="hover:text-[#F47B20] transition flex items-center gap-1.5 text-left"
                >
                  <ArrowUpRight className="w-3 h-3 text-[#F47B20]" />
                  <span>Royal Embossed Thali Dinner Sets</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('ss-utensils')}
                  className="hover:text-[#F47B20] transition flex items-center gap-1.5 text-left"
                >
                  <ArrowUpRight className="w-3 h-3 text-[#F47B20]" />
                  <span>Commercial Stockpots & Handis</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('ss-pipes')}
                  className="hover:text-[#F47B20] transition flex items-center gap-1.5 text-left"
                >
                  <ArrowUpRight className="w-3 h-3 text-[#F47B20]" />
                  <span>ASTM A554 SS 304 Round Pipes</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('ss-pipes')}
                  className="hover:text-[#F47B20] transition flex items-center gap-1.5 text-left"
                >
                  <ArrowUpRight className="w-3 h-3 text-[#F47B20]" />
                  <span>Square & Rectangular Hollow Section</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('ss-pipes')}
                  className="hover:text-[#F47B20] transition flex items-center gap-1.5 text-left"
                >
                  <ArrowUpRight className="w-3 h-3 text-[#F47B20]" />
                  <span>SS 316L Seamless & Sanitary Tubes</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Corporate Directory */}
          <div className="space-y-4">
            <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider border-l-2 border-[#F47B20] pl-2.5">
              Corporate & Plant
            </h4>
            <div className="space-y-3 text-xs text-zinc-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#F47B20] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-200 block">Corporate Head Office:</strong>
                  <span>{settings.headOfficeAddress}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#F47B20] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-200 block">Biratnagar Factory Complex:</strong>
                  <span>{settings.factoryAddress}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-zinc-500 shrink-0" />
                <span>{settings.businessHours}</span>
              </div>
            </div>
          </div>

          {/* Column 4: Direct Inquiries */}
          <div className="space-y-4">
            <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider border-l-2 border-[#F47B20] pl-2.5">
              Quick Contact
            </h4>
            <div className="space-y-2 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#F47B20]" />
                <span className="text-white font-medium">{settings.primaryPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F47B20]" />
                <span className="text-zinc-300">{settings.salesEmail}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-800/80 border border-zinc-700/80 text-[11px] text-zinc-400">
              <span className="text-[#F47B20] font-semibold block mb-1">B2B Wholesalers & Contractors:</span>
              Contact our industrial technical sales division for mill-finish test certificates and custom rolling schedules.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Hulas Metal Crafts Ltd. All rights reserved. Precision Manufacturing Since 1988.</p>
          
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('about-us')}
              className="hover:text-zinc-300 transition"
            >
              Company Profile
            </button>
            <button
              onClick={() => onNavigate('contact-us')}
              className="hover:text-zinc-300 transition"
            >
              Plant Visits & Inquiries
            </button>
            <button
              onClick={onOpenAdmin}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-[#F47B20] hover:bg-zinc-800 border border-zinc-700/50 transition cursor-pointer"
              title="Admin"
              aria-label="Admin"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
