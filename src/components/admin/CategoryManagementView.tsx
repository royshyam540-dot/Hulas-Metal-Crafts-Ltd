import React, { useState } from 'react';
import { Category } from '../../types';
import { 
  Layers, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Package, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { useStore, store } from '../../services/store';
import { CategoryFormModal } from './CategoryFormModal';
import { useToast } from '../common/Toast';

export const CategoryManagementView: React.FC = () => {
  const { categories, products } = useStore();
  const { success, error } = useToast();

  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (cat: Category) => {
    const res = store.deleteCategory(cat.id);
    if (res.success) {
      success(res.message);
    } else {
      error(res.message);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="font-heading text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#F47B20]" />
            Category & Subcategory Architecture
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage primary manufacturing product divisions, subcategories, display ordering, and public visibility.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCategory(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F47B20] hover:bg-[#DE6810] text-white text-xs font-bold transition shadow cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-2xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
          />
        </div>
        <div className="text-xs text-zinc-500">
          Total Categories: <strong className="text-zinc-900">{categories.length}</strong>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCategories.map((cat) => {
          const productCount = products.filter((p) => p.category === cat.name).length;

          return (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Image Banner */}
                <div className="aspect-16/7 w-full bg-zinc-100 relative overflow-hidden">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                    <div>
                      <h3 className="font-heading text-lg font-bold">{cat.name}</h3>
                      <span className="text-[11px] text-zinc-300 font-mono">slug: /{cat.slug}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#F47B20] text-white text-xs font-bold shadow">
                      {productCount} Products
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    {cat.description}
                  </p>

                  {/* Subcategories list */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Subcategories / Product Lines:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.subcategories?.map((sub, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-xs font-medium border border-zinc-200"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-xs">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  cat.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'
                }`}>
                  {cat.isActive ? 'Active on Public Site' : 'Inactive'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingCategory(cat);
                      setIsFormOpen(true);
                    }}
                    className="p-1.5 rounded-lg hover:bg-zinc-200 text-blue-600 transition"
                    title="Edit Category"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition"
                    title={productCount > 0 ? "Cannot delete: contains products" : "Delete Category"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Form Modal */}
      <CategoryFormModal
        category={editingCategory}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCategory(null);
        }}
        onSuccess={() => {
          // Store triggers automatic reactive updates
        }}
      />

    </div>
  );
};
