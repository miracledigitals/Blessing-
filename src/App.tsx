import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crown,
  Heart,
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  Settings,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Gift,
  Smile,
  ShieldCheck,
  RefreshCcw,
  MessageSquareHeart,
  Star,
  Camera,
} from 'lucide-react';
import { HeartAnimation } from './components/HeartAnimation';
import { EvasiveButton } from './components/EvasiveButton';
import { CreatorPanel } from './components/CreatorPanel';
import { RoyalDecreeCertificate } from './components/RoyalDecreeCertificate';
import { SunflowerIcon } from './components/SunflowerIcon';
import { PhotoGallery } from './components/PhotoGallery';
import { playPopSound, playSuccessChime, playFanfareSound } from './utils/audio';
import { CreatorSettings, ProposalAnswer, ServerResponseRecord } from './types';

// Default initial settings
const DEFAULT_SETTINGS: CreatorSettings = {
  girlfriendName: "Blessing",
  boyfriendName: "Miracle",
  recipientEmail: "mcmikeyofficial@gmail.com",
  customProposalTitle: "Application to Be Your King",
  customProposalSubtitle: "Submitted with devotion & love to Queen Blessing 👑🌻",
  soundEnabled: true,
  photos: [
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80",
      caption: "Sunflower sunshine & happy laughter 🌻",
    },
    {
      id: "2",
      url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80",
      caption: "Holding hands & sweet moments ❤️",
    },
    {
      id: "3",
      url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80",
      caption: "Golden hour walks together ✨",
    },
  ],
};

export default function App() {
  // Step State:
  // 0 = Welcome Application Portal Gateway
  // 1 = Cover Letter & Application Letter from Miracle
  // 2 = Expanded Candidate Qualifications & Pledges (10 reasons)
  // 3 = Final Application Decision ("Will you accept Miracle's application to be your King?")
  // 4 = Official Acceptance Note & Email Confirmation
  // 5 = Royal Certificate of Appointment Celebration
  const [currentStep, setCurrentStep] = useState<number>(0);

  const [settings, setSettings] = useState<CreatorSettings>(DEFAULT_SETTINGS);
  const [showCreatorPanel, setShowCreatorPanel] = useState<boolean>(false);
  const [answers, setAnswers] = useState<ProposalAnswer[]>([]);
  const [selectedNickname, setSelectedNickname] = useState<string>("My King Miracle 👑");
  const [customMessage, setCustomMessage] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [finalResponseRecord, setFinalResponseRecord] = useState<ServerResponseRecord | null>(null);
  const [triggerConfetti, setTriggerConfetti] = useState<boolean>(false);

  // Load saved settings from server & localStorage on initial mount
  useEffect(() => {
    // 1. Instant fallback from local browser storage
    const localSettings = localStorage.getItem('king_proposal_settings');
    if (localSettings) {
      try {
        setSettings(JSON.parse(localSettings));
      } catch (e) {
        console.error("Local settings parse error:", e);
      }
    }

    // 2. Fetch latest settings from server so shared link recipients see custom photos & names
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
          localStorage.setItem('king_proposal_settings', JSON.stringify(data.settings));
        }
      })
      .catch((err) => console.log('Server settings fetch notice:', err));
  }, []);

  // Update settings state, save locally and sync to server
  const handleUpdateSettings = (newSettings: CreatorSettings) => {
    setSettings(newSettings);
    localStorage.setItem('king_proposal_settings', JSON.stringify(newSettings));

    // Persist on server so anyone visiting the shared URL sees the updated photos and text
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    }).catch((err) => console.error('Failed to sync settings to server:', err));
  };

  const triggerSound = (type: 'pop' | 'chime' | 'fanfare') => {
    if (!settings.soundEnabled) return;
    if (type === 'pop') playPopSound();
    if (type === 'chime') playSuccessChime();
    if (type === 'fanfare') playFanfareSound();
  };

  const handleStartSequence = () => {
    triggerSound('pop');
    setCurrentStep(1); // Goes to Cover Letter page
  };

  const handleGoBack = () => {
    triggerSound('pop');
    if (currentStep > 0 && currentStep < 5) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleMainProposalYes = () => {
    triggerSound('chime');
    setTriggerConfetti(true);
    setCurrentStep(4); // Move to note & email dispatch
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerSound('fanfare');
    setIsSubmitting(true);
    setSubmitStatus(null);

    const payload = {
      answer: "APPROVED! 👑💖",
      customNote: customMessage,
      girlfriendName: settings.girlfriendName,
      boyfriendName: settings.boyfriendName,
      recipientEmail: settings.recipientEmail,
      answersList: [
        { question: "Selected Title for Him", answer: selectedNickname },
        { question: "Application Status", answer: "Officially Approved by Queen Blessing" },
      ],
    };

    try {
      const res = await fetch('/api/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitStatus(`Alert sent to ${settings.recipientEmail}!`);
        setFinalResponseRecord(data.response);
        setCurrentStep(5); // Go to Decree Certificate
      } else {
        setSubmitStatus("Saved locally!");
        setCurrentStep(5);
      }
    } catch (err: any) {
      console.error("Submission error:", err);
      setSubmitStatus("Saved locally!");
      setCurrentStep(5);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FFFBFB] flex flex-col justify-between items-center p-4 md:p-8 font-sans text-slate-800 overflow-x-hidden selection:bg-amber-100 selection:text-amber-900">
      {/* Confetti Animation Trigger */}
      {triggerConfetti && <HeartAnimation />}

      {/* Decorative Artistic Background Elements with Sunflower Warmth */}
      <div className="absolute top-[-50px] right-[-50px] w-96 h-96 bg-[#FEF3C7] rounded-full blur-[100px] opacity-70 pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#FFF1F2] rounded-full blur-[120px] opacity-70 pointer-events-none" />
      <div className="absolute top-[40%] right-[10%] w-[300px] h-[300px] bg-[#FDE68A] rounded-full blur-[110px] opacity-40 pointer-events-none" />
      
      {/* Subtle Background Sunflower Watermark Accents */}
      <div className="absolute top-8 left-8 opacity-20 pointer-events-none hidden md:block rotate-[-12deg]">
        <SunflowerIcon className="w-24 h-24" />
      </div>
      <div className="absolute bottom-12 right-12 opacity-20 pointer-events-none hidden md:block rotate-[15deg]">
        <SunflowerIcon className="w-28 h-28" />
      </div>

      <div className="absolute top-[20%] left-[5%] text-[140px] md:text-[180px] text-red-500 opacity-[0.03] select-none pointer-events-none font-bold font-serif leading-none">
        KINGDOM
      </div>

      {/* Artistic Accent Lines */}
      <div className="hidden lg:block absolute left-12 top-1/2 -translate-y-1/2 w-px h-64 bg-gradient-to-b from-transparent via-amber-200 to-transparent pointer-events-none z-10" />
      <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 w-px h-64 bg-gradient-to-b from-transparent via-amber-200 to-transparent pointer-events-none z-10" />

      {/* Artistic Sidebar Text */}
      <div className="hidden xl:flex absolute right-6 top-1/2 -translate-y-1/2 flex-col items-center gap-12 pointer-events-none z-10">
        <div className="w-px h-20 bg-amber-200" />
        <span className="rotate-90 text-[10px] font-sans uppercase tracking-[0.8em] text-amber-800/40 whitespace-nowrap flex items-center gap-2">
          ESTABLISHED 2026 🌻
        </span>
        <div className="w-px h-20 bg-amber-200" />
      </div>

      {/* Header Bar */}
      <header className="relative z-10 w-full max-w-2xl mx-auto flex items-center justify-between pb-4 border-b border-red-100/80">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center text-white shadow-sm p-0.5">
              <Crown className="w-4 h-4 text-amber-100" />
            </div>
            <span className="font-serif font-semibold text-sm md:text-base text-gray-900 tracking-tight flex items-center gap-1.5">
              King Application Portal <SunflowerIcon className="w-4 h-4" />
            </span>
          </div>
          <div className="h-[2px] w-20 bg-gradient-to-r from-amber-300 to-red-300 mt-1" />
        </div>

        <div className="flex items-center space-x-4">
          {/* Stage Step Indicator */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-sans text-red-500 font-medium italic">
              Page 0{Math.min(currentStep + 1, 4)} of 04
            </span>
            <div className="flex gap-1.5 mt-1">
              {[0, 1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-5 h-1 rounded-full transition-colors ${
                    currentStep >= step ? 'bg-red-500' : 'bg-red-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Audio Toggle */}
            <button
              id="audio-toggle-btn"
              onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              className="p-2 rounded-full bg-white/90 hover:bg-white text-red-600 border border-red-200 transition-colors cursor-pointer text-xs flex items-center justify-center shadow-xs"
              title={settings.soundEnabled ? "Mute sound" : "Enable sound"}
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* King's Control Center Toggle */}
            <button
              id="open-creator-panel-btn"
              onClick={() => setShowCreatorPanel(true)}
              className="px-3.5 py-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white font-sans font-semibold text-xs tracking-wider shadow-sm flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Interactive Stage Container */}
      <main className="relative z-10 w-full max-w-xl mx-auto my-auto py-8">
        <AnimatePresence mode="wait">
          {/* PAGE 1 (STEP 0): Welcome Application Portal Cover */}
          {currentStep === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-amber-100/90 shadow-2xl shadow-amber-100/40 text-center space-y-6 relative overflow-hidden"
            >
              {/* Corner Sunflower Accent */}
              <div className="absolute top-3 right-3 text-amber-500/80 pointer-events-none">
                <SunflowerIcon className="w-8 h-8 opacity-75" />
              </div>

              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 via-red-500 to-rose-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-red-200 ring-8 ring-amber-50">
                  <Crown className="w-10 h-10 fill-white/20 animate-pulse" />
                </div>
              </div>

              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] font-sans font-semibold text-red-600 bg-amber-50/80 px-3.5 py-1 rounded-full border border-amber-200/80">
                  <span>Official Application Dossier</span> 👑 <SunflowerIcon className="w-3.5 h-3.5" />
                </span>
                <h1 className="text-3xl md:text-5xl font-serif font-light text-gray-900 leading-tight">
                  Application to Be <br />
                  Your <span className="text-red-500 italic font-serif">King</span> 👑
                </h1>
                
                {/* Candidate Summary Card */}
                <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 text-left space-y-2 text-xs font-sans text-gray-700 shadow-inner max-w-md mx-auto">
                  <div className="flex justify-between items-center border-b border-amber-200/60 pb-1.5">
                    <span className="font-semibold text-gray-500 uppercase tracking-wider">Applicant Name:</span>
                    <span className="font-bold text-gray-900 text-sm">{settings.boyfriendName}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-amber-200/60 pb-1.5">
                    <span className="font-semibold text-gray-500 uppercase tracking-wider">Position Applied For:</span>
                    <span className="font-bold text-red-600">King of {settings.girlfriendName}'s Heart 👑🌻</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-500 uppercase tracking-wider">Reviewing Authority:</span>
                    <span className="font-bold text-amber-900">Queen {settings.girlfriendName} ✨</span>
                  </div>
                </div>

                <p className="text-xs md:text-sm text-gray-500 font-sans leading-relaxed max-w-md mx-auto opacity-90 pt-1">
                  Dear Queen {settings.girlfriendName}, I, {settings.boyfriendName} formally submits his application to be your King. Please review his cover letter, qualifications, and pledges to render your royal approval...
                </p>
              </div>

              <div className="pt-2">
                <button
                  id="start-proposal-journey-btn"
                  onClick={handleStartSequence}
                  className="w-full py-4 px-8 rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white font-sans font-bold text-base md:text-lg tracking-wider shadow-xl shadow-red-200/60 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-3 cursor-pointer group"
                >
                  <SunflowerIcon className="w-5 h-5 text-amber-200 group-hover:rotate-45 transition-transform" />
                  <span>OPEN COVER LETTER 📄</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {/* PAGE 2 (STEP 1): FORMAL COVER LETTER / LETTER OF APPLICATION */}
          {currentStep === 1 && (
            <motion.div
              key="step1-cover-letter"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-amber-100 shadow-2xl shadow-red-100/40 space-y-6 relative overflow-hidden"
            >
              {/* Corner Sunflower Accent */}
              <div className="absolute top-3 right-3 text-amber-500/80 pointer-events-none">
                <SunflowerIcon className="w-7 h-7 opacity-75" />
              </div>

              <div className="flex items-center justify-between w-full pb-2 border-b border-red-100/60">
                <button
                  id="cover-letter-back-btn"
                  type="button"
                  onClick={handleGoBack}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-sans font-semibold transition-all cursor-pointer hover:-translate-x-0.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.25em] font-sans font-semibold text-red-500 bg-amber-50/80 px-3 py-1 rounded-full border border-amber-200/80">
                  <span>PAGE 02 OF 04 • COVER LETTER</span>
                  <SunflowerIcon className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 text-amber-600 mx-auto ring-6 ring-amber-50/50 shadow-sm">
                  <Crown className="w-6 h-6 text-amber-500" />
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-light text-gray-900 pt-1">
                  Letter of <span className="text-red-500 italic font-serif">Application</span> 💌
                </h2>
                <p className="text-xs text-amber-800 font-mono bg-amber-100/60 py-1 px-3 rounded-full inline-block border border-amber-200">
                  TO: Queen {settings.girlfriendName} | FROM: Applicant {settings.boyfriendName}
                </p>
              </div>

              {/* Letter Card */}
              <div className="bg-amber-50/50 p-5 md:p-6 rounded-2xl border border-amber-200/80 space-y-3.5 text-left font-sans text-xs md:text-sm text-slate-700 leading-relaxed shadow-inner">
                <p className="font-serif font-semibold text-gray-900 text-sm md:text-base">
                  Dear {settings.girlfriendName},
                </p>

                <p>
                  I’m always up for creating beautiful memories. Maybe this can be one of them — the memory of me playfully writing an application to become your &quot;King&quot; 😅
                </p>

                <p>
                  What started as a lighthearted thought has turned into something much deeper. Because honestly, having a place in your life has become one of my biggest dreams.
                </p>

                <p>
                  The purpose of this letter is simple: to tell you, as clearly as I can, why I believe I’m worthy of that place in your heart.
                </p>

                <p>
                  From the very first moment the thought of “us” crossed my mind, it never left. Most thoughts come and go. But the thought of being with you stayed. It settled. It grew.
                </p>

                <p>
                  I want to give you the good things in life — the soft, steady, beautiful ones. And I mean that sincerely.
                </p>

                <p>
                  More than that, I want to be someone who helps you forget the hurt from the past. Not because I want to be important to you, but because I genuinely care for you. Because you matter to me.
                </p>

                <p>
                  I don’t know what your answer will be. It might be yes. It might be no.
                </p>

                <p>
                  But one thing I know for sure is that I’m not imagining how I feel. These words are real, and they come from the heart.
                </p>

                <p className="pt-2 font-medium text-gray-900 italic">
                  With all my care,<br />
                  <span className="text-red-600 font-bold font-serif text-sm md:text-base not-italic">{settings.boyfriendName} 👑</span>
                </p>
              </div>

              {/* Photo Memories Gallery Exhibit */}
              {settings.photos && settings.photos.length > 0 && (
                <div className="pt-2">
                  <PhotoGallery
                    photos={settings.photos}
                    title="Exhibit A: Our Precious Memories 📸"
                    subtitle="Click any photo to enlarge & heart"
                    compact={true}
                    onAddPhotoClick={() => setShowCreatorPanel(true)}
                  />
                </div>
              )}

              {/* Proceed to Qualifications Button */}
              <div className="pt-2">
                <button
                  id="proceed-to-qualifications-btn"
                  onClick={() => {
                    triggerSound('pop');
                    setCurrentStep(2);
                  }}
                  className="w-full py-4 px-8 rounded-full bg-red-500 hover:bg-red-600 text-white font-sans font-bold text-sm md:text-base tracking-wider shadow-xl shadow-red-200/60 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-3 cursor-pointer group"
                >
                  <SunflowerIcon className="w-5 h-5 text-amber-200 group-hover:rotate-12 transition-transform" />
                  <span>VIEW {settings.boyfriendName.toUpperCase()}'S QUALIFICATIONS & PLEDGES 📜</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {/* PAGE 3 (STEP 2): CANDIDATE QUALIFICATIONS & WHY SELECT MIRACLE (EXPANDED LIST) */}
          {currentStep === 2 && (
            <motion.div
              key="step2-qualifications"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-amber-100 shadow-2xl shadow-red-100/40 space-y-6 relative overflow-hidden"
            >
              {/* Corner Sunflower Accent */}
              <div className="absolute top-3 right-3 text-amber-500/80 pointer-events-none">
                <SunflowerIcon className="w-7 h-7 opacity-75" />
              </div>

              <div className="flex items-center justify-between w-full pb-2 border-b border-red-100/60">
                <button
                  id="qualifications-back-btn"
                  type="button"
                  onClick={handleGoBack}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-sans font-semibold transition-all cursor-pointer hover:-translate-x-0.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.25em] font-sans font-semibold text-red-500 bg-amber-50/80 px-3 py-1 rounded-full border border-amber-200/80">
                  <span>PAGE 03 OF 04 • CANDIDATE QUALIFICATIONS</span>
                  <SunflowerIcon className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 text-amber-600 mx-auto ring-8 ring-amber-50/50 shadow-sm">
                  <Crown className="w-8 h-8 text-amber-500" />
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-light text-gray-900 pt-1">
                  16 Reasons Why {settings.girlfriendName} Should Select <span className="text-red-500 italic font-serif">{settings.boyfriendName}</span> as King 👑
                </h2>
                <p className="text-xs md:text-sm text-gray-500 font-sans max-w-md mx-auto">
                  Solemn contractual pledges & promises from {settings.boyfriendName} to Queen {settings.girlfriendName}:
                </p>
              </div>

              {/* Expanded Reasons Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
                {[
                  { text: "I will care for you as the Lord mandates & love you unconditionally", icon: "🙏" },
                  { text: "I will buy you all the shawarma & sweet treats you ever want", icon: "🌯" },
                  { text: "I won't stress you; I'll always be your peace of mind", icon: "😌" },
                  { text: "I will be your #1 Hype Man & biggest cheerleader forever", icon: "💖" },
                  { text: "We will become theology buddies, growing together in faith", icon: "📖" },
                  { text: "I won't be boring; I promise endless laughter & joy", icon: "✨" },
                  { text: "I will buy you all the theological books you want. Let's build a library together.", icon: "📚" },
                  { text: "We will go on adventures together.", icon: "🗺️" },
                  { text: "We will serve God together.", icon: "✝️" },
                  { text: "I promise to have your back always.", icon: "🛡️" },
                  { text: "I promise to make you smile truly.", icon: "😊" },
                  { text: "Because, to hurt you is to kill myself, if we become 1, your utmost well being becomes my priority.", icon: "❤️" },
                  { text: "I will always listen to you with patience, empathy & care", icon: "👂" },
                  { text: "VIP royal foot & back massages whenever you feel tired", icon: "💆‍♂️" },
                  { text: "I will stand by you, pray for you & protect your heart always", icon: "👑" },
                  { text: "And many more...", icon: "✨" },
                ].map((item, index) => {
                  const numStr = String(index + 1).padStart(2, '0');
                  return (
                    <div
                      key={numStr}
                      className="p-3.5 rounded-2xl bg-gradient-to-r from-red-50/40 to-amber-50/40 border border-amber-100/80 flex items-start space-x-3 transition-all hover:bg-amber-50/80 hover:border-amber-200 group"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-amber-500 text-white font-serif font-bold text-xs flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform mt-0.5">
                        {numStr}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-xs font-sans font-medium text-gray-800 leading-snug">
                          {item.text} <span className="inline-block ml-1">{item.icon}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Proceed to Decision Button */}
              <div className="pt-2">
                <button
                  id="proceed-to-decision-btn"
                  onClick={() => {
                    triggerSound('pop');
                    setCurrentStep(3);
                  }}
                  className="w-full py-4 px-8 rounded-full bg-red-500 hover:bg-red-600 text-white font-sans font-bold text-sm md:text-base tracking-wider shadow-xl shadow-red-200/60 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-3 cursor-pointer group"
                >
                  <SunflowerIcon className="w-5 h-5 text-amber-200 group-hover:rotate-12 transition-transform" />
                  <span>PROCEED TO APPLICATION PLEA ✍️</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {/* PAGE 4 (STEP 3): THE MAIN APPLICATION DECISION ("We hope you will accept Miracle's application to be your king") */}
          {currentStep === 3 && (
            <motion.div
              key="step3-main"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="bg-white/95 backdrop-blur-2xl rounded-3xl p-8 md:p-12 border border-amber-200 shadow-2xl shadow-red-200/40 text-center space-y-8 relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-rose-500 to-amber-400" />

              <div className="absolute top-4 right-4 text-amber-500/80 pointer-events-none">
                <SunflowerIcon className="w-8 h-8 opacity-80" />
              </div>

              <div className="flex items-center justify-start w-full">
                <button
                  id="proposal-back-btn"
                  type="button"
                  onClick={handleGoBack}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-sans font-semibold transition-all cursor-pointer hover:-translate-x-0.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Qualifications</span>
                </button>
              </div>

              {/* Artistic Crown & Sunflower Visual */}
              <div className="relative inline-block mt-2">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-red-100 flex items-center justify-center mx-auto ring-8 ring-amber-50/50 shadow-inner">
                  <Crown className="w-12 h-12 text-amber-500 animate-bounce" />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-amber-600/90 font-sans text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-1.5">
                  <SunflowerIcon className="w-3.5 h-3.5" />
                  <span>PAGE 04 OF 04 • HEARTFELT PLEA</span>
                  <SunflowerIcon className="w-3.5 h-3.5" />
                </h2>

                <h1 className="text-3xl md:text-5xl text-gray-900 leading-[1.05] font-serif font-light tracking-tight">
                  We Hope You Will Accept {settings.boyfriendName}'s Application to Be Your <span className="text-red-500 italic font-serif">King</span> 👑
                </h1>

                <p className="text-gray-500 font-sans text-sm md:text-base max-w-md mx-auto leading-relaxed opacity-90">
                  Queen {settings.girlfriendName}, with all his heart and sincerity, {settings.boyfriendName} hopes you will grant his wish. Please accept {settings.boyfriendName}'s application...
                </p>
              </div>

              {/* Heartfelt Plea Message Card */}
              <div className="bg-gradient-to-br from-amber-50/80 to-red-50/60 p-6 md:p-8 rounded-2xl border border-amber-200/80 max-w-md mx-auto space-y-4 text-center shadow-inner">
                <p className="text-gray-700 font-sans text-sm md:text-base leading-relaxed">
                  Queen {settings.girlfriendName}, with all his heart, care, and sincerity, {settings.boyfriendName} hopes you will grant his wish.
                </p>
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-300 to-transparent mx-auto" />
                <p className="text-sm md:text-base text-red-600 font-serif italic font-semibold">
                  &quot;Please accept {settings.boyfriendName}&apos;s application.&quot; 🌻💖
                </p>
              </div>
            </motion.div>
          )}

          {/* PAGE 5 (STEP 4): ACCEPTANCE NOTE & EMAIL CONFIRMATION */}
          {currentStep === 4 && (
            <motion.div
              key="step4-note"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="bg-white/95 backdrop-blur-2xl rounded-3xl p-8 md:p-10 border border-amber-200 shadow-2xl shadow-red-100/60 space-y-6 relative overflow-hidden"
            >
              <div className="flex items-center justify-start w-full">
                <button
                  id="note-back-btn"
                  type="button"
                  onClick={handleGoBack}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-sans font-semibold transition-all cursor-pointer hover:-translate-x-0.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              </div>
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto ring-4 ring-amber-50/50">
                  <Crown className="w-8 h-8 text-amber-500" />
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-light text-gray-900">
                  APPLICATION <span className="text-red-500 italic font-serif">APPROVED!</span> 🎉 👑
                </h2>
                <p className="text-xs md:text-sm text-gray-500 font-sans">
                  Choose candidate {settings.boyfriendName}'s official royal title & leave your acceptance note:
                </p>
              </div>

              <form onSubmit={handleFinalSubmit} className="space-y-4 text-left">
                {/* Nickname Selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 font-sans">
                    Pick an official title for your King:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[`My King ${settings.boyfriendName} 👑`, `His Royal Highness ${settings.boyfriendName} 🤴`, `My Forever ${settings.boyfriendName} ❤️`].map((nick) => (
                      <button
                        type="button"
                        key={nick}
                        onClick={() => setSelectedNickname(nick)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-sans font-semibold border transition-all cursor-pointer text-center ${
                          selectedNickname === nick
                            ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-xs'
                            : 'bg-red-50/40 hover:bg-amber-50 text-gray-700 border-red-100'
                        }`}
                      >
                        {nick}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Personal Note */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1 font-sans">
                    Send him an official acceptance message or date idea:
                  </label>
                  <textarea
                    rows={3}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder={`e.g. 'Application approved! I can't wait for our next date, my King ${settings.boyfriendName}! ❤️'`}
                    className="w-full p-4 rounded-2xl border border-red-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-sm text-gray-800 outline-none transition-all font-sans"
                  />
                </div>

                <div className="p-3.5 bg-red-50/70 rounded-2xl border border-red-200/80 flex items-center space-x-2 text-xs text-red-900 font-sans">
                  <ShieldCheck className="w-4 h-4 text-red-600 shrink-0" />
                  <span>
                    Your confirmation will send an instant alert directly to <strong>{settings.recipientEmail}</strong>!
                  </span>
                </div>

                <button
                  id="final-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-8 rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white font-sans font-bold text-base md:text-lg tracking-wider shadow-xl shadow-red-200/60 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-3 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-5 h-5 text-amber-200" />
                  <span>{isSubmitting ? "SEALING ROYAL DECREE..." : "CONFIRM & DISPATCH ACCEPTANCE ✉️"}</span>
                </button>
              </form>
            </motion.div>
          )}

          {/* PAGE 6 (STEP 5): FINAL CERTIFICATE CELEBRATION */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <RoyalDecreeCertificate
                girlfriendName={settings.girlfriendName}
                boyfriendName={settings.boyfriendName}
                timestamp={finalResponseRecord?.timestamp || new Date().toISOString()}
                customNote={customMessage || finalResponseRecord?.customNote}
              />

              {/* Keepsake Photo Memory Album */}
              {settings.photos && settings.photos.length > 0 && (
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 border border-amber-200 shadow-xl space-y-4">
                  <PhotoGallery
                    photos={settings.photos}
                    title="Our Keepsake Photo Album 🌻"
                    subtitle={`Precious memories treasured by King ${settings.boyfriendName} & Queen ${settings.girlfriendName}`}
                    compact={false}
                    onAddPhotoClick={() => setShowCreatorPanel(true)}
                  />
                </div>
              )}

              <div className="text-center pt-2">
                <button
                  id="restart-journey-btn"
                  onClick={() => {
                    triggerSound('pop');
                    setCurrentStep(0);
                  }}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-white/80 hover:bg-white text-red-600 border border-red-200 text-xs font-sans font-semibold transition-all shadow-xs cursor-pointer"
                >
                  <RefreshCcw className="w-4 h-4" />
                  <span>Restart Application Sequence</span>
                </button>
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-xl mx-auto pt-6 text-center text-xs text-gray-400 font-sans flex flex-col items-center justify-center space-y-1">
        <p className="flex items-center space-x-1 font-medium">
          <span>Crafted for Queen {settings.girlfriendName} by {settings.boyfriendName}</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
          <SunflowerIcon className="w-3.5 h-3.5 text-amber-500" />
        </p>
        <p className="text-[10px] text-gray-400/80">
          Official Digital King Application • All Rights Reserved 2026
        </p>
      </footer>

      {/* Creator / Settings Modal */}
      <CreatorPanel
        isOpen={showCreatorPanel}
        onClose={() => setShowCreatorPanel(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
}
