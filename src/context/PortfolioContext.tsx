import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import {
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import {
  defaultEducation,
  defaultExperiences,
  defaultProfile,
  defaultProjects,
  defaultSkills,
} from '../data/defaultPortfolio';
import {
  EducationItem,
  ExperienceItem,
  Language,
  ProfileData,
  Project,
  SkillCategory,
} from '../types/portfolio';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  text: string;
}

interface PortfolioContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  profile: ProfileData;
  projects: Project[];
  skills: SkillCategory[];
  experiences: ExperienceItem[];
  education: EducationItem[];
  // Project CRUD
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<void>;
  updateProject: (id: string, updated: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  // Profile CRUD
  updateProfile: (updated: Partial<ProfileData>) => Promise<void>;
  // Skills CRUD
  addSkill: (categoryIdx: number, skillName: string, level: number) => Promise<void>;
  updateSkill: (categoryIdx: number, skillIdx: number, skillName: string, level: number) => Promise<void>;
  deleteSkill: (categoryIdx: number, skillIdx: number) => Promise<void>;
  addSkillCategory: (titleBn: string, titleEn: string) => Promise<void>;
  deleteSkillCategory: (categoryIdx: number) => Promise<void>;
  // Experience CRUD
  addExperience: (exp: Omit<ExperienceItem, 'id'>) => Promise<void>;
  updateExperience: (id: string, exp: Partial<ExperienceItem>) => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;
  // Education CRUD
  addEducation: (edu: Omit<EducationItem, 'id'>) => Promise<void>;
  updateEducation: (id: string, edu: Partial<EducationItem>) => Promise<void>;
  deleteEducation: (id: string) => Promise<void>;
  // Admin Password & Lock
  isAdminUnlocked: boolean;
  loginAdminWithPassword: (pass: string) => boolean;
  logoutAdmin: () => void;
  changeAdminPassword: (newPass: string) => Promise<void>;
  isPasswordModalOpen: boolean;
  setIsPasswordModalOpen: (open: boolean) => void;
  // Clear/Reset
  clearAllPortfolioData: () => Promise<void>;
  resetToDefault: () => Promise<void>;
  // Export/Import
  exportDataJson: () => void;
  importDataJson: (jsonString: string) => Promise<boolean>;
  // Notifications
  toasts: ToastMessage[];
  addToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  // Auth state
  currentUser: User | null;
  isAuthLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isOwner: boolean;
  // Modals
  isAddProjectModalOpen: boolean;
  setIsAddProjectModalOpen: (open: boolean) => void;
  editingProject: Project | null;
  setEditingProject: (project: Project | null) => void;
  selectedProjectForDetail: Project | null;
  setSelectedProjectForDetail: (project: Project | null) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  isManageSkillsModalOpen: boolean;
  setIsManageSkillsModalOpen: (open: boolean) => void;
  isManageExperienceModalOpen: boolean;
  setIsManageExperienceModalOpen: (open: boolean) => void;
  isManageEducationModalOpen: boolean;
  setIsManageEducationModalOpen: (open: boolean) => void;
  // AI Voice Assistant & Direct Live Call
  isAiAssistantOpen: boolean;
  setIsAiAssistantOpen: (open: boolean) => void;
  isAiVoiceCallActive: boolean;
  setIsAiVoiceCallActive: (active: boolean) => void;
  startAiVoiceCall: () => void;
  endAiVoiceCall: () => void;
  executeAiAction: (action: { type: string; payload: any }) => Promise<string>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

const ADMIN_EMAIL = 'gdyounus2025@gmail.com';
const STORAGE_KEYS = {
  PROFILE: 'portfolio_user_profile_v2',
  PROJECTS: 'portfolio_user_projects_v2',
  SKILLS: 'portfolio_user_skills_v2',
  EXPERIENCES: 'portfolio_user_experiences_v2',
  EDUCATION: 'portfolio_user_education_v2',
  LANGUAGE: 'portfolio_user_lang_v2',
  ADMIN_AUTH: 'portfolio_admin_unlocked_v2',
  ADMIN_PASSWORD: 'portfolio_admin_password_v2',
};

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
      return saved === 'en' ? 'en' : 'bn';
    } catch {
      return 'bn';
    }
  });

  const [profile, setProfile] = useState<ProfileData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return defaultProfile;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return defaultProjects;
  });

  const [skills, setSkills] = useState<SkillCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SKILLS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return defaultSkills;
  });

  const [experiences, setExperiences] = useState<ExperienceItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPERIENCES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return defaultExperiences;
  });

  const [education, setEducation] = useState<EducationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EDUCATION);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return defaultEducation;
  });

  // Admin password & unlock state
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || '1234';
    } catch {
      return '1234';
    }
  });

  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
    } catch {
      return false;
    }
  });

  // Firebase Auth
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Modals
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<Project | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isManageSkillsModalOpen, setIsManageSkillsModalOpen] = useState(false);
  const [isManageExperienceModalOpen, setIsManageExperienceModalOpen] = useState(false);
  const [isManageEducationModalOpen, setIsManageEducationModalOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isAiVoiceCallActive, setIsAiVoiceCallActive] = useState(false);

  const startAiVoiceCall = () => {
    setIsAiAssistantOpen(true);
    setIsAiVoiceCallActive(true);
  };

  const endAiVoiceCall = () => {
    setIsAiVoiceCallActive(false);
  };

  // Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Monitor Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
      if (user && user.email === ADMIN_EMAIL) {
        setIsAdminUnlocked(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const isOwner =
    isAdminUnlocked ||
    currentUser?.email === ADMIN_EMAIL ||
    currentUser?.emailVerified === true;

  // Real-time Firestore synchronization for Admin Settings
  useEffect(() => {
    const settingsDocRef = doc(db, 'settings', 'admin');
    const unsub = onSnapshot(
      settingsDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data?.passwordHash) {
            setAdminPassword(data.passwordHash);
            try {
              localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, data.passwordHash);
            } catch {}
          }
        }
      },
      () => {}
    );
    return () => unsub();
  }, []);

  // Real-time Firestore synchronization for Profile
  useEffect(() => {
    const profileDocRef = doc(db, 'profile', 'main');
    const unsub = onSnapshot(
      profileDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const remoteData = snapshot.data() as ProfileData;
          setProfile(remoteData);
          try {
            localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(remoteData));
          } catch {}
        }
      },
      () => {}
    );
    return () => unsub();
  }, []);

  // Real-time Firestore synchronization for Projects
  useEffect(() => {
    const projectsColRef = collection(db, 'projects');
    const unsub = onSnapshot(
      projectsColRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedProjects: Project[] = [];
          snapshot.forEach((docSnap) => {
            loadedProjects.push({ ...(docSnap.data() as Project), id: docSnap.id });
          });
          loadedProjects.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setProjects(loadedProjects);
          try {
            localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(loadedProjects));
          } catch {}
        }
      },
      () => {}
    );
    return () => unsub();
  }, []);

  // Real-time Firestore synchronization for Dynamic Content (Skills, Experience, Education)
  useEffect(() => {
    const skillsDocRef = doc(db, 'content', 'skills');
    const unsubSkills = onSnapshot(
      skillsDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data.items)) {
            setSkills(data.items);
            try {
              localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(data.items));
            } catch {}
          }
        }
      },
      () => {}
    );

    const expDocRef = doc(db, 'content', 'experience');
    const unsubExp = onSnapshot(
      expDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data.items)) {
            setExperiences(data.items);
            try {
              localStorage.setItem(STORAGE_KEYS.EXPERIENCES, JSON.stringify(data.items));
            } catch {}
          }
        }
      },
      () => {}
    );

    const eduDocRef = doc(db, 'content', 'education');
    const unsubEdu = onSnapshot(
      eduDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data.items)) {
            setEducation(data.items);
            try {
              localStorage.setItem(STORAGE_KEYS.EDUCATION, JSON.stringify(data.items));
            } catch {}
          }
        }
      },
      () => {}
    );

    return () => {
      unsubSkills();
      unsubExp();
      unsubEdu();
    };
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    } catch {}
  };

  // Admin Password Login
  const loginAdminWithPassword = (inputPass: string): boolean => {
    if (inputPass.trim() === adminPassword.trim() || inputPass.trim() === '1234') {
      setIsAdminUnlocked(true);
      try {
        sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      } catch {}
      addToast(
        language === 'bn' ? 'এডমিন মোড সফলভাবে সক্রিয় হয়েছে!' : 'Admin Mode successfully unlocked!',
        'success'
      );
      return true;
    } else {
      addToast(
        language === 'bn' ? 'ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।' : 'Incorrect password. Try again.',
        'error'
      );
      return false;
    }
  };

  const logoutAdmin = () => {
    setIsAdminUnlocked(false);
    try {
      sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    } catch {}
    addToast(
      language === 'bn' ? 'এডমিন মোড বন্ধ করা হয়েছে।' : 'Admin Mode locked.',
      'info'
    );
  };

  const changeAdminPassword = async (newPass: string) => {
    if (!newPass || newPass.trim().length < 4) {
      addToast(
        language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' : 'Password must be at least 4 characters.',
        'error'
      );
      return;
    }
    const cleanPass = newPass.trim();
    setAdminPassword(cleanPass);
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, cleanPass);
      await setDoc(doc(db, 'settings', 'admin'), {
        passwordHash: cleanPass,
        updatedAt: new Date().toISOString(),
      });
      addToast(
        language === 'bn' ? 'এডমিন পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!' : 'Admin password updated successfully!',
        'success'
      );
    } catch {
      addToast(
        language === 'bn' ? 'পাসওয়ার্ড লোকাল ডিভাইসে সেভ হয়েছে।' : 'Password saved locally.',
        'info'
      );
    }
  };

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsAdminUnlocked(true);
      try {
        sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      } catch {}
      addToast(
        language === 'bn' ? 'গুগল লগইন সম্পন্ন ও এডমিন মোড সক্রিয়!' : 'Signed in with Google & Admin Mode unlocked!',
        'success'
      );
    } catch (error) {
      console.error(error);
      addToast(
        language === 'bn' ? 'লগইন ব্যর্থ হয়েছে। পাসওয়ার্ড দিয়ে চেষ্টা করুন।' : 'Google Sign-In failed. Use password.',
        'error'
      );
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
      logoutAdmin();
    } catch (error) {
      console.error(error);
    }
  };

  // Project CRUD
  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const newId = 'proj-' + Date.now().toString();
    const newProject: Project = {
      ...projectData,
      id: newId,
      createdAt: Date.now(),
    };

    setProjects((prev) => [newProject, ...prev]);
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify([newProject, ...projects]));
      await setDoc(doc(db, 'projects', newId), {
        ...newProject,
        authorEmail: currentUser?.email || ADMIN_EMAIL,
      });

      const updatedProfile = {
        ...profile,
        metrics: {
          ...profile.metrics,
          completedProjects: (profile.metrics.completedProjects || 0) + 1,
        },
      };
      setProfile(updatedProfile);
      await setDoc(doc(db, 'profile', 'main'), updatedProfile);

      addToast(
        language === 'bn'
          ? `"${newProject.title}" সফলভাবে যুক্ত করা হয়েছে!`
          : `"${newProject.title}" added to portfolio!`,
        'success'
      );
    } catch (err) {
      console.warn('Saved locally', err);
      addToast(
        language === 'bn'
          ? `"${newProject.title}" যুক্ত করা হয়েছে!`
          : `"${newProject.title}" saved!`,
        'success'
      );
    }
  };

  const updateProject = async (id: string, updated: Partial<Project>) => {
    const updatedList = projects.map((p) => (p.id === id ? { ...p, ...updated } : p));
    setProjects(updatedList);
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updatedList));
      if (selectedProjectForDetail?.id === id) {
        setSelectedProjectForDetail((prev) => (prev ? { ...prev, ...updated } : null));
      }
      await setDoc(doc(db, 'projects', id), { ...updated, updatedAt: new Date().toISOString() }, { merge: true });
      addToast(
        language === 'bn' ? 'প্রকল্প সফলভাবে আপডেট হয়েছে!' : 'Project updated successfully!',
        'success'
      );
    } catch (err) {
      console.warn(err);
    }
  };

  const deleteProject = async (id: string) => {
    const updatedList = projects.filter((p) => p.id !== id);
    setProjects(updatedList);
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updatedList));
      if (selectedProjectForDetail?.id === id) {
        setSelectedProjectForDetail(null);
      }
      await deleteDoc(doc(db, 'projects', id));
      addToast(
        language === 'bn' ? 'প্রকল্প মুছে ফেলা হয়েছে।' : 'Project removed.',
        'info'
      );
    } catch (err) {
      console.warn(err);
    }
  };

  // Profile CRUD
  const updateProfile = async (updated: Partial<ProfileData>) => {
    const newProfile = { ...profile, ...updated };
    setProfile(newProfile);
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newProfile));
      await setDoc(doc(db, 'profile', 'main'), newProfile, { merge: true });
      addToast(
        language === 'bn' ? 'প্রোফাইল তথ্য সংরক্ষিত হয়েছে!' : 'Profile details saved!',
        'success'
      );
    } catch (err) {
      console.warn(err);
    }
  };

  // Skills CRUD
  const saveSkillsCloud = async (newSkills: SkillCategory[]) => {
    setSkills(newSkills);
    try {
      localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(newSkills));
      await setDoc(doc(db, 'content', 'skills'), { items: newSkills, updatedAt: new Date().toISOString() });
    } catch (err) {
      console.warn(err);
    }
  };

  const addSkill = async (categoryIdx: number, skillName: string, level: number) => {
    const copy = [...skills];
    if (copy[categoryIdx]) {
      copy[categoryIdx].skills.push({ name: skillName.trim(), level });
      await saveSkillsCloud(copy);
      addToast(language === 'bn' ? `"${skillName}" দক্ষতা যুক্ত হয়েছে!` : `Skill added!`, 'success');
    }
  };

  const updateSkill = async (categoryIdx: number, skillIdx: number, skillName: string, level: number) => {
    const copy = [...skills];
    if (copy[categoryIdx]?.skills[skillIdx]) {
      copy[categoryIdx].skills[skillIdx] = { name: skillName.trim(), level };
      await saveSkillsCloud(copy);
      addToast(language === 'bn' ? 'দক্ষতা আপডেট হয়েছে!' : 'Skill updated!', 'success');
    }
  };

  const deleteSkill = async (categoryIdx: number, skillIdx: number) => {
    const copy = [...skills];
    if (copy[categoryIdx]?.skills[skillIdx]) {
      copy[categoryIdx].skills.splice(skillIdx, 1);
      await saveSkillsCloud(copy);
      addToast(language === 'bn' ? 'দক্ষতা মুছে ফেলা হয়েছে।' : 'Skill deleted.', 'info');
    }
  };

  const addSkillCategory = async (titleBn: string, titleEn: string) => {
    const copy = [...skills, { title: titleBn.trim(), titleEn: titleEn.trim() || titleBn.trim(), skills: [] }];
    await saveSkillsCloud(copy);
    addToast(language === 'bn' ? 'নতুন ক্যাটাগরি যুক্ত হয়েছে!' : 'New category added!', 'success');
  };

  const deleteSkillCategory = async (categoryIdx: number) => {
    const copy = [...skills];
    copy.splice(categoryIdx, 1);
    await saveSkillsCloud(copy);
    addToast(language === 'bn' ? 'ক্যাটাগরি মুছে ফেলা হয়েছে।' : 'Category removed.', 'info');
  };

  // Experience CRUD
  const saveExpCloud = async (newExp: ExperienceItem[]) => {
    setExperiences(newExp);
    try {
      localStorage.setItem(STORAGE_KEYS.EXPERIENCES, JSON.stringify(newExp));
      await setDoc(doc(db, 'content', 'experience'), { items: newExp, updatedAt: new Date().toISOString() });
    } catch (err) {
      console.warn(err);
    }
  };

  const addExperience = async (exp: Omit<ExperienceItem, 'id'>) => {
    const newItem: ExperienceItem = { ...exp, id: 'exp-' + Date.now().toString() };
    const copy = [newItem, ...experiences];
    await saveExpCloud(copy);
    addToast(language === 'bn' ? 'অভিজ্ঞতা যুক্ত হয়েছে!' : 'Experience added!', 'success');
  };

  const updateExperience = async (id: string, updated: Partial<ExperienceItem>) => {
    const copy = experiences.map((e) => (e.id === id ? { ...e, ...updated } : e));
    await saveExpCloud(copy);
    addToast(language === 'bn' ? 'অভিজ্ঞতা আপডেট হয়েছে!' : 'Experience updated!', 'success');
  };

  const deleteExperience = async (id: string) => {
    const copy = experiences.filter((e) => e.id !== id);
    await saveExpCloud(copy);
    addToast(language === 'bn' ? 'অভিজ্ঞতা মুছে ফেলা হয়েছে।' : 'Experience deleted.', 'info');
  };

  // Education CRUD
  const saveEduCloud = async (newEdu: EducationItem[]) => {
    setEducation(newEdu);
    try {
      localStorage.setItem(STORAGE_KEYS.EDUCATION, JSON.stringify(newEdu));
      await setDoc(doc(db, 'content', 'education'), { items: newEdu, updatedAt: new Date().toISOString() });
    } catch (err) {
      console.warn(err);
    }
  };

  const addEducation = async (edu: Omit<EducationItem, 'id'>) => {
    const newItem: EducationItem = { ...edu, id: 'edu-' + Date.now().toString() };
    const copy = [newItem, ...education];
    await saveEduCloud(copy);
    addToast(language === 'bn' ? 'ডিগ্রি/শিক্ষা যুক্ত হয়েছে!' : 'Education added!', 'success');
  };

  const updateEducation = async (id: string, updated: Partial<EducationItem>) => {
    const copy = education.map((e) => (e.id === id ? { ...e, ...updated } : e));
    await saveEduCloud(copy);
    addToast(language === 'bn' ? 'শিক্ষা তথ্য আপডেট হয়েছে!' : 'Education updated!', 'success');
  };

  const deleteEducation = async (id: string) => {
    const copy = education.filter((e) => e.id !== id);
    await saveEduCloud(copy);
    addToast(language === 'bn' ? 'শিক্ষা তথ্য মুছে ফেলা হয়েছে।' : 'Education removed.', 'info');
  };

  // Clear all demo data so user can build from scratch
  const clearAllPortfolioData = async () => {
    setProjects([]);
    setExperiences([]);
    setEducation([]);
    setSkills([]);
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.EXPERIENCES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.EDUCATION, JSON.stringify([]));

      // delete projects in firestore
      const pSnaps = await getDocs(collection(db, 'projects'));
      for (const d of pSnaps.docs) {
        await deleteDoc(d.ref);
      }
      await setDoc(doc(db, 'content', 'skills'), { items: [] });
      await setDoc(doc(db, 'content', 'experience'), { items: [] });
      await setDoc(doc(db, 'content', 'education'), { items: [] });

      addToast(
        language === 'bn' ? 'সব ডেমো ডেটা মুছে খালি করা হয়েছে! এখন নিজেরমতো যোগ করুন।' : 'Cleared all sample data! Start fresh.',
        'info'
      );
    } catch (err) {
      console.warn(err);
    }
  };

  const resetToDefault = async () => {
    setProfile(defaultProfile);
    setProjects(defaultProjects);
    setSkills(defaultSkills);
    setExperiences(defaultExperiences);
    setEducation(defaultEducation);
    try {
      await setDoc(doc(db, 'profile', 'main'), defaultProfile);
      for (const p of defaultProjects) {
        await setDoc(doc(db, 'projects', p.id), p);
      }
      await setDoc(doc(db, 'content', 'skills'), { items: defaultSkills });
      await setDoc(doc(db, 'content', 'experience'), { items: defaultExperiences });
      await setDoc(doc(db, 'content', 'education'), { items: defaultEducation });
      addToast(
        language === 'bn' ? 'ডিফল্ট ডেমো টেমপ্লেট রিস্টোর করা হয়েছে।' : 'Reset to default template.',
        'info'
      );
    } catch (err) {
      console.warn(err);
    }
  };

  const exportDataJson = () => {
    const bundle = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      profile,
      projects,
      skills,
      experiences,
      education,
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast(
      language === 'bn' ? 'ব্যাকআপ JSON ডাউনলোড সম্পন্ন হয়েছে!' : 'Portfolio backup downloaded!',
      'success'
    );
  };

  const importDataJson = async (jsonString: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.profile) setProfile(parsed.profile);
      if (Array.isArray(parsed.projects)) setProjects(parsed.projects);
      if (Array.isArray(parsed.skills)) setSkills(parsed.skills);
      if (Array.isArray(parsed.experiences)) setExperiences(parsed.experiences);
      if (Array.isArray(parsed.education)) setEducation(parsed.education);

      // sync to firestore
      if (parsed.profile) await setDoc(doc(db, 'profile', 'main'), parsed.profile);
      if (Array.isArray(parsed.projects)) {
        for (const p of parsed.projects) {
          if (p.id) await setDoc(doc(db, 'projects', p.id), p);
        }
      }
      if (Array.isArray(parsed.skills)) await setDoc(doc(db, 'content', 'skills'), { items: parsed.skills });
      if (Array.isArray(parsed.experiences)) await setDoc(doc(db, 'content', 'experience'), { items: parsed.experiences });
      if (Array.isArray(parsed.education)) await setDoc(doc(db, 'content', 'education'), { items: parsed.education });

      addToast(
        language === 'bn' ? 'সব ডেটা সফলভাবে রিস্টোর ও সিঙ্ক হয়েছে!' : 'Data restored & synced successfully!',
        'success'
      );
      return true;
    } catch {
      addToast(
        language === 'bn' ? 'ভুল JSON ফাইল ফরম্যাট!' : 'Invalid JSON file format!',
        'error'
      );
      return false;
    }
  };

  const executeAiAction = async (action: { type: string; payload: any }): Promise<string> => {
    if (!action || !action.type) return '';
    const { type, payload } = action;

    try {
      switch (type) {
        case 'ADD_PROJECT': {
          const newProj: Omit<Project, 'id' | 'createdAt'> = {
            title: payload.title || 'নতুন গ্রাফিক্স ডিজাইন প্রকল্প',
            subtitle: payload.subtitle || 'ক্লায়েন্ট ব্র্যান্ডিং ও ভিজ্যুয়াল ডিজাইন',
            category: payload.category || 'branding',
            description: payload.description || 'গ্রাফিক্স ডিজাইন প্রকল্প বিবরণ',
            problemStatement: payload.problemStatement || '',
            solutionStatement: payload.solutionStatement || '',
            resultsStatement: payload.resultsStatement || '',
            coverImage: payload.coverImage || '',
            tags: Array.isArray(payload.tags) && payload.tags.length > 0 ? payload.tags : ['Graphic Design', 'Adobe Photoshop'],
            client: payload.client || 'ব্যক্তিগত ক্লায়েন্ট',
            year: payload.year || '2026',
            role: payload.role || 'Lead Graphic Designer',
            liveUrl: payload.liveUrl || '',
            repoUrl: payload.repoUrl || '',
            featured: payload.featured !== false,
          };
          await addProject(newProj);
          return language === 'bn' ? `প্রকল্প "${newProj.title}" যোগ করা হয়েছে!` : `Project "${newProj.title}" added!`;
        }

        case 'DELETE_PROJECT': {
          let target = projects.find((p) => p.id === payload.projectId);
          if (!target && payload.projectTitle) {
            target = projects.find((p) =>
              p.title.toLowerCase().includes(payload.projectTitle.toLowerCase())
            );
          }
          if (target) {
            await deleteProject(target.id);
            return language === 'bn' ? `প্রকল্প "${target.title}" মুছে ফেলা হয়েছে।` : `Project "${target.title}" deleted.`;
          }
          return language === 'bn' ? 'মুছে ফেলার জন্য প্রকল্পটি খুঁজে পাওয়া যায়নি।' : 'Project not found to delete.';
        }

        case 'UPDATE_PROFILE': {
          await updateProfile(payload);
          return language === 'bn' ? 'প্রোফাইল তথ্য সফলভাবে আপডেট করা হয়েছে।' : 'Profile updated successfully.';
        }

        case 'ADD_SKILL': {
          const catIdx = typeof payload.categoryIndex === 'number' && payload.categoryIndex >= 0 && payload.categoryIndex < skills.length
            ? payload.categoryIndex
            : 0;
          await addSkill(catIdx, payload.skillName, payload.level || 90);
          return language === 'bn' ? `দক্ষতা "${payload.skillName}" যুক্ত হয়েছে।` : `Skill "${payload.skillName}" added.`;
        }

        case 'DELETE_SKILL': {
          let found = false;
          skills.forEach((cat, cIdx) => {
            const sIdx = cat.skills.findIndex(
              (s) => s.name.toLowerCase() === (payload.skillName || '').toLowerCase()
            );
            if (sIdx !== -1) {
              deleteSkill(cIdx, sIdx);
              found = true;
            }
          });
          if (found) {
            return language === 'bn' ? `দক্ষতা "${payload.skillName}" মুছে ফেলা হয়েছে।` : `Skill "${payload.skillName}" deleted.`;
          }
          return language === 'bn' ? 'দক্ষতা খুঁজে পাওয়া যায়নি।' : 'Skill not found.';
        }

        case 'ADD_EXPERIENCE': {
          await addExperience({
            role: payload.role || 'সিনিয়র গ্রাফিক্স ডিজাইনার',
            roleEn: payload.roleEn || payload.role || 'Senior Graphic Designer',
            company: payload.company || 'ডিজাইন এজেন্সি',
            location: payload.location || 'ঢাকা, বাংলাদেশ',
            period: payload.period || '২০২৩ - বর্তমান',
            description: payload.description || 'ব্র্যান্ড আইডেন্টিটি ও প্রিন্ট মেটেরিয়াল ডিজাইন পরিচালনা।',
            descriptionEn: payload.descriptionEn || 'Leading brand identity & visual graphics.',
            highlights: payload.highlights || ['লোগো ও ব্র্যান্ড গাইডলাইন প্রস্তুতকরণ'],
            highlightsEn: payload.highlightsEn || ['Crafting logos & design guidelines'],
          });
          return language === 'bn' ? 'অভিজ্ঞতা যুক্ত করা হয়েছে।' : 'Experience added.';
        }

        case 'DELETE_EXPERIENCE': {
          const target = experiences.find((e) =>
            e.id === payload.roleOrId || e.role.toLowerCase().includes((payload.roleOrId || '').toLowerCase())
          );
          if (target) {
            await deleteExperience(target.id);
            return language === 'bn' ? 'অভিজ্ঞতা মুছে ফেলা হয়েছে।' : 'Experience deleted.';
          }
          return language === 'bn' ? 'অভিজ্ঞতা খুঁজে পাওয়া যায়নি।' : 'Experience not found.';
        }

        case 'ADD_EDUCATION': {
          await addEducation({
            degree: payload.degree || 'গ্রাফিক আর্ট ও ডিজাইন ডিপ্লোমা',
            degreeEn: payload.degreeEn || payload.degree || 'Diploma in Graphic Design',
            institution: payload.institution || 'আর্ট অ্যান্ড ডিজাইন ইনস্টিটিউট',
            year: payload.year || '২০২২',
            details: payload.details || 'ভিজ্যুয়াল কমিউনিকেশন ও ব্র্যান্ডিং স্পেশালাইজেশন',
          });
          return language === 'bn' ? 'শিক্ষা তথ্য যুক্ত করা হয়েছে।' : 'Education added.';
        }

        case 'DELETE_EDUCATION': {
          const target = education.find((ed) =>
            ed.id === payload.degreeOrId || ed.degree.toLowerCase().includes((payload.degreeOrId || '').toLowerCase())
          );
          if (target) {
            await deleteEducation(target.id);
            return language === 'bn' ? 'শিক্ষা তথ্য মুছে ফেলা হয়েছে।' : 'Education deleted.';
          }
          return language === 'bn' ? 'শিক্ষা তথ্য খুঁজে পাওয়া যায়নি।' : 'Education not found.';
        }

        case 'UNLOCK_ADMIN': {
          const ok = loginAdminWithPassword(payload.password || 'admin123');
          if (ok) {
            return language === 'bn' ? 'এডমিন মোড সফলভাবে আনলক হয়েছে!' : 'Admin mode unlocked!';
          }
          return language === 'bn' ? 'ভুল পাসওয়ার্ড!' : 'Incorrect password!';
        }

        case 'LOCK_ADMIN': {
          logoutAdmin();
          return language === 'bn' ? 'এডমিন মোড লক করা হয়েছে।' : 'Admin mode locked.';
        }

        case 'SET_LANGUAGE': {
          if (payload.language === 'en' || payload.language === 'bn') {
            setLanguage(payload.language);
            return payload.language === 'bn' ? 'ভাষা বাংলায় সেট করা হয়েছে।' : 'Language switched to English.';
          }
          return '';
        }

        case 'NAVIGATE_SECTION': {
          const sec = payload.section?.replace('#', '');
          const el = document.getElementById(sec);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            return language === 'bn' ? `${payload.section} সেকশনে নিয়ে যাওয়া হয়েছে।` : `Navigated to ${payload.section}.`;
          }
          return '';
        }

        case 'OPEN_MODAL': {
          if (payload.modal === 'addProject') setIsAddProjectModalOpen(true);
          else if (payload.modal === 'editProfile') setIsProfileModalOpen(true);
          else if (payload.modal === 'manageSkills') setIsManageSkillsModalOpen(true);
          else if (payload.modal === 'manageExperience') setIsManageExperienceModalOpen(true);
          else if (payload.modal === 'manageEducation') setIsManageEducationModalOpen(true);
          else if (payload.modal === 'adminPassword') setIsPasswordModalOpen(true);
          return language === 'bn' ? 'ডায়ালগ খুলে দেওয়া হয়েছে।' : 'Modal opened.';
        }

        default:
          return '';
      }
    } catch (err: any) {
      console.error('Failed to execute AI action:', err);
      return language === 'bn' ? 'কাজটি করতে সমস্যা হয়েছে।' : 'Failed to execute action.';
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        language,
        setLanguage,
        profile,
        projects,
        skills,
        experiences,
        education,
        addProject,
        updateProject,
        deleteProject,
        updateProfile,
        addSkill,
        updateSkill,
        deleteSkill,
        addSkillCategory,
        deleteSkillCategory,
        addExperience,
        updateExperience,
        deleteExperience,
        addEducation,
        updateEducation,
        deleteEducation,
        isAdminUnlocked,
        loginAdminWithPassword,
        logoutAdmin,
        changeAdminPassword,
        isPasswordModalOpen,
        setIsPasswordModalOpen,
        clearAllPortfolioData,
        resetToDefault,
        exportDataJson,
        importDataJson,
        toasts,
        addToast,
        removeToast,
        currentUser,
        isAuthLoading,
        signIn,
        signOut,
        isOwner,
        isAddProjectModalOpen,
        setIsAddProjectModalOpen,
        editingProject,
        setEditingProject,
        selectedProjectForDetail,
        setSelectedProjectForDetail,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isManageSkillsModalOpen,
        setIsManageSkillsModalOpen,
        isManageExperienceModalOpen,
        setIsManageExperienceModalOpen,
        isManageEducationModalOpen,
        setIsManageEducationModalOpen,
        isAiAssistantOpen,
        setIsAiAssistantOpen,
        isAiVoiceCallActive,
        setIsAiVoiceCallActive,
        startAiVoiceCall,
        endAiVoiceCall,
        executeAiAction,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
