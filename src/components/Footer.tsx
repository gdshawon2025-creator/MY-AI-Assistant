import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { ArrowUp, Heart, Settings, Download } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language, profile, setIsProfileModalOpen, exportDataJson } = usePortfolio();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-12 text-slate-400 text-xs">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <span className="font-bold text-white tracking-tight">
            {language === 'bn' ? profile.name : profile.nameEn}
          </span>
          <span aria-hidden="true" className="hidden sm:inline text-slate-700">·</span>
          <span>
            © {new Date().getFullYear()} {language === 'bn' ? 'কাজের পোর্টফোলিও ও সংকলন।' : 'Personal Portfolio Hub.'}
          </span>
        </div>

        {/* Quick Utilities */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="hover:text-slate-200 transition-colors flex items-center gap-1"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'bn' ? 'সেটিংস ও ব্যাকআপ' : 'Settings & Backup'}</span>
          </button>

          <span aria-hidden="true" className="text-slate-800">·</span>

          <button
            onClick={exportDataJson}
            className="hover:text-slate-200 transition-colors flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'bn' ? 'JSON এক্সপোর্ট' : 'Export JSON'}</span>
          </button>

          <span aria-hidden="true" className="text-slate-800">·</span>

          <button
            onClick={scrollToTop}
            className="p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
