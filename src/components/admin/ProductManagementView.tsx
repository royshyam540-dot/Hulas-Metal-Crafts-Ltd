import React, { useState, useMemo } from 'react';
import { Product } from '../../types';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  Download, 
  CheckSquare, 
  Square, 
  Filter, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  ArrowUpDown 
} from 'lucide-react';
import { useStore, store } from '../../services/store';
import { ProductFormModal } from './ProductFormModal';
import { useToast } from '../common/Toast';

interface ProductManagementViewProps {
  onViewProductDetail: (product: Product) => void;
}

export const ProductManagementView: React.FC<ProductManagementViewProps> = ({
  onViewProductDetail
}) => {
  const { products, categories } = useStore();
  const { success, error } = useToast();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedStock, setSelectedStock] = useState('All');

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCat !== 'All' && p.category !== selectedCat) return false;
      if (selectedGrade !== 'All' && p.grade !== selectedGrade) return false;
      if (selectedStock === 'Low' && p.stockQuantity > p.minStockLevel) return false;
      if (selectedStock === 'Out' && p.stockQuantity > 0) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const mName = p.name.toLowerCase().includes(q);
        const mCode = p.code.toLowerCase().includes(q);
        const mSub = p.subcategory?.toLowerCase().includes(q);
        return mName || mCode || mSub;
      }
      return true;
    });
  }, [products, selectedCat, selectedGrade, selectedStock, search]);

  const handleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkActivate = (isActive: boolean) => {
    if (selectedIds.length === 0) return;
    store.bulkUpdateProductStatus(selectedIds, isActive);
    success(`Updated ${selectedIds.length} products to ${isActive ? 'Active' : 'Draft'}.`);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to permanently delete ${selectedIds.length} selected products?`)) {
      store.bulkDeleteProducts(selectedIds);
      success(`Deleted ${selectedIds.length} products.`);
      setSelectedIds([]);
    }
  };

  const confirmDeleteSingle = () => {
    if (!deleteCandidate) return;
    store.deleteProduct(deleteCandidate.id);
    success(`Product ${deleteCandidate.name} deleted.`);
    setDeleteCandidate(null);
  };

  const handleExportCSV = () => {
    const headers = [
      'ID', 'Name', 'Code/SKU', 'Category', 'Subcategory', 'Grade', 'Gauge', 'Size',
      'Stock Qty', 'Min Stock', 'MOQ', 'Unit', 'Price', 'Active', 'Featured', 'Status'
    ];
    const rows = filteredProducts.map((p) => [
      `"${p.id}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.code}"`,
      `"${p.category}"`,
      `"${p.subcategory || ''}"`,
      `"${p.grade || ''}"`,
      `"${p.gauge || ''}"`,
      `"${p.size || p.pipeSize || ''}"`,
      p.stockQuantity,
      p.minStockLevel,
      p.minimumOrderQuantity,
      `"${p.unitOfMeasurement}"`,
      p.price || 0,
      p.isActive ? 'Active' : 'Inactive',
      p.isFeatured ? 'Yes' : 'No',
      `"${p.availabilityStatus}"`
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hulas-products-catalog-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="font-heading text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-[#F47B20]" />
            Product Management & Technical Catalog
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Complete CRUD operations for SS Utensils and SS Pipes, technical specs, pricing, and media.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingProduct(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F47B20] hover:bg-[#DE6810] text-white text-xs font-bold transition shadow cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Bulk Action Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search item name, size, gauge..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#F47B20]"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Grade Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#F47B20]"
            >
              <option value="All">All Grades</option>
              <option value="SS 304">SS 304</option>
              <option value="SS 316L">SS 316L</option>
              <option value="SS 201">SS 201</option>
            </select>
          </div>

          {/* Stock Level Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#F47B20]"
            >
              <option value="All">All Stock</option>
              <option value="Low">Low Stock Alert</option>
              <option value="Out">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Bar (when selected) */}
        {selectedIds.length > 0 && (
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs bg-orange-50/60 p-2.5 rounded-xl border border-orange-200">
            <span className="font-bold text-[#DE6810]">
              {selectedIds.length} Products Selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkActivate(true)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
              >
                Mark Active
              </button>
              <button
                onClick={() => handleBulkActivate(false)}
                className="px-2.5 py-1 rounded-lg bg-zinc-700 hover:bg-zinc-800 text-white font-semibold text-xs"
              >
                Mark Draft
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={handleSelectAll}
                    className="rounded text-[#F47B20] focus:ring-[#F47B20]"
                  />
                </th>
                <th className="py-3 px-3 font-semibold">Image</th>
                <th className="py-3 px-3 font-semibold">Item Name, Size & Gauge</th>
                <th className="py-3 px-3 font-semibold">Category</th>
                <th className="py-3 px-3 font-semibold">Grade & Thickness</th>
                <th className="py-3 px-3 font-semibold">Stock Qty</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold">Featured</th>
                <th className="py-3 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredProducts.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                const isLowStock = p.stockQuantity <= p.minStockLevel && p.stockQuantity > 0;
                const isOut = p.stockQuantity <= 0;

                return (
                  <tr key={p.id} className={`hover:bg-zinc-50 transition ${isSelected ? 'bg-orange-50/30' : ''}`}>
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(p.id)}
                        className="rounded text-[#F47B20] focus:ring-[#F47B20]"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <div className="w-12 h-10 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-zinc-900 truncate max-w-xs">{p.name}</div>
                      <div className="text-[11px] text-zinc-500 font-medium">
                        Size: <span className="text-zinc-800 font-semibold">{p.size || p.pipeSize || 'Standard'}</span>
                        {' '}&bull;{' '}
                        Gauge: <span className="text-[#DE6810] font-semibold">{p.gauge || 'Std'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-zinc-700 block">{p.category}</span>
                      <span className="text-[10px] text-zinc-400">{p.subcategory || 'General'}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-zinc-900 block">{p.grade || 'SS 304'}</span>
                      <span className="text-[10px] text-zinc-500 font-medium">
                        Thick: {p.thickness || 'Standard'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className={`font-bold ${isOut ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-zinc-900'}`}>
                        {p.stockQuantity} {p.unitOfMeasurement}
                      </div>
                      <div className="text-[10px] text-zinc-400">Min: {p.minStockLevel}</div>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => store.updateProduct(p.id, { isActive: !p.isActive })}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
                          p.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
                        }`}
                        title="Click to toggle active status"
                      >
                        {p.isActive ? 'Active' : 'Draft'}
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => store.updateProduct(p.id, { isFeatured: !p.isFeatured })}
                        className={`p-1 rounded cursor-pointer transition ${
                          p.isFeatured ? 'text-[#DE6810]' : 'text-zinc-300 hover:text-zinc-500'
                        }`}
                        title="Toggle Featured"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewProductDetail(p)}
                          className="p-1 rounded hover:bg-zinc-100 text-zinc-600 transition"
                          title="View Technical Specs"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setIsFormOpen(true);
                          }}
                          className="p-1 rounded hover:bg-zinc-100 text-blue-600 transition"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(p)}
                          className="p-1 rounded hover:bg-zinc-100 text-red-600 transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-12 text-center text-zinc-400 text-xs">
            No products match the selected filters.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-zinc-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-zinc-900">
                Confirm Product Deletion
              </h3>
              <p className="text-xs text-zinc-600 mt-1">
                Are you sure you want to permanently delete <strong>{deleteCandidate.name}</strong> ({deleteCandidate.code})? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 rounded-lg border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSingle}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      <ProductFormModal
        product={editingProduct}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={() => {
          // Store triggers automatic reactive updates
        }}
      />

    </div>
  );
};
