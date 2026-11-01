import React from 'react';
import { 
  ShieldCheck, 
  Target, 
  Eye, 
  Award, 
  Factory, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  PhoneCall, 
  Layers 
} from 'lucide-react';
import { useStore } from '../../services/store';

interface AboutUsViewProps {
  onNavigate: (tab: string) => void;
}

export const AboutUsView: React.FC<AboutUsViewProps> = ({ onNavigate }) => {
  const { settings } = useStore();

  return (
    <div className="bg-[#F7F7F7] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Hero Header */}
        <div className="bg-[#252525] text-white rounded-3xl p-8 sm:p-12 border-b-4 border-[#F47B20] shadow-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
            <Factory className="w-96 h-96 text-white" />
          </div>

          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-[#F47B20] text-xs font-bold uppercase tracking-wider border border-[#F47B20]/40">
              <Award className="w-3.5 h-3.5" />
              <span>Pioneering Heavy Metallurgy Since 1988</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight">
              About Hulas Metal Crafts Ltd.
            </h1>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              {settings.tagline}
            </p>
          </div>
        </div>

        {/* Company History & Overview */}
        <div className="bg-white rounded-2xl p-8 border border-zinc-200 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-orange-50 text-[#DE6810] text-xs font-bold uppercase">
              Our Journey & Heritage
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#252525]">
              Three Decades of Metallurgical Mastery
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              {settings.aboutHistory}
            </p>
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700">
              <strong className="text-zinc-900 block font-bold mb-1">Heavy Stamping & Pipe Tube Mills:</strong>
              Operating from the industrial corridor of Biratnagar with state-of-the-art hydraulic deep-drawing presses, robotic friction polishers, and high-frequency automated TIG pipe welding mills.
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            <div className="aspect-4/3 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-inner">
              <img
                src={settings.aboutGallery[0] || "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80"}
                alt="Plant Mill"
                className="w-full h-full object-cover hover:scale-105 transition duration-500"
              />
            </div>
            <div className="aspect-4/3 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-inner">
              <img
                src={settings.aboutGallery[1] || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"}
                alt="Steel Processing"
                className="w-full h-full object-cover hover:scale-105 transition duration-500"
              />
            </div>
            <div className="aspect-4/3 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-inner">
              <img
                src={settings.aboutGallery[2] || "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80"}
                alt="Precision Polish"
                className="w-full h-full object-cover hover:scale-105 transition duration-500"
              />
            </div>
            <div className="aspect-4/3 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-inner">
              <img
                src={settings.aboutGallery[3] || "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80"}
                alt="Quality Inspection"
                className="w-full h-full object-cover hover:scale-105 transition duration-500"
              />
            </div>
          </div>
        </div>

        {/* Vision & Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vision */}
          <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#DE6810] flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-[#252525]">
                Our Corporate Vision
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                {settings.aboutVision}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center gap-2 text-xs font-semibold text-[#DE6810]">
              <Sparkles className="w-4 h-4" />
              <span>Regional Metallurgical Benchmark</span>
            </div>
          </div>

          {/* Mission */}
          <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-[#252525]">
                Our Mission Statement
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                {settings.aboutMission}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero Defect & Precision Delivery</span>
            </div>
          </div>
        </div>

        {/* Core Values & Quality Commitment */}
        <div className="bg-white rounded-2xl p-8 border border-zinc-200 shadow-xs space-y-6">
          <div className="border-b border-zinc-100 pb-4">
            <span className="text-xs font-bold text-[#DE6810] uppercase tracking-wider block">
              Ethical Standards & Metallurgy
            </span>
            <h2 className="font-heading text-2xl font-bold text-[#252525] mt-1">
              Core Principles & Quality Assurance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">
                Guiding Principles:
              </h4>
              <div className="space-y-2.5">
                {settings.aboutValues.map((val, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-xs text-zinc-700">
                    <CheckCircle2 className="w-4 h-4 text-[#F47B20] shrink-0 mt-0.5" />
                    <span>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">
                Testing & Laboratory Standards:
              </h4>
              <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200/80 text-xs text-zinc-700 leading-relaxed space-y-3">
                <p>{settings.aboutQualityCommitment}</p>
                <div className="pt-2 border-t border-orange-200/50 flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 rounded bg-white text-[11px] font-bold text-zinc-800 border border-orange-200">
                    ISO 9001:2015
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white text-[11px] font-bold text-zinc-800 border border-orange-200">
                    ASTM A554
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white text-[11px] font-bold text-zinc-800 border border-orange-200">
                    ASTM A312
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white text-[11px] font-bold text-zinc-800 border border-orange-200">
                    DIN 11850 Sanitary
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Callout */}
        <div className="bg-[#252525] rounded-2xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 border-l-8 border-[#F47B20] shadow-xl">
          <div className="space-y-2 max-w-xl">
            <h3 className="font-heading text-2xl font-bold">
              Looking for Custom Manufacturing or Dealership?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300">
              Our engineering team consults on custom steel thickness, private labeling, and regional wholesale dealership territories.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('contact-us')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F47B20] hover:bg-[#DE6810] text-white font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
            >
              <span>Contact Plant & Sales</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
