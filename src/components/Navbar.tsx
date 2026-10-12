import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Plus, Globe, Menu, X, Settings, Lock, Unlock, Sparkles, Mic, MessageSquare, PhoneCall } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    language,
    setLanguage,
    profile,
    setIsAddProjectModalOpen,
    setIsProfileModalOpen,
    isAdminUnlocked,
    setIsPasswordModalOpen,
    setIsAiAssistantOpen,
    startAiVoiceCall,
  } = usePortfolio();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '#projects', labelBn: 'ডিজাইন সংকলন', labelEn: 'Projects' },
    { href: '#skills', labelBn: 'দক্ষতা ও টুলস', labelEn: 'Skills' },
    { href: '#experience', labelBn: 'অভিজ্ঞতা', labelEn: 'Experience' },
    { href: '#contact', labelBn: 'অর্ডার ও যোগাযোগ', labelEn: 'Contact' },
  ];

  const openWhatsApp = () => {
    const text = encodeURIComponent(
      language === 'bn'
        ? `হ্যালো ${profile.name}, আমি আপনার গ্রাফিক্স ডিজাইন পোর্টফোলিও দেখেছি এবং একটি প্রজেক্টের ডিজাইন নিয়ে আলোচনা করতে চাই।`
        : `Hello ${profile.nameEn}, I saw your graphic design portfolio and want to discuss a project.`
    );
    const cleanNum = (profile.whatsapp || '01804459691').replace(/[^0-9]/g, '');
    window.open(`https://wa.me/88${cleanNum.startsWith('88') ? cleanNum.slice(2) : cleanNum}?text=${text}`, '_blank');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Wordmark */}
        <a
          href="#"
          className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-indigo-400 transition-colors flex items-center gap-2"
        >
          <span className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-sm">
            {profile.name?.charAt(0) || 'ইউ'}
          </span>
          <span className="truncate max-w-[140px] xs:max-w-none">
            {language === 'bn' ? profile.name : profile.nameEn}
          </span>
        </a>

        {/* Zone 2: Navigation Links for Desktop */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-indigo-400"
            >
              {language === 'bn' ? link.labelBn : link.labelEn}
            </a>
          ))}
        </nav>

        {/* Zone 3: Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Quick Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            title={language === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden xs:inline">{language === 'bn' ? 'EN' : 'বাং'}</span>
          </button>

          {/* AI Voice Assistant & Live Call Button */}
          <button
            onClick={() => startAiVoiceCall()}
            title={
              isAdminUnlocked
                ? language === 'bn'
                  ? 'মালিক AI লাইভ ভয়েস কল (সীমাহীন সময়)'
                  : 'Owner AI Live Voice Call (Unlimited)'
                : language === 'bn'
                ? 'ব্যক্তিগত AI সহকারী ও ভয়েস কল (মালিকের জন্য সংরক্ষিত)'
                : 'Private Owner AI Assistant & Live Call'
            }
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap shrink-0 shadow-sm active:scale-95 ${
              isAdminUnlocked
                ? 'bg-emerald-950/80 border-emerald-600/80 text-emerald-200 hover:bg-emerald-900/80 shadow-emerald-950/50'
                : 'bg-slate-900 border-purple-900/60 text-slate-300 hover:text-purple-200 hover:border-purple-700/80'
            }`}
          >
            {isAdminUnlocked ? (
              <>
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>{language === 'bn' ? '📞 AI লাইভ কল' : '📞 AI Call'}</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'bn' ? 'AI ভয়েস' : 'AI Voice'}</span>
              </>
            )}
          </button>

          {/* Admin Lock / Password Button */}
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            title={
              isAdminUnlocked
                ? language === 'bn'
                  ? 'এডমিন মোড সক্রিয়'
                  : 'Admin Mode Active'
                : language === 'bn'
                ? 'পাসওয়ার্ড দিয়ে এডমিন প্যানেলে প্রবেশ করুন'
                : 'Enter Admin Password'
            }
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
              isAdminUnlocked
                ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/40'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            {isAdminUnlocked ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'bn' ? 'এডমিন চালু' : 'Admin'}</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'bn' ? 'লগইন' : 'Login'}</span>
              </>
            )}
          </button>

          {/* Add Project Button (Desktop & Tablet) */}
          <button
            onClick={() => setIsAddProjectModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 active:scale-95 transition-all shadow-sm whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'নতুন ডিজাইন' : 'Add Design'}</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-5 py-4 space-y-4 animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-sm font-medium text-slate-300 hover:text-white border-b border-slate-900 flex items-center justify-between"
              >
                <span>{language === 'bn' ? link.labelBn : link.labelEn}</span>
                <span className="text-slate-600">→</span>
              </a>
            ))}
          </div>

          {/* Mobile Action Buttons */}
          <div className="pt-2 space-y-2.5">
            {/* Add Project for mobile */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsAddProjectModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'bn' ? 'নতুন ডিজাইন প্রজেক্ট যোগ করুন' : 'Add New Design Project'}</span>
            </button>

            {/* AI Live Voice Call for mobile */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                startAiVoiceCall();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-700/60 text-emerald-200 text-xs font-semibold hover:bg-emerald-900/60 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>{language === 'bn' ? '📞 সরাসরি AI লাইভ ভয়েস কল' : '📞 Live AI Voice Call'}</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/90 text-emerald-300 font-bold">
                {isAdminUnlocked
                  ? language === 'bn'
                    ? 'সীমাহীন'
                    : 'Unlimited'
                  : language === 'bn'
                  ? 'লকড'
                  : 'Locked'}
              </span>
            </button>

            {/* WhatsApp direct order */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openWhatsApp();
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-semibold hover:bg-emerald-900/40 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp: {profile.whatsapp || '01804459691'}</span>
            </button>

            {/* Admin Password & Settings */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsPasswordModalOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 text-xs font-medium hover:bg-slate-850"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isAdminUnlocked ? (language === 'bn' ? 'এডমিন চালু' : 'Admin Active') : (language === 'bn' ? 'এডমিন লগইন' : 'Admin Login')}</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium hover:text-white hover:bg-slate-850"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'সেটিংস' : 'Settings'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
