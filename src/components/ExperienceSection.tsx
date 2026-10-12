import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Briefcase, GraduationCap, MapPin, Calendar, Edit2, Plus } from 'lucide-react';

export const ExperienceSection: React.FC = () => {
  const {
    language,
    experiences,
    education,
    setIsManageExperienceModalOpen,
    setIsManageEducationModalOpen,
  } = usePortfolio();

  return (
    <section id="experience" className="py-16 mx-auto max-w-7xl px-6 border-t border-slate-900">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left column: Work Experience */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-semibold tracking-wider text-indigo-400 uppercase mb-2">
                {language === 'bn' ? 'ক্যারিয়ার ও কর্মজীবন' : 'Career Track'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {language === 'bn' ? 'কাজের অভিজ্ঞতা ও দায়িত্ব' : 'Work Experience'}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {language === 'bn'
                  ? 'বিভিন্ন কোম্পানিতে গুরুত্বপূর্ণ ভূমিকা পালন ও সমস্যা সমাধানের অভিজ্ঞতা।'
                  : 'A chronicle of roles, team leadership, and high-impact digital initiatives.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsManageExperienceModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{language === 'bn' ? 'অভিজ্ঞতা পরিচালনা' : 'Manage Experience'}</span>
            </button>
          </div>

          {experiences.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 text-center">
              <p className="text-xs text-slate-400 mb-3">
                {language === 'bn' ? 'কোনো অভিজ্ঞতা যোগ করা নেই।' : 'No work experience added.'}
              </p>
              <button
                type="button"
                onClick={() => setIsManageExperienceModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg"
              >
                {language === 'bn' ? '+ অভিজ্ঞতা যোগ করুন' : '+ Add Experience'}
              </button>
            </div>
          ) : (
            <div className="space-y-6 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-px before:bg-slate-800">
              {experiences.map((exp) => (
                <div key={exp.id} className="relative pl-8 group">
                  <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-slate-900 border-2 border-indigo-500 group-hover:scale-125 transition-transform" />

                  <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <h3 className="text-base font-bold text-white">
                        {language === 'bn' ? exp.role : exp.roleEn}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{exp.period}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                      <span className="text-slate-200 font-medium">{exp.company}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {exp.location}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                      {language === 'bn' ? exp.description : exp.descriptionEn}
                    </p>

                    <ul className="space-y-1.5 text-xs text-slate-400">
                      {(language === 'bn' ? exp.highlights : exp.highlightsEn).map((h, hIdx) => (
                        <li key={hIdx} className="flex items-start gap-2">
                          <span className="text-indigo-400 mt-0.5">↳</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Education & Accolades */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold tracking-wider text-indigo-400 uppercase mb-1">
                {language === 'bn' ? 'শিক্ষাগত যোগ্যতা' : 'Academic Foundation'}
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
                <span>{language === 'bn' ? 'শিক্ষা ও ডিগ্রি' : 'Education'}</span>
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setIsManageEducationModalOpen(true)}
              className="p-1.5 text-xs text-indigo-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700"
              title={language === 'bn' ? 'শিক্ষা এডিট করুন' : 'Manage Education'}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {education.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 text-center">
                <p className="text-xs text-slate-400 mb-2">
                  {language === 'bn' ? 'কোনো শিক্ষা তথ্য নেই।' : 'No education records.'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsManageEducationModalOpen(true)}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  {language === 'bn' ? '+ শিক্ষা যোগ করুন' : '+ Add Education'}
                </button>
              </div>
            ) : (
              education.map((edu) => (
                <div
                  key={edu.id}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-indigo-400 font-mono">{edu.year}</div>
                    <button
                      type="button"
                      onClick={() => setIsManageEducationModalOpen(true)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white p-1"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">
                    {language === 'bn' ? edu.degree : edu.degreeEn}
                  </h4>
                  <p className="text-xs text-slate-300 font-medium">{edu.institution}</p>
                  {edu.details && (
                    <p className="text-xs text-slate-400 pt-1 leading-relaxed border-t border-slate-800/60">
                      {edu.details}
                    </p>
                  )}
                </div>
              ))
            )}

            {/* Quick Pitch Callout */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-900/80 border border-indigo-900/40 space-y-3">
              <h4 className="text-sm font-bold text-white">
                {language === 'bn' ? 'নতুন প্রজেক্টের আলোচনা' : 'Looking for Collaboration?'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'bn'
                  ? 'আপনার নতুন আইডিয়া বা বিদ্যমান পণ্যকে পরিপাটি রূপ দিতে আমি প্রস্তুত।'
                  : 'Available for full-stack engineering contracts and advisory.'}
              </p>
              <a
                href="#contact"
                className="inline-block text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
              >
                {language === 'bn' ? 'বার্তা পাঠান →' : 'Send an inquiry →'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
