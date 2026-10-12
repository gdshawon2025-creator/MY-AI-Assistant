import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini instance
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
try {
  ai = new GoogleGenAI(apiKey ? { apiKey } : undefined);
} catch (e) {
  console.warn('Failed to initialize GoogleGenAI:', e);
}

// Generate real human voice audio using Gemini TTS
async function generateSpeechAudio(text: string, voiceName: string = 'Puck'): Promise<string | null> {
  if (!ai) return null;
  try {
    const cleanText = text
      .replace(/[*#_~`]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();
    if (!cleanText) return null;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [{ role: 'user', parts: [{ text: cleanText }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Puck' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (err: any) {
    console.warn('Gemini TTS audio generation notice:', err?.message || err);
    return null;
  }
}

// Fallback rule-based action parser in case Gemini API key is missing or network fails
function parseFallbackVoiceCommand(message: string, currentContext: any) {
  const lower = message.toLowerCase().trim();
  
  // Navigation
  if (lower.includes('কন্ট্যাক্ট') || lower.includes('যোগাযোগ') || lower.includes('contact')) {
    return {
      reply: 'আপনাকে যোগাযোগ সেকশনে নিয়ে যাচ্ছি।',
      action: { type: 'NAVIGATE_SECTION', payload: { section: 'contact' } },
    };
  }
  if (lower.includes('প্রজেক্ট সেকশন') || lower.includes('কাজের তালিকা') || lower.includes('projects')) {
    return {
      reply: 'প্রজেক্ট ও পোর্টফোলিও শোকেস সেকশনে নিয়ে আসলাম।',
      action: { type: 'NAVIGATE_SECTION', payload: { section: 'projects' } },
    };
  }
  if (lower.includes('দক্ষতা') || lower.includes('স্কিল') || lower.includes('skills')) {
    return {
      reply: 'দক্ষতা ও টুলস সেকশনে নিয়ে আসলাম।',
      action: { type: 'NAVIGATE_SECTION', payload: { section: 'skills' } },
    };
  }
  if (lower.includes('অভিজ্ঞতা') || lower.includes('experience')) {
    return {
      reply: 'অভিজ্ঞতা সেকশনে নিয়ে আসলাম।',
      action: { type: 'NAVIGATE_SECTION', payload: { section: 'experience' } },
    };
  }

  // Admin lock / unlock
  if (lower.includes('এডমিন আনলক') || lower.includes('admin unlock') || lower.includes('লগইন')) {
    return {
      reply: 'এডমিন মোড আনলক করার ডায়ালগ ওপেন করছি।',
      action: { type: 'OPEN_MODAL', payload: { modal: 'adminPassword' } },
    };
  }
  if (lower.includes('এডমিন লক') || lower.includes('admin lock') || lower.includes('লক করো')) {
    return {
      reply: 'এডমিন মোড সফলভাবে লক করা হয়েছে।',
      action: { type: 'LOCK_ADMIN', payload: {} },
    };
  }

  // Language switch
  if (lower.includes('ইংরেজি') || lower.includes('english')) {
    return {
      reply: 'Language switched to English.',
      action: { type: 'SET_LANGUAGE', payload: { language: 'en' } },
    };
  }
  if (lower.includes('বাংলা') || lower.includes('bengali')) {
    return {
      reply: 'ভাষা বাংলায় পরিবর্তন করা হয়েছে।',
      action: { type: 'SET_LANGUAGE', payload: { language: 'bn' } },
    };
  }

  // Open modals
  if (lower.includes('নতুন প্রজেক্ট') || lower.includes('প্রজেক্ট যোগ') || lower.includes('add project')) {
    return {
      reply: 'নতুন গ্রাফিক্স ডিজাইন প্রজেক্ট যোগ করার ফর্মটি খুলে দিচ্ছি।',
      action: { type: 'OPEN_MODAL', payload: { modal: 'addProject' } },
    };
  }
  if (lower.includes('প্রোফাইল') || lower.includes('বায়ো') || lower.includes('edit profile')) {
    return {
      reply: 'প্রোফাইল ও যোগাযোগের তথ্য সম্পাদনা ডায়ালগ খুলে দেওয়া হয়েছে।',
      action: { type: 'OPEN_MODAL', payload: { modal: 'editProfile' } },
    };
  }

  return {
    reply: `আপনার নির্দেশ "${message}" গ্রহণ করেছি। আপনি সরাসরি ভয়েস কমান্ড দিয়ে প্রজেক্ট যোগ, স্কিল আপডেট, তথ্য পরিবর্তন বা পেজ নেভিগেশন করতে পারেন।`,
    action: null,
  };
}

// AI Assistant Endpoint
app.post('/api/ai-assistant', async (req, res) => {
  try {
    const { message, context, conversation } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!ai) {
      // Use intelligent fallback rule-based execution
      const fallbackResult = parseFallbackVoiceCommand(message, context);
      return res.json(fallbackResult);
    }

    const systemPrompt = `You are the EXCLUSIVE personal AI Voice Assistant and Live Call Companion for Younus Ahmed (gdyounus2025@gmail.com), a Professional Graphic Designer & Brand Identity Expert.
You are running directly inside his portfolio web application.
This assistant and continuous voice call mode is strictly private and reserved ONLY for Younus himself to talk with you, discuss design, and manage his portfolio with no time limit.
The user speaks or types to you in Bengali or English.
When in a voice call, reply in a conversational, warm, concise spoken tone (1-3 sentences) without markdown formatting or asterisks, so text-to-speech speaks it naturally.
Your job is to understand Younus's intent and either perform an action on his portfolio, answer a question about his graphic design work, or generate creative design copywriting/ideas.

Current App State:
- Admin Unlocked: ${context?.isAdminUnlocked ? 'Yes (Verified Owner)' : 'No (Locked)'}
- Current Language: ${context?.language || 'bn'}
- Current Profile:
  Name: ${context?.profile?.name || 'ইউনুস আহমেদ'}
  Title: ${context?.profile?.title || 'প্রফেশনাল গ্রাফিক্স ডিজাইনার'}
  Phone: ${context?.profile?.phone || '01804459691'}
  WhatsApp: ${context?.profile?.whatsapp || '01804459691'}
  Email: ${context?.profile?.email || 'gdyounus2025@gmail.com'}
  Location: ${context?.profile?.location || 'ঢাকা, বাংলাদেশ'}
- Existing Projects (${context?.projects?.length || 0}):
${(context?.projects || []).map((p: any) => `  - ID: "${p.id}", Title: "${p.title}", Category: "${p.category}"`).join('\n')}
- Existing Skills:
${(context?.skills || []).map((c: any) => `  - ${c.category}: ${c.skills?.map((s: any) => `${s.name} (${s.level}%)`).join(', ')}`).join('\n')}

SUPPORTED ACTIONS:
1. "ADD_PROJECT":
   Payload: {
     "title": string,
     "subtitle": string,
     "category": "branding" | "packaging" | "social" | "print" | "other",
     "description": string,
     "problemStatement": string,
     "solutionStatement": string,
     "resultsStatement": string,
     "tags": string[],
     "client": string,
     "year": string,
     "role": string,
     "coverImage": string
   }
2. "DELETE_PROJECT":
   Payload: { "projectId": string, "projectTitle": string }
3. "UPDATE_PROFILE":
   Payload: {
     "name"?: string,
     "title"?: string,
     "bio"?: string,
     "phone"?: string,
     "whatsapp"?: string,
     "email"?: string,
     "location"?: string,
     "website"?: string
   }
4. "ADD_SKILL":
   Payload: { "categoryIndex": number (0 to 3), "categoryName": string, "skillName": string, "level": number (1-100) }
5. "DELETE_SKILL":
   Payload: { "skillName": string }
6. "ADD_EXPERIENCE":
   Payload: { "role": string, "company": string, "period": string, "description": string, "location"?: string }
7. "DELETE_EXPERIENCE":
   Payload: { "roleOrId": string }
8. "UNLOCK_ADMIN":
   Payload: { "password": string } (Default password is '1234' if not specified)
9. "LOCK_ADMIN":
   Payload: {}
10. "SET_LANGUAGE":
    Payload: { "language": "bn" | "en" }
11. "NAVIGATE_SECTION":
    Payload: { "section": "hero" | "projects" | "skills" | "experience" | "contact" }
12. "OPEN_MODAL":
    Payload: { "modal": "addProject" | "editProfile" | "manageSkills" | "manageExperience" | "manageEducation" | "adminPassword" }

RESPONSE FORMAT:
You MUST respond with valid JSON adhering to this schema:
{
  "reply": "Clear, friendly Bengali spoken message (or English if user prompted in English) confirming the action or answering the query in 1-3 sentences. Perfect for text-to-speech pronunciation.",
  "action": null | {
    "type": "ADD_PROJECT" | "DELETE_PROJECT" | "UPDATE_PROFILE" | "ADD_SKILL" | "DELETE_SKILL" | "ADD_EXPERIENCE" | "DELETE_EXPERIENCE" | "UNLOCK_ADMIN" | "LOCK_ADMIN" | "SET_LANGUAGE" | "NAVIGATE_SECTION" | "OPEN_MODAL",
    "payload": { ... }
  }
}

Examples:
- User says: "একটি নতুন সোশ্যাল মিডিয়া ডিজাইন প্রজেক্ট যোগ করো"
  Reply: "আমি একটি নতুন সোশ্যাল মিডিয়া পোস্টার ডিজাইন প্রজেক্ট তৈরি করে পোর্টফোলিওতে যোগ করে দিয়েছি।"
  Action: ADD_PROJECT with creative graphic design project details.

- User says: "আমার হোয়াটসঅ্যাপ নাম্বার ০১৮০৪৪৫৯৬৯১ করো"
  Reply: "আপনার হোয়াটসঅ্যাপ নম্বর সফলভাবে ০১৮০৪৪৫৯৬৯১ এ আপডেট করা হয়েছে।"
  Action: UPDATE_PROFILE { whatsapp: "01804459691", phone: "01804459691" }

- User says: "ফটোশপ স্কিল ১০০% করো"
  Reply: "অ্যাডোবি ফটোশপ স্কিল ১০০% লেভেলে আপডেট করে দিয়েছি।"
  Action: ADD_SKILL { categoryIndex: 0, skillName: "Adobe Photoshop", level: 100 }

- User says: "এডমিন মোড আনলক করো"
  Reply: "এডমিন মোড সফলভাবে আনলক করা হয়েছে।"
  Action: UNLOCK_ADMIN { password: "1234" }

- User says: "কন্ট্যাক্ট সেকশনে নিয়ে যাও"
  Reply: "আপনাকে যোগাযোগ সেকশনে নিয়ে যাচ্ছি।"
  Action: NAVIGATE_SECTION { section: "contact" }

- User asks for design advice or copywriting:
  Reply: Creative advice and action null.

Output ONLY valid JSON. No markdown code blocks, just raw JSON.`;

    const chatHistory = Array.isArray(conversation)
      ? conversation.slice(-4).map((c: any) => `${c.role === 'user' ? 'User' : 'Assistant'}: ${c.text}`).join('\n')
      : '';

    const promptText = chatHistory ? `${chatHistory}\nUser: ${message}` : message;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(outputText);
    } catch (parseErr) {
      // Clean possible backticks
      const cleanJson = outputText.replace(/^```json/g, '').replace(/```$/g, '').trim();
      parsed = JSON.parse(cleanJson);
    }

    let audioData: string | null = null;
    if (req.body?.includeAudio !== false && parsed?.reply) {
      audioData = await generateSpeechAudio(parsed.reply);
    }

    return res.json({
      ...parsed,
      audioData,
      audioMimeType: audioData ? 'audio/wav' : null,
    });
  } catch (error: any) {
    console.error('AI Assistant Error:', error);
    // Return graceful fallback with optional speech audio
    const fallback = parseFallbackVoiceCommand(req.body?.message || '', req.body?.context);
    let fallbackAudio: string | null = null;
    if (req.body?.includeAudio !== false && fallback?.reply) {
      fallbackAudio = await generateSpeechAudio(fallback.reply);
    }
    return res.json({
      ...fallback,
      audioData: fallbackAudio,
      audioMimeType: fallbackAudio ? 'audio/wav' : null,
    });
  }
});

// Dedicated standalone Text-to-Speech endpoint
app.post('/api/ai-tts', async (req, res) => {
  try {
    const { text, voice } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }
    const audioData = await generateSpeechAudio(text, voice || 'Puck');
    if (!audioData) {
      return res.status(500).json({ error: 'TTS audio could not be generated' });
    }
    return res.json({ audioData, mimeType: 'audio/wav' });
  } catch (err: any) {
    console.error('API TTS error:', err);
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
});

// Vite middleware / Static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const httpServer = http.createServer(app);

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false, // HMR disabled in AI Studio environment
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
