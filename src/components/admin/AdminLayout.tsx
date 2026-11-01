import React, { useState } from 'react';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar, AdminTab } from './AdminSidebar';
import { DashboardView } from './DashboardView';
import { ProductManagementView } from './ProductManagementView';
import { CategoryManagementView } from './CategoryManagementView';
import { InventoryManagementView } from './InventoryManagementView';
import { InquiryManagementView } from './InquiryManagementView';
import { CustomerManagementView } from './CustomerManagementView';
import { ReportsView } from './ReportsView';
import { SettingsView } from './SettingsView';
import { UserManagementView } from './UserManagementView';
import { SqlSchemaModal } from './SqlSchemaModal';
import { ProductDetailModal } from '../public/ProductDetailModal';
import { SqlEditorView } from './SqlEditorView';
import { InquiryModal } from '../public/InquiryModal';
import { Product } from '../../types';

interface AdminLayoutProps {
  onBackToWebsite: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToWebsite }) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);

  // Cross-view selection state
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [inquiryProduct, setInquiryProduct] = useState<Product | null>(null);

  const handleSelectInquiryFromDashboard = (inquiryId: string) => {
    setSelectedInquiryId(inquiryId);
    setCurrentTab('inquiries');
  };

  return (
    <div className="flex h-screen bg-[#F4F4F5] overflow-hidden text-zinc-900">
      
      {/* Sidebar */}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
        }}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header */}
        <AdminHeader
          onBackToWebsite={onBackToWebsite}
          onOpenSqlModal={() => setIsSqlModalOpen(true)}
          onNavigateTab={(tab) => setCurrentTab(tab as AdminTab)}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                onNavigateTab={(t) => setCurrentTab(t)}
                onSelectInquiry={handleSelectInquiryFromDashboard}
              />
            )}

            {currentTab === 'products' && (
              <ProductManagementView
                onViewProductDetail={(p) => setPreviewProduct(p)}
              />
            )}

            {currentTab === 'categories' && <CategoryManagementView />}

            {currentTab === 'inventory' && <InventoryManagementView />}

            {currentTab === 'inquiries' && (
              <InquiryManagementView
                selectedInquiryId={selectedInquiryId}
                onClearSelectedInquiry={() => setSelectedInquiryId(null)}
              />
            )}

            {currentTab === 'customers' && <CustomerManagementView />}

            {currentTab === 'reports' && <ReportsView />}

            {currentTab === 'team' && <UserManagementView />}

            {currentTab === 'settings' && <SettingsView />}

            {currentTab === 'sql-schema' && <SqlEditorView />}
          </div>
        </main>
      </div>

      {/* SQL Schema Modal */}
      <SqlSchemaModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
      />

      {/* Product Detail Modal Preview */}
      <ProductDetailModal
        product={previewProduct}
        isOpen={Boolean(previewProduct)}
        onClose={() => setPreviewProduct(null)}
        onInquire={(prod) => {
          setInquiryProduct(prod);
          setPreviewProduct(null);
        }}
      />

      {/* Inquiry Modal */}
      <InquiryModal
        product={inquiryProduct}
        isOpen={Boolean(inquiryProduct)}
        onClose={() => setInquiryProduct(null)}
      />

    </div>
  );
};
