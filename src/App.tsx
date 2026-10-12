import React from 'react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProjectsGrid } from './components/ProjectsGrid';
import { SkillsSection } from './components/SkillsSection';
import { ExperienceSection } from './components/ExperienceSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { ProjectFormModal } from './components/ProjectFormModal';
import { ProfileEditModal } from './components/ProfileEditModal';
import { AdminPasswordModal } from './components/AdminPasswordModal';
import { ManageSkillsModal } from './components/ManageSkillsModal';
import { ManageExperienceModal } from './components/ManageExperienceModal';
import { ManageEducationModal } from './components/ManageEducationModal';
import { AiAssistantModal, FloatingAiVoiceButton } from './components/AiAssistantModal';
import { ToastContainer } from './components/ToastContainer';
import { ShieldCheck, Plus, Layers, Briefcase, GraduationCap, Lock, Mic, PhoneCall } from 'lucide-react';

const AdminQuickToolbar: React.FC = () => {
  const {
    isAdminUnlocked,
    setIsAddProjectModalOpen,
    setIsManageSkillsModalOpen,
    setIsManageExperienceModalOpen,
    setIsManageEducationModalOpen,
    setIsPasswordModalOpen,
    setIsAiAssistantOpen,
    startAiVoiceCall,
    language,
  } = usePortfolio();

  if (!isAdminUnlocked) return null;

  return (
    <div className="bg-emerald-950/90 border-b border-emerald-900/80 px-3 sm:px-4 py-1.5 sm:py-2 sticky top-[57px] sm:top-[65px] z-30 backdrop-blur-md overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs whitespace-nowrap min-w-max sm:min-w-0">
        <div className="flex items-center gap-2 text-emerald-300 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{language === 'bn' ? 'এডমিন মোড সক্রিয়' : 'Admin Mode Active'}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddProjectModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-white font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'প্রজেক্ট যোগ' : 'Add Project'}</span>
          </button>

          <button
            onClick={() => setIsManageSkillsModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-white font-medium transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'দক্ষতা পরিচালনা' : 'Skills'}</span>
          </button>

          <button
            onClick={() => setIsManageExperienceModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-white font-medium transition-colors"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'অভিজ্ঞতা পরিচালনা' : 'Experience'}</span>
          </button>

          <button
            onClick={() => setIsManageEducationModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-white font-medium transition-colors"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'শিক্ষা পরিচালনা' : 'Education'}</span>
          </button>

          <button
            onClick={() => startAiVoiceCall()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 font-semibold transition-colors border border-emerald-600/60 shadow-sm"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>{language === 'bn' ? '📞 AI লাইভ কল' : '📞 Live AI Call'}</span>
          </button>

          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-medium transition-colors border border-slate-700/60"
          >
            <Lock className="w-3 h-3 text-amber-400" />
            <span>{language === 'bn' ? 'পাসওয়ার্ড/লক' : 'Lock'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <PortfolioProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        <Navbar />
        <AdminQuickToolbar />
        <main className="flex-1">
          <Hero />
          <ProjectsGrid />
          <SkillsSection />
          <ExperienceSection />
          <ContactSection />
        </main>
        <Footer />

        {/* Global Modals & Notifications */}
        <ProjectDetailModal />
        <ProjectFormModal />
        <ProfileEditModal />
        <AdminPasswordModal />
        <ManageSkillsModal />
        <ManageExperienceModal />
        <ManageEducationModal />
        <AiAssistantModal />
        <FloatingAiVoiceButton />
        <ToastContainer />
      </div>
    </PortfolioProvider>
  );
}
