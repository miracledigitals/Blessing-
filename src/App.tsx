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
} from 'lucide-react';
import { HeartAnimation } from './components/HeartAnimation';
import { EvasiveButton } from './components/EvasiveButton';
import { CreatorPanel } from './components/CreatorPanel';
import { RoyalDecreeCertificate } from './components/RoyalDecreeCertificate';
import { playPopSound, playSuccessChime, playFanfareSound } from './utils/audio';
import { CreatorSettings, ProposalAnswer, ServerResponseRecord } from './types';

// Default initial settings
const DEFAULT_SETTINGS: CreatorSettings = {
  girlfriendName: "Blessing",
  boyfriendName: "a King",
  recipientEmail: "mcmikeyofficial@gmail.com",
  customProposalTitle: "Can I be your king?",
  customProposalSubtitle: "And will you be my favourite person forever?",
  soundEnabled: true,
};

export default function App() {
  // Step State:
  // 0 = Welcome / Invitation
  // 1 = Warm-up Vibe Check
  // 2 = Love Quiz (3 sub-questions)
  // 3 = The Main Proposal ("Can I be your king?")
  // 4 = Love Note & Final Confirmation
  // 5 = Royal Decree Certificate Celebration
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [quizIndex, setQuizIndex] = useState<number>(0);

  const [settings, setSettings] = useState<CreatorSettings>(DEFAULT_SETTINGS);
  const [showCreatorPanel, setShowCreatorPanel] = useState<boolean>(false);
  const [answers, setAnswers] = useState<ProposalAnswer[]>([]);
  const [selectedNickname, setSelectedNickname] = useState<string>("My King 👑");
  const [customMessage, setCustomMessage] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [finalResponseRecord, setFinalResponseRecord] = useState<ServerResponseRecord | null>(null);
  const [triggerConfetti, setTriggerConfetti] = useState<boolean>(false);

  // Love Quiz Questions
  const quizQuestions = [
    {
      question: "Question 1: On a scale of 1 to 10, how adorable do you look right now?",
      options: [
        "A solid 10/10 😍",
        "100/10 naturally! 💅",
        "Off the charts cute! 💖",
      ],
      reaction: "Correct answer! You're breathtaking! ✨",
    },
    {
      question: "Question 2: What do you think makes my world right now 100X better?",
      options: [
        "Your smile 😊 (Correct answer!)",
        "Books 📚",
        "Food 🍕",
      ],
      reaction: "Spot on! Your smile makes everything 100X better! ✨",
    },
    {
      question: "Question 3: If we were planning our dream life together, what would be our #1 rule?",
      options: [
        "Mandatory 10-second hugs daily 🤗",
        "Unlimited snacks & cuddle sessions 🍫",
        "Never go to sleep upset! 🛋️",
      ],
      reaction: "This hereby becomes our official law! 📜✨",
    },
  ];

  // Sound handler wrapper
  const triggerSound = (type: 'pop' | 'chime' | 'fanfare') => {
    if (!settings.soundEnabled) return;
    if (type === 'pop') playPopSound();
    if (type === 'chime') playSuccessChime();
    if (type === 'fanfare') playFanfareSound();
  };

  const handleStartSequence = () => {
    triggerSound('pop');
    setCurrentStep(1); // Goes to Manifesto page
  };

  const handleQuizAnswer = (questionText: string, optionText: string) => {
    triggerSound('pop');
    setAnswers((prev) => {
      const updated = [...prev];
      updated[quizIndex] = { question: questionText, answer: optionText };
      return updated;
    });

    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex((prev) => prev + 1);
    } else {
      // Transition to Main Proposal
      setCurrentStep(3);
    }
  };

  const handleGoBack = () => {
    triggerSound('pop');
    if (currentStep === 1) {
      // Back from Manifesto to Welcome
      setCurrentStep(0);
    } else if (currentStep === 2) {
      // Back in Quiz Questions
      if (quizIndex > 0) {
        setQuizIndex((prev) => prev - 1);
      } else {
        // From Question 1 back to Manifesto
        setCurrentStep(1);
      }
    } else if (currentStep === 3) {
      // From Main Proposal back to Question 3
      setQuizIndex(quizQuestions.length - 1);
      setCurrentStep(2);
    } else if (currentStep === 4) {
      // From Note/Confirmation back to Main Proposal
      setCurrentStep(3);
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
      answer: "YES! 👑💖",
      customNote: customMessage,
      girlfriendName: settings.girlfriendName,
      boyfriendName: settings.boyfriendName,
      recipientEmail: settings.recipientEmail,
      answersList: [
        ...answers,
        { question: "Selected Title for Him", answer: selectedNickname },
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
    <div className="relative min-h-screen bg-[#FFFBFB] flex flex-col justify-between items-center p-4 md:p-8 font-sans text-slate-800 overflow-x-hidden selection:bg-red-100 selection:text-red-900">
      {/* Decorative Artistic Background Elements */}
      <div className="absolute top-[-50px] right-[-50px] w-96 h-96 bg-[#FFE4E6] rounded-full blur-[100px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#FFF1F2] rounded-full blur-[120px] opacity-70 pointer-events-none" />
      <div className="absolute top-[20%] left-[5%] text-[140px] md:text-[180px] text-red-500 opacity-[0.03] select-none pointer-events-none font-bold font-serif leading-none">
        ROMANCE
      </div>

      {/* Artistic Accent Lines */}
      <div className="hidden lg:block absolute left-12 top-1/2 -translate-y-1/2 w-px h-64 bg-gradient-to-b from-transparent via-red-200 to-transparent pointer-events-none z-10" />
      <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 w-px h-64 bg-gradient-to-b from-transparent via-red-200 to-transparent pointer-events-none z-10" />

      {/* Artistic Sidebar Text */}
      <div className="hidden xl:flex absolute right-6 top-1/2 -translate-y-1/2 flex-col items-center gap-12 pointer-events-none z-10">
        <div className="w-px h-20 bg-red-100" />
        <span className="rotate-90 text-[10px] font-sans uppercase tracking-[0.8em] text-gray-300 whitespace-nowrap">
          ESTABLISHED 2026
        </span>
        <div className="w-px h-20 bg-red-100" />
      </div>

      {/* Floating Canvas Background Animation */}
      <HeartAnimation triggerBurst={triggerConfetti} />

      {/* Top Navigation / Progress Header */}
      <header className="relative z-20 w-full max-w-4xl flex items-center justify-between py-3 px-6 rounded-2xl bg-white/70 backdrop-blur-md border border-red-100 shadow-sm">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white shadow-sm">
              <Crown className="w-3.5 h-3.5 fill-white/20" />
            </div>
            <span className="font-serif font-semibold text-sm md:text-base text-gray-900 tracking-tight">
              Can I Be Your King?
            </span>
          </div>
          <div className="h-[1px] w-20 bg-red-200 mt-1" />
        </div>

        <div className="flex items-center space-x-4">
          {/* Sequence Step Indicator */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-sans text-red-500 font-medium italic">
              Sequence 0{Math.min(currentStep + 1, 5)} of 05
            </span>
            <div className="flex gap-1.5 mt-1">
              {[0, 1, 2, 3, 4].map((step) => (
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
              <span className="hidden sm:inline">Settings / Live Alert Feed</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Interactive Stage Container */}
      <main className="relative z-10 w-full max-w-xl mx-auto my-auto py-8">
        <AnimatePresence mode="wait">
          {/* STEP 0: Welcome Special Invitation */}
          {currentStep === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-red-100 shadow-2xl shadow-red-100/50 text-center space-y-6"
            >
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-red-200 ring-8 ring-red-50">
                  <Heart className="w-10 h-10 fill-white/20 animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white">
                  Special Letter
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-[0.3em] font-sans font-semibold text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                  For {settings.girlfriendName} 💌
                </span>
                <h1 className="text-3xl md:text-5xl font-serif font-light text-gray-900 leading-tight">
                  A Letter From <br />
                  <span className="text-red-500 italic font-serif">{settings.boyfriendName}</span>
                </h1>
                <p className="text-sm md:text-base text-gray-500 font-sans leading-relaxed max-w-md mx-auto opacity-90">
                  I prepared a special sequence just for you, {settings.girlfriendName}. Answer a few cute questions to reveal what my heart wants to ask...
                </p>
              </div>

              <div className="pt-2">
                <button
                  id="start-proposal-journey-btn"
                  onClick={handleStartSequence}
                  className="w-full py-4 px-8 rounded-full bg-red-500 hover:bg-red-600 text-white font-sans font-bold text-base md:text-lg tracking-wider shadow-xl shadow-red-200/60 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-3 cursor-pointer group"
                >
                  <Sparkles className="w-5 h-5 text-yellow-200 group-hover:rotate-12 transition-transform" />
                  <span>OPEN SPECIAL LETTER</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 1: WHY SHOULD YOU CHOOSE ME? MANIFESTO PAGE */}
          {currentStep === 1 && (
            <motion.div
              key="step1-manifesto"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-red-100 shadow-2xl shadow-red-100/50 space-y-6"
            >
              <div className="flex items-center justify-between w-full pb-2 border-b border-red-100/60">
                <button
                  id="manifesto-back-btn"
                  type="button"
                  onClick={handleGoBack}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-sans font-semibold transition-all cursor-pointer hover:-translate-x-0.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-semibold text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                  My Promises To You ✨
                </span>
              </div>

              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 text-red-500 mx-auto ring-8 ring-red-50/50 shadow-sm">
                  <Sparkles className="w-7 h-7 fill-red-500/10 text-red-500" />
                </div>
                <h2 className="text-2xl md:text-4xl font-serif font-light text-gray-900 pt-1">
                  Why Should You Choose <span className="text-red-500 italic font-serif">Me</span>, {settings.girlfriendName}?
                </h2>
                <p className="text-xs md:text-sm text-gray-500 font-sans max-w-md mx-auto">
                  Here are 6 solemn pledges straight from my heart:
                </p>
              </div>

              {/* 6 Reasons Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {[
                  { num: "01", text: "I will care for you as the Lord mandates", icon: "🙏" },
                  { num: "02", text: "I will buy you all the shawarma you will ever want", icon: "🌯" },
                  { num: "03", text: "I won't stress you.", icon: "😌" },
                  { num: "04", text: "I will be your number 1 Hype Man", icon: "💖" },
                  { num: "05", text: "We will become theology Buddies", icon: "📖" },
                  { num: "06", text: "I won't be boring.", icon: "✨" },
                ].map((item) => (
                  <div
                    key={item.num}
                    className="p-3.5 rounded-2xl bg-red-50/40 border border-red-100/80 flex items-start space-x-3 transition-all hover:bg-red-50/80 hover:border-red-200 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white font-serif font-bold text-xs flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      {item.num}
                    </div>
                    <div className="flex-1 text-left pt-0.5">
                      <p className="text-xs md:text-sm font-sans font-medium text-gray-800 leading-snug">
                        {item.text} <span className="inline-block ml-1">{item.icon}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Proceed to Quiz Questions Button */}
              <div className="pt-2">
                <button
                  id="proceed-to-quiz-btn"
                  onClick={() => {
                    triggerSound('pop');
                    setQuizIndex(0);
                    setCurrentStep(2);
                  }}
                  className="w-full py-4 px-8 rounded-full bg-red-500 hover:bg-red-600 text-white font-sans font-bold text-sm md:text-base tracking-wider shadow-xl shadow-red-200/60 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-3 cursor-pointer group"
                >
                  <Sparkles className="w-5 h-5 text-yellow-200 group-hover:rotate-12 transition-transform" />
                  <span>CONTINUE TO CUTE QUIZ</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Love Quiz Questions */}
          {currentStep === 2 && (
            <motion.div
              key={`quiz-${quizIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-red-100 shadow-2xl shadow-red-100/50 space-y-6"
            >
              {/* Progress Indicator */}
              <div className="flex items-center justify-between text-xs font-semibold text-red-500 uppercase tracking-widest border-b border-red-100 pb-3">
                <button
                  id="quiz-back-btn"
                  type="button"
                  onClick={handleGoBack}
                  className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-sans font-semibold transition-all cursor-pointer normal-case tracking-normal hover:-translate-x-0.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <div className="flex items-center space-x-1.5">
                  <Star className="w-4 h-4 fill-red-500 text-red-500" />
                  <span>CUTE QUIZ</span>
                </div>

                <span>QUESTION {quizIndex + 1}/{quizQuestions.length}</span>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-serif font-normal text-gray-900 leading-snug">
                  {quizQuestions[quizIndex].question}
                </h2>
                <p className="text-xs text-gray-400 font-sans tracking-wide">Pick your honest answer below 😉</p>
              </div>

              {/* Options Grid */}
              <div className="space-y-3 pt-2">
                {quizQuestions[quizIndex].options.map((option, idx) => {
                  const isPreviouslySelected = answers[quizIndex]?.answer === option;
                  return (
                    <button
                      id={`quiz-option-${idx}-btn`}
                      key={idx}
                      onClick={() =>
                        handleQuizAnswer(quizQuestions[quizIndex].question, option)
                      }
                      className={`w-full py-4 px-6 text-left rounded-2xl font-sans font-medium text-sm md:text-base border transition-all flex items-center justify-between group cursor-pointer shadow-xs hover:shadow-md ${
                        isPreviouslySelected
                          ? 'bg-red-100/90 border-red-400 text-red-900 font-semibold ring-2 ring-red-300'
                          : 'bg-red-50/50 hover:bg-red-100/80 text-gray-800 border-red-100 hover:border-red-300'
                      }`}
                    >
                      <span>{option}</span>
                      <Heart className={`w-4 h-4 ${isPreviouslySelected ? 'text-red-600 fill-red-500' : 'text-red-400 group-hover:text-red-600 group-hover:scale-110'} transition-transform shrink-0 ml-2`} />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 3: THE MAIN PROPOSAL ("Can I be your king?") */}
          {currentStep === 3 && (
            <motion.div
              key="step3-main"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="bg-white/95 backdrop-blur-2xl rounded-3xl p-8 md:p-12 border border-red-200 shadow-2xl shadow-red-200/40 text-center space-y-8 relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-400 via-rose-500 to-red-400" />

              <div className="flex items-center justify-start w-full">
                <button
                  id="proposal-back-btn"
                  type="button"
                  onClick={handleGoBack}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-sans font-semibold transition-all cursor-pointer hover:-translate-x-0.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Questions</span>
                </button>
              </div>

              {/* Artistic Main Heart Visual */}
              <div className="relative inline-block mt-2">
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto ring-8 ring-red-50/50">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.03L12 21.35Z" fill="#EF4444"/>
                  </svg>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-gray-400 font-sans text-xs uppercase tracking-[0.3em]">
                  The heart wants what it wants
                </h2>

                <h1 className="text-4xl md:text-7xl text-gray-900 leading-[0.95] font-serif font-light tracking-tight">
                  Can I be <br />
                  your <span className="text-red-500 italic font-serif">king</span>?
                </h1>

                <p className="text-gray-500 font-sans text-sm md:text-base max-w-md mx-auto leading-relaxed opacity-90">
                  {settings.customProposalSubtitle}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 min-h-[120px]">
                {/* YES BUTTON */}
                <button
                  id="main-proposal-yes-btn"
                  onClick={handleMainProposalYes}
                  className="group relative w-full sm:w-auto"
                >
                  <div className="absolute -inset-2 bg-red-200 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative px-10 py-5 bg-red-500 hover:bg-red-600 text-white font-sans font-bold text-lg rounded-full tracking-widest shadow-xl shadow-red-200/60 transition-all transform group-hover:scale-105 flex items-center justify-center space-x-3 cursor-pointer">
                    <Heart className="w-5 h-5 fill-white text-white group-hover:scale-125 transition-transform" />
                    <span>YES, ALWAYS! 💖</span>
                  </div>
                </button>

                {/* EVASIVE NO BUTTON */}
                <EvasiveButton />
              </div>

              <p className="text-xs text-gray-400 font-sans italic">
                (Psst... Hint: The "No" button is very shy and will run away! 😉)
              </p>
            </motion.div>
          )}

          {/* STEP 4: Seal Your Love Note & Direct Email Confirmation */}
          {currentStep === 4 && (
            <motion.div
              key="step4-note"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              className="bg-white/95 backdrop-blur-2xl rounded-3xl p-8 md:p-10 border border-red-100 shadow-2xl shadow-red-100/50 space-y-6"
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
                <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto ring-4 ring-red-50/50">
                  <MessageSquareHeart className="w-7 h-7" />
                </div>
                <h2 className="text-3xl font-serif font-light text-gray-900">
                  SHE SAID <span className="text-red-500 italic font-serif">YES!</span> 🎉
                </h2>
                <p className="text-xs md:text-sm text-gray-500 font-sans">
                  Choose a title for {settings.boyfriendName} and leave a personal note before notifying him!
                </p>
              </div>

              <form onSubmit={handleFinalSubmit} className="space-y-5">
                {/* Nickname Selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 font-sans">
                    Pick a title for your King:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["My King 👑", "Handsome Prince 🤴", "My Forever ❤️"].map((nick) => (
                      <button
                        type="button"
                        key={nick}
                        onClick={() => setSelectedNickname(nick)}
                        className={`py-2.5 px-3 rounded-full text-xs font-medium border transition-all cursor-pointer font-sans ${
                          selectedNickname === nick
                            ? "bg-red-500 text-white border-red-600 shadow-md shadow-red-100"
                            : "bg-red-50/40 text-gray-700 border-red-100 hover:bg-red-50"
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
                    Send him a personal note or favorite date idea:
                  </label>
                  <textarea
                    rows={3}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="e.g. 'I can't wait for our next date! Take me for ice cream! ❤️'"
                    className="w-full p-4 rounded-2xl border border-red-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-sm text-gray-800 outline-none transition-all font-sans"
                  />
                </div>

                {/* Direct Email Target Info */}
                <div className="p-3.5 bg-red-50/70 rounded-2xl border border-red-200/80 flex items-center space-x-2 text-xs text-red-900 font-sans">
                  <ShieldCheck className="w-4 h-4 text-red-600 shrink-0" />
                  <span>
                    Your confirmation will trigger an alert sent directly to <strong>{settings.recipientEmail}</strong>!
                  </span>
                </div>

                <button
                  id="seal-and-send-royal-response-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-full bg-red-500 hover:bg-red-600 text-white font-sans font-bold text-base tracking-wider shadow-xl shadow-red-200/60 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCcw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  <span>
                    {isSubmitting
                      ? "Dispatching Email Alert..."
                      : `SEAL & SEND MY RESPONSE`}
                  </span>
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 5: Celebration & Royal Decree Certificate */}
          {currentStep === 5 && (
            <motion.div
              key="step5-certificate"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <RoyalDecreeCertificate
                girlfriendName={settings.girlfriendName}
                boyfriendName={settings.boyfriendName}
                timestamp={finalResponseRecord?.timestamp || new Date().toISOString()}
                customNote={customMessage || finalResponseRecord?.customNote}
              />

              <div className="text-center pt-2">
                <button
                  id="restart-journey-btn"
                  onClick={() => {
                    setCurrentStep(0);
                    setQuizIndex(0);
                    setAnswers([]);
                    setTriggerConfetti(false);
                  }}
                  className="inline-flex items-center space-x-2 text-xs font-semibold text-red-500 uppercase tracking-widest hover:text-red-700 transition-colors cursor-pointer"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span>Replay Royal Journey</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info / Meta matching Artistic Theme */}
      <footer className="relative z-20 w-full max-w-4xl flex justify-between items-center py-4 text-xs font-sans text-gray-400 border-t border-red-100/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-red-200 flex items-center justify-center text-red-400 text-[10px] font-bold">
            04
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-gray-400">System Status</span>
            <span className="text-[11px] font-semibold text-gray-700 uppercase tracking-wider">Email Alert Linked</span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-gray-400">
            Designed with affection <br />
            for {settings.girlfriendName} & {settings.boyfriendName}
          </p>
        </div>
      </footer>

      {/* King's Settings & Responses Panel Modal */}
      <CreatorPanel
        isOpen={showCreatorPanel}
        onClose={() => setShowCreatorPanel(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />
    </div>
  );
}
