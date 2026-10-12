import React, { useState, useEffect, useRef } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  Mic,
  MicOff,
  Sparkles,
  Send,
  X,
  Volume2,
  VolumeX,
  Bot,
  User,
  RotateCcw,
  CheckCircle,
  Zap,
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  Phone,
  PhoneOff,
  PhoneCall,
  Radio,
  Clock,
  Infinity as InfinityIcon,
  MessageSquare,
  ChevronRight,
  Globe,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  actionSummary?: string;
  timestamp: string;
}

export const AiAssistantModal: React.FC = () => {
  const {
    isAiAssistantOpen,
    setIsAiAssistantOpen,
    isAiVoiceCallActive,
    setIsAiVoiceCallActive,
    language,
    profile,
    projects,
    skills,
    isAdminUnlocked,
    loginAdminWithPassword,
    logoutAdmin,
    signIn,
    executeAiAction,
  } = usePortfolio();

  // Mode: 'call' (Direct Live Continuous Voice Call) or 'chat' (Standard Text/Voice Commands)
  const [activeTab, setActiveTab] = useState<'call' | 'chat'>('call');

  // Authentication State within Modal
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [authError, setAuthError] = useState('');

  // Call Specific States
  const [isCallConnected, setIsCallConnected] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallMuted, setIsCallMuted] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [liveUserTranscript, setLiveUserTranscript] = useState('');
  const [latestAiReply, setLatestAiReply] = useState('');
  const [latestActionResult, setLatestActionResult] = useState<string | null>(null);

  // General Voice & Chat States
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState<'bn-BD' | 'en-US'>('bn-BD');
  const [isSpeakingResponse, setIsSpeakingResponse] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      text:
        language === 'bn'
          ? `স্বাগতম ইউনুস ভাই! আমি আপনার ব্যক্তিগত AI ভয়েস অ্যাসিস্ট্যান্ট। আপনি সরাসরি "লাইভ ভয়েস কল" শুরু করতে পারেন—কোনো লিমিট ছাড়া যত সময় ইচ্ছা আমার সাথে সরাসরি কথা বলুন, ডিজাইন আইডিয়া নিন বা পোর্টফোলিও পরিচালনা করুন।`
          : `Welcome Younus! I am your personal AI Assistant. Start a "Live Voice Call" to talk directly hands-free with unlimited duration, brainstorm design ideas, or control your portfolio.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const callTimerRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const isSpeakingRef = useRef(false);
  const isCallConnectedRef = useRef(false);
  const isCallMutedRef = useRef(false);
  const latestTranscriptRef = useRef('');
  const [micNotice, setMicNotice] = useState<string | null>(null);

  // Stop any currently playing audio or speech synthesis
  const stopSpeaking = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {
        // ignore
      }
      audioRef.current = null;
    }
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    setIsSpeakingResponse(false);
  };

  // Browser SpeechSynthesis fallback
  const fallbackSpeechSynthesis = (text: string, onFinish?: () => void) => {
    if (!ttsEnabled || !window.speechSynthesis) {
      setIsSpeakingResponse(false);
      if (onFinish) onFinish();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const cleanText = text
        .replace(/[*#_~`]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const isBn = speechLanguage === 'bn-BD';
      utterance.lang = isBn ? 'bn-BD' : 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select matching voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        if (isBn) {
          const bnVoice = voices.find(
            (v) =>
              v.lang.toLowerCase().includes('bn') ||
              v.name.toLowerCase().includes('bengali') ||
              v.name.toLowerCase().includes('bangla')
          );
          if (bnVoice) utterance.voice = bnVoice;
        } else {
          const enVoice = voices.find(
            (v) => v.lang.toLowerCase().includes('en-us') || v.lang.toLowerCase().includes('en')
          );
          if (enVoice) utterance.voice = enVoice;
        }
      }

      utterance.onstart = () => {
        setIsSpeakingResponse(true);
        if (isCallConnectedRef.current) {
          setCallStatus('speaking');
        }
      };

      utterance.onend = () => {
        setIsSpeakingResponse(false);
        if (onFinish) onFinish();
      };

      utterance.onerror = (e) => {
        console.warn('TTS fallback error:', e);
        setIsSpeakingResponse(false);
        if (onFinish) onFinish();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS fallback exception:', e);
      setIsSpeakingResponse(false);
      if (onFinish) onFinish();
    }
  };

  // High-fidelity voice player: Plays natural human voice audio generated by Gemini TTS with SpeechSynthesis fallback
  const speakVoiceResponse = async (
    text: string,
    base64Audio?: string | null,
    onFinish?: () => void
  ) => {
    if (!ttsEnabled) {
      if (onFinish) onFinish();
      return;
    }

    stopSpeaking();

    // 1. If base64Audio is already provided from the server
    if (base64Audio) {
      try {
        const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
        audioRef.current = audio;

        audio.onplay = () => {
          setIsSpeakingResponse(true);
          if (isCallConnectedRef.current) {
            setCallStatus('speaking');
          }
        };

        audio.onended = () => {
          setIsSpeakingResponse(false);
          audioRef.current = null;
          if (onFinish) onFinish();
        };

        audio.onerror = (err) => {
          console.warn('Audio playback element error, using browser TTS fallback:', err);
          audioRef.current = null;
          fallbackSpeechSynthesis(text, onFinish);
        };

        await audio.play();
        return;
      } catch (playErr) {
        console.warn('Audio.play() failed, trying browser TTS fallback:', playErr);
        audioRef.current = null;
        fallbackSpeechSynthesis(text, onFinish);
        return;
      }
    }

    // 2. If base64Audio was not provided, request real-time speech from /api/ai-tts
    try {
      setIsSpeakingResponse(true);
      if (isCallConnectedRef.current) {
        setCallStatus('speaking');
      }

      const res = await fetch('/api/ai-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.audioData) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioData}`);
          audioRef.current = audio;

          audio.onended = () => {
            setIsSpeakingResponse(false);
            audioRef.current = null;
            if (onFinish) onFinish();
          };

          audio.onerror = () => {
            audioRef.current = null;
            fallbackSpeechSynthesis(text, onFinish);
          };

          await audio.play();
          return;
        }
      }

      fallbackSpeechSynthesis(text, onFinish);
    } catch {
      fallbackSpeechSynthesis(text, onFinish);
    }
  };

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLanguage;

      recognition.onstart = () => {
        setIsListening(true);
        if (isCallConnectedRef.current && !isSpeakingRef.current) {
          setCallStatus('listening');
        }
      };

      recognition.onresult = (event: any) => {
        // If muted or AI is speaking, ignore input
        if (isCallMutedRef.current || isSpeakingRef.current) return;

        let interim = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const currentSpoken = (finalTranscript || interim).trim();
        if (currentSpoken) {
          latestTranscriptRef.current = currentSpoken;
          setLiveUserTranscript(currentSpoken);
          setInputMessage(currentSpoken);

          // In Live Call Mode: Voice Activity Detection (silence detection)
          if (isCallConnectedRef.current) {
            setCallStatus('listening');
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

            // If user stops speaking for 1.3 seconds, automatically submit hands-free!
            silenceTimerRef.current = setTimeout(() => {
              if (
                isCallConnectedRef.current &&
                !isSpeakingRef.current &&
                latestTranscriptRef.current.trim()
              ) {
                const messageToProcess = latestTranscriptRef.current.trim();
                latestTranscriptRef.current = '';
                setLiveUserTranscript('');
                processVoiceCallMessage(messageToProcess);
              }
            }, 1300);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition warning:', event.error);
        if (event.error !== 'no-speech') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);

        // Auto-reconnect supervisor for Live Voice Call:
        // Browsers close recognition after silence; if call is connected and we are not speaking,
        // instantly and seamlessly restart recognition so the call NEVER drops!
        if (
          isCallConnectedRef.current &&
          !isSpeakingRef.current &&
          !isCallMutedRef.current
        ) {
          try {
            recognition.start();
          } catch {
            setTimeout(() => {
              if (
                isCallConnectedRef.current &&
                !isSpeakingRef.current &&
                !isCallMutedRef.current
              ) {
                try {
                  recognition.start();
                } catch {
                  // ignore
                }
              }
            }, 300);
          }
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [speechLanguage]);

  // Process message during live call hands-free
  const processVoiceCallMessage = async (transcript: string) => {
    if (!transcript || isSpeakingRef.current || !isCallConnectedRef.current) return;

    setCallStatus('processing');
    setIsLoading(true);

    // Add to chat history
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: transcript,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const currentContext = {
        isAdminUnlocked,
        language,
        profile: {
          name: profile.name,
          title: profile.title,
          phone: profile.phone,
          whatsapp: profile.whatsapp,
          email: profile.email,
          location: profile.location,
        },
        projects: projects.map((p) => ({
          id: p.id,
          title: p.title,
          category: p.category,
        })),
        skills: skills.map((c) => ({
          category: c.title,
          skills: c.skills.map((s) => ({ name: s.name, level: s.level })),
        })),
      };

      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: transcript,
          includeAudio: true,
          context: currentContext,
          conversation: messages.slice(-4).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text,
          })),
        }),
      });

      const data = await response.json();
      let actionResultSummary = '';

      if (data.action) {
        actionResultSummary = await executeAiAction(data.action);
        setLatestActionResult(actionResultSummary);
      }

      const botReply =
        data.reply ||
        (language === 'bn' ? 'ইউনুস ভাই, আপনার নির্দেশ সম্পন্ন করেছি।' : 'Done, Younus!');

      setLatestAiReply(botReply);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: botReply,
        actionSummary: actionResultSummary || (data.action ? 'অ্যাকশন সম্পন্ন' : undefined),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);

      // Speak the reply out loud using Gemini voice audio
      speakVoiceResponse(botReply, data.audioData, () => {
        // Callback when AI finishes speaking: Automatically resume listening for hands-free loop!
        if (isCallConnectedRef.current && !isCallMutedRef.current) {
          setCallStatus('listening');
          try {
            recognitionRef.current?.start();
          } catch {
            // already active
          }
        } else {
          setCallStatus('idle');
        }
      });
    } catch (err) {
      console.error('Call AI process error:', err);
      const fallbackReply =
        language === 'bn'
          ? 'ইউনুস ভাই, আপনার কথাটি বুঝতে পেরেছি। আপনি বলুন, পরবর্তী কী করতে চান?'
          : 'I got it, Younus. What would you like to do next?';

      setLatestAiReply(fallbackReply);
      speakVoiceResponse(fallbackReply, null, () => {
        if (isCallConnectedRef.current && !isCallMutedRef.current) {
          setCallStatus('listening');
          try {
            recognitionRef.current?.start();
          } catch {
            // ignore
          }
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Start Live Voice Call
  const handleStartCall = () => {
    if (!isAdminUnlocked) return;

    setIsCallConnected(true);
    setIsAiVoiceCallActive(true);
    setCallDuration(0);
    setIsCallMuted(false);
    setLiveUserTranscript('');
    setLatestActionResult(null);

    const greetingText =
      language === 'bn'
        ? `আসসালামু আলাইকুম ইউনুস ভাই! আমি আপনার সাথে সরাসরি লাইভ ভয়েস কলে যুক্ত হয়েছি। কোনো সময়সীমা নেই, যত সময় ইচ্ছা কথা বলতে পারেন। বলুন, আমি কীভাবে সাহায্য করতে পারি?`
        : `Hello Younus! I am connected with you on a direct live voice call. There is no time limit, talk as long as you want. What can I do for you today?`;

    setLatestAiReply(greetingText);
    setCallStatus('speaking');

    // Add greeting to chat
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'assistant',
        text: greetingText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    // Speak initial greeting with natural human voice audio, then start hands-free listening
    speakVoiceResponse(greetingText, null, () => {
      setCallStatus('listening');
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = speechLanguage;
          recognitionRef.current.start();
        }
      } catch (e) {
        console.warn('Speech recognition start:', e);
      }
    });
  };

  // End Live Voice Call
  const handleEndCall = () => {
    setIsCallConnected(false);
    setIsAiVoiceCallActive(false);
    setCallStatus('idle');

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (callTimerRef.current) clearInterval(callTimerRef.current);

    stopSpeaking();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    const endMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'assistant',
      text:
        language === 'bn'
          ? `ভয়েস কল সম্পন্ন হয়েছে (মোট সময়: ${formatDuration(callDuration)})। আবার যেকোনো সময় কল শুরু করতে পারবেন।`
          : `Voice call ended (Duration: ${formatDuration(callDuration)}). You can start a new call anytime.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, endMsg]);
  };

  // Toggle Mute during Call
  const toggleCallMute = () => {
    if (!isCallConnected) return;

    if (isCallMuted) {
      setIsCallMuted(false);
      setCallStatus('listening');
      try {
        recognitionRef.current?.start();
      } catch {
        // ignore
      }
    } else {
      setIsCallMuted(true);
      setCallStatus('idle');
      stopSpeaking();
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
    }
  };

  // Handle Passcode Unlock
  const handlePasscodeUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!passcode.trim()) {
      setAuthError(language === 'bn' ? 'অনুগ্রহ করে পাসওয়ার্ড লিখুন।' : 'Please enter password.');
      return;
    }

    const success = loginAdminWithPassword(passcode.trim());
    if (success) {
      setPasscode('');
      setAuthError('');
      // Auto-start call if user had intended to call
      if (activeTab === 'call') {
        setTimeout(() => {
          handleStartCall();
        }, 200);
      }
    } else {
      setAuthError(
        language === 'bn'
          ? 'ভুল পাসওয়ার্ড! শুধুমাত্র মালিক প্রবেশ করতে পারবেন (ডিফল্ট: 1234)।'
          : 'Incorrect password! Exclusive to portfolio owner (Default: 1234).'
      );
    }
  };

  // Handle Standard Chat Message Submission
  const handleSendMessage = async (textToSend?: string) => {
    if (!isAdminUnlocked) return;

    const prompt = (textToSend || inputMessage).trim();
    if (!prompt || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setInputMessage('');

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const currentContext = {
        isAdminUnlocked,
        language,
        profile: {
          name: profile.name,
          title: profile.title,
          phone: profile.phone,
          whatsapp: profile.whatsapp,
          email: profile.email,
          location: profile.location,
        },
        projects: projects.map((p) => ({
          id: p.id,
          title: p.title,
          category: p.category,
        })),
        skills: skills.map((c) => ({
          category: c.title,
          skills: c.skills.map((s) => ({ name: s.name, level: s.level })),
        })),
      };

      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          includeAudio: true,
          context: currentContext,
          conversation: messages.slice(-4).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text,
          })),
        }),
      });

      const data = await response.json();
      let actionResultSummary = '';

      if (data.action) {
        actionResultSummary = await executeAiAction(data.action);
      }

      const botReply =
        data.reply || (language === 'bn' ? 'কমান্ড সম্পন্ন হয়েছে।' : 'Command executed.');

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: botReply,
        actionSummary: actionResultSummary || (data.action ? 'অ্যাকশন সম্পন্ন' : undefined),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      speakVoiceResponse(botReply, data.audioData);
    } catch (err: any) {
      console.error('AI assistant error:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text:
          language === 'bn'
            ? 'অনুরোধটি প্রসেস করতে সাময়িক সমস্যা হয়েছে। আপনি পুনরায় চেষ্টা করুন।'
            : 'Sorry, could not process request. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Standard Mic
  const toggleListening = () => {
    if (!isAdminUnlocked) return;

    if (!recognitionRef.current) {
      setMicNotice(
        language === 'bn'
          ? 'আপনার ব্রাউজারে স্পিচ রিকগনিশন সমর্থন করে না। Google Chrome বা Edge ব্যবহার করুন।'
          : 'Speech recognition is not supported in this browser. Please use Chrome or Edge.'
      );
      setTimeout(() => setMicNotice(null), 4000);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = speechLanguage;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Error starting speech recognition:', err);
      }
    }
  };

  const samplePrompts = [
    {
      label: language === 'bn' ? 'নতুন প্রজেক্ট ফর্ম' : 'Add Project Form',
      cmd: language === 'bn' ? 'নতুন প্রজেক্ট যোগ করার ফর্মটি খোলো' : 'Open add project form',
    },
    {
      label: language === 'bn' ? 'বায়ো ও ফোন আপডেট' : 'Update Bio & Phone',
      cmd: language === 'bn' ? 'আমার প্রোফাইল এডিট ডায়ালগ খোলো' : 'Open profile edit dialog',
    },
    {
      label: language === 'bn' ? 'স্কিল ম্যানেজমেন্ট' : 'Manage Skills',
      cmd: language === 'bn' ? 'স্কিল ম্যানেজ করার অপশন খোলো' : 'Open manage skills dialog',
    },
    {
      label: language === 'bn' ? 'কাজের তালিকা' : 'Go to Projects',
      cmd: language === 'bn' ? 'প্রজেক্ট সেকশনে নিয়ে যাও' : 'Navigate to projects section',
    },
    {
      label: language === 'bn' ? 'এডমিন লক' : 'Lock Admin',
      cmd: language === 'bn' ? 'এডমিন মোড লক করো' : 'Lock admin mode',
    },
  ];

  if (!isAiAssistantOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => {
        if (isCallConnected) handleEndCall();
        if (isListening && recognitionRef.current) recognitionRef.current.stop();
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        setIsAiAssistantOpen(false);
      }}
    >
      <div
        className="relative w-full sm:max-w-2xl h-[94dvh] sm:h-[88vh] bg-slate-900 border sm:border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div
              className={`relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-white shadow-md shrink-0 transition-all ${
                isCallConnected
                  ? 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 ring-2 ring-emerald-500/50 shadow-emerald-500/30'
                  : 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 shadow-purple-500/20'
              }`}
            >
              {isCallConnected ? <PhoneCall className="w-5 h-5 animate-pulse" /> : <Bot className="w-5 h-5" />}
              {(isSpeakingResponse || callStatus === 'speaking') && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {language === 'bn' ? 'ব্যক্তিগত AI ভয়েস কল ও সহকারী' : 'Owner AI Live Voice Call'}
                </h3>
                {isAdminUnlocked ? (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase bg-emerald-950/80 text-emerald-300 rounded border border-emerald-700/60 shrink-0 flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    <span>{language === 'bn' ? 'মালিক' : 'Owner'}</span>
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase bg-amber-950/80 text-amber-300 rounded border border-amber-700/60 shrink-0 flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" />
                    <span>{language === 'bn' ? 'লকড' : 'Locked'}</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate flex items-center gap-1.5">
                {isCallConnected ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Radio className="w-3 h-3 animate-pulse" />
                    <span>{language === 'bn' ? 'লাইভ কল চলছে • সীমাহীন সময়' : 'Live Call Active • Unlimited'}</span>
                  </span>
                ) : isAdminUnlocked ? (
                  language === 'bn' ? (
                    'ইউনুস আহমেদ (মালিক) — সম্পূর্ণ একচ্ছত্র নিয়ন্ত্রণ'
                  ) : (
                    'Younus Ahmed (Owner) — Exclusive Control'
                  )
                ) : language === 'bn' ? (
                  'শুধুমাত্র পোর্টফোলিও মালিকের জন্য সংরক্ষিত'
                ) : (
                  'Exclusively reserved for portfolio owner'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isAdminUnlocked && (
              <>
                {/* Language Select */}
                <select
                  value={speechLanguage}
                  onChange={(e) => setSpeechLanguage(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-purple-500 hidden sm:block"
                  title="Voice Language"
                >
                  <option value="bn-BD">বাংলা (Bengali)</option>
                  <option value="en-US">English</option>
                </select>

                {/* Audio Output Mute Toggle */}
                <button
                  onClick={() => {
                    setTtsEnabled(!ttsEnabled);
                    if (window.speechSynthesis) window.speechSynthesis.cancel();
                  }}
                  title={ttsEnabled ? 'Mute AI voice' : 'Unmute AI voice'}
                  className={`p-2 rounded-lg border transition-colors ${
                    ttsEnabled
                      ? 'bg-purple-950/40 border-purple-800 text-purple-300 hover:bg-purple-900/40'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Instant Lock Button */}
                <button
                  onClick={() => {
                    if (isCallConnected) handleEndCall();
                    logoutAdmin();
                    if (isListening && recognitionRef.current) recognitionRef.current.stop();
                    if (window.speechSynthesis) window.speechSynthesis.cancel();
                  }}
                  title={language === 'bn' ? 'AI লক করুন' : 'Lock AI Assistant'}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-950/40 border border-rose-900/60 text-rose-300 hover:bg-rose-900/50 text-xs font-medium transition-colors"
                >
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">{language === 'bn' ? 'লক' : 'Lock'}</span>
                </button>
              </>
            )}

            {/* Close Button */}
            <button
              onClick={() => {
                if (isCallConnected) handleEndCall();
                if (isListening && recognitionRef.current) recognitionRef.current.stop();
                if (window.speechSynthesis) window.speechSynthesis.cancel();
                setIsAiAssistantOpen(false);
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selection Bar (When Admin Unlocked) */}
        {isAdminUnlocked && (
          <div className="flex items-center justify-between px-3 sm:px-5 py-2 border-b border-slate-800/80 bg-slate-950/40 text-xs">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setActiveTab('call')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'call'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 ring-1 ring-emerald-400'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <PhoneCall className={`w-3.5 h-3.5 ${isCallConnected ? 'animate-bounce text-emerald-200' : ''}`} />
                <span>{language === 'bn' ? '📞 সরাসরি লাইভ ভয়েস কল' : '📞 Live Voice Call'}</span>
                {isCallConnected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'chat'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30 ring-1 ring-purple-400'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? '💬 চ্যাট ও কমান্ড' : '💬 Chat & Commands'}</span>
              </button>
            </div>

            {/* Unlimited Time Indicator */}
            <div className="hidden xs:flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <InfinityIcon className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'সীমাহীন সময়' : 'Unlimited Time'}</span>
            </div>
          </div>
        )}

        {/* OWNER SECURITY GATE (When Admin is NOT Unlocked) */}
        {!isAdminUnlocked ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-950/60 border border-amber-600/50 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-950/50 mb-4 animate-pulse">
              <Lock className="w-8 h-8" />
            </div>

            <h4 className="text-lg sm:text-xl font-bold text-white mb-2">
              {language === 'bn'
                ? 'শুধুমাত্র মালিকের ব্যক্তিগত AI সহকারী ও ভয়েস কল'
                : 'Owner-Only AI Voice Assistant & Direct Call'}
            </h4>

            <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
              {language === 'bn'
                ? 'এই AI ভয়েস কল এবং পোর্টফোলিও কন্ট্রোলটি ইউনুস আহমেদ (মালিক)-এর জন্য একান্ত নিজস্ব। আপনি মালিক হলে পাসওয়ার্ড (ডিফল্ট: 1234) দিয়ে আনলক করে সীমাহীন সময়ের জন্য সরাসরি ভয়েস কলে কথা বলতে পারবেন।'
                : 'This AI Voice Call and portfolio automation is strictly private to Younus Ahmed. Please unlock with your owner password (default: 1234) to start unlimited voice calls.'}
            </p>

            <form onSubmit={handlePasscodeUnlock} className="w-full max-w-sm space-y-3">
              <div className="relative">
                <input
                  type={showPasscode ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder={language === 'bn' ? 'মালিকের পাসওয়ার্ড লিখুন...' : 'Enter owner password...'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {authError && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs text-left">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-600 via-emerald-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white shadow-lg shadow-amber-950/50 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>
                  {language === 'bn' ? 'আনলক করুন ও সরাসরি কল শুরু করুন' : 'Unlock & Start Live Call'}
                </span>
              </button>

              <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                <span>🔐</span>
                <span>
                  {language === 'bn'
                    ? 'গোপনীয়তা সংরক্ষিত: অন্য কোনো ভিজিটর এটি অ্যাক্সেস করতে পারবে না।'
                    : 'Privacy Protected: Regular visitors cannot access this tool.'}
                </span>
              </div>
            </form>
          </div>
        ) : activeTab === 'call' ? (
          /* ======================================================== */
          /* LIVE VOICE CALL INTERFACE (DIRECT CONTINUOUS CALL SCREEN) */
          /* ======================================================== */
          <div className="flex-1 flex flex-col bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-4 sm:p-6 overflow-hidden">
            {/* Call Status Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 shrink-0">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    isCallConnected
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 shadow-sm'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isCallConnected ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
                    }`}
                  ></span>
                  <span>
                    {isCallConnected
                      ? language === 'bn'
                        ? 'সরাসরি লাইভ কল চলছে'
                        : 'Live Call Connected'
                      : language === 'bn'
                      ? 'কল স্ট্যান্ডবাই'
                      : 'Call Standby'}
                  </span>
                </span>

                {isCallConnected && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/90 text-slate-200 text-xs font-mono font-bold border border-slate-700">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>{formatDuration(callDuration)}</span>
                  </div>
                )}
              </div>

              {/* Unlimited Duration Reassurance */}
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400/90 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-900/50">
                <InfinityIcon className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'কোনো লিমিট নেই' : 'No Limit'}</span>
              </div>
            </div>

            {/* Central Animated Orb / Voice Visualizer Area */}
            <div className="flex-1 flex flex-col items-center justify-center py-4 relative min-h-0">
              {/* Outer Pulsing Waves when Listening or Speaking */}
              <div className="relative flex items-center justify-center mb-6">
                {isCallConnected && (callStatus === 'listening' || callStatus === 'speaking') && (
                  <>
                    <div
                      className={`absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full opacity-20 animate-ping pointer-events-none ${
                        callStatus === 'speaking' ? 'bg-indigo-500' : 'bg-emerald-500'
                      }`}
                    ></div>
                    <div
                      className={`absolute w-36 h-36 sm:w-48 sm:h-48 rounded-full opacity-30 animate-pulse pointer-events-none ${
                        callStatus === 'speaking' ? 'bg-purple-500' : 'bg-teal-500'
                      }`}
                    ></div>
                  </>
                )}

                {/* Main Visualizer Core */}
                <div
                  className={`relative flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36 rounded-full shadow-2xl transition-all duration-500 border-2 ${
                    isCallConnected
                      ? callStatus === 'speaking'
                        ? 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 border-pink-400 shadow-purple-900/60 scale-105 ring-8 ring-purple-500/20'
                        : callStatus === 'listening'
                        ? 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 border-emerald-300 shadow-emerald-900/60 scale-105 ring-8 ring-emerald-500/20'
                        : callStatus === 'processing'
                        ? 'bg-gradient-to-tr from-amber-600 via-orange-600 to-indigo-600 border-amber-300 shadow-amber-900/60 animate-pulse'
                        : isCallMuted
                        ? 'bg-slate-800 border-slate-700 shadow-slate-950/80 opacity-70'
                        : 'bg-slate-800 border-slate-700 shadow-slate-950/80'
                      : 'bg-slate-800/80 border-slate-700/80'
                  }`}
                >
                  {isCallConnected ? (
                    callStatus === 'speaking' ? (
                      <Volume2 className="w-12 h-12 sm:w-16 sm:h-16 text-white animate-pulse" />
                    ) : callStatus === 'listening' ? (
                      <Mic className="w-12 h-12 sm:w-16 sm:h-16 text-white animate-bounce" />
                    ) : callStatus === 'processing' ? (
                      <Zap className="w-12 h-12 sm:w-16 sm:h-16 text-amber-200 animate-spin" />
                    ) : isCallMuted ? (
                      <MicOff className="w-12 h-12 sm:w-16 sm:h-16 text-rose-300" />
                    ) : (
                      <PhoneCall className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-300" />
                    )
                  ) : (
                    <Phone className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Call Status Label */}
              <div className="text-center mb-4">
                <h4 className="text-base sm:text-lg font-bold text-white mb-1">
                  {isCallConnected ? (
                    callStatus === 'listening' ? (
                      <span className="text-emerald-400 flex items-center justify-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                        {language === 'bn' ? '🎙️ আপনার কথা শুনছি... (মুখে বলুন)' : '🎙️ Listening to you... (Speak now)'}
                      </span>
                    ) : callStatus === 'speaking' ? (
                      <span className="text-purple-300 flex items-center justify-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse"></span>
                        {language === 'bn' ? '🔊 AI কথা বলছে...' : '🔊 AI is speaking...'}
                      </span>
                    ) : callStatus === 'processing' ? (
                      <span className="text-amber-300 flex items-center justify-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-spin"></span>
                        {language === 'bn' ? '⚡ চিন্তা করছি ও নির্দেশ কার্যকর করছি...' : '⚡ Processing command...'}
                      </span>
                    ) : isCallMuted ? (
                      <span className="text-rose-400">
                        {language === 'bn' ? '🔇 মাইক্রোফোন মিউট করা আছে' : '🔇 Microphone Muted'}
                      </span>
                    ) : (
                      <span className="text-slate-300">
                        {language === 'bn' ? '🟢 কল সংযুক্ত আছে' : '🟢 Call Connected'}
                      </span>
                    )
                  ) : language === 'bn' ? (
                    'সরাসরি ভয়েস কল শুরু করতে নিচের বাটনে চাপুন'
                  ) : (
                    'Tap below to start continuous live voice call'
                  )}
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {isCallConnected
                    ? language === 'bn'
                      ? 'বাটন চাপার দরকার নেই! স্বয়ংক্রিয়ভাবে কথা বলুন—AI শুনেই উত্তর দেবে।'
                      : 'Hands-free conversation! Just speak naturally and AI will respond.'
                    : language === 'bn'
                    ? 'যতক্ষণ ইচ্ছা কথা বলতে পারবেন। কোনো লিমিট বা সময়সীমা নেই।'
                    : 'Talk as long as you want without any time limit or restrictions.'}
                </p>
              </div>

              {/* Live Spoken Subtitle & Action Feedback Box */}
              {isCallConnected && (
                <div className="w-full max-w-lg bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-left shadow-lg backdrop-blur-md">
                  {liveUserTranscript && (
                    <div className="mb-2 text-emerald-300 flex items-start gap-2">
                      <span className="font-semibold text-emerald-400 shrink-0">
                        {language === 'bn' ? 'আপনি:' : 'You:'}
                      </span>
                      <span className="italic">"{liveUserTranscript}"</span>
                    </div>
                  )}

                  {latestAiReply && (
                    <div className="text-slate-200 flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-purple-400 shrink-0">AI:</span>
                        <span className="leading-relaxed">{latestAiReply}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => speakVoiceResponse(latestAiReply)}
                        title={language === 'bn' ? 'পুনরায় ভয়েসে শুনুন' : 'Replay voice response'}
                        className="shrink-0 p-1 rounded-md bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-800 transition-colors flex items-center gap-1 text-[11px]"
                      >
                        <Volume2 className="w-3 h-3 text-purple-300" />
                        <span className="hidden sm:inline">{language === 'bn' ? 'শুনুন' : 'Replay'}</span>
                      </button>
                    </div>
                  )}

                  {latestActionResult && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{latestActionResult}</span>
                    </div>
                  )}

                  {/* Manual trigger button in case user wants immediate reply without waiting for silence */}
                  {liveUserTranscript && callStatus === 'listening' && (
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => {
                          if (latestTranscriptRef.current) {
                            const txt = latestTranscriptRef.current;
                            latestTranscriptRef.current = '';
                            setLiveUserTranscript('');
                            processVoiceCallMessage(txt);
                          }
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition-colors flex items-center gap-1"
                      >
                        <span>{language === 'bn' ? 'কথা শেষ, এখনই পাঠান' : 'Send Now'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Call Action Bar */}
            <div className="pt-3 border-t border-slate-800/80 shrink-0 flex items-center justify-center gap-4 sm:gap-6">
              {!isCallConnected ? (
                /* Start Call Button */
                <button
                  onClick={handleStartCall}
                  className="flex items-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-emerald-950/60 active:scale-95 transition-all"
                >
                  <PhoneCall className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                  <span>
                    {language === 'bn' ? 'সরাসরি ভয়েস কল শুরু করুন (সীমাহীন)' : 'Start Live Voice Call (Unlimited)'}
                  </span>
                </button>
              ) : (
                /* Active Call Controls */
                <>
                  {/* Mute/Unmute Mic */}
                  <button
                    onClick={toggleCallMute}
                    title={isCallMuted ? 'আনমিউট করুন' : 'মাইক মিউট করুন'}
                    className={`flex flex-col items-center gap-1 p-3 sm:p-3.5 rounded-2xl border transition-all active:scale-95 ${
                      isCallMuted
                        ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                        : 'bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {isCallMuted ? (
                      <MicOff className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400" />
                    ) : (
                      <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                    )}
                    <span className="text-[10px] font-medium">
                      {isCallMuted
                        ? language === 'bn'
                          ? 'আনমিউট'
                          : 'Unmute'
                        : language === 'bn'
                        ? 'মিউট'
                        : 'Mute'}
                    </span>
                  </button>

                  {/* End Call Button (Prominent Red Phone Button) */}
                  <button
                    onClick={handleEndCall}
                    title={language === 'bn' ? 'কল শেষ করুন' : 'End Call'}
                    className="flex flex-col items-center gap-1 p-3.5 sm:p-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-950/60 ring-4 ring-rose-500/20 active:scale-95 transition-all"
                  >
                    <PhoneOff className="w-6 h-6 sm:w-7 sm:h-7" />
                    <span className="text-[10px] font-bold">
                      {language === 'bn' ? 'কল কাটুন' : 'End Call'}
                    </span>
                  </button>

                  {/* Speaker Mute/Unmute */}
                  <button
                    onClick={() => {
                      setTtsEnabled(!ttsEnabled);
                      if (window.speechSynthesis) window.speechSynthesis.cancel();
                    }}
                    title={ttsEnabled ? 'স্পিকার বন্ধ করুন' : 'স্পিকার চালু করুন'}
                    className={`flex flex-col items-center gap-1 p-3 sm:p-3.5 rounded-2xl border transition-all active:scale-95 ${
                      ttsEnabled
                        ? 'bg-purple-950/60 border-purple-800 text-purple-300'
                        : 'bg-slate-800/90 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {ttsEnabled ? (
                      <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300" />
                    ) : (
                      <VolumeX className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                    )}
                    <span className="text-[10px] font-medium">
                      {ttsEnabled
                        ? language === 'bn'
                          ? 'স্পিকার অন'
                          : 'Audio On'
                        : language === 'bn'
                        ? 'স্পিকার অফ'
                        : 'Audio Off'}
                    </span>
                  </button>

                  {/* View Transcript History */}
                  <button
                    onClick={() => setActiveTab('chat')}
                    title={language === 'bn' ? 'চ্যাট হিস্ট্রি দেখুন' : 'View Chat Transcript'}
                    className="flex flex-col items-center gap-1 p-3 sm:p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all active:scale-95"
                  >
                    <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                    <span className="text-[10px] font-medium">
                      {language === 'bn' ? 'হিস্ট্রি' : 'History'}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* STANDARD TEXT & VOICE COMMAND CHAT INTERFACE */
          /* ======================================================== */
          <>
            {/* Quick Suggestions Bar */}
            <div className="px-3 sm:px-4 py-2 border-b border-slate-800/70 bg-slate-950/30 overflow-x-auto no-scrollbar shrink-0">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>{language === 'bn' ? 'ভয়েস সাজেশন:' : 'Quick Voice:'}</span>
                </span>
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(p.cmd)}
                    className="px-2.5 py-1 text-xs rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Transcript Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs sm:text-sm">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 sm:gap-3 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-purple-600 text-white rounded-br-none shadow-purple-900/20'
                        : 'bg-slate-800/90 text-slate-100 rounded-bl-none border border-slate-700/70'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                    {msg.actionSummary && (
                      <div className="mt-2 pt-1.5 border-t border-slate-700/60 flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{msg.actionSummary}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-1 pt-0.5 text-[10px]">
                      {msg.sender === 'assistant' ? (
                        <button
                          type="button"
                          onClick={() => speakVoiceResponse(msg.text)}
                          title={language === 'bn' ? 'ভয়েসে শুনুন' : 'Listen with voice'}
                          className="flex items-center gap-1 text-purple-400 hover:text-purple-200 transition-colors"
                        >
                          <Volume2 className="w-3 h-3 text-purple-400" />
                          <span>{language === 'bn' ? 'ভয়েসে শুনুন' : 'Listen'}</span>
                        </button>
                      ) : (
                        <span></span>
                      )}
                      <span className={msg.sender === 'user' ? 'text-purple-200/80 text-right w-full' : 'text-slate-400'}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-md">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5 items-center text-slate-400 text-xs italic">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
                    <span>
                      {language === 'bn' ? 'চিন্তা করছি ও নির্দেশ প্রসেস করছি...' : 'Thinking and executing...'}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Area */}
            <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/60 shrink-0">
              <div className="flex items-center gap-2">
                {/* Microphone Push-to-Talk */}
                <button
                  type="button"
                  onClick={toggleListening}
                  title={isListening ? 'ভয়েস রেকর্ড বন্ধ করুন' : 'ভয়েস রেকর্ড শুরু করুন'}
                  className={`relative flex items-center justify-center w-12 h-12 rounded-xl transition-all shadow-md shrink-0 active:scale-95 ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse shadow-rose-900/50 ring-4 ring-rose-500/30'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/40'
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
                </button>

                {/* Text Input */}
                <div className="flex-1 relative flex items-center">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                    placeholder={
                      isListening
                        ? language === 'bn'
                          ? 'শুনছি... মুখে বলুন'
                          : 'Listening... speak now'
                        : language === 'bn'
                        ? 'মুখে বলুন বা লিখে জানান (যেমন: নতুন প্রজেক্ট যোগ করো)'
                        : 'Speak or type command...'
                    }
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 sm:px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 pr-11 transition-colors"
                  />

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || isLoading}
                    className="absolute right-2 p-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:hover:bg-purple-600 text-white transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {micNotice && (
                <div className="mt-2 p-2 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                  <span>{micNotice}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const FloatingAiVoiceButton: React.FC = () => {
  const { startAiVoiceCall, isAdminUnlocked, language } = usePortfolio();

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 group">
      {/* Direct Live Call Quick Pill on Desktop */}
      <button
        onClick={() => startAiVoiceCall()}
        title={
          isAdminUnlocked
            ? language === 'bn'
              ? 'সরাসরি ভয়েস কল শুরু করুন (সীমাহীন)'
              : 'Start Unlimited Live Voice Call'
            : language === 'bn'
            ? 'মালিকের ব্যক্তিগত ভয়েস কল (লকড)'
            : 'Private Owner Voice Call (Locked)'
        }
        className={`hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold border shadow-xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 ${
          isAdminUnlocked
            ? 'bg-gradient-to-r from-emerald-950/95 via-slate-900/95 to-slate-900/95 text-emerald-300 border-emerald-600/60 shadow-emerald-950/50 hover:border-emerald-500'
            : 'bg-slate-900/95 text-slate-300 border-purple-800/60 shadow-slate-950/80'
        }`}
      >
        {isAdminUnlocked ? (
          <>
            <PhoneCall className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{language === 'bn' ? '📞 সরাসরি লাইভ কল' : '📞 Live Voice Call'}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-900/80 text-emerald-200">
              {language === 'bn' ? 'সীমাহীন' : 'Unlimited'}
            </span>
          </>
        ) : (
          <>
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'bn' ? 'মালিক AI কল (লকড)' : 'Owner AI Call'}</span>
          </>
        )}
      </button>

      {/* Main Floating Action Button */}
      <button
        onClick={() => startAiVoiceCall()}
        className={`relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 border ${
          isAdminUnlocked
            ? 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 shadow-emerald-950/60 border-emerald-400/50 ring-2 ring-emerald-500/20'
            : 'bg-gradient-to-tr from-slate-900 via-purple-950 to-slate-900 shadow-slate-950/80 border-purple-800/60'
        }`}
        title={
          isAdminUnlocked
            ? language === 'bn'
              ? 'সরাসরি ভয়েস কল ও AI সহকারী'
              : 'Direct Voice Call & AI Assistant'
            : language === 'bn'
            ? 'ব্যক্তিগত AI সহকারী (মালিকের পাসওয়ার্ড প্রয়োজন)'
            : 'Private AI Assistant (Owner verification required)'
        }
      >
        <span
          className={`absolute -inset-1 rounded-2xl opacity-30 blur-md group-hover:opacity-75 transition-opacity pointer-events-none ${
            isAdminUnlocked
              ? 'bg-gradient-to-r from-emerald-500 to-indigo-500'
              : 'bg-gradient-to-r from-purple-600 to-pink-600'
          }`}
        ></span>

        <div className="relative flex items-center justify-center">
          {isAdminUnlocked ? (
            <PhoneCall className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          ) : (
            <div className="relative">
              <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300 opacity-80" />
              <Lock className="w-3 h-3 text-amber-400 absolute -bottom-1 -right-1 bg-slate-950 rounded-full p-0.5" />
            </div>
          )}
        </div>
      </button>
    </div>
  );
};
