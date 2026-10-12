import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { EducationItem } from '../types/portfolio';
import { X, Plus, Trash2, Edit2, GraduationCap } from 'lucide-react';

export const ManageEducationModal: React.FC = () => {
  const {
    isManageEducationModalOpen,
    setIsManageEducationModalOpen,
    education,
    addEducation,
    updateEducation,
    deleteEducation,
    language,
  } = usePortfolio();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [degree, setDegree] = useState('');
  const [degreeEn, setDegreeEn] = useState('');
  const [institution, setInstitution] = useState('');
  const [year, setYear] = useState('২০১৭ – ২০২১');
  const [details, setDetails] = useState('');

  if (!isManageEducationModalOpen) return null;

  const resetForm = () => {
    setDegree('');
    setDegreeEn('');
    setInstitution('');
    setYear('২০১৭ – ২০২১');
    setDetails('');
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleStartEdit = (edu: EducationItem) => {
    setEditingId(edu.id);
    setDegree(edu.degree);
    setDegreeEn(edu.degreeEn);
    setInstitution(edu.institution);
    setYear(edu.year);
    setDetails(edu.details);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!degree.trim() || !institution.trim()) return;

    if (editingId) {
      await updateEducation(editingId, {
        degree: degree.trim(),
        degreeEn: degreeEn.trim() || degree.trim(),
        institution: institution.trim(),
        year: year.trim(),
        details: details.trim(),
      });
    } else {
      await addEducation({
        degree: degree.trim(),
        degreeEn: degreeEn.trim() || degree.trim(),
        institution: institution.trim(),
        year: year.trim(),
        details: details.trim(),
      });
    }
    resetForm();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      onClick={() => setIsManageEducationModalOpen(false)}
    >
      <div
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>{language === 'bn' ? 'শিক্ষা ও ডিগ্রি পরিচালনা' : 'Manage Education'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'bn'
                ? 'আপনার শিক্ষাগত যোগ্যতা ও সার্টিফিকেশন যোগ বা এডিট করুন।'
                : 'Add, update or remove education and academic background.'}
            </p>
          </div>
          <button
            onClick={() => setIsManageEducationModalOpen(false)}
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
                  {language === 'bn' ? `মোট ডিগ্রি (${education.length})` : `Degrees (${education.length})`}
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
                  <span>{language === 'bn' ? '+ নতুন শিক্ষা যোগ' : '+ Add Education'}</span>
                </button>
              </div>

              {education.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center border border-dashed border-slate-800 rounded-xl">
                  {language === 'bn' ? 'কোনো শিক্ষা তথ্য নেই। উপরের বাটনে ক্লিক করে যোগ করুন।' : 'No education records found. Add one.'}
                </p>
              ) : (
                <div className="space-y-3">
                  {education.map((edu) => (
                    <div
                      key={edu.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="text-xs font-mono text-indigo-400">{edu.year}</div>
                        <div className="text-sm font-bold text-white">
                          {language === 'bn' ? edu.degree : edu.degreeEn}
                        </div>
                        <div className="text-xs text-slate-300">{edu.institution}</div>
                        {edu.details && (
                          <p className="text-xs text-slate-400 mt-1">{edu.details}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(edu)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteEducation(edu.id)}
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-indigo-400">
                  {editingId ? (language === 'bn' ? 'শিক্ষা সম্পাদনা' : 'Edit Education') : (language === 'bn' ? 'নতুন শিক্ষা যোগ' : 'Add Education')}
                </span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  {language === 'bn' ? 'বাতিল' : 'Back to list'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'ডিগ্রি বা সনদ (বাংলা) *' : 'Degree / Certificate (Bengali) *'}
                </label>
                <input
                  type="text"
                  required
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="যেমন: বি.এসসি ইন সিএসই"
                  className="w-full p-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'Degree (English)' : 'Degree (English)'}
                </label>
                <input
                  type="text"
                  value={degreeEn}
                  onChange={(e) => setDegreeEn(e.target.value)}
                  placeholder="e.g. B.Sc in CSE"
                  className="w-full p-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {language === 'bn' ? 'প্রতিষ্ঠান / বিশ্ববিদ্যালয় *' : 'Institution *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="University Name"
                    className="w-full p-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {language === 'bn' ? 'পাসের সাল / সময়কাল' : 'Year'}
                  </label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="২০১৮ – ২০২২"
                    className="w-full p-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {language === 'bn' ? 'অতিরিক্ত বিবরণ বা গ্রেড' : 'Details / Achievements'}
                </label>
                <textarea
                  rows={2}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="সফটওয়্যার ইঞ্জিনিয়ারিং, ফার্স্ট ক্লাস..."
                  className="w-full p-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white"
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
            onClick={() => setIsManageEducationModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {language === 'bn' ? 'সমাপ্ত' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
