import React from 'react';
import { Award, Factory, Users, CheckCircle, Truck, PackageCheck } from 'lucide-react';

export const StatsSection: React.FC = () => {
  const stats = [
    {
      icon: Factory,
      value: "35+",
      label: "Years of Metallurgy",
      desc: "Engineering heavy stainless steel since 1988"
    },
    {
      icon: Truck,
      value: "50,000+",
      label: "MT Annual Capacity",
      desc: "Massive automated press lines and TIG pipe mills"
    },
    {
      icon: PackageCheck,
      value: "500+",
      label: "Engineered Product Lines",
      desc: "Utensils, cookware, and architectural SS tubes"
    },
    {
      icon: Users,
      value: "10,000+",
      label: "B2B Clients & Wholesalers",
      desc: "Across South Asia and industrial corridors"
    }
  ];

  return (
    <section className="bg-white border-b border-zinc-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div 
                key={idx} 
                className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200/80 hover:border-[#F47B20] transition duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-100/70 group-hover:bg-[#DE6810] text-[#DE6810] group-hover:text-white flex items-center justify-center mb-4 transition">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="font-heading text-3xl sm:text-4xl font-extrabold text-[#252525] tracking-tight group-hover:text-[#DE6810] transition">
                  {s.value}
                </div>
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mt-1">
                  {s.label}
                </h4>
                <p className="text-xs text-zinc-500 mt-1">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
