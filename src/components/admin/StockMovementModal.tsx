import React, { useState } from 'react';
import { Product, MovementType } from '../../types';
import { X, Save, Boxes, ArrowRightLeft, AlertTriangle } from 'lucide-react';
import { useStore, store } from '../../services/store';
import { useToast } from '../common/Toast';

interface StockMovementModalProps {
  initialProduct: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const StockMovementModal: React.FC<StockMovementModalProps> = ({
  initialProduct,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { products, currentUser } = useStore();
  const { success, error } = useToast();

  const [selectedProductId, setSelectedProductId] = useState<string>(initialProduct?.id || products[0]?.id || '');
  const [movementType, setMovementType] = useState<MovementType>('Stock Addition');
  const [quantity, setQuantity] = useState<number>(10);
  const [referenceNumber, setReferenceNumber] = useState<string>(`REF-${Date.now().toString().slice(-6)}`);
  const [remarks, setRemarks] = useState<string>('');
  const [location, setLocation] = useState<string>('Biratnagar Main Warehouse');

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === selectedProductId) || initialProduct || products[0];
  const previousQuantity = currentProduct ? currentProduct.stockQuantity : 0;

  // Calculate projected new balance
  let projectedNewQuantity = previousQuantity;
  const isAdditionType = 
    movementType === 'Opening Stock' || 
    movementType === 'Stock Addition' || 
    movementType === 'Purchase Entry' || 
    movementType === 'Returned Stock';

  const isDeductionType = 
    movementType === 'Stock Deduction' || 
    movementType === 'Sales / Delivery' || 
    movementType === 'Damaged Stock';

  if (isAdditionType) {
    projectedNewQuantity = previousQuantity + quantity;
  } else if (isDeductionType) {
    projectedNewQuantity = previousQuantity - quantity;
  } else if (movementType === 'Stock Adjustment' || movementType === 'Stock Correction') {
    // Exact count adjustment
    projectedNewQuantity = quantity;
  } else {
    // Location transfer doesn't reduce total company inventory balance, but records movement
    projectedNewQuantity = previousQuantity;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentProduct) {
      error('No product selected.');
      return;
    }

    if (quantity <= 0 && movementType !== 'Stock Correction') {
      error('Quantity must be greater than zero.');
      return;
    }

    // Negative inventory prevention
    if (projectedNewQuantity < 0) {
      error(`Cannot process: Projected stock would be negative (${projectedNewQuantity}). Current balance is ${previousQuantity}.`);
      return;
    }

    try {
      store.recordStockMovement({
        productId: currentProduct.id,
        productName: currentProduct.name,
        productCode: currentProduct.code,
        movementType,
        quantity,
        previousQuantity,
        newQuantity: projectedNewQuantity,
        referenceNumber: referenceNumber.trim() || `TX-${Date.now()}`,
        remarks: remarks || `${movementType} processed via Admin ERP`,
        performedBy: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Admin User',
        location
      });

      success(`Recorded ${movementType}: ${quantity} units for ${currentProduct.name}. New balance: ${projectedNewQuantity}.`);
      onSuccess();
      onClose();
    } catch (err) {
      error('Failed to record stock movement.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden animate-fadeIn">
        
        {/* Header */}
        <div className="bg-[#252525] p-5 text-white flex items-center justify-between border-b-2 border-[#F47B20]">
          <div className="flex items-center gap-2.5">
            <Boxes className="w-5 h-5 text-[#F47B20]" />
            <div>
              <h3 className="font-heading text-lg font-bold">Record Inventory Movement</h3>
              <p className="text-xs text-zinc-400">Immutable ledger entry and balance adjustment</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Product Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Select Product *
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#F47B20]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code}) — Current Stock: {p.stockQuantity} {p.unitOfMeasurement}
                </option>
              ))}
            </select>
          </div>

          {/* Movement Type & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Movement Type *
              </label>
              <select
                value={movementType}
                onChange={(e) => setMovementType(e.target.value as MovementType)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#F47B20]"
              >
                <option value="Purchase Entry">Purchase Entry (Factory Batch)</option>
                <option value="Stock Addition">Stock Addition</option>
                <option value="Sales / Delivery">Sales / Delivery Dispatched</option>
                <option value="Stock Deduction">Stock Deduction</option>
                <option value="Damaged Stock">Damaged / Scrap Stock</option>
                <option value="Returned Stock">Customer Return</option>
                <option value="Location Transfer">Transfer Between Warehouses</option>
                <option value="Stock Adjustment">Physical Audit Correction</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Warehouse / Yard Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#F47B20]"
              >
                <option value="Biratnagar Main Warehouse">Biratnagar Main Plant Yard</option>
                <option value="Kathmandu Central Depot">Kathmandu Central Depot</option>
                <option value="Showroom Display Stock">Tinkune Showroom Display</option>
                <option value="In-Transit Hub">In-Transit Freight Hub</option>
              </select>
            </div>
          </div>

          {/* Quantity & Reference */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Transaction Quantity *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Reference Number / Invoice *
              </label>
              <input
                type="text"
                required
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="PO-2026-991 / DO-33"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-mono"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Remarks / Transaction Notes
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g., Dispatched to Pokhara distributor consignment #44"
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs"
            />
          </div>

          {/* Projected Balance Callout */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-zinc-500 block">Current Balance:</span>
              <span className="font-bold text-zinc-900 text-sm">
                {previousQuantity} {currentProduct?.unitOfMeasurement}
              </span>
            </div>

            <ArrowRightLeft className="w-5 h-5 text-zinc-400" />

            <div className="text-right">
              <span className="text-zinc-500 block">New Projected Balance:</span>
              <span className={`font-bold text-sm ${projectedNewQuantity <= 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                {projectedNewQuantity} {currentProduct?.unitOfMeasurement}
              </span>
            </div>
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
              <span>Record Ledger Transaction</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
