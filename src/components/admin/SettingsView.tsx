import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  Eye, 
  Globe, 
  Database, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { useStore, store } from '../../services/store';
import { getSupabaseConfig, saveSupabaseConfig, isSupabaseConfigured, getSupabaseClient } from '../../lib/supabaseClient';
import { useToast } from '../common/Toast';

export const SettingsView: React.FC = () => {
  const { settings } = useStore();
  const { success, error } = useToast();

  const [formData, setFormData] = useState(settings);
  const [supabaseUrl, setSupabaseUrl] = useState(getSupabaseConfig().url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(getSupabaseConfig().anonKey);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);

  const handleTestSupabaseConnection = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      error('Please enter both Supabase Project URL and Anon Public Key.');
      return;
    }

    setIsTestingSupabase(true);
    saveSupabaseConfig(supabaseUrl, supabaseAnonKey);

    try {
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('Could not create Supabase client. Please check URL format (e.g. https://xyz.supabase.co).');
      }

      const { data, count, error: queryError } = await client
        .from('inquiries')
        .select('*', { count: 'exact' })
        .limit(1);

      if (queryError) {
        throw queryError;
      }

      success(`Connected to Supabase! Found ${count ?? 0} inquiries in public.inquiries.`);

      const localInquiriesCount = store.getState().inquiries.length;
      if (localInquiriesCount > 0 && window.confirm(`Found ${localInquiriesCount} local inquiries. Sync them to Supabase public.inquiries table now?`)) {
        const syncResult = await store.syncAllInquiriesToSupabase();
        success(`Synced ${syncResult.synced} inquiries to Supabase! (${syncResult.errors} skipped/failed)`);
      }
    } catch (err: any) {
      console.error('Supabase test error:', err);
      error(`Supabase connection failed: ${err.message || 'Check URL and Anon Key'}`);
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      store.updateSettings(formData);
      saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
      success('Company settings and credentials saved successfully.');
    } catch (err) {
      error('Failed to update settings.');
    }
  };

  const handleTestWhatsApp = () => {
    const text = 'Testing official WhatsApp integration for Hulas Metal Crafts Ltd.';
    const url = store.getWhatsAppUrl(formData.whatsappNumber, text);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset all products, stock, and inquiries to initial factory demo dataset?')) {
      store.resetToDemoData();
      setFormData(store.getState().settings);
      success('Database successfully restored to clean demo state.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="font-heading text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#F47B20]" />
            Website & Corporate ERP Configuration
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Global company profiles, addresses, WhatsApp numbers, pricing visibility, and database connections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDemoData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold border border-zinc-300 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: Company Profile & Contacts */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
            <Building2 className="w-5 h-5 text-[#F47B20]" />
            <h3 className="font-heading text-sm font-bold text-zinc-900 uppercase tracking-wider">
              1. Corporate Profile & Contact Info
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-zinc-700 font-semibold mb-1">Company Legal Name</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-semibold mb-1">Corporate Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-semibold mb-1">Primary Hotline Phone</label>
              <input
                type="text"
                value={formData.primaryPhone}
                onChange={(e) => setFormData({ ...formData, primaryPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-semibold mb-1">Factory Phone</label>
              <input
                type="text"
                value={formData.secondaryPhone}
                onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-semibold mb-1">General Inquiries Email</label>
              <input
                type="email"
                value={formData.primaryEmail}
                onChange={(e) => setFormData({ ...formData, primaryEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-semibold mb-1">Technical Sales Email</label>
              <input
                type="email"
                value={formData.salesEmail}
                onChange={(e) => setFormData({ ...formData, salesEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-zinc-700 font-semibold mb-1">Corporate Head Office Address</label>
              <input
                type="text"
                value={formData.headOfficeAddress}
                onChange={(e) => setFormData({ ...formData, headOfficeAddress: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-zinc-700 font-semibold mb-1">Biratnagar Factory Complex Address</label>
              <input
                type="text"
                value={formData.factoryAddress}
                onChange={(e) => setFormData({ ...formData, factoryAddress: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-zinc-700 font-semibold mb-1">Business Hours</label>
              <input
                type="text"
                value={formData.businessHours}
                onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Dynamic WhatsApp Integration */}
        <div className="bg-emerald-50/60 p-6 rounded-2xl border border-emerald-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-700" />
              <h3 className="font-heading text-sm font-bold text-emerald-950 uppercase tracking-wider">
                2. WhatsApp Click-to-Chat Integration
              </h3>
            </div>
            <button
              type="button"
              onClick={handleTestWhatsApp}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow"
            >
              Test WhatsApp Link
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-emerald-900 font-semibold mb-1">
                Company WhatsApp Number (With Country Code, No '+') *
              </label>
              <input
                type="text"
                required
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                placeholder="e.g. 9779801234567"
                className="w-full px-3 py-2 rounded-lg border border-emerald-300 bg-white font-mono"
              />
              <p className="text-[11px] text-emerald-800 mt-1">
                Used dynamically across all product cards, specifications drawers, headers, and footers.
              </p>
            </div>

            <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 text-zinc-600 text-xs flex flex-col justify-center">
              <span className="font-bold text-zinc-900">Current Click-to-Chat Format:</span>
              <span className="font-mono text-[11px] text-emerald-700 mt-1 truncate">
                https://wa.me/{formData.whatsappNumber.replace(/[^0-9]/g, '')}?text=...
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3: Public Catalog Display & Pricing */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
            <Eye className="w-5 h-5 text-[#F47B20]" />
            <h3 className="font-heading text-sm font-bold text-zinc-900 uppercase tracking-wider">
              3. Public Catalog & Price Visibility Rules
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showPricesGlobally}
                onChange={(e) => setFormData({ ...formData, showPricesGlobally: e.target.checked })}
                className="rounded text-[#F47B20] focus:ring-[#F47B20] mt-0.5"
              />
              <div>
                <strong className="text-zinc-900 block font-semibold">Enable Global Price Display</strong>
                <span className="text-zinc-500">
                  When enabled, standard base prices appear on product cards. When disabled, customers are prompted to request direct factory quotations (MOQ mode).
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowPublicInquiries}
                onChange={(e) => setFormData({ ...formData, allowPublicInquiries: e.target.checked })}
                className="rounded text-[#F47B20] focus:ring-[#F47B20] mt-0.5"
              />
              <div>
                <strong className="text-zinc-900 block font-semibold">Allow Public Customer Inquiries</strong>
                <span className="text-zinc-500">
                  Permits public visitors to submit quote inquiries directly from product cards.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* SECTION 4: Supabase Live Database Connection */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#DE6810]" />
              <div>
                <h3 className="font-heading text-sm font-bold text-zinc-900 uppercase tracking-wider">
                  4. Live Supabase Backend & Database Credentials
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Connect live Supabase Postgres project or continue with the high-speed local offline persistence.
                </p>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              isSupabaseConfigured() ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-600'
            }`}>
              {isSupabaseConfigured() ? 'Live Supabase Connected' : 'Local Storage Mode'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-zinc-700 font-semibold mb-1">
                Supabase Project URL (VITE_SUPABASE_URL)
              </label>
              <input
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-semibold mb-1">
                Supabase Anon / Public Key (VITE_SUPABASE_ANON_KEY)
              </label>
              <input
                type="password"
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 font-mono"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100">
            <p className="text-[11px] text-zinc-500">
              When connected, any new customer inquiries submitted from product cards or the contact page are automatically inserted into your Supabase <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono">public.inquiries</code> table.
            </p>

            <button
              type="button"
              onClick={handleTestSupabaseConnection}
              disabled={isTestingSupabase}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs transition cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isTestingSupabase ? 'Verifying & Syncing...' : 'Test Connection & Sync Inquiries'}</span>
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#F47B20] hover:bg-[#DE6810] text-white font-bold text-xs uppercase tracking-wider shadow-lg transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save All Configuration Changes</span>
          </button>
        </div>

      </form>

    </div>
  );
};
