import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  Clock, 
  Menu, 
  X, 
  ShieldCheck, 
  MessageSquare, 
  Layers, 
  ChevronRight, 
  Flame, 
  Cpu
} from 'lucide-react';
import { useStore, store } from '../../services/store';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, onOpenAdmin }) => {
  const { settings, currentUser } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'all-products', label: 'All Products' },
    { id: 'ss-utensils', label: 'SS Utensils' },
    { id: 'ss-pipes', label: 'SS Pipes' },
    { id: 'about-us', label: 'About Us' },
    { id: 'contact-us', label: 'Contact Us' }
  ];

  const handleNavClick = (tabId: string) => {
    onNavigate(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWhatsAppClick = () => {
    const defaultText = `Hello Hulas Metal Crafts Ltd., I visited your website and would like to inquire about your Stainless Steel Utensils and SS Pipes catalog.`;
    const url = store.getWhatsAppUrl(settings.whatsappNumber, defaultText);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <header className="sticky top-0 z-40 w-full shadow-md">
      {/* Top Industrial Announcement & Contact Bar */}
      <div className="bg-[#252525] text-zinc-300 text-xs py-2 px-4 border-b border-zinc-700/60 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-zinc-300 hover:text-white transition">
              <Phone className="w-3.5 h-3.5 text-[#F47B20]" />
              <span>{settings.primaryPhone}</span>
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300 hover:text-white transition">
              <Mail className="w-3.5 h-3.5 text-[#F47B20]" />
              <span>{settings.salesEmail}</span>
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>{settings.businessHours}</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[11px] font-medium border border-zinc-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              ISO 9001:2015 Certified Plant
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo */}
            <div 
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-lg bg-[#252525] flex items-center justify-center text-[#F47B20] font-black text-2xl shadow-md border-2 border-[#F47B20] transition group-hover:scale-105">
                <span className="font-heading tracking-tighter">H</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading text-xl font-extrabold text-[#252525] tracking-tight group-hover:text-[#F47B20] transition">
                    HULAS
                  </span>
                  <span className="text-xs uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-orange-100 text-[#DE6810]">
                    METAL
                  </span>
                </div>
                <span className="text-[11px] font-medium text-zinc-500 tracking-wider uppercase">
                  Crafts Ltd. • Stainless Steel
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => {
                const isActive = currentTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition cursor-pointer relative ${
                      isActive
                        ? 'text-[#F47B20] bg-orange-50 font-bold'
                        : 'text-zinc-700 hover:text-[#F47B20] hover:bg-zinc-50'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#F47B20] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => handleNavClick('contact-us')}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#F47B20] hover:bg-[#DE6810] text-white font-semibold text-sm shadow-md transition hover:shadow-lg cursor-pointer"
              >
                <span>Get a Quote</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenAdmin}
                className="p-2.5 rounded-lg text-zinc-500 hover:text-[#F47B20] hover:bg-orange-50 border border-zinc-200 transition cursor-pointer"
                title="Admin"
                aria-label="Admin"
              >
                <ShieldCheck className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={onOpenAdmin}
                className="p-2.5 rounded-lg text-zinc-500 hover:text-[#F47B20] hover:bg-orange-50 border border-zinc-200 transition cursor-pointer"
                title="Admin"
                aria-label="Admin"
              >
                <ShieldCheck className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-lg text-zinc-700 hover:bg-zinc-100 transition focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-zinc-200 px-4 pt-3 pb-6 shadow-xl animate-fadeIn">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = currentTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-left font-semibold text-sm transition ${
                      isActive
                        ? 'bg-orange-50 text-[#F47B20]'
                        : 'text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center gap-2">
              <button
                onClick={() => handleNavClick('contact-us')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#F47B20] hover:bg-[#DE6810] text-white font-semibold text-sm shadow"
              >
                <span>Get a Quote</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="p-3 rounded-xl border border-zinc-200 text-zinc-600 hover:text-[#F47B20] hover:bg-orange-50 transition cursor-pointer"
                title="Admin"
                aria-label="Admin"
              >
                <ShieldCheck className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
