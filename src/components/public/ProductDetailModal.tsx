import React, { useState } from 'react';
import { Product } from '../../types';
import { 
  X, 
  Send, 
  MessageSquare, 
  FileDown, 
  CheckCircle, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Tag, 
  Cpu, 
  Maximize2 
} from 'lucide-react';
import { useStore, store } from '../../services/store';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onInquire: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onInquire
}) => {
  const { settings } = useStore();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!isOpen || !product) return null;

  const showPrice = product.showPrice ?? settings.showPricesGlobally;
  const gallery = [product.image, ...(product.galleryImages || [])];
  const selectedImage = gallery[activeImageIndex] || product.image;

  const handleWhatsApp = () => {
    const url = store.generateProductWhatsAppUrl(product);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-zinc-300 overflow-hidden my-6 animate-fadeIn">
        
        {/* Header */}
        <div className="bg-[#252525] px-6 py-4 text-white flex items-center justify-between border-b-2 border-[#F47B20]">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#F47B20] text-white text-[11px] font-bold uppercase tracking-wider">
              {product.category}
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              SKU: {product.code}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[85vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left: Gallery & Visuals */}
            <div className="space-y-4">
              <div className="aspect-4/3 w-full rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 relative shadow-inner">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
                {product.grade && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-[#252525]/90 backdrop-blur-xs text-white text-xs font-mono font-bold border border-zinc-700">
                    Grade {product.grade}
                  </span>
                )}
                <span className={`absolute top-3 right-3 px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider ${
                  product.availabilityStatus === 'In Stock'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-600 text-white'
                }`}>
                  {product.availabilityStatus}
                </span>
              </div>

              {/* Thumbnails */}
              {gallery.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                        activeImageIndex === idx ? 'border-[#F47B20] shadow-sm' : 'border-zinc-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Manufacturing Certification Notice */}
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Hulas Quality Certification</span>
                </div>
                <p>
                  100% prime virgin stainless steel. Spectrographically tested for nickel and chromium balance. Mill test certificates available upon shipment.
                </p>
              </div>

              {/* PDF Catalogue download if configured */}
              {product.pdfCatalogueUrl && (
                <a
                  href={product.pdfCatalogueUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-zinc-300 hover:border-[#F47B20] hover:bg-orange-50 text-zinc-800 hover:text-[#F47B20] text-xs font-semibold transition"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download Technical Data Sheet (PDF)</span>
                </a>
              )}
            </div>

            {/* Right: Technical Specs & Details */}
            <div className="space-y-5">
              <div>
                <span className="text-xs font-bold text-[#DE6810] uppercase tracking-wider">
                  {product.category} {product.subcategory ? `• ${product.subcategory}` : ''}
                </span>
                <h2 className="font-heading text-2xl font-bold text-zinc-900 mt-1">
                  {product.name}
                </h2>
                <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Pricing or MOQ indicator */}
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                {showPrice && product.price ? (
                  <div>
                    <span className="text-xs text-zinc-500 block">B2B Base Price:</span>
                    <span className="font-heading text-xl font-bold text-[#DE6810]">
                      NPR {product.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-zinc-400"> /{product.unitOfMeasurement}</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs text-zinc-500 block">Factory Order Terms:</span>
                    <span className="font-bold text-zinc-900 text-sm">
                      MOQ: {product.minimumOrderQuantity} {product.unitOfMeasurement}
                    </span>
                  </div>
                )}

                <div className="text-right">
                  <span className="text-xs text-zinc-500 block">Stock Level:</span>
                  <span className="text-xs font-semibold text-zinc-900">
                    {product.stockQuantity} {product.unitOfMeasurement} Available
                  </span>
                </div>
              </div>

              {/* Technical Specifications Table */}
              <div>
                <h4 className="font-heading text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#F47B20]" />
                  Engineered Specifications
                </h4>

                <div className="border border-zinc-200 rounded-xl overflow-hidden divide-y divide-zinc-200 text-xs">
                  {product.category === 'SS Utensils' ? (
                    <>
                      {product.size && (
                        <div className="grid grid-cols-3 p-2.5 bg-white">
                          <span className="text-zinc-500">Size / Diameter:</span>
                          <span className="col-span-2 font-semibold text-zinc-900">{product.size}</span>
                        </div>
                      )}
                      {product.gauge && (
                        <div className="grid grid-cols-3 p-2.5 bg-zinc-50">
                          <span className="text-zinc-500">Gauge:</span>
                          <span className="col-span-2 font-semibold text-zinc-900">{product.gauge}</span>
                        </div>
                      )}
                      {product.grade && (
                        <div className="grid grid-cols-3 p-2.5 bg-white">
                          <span className="text-zinc-500">Steel Grade:</span>
                          <span className="col-span-2 font-semibold text-zinc-900">{product.grade}</span>
                        </div>
                      )}
                      {product.thickness && (
                        <div className="grid grid-cols-3 p-2.5 bg-zinc-50">
                          <span className="text-zinc-500">Wall Thickness:</span>
                          <span className="col-span-2 font-semibold text-zinc-900">{product.thickness}</span>
                        </div>
                      )}
                      {product.capacity && (
                        <div className="grid grid-cols-3 p-2.5 bg-white">
                          <span className="text-zinc-500">Liquid Capacity:</span>
                          <span className="col-span-2 font-semibold text-zinc-900">{product.capacity}</span>
                        </div>
                      )}
                      {product.finish && (
                        <div className="grid grid-cols-3 p-2.5 bg-zinc-50">
                          <span className="text-zinc-500">Surface Finish:</span>
                          <span className="col-span-2 font-semibold text-zinc-900">{product.finish}</span>
                        </div>
                      )}
                      {product.shape && (
                        <div className="grid grid-cols-3 p-2.5 bg-white">
                          <span className="text-zinc-500">Form / Shape:</span>
                          <span className="col-span-2 font-semibold text-zinc-900">{product.shape}</span>
                        </div>
                      )}
                      {product.weight && (
                        <div className="grid grid-cols-3 p-2.5 bg-zinc-50">
                          <span className="text-zinc-500">Approx. Weight:</span>
                          <span className="col-span-2 font-semibold text-zinc-900">{product.weight}</span>
                        </div>
                      )}
                      {product.packagingDetails && (
                        <div className="grid grid-cols-3 p-2.5 bg-white">
                          <span className="text-zinc-500">Packaging:</span>
                          <span className="col-span-2 font-semibold text-zinc-900">{product.packagingDetails}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {product.pipeSize && (
                        <div className="grid grid-cols-3 p-2.5 bg-white">
                          <span className="text-zinc-500">Nominal Pipe Size:</span>
                          <span className="col-span-2 font-semibold text-zinc-900">{product.pipeSize}</span>
                        </div>
                      )}
                      {product.outerDiameter && (
                        <div className="grid grid-cols-3 p-2.5 bg-zinc-50">
                          <span className="text-zinc-500">Outer Diameter (OD):</span>
                          <span className="col-span-2 font-semibold text-zinc-900">{product.outerDiameter}</span>
                        </div>
                      )}
                      {product.innerDiameter && (
                        <div className="grid grid-cols-3 p-2.5 bg-white">
                          <span className="text-zinc-500">Inner Diameter (ID):</span>
                          <span className="col-span-2 font-semibold text-zinc-900">{product.innerDiameter}</span>
                        </div>
                      )}
                      {product.thickness && (
                        <div className="grid grid-cols-3 p-2.5 bg-zinc-50">
                          <span className="text-zinc-500">Wall Thickness / Gauge:</span>
                          <span className="col-span-2 font-semibold text-zinc-900">{product.thickness} ({product.gauge || 'Std'})</span>
                        </div>
                      )}
                      {product.pipeLength && (
                        <div className="grid grid-cols-3 p-2.5 bg-white">
                          <span className="text-zinc-500">Standard Length:</span>
                          <span className="col-span-2 font-semibold text-zinc-900">{product.pipeLength}</span>
                        </div>
                      )}
                      {product.grade && (
                        <div className="grid grid-cols-3 p-2.5 bg-zinc-50">
                          <span className="text-zinc-500">Steel Grade:</span>
                          <span className="col-span-2 font-semibold text-zinc-900">{product.grade}</span>
                        </div>
                      )}
                      {product.surfaceFinish && (
                        <div className="grid grid-cols-3 p-2.5 bg-white">
                          <span className="text-zinc-500">Surface Finish:</span>
                          <span className="col-span-2 font-semibold text-zinc-900">{product.surfaceFinish}</span>
                        </div>
                      )}
                      {product.pipeShape && (
                        <div className="grid grid-cols-3 p-2.5 bg-zinc-50">
                          <span className="text-zinc-500">Section Profile:</span>
                          <span className="col-span-2 font-semibold text-zinc-900">{product.pipeShape}</span>
                        </div>
                      )}
                      {product.pipeType && (
                        <div className="grid grid-cols-3 p-2.5 bg-white">
                          <span className="text-zinc-500">Manufacturing Type:</span>
                          <span className="col-span-2 font-semibold text-zinc-900">{product.pipeType}</span>
                        </div>
                      )}
                      {product.standard && (
                        <div className="grid grid-cols-3 p-2.5 bg-zinc-50">
                          <span className="text-zinc-500">Industry Standard:</span>
                          <span className="col-span-2 font-semibold text-zinc-900">{product.standard}</span>
                        </div>
                      )}
                      {product.weightPerMeter && (
                        <div className="grid grid-cols-3 p-2.5 bg-white">
                          <span className="text-zinc-500">Weight per Meter:</span>
                          <span className="col-span-2 font-semibold text-zinc-900">{product.weightPerMeter}</span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Custom specs if any */}
                  {product.customSpecs && product.customSpecs.length > 0 && (
                    <>
                      {product.customSpecs.map((cs, idx) => (
                        <div key={cs.id || idx} className="grid grid-cols-3 p-2.5 bg-amber-50/50">
                          <span className="text-amber-800 font-medium">{cs.key}:</span>
                          <span className="col-span-2 font-semibold text-zinc-900">{cs.value}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Technical Specs Text */}
              {product.technicalSpecs && (
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600">
                  <span className="font-bold text-zinc-800 block mb-1">Metallurgical Composition & Tests:</span>
                  <p>{product.technicalSpecs}</p>
                </div>
              )}

              {/* CTAs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                <button
                  onClick={() => {
                    onClose();
                    onInquire(product);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#252525] hover:bg-[#DE6810] text-white text-xs font-bold transition shadow-md cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#F47B20]" />
                  <span>Request Factory Quotation</span>
                </button>

                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 fill-white text-emerald-600" />
                  <span>WhatsApp Specifications</span>
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
