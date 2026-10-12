import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Project, ProjectCategory } from '../types/portfolio';
import { X, Upload, Check, ImageIcon } from 'lucide-react';

export const ProjectFormModal: React.FC = () => {
  const {
    isAddProjectModalOpen,
    setIsAddProjectModalOpen,
    editingProject,
    setEditingProject,
    addProject,
    updateProject,
    language,
  } = usePortfolio();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('branding');
  const [description, setDescription] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [solutionStatement, setSolutionStatement] = useState('');
  const [resultsStatement, setResultsStatement] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tagsInput, setTagsInput] = useState('Photoshop, Illustrator, Brand Identity');
  const [client, setClient] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [role, setRole] = useState('Lead Graphic Designer');
  const [liveUrl, setLiveUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [error, setError] = useState('');

  // Populate when editing
  useEffect(() => {
    if (editingProject) {
      setTitle(editingProject.title);
      setSubtitle(editingProject.subtitle);
      setCategory(editingProject.category);
      setDescription(editingProject.description);
      setProblemStatement(editingProject.problemStatement || '');
      setSolutionStatement(editingProject.solutionStatement || '');
      setResultsStatement(editingProject.resultsStatement || '');
      setCoverImage(editingProject.coverImage || '');
      setTagsInput(editingProject.tags.join(', '));
      setClient(editingProject.client);
      setYear(editingProject.year);
      setRole(editingProject.role);
      setLiveUrl(editingProject.liveUrl || '');
      setRepoUrl(editingProject.repoUrl || '');
      setFeatured(!!editingProject.featured);
    } else {
      setTitle('');
      setSubtitle('');
      setCategory('branding');
      setDescription('');
      setProblemStatement('');
      setSolutionStatement('');
      setResultsStatement('');
      setCoverImage('');
      setTagsInput('Photoshop, Illustrator, Brand Identity');
      setClient('');
      setYear(new Date().getFullYear().toString());
      setRole(language === 'bn' ? 'গ্রাফিক্স ডিজাইনার' : 'Graphic Designer');
      setLiveUrl('');
      setRepoUrl('');
      setFeatured(false);
    }
    setError('');
  }, [editingProject, isAddProjectModalOpen, language]);

  if (!isAddProjectModalOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setError(language === 'bn' ? 'ছবির সাইজ সর্বোচ্চ ৩ মেগাবাইট হতে হবে।' : 'Image size must be less than 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (typeof uploadEvent.target?.result === 'string') {
          setCoverImage(uploadEvent.target.result);
          setError('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(language === 'bn' ? 'প্রকল্পের শিরোনাম প্রদান করুন।' : 'Project title is required.');
      return;
    }
    if (!description.trim()) {
      setError(language === 'bn' ? 'প্রকল্পের বিবরণ প্রদান করুন।' : 'Project description is required.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const validCategory = (category === 'all' ? 'branding' : category) as Exclude<ProjectCategory, 'all'>;

    if (editingProject) {
      updateProject(editingProject.id, {
        title: title.trim(),
        subtitle: subtitle.trim() || title.trim(),
        category: validCategory,
        description: description.trim(),
        problemStatement: problemStatement.trim() || undefined,
        solutionStatement: solutionStatement.trim() || undefined,
        resultsStatement: resultsStatement.trim() || undefined,
        coverImage: coverImage.trim(),
        tags: tags.length ? tags : ['Graphic Design', 'Branding'],
        client: client.trim() || 'Client Project',
        year: year.trim() || new Date().getFullYear().toString(),
        role: role.trim() || 'Designer',
        liveUrl: liveUrl.trim() || undefined,
        repoUrl: repoUrl.trim() || undefined,
        featured,
      });
    } else {
      addProject({
        title: title.trim(),
        subtitle: subtitle.trim() || title.trim(),
        category: validCategory,
        description: description.trim(),
        problemStatement: problemStatement.trim() || undefined,
        solutionStatement: solutionStatement.trim() || undefined,
        resultsStatement: resultsStatement.trim() || undefined,
        coverImage: coverImage.trim(),
        tags: tags.length ? tags : ['Graphic Design', 'Branding'],
        client: client.trim() || 'Client Project',
        year: year.trim() || new Date().getFullYear().toString(),
        role: role.trim() || 'Designer',
        liveUrl: liveUrl.trim() || undefined,
        repoUrl: repoUrl.trim() || undefined,
        featured,
      });
    }

    setIsAddProjectModalOpen(false);
    setEditingProject(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      onClick={() => {
        setIsAddProjectModalOpen(false);
        setEditingProject(null);
      }}
    >
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div>
            <h3 className="text-lg font-bold text-white">
              {editingProject
                ? language === 'bn'
                  ? 'প্রকল্প সম্পাদনা করুন'
                  : 'Edit Portfolio Project'
                : language === 'bn'
                ? 'নতুন প্রকল্প যুক্ত করুন'
                : 'Add Project to Portfolio'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'bn'
                ? 'আপনার কাজগুলো সংরক্ষণ করুন এবং দর্শকদের সামনে সুন্দরভাবে তুলে ধরুন।'
                : 'Keep your work organized, documented, and showcased.'}
            </p>
          </div>
          <button
            onClick={() => {
              setIsAddProjectModalOpen(false);
              setEditingProject(null);
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-900/60 rounded-lg">
              {error}
            </div>
          )}

          {/* Title & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'প্রকল্পের শিরোনাম *' : 'Project Title *'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={language === 'bn' ? 'যেমন: স্মার্ট ইনভেন্টরি ম্যানেজমেন্ট' : 'e.g. Smart Inventory'}
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'সংক্ষিপ্ত ট্যাগলাইন / সাবটাইটেল' : 'One-line Subtitle'}
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder={language === 'bn' ? 'যেমন: রিয়েল-টাইম স্টক ট্র্যাকিং সিস্টেম' : 'e.g. Real-time stock tracking'}
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Category, Client, Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'ক্যাটাগরি' : 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
              >
                <option value="logo">{language === 'bn' ? 'লোগো ডিজাইন' : 'Logo Design'}</option>
                <option value="branding">{language === 'bn' ? 'ব্র্যান্ড আইডেন্টিটি' : 'Brand Identity'}</option>
                <option value="social">{language === 'bn' ? 'সোশ্যাল মিডিয়া ব্যানার' : 'Social Media'}</option>
                <option value="packaging">{language === 'bn' ? 'প্যাকেজিং ও লেবেল' : 'Packaging & Label'}</option>
                <option value="print">{language === 'bn' ? 'প্রিন্ট ও ব্রোশিওর' : 'Print & Brochure'}</option>
                <option value="other">{language === 'bn' ? 'অন্যান্য ডিজাইন' : 'Other Design'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'ক্লায়েন্ট বা প্রতিষ্ঠান' : 'Client / Company'}
              </label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder={language === 'bn' ? 'যেমন: প্রাইভেট ক্লায়েন্ট / সেলফ' : 'e.g. Self / Freelance'}
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'বছর / সময়কাল' : 'Year'}
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2026"
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Role & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'আপনার ভূমিকা' : 'Your Role'}
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder={language === 'bn' ? 'যেমন: ফুল-স্ট্যাক ডেভেলপার' : 'Full-Stack Developer'}
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'ব্যবহৃত প্রযুক্তি / ট্যাগসমূহ (কমা দিয়ে আলাদা করুন)' : 'Tags (comma-separated)'}
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="React, TypeScript, Tailwind, Node.js"
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'লাইভ প্রিভিউ লিঙ্ক (ঐচ্ছিক)' : 'Live Demo URL (optional)'}
              </label>
              <input
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'গিটহাব / কোড রিপোজিটরি (ঐচ্ছিক)' : 'GitHub Repo URL (optional)'}
              </label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Image Selection / Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {language === 'bn' ? 'কভার ছবি (ছবি আপলোড করুন বা লিংক দিন)' : 'Cover Image (Upload or URL)'}
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <label className="flex-1 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950 cursor-pointer transition-colors text-xs text-slate-300">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>{language === 'bn' ? 'ডিভাইস থেকে ছবি আপলোড' : 'Upload Image from Device'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {coverImage && (
                <button
                  type="button"
                  onClick={() => setCoverImage('')}
                  className="px-3 py-2 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/20 border border-rose-900/40 rounded-lg"
                >
                  {language === 'bn' ? 'ছবি রিমুভ করুন' : 'Remove Image'}
                </button>
              )}
            </div>

            {/* Custom URL Input */}
            <div className="mt-2.5">
              <input
                type="text"
                value={coverImage.startsWith('data:') ? '(Uploaded Image file)' : coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder={language === 'bn' ? 'অথবা সরাসরি ইমেজ URL দিন...' : 'Or enter custom image URL...'}
                className="w-full px-3 py-1.5 text-xs text-slate-200 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {coverImage && (
              <div className="mt-2 w-28 h-16 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                <img src={coverImage} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {language === 'bn' ? 'প্রকল্পের বিবরণ *' : 'Project Description *'}
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={language === 'bn' ? 'এই প্রকল্পটি কী কাজ করে এবং কীভাবে তৈরি করা হয়েছে...' : 'Describe what this project does and your approach...'}
              className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Case Study Details */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block">
              {language === 'bn' ? 'কেস স্টাডি বিবরণ (ঐচ্ছিক)' : 'Optional Case Study Breakdown'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  {language === 'bn' ? '১. সমস্যা' : '1. Problem'}
                </label>
                <textarea
                  rows={2}
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder={language === 'bn' ? 'ক্লায়েন্টের মূল সমস্যা বা চ্যালেঞ্জ...' : 'Challenge faced...'}
                  className="w-full p-2.5 text-xs text-slate-200 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  {language === 'bn' ? '২. প্রণীত সমাধান' : '2. Solution'}
                </label>
                <textarea
                  rows={2}
                  value={solutionStatement}
                  onChange={(e) => setSolutionStatement(e.target.value)}
                  placeholder={language === 'bn' ? 'কীভাবে সমস্যাটির সমাধান করলেন...' : 'How you solved it...'}
                  className="w-full p-2.5 text-xs text-slate-200 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  {language === 'bn' ? '৩. অর্জন ও ফলাফল' : '3. Outcome'}
                </label>
                <textarea
                  rows={2}
                  value={resultsStatement}
                  onChange={(e) => setResultsStatement(e.target.value)}
                  placeholder={language === 'bn' ? 'ব্যবহারকারীর বৃদ্ধি বা সুফল...' : 'Measurable impact...'}
                  className="w-full p-2.5 text-xs text-slate-200 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsAddProjectModalOpen(false);
                setEditingProject(null);
              }}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
            >
              {editingProject
                ? language === 'bn'
                  ? 'পরিবর্তন সংরক্ষণ করুন'
                  : 'Save Changes'
                : language === 'bn'
                ? 'পোর্টফোলিওতে যোগ করুন'
                : 'Add to Portfolio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
