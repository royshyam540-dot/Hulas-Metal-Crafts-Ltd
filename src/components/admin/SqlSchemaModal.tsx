import React, { useState } from 'react';
import { Database, Copy, Check, X, Download, ShieldCheck } from 'lucide-react';
import { SUPABASE_SQL_SCHEMA } from '../../lib/sqlSchema';
import { useToast } from '../common/Toast';

interface SqlSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlSchemaModal: React.FC<SqlSchemaModalProps> = ({
  isOpen,
  onClose
}) => {
  const { success } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    success('Supabase SQL Schema copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([SUPABASE_SQL_SCHEMA], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hulas_metal_crafts_supabase_schema.sql';
    link.click();
    success('SQL migration file downloaded.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-zinc-900 text-white rounded-2xl shadow-2xl border border-zinc-700 overflow-hidden my-6 animate-fadeIn">
        
        {/* Header */}
        <div className="bg-[#252525] p-5 border-b border-zinc-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DE6810] flex items-center justify-center text-white">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white">
                Supabase / PostgreSQL Production Schema DDL
              </h3>
              <p className="text-xs text-zinc-400">
                12 Tables, Foreign Keys, Triggers, Indexes, Storage Buckets & RLS Security Policies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSql}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold border border-zinc-600 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .sql</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F47B20] hover:bg-[#DE6810] text-xs font-bold transition shadow"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
            </button>

            <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 ml-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info callout */}
        <div className="bg-zinc-800/80 px-6 py-3 border-b border-zinc-700 text-xs text-zinc-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Run this script in your Supabase SQL Editor to provision all tables, enable Row Level Security, and configure storage buckets.
          </span>
        </div>

        {/* Code Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto font-mono text-xs text-zinc-300 bg-zinc-950 leading-relaxed selection:bg-[#F47B20]">
          <pre>{SUPABASE_SQL_SCHEMA}</pre>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#252525] border-t border-zinc-700 flex items-center justify-between text-xs text-zinc-400">
          <span>Engineered for PostgreSQL 15+ / Supabase Platform</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
