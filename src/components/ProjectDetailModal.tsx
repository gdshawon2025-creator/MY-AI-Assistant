import React, { useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { X, ExternalLink, Github, Calendar, Building, UserCheck, Tag, Edit2 } from 'lucide-react';

export const ProjectDetailModal: React.FC = () => {
  const {
    selectedProjectForDetail,
    setSelectedProjectForDetail,
    language,
    setEditingProject,
    setIsAddProjectModalOpen,
  } = usePortfolio();

  const project = selectedProjectForDetail;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedProjectForDetail(null);
      }
    };
    if (project) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [project, setSelectedProjectForDetail]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={() => setSelectedProjectForDetail(null)}
    >
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-indigo-400 uppercase tracking-wider">{project.category}</span>
            <span aria-hidden="true">·</span>
            <span>{project.year}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditingProject(project);
                setSelectedProjectForDetail(null);
                setIsAddProjectModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'সম্পাদনা' : 'Edit'}</span>
            </button>
            <button
              onClick={() => setSelectedProjectForDetail(null)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Cover Media */}
          {project.coverImage ? (
            <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
              <img
                src={project.coverImage}
                alt={project.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950 border border-slate-800 flex flex-col items-center justify-center p-6 text-center">
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest mb-1">
                {project.category}
              </span>
              <h3 className="text-xl font-extrabold text-white">{project.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{project.client} · {project.year}</p>
            </div>
          )}

          {/* Title and Metadata Grid */}
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {project.title}
            </h2>
            <p className="text-base text-slate-300 leading-relaxed font-medium">
              {project.subtitle}
            </p>

            {/* Project Quick Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block mb-1">{language === 'bn' ? 'ক্লায়েন্ট' : 'Client'}</span>
                <span className="text-white font-medium flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-400" />
                  {project.client}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">{language === 'bn' ? 'ভূমিকা' : 'Role'}</span>
                <span className="text-white font-medium flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                  {project.role}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">{language === 'bn' ? 'বছর' : 'Timeline'}</span>
                <span className="text-white font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  {project.year}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">{language === 'bn' ? 'ক্যাটাগরি' : 'Category'}</span>
                <span className="text-white font-medium uppercase font-mono">
                  {project.category}
                </span>
              </div>
            </div>
          </div>

          {/* Comprehensive Narrative / Case Study Breakdown */}
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <div>
              <h3 className="text-base font-bold text-white mb-2">
                {language === 'bn' ? 'প্রকল্পের সারসংক্ষেপ' : 'Project Overview'}
              </h3>
              <p className="text-slate-300 leading-relaxed">
                {project.description}
              </p>
            </div>

            {project.problemStatement && (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <h4 className="text-sm font-semibold text-rose-300 mb-1">
                  {language === 'bn' ? '১. সমস্যা ও চ্যালেঞ্জ' : '1. Problem & Challenge'}
                </h4>
                <p className="text-slate-400 text-xs sm:text-sm">
                  {project.problemStatement}
                </p>
              </div>
            )}

            {project.solutionStatement && (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <h4 className="text-sm font-semibold text-sky-300 mb-1">
                  {language === 'bn' ? '২. প্রণীত সমাধান ও আর্কিটেকচার' : '2. Implemented Solution'}
                </h4>
                <p className="text-slate-400 text-xs sm:text-sm">
                  {project.solutionStatement}
                </p>
              </div>
            )}

            {project.resultsStatement && (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <h4 className="text-sm font-semibold text-emerald-300 mb-1">
                  {language === 'bn' ? '৩. ফলাফল ও অর্জন' : '3. Key Impact & Metrics'}
                </h4>
                <p className="text-slate-400 text-xs sm:text-sm">
                  {project.resultsStatement}
                </p>
              </div>
            )}

            {/* Technologies used */}
            <div>
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-400" />
                <span>{language === 'bn' ? 'ব্যবহৃত প্রযুক্তি ও টুলস' : 'Technologies & Stack'}</span>
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-md text-xs font-mono font-medium text-indigo-300 bg-indigo-950/40 border border-indigo-900/40"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{language === 'bn' ? 'লাইভ প্রকল্প ভিজিট করুন' : 'View Live Deployment'}</span>
                </a>
              )}
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>{language === 'bn' ? 'সোর্স কোড দেখুন' : 'Source Code'}</span>
                </a>
              )}
            </div>

            <button
              onClick={() => setSelectedProjectForDetail(null)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              {language === 'bn' ? 'বন্ধ করুন (ESC)' : 'Close (ESC)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
