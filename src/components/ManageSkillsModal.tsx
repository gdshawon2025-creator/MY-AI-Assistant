import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { X, Plus, Trash2, Edit2, Check, Sparkles } from 'lucide-react';

export const ManageSkillsModal: React.FC = () => {
  const {
    isManageSkillsModalOpen,
    setIsManageSkillsModalOpen,
    skills,
    addSkill,
    updateSkill,
    deleteSkill,
    addSkillCategory,
    deleteSkillCategory,
    language,
  } = usePortfolio();

  const [selectedCatIdx, setSelectedCatIdx] = useState(0);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(85);
  const [editingSkillIdx, setEditingSkillIdx] = useState<number | null>(null);
  const [editSkillName, setEditSkillName] = useState('');
  const [editSkillLevel, setEditSkillLevel] = useState(85);

  const [newCatBn, setNewCatBn] = useState('');
  const [newCatEn, setNewCatEn] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  if (!isManageSkillsModalOpen) return null;

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    await addSkill(selectedCatIdx, newSkillName.trim(), Number(newSkillLevel));
    setNewSkillName('');
    setNewSkillLevel(85);
  };

  const handleSaveEditSkill = async (skillIdx: number) => {
    if (!editSkillName.trim()) return;
    await updateSkill(selectedCatIdx, skillIdx, editSkillName.trim(), Number(editSkillLevel));
    setEditingSkillIdx(null);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatBn.trim()) return;
    await addSkillCategory(newCatBn.trim(), newCatEn.trim() || newCatBn.trim());
    setNewCatBn('');
    setNewCatEn('');
    setShowAddCat(false);
    setSelectedCatIdx(skills.length);
  };

  const currentCategory = skills[selectedCatIdx] || skills[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      onClick={() => setIsManageSkillsModalOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div>
            <h3 className="text-base font-bold text-white">
              {language === 'bn' ? 'দক্ষতা পরিচালনা করুন (Skills Manager)' : 'Manage Technical Skills'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'bn'
                ? 'আপনার দক্ষতা যোগ, এডিট ও পরিবর্তন করুন।'
                : 'Add, update or delete your core capabilities.'}
            </p>
          </div>
          <button
            onClick={() => setIsManageSkillsModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Categories Selector Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">
                {language === 'bn' ? 'ক্যাটাগরি নির্বাচন করুন' : 'Select Category'}
              </span>
              <button
                type="button"
                onClick={() => setShowAddCat(!showAddCat)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? '+ নতুন ক্যাটাগরি' : '+ New Category'}</span>
              </button>
            </div>

            {showAddCat && (
              <form onSubmit={handleAddCategory} className="p-3 mb-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder={language === 'bn' ? 'ক্যাটাগরির নাম (বাংলা)' : 'Category Name (Bengali)'}
                    value={newCatBn}
                    onChange={(e) => setNewCatBn(e.target.value)}
                    className="p-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                  <input
                    type="text"
                    placeholder={language === 'bn' ? 'Category Name (English)' : 'Category Name (English)'}
                    value={newCatEn}
                    onChange={(e) => setNewCatEn(e.target.value)}
                    className="p-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCat(false)}
                    className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 rounded-lg"
                  >
                    {language === 'bn' ? 'যোগ করুন' : 'Add Category'}
                  </button>
                </div>
              </form>
            )}

            <div className="flex flex-wrap gap-2">
              {skills.map((cat, idx) => (
                <button
                  key={cat.title}
                  type="button"
                  onClick={() => {
                    setSelectedCatIdx(idx);
                    setEditingSkillIdx(null);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                    selectedCatIdx === idx
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{language === 'bn' ? cat.title : cat.titleEn}</span>
                  {skills.length > 1 && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(language === 'bn' ? 'ক্যাটাগরিটি মুছে ফেলতে চান?' : 'Delete category?')) {
                          deleteSkillCategory(idx);
                          setSelectedCatIdx(0);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-400 ml-1 p-0.5"
                    >
                      ×
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Current Category Skills List */}
          {currentCategory && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-slate-300">
                  {language === 'bn' ? currentCategory.title : currentCategory.titleEn} ({currentCategory.skills.length})
                </h4>
              </div>

              {/* Existing Skills */}
              <div className="space-y-2">
                {currentCategory.skills.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">
                    {language === 'bn' ? 'এই ক্যাটাগরিতে কোনো দক্ষতা নেই। নিচে যোগ করুন।' : 'No skills in this category. Add below.'}
                  </p>
                ) : (
                  currentCategory.skills.map((skill, sIdx) => {
                    const isEditing = editingSkillIdx === sIdx;
                    return (
                      <div
                        key={sIdx}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        {isEditing ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={editSkillName}
                              onChange={(e) => setEditSkillName(e.target.value)}
                              className="flex-1 p-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs"
                            />
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={editSkillLevel}
                              onChange={(e) => setEditSkillLevel(Number(e.target.value))}
                              className="w-16 p-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs text-center"
                            />
                            <span>%</span>
                            <button
                              type="button"
                              onClick={() => handleSaveEditSkill(sIdx)}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingSkillIdx(null)}
                              className="p-1.5 text-slate-400 hover:text-white"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1 flex items-center justify-between pr-4">
                              <span className="font-medium text-slate-200">{skill.name}</span>
                              <span className="font-mono text-indigo-400 tabular-nums">{skill.level}%</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSkillIdx(sIdx);
                                  setEditSkillName(skill.name);
                                  setEditSkillLevel(skill.level);
                                }}
                                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteSkill(selectedCatIdx, sIdx)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add New Skill Input Row */}
              <form onSubmit={handleAddSkill} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-indigo-400 block">
                  {language === 'bn' ? '+ নতুন দক্ষতা যোগ করুন' : '+ Add New Skill to this category'}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder={language === 'bn' ? 'যেমন: React Native, Docker, Figma' : 'e.g. Next.js, Docker, UI'}
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs text-white bg-slate-900 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={newSkillLevel}
                      onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                      className="w-16 px-2 py-1.5 text-xs text-white bg-slate-900 border border-slate-800 rounded-lg text-center font-mono tabular-nums focus:border-indigo-500 focus:outline-none"
                    />
                    <span className="text-xs text-slate-500">%</span>
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap"
                  >
                    {language === 'bn' ? 'যোগ করুন' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            type="button"
            onClick={() => setIsManageSkillsModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {language === 'bn' ? 'সমাপ্ত' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
