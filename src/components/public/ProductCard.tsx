import React from 'react';
import { Product } from '../../types';
import { 
  FileText, 
  MessageSquare, 
  Send, 
  Eye, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Shield 
} from 'lucide-react';
import { useStore, store } from '../../services/store';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onInquire: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onInquire
}) => {
  const { settings } = useStore();
  const showPrice = product.showPrice ?? settings.showPricesGlobally;

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = store.generateProductWhatsAppUrl(product);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      onClick={() => onViewDetails(product)}
      className="bg-white rounded-2xl overflow-hidden border border-zinc-200/90 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col group cursor-pointer"
    >
      {/* Product Image Box */}
      <div className="relative aspect-4/3 w-full bg-zinc-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.isFeatured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F47B20] text-white text-[11px] font-bold shadow-sm">
              <Sparkles className="w-3 h-3" />
              Featured
            </span>
          )}
          {product.grade && (
            <span className="px-2 py-0.5 rounded-md bg-[#252525]/90 backdrop-blur-xs text-white text-[11px] font-bold font-mono border border-zinc-600">
              {product.grade}
            </span>
          )}
        </div>

        {/* Category & Status */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
            product.availabilityStatus === 'In Stock'
              ? 'bg-emerald-500/90 text-white'
              : product.availabilityStatus === 'Low Stock'
              ? 'bg-amber-500/90 text-white'
              : 'bg-zinc-800/90 text-white'
          }`}>
            {product.availabilityStatus}
          </span>
        </div>

        {/* Hover Quick View Overlay */}
        <div className="absolute inset-0 bg-[#252525]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="px-3.5 py-1.5 rounded-full bg-white/95 text-[#252525] text-xs font-bold shadow-md flex items-center gap-1.5 transform scale-95 group-hover:scale-100 transition-transform">
            <Eye className="w-3.5 h-3.5 text-[#F47B20]" />
            View Technical Specs
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & SKU */}
          <div className="flex items-center justify-between text-[11px] text-zinc-500 font-medium mb-1.5">
            <span className="text-[#DE6810] font-semibold uppercase tracking-wider">
              {product.category} {product.subcategory ? `• ${product.subcategory}` : ''}
            </span>
            <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-600 text-[10px]">
              {product.code}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="font-heading text-base font-bold text-zinc-900 group-hover:text-[#F47B20] transition line-clamp-1 mb-2">
            {product.name}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-zinc-600 line-clamp-2 mb-3.5 leading-relaxed">
            {product.description}
          </p>

          {/* Key Specs Pill Grid */}
          <div className="grid grid-cols-2 gap-1.5 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/70 text-[11px] text-zinc-700 mb-4">
            {product.category === 'SS Utensils' ? (
              <>
                {product.gauge && (
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Gauge:</span>
                    <span className="font-semibold">{product.gauge}</span>
                  </div>
                )}
                {product.capacity && (
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Capacity:</span>
                    <span className="font-semibold">{product.capacity}</span>
                  </div>
                )}
                {product.thickness && (
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Thickness:</span>
                    <span className="font-semibold">{product.thickness}</span>
                  </div>
                )}
                {product.finish && (
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Finish:</span>
                    <span className="font-semibold truncate block">{product.finish}</span>
                  </div>
                )}
              </>
            ) : (
              <>
                {product.pipeSize && (
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Size:</span>
                    <span className="font-semibold truncate block">{product.pipeSize}</span>
                  </div>
                )}
                {product.thickness && (
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Thickness:</span>
                    <span className="font-semibold text-zinc-900 block">{product.thickness}</span>
                  </div>
                )}
                {product.gauge && (
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Gauge:</span>
                    <span className="font-semibold block">{product.gauge}</span>
                  </div>
                )}
                {product.outerDiameter && (
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Outer Dia:</span>
                    <span className="font-semibold">{product.outerDiameter}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Pricing (conditional) & Action buttons */}
        <div>
          {showPrice && product.price ? (
            <div className="mb-3 flex items-baseline gap-1.5">
              <span className="text-xs text-zinc-500 font-medium">B2B Base Price:</span>
              <span className="font-heading text-lg font-bold text-[#DE6810]">
                NPR {product.price.toLocaleString()}
              </span>
              <span className="text-[11px] text-zinc-400">/{product.unitOfMeasurement}</span>
            </div>
          ) : (
            <div className="mb-3 flex items-center gap-1.5 text-[11px] text-zinc-500">
              <Shield className="w-3.5 h-3.5 text-[#F47B20]" />
              <span>MOQ: <strong>{product.minimumOrderQuantity} {product.unitOfMeasurement}</strong> (Direct Factory Quotation)</span>
            </div>
          )}

          {/* Action Button Row */}
          <div className="pt-2 border-t border-zinc-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInquire(product);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#252525] hover:bg-[#DE6810] text-white text-xs font-semibold transition cursor-pointer shadow-xs hover:shadow-md"
            >
              <Send className="w-3.5 h-3.5 text-[#F47B20] group-hover:text-white" />
              <span>Inquire Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
