import React from 'react';
import { 
  ArrowRight, 
  MessageSquare, 
  PhoneCall, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  Factory, 
  CheckCircle2, 
  Cpu 
} from 'lucide-react';
import { useStore, store } from '../../services/store';

interface HeroSectionProps {
  onNavigate: (tab: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const { settings } = useStore();

  const handleWhatsApp = () => {
    const text = `Hello Hulas Metal Crafts Ltd.! I am looking for stainless steel utensils and industrial SS pipes quotations.`;
    const url = store.getWhatsAppUrl(settings.whatsappNumber, text);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative bg-[#252525] text-white overflow-hidden border-b-4 border-[#F47B20]">
      {/* Background with Dark Industrial Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 transform duration-1000"
        style={{ backgroundImage: `url(${settings.heroBannerImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#18181B] via-[#18181B]/95 to-transparent" />
      <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/40 to-black/80" />

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Hero Copy (Col 1-7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top Industrial Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/15 border border-[#F47B20]/40 text-[#F47B20] text-xs font-bold tracking-wide">
              <Factory className="w-3.5 h-3.5" />
              <span>ESTD. 1988 • ISO 9001:2015 CERTIFIED PLANT</span>
            </div>

            {/* Headline */}
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
              {settings.heroHeadline}
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-zinc-300 font-normal max-w-2xl leading-relaxed">
              {settings.heroSubheading}
            </p>

            {/* Highlights List */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-medium text-zinc-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#F47B20] shrink-0" />
                <span>Heavy-Gauge Cookware</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#F47B20] shrink-0" />
                <span>ASTM A554 / A312 Pipes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#F47B20] shrink-0" />
                <span>100% Virgin SS Alloys</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-4">
              <button
                onClick={() => onNavigate('all-products')}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#F47B20] hover:bg-[#DE6810] text-white font-bold text-sm shadow-lg hover:shadow-orange-500/20 transition-all hover:scale-102 cursor-pointer"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('contact-us')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm border border-zinc-700 hover:border-zinc-500 transition cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-[#F47B20]" />
                <span>Contact Us</span>
              </button>
            </div>
          </div>

          {/* Right Highlights Card & Live Metrics (Col 8-12) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-zinc-900/90 backdrop-blur-md rounded-2xl p-6 border border-zinc-700/80 shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#DE6810] flex items-center justify-center text-white font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
                      Manufacturing Divisions
                    </h3>
                    <p className="text-[11px] text-zinc-400">Integrated Stamping & Tube Mills</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Operational
                </span>
              </div>

              {/* Division 1: Utensils */}
              <div 
                onClick={() => onNavigate('ss-utensils')}
                className="mt-4 p-3.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 hover:border-[#F47B20] transition cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-[#F47B20]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#F47B20] transition">
                      SS Utensils & Cookware Division
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Heavy Topes, Royal Thalis, Dabbas & Dum Handis
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-[#F47B20] group-hover:translate-x-1 transition" />
              </div>

              {/* Division 2: SS Pipes */}
              <div 
                onClick={() => onNavigate('ss-pipes')}
                className="mt-2.5 p-3.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 hover:border-[#F47B20] transition cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#F47B20] transition">
                      SS Pipes & Structural Tubes Division
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Round, Square SHS, Seamless 316L, Dairy Sanitary
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-[#F47B20] group-hover:translate-x-1 transition" />
              </div>

              {/* Quality Seal Footer */}
              <div className="mt-4 pt-3.5 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F47B20]" />
                  Ultrasonic & Hydro Flaw Tested
                </span>
                <span className="text-[#DE6810] font-semibold">Biratnagar Factory Gate CIF</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
