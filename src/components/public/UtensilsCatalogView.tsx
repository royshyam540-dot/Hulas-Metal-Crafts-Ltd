import React, { useState, useMemo } from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { 
  Utensils, 
  Search, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck, 
  Package, 
  Layers 
} from 'lucide-react';
import { useStore } from '../../services/store';

interface UtensilsCatalogViewProps {
  onViewDetails: (product: Product) => void;
  onInquire: (product: Product) => void;
}

export const UtensilsCatalogView: React.FC<UtensilsCatalogViewProps> = ({
  onViewDetails,
  onInquire
}) => {
  const { products } = useStore();

  const [search, setSearch] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [selectedGauge, setSelectedGauge] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('All');

  const utensilProducts = useMemo(() => {
    return products.filter((p) => p.category === 'SS Utensils' && p.isActive && p.displayStatus === 'Published');
  }, [products]);

  const subcategories = useMemo(() => {
    const set = new Set<string>();
    utensilProducts.forEach((p) => {
      if (p.subcategory) set.add(p.subcategory);
    });
    return Array.from(set);
  }, [utensilProducts]);

  const filtered = useMemo(() => {
    return utensilProducts.filter((p) => {
      if (selectedSubcategory !== 'All' && p.subcategory !== selectedSubcategory) return false;
      if (selectedGrade !== 'All' && p.grade !== selectedGrade) return false;
      if (selectedGauge !== 'All' && !p.gauge?.includes(selectedGauge)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const mName = p.name.toLowerCase().includes(q);
        const mCode = p.code.toLowerCase().includes(q);
        const mDesc = p.description.toLowerCase().includes(q);
        const mSize = p.size?.toLowerCase().includes(q);
        return mName || mCode || mDesc || mSize;
      }
      return true;
    });
  }, [utensilProducts, selectedSubcategory, selectedGrade, selectedGauge, search]);

  return (
    <div className="bg-[#F7F7F7] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Category Pills & Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedSubcategory('All')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedSubcategory === 'All'
                  ? 'bg-[#F47B20] text-white shadow-sm'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
              }`}
            >
              All Utensils
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedSubcategory === sub
                    ? 'bg-[#F47B20] text-white shadow-sm'
                    : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          <div className="text-xs text-zinc-500 font-semibold self-start sm:self-auto shrink-0 bg-white px-3.5 py-2 rounded-xl border border-zinc-200 shadow-2xs">
            <span>Showing <strong className="text-zinc-900">{filtered.length}</strong> Utensils</span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs mb-8 grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cookware name, capacity, size..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#F47B20]"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedGauge}
              onChange={(e) => setSelectedGauge(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#F47B20]"
            >
              <option value="All">All Gauges</option>
              <option value="16">16 Gauge (Heavy Commercial)</option>
              <option value="18">18 Gauge (Heavy Duty)</option>
              <option value="20">20 Gauge (Standard)</option>
              <option value="22">22 Gauge (Light Duty)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#F47B20]"
            >
              <option value="All">All Steel Grades</option>
              <option value="SS 304">SS 304 (Austenitic Food Grade)</option>
              <option value="SS 201">SS 201 (Economy)</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onViewDetails={onViewDetails}
                onInquire={onInquire}
              />
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-white rounded-2xl border border-zinc-200">
            <Utensils className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-800">No utensil products match your criteria</h3>
            <p className="text-xs text-zinc-500 mt-1">Try resetting the gauge or subcategory filters.</p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedSubcategory('All');
                setSelectedGauge('All');
                setSelectedGrade('All');
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-[#F47B20] text-white text-xs font-bold shadow"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
