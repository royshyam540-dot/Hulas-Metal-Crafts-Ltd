import React, { useState } from 'react';
import { 
  Package, 
  Layers, 
  Boxes, 
  AlertTriangle, 
  MessageSquare, 
  CheckCircle2, 
  TrendingUp, 
  FileText, 
  Download, 
  Filter, 
  ArrowUpRight, 
  Clock, 
  Cpu, 
  Utensils, 
  ShieldAlert 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { useStore, store } from '../../services/store';
import { AdminTab } from './AdminSidebar';
import { InquiryStatus, MovementType } from '../../types';

interface DashboardViewProps {
  onNavigateTab: (tab: AdminTab) => void;
  onSelectInquiry: (inquiryId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onSelectInquiry
}) => {
  const { 
    products, 
    categories, 
    inquiries, 
    inventoryTransactions, 
    contactMessages, 
    settings 
  } = useStore();

  const [dateRange, setDateRange] = useState<'30' | '90' | 'year' | 'all'>('30');

  // KPI Calculations
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.isActive).length;
  const inactiveProducts = products.filter((p) => !p.isActive).length;
  const totalUtensils = products.filter((p) => p.category === 'SS Utensils').length;
  const totalPipes = products.filter((p) => p.category === 'SS Pipes').length;
  
  const totalInventoryQuantity = products.reduce((sum, p) => sum + (p.stockQuantity || 0), 0);
  const lowStockProducts = products.filter((p) => p.stockQuantity <= p.minStockLevel && p.stockQuantity > 0);
  const outOfStockProducts = products.filter((p) => p.stockQuantity <= 0);

  const totalInquiries = inquiries.length;
  const newInquiries = inquiries.filter((i) => i.status === 'New').length;
  const pendingInquiries = inquiries.filter((i) => i.status === 'Pending' || i.status === 'Contacted').length;
  const convertedInquiries = inquiries.filter((i) => i.status === 'Converted').length;
  const conversionRate = totalInquiries > 0 ? Math.round((convertedInquiries / totalInquiries) * 100) : 0;

  // Chart Data: Category Distribution
  const categoryChartData = [
    { name: 'SS Utensils', value: totalUtensils, color: '#F47B20' },
    { name: 'SS Pipes', value: totalPipes, color: '#252525' }
  ];

  // Chart Data: Monthly Pipeline Mock/Trend
  const monthlyInquiryData = [
    { month: 'Jun', total: 18, converted: 6 },
    { month: 'Jul', total: 24, converted: 11 },
    { month: 'Aug', total: 32, converted: 14 },
    { month: 'Sep', total: 29, converted: 15 },
    { month: 'Oct', total: 41, converted: 22 },
    { month: 'Nov', total: totalInquiries + 12, converted: convertedInquiries + 5 }
  ];

  // Stock status chart
  const stockChartData = [
    { name: 'In Stock (>Min)', count: products.filter((p) => p.stockQuantity > p.minStockLevel).length, fill: '#10B981' },
    { name: 'Low Stock (≤Min)', count: lowStockProducts.length, fill: '#F59E0B' },
    { name: 'Out of Stock (0)', count: outOfStockProducts.length, fill: '#EF4444' }
  ];

  // Export Dashboard Summary to CSV
  const handleExportSummary = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Products', totalProducts],
      ['Active Products', activeProducts],
      ['Inactive Products', inactiveProducts],
      ['Total SS Utensils', totalUtensils],
      ['Total SS Pipes', totalPipes],
      ['Total Categories', categories.length],
      ['Total Inventory Units', totalInventoryQuantity],
      ['Low Stock Alert Count', lowStockProducts.length],
      ['Out of Stock Count', outOfStockProducts.length],
      ['Total Inquiries', totalInquiries],
      ['New Inquiries', newInquiries],
      ['Pending Inquiries', pendingInquiries],
      ['Converted Inquiries', convertedInquiries],
      ['Inquiry Conversion Rate', `${conversionRate}%`],
      ['Total Contact Messages', contactMessages.length],
      ['Report Generated Date', new Date().toLocaleString()]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hulas-metal-dashboard-summary-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Header & Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="font-heading text-2xl font-bold text-zinc-900 tracking-tight">
            Operational Executive Dashboard
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time telemetry on production inventory, B2B inquiries, and category distribution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-zinc-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-400 ml-1.5" />
            {(['30', '90', 'year', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  dateRange === r ? 'bg-[#F47B20] text-white shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {r === '30' ? '30 Days' : r === '90' ? '90 Days' : r === 'year' ? '1 Year' : 'All Time'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportSummary}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#252525] hover:bg-[#DE6810] text-white text-xs font-bold transition shadow cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#F47B20]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        
        {/* Total Products */}
        <div 
          onClick={() => onNavigateTab('products')}
          className="p-4 rounded-2xl bg-white border border-zinc-200 hover:border-[#F47B20] transition shadow-xs hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Products</span>
            <Package className="w-4 h-4 text-[#F47B20]" />
          </div>
          <div className="font-heading text-2xl font-bold text-zinc-900 group-hover:text-[#DE6810] transition">
            {totalProducts}
          </div>
          <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1">
            <span>{activeProducts} Active</span>
            <span className="text-zinc-400">{inactiveProducts} Draft</span>
          </div>
        </div>

        {/* Categories */}
        <div 
          onClick={() => onNavigateTab('categories')}
          className="p-4 rounded-2xl bg-white border border-zinc-200 hover:border-[#F47B20] transition shadow-xs hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Categories</span>
            <Layers className="w-4 h-4 text-zinc-700" />
          </div>
          <div className="font-heading text-2xl font-bold text-zinc-900 group-hover:text-[#DE6810] transition">
            {categories.length}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">
            SS Utensils & Pipes
          </div>
        </div>

        {/* Utensils vs Pipes */}
        <div 
          onClick={() => onNavigateTab('products')}
          className="p-4 rounded-2xl bg-white border border-zinc-200 hover:border-[#F47B20] transition shadow-xs hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Line Splits</span>
            <Utensils className="w-4 h-4 text-[#F47B20]" />
          </div>
          <div className="font-heading text-2xl font-bold text-zinc-900 group-hover:text-[#DE6810] transition">
            {totalUtensils} / {totalPipes}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">
            Utensils vs Pipes
          </div>
        </div>

        {/* Inventory Units */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="p-4 rounded-2xl bg-white border border-zinc-200 hover:border-[#F47B20] transition shadow-xs hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Inventory Units</span>
            <Boxes className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-heading text-2xl font-bold text-zinc-900 group-hover:text-[#DE6810] transition">
            {totalInventoryQuantity.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">
            Across 2 Warehouses
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className={`p-4 rounded-2xl border transition shadow-xs hover:shadow-md cursor-pointer group ${
            lowStockProducts.length > 0 ? 'bg-amber-50/60 border-amber-300' : 'bg-white border-zinc-200'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Low Stock</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-heading text-2xl font-bold text-amber-900">
            {lowStockProducts.length}
          </div>
          <div className="text-[10px] text-amber-700 font-semibold mt-1">
            {outOfStockProducts.length} Out of Stock
          </div>
        </div>

        {/* Inquiries */}
        <div 
          onClick={() => onNavigateTab('inquiries')}
          className="p-4 rounded-2xl bg-white border border-zinc-200 hover:border-[#F47B20] transition shadow-xs hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Inquiries</span>
            <MessageSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-heading text-2xl font-bold text-zinc-900 group-hover:text-[#DE6810] transition">
            {totalInquiries}
          </div>
          <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1">
            <span className="text-emerald-600 font-bold">{newInquiries} New</span>
            <span>{conversionRate}% Conv.</span>
          </div>
        </div>

      </div>

      {/* Visual Analytics Grid (2 Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Monthly Inquiries Trend (Col 1-8) */}
        <div className="lg:col-span-8 p-6 bg-white rounded-2xl border border-zinc-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-sm font-bold text-zinc-900 uppercase tracking-wider">
                Monthly Inquiries & B2B Conversions
              </h3>
              <p className="text-xs text-zinc-500">
                Customer interest pipeline compared to confirmed sales orders
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-zinc-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#F47B20]"></span>
                Total Inquiries
              </span>
              <span className="flex items-center gap-1.5 text-zinc-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                Converted POs
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyInquiryData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F47B20" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#F47B20" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#252525', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="total" stroke="#F47B20" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" name="Total Inquiries" />
                <Area type="monotone" dataKey="converted" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorConv)" name="Converted POs" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Category Distribution (Col 9-12) */}
        <div className="lg:col-span-4 p-6 bg-white rounded-2xl border border-zinc-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-heading text-sm font-bold text-zinc-900 uppercase tracking-wider">
              Category Distribution
            </h3>
            <p className="text-xs text-zinc-500">
              Breakdown of active lines in production
            </p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#252525', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-semibold text-zinc-800">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F47B20]"></span>
                SS Utensils & Cookware
              </span>
              <span className="font-bold">{totalUtensils} lines</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-semibold text-zinc-800">
                <span className="w-2.5 h-2.5 rounded-full bg-[#252525]"></span>
                SS Industrial Pipes & Tubing
              </span>
              <span className="font-bold">{totalPipes} lines</span>
            </div>
          </div>
        </div>

      </div>

      {/* Two Detailed Tables: Recent Inquiries & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Table 1: Recent Inquiries (Col 1-7) */}
        <div className="lg:col-span-7 p-6 bg-white rounded-2xl border border-zinc-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <h3 className="font-heading text-sm font-bold text-zinc-900 uppercase tracking-wider">
                Recent Customer Inquiries
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('inquiries')}
              className="text-xs text-[#DE6810] hover:underline font-bold flex items-center gap-1"
            >
              View All ({inquiries.length})
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Inquiry No</th>
                  <th className="py-2.5 px-3 font-semibold">Customer / Company</th>
                  <th className="py-2.5 px-3 font-semibold">Product</th>
                  <th className="py-2.5 px-3 font-semibold">Qty</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {inquiries.slice(0, 5).map((inq) => (
                  <tr key={inq.id} className="hover:bg-zinc-50/80 transition">
                    <td className="py-3 px-3 font-mono font-bold text-zinc-800">
                      {inq.inquiryNumber}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-zinc-900 truncate max-w-[130px]">{inq.customerName}</div>
                      <div className="text-[10px] text-zinc-400 truncate max-w-[130px]">{inq.companyName || 'Individual'}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-zinc-700 truncate max-w-[140px]">{inq.productName}</div>
                    </td>
                    <td className="py-3 px-3 font-bold text-zinc-900">
                      {inq.requiredQuantity} {inq.unit}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inq.status === 'New'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inq.status === 'Converted'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-orange-100 text-[#DE6810]'
                      }`}>
                        {inq.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onSelectInquiry(inq.id)}
                        className="p-1 rounded hover:bg-zinc-200 text-zinc-700 transition"
                        title="Open Details"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Low-Stock Alerts & Action (Col 8-12) */}
        <div className="lg:col-span-5 p-6 bg-white rounded-2xl border border-zinc-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="font-heading text-sm font-bold text-zinc-900 uppercase tracking-wider">
                Low Stock Threshold Alerts
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs text-amber-700 hover:underline font-bold flex items-center gap-1"
            >
              Inventory Restock
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {lowStockProducts.length > 0 || outOfStockProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Product Name</th>
                    <th className="py-2.5 px-3 font-semibold">Current</th>
                    <th className="py-2.5 px-3 font-semibold">Min Threshold</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {[...outOfStockProducts, ...lowStockProducts].slice(0, 5).map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-50/80 transition">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-zinc-900 truncate max-w-[140px]">{p.name}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">{p.code}</div>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-red-600">
                        {p.stockQuantity} {p.unitOfMeasurement}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-500">
                        {p.minStockLevel} {p.unitOfMeasurement}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onNavigateTab('inventory')}
                          className="px-2 py-1 rounded bg-[#252525] hover:bg-[#DE6810] text-white text-[10px] font-bold transition"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              All inventory levels are comfortably above minimum safety thresholds.
            </div>
          )}
        </div>

      </div>

      {/* Recent Inventory Transactions / Audit Movements */}
      <div className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-[#F47B20]" />
            <h3 className="font-heading text-sm font-bold text-zinc-900 uppercase tracking-wider">
              Recent Inventory Audit Movements
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="text-xs text-[#DE6810] hover:underline font-bold"
          >
            Full Audit Trail ({inventoryTransactions.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Date & Time</th>
                <th className="py-2.5 px-3 font-semibold">Movement Type</th>
                <th className="py-2.5 px-3 font-semibold">Product & SKU</th>
                <th className="py-2.5 px-3 font-semibold">Qty Transacted</th>
                <th className="py-2.5 px-3 font-semibold">Balance After</th>
                <th className="py-2.5 px-3 font-semibold">Ref Number</th>
                <th className="py-2.5 px-3 font-semibold">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {inventoryTransactions.slice(0, 5).map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-50/80 transition">
                  <td className="py-3 px-3 text-zinc-500">
                    {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tx.movementType === 'Purchase Entry' || tx.movementType === 'Stock Addition'
                        ? 'bg-emerald-100 text-emerald-800'
                        : tx.movementType === 'Sales / Delivery' || tx.movementType === 'Stock Deduction'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-zinc-100 text-zinc-800'
                    }`}>
                      {tx.movementType}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-zinc-900 truncate max-w-[180px]">{tx.productName}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">{tx.productCode}</div>
                  </td>
                  <td className="py-3 px-3 font-bold text-zinc-900">
                    {tx.quantity}
                  </td>
                  <td className="py-3 px-3 text-zinc-700 font-medium">
                    {tx.newQuantity}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-zinc-600">
                    {tx.referenceNumber}
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

    </div>
  );
};
