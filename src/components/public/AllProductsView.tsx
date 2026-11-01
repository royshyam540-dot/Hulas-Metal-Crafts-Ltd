import React, { useState, useMemo } from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  RotateCcw, 
  Package, 
  Layers, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { useStore } from '../../services/store';

interface AllProductsViewProps {
  onViewDetails: (product: Product) => void;
  onInquire: (product: Product) => void;
}

export const AllProductsView: React.FC<AllProductsViewProps> = ({
  onViewDetails,
  onInquire
}) => {
  const { products, categories } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'alpha-asc' | 'alpha-desc'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter and sort
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => p.isActive && p.displayStatus === 'Published')
      .filter((p) => {
        if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
        if (selectedGrade !== 'All' && p.grade !== selectedGrade) return false;
        if (selectedAvailability !== 'All' && p.availabilityStatus !== selectedAvailability) return false;
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(query);
          const matchCode = p.code.toLowerCase().includes(query);
          const matchDesc = p.description.toLowerCase().includes(query);
          const matchSub = p.subcategory?.toLowerCase().includes(query);
          return matchName || matchCode || matchDesc || matchSub;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'alpha-asc') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'alpha-desc') {
          return b.name.localeCompare(a.name);
        }
        return 0;
      });
  }, [products, selectedCategory, selectedGrade, selectedAvailability, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedGrade('All');
    setSelectedAvailability('All');
    setSortBy('newest');
    setCurrentPage(1);
  };

  return (
    <div className="bg-[#F7F7F7] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="bg-white rounded-2xl p-8 border border-zinc-200 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-[#DE6810] text-xs font-bold uppercase tracking-wider mb-2">
                <Package className="w-3.5 h-3.5" />
                <span>Product Master Catalog</span>
              </div>
              <h1 className="font-heading text-3xl font-extrabold text-[#252525]">
                Complete Stainless Steel Product Directory
              </h1>
              <p className="text-sm text-zinc-600 mt-1">
                Browse our comprehensive range of food-grade SS utensils and heavy industrial SS pipes.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500 bg-zinc-50 px-4 py-2.5 rounded-xl border border-zinc-200">
              <span>Showing: <strong className="text-zinc-900">{filteredProducts.length}</strong> Products</span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-6 pt-6 border-t border-zinc-100">
            {/* Search Input */}
            <div className="md:col-span-4 relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name, SKU (e.g. HMC-UT-TOP-01), grade..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#F47B20] bg-white"
              />
            </div>

            {/* Category Filter */}
            <div className="md:col-span-2">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#F47B20]"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Grade Filter */}
            <div className="md:col-span-2">
              <select
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#F47B20]"
              >
                <option value="All">All SS Grades</option>
                <option value="SS 304">SS 304 (Standard)</option>
                <option value="SS 202">SS 202 (Commercial & Architectural)</option>
                <option value="SS 201">SS 201 (Economy)</option>
                <option value="SS 316L">SS 316L (Acid/Marine)</option>
                <option value="SS 430">SS 430</option>
              </select>
            </div>

            {/* Availability Filter */}
            <div className="md:col-span-2">
              <select
                value={selectedAvailability}
                onChange={(e) => {
                  setSelectedAvailability(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#F47B20]"
              >
                <option value="All">All Stock Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Made to Order">Made to Order</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="md:col-span-2 flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#F47B20]"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="alpha-asc">Alphabetical (A-Z)</option>
                <option value="alpha-desc">Alphabetical (Z-A)</option>
              </select>

              {(searchQuery || selectedCategory !== 'All' || selectedGrade !== 'All' || selectedAvailability !== 'All') && (
                <button
                  onClick={handleResetFilters}
                  title="Reset Filters"
                  className="p-2.5 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-zinc-600 transition shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {paginatedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={onViewDetails}
                onInquire={onInquire}
              />
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-white rounded-2xl border border-zinc-200">
            <Package className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-zinc-800">No products match your filters</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search query, selecting "All Categories", or resetting the filter options.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 rounded-lg bg-[#F47B20] text-white text-xs font-bold shadow transition cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="p-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-xl text-xs font-bold transition cursor-pointer ${
                    currentPage === page
                      ? 'bg-[#F47B20] text-white shadow-md'
                      : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="p-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
