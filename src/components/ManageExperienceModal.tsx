import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { ExperienceItem } from '../types/portfolio';
import { X, Plus, Trash2, Edit2 } from 'lucide-react';

export const ManageExperienceModal: React.FC = () => {
  const {
    isManageExperienceModalOpen,
    setIsManageExperienceModalOpen,
    experiences,
    addExperience,
    updateExperience,
    deleteExperience,
    language,
  } = usePortfolio();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [role, setRole] = useState('');
  const [roleEn, setRoleEn] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('ঢাকা / রিমোট');
  const [period, setPeriod] = useState('২০২৪ – বর্তমান');
  const [description, setDescription] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [highlightsInput, setHighlightsInput] = useState('');

  if (!isManageExperienceModalOpen) return null;

  const resetForm = () => {
    setRole('');
    setRoleEn('');
    setCompany('');
    setLocation('ঢাকা / রিমোট');
    setPeriod('২০২৪ – বর্তমান');
    setDescription('');
    setDescriptionEn('');
    setHighlightsInput('');
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleStartEdit = (exp: ExperienceItem) => {
    setEditingId(exp.id);
    setRole(exp.role);
    setRoleEn(exp.roleEn);
    setCompany(exp.company);
    setLocation(exp.location);
    setPeriod(exp.period);
    setDescription(exp.description);
    setDescriptionEn(exp.descriptionEn);
    setHighlightsInput(exp.highlights.join('\n'));
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim() || !company.trim()) return;

    const highlights = highlightsInput
      .split('\n')
      .map((h) => h.trim())
      .filter(Boolean);

    if (editingId) {
      await updateExperience(editingId, {
        role: role.trim(),
        roleEn: roleEn.trim() || role.trim(),
        company: company.trim(),
        location: location.trim(),
        period: period.trim(),
        description: description.trim(),
        descriptionEn: descriptionEn.trim() || description.trim(),
        highlights,
        highlightsEn: highlights,
      });
    } else {
      await addExperience({
        role: role.trim(),
        roleEn: roleEn.trim() || role.trim(),
        company: company.trim(),
        location: location.trim(),
        period: period.trim(),
        description: description.trim(),
        descriptionEn: descriptionEn.trim() || description.trim(),
        highlights,
        highlightsEn: highlights,
      });
    }
    resetForm();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      onClick={() => setIsManageExperienceModalOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div>
            <h3 className="text-base font-bold text-white">
              {language === 'bn' ? 'কাজের অভিজ্ঞতা পরিচালনা' : 'Manage Work Experience'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'bn'
                ? 'আপনার চাকরির পদবী, প্রতিষ্ঠান ও দায়িত্ব যোগ বা এডিট করুন।'
                : 'Add, update or remove work experience records.'}
            </p>
          </div>
          <button
            onClick={() => setIsManageExperienceModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {!showAddForm ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  {language === 'bn' ? `মোট অভিজ্ঞতা (${experiences.length})` : `Experiences (${experiences.length})`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowAddForm(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? '+ নতুন অভিজ্ঞতা' : '+ Add Experience'}</span>
                </button>
              </div>

              {experiences.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center border border-dashed border-slate-800 rounded-xl">
                  {language === 'bn' ? 'কোনো অভিজ্ঞতা যোগ করা নেই। উপরের বাটনে ক্লিক করে যোগ করুন।' : 'No experiences recorded. Add one above.'}
                </p>
              ) : (
                <div className="space-y-3">
                  {experiences.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-white">
                          {language === 'bn' ? exp.role : exp.roleEn}
                        </div>
                        <div className="text-xs text-indigo-400">
                          {exp.company} · {exp.period}
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                          {language === 'bn' ? exp.description : exp.descriptionEn}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(exp)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteExperience(exp.id)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Experience Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-indigo-400">
                  {editingId ? (language === 'bn' ? 'অভিজ্ঞতা সম্পাদনা' : 'Edit Experience') : (language === 'bn' ? 'নতুন অভিজ্ঞতা যোগ' : 'Add Experience')}
                </span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  {language === 'bn' ? 'বাতিল' : 'Back to list'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {language === 'bn' ? 'পদবী (বাংলা) *' : 'Job Role (Bengali) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="যেমন: সিনিয়র ওয়েব ডেভেলপার"
                    className="w-full p-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {language === 'bn' ? 'Job Role (English)' : 'Job Role (English)'}
                  </label>
                  <input
                    type="text"
                    value={roleEn}
                    onChange={(e) => setRoleEn(e.target.value)}
                    placeholder="e.g. Senior Web Developer"
                    className="w-full p-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {language === 'bn' ? 'কোম্পানি / প্রতিষ্ঠান *' : 'Company *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Company Name"
                    className="w-full p-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {language === 'bn' ? 'লোকেশন' : 'Location'}
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Dhaka / Remote"
                    className="w-full p-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {language === 'bn' ? 'সময়কাল' : 'Period'}
                  </label>
                  <input
                    type="text"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    placeholder="২০২৩ – বর্তমান"
                    className="w-full p-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'বিবরণ' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="আপনার কাজের মূল দায়িত্ব..."
                  className="w-full p-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'উল্লেখযোগ্য সাফল্য (প্রতি লাইনে ১টি)' : 'Key Highlights (1 per line)'}
                </label>
                <textarea
                  rows={3}
                  value={highlightsInput}
                  onChange={(e) => setHighlightsInput(e.target.value)}
                  placeholder={"সিস্টেম অপটিমাইজেশন\n১০+ সফল ক্লায়েন্ট প্রজেক্ট"}
                  className="w-full p-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg"
                >
                  {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            type="button"
            onClick={() => setIsManageExperienceModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {language === 'bn' ? 'সমাপ্ত' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
