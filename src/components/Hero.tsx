import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Mail, FolderGit2, Camera, Edit3, MessageSquare, Trash2 } from 'lucide-react';

export const Hero: React.FC = () => {
  const {
    language,
    profile,
    updateProfile,
    setIsAddProjectModalOpen,
    setIsProfileModalOpen,
  } = usePortfolio();

  const openWhatsApp = () => {
    const text = encodeURIComponent(
      language === 'bn'
        ? `হ্যালো ${profile.name}, আমি আপনার গ্রাফিক্স ডিজাইন পোর্টফোলিও দেখেছি এবং একটি প্রজেক্টের ডিজাইন নিয়ে আলোচনা করতে চাই।`
        : `Hello ${profile.nameEn}, I saw your graphic design portfolio and want to discuss a project.`
    );
    const cleanNum = profile.whatsapp.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/88${cleanNum.startsWith('88') ? cleanNum.slice(2) : cleanNum}?text=${text}`, '_blank');
  };

  const handleRemoveAvatar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(language === 'bn' ? 'প্রোফাইল ছবি মুছে ফেলতে চান?' : 'Remove profile photo?')) {
      await updateProfile({ avatarUrl: '' });
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 border-b border-slate-900">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-indigo-950/20 via-slate-950/10 to-transparent blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Split-Screen Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Typographic Hierarchy */}
          <div className="lg:col-span-7 space-y-6">
            {/* Kicker (quiet unboxed metadata) */}
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-indigo-400 uppercase">
              <span>{language === 'bn' ? 'প্রফেশনাল গ্রাফিক্স ডিজাইনার' : 'Professional Graphic Designer'}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{language === 'bn' ? profile.location : 'Dhaka, Bangladesh'}</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.18] [text-wrap:balance]">
              {language === 'bn' ? (
                <>
                  সৃজনশীল ভাবনায় তৈরি{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-200">
                    আকর্ষণীয় গ্রাফিক্স ও ব্র্যান্ড আইডেন্টিটি
                  </span>
                </>
              ) : (
                <>
                  Crafting distinctive visual identities &{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-200">
                    high-impact graphic designs
                  </span>
                </>
              )}
            </h1>

            {/* Sub-headline / Title */}
            <p className="text-lg font-medium text-slate-300">
              {language === 'bn' ? profile.title : profile.titleEn}
            </p>

            {/* Lead Copy */}
            <p className="text-base text-slate-400 leading-relaxed max-w-2xl">
              {language === 'bn' ? profile.bio : profile.bioEn}
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#projects"
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm"
              >
                <FolderGit2 className="w-4 h-4" />
                <span>{language === 'bn' ? 'ডিজাইন পোর্টফোলিও দেখুন' : 'Explore Portfolio'}</span>
              </a>

              {/* Direct WhatsApp CTA */}
              <button
                type="button"
                onClick={openWhatsApp}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 rounded-lg hover:bg-emerald-900/60 transition-colors shadow-sm"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp: {profile.whatsapp}</span>
              </button>

              <button
                onClick={() => setIsAddProjectModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-indigo-300 bg-indigo-950/40 border border-indigo-900/60 rounded-lg hover:bg-indigo-900/40 transition-colors"
              >
                <span>{language === 'bn' ? '+ নতুন ডিজাইন যোগ' : '+ Add Design'}</span>
              </button>

              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{language === 'bn' ? 'তথ্য পরিবর্তন' : 'Edit Bio'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Visual Container at matching height */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div
              onClick={() => setIsProfileModalOpen(true)}
              className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl group cursor-pointer"
            >
              {profile.avatarUrl ? (
                <>
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
                  />
                  {/* Quick Delete Avatar button */}
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    title={language === 'bn' ? 'ছবি মুছে ফেলুন' : 'Delete photo'}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-rose-400 hover:bg-slate-900 transition-colors z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                /* Sleek Monogram Visual Placeholder when no photo is uploaded */
                <div className="w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-950 flex flex-col items-center justify-center p-8 text-center relative">
                  <div className="absolute inset-0 border border-indigo-500/10 rounded-2xl m-6 pointer-events-none" />
                  
                  <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl mb-4 group-hover:scale-105 transition-transform">
                    {profile.name.charAt(0) || 'ইউ'}
                  </div>

                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {language === 'bn' ? profile.name : profile.nameEn}
                  </h3>
                  <p className="text-xs text-indigo-300 mt-1 max-w-[200px] truncate">
                    {language === 'bn' ? profile.title : profile.titleEn}
                  </p>

                  <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950/70 border border-slate-800/80 px-3 py-1.5 rounded-lg group-hover:text-white transition-colors">
                    <Camera className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{language === 'bn' ? 'নিজের ছবি আপলোড করুন' : 'Click to Upload Photo'}</span>
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-300 bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-lg border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{language === 'bn' ? profile.name : profile.nameEn}</span>
                  <span aria-hidden="true" className="text-slate-500">·</span>
                  <span className="text-slate-400">{language === 'bn' ? 'ডিজাইন অর্ডারের জন্য প্রস্তুত' : 'Available for orders'}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProfileModalOpen(true);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{language === 'bn' ? 'এডিট' : 'Edit'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Impact Metrics Strip: Full-width row below the hero split */}
        <div className="mt-16 pt-8 border-t border-slate-900 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
              {profile.metrics.completedProjects}+
            </div>
            <div className="text-xs sm:text-sm text-slate-400 mt-1">
              {language === 'bn' ? 'সফল ডিজাইন প্রজেক্ট' : 'Design Projects Completed'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
              {profile.metrics.yearsExperience}+ {language === 'bn' ? 'বছর' : 'Years'}
            </div>
            <div className="text-xs sm:text-sm text-slate-400 mt-1">
              {language === 'bn' ? 'ডিজাইনের কাজের অভিজ্ঞতা' : 'Years Design Experience'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
              {profile.metrics.satisfiedClients}+
            </div>
            <div className="text-xs sm:text-sm text-slate-400 mt-1">
              {language === 'bn' ? 'সন্তুষ্ট ক্লায়েন্ট' : 'Happy Clients'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
              {profile.metrics.onTimeDeliveryRate}%
            </div>
            <div className="text-xs sm:text-sm text-slate-400 mt-1">
              {language === 'bn' ? 'সময়মতো ডেলিভারি রেট' : 'On-Time Delivery'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
