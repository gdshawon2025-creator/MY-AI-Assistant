import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Project, ProjectCategory } from '../types/portfolio';
import { Search, ExternalLink, ArrowUpRight, Edit2, Trash2, Plus, Eye, ImageOff, Sparkles, Layers, Box, Share2, Printer, Feather } from 'lucide-react';

export const ProjectsGrid: React.FC = () => {
  const {
    language,
    projects,
    setSelectedProjectForDetail,
    setEditingProject,
    deleteProject,
    updateProject,
    setIsAddProjectModalOpen,
  } = usePortfolio();

  const [activeCategory, setActiveCategory] = useState<ProjectCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: { id: ProjectCategory; labelBn: string; labelEn: string }[] = [
    { id: 'all', labelBn: 'সবগুলো ডিজাইন', labelEn: 'All Designs' },
    { id: 'logo', labelBn: 'লোগো ডিজাইন', labelEn: 'Logo Design' },
    { id: 'branding', labelBn: 'ব্র্যান্ডিং ও গাইডলাইন', labelEn: 'Branding' },
    { id: 'social', labelBn: 'সোশ্যাল ব্যানার ও পোস্ট', labelEn: 'Social Media' },
    { id: 'packaging', labelBn: 'প্যাকেজিং ও লেবেল', labelEn: 'Packaging' },
    { id: 'print', labelBn: 'প্রিন্ট ও ব্রোশিওর', labelEn: 'Print & Editorial' },
  ];

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesCategory =
        activeCategory === 'all' || project.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        project.title.toLowerCase().includes(q) ||
        project.subtitle.toLowerCase().includes(q) ||
        project.client.toLowerCase().includes(q) ||
        project.tags.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [projects, activeCategory, searchQuery]);

  const handleDelete = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    const confirmText =
      language === 'bn'
        ? `আপনি কি নিশ্চিতভাবে "${title}" প্রজেক্টটি মুছে ফেলতে চান?`
        : `Are you sure you want to delete "${title}"?`;
    if (window.confirm(confirmText)) {
      deleteProject(id);
    }
  };

  const handleRemoveProjectImage = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    if (window.confirm(language === 'bn' ? 'এই প্রজেক্টটির ছবি মুছে ফেলতে চান?' : 'Remove image from this project?')) {
      await updateProject(project.id, { coverImage: '' });
    }
  };

  const handleEdit = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setEditingProject(project);
    setIsAddProjectModalOpen(true);
  };

  const renderGraphicVisual = (project: Project) => {
    if (project.coverImage) {
      return (
        <img
          src={project.coverImage}
          alt={project.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      );
    }

    // Creative visual placeholder based on Graphic Design category
    let icon = <Feather className="w-8 h-8 text-indigo-400" />;
    let bgGradient = 'from-slate-900 via-indigo-950/40 to-slate-950';

    if (project.category === 'logo') {
      icon = <Sparkles className="w-8 h-8 text-amber-400" />;
      bgGradient = 'from-slate-900 via-amber-950/40 to-slate-950';
    } else if (project.category === 'branding') {
      icon = <Layers className="w-8 h-8 text-sky-400" />;
      bgGradient = 'from-slate-900 via-sky-950/40 to-slate-950';
    } else if (project.category === 'social') {
      icon = <Share2 className="w-8 h-8 text-rose-400" />;
      bgGradient = 'from-slate-900 via-rose-950/40 to-slate-950';
    } else if (project.category === 'packaging') {
      icon = <Box className="w-8 h-8 text-emerald-400" />;
      bgGradient = 'from-slate-900 via-emerald-950/40 to-slate-950';
    } else if (project.category === 'print') {
      icon = <Printer className="w-8 h-8 text-purple-400" />;
      bgGradient = 'from-slate-900 via-purple-950/40 to-slate-950';
    }

    return (
      <div className={`w-full h-full bg-gradient-to-br ${bgGradient} flex flex-col items-center justify-center p-6 text-center border-b border-slate-800/80 relative`}>
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg mb-2 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">
          {project.category}
        </span>
        <span className="text-[11px] text-slate-400 max-w-[220px] truncate mt-0.5">
          {project.client}
        </span>
      </div>
    );
  };

  return (
    <section id="projects" className="py-16 mx-auto max-w-7xl px-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="text-xs font-semibold tracking-wider text-indigo-400 uppercase mb-2">
            {language === 'bn' ? 'ডিজাইন পোর্টফোলিও শোকেস' : 'Design Portfolio Showcase'}
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            {language === 'bn' ? 'নির্বাচিত গ্রাফিক্স ডিজাইন কাজসমূহ' : 'Curated Graphic Design Works'}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
            {language === 'bn'
              ? 'লোগো, ব্র্যান্ড আইডেন্টিটি, প্যাকেজিং, সোশ্যাল মিডিয়া ও প্রিন্ট মিডিয়ার জন্য তৈরি ডিজাইন সংকলন।'
              : 'End-to-end brand identity, packaging artworks, marketing visuals, and vector illustrations.'}
          </p>
        </div>

        {/* Add Project CTA */}
        <button
          onClick={() => {
            setEditingProject(null);
            setIsAddProjectModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all whitespace-nowrap self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? 'নতুন ডিজাইন যোগ করুন' : 'Add New Design'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-900">
        {/* Interactive Segmented Filter Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-xl overflow-x-auto">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {language === 'bn' ? cat.labelBn : cat.labelEn}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'bn' ? 'ডিজাইন বা ক্লায়েন্ট খুঁজুন...' : 'Search designs by client or tag...'
            }
            className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-200 bg-slate-900 border border-slate-800 rounded-lg placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/20">
          <p className="text-slate-400 text-sm">
            {language === 'bn'
              ? 'কোনো ডিজাইন প্রকল্প খুঁজে পাওয়া যায়নি।'
              : 'No designs match your criteria.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="text-xs text-indigo-400 hover:underline"
            >
              {language === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset filters'}
            </button>
            <span className="text-slate-700">·</span>
            <button
              onClick={() => {
                setEditingProject(null);
                setIsAddProjectModalOpen(true);
              }}
              className="text-xs font-semibold text-white bg-indigo-600 px-3 py-1 rounded-md"
            >
              {language === 'bn' ? '+ নতুন ডিজাইন যোগ' : '+ Add Design'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => {
            const isWideCard = index === 0;
            return (
              <div
                key={project.id}
                onClick={() => setSelectedProjectForDetail(project)}
                className={`group cursor-pointer rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                  isWideCard ? 'md:col-span-2' : 'col-span-1'
                }`}
              >
                <div>
                  {/* Visual container */}
                  <div
                    className={`relative overflow-hidden bg-slate-950 ${
                      isWideCard ? 'aspect-[16/9] md:aspect-[21/9]' : 'aspect-[16/10]'
                    }`}
                  >
                    {renderGraphicVisual(project)}

                    {project.coverImage && (
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />
                    )}

                    {/* Top overlay metadata & actions */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <div className="text-[11px] font-medium text-slate-300 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-800">
                        <span>{project.category.toUpperCase()}</span>
                        <span aria-hidden="true" className="mx-1.5 text-slate-500">·</span>
                        <span>{project.year}</span>
                      </div>

                      {/* Management buttons: Edit, Delete image, Delete project */}
                      <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                        {project.coverImage && (
                          <button
                            onClick={(e) => handleRemoveProjectImage(e, project)}
                            title={language === 'bn' ? 'ছবি মুছে ফেলুন' : 'Remove Image'}
                            className="p-1.5 rounded-md bg-slate-950/80 hover:bg-amber-600 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                          >
                            <ImageOff className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleEdit(e, project)}
                          title={language === 'bn' ? 'সম্পাদনা করুন' : 'Edit Design'}
                          className="p-1.5 rounded-md bg-slate-950/80 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, project.id, project.title)}
                          title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete Design'}
                          className="p-1.5 rounded-md bg-slate-950/80 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-3">
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="text-indigo-400 font-medium">{project.client}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span>{project.role}</span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center justify-between">
                        <span>{project.title}</span>
                        <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {project.subtitle}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="pt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400 font-mono">
                      {project.tags.slice(0, 4).map((tag, tIndex) => (
                        <React.Fragment key={tag}>
                          <span className="text-slate-300">#{tag}</span>
                          {tIndex < Math.min(project.tags.length - 1, 3) && (
                            <span aria-hidden="true" className="text-slate-600">/</span>
                          )}
                        </React.Fragment>
                      ))}
                      {project.tags.length > 4 && (
                        <span className="text-slate-500">+{project.tags.length - 4}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-5 pb-5 pt-2 border-t border-slate-800/50 flex items-center justify-between text-xs">
                  <span className="text-indigo-400 font-medium flex items-center gap-1 group-hover:underline">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'কেস স্টাডি ও বিবরণ' : 'Design Details'}</span>
                  </span>

                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-slate-400 hover:text-white flex items-center gap-1 hover:underline"
                    >
                      <span>{language === 'bn' ? 'বেহ্যান্স / লিংক' : 'Behance'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
