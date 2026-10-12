import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Code2, Layers, Palette, Terminal, Plus, Edit2, Settings } from 'lucide-react';

export const SkillsSection: React.FC = () => {
  const { language, skills, setIsManageSkillsModalOpen, isOwner } = usePortfolio();

  const getCategoryIcon = (index: number) => {
    switch (index % 4) {
      case 0:
        return <Code2 className="w-4 h-4 text-indigo-400" />;
      case 1:
        return <Layers className="w-4 h-4 text-sky-400" />;
      case 2:
        return <Palette className="w-4 h-4 text-emerald-400" />;
      default:
        return <Terminal className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <section id="skills" className="py-16 mx-auto max-w-7xl px-6 border-t border-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
        <div>
          <div className="text-xs font-semibold tracking-wider text-indigo-400 uppercase mb-2">
            {language === 'bn' ? 'দক্ষতা ও কারিগরি দক্ষতা' : 'Expertise & Capabilities'}
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            {language === 'bn' ? 'ব্যবহৃত প্রযুক্তি ও দক্ষতা' : 'Technical Proficiency'}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
            {language === 'bn'
              ? 'ডিজিটাল প্রোডাক্ট তৈরি ও সমস্যা সমাধানে যেসব টুলস ও প্রযুক্তির ওপর আমার গভীর দখল রয়েছে।'
              : 'Core frameworks, systems, and design methodologies used to engineer modern experiences.'}
          </p>
        </div>

        {/* Manage Skills Button */}
        <button
          type="button"
          onClick={() => setIsManageSkillsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>{language === 'bn' ? 'দক্ষতা এডিট বা যোগ করুন' : 'Manage Skills'}</span>
        </button>
      </div>

      {skills.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 text-center">
          <p className="text-xs text-slate-400 mb-3">
            {language === 'bn' ? 'কোনো দক্ষতা তালিকাভুক্ত নেই।' : 'No skills currently added.'}
          </p>
          <button
            type="button"
            onClick={() => setIsManageSkillsModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg"
          >
            {language === 'bn' ? '+ দক্ষতা যোগ করুন' : '+ Add Skills'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skills.map((category, catIdx) => (
            <div
              key={category.title + catIdx}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(catIdx)}
                    <h3 className="text-sm font-bold text-white">
                      {language === 'bn' ? category.title : category.titleEn}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsManageSkillsModalOpen(true)}
                    title={language === 'bn' ? 'সম্পাদনা' : 'Edit'}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition-opacity"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-3.5">
                  {category.skills.map((skill, sIdx) => (
                    <div key={sIdx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-200 font-medium">{skill.name}</span>
                        <span className="text-slate-500 font-mono tabular-nums text-[11px]">
                          {skill.level}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full transition-all duration-700"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center justify-between">
                <span>
                  {category.skills.length} {language === 'bn' ? 'টি প্রযুক্তি' : 'Skills'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsManageSkillsModalOpen(true)}
                  className="text-indigo-400 hover:underline"
                >
                  {language === 'bn' ? '+ যোগ' : '+ Add'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
