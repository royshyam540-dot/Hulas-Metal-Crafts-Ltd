import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { 
  Cpu, 
  ArrowRight, 
  ShieldCheck, 
  MessageSquare, 
  Activity, 
  Layers 
} from 'lucide-react';
import { useStore, store } from '../../services/store';

interface PipesShowcaseProps {
  onViewDetails: (product: Product) => void;
  onInquire: (product: Product) => void;
  onNavigate: (tab: string) => void;
}

export const PipesShowcase: React.FC<PipesShowcaseProps> = ({
  onViewDetails,
  onInquire,
  onNavigate
}) => {
  const { products, settings } = useStore();

  const pipeProducts = products
    .filter((p) => p.category === 'SS Pipes' && p.isActive && p.displayStatus === 'Published')
    .slice(0, 4);

  const handleWhatsApp = () => {
    const text = `Hello Hulas Metal Crafts Ltd.! I need technical specifications and price per meter for ASTM SS Pipes.`;
    const url = store.getWhatsAppUrl(settings.whatsappNumber, text);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="py-20 bg-zinc-900 text-white border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Showcase Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/15 border border-[#F47B20]/40 text-[#F47B20] text-xs font-bold uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" />
              <span>Structural & Industrial Tube Mills</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Industrial SS Pipes & Structural Tubing
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Engineered for architectural railings, facade structures, hydraulic systems, and hygienic food/beverage fluid processing. Certified to ASTM A554, ASTM A312, and DIN 11850 standards.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-xs font-bold transition border border-zinc-700"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-emerald-400" />
              <span>Technical Desk Chat</span>
            </button>

            <button
              onClick={() => onNavigate('ss-pipes')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F47B20] hover:bg-[#DE6810] text-white text-xs font-bold transition shadow-md"
            >
              <span>Explore All SS Pipes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pipeProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onViewDetails={onViewDetails}
              onInquire={onInquire}
            />
          ))}
        </div>

        {/* Technical Standards Bar */}
        <div className="mt-12 p-6 rounded-2xl bg-zinc-800/80 border border-zinc-700 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-zinc-300">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-[#F47B20] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-white block font-bold">ASTM A554 Ornamental Welded</strong>
              <span>TIG-welded ornamental tubes for high-end balustrades, gates, and furniture.</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-[#F47B20] flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-white block font-bold">ASTM A312 Seamless Sch 40/80</strong>
              <span>Cold-drawn SS 316L for high-pressure chemical, petroleum, and steam lines.</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-[#F47B20] flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-white block font-bold">DIN 11850 Sanitary Food Tubing</strong>
              <span>Electropolished internal surface (Ra &lt; 0.8 µm) for dairy, breweries, and pharma.</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
