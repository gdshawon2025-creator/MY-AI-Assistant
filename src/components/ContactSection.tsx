import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Mail, MapPin, Send, MessageSquare, CheckCircle2, Palette } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export const ContactSection: React.FC = () => {
  const { language, profile, addToast } = usePortfolio();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [projectType, setProjectType] = useState('branding');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setLoading(true);
    const msgId = 'msg-' + Date.now().toString();
    try {
      await setDoc(doc(db, 'contact_messages', msgId), {
        name: name.trim(),
        email: email.trim(),
        projectType,
        message: message.trim(),
        createdAt: new Date().toISOString(),
      });
      setLoading(false);
      setSubmitted(true);
      addToast(
        language === 'bn'
          ? 'ধন্যবাদ! আপনার ডিজাইন সংক্রান্ত বার্তাটি সংরক্ষিত ও পাঠানো হয়েছে।'
          : 'Thank you! Your design inquiry has been sent.',
        'success'
      );
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setLoading(false);
      handleFirestoreError(err, OperationType.CREATE, `contact_messages/${msgId}`);
    }
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(
      language === 'bn'
        ? `হ্যালো ${profile.name}, আমি আপনার গ্রাফিক্স ডিজাইন পোর্টফোলিও দেখেছি এবং একটি প্রজেক্টের ডিজাইন নিয়ে আলোচনা করতে চাই।`
        : `Hello ${profile.nameEn}, I saw your graphic design portfolio and want to discuss a project.`
    );
    const raw = (profile.whatsapp || '01804459691').replace(/[^0-9]/g, '');
    const num = raw.startsWith('88') ? raw : `88${raw}`;
    window.open(`https://wa.me/${num}?text=${text}`, '_blank');
  };

  return (
    <section id="contact" className="py-16 mx-auto max-w-7xl px-6 border-t border-slate-900">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Contact Information & Channels */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="text-xs font-semibold tracking-wider text-indigo-400 uppercase mb-2">
              {language === 'bn' ? 'ডিজাইন অর্ডার ও যোগাযোগ' : 'Design Inquiries'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {language === 'bn' ? 'আপনার ব্র্যান্ডের ডিজাইন শুরু করুন' : "Let's Elevate Your Brand"}
            </h2>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              {language === 'bn'
                ? 'লোগো ডিজাইন, ব্র্যান্ডিং, সোশ্যাল মিডিয়া ব্যানার বা প্রিন্ট প্যাকেজিংয়ের যেকোনো কাজের জন্য সরাসরি হোয়াটসঅ্যাপে বা ফর্মে মেসেজ পাঠান।'
                : 'Looking for a distinctive logo, eye-catching social creatives, or packaging design? Get in touch directly.'}
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {/* Direct WhatsApp Callout */}
            <div
              onClick={openWhatsApp}
              className="cursor-pointer flex items-center gap-3 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80 hover:bg-emerald-900/40 transition-colors group"
            >
              <div className="p-2.5 rounded-lg bg-emerald-900/60 text-emerald-400 border border-emerald-800">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-[11px] text-emerald-300 block font-medium">WhatsApp (তাৎক্ষণিক যোগাযোগ)</span>
                <span className="text-base text-white font-bold tracking-wider font-mono">
                  {profile.whatsapp || '01804459691'}
                </span>
              </div>
              <span className="text-xs text-emerald-400 font-semibold px-2.5 py-1 rounded-md bg-emerald-900/80">
                {language === 'bn' ? 'চ্যাট করুন →' : 'Chat →'}
              </span>
            </div>

            <a
              href={`mailto:${profile.email}`}
              className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors group"
            >
              <div className="p-2.5 rounded-lg bg-indigo-950/60 text-indigo-400 border border-indigo-900/60">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">{language === 'bn' ? 'সরাসরি ইমেইল' : 'Direct Email'}</span>
                <span className="text-sm text-slate-200 group-hover:text-indigo-400 transition-colors font-medium">
                  {profile.email}
                </span>
              </div>
            </a>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="p-2.5 rounded-lg bg-slate-800 text-slate-300">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">{language === 'bn' ? 'বর্তমান অবস্থান' : 'Location'}</span>
                <span className="text-sm text-slate-200 font-medium">{profile.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Contact Form */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-xl">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="inline-flex p-3 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-900/60">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {language === 'bn' ? 'বার্তাটি সফলভাবে পৌঁছেছে!' : 'Message Sent Successfully!'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                  {language === 'bn'
                    ? 'আপনার আগ্রহের জন্য ধন্যবাদ। আপনার দেওয়া ইমেইল অথবা হোয়াটসঅ্যাপে খুব শীঘ্রই যোগাযোগ করা হবে।'
                    : 'Thank you for reaching out. I will review your requirements and respond promptly.'}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-xs text-indigo-400 hover:underline"
                >
                  {language === 'bn' ? 'আরেকটি বার্তা পাঠান' : 'Send another inquiry'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {language === 'bn' ? 'আপনার নাম *' : 'Your Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={language === 'bn' ? 'যেমন: তানভীর হাসান' : 'e.g. John Doe'}
                      className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {language === 'bn' ? 'ইমেইল বা ফোন *' : 'Email or Phone *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com / 01..."
                      className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {language === 'bn' ? 'কোন ধরনের ডিজাইন প্রয়োজন?' : 'Design Service Needed'}
                  </label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="branding">{language === 'bn' ? 'লোগো ও ব্র্যান্ড আইডেন্টিটি ডিজাইন' : 'Logo & Brand Identity'}</option>
                    <option value="social">{language === 'bn' ? 'সোশ্যাল মিডিয়া ব্যানার ও অ্যাড ক্রিয়েটিভস' : 'Social Media & Ad Creatives'}</option>
                    <option value="packaging">{language === 'bn' ? 'প্রোডাক্ট প্যাকেজিং ও লেবেল ডিজাইন' : 'Packaging & Label Design'}</option>
                    <option value="print">{language === 'bn' ? 'প্রিন্ট ব্রোশিওর, ফ্লায়ার ও ক্যাটালগ' : 'Print Brochure & Catalog'}</option>
                    <option value="other">{language === 'bn' ? 'অন্যান্য গ্রাফিক্স ডিজাইন' : 'Other Graphic Design'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {language === 'bn' ? 'প্রজেক্টের বিবরণ বা প্রয়োজনীয়তা *' : 'Project Requirements *'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      language === 'bn'
                        ? 'আপনার ব্র্যান্ডের নাম, ডিজাইনের আইডিয়া ও পছন্দনীয় কালার বা স্টাইল সম্পর্কে লিখুন...'
                        : 'Tell me about your brand, design references, style preferences, and deadline...'
                    }
                    className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] rounded-lg shadow-sm transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {loading
                      ? language === 'bn'
                        ? 'পাঠানো হচ্ছে...'
                        : 'Sending...'
                      : language === 'bn'
                      ? 'ডিজাইন রিকুয়েস্ট পাঠান'
                      : 'Send Request'}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
