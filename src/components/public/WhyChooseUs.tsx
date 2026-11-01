import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Cpu, 
  CheckCircle, 
  Clock, 
  BadgeCheck, 
  FileCheck2, 
  Cog, 
  Recycle 
} from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const points = [
    {
      icon: ShieldCheck,
      title: "100% Prime Virgin SS Alloys",
      description: "We strictly reject scrap metal blend. Every batch uses authenticated SS 201, 304, and 316 grade coils with mill test certificates guaranteeing optimal chromium-nickel balance."
    },
    {
      icon: Cpu,
      title: "Advanced TIG & High-Frequency Tube Mills",
      description: "Automated continuous roll-forming lines with internal bead rolling and inert gas shielding ensure 100% penetration weld integrity and hydrostatic burst resistance."
    },
    {
      icon: Sparkles,
      title: "Diamond Gloss & 600# Mirror Polishing",
      description: "From culinary mirror finishes for kitchen utensils to architectural satin brush and grit finishes for railings, our robotic polishers guarantee smooth Ra < 0.6 µm surfaces."
    },
    {
      icon: Cog,
      title: "Custom Metallurgy & Tailored Gauges",
      description: "Direct manufacturing allows custom outer diameters, wall thicknesses (0.8mm to 4.0mm), lengths, and laser-engraved corporate branding for bulk B2B consignments."
    },
    {
      icon: FileCheck2,
      title: "Rigorous In-House Metallurgy Lab",
      description: "Equipped with optical emission spectrometers, ultrasonic thickness gauges, flaring test machines, and salt-spray corrosion chambers compliant with ASTM A554 & A312 standards."
    },
    {
      icon: Clock,
      title: "Reliable Factory Dispatch Timelines",
      description: "Integrated logistics hub at Biratnagar Industrial Corridor with immediate stock of fast-moving sizes and prompt nationwide & regional South Asian transport."
    }
  ];

  return (
    <section className="py-20 bg-[#F7F7F7] border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-[#DE6810] text-xs font-bold uppercase tracking-wider">
            <BadgeCheck className="w-4 h-4" />
            <span>Industrial Manufacturing Prowess</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#252525] tracking-tight">
            Why Industry Leaders Choose Hulas Metal Crafts
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
            For more than 35 years, contractors, wholesalers, hotels, and fabricators have relied on our metallurgical integrity, dimensional accuracy, and steadfast delivery commitments.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {points.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-white border border-zinc-200 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-50 group-hover:bg-[#F47B20] text-[#F47B20] group-hover:text-white flex items-center justify-center mb-6 transition-all shadow-xs">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-base font-bold text-zinc-900 group-hover:text-[#F47B20] transition mb-2.5">
                  {p.title}
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
