import React, { useState, useMemo } from 'react';
import { Product, InventoryTransaction, MovementType } from '../../types';
import { 
  Boxes, 
  Plus, 
  Search, 
  Download, 
  ArrowRightLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingDown, 
  TrendingUp, 
  Layers 
} from 'lucide-react';
import { useStore } from '../../services/store';
import { StockMovementModal } from './StockMovementModal';

export const InventoryManagementView: React.FC = () => {
  const { products, inventoryTransactions, categories } = useStore();

  const [activeTab, setActiveTab] = useState<'balances' | 'movements'>('balances');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMovementType, setSelectedMovementType] = useState('All');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductForMovement, setSelectedProductForMovement] = useState<Product | null>(null);

  // Statistics
  const totalUnits = products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);
  const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStockLevel && p.stockQuantity > 0).length;
  const outOfStockCount = products.filter((p) => p.stockQuantity <= 0).length;
  
  // Total Valuation Estimate based on unit prices
  const totalValuation = products.reduce((acc, p) => acc + ((p.stockQuantity || 0) * (p.price || 1500)), 0);

  // Filter products for balances tab
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, selectedCategory, search]);

  // Filter transactions for movements tab
  const filteredTransactions = useMemo(() => {
    return inventoryTransactions.filter((tx) => {
      if (selectedMovementType !== 'All' && tx.movementType !== selectedMovementType) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          tx.productName.toLowerCase().includes(q) ||
          tx.productCode.toLowerCase().includes(q) ||
          tx.referenceNumber.toLowerCase().includes(q) ||
          tx.performedBy.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [inventoryTransactions, selectedMovementType, search]);

  const handleOpenMovementModal = (product?: Product) => {
    setSelectedProductForMovement(product || null);
    setIsModalOpen(true);
  };

  const handleExportCSV = () => {
    if (activeTab === 'balances') {
      const headers = ['Product Name', 'SKU Code', 'Category', 'Current Stock', 'Min Threshold', 'Unit', 'Est Valuation (NPR)', 'Status'];
      const rows = filteredProducts.map((p) => [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.code}"`,
        `"${p.category}"`,
        p.stockQuantity,
        p.minStockLevel,
        `"${p.unitOfMeasurement}"`,
        p.stockQuantity * (p.price || 1500),
        `"${p.availabilityStatus}"`
      ]);
      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hulas-inventory-balances-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } else {
      const headers = ['Date', 'Movement Type', 'Product', 'SKU', 'Qty Transacted', 'Prev Balance', 'New Balance', 'Ref Number', 'Location', 'Operator', 'Remarks'];
      const rows = filteredTransactions.map((tx) => [
        `"${tx.date}"`,
        `"${tx.movementType}"`,
        `"${tx.productName.replace(/"/g, '""')}"`,
        `"${tx.productCode}"`,
        tx.quantity,
        tx.previousQuantity,
        tx.newQuantity,
        `"${tx.referenceNumber}"`,
        `"${tx.location || ''}"`,
        `"${tx.performedBy}"`,
        `"${tx.remarks.replace(/"/g, '""')}"`
      ]);
      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hulas-stock-movement-audit-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="font-heading text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-[#F47B20]" />
            Warehouse & Inventory Management
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time stock ledger, physical audits, low stock alerts, and multi-location warehouse tracking.
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
            onClick={() => handleOpenMovementModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F47B20] hover:bg-[#DE6810] text-white text-xs font-bold transition shadow cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Stock Movement</span>
          </button>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">Total Units in Stock</span>
          <span className="font-heading text-2xl font-bold text-zinc-900">{totalUnits.toLocaleString()}</span>
          <span className="text-[10px] text-zinc-400 block mt-1">Across 500+ SKU lines</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">Est. Stock Valuation</span>
          <span className="font-heading text-2xl font-bold text-[#DE6810]">
            NPR {(totalValuation / 100000).toFixed(1)} Lakhs
          </span>
          <span className="text-[10px] text-zinc-400 block mt-1">Cost valuation estimate</span>
        </div>

        <div className={`p-4 rounded-2xl border shadow-2xs ${lowStockCount > 0 ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-zinc-200'}`}>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block">Low Stock Alerts</span>
          <span className="font-heading text-2xl font-bold text-amber-900">{lowStockCount} Products</span>
          <span className="text-[10px] text-amber-600 block mt-1">At or below threshold</span>
        </div>

        <div className={`p-4 rounded-2xl border shadow-2xs ${outOfStockCount > 0 ? 'bg-red-50/70 border-red-300' : 'bg-white border-zinc-200'}`}>
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 block">Out of Stock</span>
          <span className="font-heading text-2xl font-bold text-red-900">{outOfStockCount} Products</span>
          <span className="text-[10px] text-red-600 block mt-1">Zero units available</span>
        </div>
      </div>

      {/* Tabs Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Subtab Switch */}
          <div className="flex items-center gap-2 p-1 bg-zinc-100 rounded-xl">
            <button
              onClick={() => setActiveTab('balances')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'balances' ? 'bg-white text-[#DE6810] shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Current Stock Balances ({filteredProducts.length})
            </button>
            <button
              onClick={() => setActiveTab('movements')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'movements' ? 'bg-white text-[#DE6810] shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Stock Movement Audit Ledger ({filteredTransactions.length})
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product, SKU, ref #..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
            />
          </div>
        </div>

        {/* Subtab 1: Balances Filters */}
        {activeTab === 'balances' && (
          <div className="flex items-center gap-3 pt-2 border-t border-zinc-100 text-xs">
            <span className="text-zinc-500 font-semibold">Filter Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-zinc-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#F47B20]"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Subtab 2: Movements Filters */}
        {activeTab === 'movements' && (
          <div className="flex items-center gap-3 pt-2 border-t border-zinc-100 text-xs">
            <span className="text-zinc-500 font-semibold">Movement Type:</span>
            <select
              value={selectedMovementType}
              onChange={(e) => setSelectedMovementType(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-zinc-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#F47B20]"
            >
              <option value="All">All Movement Types</option>
              <option value="Purchase Entry">Purchase Entry</option>
              <option value="Stock Addition">Stock Addition</option>
              <option value="Sales / Delivery">Sales / Delivery</option>
              <option value="Stock Deduction">Stock Deduction</option>
              <option value="Damaged Stock">Damaged Stock</option>
              <option value="Returned Stock">Returned Stock</option>
              <option value="Location Transfer">Location Transfer</option>
            </select>
          </div>
        )}
      </div>

      {/* Content Table */}
      {activeTab === 'balances' ? (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
                <tr>
                  <th className="py-3 px-3 font-semibold">Product & SKU</th>
                  <th className="py-3 px-3 font-semibold">Category</th>
                  <th className="py-3 px-3 font-semibold">Current Stock</th>
                  <th className="py-3 px-3 font-semibold">Safety Min</th>
                  <th className="py-3 px-3 font-semibold">Est. Valuation</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-3 font-semibold text-right">Quick Movement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredProducts.map((p) => {
                  const isLow = p.stockQuantity <= p.minStockLevel && p.stockQuantity > 0;
                  const isOut = p.stockQuantity <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-zinc-50 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-zinc-900 truncate max-w-sm">{p.name}</div>
                        <div className="font-mono text-[11px] text-zinc-400">{p.code}</div>
                      </td>
                      <td className="py-3 px-3 text-zinc-700">
                        {p.category}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`font-bold text-sm ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-emerald-700'}`}>
                          {p.stockQuantity} {p.unitOfMeasurement}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-zinc-500 font-medium">
                        {p.minStockLevel} {p.unitOfMeasurement}
                      </td>
                      <td className="py-3 px-3 font-mono text-zinc-800">
                        NPR {(p.stockQuantity * (p.price || 1500)).toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isOut
                            ? 'bg-red-100 text-red-800'
                            : isLow
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {p.availabilityStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleOpenMovementModal(p)}
                          className="px-3 py-1 rounded-lg bg-[#252525] hover:bg-[#DE6810] text-white text-[11px] font-semibold transition"
                        >
                          Stock Entry
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Movements Audit Table */
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
                <tr>
                  <th className="py-3 px-3 font-semibold">Timestamp</th>
                  <th className="py-3 px-3 font-semibold">Movement Type</th>
                  <th className="py-3 px-3 font-semibold">Product Name & SKU</th>
                  <th className="py-3 px-3 font-semibold">Qty</th>
                  <th className="py-3 px-3 font-semibold">Prev Balance</th>
                  <th className="py-3 px-3 font-semibold">New Balance</th>
                  <th className="py-3 px-3 font-semibold">Ref Number</th>
                  <th className="py-3 px-3 font-semibold">Warehouse</th>
                  <th className="py-3 px-3 font-semibold">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-50 transition">
                    <td className="py-3 px-3 text-zinc-500 whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.movementType === 'Purchase Entry' || tx.movementType === 'Stock Addition'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tx.movementType === 'Sales / Delivery'
                          ? 'bg-blue-100 text-blue-800'
                          : tx.movementType === 'Damaged Stock'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-zinc-100 text-zinc-800'
                      }`}>
                        {tx.movementType}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-zinc-900 truncate max-w-xs">{tx.productName}</div>
                      <div className="font-mono text-[10px] text-zinc-400">{tx.productCode}</div>
                    </td>
                    <td className="py-3 px-3 font-bold text-zinc-900">
                      {tx.quantity}
                    </td>
                    <td className="py-3 px-3 text-zinc-500">
                      {tx.previousQuantity}
                    </td>
                    <td className="py-3 px-3 font-semibold text-zinc-900">
                      {tx.newQuantity}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-zinc-600">
                      {tx.referenceNumber}
                    </td>
                    <td className="py-3 px-3 text-zinc-600">
                      {tx.location || 'Central Factory Depot'}
                    </td>
                    <td className="py-3 px-3 text-zinc-600">
                      {tx.performedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Movement Modal */}
      <StockMovementModal
        initialProduct={selectedProductForMovement}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProductForMovement(null);
        }}
        onSuccess={() => {
          // Updates automatically via reactive store
        }}
      />

    </div>
  );
};
