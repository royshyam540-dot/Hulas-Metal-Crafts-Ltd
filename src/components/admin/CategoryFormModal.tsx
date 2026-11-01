import React, { useState, useEffect } from 'react';
import { Category } from '../../types';
import { X, Save, Layers, Plus, Trash2 } from 'lucide-react';
import { store } from '../../services/store';
import { useToast } from '../common/Toast';

interface CategoryFormModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  category,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { success, error } = useToast();
  const isEditing = Boolean(category);

  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    image: '',
    displayOrder: 1,
    isActive: true,
    subcategories: []
  });

  const [newSubcategory, setNewSubcategory] = useState('');

  useEffect(() => {
    if (category) {
      setFormData({
        ...category,
        subcategories: category.subcategories || []
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
        displayOrder: 1,
        isActive: true,
        subcategories: []
      });
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleAddSubcategory = () => {
    if (!newSubcategory.trim()) return;
    setFormData((prev) => ({
      ...prev,
      subcategories: [...(prev.subcategories || []), newSubcategory.trim()]
    }));
    setNewSubcategory('');
  };

  const handleRemoveSubcategory = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      subcategories: prev.subcategories?.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      error('Please enter a category name.');
      return;
    }

    const slug = formData.slug?.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    try {
      if (isEditing && category) {
        store.updateCategory(category.id, { ...formData, slug });
        success(`Category "${formData.name}" updated successfully.`);
      } else {
        store.addCategory({
          name: formData.name,
          slug,
          description: formData.description || '',
          image: formData.image || '',
          displayOrder: Number(formData.displayOrder) || 1,
          isActive: formData.isActive ?? true,
          subcategories: formData.subcategories || []
        });
        success(`Category "${formData.name}" created successfully.`);
      }
      onSuccess();
      onClose();
    } catch (err) {
      error('Failed to save category.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-fadeIn">
        
        {/* Header */}
        <div className="bg-[#252525] p-5 text-white flex items-center justify-between border-b-2 border-[#F47B20]">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-[#F47B20]" />
            <h3 className="font-heading text-lg font-bold">
              {isEditing ? `Edit Category: ${category?.name}` : 'Create New Category'}
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Sanitary Dairy Tubing, Stainless Flatware"
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                URL Slug
              </label>
              <input
                type="text"
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. ss-utensils"
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={formData.displayOrder ?? 1}
                onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Banner / Thumbnail Image URL
            </label>
            <input
              type="url"
              value={formData.image || ''}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief summary of products in this category..."
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs"
            />
          </div>

          {/* Subcategories */}
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2.5">
            <label className="block text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Subcategories / Product Lines
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubcategory}
                onChange={(e) => setNewSubcategory(e.target.value)}
                placeholder="New subcategory name..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-300 text-xs bg-white"
              />
              <button
                type="button"
                onClick={handleAddSubcategory}
                className="px-3 py-1.5 rounded-lg bg-[#252525] hover:bg-[#DE6810] text-white text-xs font-bold transition"
              >
                Add
              </button>
            </div>

            {formData.subcategories && formData.subcategories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {formData.subcategories.map((sub, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-zinc-200 text-xs text-zinc-700"
                  >
                    <span>{sub}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubcategory(idx)}
                      className="text-zinc-400 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="catActive"
              checked={formData.isActive ?? true}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded text-[#F47B20] focus:ring-[#F47B20]"
            />
            <label htmlFor="catActive" className="text-xs font-semibold text-zinc-800 cursor-pointer">
              Active Category (Visible on Public Website)
            </label>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#F47B20] hover:bg-[#DE6810] text-white text-xs font-bold shadow"
            >
              <Save className="w-4 h-4" />
              <span>Save Category</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
