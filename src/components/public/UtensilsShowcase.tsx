import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { 
  Sparkles, 
  ArrowRight, 
  Utensils, 
  ShieldCheck, 
  MessageSquare 
} from 'lucide-react';
import { useStore, store } from '../../services/store';

interface UtensilsShowcaseProps {
  onViewDetails: (product: Product) => void;
  onInquire: (product: Product) => void;
  onNavigate: (tab: string) => void;
}

export const UtensilsShowcase: React.FC<UtensilsShowcaseProps> = ({
  onViewDetails,
  onInquire,
  onNavigate
}) => {
  const { products, settings } = useStore();

  const utensilProducts = products
    .filter((p) => p.category === 'SS Utensils' && p.isActive && p.displayStatus === 'Published')
    .slice(0, 4);

  const handleWhatsAppCatalog = () => {
    const text = `Hello Hulas Metal Crafts Ltd.! Please share the complete SS Utensils & Cookware price list and catalog.`;
    const url = store.getWhatsAppUrl(settings.whatsappNumber, text);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="py-20 bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Showcase Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-[#DE6810] text-xs font-bold uppercase tracking-wider">
              <Utensils className="w-3.5 h-3.5" />
              <span>Culinary & Kitchenware Division</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#252525] tracking-tight">
              Premium SS Utensils & Cookware
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Manufactured with virgin food-grade SS 304 and SS 201 steel. Engineered with extra-thick bases, mirror gloss surfaces, and heavy-gauge construction built to last generations.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleWhatsAppCatalog}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition border border-emerald-200"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-emerald-600" />
              <span>Catalog on WhatsApp</span>
            </button>

            <button
              onClick={() => onNavigate('ss-utensils')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#252525] hover:bg-[#DE6810] text-white text-xs font-bold transition shadow-sm"
            >
              <span>Explore All Utensils</span>
              <ArrowRight className="w-4 h-4 text-[#F47B20]" />
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {utensilProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onViewDetails={onViewDetails}
              onInquire={onInquire}
            />
          ))}
        </div>

        {/* Feature Highlights Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-[#FFF4EB] border border-[#F47B20]/30 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-zinc-700">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F47B20] text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-zinc-900 block font-bold">100% Food Grade Certified</strong>
              <span>Non-reactive, acid-resistant, and free from harmful chemical coatings.</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F47B20] text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-zinc-900 block font-bold">Laser Beaded Rims</strong>
              <span>Drip-free pouring rims and ergonomic stay-cool riveted handles.</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F47B20] text-white flex items-center justify-center shrink-0">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-zinc-900 block font-bold">Commercial & Domestic Scale</strong>
              <span>From household dinner thalis to 100-Litre banquet biryani handis.</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
