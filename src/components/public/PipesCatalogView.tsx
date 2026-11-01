import React, { useState, useMemo } from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { 
  Cpu, 
  Search, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Download 
} from 'lucide-react';
import { useStore, store } from '../../services/store';

interface PipesCatalogViewProps {
  onViewDetails: (product: Product) => void;
  onInquire: (product: Product) => void;
}

export const PipesCatalogView: React.FC<PipesCatalogViewProps> = ({
  onViewDetails,
  onInquire
}) => {
  const { products, settings } = useStore();

  const [search, setSearch] = useState('');
  const [selectedShape, setSelectedShape] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedStandard, setSelectedStandard] = useState('All');

  const pipeProducts = useMemo(() => {
    return products.filter((p) => p.category === 'SS Pipes' && p.isActive && p.displayStatus === 'Published');
  }, [products]);

  const filtered = useMemo(() => {
    return pipeProducts.filter((p) => {
      if (selectedShape !== 'All' && p.pipeShape !== selectedShape) return false;
      if (selectedGrade !== 'All' && p.grade !== selectedGrade) return false;
      if (selectedStandard !== 'All' && !p.standard?.includes(selectedStandard)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const mName = p.name.toLowerCase().includes(q);
        const mCode = p.code.toLowerCase().includes(q);
        const mSize = p.pipeSize?.toLowerCase().includes(q);
        const mOD = p.outerDiameter?.toLowerCase().includes(q);
        const mStd = p.standard?.toLowerCase().includes(q);
        return mName || mCode || mSize || mOD || mStd;
      }
      return true;
    });
  }, [pipeProducts, selectedShape, selectedGrade, selectedStandard, search]);

  return (
    <div className="bg-[#F7F7F7] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Shape Pills & Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Round', 'Square', 'Rectangular'].map((shape) => (
              <button
                key={shape}
                onClick={() => setSelectedShape(shape)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedShape === shape
                    ? 'bg-[#F47B20] text-white shadow-sm'
                    : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
                }`}
              >
                {shape === 'All' ? 'All Pipe Profiles' : `${shape} Pipes`}
              </button>
            ))}
          </div>

          <div className="text-xs text-zinc-500 font-semibold self-start sm:self-auto shrink-0 bg-white px-3.5 py-2 rounded-xl border border-zinc-200 shadow-2xs">
            <span>Showing <strong className="text-zinc-900">{filtered.length}</strong> Pipes</span>
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
              placeholder="Search outer diameter (e.g. 50.8mm), pipe size, ASTM standard..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#F47B20]"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#F47B20]"
            >
              <option value="All">All Grades (SS 304, SS 202, etc.)</option>
              <option value="SS 304">SS 304 (Industrial Standard)</option>
              <option value="SS 202">SS 202 (Architectural & Commercial)</option>
              <option value="SS 201">SS 201 (Economy)</option>
              <option value="SS 316L">SS 316L (Acid/Marine)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#F47B20]"
            >
              <option value="All">All Standards</option>
              <option value="ASTM A554">ASTM A554 (Ornamental)</option>
              <option value="ASTM A312">ASTM A312 (Seamless Fluid)</option>
              <option value="DIN 11850">DIN 11850 (Sanitary Dairy)</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
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
            <Cpu className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-800">No pipe products match your filters</h3>
            <p className="text-xs text-zinc-500 mt-1">Try resetting the section shape or standard filters.</p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedShape('All');
                setSelectedGrade('All');
                setSelectedStandard('All');
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
