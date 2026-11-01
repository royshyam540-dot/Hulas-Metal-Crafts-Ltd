import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductCategoryType, SSGrade, CustomSpecification } from '../../types';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  UploadCloud, 
  ImageIcon, 
  FileText, 
  Layers, 
  Sparkles, 
  Cpu, 
  Utensils, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useStore, store } from '../../services/store';
import { useToast } from '../common/Toast';

interface ProductFormModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { categories } = useStore();
  const { success, error } = useToast();

  const isEditing = Boolean(product);
  const [activeTab, setActiveTab] = useState<'basic' | 'pipe_thickness' | 'media' | 'custom'>('basic');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Form State (Product code is handled internally without user input)
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'SS Utensils',
    subcategory: '',
    size: '',
    gauge: '18 Gauge',
    thickness: '1.2 mm',
    grade: 'SS 304',
    image: '',
    galleryImages: [],
    pdfCatalogueUrl: '',
    description: '',
    technicalSpecs: '',
    price: 0,
    showPrice: false,
    isFeatured: false,
    isActive: true,
    displayStatus: 'Published',
    availabilityStatus: 'In Stock',
    stockQuantity: 100,
    minStockLevel: 20,
    minimumOrderQuantity: 10,
    unitOfMeasurement: 'Pcs',
    customSpecs: [],

    // Utensil specific
    diameter: '',
    capacity: '',
    finish: 'Mirror Polish',
    shape: 'Round',
    packagingDetails: '',

    // Pipe specific
    pipeSize: '',
    outerDiameter: '',
    innerDiameter: '',
    pipeLength: '6.0 Meters',
    surfaceFinish: '600# Super Mirror Polish',
    pipeShape: 'Round',
    pipeType: 'Welded (ERW/TIG)',
    standard: 'ASTM A554',
    weightPerMeter: '1.85 kg/m'
  });

  const [useUrlForImage, setUseUrlForImage] = useState(false);
  const [newCustomKey, setNewCustomKey] = useState('');
  const [newCustomVal, setNewCustomVal] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        galleryImages: product.galleryImages || [],
        customSpecs: product.customSpecs || []
      });
    } else {
      setFormData({
        name: '',
        category: 'SS Utensils',
        subcategory: 'Cookware & Pots',
        size: '',
        gauge: '18 Gauge',
        thickness: '1.2 mm',
        grade: 'SS 304',
        image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
        galleryImages: [],
        pdfCatalogueUrl: '',
        description: '',
        technicalSpecs: '',
        price: 0,
        showPrice: false,
        isFeatured: false,
        isActive: true,
        displayStatus: 'Published',
        availabilityStatus: 'In Stock',
        stockQuantity: 100,
        minStockLevel: 20,
        minimumOrderQuantity: 10,
        unitOfMeasurement: 'Pcs',
        customSpecs: [],
        diameter: '240 mm',
        finish: 'Mirror Polish',
        shape: 'Round',
        pipeSize: '2 Inch NB',
        outerDiameter: '50.8 mm',
        innerDiameter: '47.8 mm',
        pipeLength: '6.0 Meters',
        surfaceFinish: '600# Super Mirror Polish',
        pipeShape: 'Round',
        pipeType: 'Welded (ERW/TIG)',
        standard: 'ASTM A554',
        weightPerMeter: '1.85 kg/m'
      });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  // Direct PC Image Upload Handlers
  const handleMainImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      error('Please select an image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormData((prev) => ({ ...prev, image: dataUrl }));
      success(`Image "${file.name}" uploaded from PC!`);
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: string[] = [];
    let processed = 0;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newImages.push(event.target.result as string);
          }
          processed++;
          if (processed === files.length) {
            setFormData((prev) => ({
              ...prev,
              galleryImages: [...(prev.galleryImages || []), ...newImages]
            }));
            success(`Uploaded ${newImages.length} images from PC to gallery!`);
          }
        };
        reader.readAsDataURL(file);
      } else {
        processed++;
      }
    });
  };

  const handleRemoveGalleryImage = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages?.filter((_, i) => i !== idx)
    }));
  };

  const handleAddCustomSpec = () => {
    if (!newCustomKey.trim() || !newCustomVal.trim()) return;
    const newSpec: CustomSpecification = {
      id: 'cs-' + Date.now(),
      key: newCustomKey.trim(),
      value: newCustomVal.trim()
    };
    setFormData((prev) => ({
      ...prev,
      customSpecs: [...(prev.customSpecs || []), newSpec]
    }));
    setNewCustomKey('');
    setNewCustomVal('');
  };

  const handleRemoveCustomSpec = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      customSpecs: prev.customSpecs?.filter((cs) => cs.id !== id)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      error('Please enter Item Name.');
      return;
    }

    // Auto-generate SKU / Code behind the scenes so the user never has to enter product code
    const generatedCode =
      (isEditing && product?.code)
        ? product.code
        : `HMC-${formData.category === 'SS Pipes' ? 'PIP' : 'UT'}-${Date.now().toString().slice(-4)}`;

    const payload = {
      ...formData,
      code: generatedCode
    };

    try {
      if (isEditing && product) {
        store.updateProduct(product.id, payload);
        success(`Item "${formData.name}" updated successfully.`);
      } else {
        store.addProduct(payload as any);
        success(`Item "${formData.name}" added to catalog.`);
      }
      onSuccess();
      onClose();
    } catch (err) {
      error('Failed to save item details.');
    }
  };

  const isPipes = formData.category === 'SS Pipes';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden my-6 animate-fadeIn">
        
        {/* Header */}
        <div className="bg-[#252525] p-5 text-white flex items-center justify-between border-b-2 border-[#F47B20]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#DE6810] flex items-center justify-center text-white">
              {isPipes ? <Cpu className="w-5 h-5" /> : <Utensils className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white">
                {isEditing ? `Edit Item: ${product?.name}` : 'Add New Manufacturing Item'}
              </h3>
              <p className="text-xs text-zinc-400">
                Item Name, Size, Gauge, Thickness, Stainless Steel Grade & Direct PC Upload
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-zinc-100 px-6 pt-3 border-b border-zinc-200 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition cursor-pointer border-t-2 shrink-0 ${
              activeTab === 'basic'
                ? 'bg-white text-[#DE6810] border-[#F47B20] shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900 border-transparent'
            }`}
          >
            1. Item Details (Name, Size, Gauge)
          </button>

          {isPipes && (
            <button
              type="button"
              onClick={() => setActiveTab('pipe_thickness')}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition cursor-pointer border-t-2 shrink-0 ${
                activeTab === 'pipe_thickness'
                  ? 'bg-white text-[#DE6810] border-[#F47B20] shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900 border-transparent'
              }`}
            >
              2. Pipe Thickness & Grades (304 / 202)
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition cursor-pointer border-t-2 shrink-0 ${
              activeTab === 'media'
                ? 'bg-white text-[#DE6810] border-[#F47B20] shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900 border-transparent'
            }`}
          >
            {isPipes ? '3' : '2'}. Direct PC Image Upload
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition cursor-pointer border-t-2 shrink-0 ${
              activeTab === 'custom'
                ? 'bg-white text-[#DE6810] border-[#F47B20] shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900 border-transparent'
            }`}
          >
            {isPipes ? '4' : '3'}. Additional Custom Specs ({formData.customSpecs?.length || 0})
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
            
            {/* TAB 1: ITEM NAME, SIZE, GAUGE & BASIC DETAILS */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                
                {/* Primary Requirement: Items Name, Size, Gauge */}
                <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200/90 space-y-3">
                  <span className="text-[11px] font-bold text-[#DE6810] uppercase tracking-wider block">
                    Core Item Specifications
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* 1. Item Name */}
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold text-zinc-900 mb-1">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Hulas Royal SS Cookpot / SS 304 Welded Round Pipe"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-semibold focus:ring-2 focus:ring-[#F47B20] focus:outline-none bg-white shadow-2xs"
                      />
                    </div>

                    {/* 2. Size */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-900 mb-1">
                        Size *
                      </label>
                      <input
                        type="text"
                        required
                        value={isPipes ? (formData.pipeSize || '') : (formData.size || '')}
                        onChange={(e) => {
                          if (isPipes) {
                            setFormData({ ...formData, pipeSize: e.target.value, size: e.target.value });
                          } else {
                            setFormData({ ...formData, size: e.target.value, pipeSize: e.target.value });
                          }
                        }}
                        placeholder={isPipes ? "e.g. 2 Inch NB / 50.8mm OD" : "e.g. No. 12 (24cm) / 13 Inch"}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none bg-white font-medium"
                      />
                    </div>

                    {/* 3. Gauge */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-900 mb-1">
                        Gauge *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.gauge || ''}
                        onChange={(e) => setFormData({ ...formData, gauge: e.target.value })}
                        placeholder="e.g. 18 Gauge / 16 Gauge / 14G"
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none bg-white font-medium"
                      />
                    </div>

                    {/* 4. Steel Grade (SS 304 & SS 202 prominent) */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-900 mb-1">
                        Steel Grade *
                      </label>
                      <select
                        value={formData.grade || 'SS 304'}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value as SSGrade })}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs bg-white font-semibold focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
                      >
                        <option value="SS 304">SS 304 (Industrial & Food Standard)</option>
                        <option value="SS 202">SS 202 (Commercial & Architectural)</option>
                        <option value="SS 201">SS 201 (Economy)</option>
                        <option value="SS 316L">SS 316L (Acid & Marine Fluid)</option>
                        <option value="SS 430">SS 430 (Ferritic)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Category & Subcategory */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Manufacturing Category *
                    </label>
                    <select
                      value={formData.category || 'SS Utensils'}
                      onChange={(e) => {
                        const cat = e.target.value as ProductCategoryType;
                        setFormData({ 
                          ...formData, 
                          category: cat,
                          subcategory: cat === 'SS Pipes' ? 'Round Ornamental Pipes' : 'Cookware & Pots'
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#F47B20]"
                    >
                      <option value="SS Utensils">SS Utensils</option>
                      <option value="SS Pipes">SS Pipes</option>
                      <option value="Industrial Fittings">Industrial Fittings</option>
                      <option value="Custom Metal Craft">Custom Metal Craft</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Subcategory / Product Line
                    </label>
                    <input
                      type="text"
                      value={formData.subcategory || ''}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                      placeholder="e.g. Cookware & Pots, Round Pipes, Dinner Sets"
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Product Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter overview, material attributes, and application recommendations..."
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
                  />
                </div>

                {/* Inventory & Stock Controls */}
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                  <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                    Inventory & Order Settings
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Current Stock
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.stockQuantity ?? 0}
                        onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Safety Min Alert
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.minStockLevel ?? 10}
                        onChange={(e) => setFormData({ ...formData, minStockLevel: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Min Order Qty (MOQ)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.minimumOrderQuantity ?? 1}
                        onChange={(e) => setFormData({ ...formData, minimumOrderQuantity: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Unit
                      </label>
                      <input
                        type="text"
                        value={formData.unitOfMeasurement || 'Pcs'}
                        onChange={(e) => setFormData({ ...formData, unitOfMeasurement: e.target.value })}
                        placeholder="Pcs, Sets, Meters"
                        className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-200 flex flex-wrap items-center gap-6 text-xs">
                    <label className="flex items-center gap-2 font-semibold text-zinc-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured || false}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        className="rounded text-[#F47B20] focus:ring-[#F47B20]"
                      />
                      <span>Featured Product</span>
                    </label>

                    <label className="flex items-center gap-2 font-semibold text-zinc-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive ?? true}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="rounded text-[#F47B20] focus:ring-[#F47B20]"
                      />
                      <span>Published / Active</span>
                    </label>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: PIPE DEDICATED THICKNESS & GRADES 304 / 202 SECTION */}
            {activeTab === 'pipe_thickness' && isPipes && (
              <div className="space-y-5">
                
                {/* Highlighted Banner for Grade 304 & 202 */}
                <div className="p-4 rounded-xl bg-zinc-900 text-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F47B20] block">
                      Stainless Steel Pipe Metallurgy
                    </span>
                    <h4 className="font-heading text-sm font-bold mt-0.5">
                      Grades 304 & 202 Precision Specification
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, grade: 'SS 304' })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        formData.grade === 'SS 304' ? 'bg-[#F47B20] text-white' : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      SS 304
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, grade: 'SS 202' })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        formData.grade === 'SS 202' ? 'bg-[#F47B20] text-white' : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      SS 202
                    </button>
                  </div>
                </div>

                {/* DEDICATED THICKNESS SECTION */}
                <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-orange-200/80 pb-2">
                    <h4 className="font-heading text-xs font-bold text-[#DE6810] uppercase tracking-wider flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-[#F47B20]" />
                      Dedicated Pipe Thickness & Dimensional Section
                    </h4>
                    <span className="text-[11px] text-zinc-500 font-medium">Standard & Custom Rolling</span>
                  </div>

                  {/* Quick Select Thickness Chips */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                      Select or Preset Wall Thickness:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['0.8 mm', '1.0 mm', '1.2 mm', '1.5 mm', '2.0 mm', '2.5 mm', '3.0 mm', 'Schedule 40 (3.68mm)'].map((th) => (
                        <button
                          key={th}
                          type="button"
                          onClick={() => setFormData({ ...formData, thickness: th })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                            formData.thickness === th
                              ? 'bg-[#F47B20] text-white border-[#F47B20] shadow-xs'
                              : 'bg-white text-zinc-700 border-zinc-200 hover:border-orange-300'
                          }`}
                        >
                          {th}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Thickness Inputs Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-zinc-900 mb-1">
                        Wall Thickness (mm / Schedule) *
                      </label>
                      <input
                        type="text"
                        value={formData.thickness || ''}
                        onChange={(e) => setFormData({ ...formData, thickness: e.target.value })}
                        placeholder="e.g. 1.5 mm"
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-zinc-900 mb-1">
                        Pipe Gauge Equivalent *
                      </label>
                      <input
                        type="text"
                        value={formData.gauge || ''}
                        onChange={(e) => setFormData({ ...formData, gauge: e.target.value })}
                        placeholder="e.g. 16 Gauge / 14 Gauge"
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-zinc-900 mb-1">
                        Outer Diameter (OD)
                      </label>
                      <input
                        type="text"
                        value={formData.outerDiameter || ''}
                        onChange={(e) => setFormData({ ...formData, outerDiameter: e.target.value })}
                        placeholder="e.g. 50.8 mm (2 Inch)"
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">
                        Inner Diameter (ID)
                      </label>
                      <input
                        type="text"
                        value={formData.innerDiameter || ''}
                        onChange={(e) => setFormData({ ...formData, innerDiameter: e.target.value })}
                        placeholder="e.g. 47.8 mm"
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">
                        Standard Length
                      </label>
                      <input
                        type="text"
                        value={formData.pipeLength || '6.0 Meters'}
                        onChange={(e) => setFormData({ ...formData, pipeLength: e.target.value })}
                        placeholder="e.g. 6.0 Meters (20 Feet)"
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-zinc-700 mb-1">
                        Weight per Meter
                      </label>
                      <input
                        type="text"
                        value={formData.weightPerMeter || ''}
                        onChange={(e) => setFormData({ ...formData, weightPerMeter: e.target.value })}
                        placeholder="e.g. 1.85 kg/m"
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Pipe Profile & Standards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">Pipe Section Shape</label>
                    <select
                      value={formData.pipeShape || 'Round'}
                      onChange={(e) => setFormData({ ...formData, pipeShape: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white"
                    >
                      <option value="Round">Round Pipe</option>
                      <option value="Square">Square Section (SHS)</option>
                      <option value="Rectangular">Rectangular Section</option>
                      <option value="Oval">Oval Decorative</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">Surface Finish</label>
                    <input
                      type="text"
                      value={formData.surfaceFinish || ''}
                      onChange={(e) => setFormData({ ...formData, surfaceFinish: e.target.value })}
                      placeholder="e.g. 600# Mirror Polish / Satin Hairline"
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">Industry Standard</label>
                    <input
                      type="text"
                      value={formData.standard || ''}
                      onChange={(e) => setFormData({ ...formData, standard: e.target.value })}
                      placeholder="e.g. ASTM A554 / ASTM A312"
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300"
                    />
                  </div>
                </div>

              </div>
            )}

            {/* TAB: DIRECT PC IMAGE UPLOAD SECTION */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                
                {/* 1. Main Product Image - Direct PC Upload */}
                <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-heading text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                        <UploadCloud className="w-4 h-4 text-[#F47B20]" />
                        Direct PC Image Upload (Main Image)
                      </h4>
                      <p className="text-[11px] text-zinc-500">
                        Upload a photo directly from your computer (PNG, JPG, WEBP).
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setUseUrlForImage(!useUrlForImage)}
                      className="text-[11px] font-semibold text-[#DE6810] hover:underline"
                    >
                      {useUrlForImage ? 'Switch to PC File Upload' : 'Or paste URL'}
                    </button>
                  </div>

                  {!useUrlForImage ? (
                    /* Direct PC Upload Box */
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleMainImageFileUpload}
                        className="hidden"
                      />

                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-zinc-300 hover:border-[#F47B20] bg-white rounded-xl p-6 text-center cursor-pointer transition group"
                      >
                        <div className="w-12 h-12 rounded-full bg-orange-50 group-hover:bg-[#F47B20] text-[#F47B20] group-hover:text-white flex items-center justify-center mx-auto mb-2 transition">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-xs text-zinc-800 block">
                          Click to Browse Image from PC
                        </span>
                        <span className="text-[10px] text-zinc-400 mt-1 block">
                          Supports PNG, JPG, JPEG, WEBP files
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* URL fallback input */
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Image URL Link
                      </label>
                      <input
                        type="url"
                        value={formData.image || ''}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs bg-white"
                      />
                    </div>
                  )}

                  {/* Main Image Preview */}
                  {formData.image && (
                    <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-zinc-200">
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-zinc-300 shrink-0 bg-zinc-100">
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-xs text-zinc-900 block truncate">
                          Image Loaded Successfully
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          Ready for catalog display
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="p-1.5 text-zinc-400 hover:text-red-600 transition"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Gallery Images - Direct PC Multiple Upload */}
                <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-heading text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[#F47B20]" />
                        Direct PC Gallery Upload (Multiple Images)
                      </h4>
                      <p className="text-[11px] text-zinc-500">
                        Select multiple photos from your PC to show different angles or finishes.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => galleryFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-[#252525] hover:bg-[#DE6810] text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Upload Files from PC</span>
                    </button>
                  </div>

                  <input
                    type="file"
                    ref={galleryFileInputRef}
                    multiple
                    accept="image/*"
                    onChange={handleGalleryFilesUpload}
                    className="hidden"
                  />

                  {formData.galleryImages && formData.galleryImages.length > 0 ? (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 pt-2">
                      {formData.galleryImages.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-300 group shadow-2xs">
                          <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(idx)}
                            className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div 
                      onClick={() => galleryFileInputRef.current?.click()}
                      className="p-6 text-center border-2 border-dashed border-zinc-200 rounded-xl bg-white hover:border-[#F47B20] cursor-pointer transition text-xs text-zinc-400"
                    >
                      No gallery images uploaded yet. Click to select files from PC.
                    </div>
                  )}
                </div>

                {/* PDF Catalog */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Technical PDF Catalogue Document Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.pdfCatalogueUrl || ''}
                    onChange={(e) => setFormData({ ...formData, pdfCatalogueUrl: e.target.value })}
                    placeholder="https://example.com/spec-sheet.pdf"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs"
                  />
                </div>

              </div>
            )}

            {/* TAB: CUSTOM SPECIFICATIONS */}
            {activeTab === 'custom' && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-xs text-[#DE6810] leading-relaxed">
                  <strong>Custom Specification Rows:</strong> Add any specialized manufacturing specification without modifying database structures.
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCustomKey}
                    onChange={(e) => setNewCustomKey(e.target.value)}
                    placeholder="Spec Name (e.g. Bend Test / Hydrostatic Rating)"
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 text-xs"
                  />
                  <input
                    type="text"
                    value={newCustomVal}
                    onChange={(e) => setNewCustomVal(e.target.value)}
                    placeholder="Value (e.g. 150 Bar Tested)"
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSpec}
                    className="px-4 py-2 rounded-lg bg-[#252525] hover:bg-[#DE6810] text-white text-xs font-bold transition shrink-0 cursor-pointer"
                  >
                    Add Row
                  </button>
                </div>

                {formData.customSpecs && formData.customSpecs.length > 0 ? (
                  <div className="border border-zinc-200 rounded-xl overflow-hidden divide-y divide-zinc-200 text-xs">
                    {formData.customSpecs.map((cs) => (
                      <div key={cs.id} className="flex items-center justify-between p-2.5 bg-white hover:bg-zinc-50">
                        <div>
                          <strong className="text-zinc-800">{cs.key}:</strong>{' '}
                          <span className="text-zinc-600">{cs.value}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomSpec(cs.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-zinc-400 text-xs bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
                    No custom specifications added yet.
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Footer Controls */}
          <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-zinc-300 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#F47B20] hover:bg-[#DE6810] text-white font-bold text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Save Item Changes' : 'Create Item'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
