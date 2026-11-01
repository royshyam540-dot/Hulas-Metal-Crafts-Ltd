import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Search, 
  Filter, 
  Calendar, 
  Package, 
  Boxes, 
  MessageSquare, 
  Users, 
  Activity, 
  FileText 
} from 'lucide-react';
import { useStore } from '../../services/store';

type ReportDomain = 'products' | 'inventory' | 'inquiries' | 'customers' | 'activity';

export const ReportsView: React.FC = () => {
  const { 
    products, 
    inventoryTransactions, 
    inquiries, 
    customers, 
    activityLogs, 
    settings 
  } = useStore();

  const [activeDomain, setActiveDomain] = useState<ReportDomain>('products');
  const [reportFilter, setReportFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  // 1. Product Report Data
  const productReportData = useMemo(() => {
    return products.filter((p) => {
      if (reportFilter === 'utensils' && p.category !== 'SS Utensils') return false;
      if (reportFilter === 'pipes' && p.category !== 'SS Pipes') return false;
      if (reportFilter === 'featured' && !p.isFeatured) return false;
      if (reportFilter === 'inactive' && p.isActive) return false;
      if (reportFilter === 'low_stock' && p.stockQuantity > p.minStockLevel) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, reportFilter, search]);

  // 2. Inventory Report Data
  const inventoryReportData = useMemo(() => {
    return inventoryTransactions.filter((tx) => {
      if (reportFilter === 'purchases' && tx.movementType !== 'Purchase Entry') return false;
      if (reportFilter === 'sales' && tx.movementType !== 'Sales / Delivery') return false;
      if (reportFilter === 'damaged' && tx.movementType !== 'Damaged Stock') return false;
      if (reportFilter === 'adjustments' && tx.movementType !== 'Stock Adjustment') return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return tx.productName.toLowerCase().includes(q) || tx.referenceNumber.toLowerCase().includes(q);
      }
      return true;
    });
  }, [inventoryTransactions, reportFilter, search]);

  // 3. Inquiry Report Data
  const inquiryReportData = useMemo(() => {
    return inquiries.filter((inq) => {
      if (reportFilter === 'converted' && inq.status !== 'Converted') return false;
      if (reportFilter === 'pending' && inq.status !== 'Pending' && inq.status !== 'New') return false;
      if (reportFilter === 'rejected' && inq.status !== 'Rejected') return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return inq.customerName.toLowerCase().includes(q) || inq.inquiryNumber.toLowerCase().includes(q);
      }
      return true;
    });
  }, [inquiries, reportFilter, search]);

  // Export CSV
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: any[][] = [];

    if (activeDomain === 'products') {
      headers = ['Product Name', 'SKU', 'Category', 'Grade', 'Gauge', 'Size', 'Stock Qty', 'Unit', 'Price', 'Active', 'Featured'];
      rows = productReportData.map((p) => [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.code}"`,
        `"${p.category}"`,
        `"${p.grade || ''}"`,
        `"${p.gauge || ''}"`,
        `"${p.size || p.pipeSize || ''}"`,
        p.stockQuantity,
        `"${p.unitOfMeasurement}"`,
        p.price || 0,
        p.isActive ? 'Active' : 'Draft',
        p.isFeatured ? 'Yes' : 'No'
      ]);
    } else if (activeDomain === 'inventory') {
      headers = ['Timestamp', 'Type', 'Product', 'SKU', 'Quantity', 'Balance After', 'Ref No', 'Location', 'Operator'];
      rows = inventoryReportData.map((tx) => [
        `"${tx.date}"`,
        `"${tx.movementType}"`,
        `"${tx.productName.replace(/"/g, '""')}"`,
        `"${tx.productCode}"`,
        tx.quantity,
        tx.newQuantity,
        `"${tx.referenceNumber}"`,
        `"${tx.location || ''}"`,
        `"${tx.performedBy}"`
      ]);
    } else if (activeDomain === 'inquiries') {
      headers = ['Inquiry No', 'Customer', 'Company', 'Phone', 'Product', 'Qty', 'Unit', 'Status', 'Staff', 'Date'];
      rows = inquiryReportData.map((i) => [
        `"${i.inquiryNumber}"`,
        `"${i.customerName.replace(/"/g, '""')}"`,
        `"${(i.companyName || '').replace(/"/g, '""')}"`,
        `"${i.phone}"`,
        `"${i.productName.replace(/"/g, '""')}"`,
        i.requiredQuantity,
        `"${i.unit}"`,
        `"${i.status}"`,
        `"${i.assignedStaff || 'Unassigned'}"`,
        `"${i.createdAt}"`
      ]);
    } else if (activeDomain === 'customers') {
      headers = ['Customer Name', 'Company', 'Phone', 'Email', 'Category', 'Total Inquiries', 'Last Active'];
      rows = customers.map((c) => [
        `"${c.name}"`,
        `"${c.company || ''}"`,
        `"${c.phone}"`,
        `"${c.email || ''}"`,
        `"${c.category}"`,
        c.totalInquiries,
        `"${c.lastInquiryDate}"`
      ]);
    } else {
      headers = ['Timestamp', 'Action', 'Entity', 'Details', 'Operator'];
      rows = activityLogs.map((l) => [
        `"${l.timestamp}"`,
        `"${l.action}"`,
        `"${l.entity}"`,
        `"${l.details.replace(/"/g, '""')}"`,
        `"${l.user}"`
      ]);
    }

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hulas-${activeDomain}-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn print:m-0 print:p-0">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 print:hidden">
        <div>
          <h1 className="font-heading text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#F47B20]" />
            Corporate Reports & Audit Center
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Generate and export verified product catalogs, inventory valuation, inquiry conversion ratios, and operator logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-zinc-500" />
            <span>Print Report (PDF)</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#252525] hover:bg-[#DE6810] text-white text-xs font-bold transition shadow cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#F47B20]" />
            <span>Export to CSV/Excel</span>
          </button>
        </div>
      </div>

      {/* Domain Switcher */}
      <div className="bg-white p-3 rounded-2xl border border-zinc-200 shadow-2xs flex flex-wrap items-center gap-2 print:hidden">
        {[
          { id: 'products', label: 'Product Reports', icon: Package },
          { id: 'inventory', label: 'Inventory & Stock Movements', icon: Boxes },
          { id: 'inquiries', label: 'Inquiry & Conversion Reports', icon: MessageSquare },
          { id: 'customers', label: 'Customer Directory Reports', icon: Users },
          { id: 'activity', label: 'Activity & Audit Log', icon: Activity }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeDomain === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveDomain(tab.id as ReportDomain);
                setReportFilter('all');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                isActive
                  ? 'bg-[#F47B20] text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar for active domain */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
        {/* Sub-Filters based on activeDomain */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {activeDomain === 'products' && (
            <>
              {['all', 'utensils', 'pipes', 'featured', 'low_stock', 'inactive'].map((f) => (
                <button
                  key={f}
                  onClick={() => setReportFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                    reportFilter === f ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </>
          )}

          {activeDomain === 'inventory' && (
            <>
              {['all', 'purchases', 'sales', 'damaged', 'adjustments'].map((f) => (
                <button
                  key={f}
                  onClick={() => setReportFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                    reportFilter === f ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </>
          )}

          {activeDomain === 'inquiries' && (
            <>
              {['all', 'converted', 'pending', 'rejected'].map((f) => (
                <button
                  key={f}
                  onClick={() => setReportFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                    reportFilter === f ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search report records..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-zinc-300 text-xs focus:ring-2 focus:ring-[#F47B20] focus:outline-none"
          />
        </div>
      </div>

      {/* Print Document Header */}
      <div className="hidden print:block mb-6">
        <h2 className="text-xl font-bold text-black uppercase">
          HULAS METAL CRAFTS LTD. — OFFICIAL AUDIT REPORT
        </h2>
        <p className="text-xs text-zinc-600">
          Domain: {activeDomain.toUpperCase()} • Generated on: {new Date().toLocaleString()}
        </p>
      </div>

      {/* Table Render based on Active Domain */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden print:border-none print:shadow-none">
        
        {/* DOMAIN 1: PRODUCTS */}
        {activeDomain === 'products' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
                <tr>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Grade</th>
                  <th className="py-2.5 px-3">Stock Qty</th>
                  <th className="py-2.5 px-3">Min Level</th>
                  <th className="py-2.5 px-3">Price (NPR)</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {productReportData.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50">
                    <td className="py-2.5 px-3 font-semibold text-zinc-900">{p.name}</td>
                    <td className="py-2.5 px-3 font-mono text-zinc-500">{p.code}</td>
                    <td className="py-2.5 px-3 text-zinc-700">{p.category}</td>
                    <td className="py-2.5 px-3 font-mono">{p.grade || 'N/A'}</td>
                    <td className="py-2.5 px-3 font-bold">{p.stockQuantity} {p.unitOfMeasurement}</td>
                    <td className="py-2.5 px-3 text-zinc-500">{p.minStockLevel}</td>
                    <td className="py-2.5 px-3">{p.price ? p.price.toLocaleString() : 'Factory PO'}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'}`}>
                        {p.isActive ? 'Active' : 'Draft'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DOMAIN 2: INVENTORY MOVEMENTS */}
        {activeDomain === 'inventory' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Movement Type</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Quantity</th>
                  <th className="py-2.5 px-3">New Balance</th>
                  <th className="py-2.5 px-3">Reference No</th>
                  <th className="py-2.5 px-3">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {inventoryReportData.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-50">
                    <td className="py-2.5 px-3 text-zinc-500">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="py-2.5 px-3 font-semibold">{tx.movementType}</td>
                    <td className="py-2.5 px-3 font-semibold text-zinc-900">{tx.productName}</td>
                    <td className="py-2.5 px-3 font-mono text-zinc-500">{tx.productCode}</td>
                    <td className="py-2.5 px-3 font-bold">{tx.quantity}</td>
                    <td className="py-2.5 px-3">{tx.newQuantity}</td>
                    <td className="py-2.5 px-3 font-mono">{tx.referenceNumber}</td>
                    <td className="py-2.5 px-3 text-zinc-600">{tx.performedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DOMAIN 3: INQUIRIES */}
        {activeDomain === 'inquiries' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
                <tr>
                  <th className="py-2.5 px-3">Inquiry No</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Company</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Qty</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {inquiryReportData.map((i) => (
                  <tr key={i.id} className="hover:bg-zinc-50">
                    <td className="py-2.5 px-3 font-mono font-bold">{i.inquiryNumber}</td>
                    <td className="py-2.5 px-3 font-semibold text-zinc-900">{i.customerName}</td>
                    <td className="py-2.5 px-3 text-zinc-600">{i.companyName || 'Individual'}</td>
                    <td className="py-2.5 px-3 font-mono">{i.phone}</td>
                    <td className="py-2.5 px-3">{i.productName}</td>
                    <td className="py-2.5 px-3 font-bold">{i.requiredQuantity} {i.unit}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-[#DE6810]">
                        {i.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-600">{i.assignedStaff || 'Unassigned'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DOMAIN 4: CUSTOMERS */}
        {activeDomain === 'customers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
                <tr>
                  <th className="py-2.5 px-3">Customer Name</th>
                  <th className="py-2.5 px-3">Company</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Inquiries</th>
                  <th className="py-2.5 px-3">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50">
                    <td className="py-2.5 px-3 font-bold text-zinc-900">{c.name}</td>
                    <td className="py-2.5 px-3 text-zinc-700">{c.company || 'Individual'}</td>
                    <td className="py-2.5 px-3 font-mono">{c.phone}</td>
                    <td className="py-2.5 px-3 text-zinc-600">{c.email || 'N/A'}</td>
                    <td className="py-2.5 px-3 font-semibold">{c.category}</td>
                    <td className="py-2.5 px-3 font-bold text-[#DE6810]">{c.totalInquiries}</td>
                    <td className="py-2.5 px-3 text-zinc-500">{c.lastInquiryDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DOMAIN 5: ACTIVITY LOGS */}
        {activeDomain === 'activity' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Entity</th>
                  <th className="py-2.5 px-3">Details</th>
                  <th className="py-2.5 px-3">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {activityLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-zinc-50">
                    <td className="py-2.5 px-3 text-zinc-500 whitespace-nowrap">
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-zinc-900">{l.action}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-100 font-mono text-[10px] text-zinc-700">
                        {l.entity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-700">{l.details}</td>
                    <td className="py-2.5 px-3 font-medium text-zinc-800">{l.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
