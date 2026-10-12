import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Lock, Unlock, KeyRound, LogOut, CheckCircle, Trash2, RotateCcw, X, ShieldCheck } from 'lucide-react';

export const AdminPasswordModal: React.FC = () => {
  const {
    isPasswordModalOpen,
    setIsPasswordModalOpen,
    isAdminUnlocked,
    loginAdminWithPassword,
    logoutAdmin,
    changeAdminPassword,
    clearAllPortfolioData,
    resetToDefault,
    signIn,
    currentUser,
    language,
  } = usePortfolio();

  const [passwordInput, setPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isPasswordModalOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = loginAdminWithPassword(passwordInput);
    if (success) {
      setPasswordInput('');
      setIsPasswordModalOpen(false);
    } else {
      setErrorMsg(language === 'bn' ? 'ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।' : 'Incorrect password.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput || newPasswordInput.trim().length < 4) {
      setErrorMsg(language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' : 'Password must be at least 4 characters.');
      return;
    }
    await changeAdminPassword(newPasswordInput.trim());
    setNewPasswordInput('');
    setErrorMsg('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in"
      onClick={() => setIsPasswordModalOpen(false)}
    >
      <div
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${isAdminUnlocked ? 'bg-emerald-950/60 text-emerald-400' : 'bg-indigo-950/60 text-indigo-400'} border border-slate-800`}>
              {isAdminUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {isAdminUnlocked
                  ? language === 'bn'
                    ? 'এডমিন সিকিউরিটি ও সেটিংস'
                    : 'Admin Security & Settings'
                  : language === 'bn'
                  ? 'এডমিন প্যানেলে প্রবেশ করুন'
                  : 'Admin Panel Access'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isAdminUnlocked
                  ? language === 'bn'
                    ? 'এডমিন মোড সক্রিয় রয়েছে'
                    : 'Admin Mode is currently active'
                  : language === 'bn'
                  ? 'পাসওয়ার্ড দিয়ে সকল কিছু পরিবর্তনের সুবিধা অন করুন'
                  : 'Enter password to manage all content'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPasswordModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {!isAdminUnlocked ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              {errorMsg && (
                <div className="p-2.5 text-xs text-rose-300 bg-rose-950/40 border border-rose-900/60 rounded-lg">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {language === 'bn' ? 'এডমিন পাসওয়ার্ড লিখুন' : 'Enter Admin Password'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    autoFocus
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••"
                    className="w-full px-3.5 py-2.5 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none tracking-widest"
                  />
                  <KeyRound className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
                <div className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-between">
                  <span>{language === 'bn' ? 'ডিফল্ট পাসওয়ার্ড: 1234' : 'Default password: 1234'}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'আনলক করুন' : 'Unlock Admin Mode'}</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-slate-900 px-2 text-slate-500">{language === 'bn' ? 'অথবা' : 'OR'}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await signIn();
                  setIsPasswordModalOpen(false);
                }}
                className="w-full py-2 px-3 text-xs font-medium text-slate-300 hover:text-white bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>{language === 'bn' ? 'গুগল অ্যাকাউন্ট দিয়ে সাইন ইন' : 'Sign in with Google'}</span>
              </button>
            </form>
          ) : (
            /* Unlocked Controls & Password Change */
            <div className="space-y-6">
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-900/50 flex items-center gap-3 text-emerald-300 text-xs">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <div>
                  <div className="font-semibold">{language === 'bn' ? 'এডমিন অ্যাক্সেস অনুমোদিত' : 'Admin Privileges Active'}</div>
                  <div className="text-[11px] text-emerald-400/80">
                    {language === 'bn'
                      ? 'আপনি এখন যেকোনো প্রজেক্ট, স্কিল ও বায়ো নিজেরমতো এডিট ও ডিলিট করতে পারবেন।'
                      : 'You can freely add, edit, or delete any project, skill, and record.'}
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <form onSubmit={handleChangePassword} className="space-y-3 pt-2 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-300">
                  {language === 'bn' ? 'নতুন পাসওয়ার্ড সেট করুন' : 'Change Admin Password'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder={language === 'bn' ? 'নতুন পাসওয়ার্ড দিন' : 'Enter new password'}
                    className="flex-1 px-3 py-1.5 text-xs text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                  >
                    {language === 'bn' ? 'আপডেট' : 'Save'}
                  </button>
                </div>
              </form>

              {/* Clean/Wipe Options */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  {language === 'bn' ? 'ডেটা ম্যানেজমেন্ট' : 'Data Reset Tools'}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          language === 'bn'
                            ? 'আপনি কি সব ডেমো প্রজেক্ট ও তথ্য মুছে সম্পূর্ণ খালি করতে চান? আপনি নিজে নতুন তথ্য যোগ করতে পারবেন।'
                            : 'Clear all demo data to start completely fresh?'
                        )
                      ) {
                        clearAllPortfolioData();
                        setIsPasswordModalOpen(false);
                      }
                    }}
                    className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40 text-rose-300 hover:bg-rose-900/30 text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'সব ডেমো মুছুন' : 'Clear All Demo'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          language === 'bn'
                            ? 'ডিফল্ট ডেমো টেমপ্লেট পুনরায় লোড করতে চান?'
                            : 'Restore default sample template?'
                        )
                      ) {
                        resetToDefault();
                        setIsPasswordModalOpen(false);
                      }
                    }}
                    className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:bg-slate-800 text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'ডেমো টেমপ্লেট' : 'Load Template'}</span>
                  </button>
                </div>
              </div>

              {/* Lock / Exit Admin Mode */}
              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    logoutAdmin();
                    setIsPasswordModalOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>{language === 'bn' ? 'এডমিন মোড লক করুন' : 'Lock Admin Mode'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
