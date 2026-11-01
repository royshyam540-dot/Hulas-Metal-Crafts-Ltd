import React, { useState } from 'react';
import { useStore, store } from './services/store';
import { ToastProvider, useToast } from './components/common/Toast';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { WhatsAppFloatingButton } from './components/common/WhatsAppFloatingButton';
import { HeroSection } from './components/public/HeroSection';
import { StatsSection } from './components/public/StatsSection';
import { FeaturedProducts } from './components/public/FeaturedProducts';
import { UtensilsShowcase } from './components/public/UtensilsShowcase';
import { PipesShowcase } from './components/public/PipesShowcase';
import { WhyChooseUs } from './components/public/WhyChooseUs';
import { AllProductsView } from './components/public/AllProductsView';
import { UtensilsCatalogView } from './components/public/UtensilsCatalogView';
import { PipesCatalogView } from './components/public/PipesCatalogView';
import { AboutUsView } from './components/public/AboutUsView';
import { ContactUsView } from './components/public/ContactUsView';
import { ProductDetailModal } from './components/public/ProductDetailModal';
import { InquiryModal } from './components/public/InquiryModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminLayout } from './components/admin/AdminLayout';
import { Product } from './types';
import { 
  ArrowRight, 
  MessageSquare, 
  Phone, 
  ShieldCheck, 
  Factory 
} from 'lucide-react';

function MainApp() {
  const { currentUser, settings } = useStore();
  const [currentPublicTab, setCurrentPublicTab] = useState('home');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Global Public Modals
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [selectedProductForInquiry, setSelectedProductForInquiry] = useState<Product | null>(null);

  const handleOpenAdmin = () => {
    if (currentUser) {
      setIsAdminMode(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    setIsAdminMode(true);
  };

  const handleNavigate = (tab: string) => {
    setCurrentPublicTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in Admin Mode, show the complete Business Management ERP
  if (isAdminMode) {
    return (
      <AdminLayout
        onBackToWebsite={() => {
          setIsAdminMode(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F7] text-[#252525]">
      
      {/* Top Navbar */}
      <Navbar
        currentTab={currentPublicTab}
        onNavigate={handleNavigate}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Main Public Content Router */}
      <main className="flex-1">
        {currentPublicTab === 'home' && (
          <div>
            <HeroSection onNavigate={handleNavigate} />
            <StatsSection />
            <FeaturedProducts
              onViewDetails={(p) => setSelectedProductForDetail(p)}
              onInquire={(p) => setSelectedProductForInquiry(p)}
              onNavigate={handleNavigate}
            />
            <UtensilsShowcase
              onViewDetails={(p) => setSelectedProductForDetail(p)}
              onInquire={(p) => setSelectedProductForInquiry(p)}
              onNavigate={handleNavigate}
            />
            <PipesShowcase
              onViewDetails={(p) => setSelectedProductForDetail(p)}
              onInquire={(p) => setSelectedProductForInquiry(p)}
              onNavigate={handleNavigate}
            />
            <WhyChooseUs />

            {/* Quick Factory Order Call-to-Action */}
            <section className="bg-gradient-to-r from-[#252525] to-zinc-900 text-white py-16 border-t-4 border-[#F47B20]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/15 border border-[#F47B20]/40 text-[#F47B20] text-xs font-bold uppercase tracking-wider">
                  <Factory className="w-3.5 h-3.5" />
                  <span>Direct Factory Consignments & Dealerships</span>
                </div>
                <h2 className="font-heading text-3xl sm:text-4xl font-extrabold max-w-2xl mx-auto tracking-tight">
                  Ready to Source Certified Stainless Steel from the Manufacturer?
                </h2>
                <p className="text-zinc-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
                  Connect with our metallurgy engineers for bulk dealer price lists, mill test certificates, and custom dimensional fabrication.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
                  <button
                    onClick={() => handleNavigate('all-products')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F47B20] hover:bg-[#DE6810] text-white font-bold text-xs uppercase tracking-wider transition shadow-lg cursor-pointer"
                  >
                    <span>Browse 500+ Items</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleNavigate('contact-us')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs border border-zinc-700 transition cursor-pointer"
                  >
                    <Phone className="w-4 h-4 text-[#F47B20]" />
                    <span>Talk to Sales Engineering</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {currentPublicTab === 'all-products' && (
          <AllProductsView
            onViewDetails={(p) => setSelectedProductForDetail(p)}
            onInquire={(p) => setSelectedProductForInquiry(p)}
          />
        )}

        {currentPublicTab === 'ss-utensils' && (
          <UtensilsCatalogView
            onViewDetails={(p) => setSelectedProductForDetail(p)}
            onInquire={(p) => setSelectedProductForInquiry(p)}
          />
        )}

        {currentPublicTab === 'ss-pipes' && (
          <PipesCatalogView
            onViewDetails={(p) => setSelectedProductForDetail(p)}
            onInquire={(p) => setSelectedProductForInquiry(p)}
          />
        )}

        {currentPublicTab === 'about-us' && (
          <AboutUsView onNavigate={handleNavigate} />
        )}

        {currentPublicTab === 'contact-us' && (
          <ContactUsView />
        )}
      </main>

      {/* Industrial Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Floating WhatsApp Action Button */}
      <WhatsAppFloatingButton />

      {/* Global Product Details Modal */}
      <ProductDetailModal
        product={selectedProductForDetail}
        isOpen={Boolean(selectedProductForDetail)}
        onClose={() => setSelectedProductForDetail(null)}
        onInquire={(p) => {
          setSelectedProductForDetail(null);
          setSelectedProductForInquiry(p);
        }}
      />

      {/* Global Product Inquiry Modal */}
      <InquiryModal
        product={selectedProductForInquiry}
        isOpen={Boolean(selectedProductForInquiry)}
        onClose={() => setSelectedProductForInquiry(null)}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
