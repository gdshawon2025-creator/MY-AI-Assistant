import React, { useState, useRef } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { X, Download, Upload, RotateCcw, Save, Camera, Lock, KeyRound } from 'lucide-react';

export const ProfileEditModal: React.FC = () => {
  const {
    isProfileModalOpen,
    setIsProfileModalOpen,
    profile,
    updateProfile,
    resetToDefault,
    exportDataJson,
    importDataJson,
    setIsPasswordModalOpen,
    isAdminUnlocked,
    language,
  } = usePortfolio();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(profile.name);
  const [nameEn, setNameEn] = useState(profile.nameEn);
  const [title, setTitle] = useState(profile.title);
  const [titleEn, setTitleEn] = useState(profile.titleEn);
  const [bio, setBio] = useState(profile.bio);
  const [bioEn, setBioEn] = useState(profile.bioEn);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp || '');
  const [location, setLocation] = useState(profile.location);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '');
  const [github, setGithub] = useState(profile.socials.github);
  const [linkedin, setLinkedin] = useState(profile.socials.linkedin);
  const [completedProjects, setCompletedProjects] = useState(profile.metrics.completedProjects);
  const [yearsExperience, setYearsExperience] = useState(profile.metrics.yearsExperience);
  const [satisfiedClients, setSatisfiedClients] = useState(profile.metrics.satisfiedClients);
  const [onTimeDeliveryRate, setOnTimeDeliveryRate] = useState(profile.metrics.onTimeDeliveryRate);

  if (!isProfileModalOpen) return null;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setAvatarUrl(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name,
      nameEn,
      title,
      titleEn,
      bio,
      bioEn,
      email,
      phone,
      whatsapp,
      location,
      avatarUrl,
      socials: {
        ...profile.socials,
        github,
        linkedin,
      },
      metrics: {
        completedProjects: Number(completedProjects) || 0,
        yearsExperience: Number(yearsExperience) || 0,
        satisfiedClients: Number(satisfiedClients) || 0,
        onTimeDeliveryRate: Number(onTimeDeliveryRate) || 0,
      },
    });
    setIsProfileModalOpen(false);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        if (content) {
          await importDataJson(content);
          setIsProfileModalOpen(false);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      onClick={() => setIsProfileModalOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div>
            <h3 className="text-lg font-bold text-white">
              {language === 'bn' ? 'প্রোফাইল ও পোর্টফোলিও সেটিংস' : 'Profile & Portfolio Settings'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'bn'
                ? 'আপনার নাম, পরিচয়, ছবি ও সেটিংস নিজেরমতো পরিবর্তন করুন।'
                : 'Customize your identity, avatar photo, and metrics.'}
            </p>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSave} className="overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Avatar Photo Section */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-indigo-400">
                  {name.charAt(0) || 'ইউ'}
                </span>
              )}
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <span className="text-xs font-semibold text-slate-300 block">
                {language === 'bn' ? 'প্রোফাইল ছবি (আপনার নিজের ছবি যুক্ত করুন)' : 'Profile Photo / Avatar'}
              </span>
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'ছবি আপলোড' : 'Upload Photo'}</span>
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/20 border border-rose-900/40 rounded-lg"
                  >
                    {language === 'bn' ? 'ছবি রিমুভ' : 'Remove'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Identity Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'আপনার নাম (বাংলা)' : 'Name (Bengali)'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'আপনার নাম (English)' : 'Name (English)'}
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'পদবী / পেশা (বাংলা)' : 'Professional Title (Bengali)'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'পদবী / পেশা (English)' : 'Professional Title (English)'}
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {language === 'bn' ? 'বায়ো / ভূমিকা (বাংলা)' : 'Bio / Elevator Pitch (Bengali)'}
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'ইমেইল' : 'Email'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'WhatsApp' : 'WhatsApp'}
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+8801..."
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'লোকেশন' : 'Location'}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Metrics */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-3">
              {language === 'bn' ? 'পরিসংখ্যান ও সংখ্যা (মেট্রিক্স)' : 'Metrics & Numbers'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  {language === 'bn' ? 'সম্পূর্ণ প্রজেক্ট' : 'Projects'}
                </label>
                <input
                  type="number"
                  value={completedProjects}
                  onChange={(e) => setCompletedProjects(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs text-slate-100 bg-slate-950 border border-slate-800 rounded-lg font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  {language === 'bn' ? 'অভিজ্ঞতার বছর' : 'Years Exp'}
                </label>
                <input
                  type="number"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs text-slate-100 bg-slate-950 border border-slate-800 rounded-lg font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  {language === 'bn' ? 'সন্তুষ্ট ক্লায়েন্ট' : 'Clients'}
                </label>
                <input
                  type="number"
                  value={satisfiedClients}
                  onChange={(e) => setSatisfiedClients(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs text-slate-100 bg-slate-950 border border-slate-800 rounded-lg font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  {language === 'bn' ? 'ডেলিভারি রেট %' : 'On-Time %'}
                </label>
                <input
                  type="number"
                  value={onTimeDeliveryRate}
                  onChange={(e) => setOnTimeDeliveryRate(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs text-slate-100 bg-slate-950 border border-slate-800 rounded-lg font-mono tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Admin Password Shortcut */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsProfileModalOpen(false);
                setIsPasswordModalOpen(true);
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Lock className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold">{language === 'bn' ? 'এডমিন পাসওয়ার্ড ও নিরাপত্তা সেটিংস' : 'Admin Password & Security Settings'}</span>
              </div>
              <span className="text-xs text-indigo-400 font-medium">{language === 'bn' ? 'পরিবর্তন করুন →' : 'Change →'}</span>
            </button>
          </div>

          {/* Backup, Export & Reset Section */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              {language === 'bn' ? 'পোর্টফোলিও ডেটা ব্যাকআপ ও সুরক্ষা' : 'Data Backup & Export'}
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={exportDataJson}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>{language === 'bn' ? 'JSON ব্যাকআপ ডাউনলোড' : 'Download JSON Backup'}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-sky-400" />
                <span>{language === 'bn' ? 'ব্যাকআপ রিস্টোর করুন' : 'Restore from JSON'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      language === 'bn'
                        ? 'আপনি কি সব ডেটা ডিফল্ট ডেমোতে রিসেট করতে চান?'
                        : 'Reset all portfolio data to default demo state?'
                    )
                  ) {
                    resetToDefault();
                    setIsProfileModalOpen(false);
                  }
                }}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-950/20 border border-rose-900/40 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'ডেমো রিসেট' : 'Reset to Demo'}</span>
              </button>
            </div>
          </div>

          {/* Footer Save */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
