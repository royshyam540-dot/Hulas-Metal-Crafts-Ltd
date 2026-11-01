import React, { useState } from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { Sparkles, ArrowRight, Filter } from 'lucide-react';
import { useStore } from '../../services/store';

interface FeaturedProductsProps {
  onViewDetails: (product: Product) => void;
  onInquire: (product: Product) => void;
  onNavigate: (tab: string) => void;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  onViewDetails,
  onInquire,
  onNavigate
}) => {
  const { products } = useStore();
  const [activeCategory, setActiveCategory] = useState<'All' | 'SS Utensils' | 'SS Pipes'>('All');

  const featured = products
    .filter((p) => p.isFeatured && p.isActive && p.displayStatus === 'Published')
    .filter((p) => activeCategory === 'All' || p.category === activeCategory);

  return (
    <section className="py-20 bg-[#F7F7F7] border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Category Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-[#DE6810] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Engineered Excellence</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#252525] tracking-tight">
              Featured Manufacturing Highlights
            </h2>
            <p className="text-sm text-zinc-600 max-w-xl">
              High-demand stainless steel product lines manufactured to exact metallurgical specifications.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white border border-zinc-200 shadow-2xs self-start md:self-auto">
            {(['All', 'SS Utensils', 'SS Pipes'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#F47B20] text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                {cat === 'All' ? 'All Featured' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onViewDetails={onViewDetails}
                onInquire={onInquire}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200 text-zinc-500 text-sm">
            No featured products found in this category.
          </div>
        )}

        <div className="mt-12 text-center">
          <button
            onClick={() => onNavigate('all-products')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-orange-50 text-zinc-800 hover:text-[#DE6810] border border-zinc-300 hover:border-[#DE6810] font-bold text-xs uppercase tracking-wider transition shadow-2xs cursor-pointer"
          >
            <span>View Full 500+ Product Catalog</span>
            <ArrowRight className="w-4 h-4 text-[#DE6810]" />
          </button>
        </div>

      </div>
    </section>
  );
};
