import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart, Crown, CheckCircle2, Share2, Copy } from 'lucide-react';
import { SunflowerIcon } from './SunflowerIcon';

interface RoyalDecreeCertificateProps {
  girlfriendName: string;
  boyfriendName: string;
  timestamp: string;
  customNote?: string;
}

export const RoyalDecreeCertificate: React.FC<RoyalDecreeCertificateProps> = ({
  girlfriendName,
  boyfriendName,
  timestamp,
  customNote,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyShare = () => {
    const text = `👑 OFFICIAL CERTIFICATE OF ROYAL APPOINTMENT 💖 🌻\nQueen ${girlfriendName} has officially APPROVED the application of ${boyfriendName} to serve as King of Her Heart! Application accepted on ${new Date(timestamp).toLocaleDateString()}! ✨👑🌻`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
      className="relative max-w-lg w-full mx-auto bg-white/95 backdrop-blur-2xl rounded-3xl p-8 md:p-10 border border-amber-200 shadow-2xl shadow-red-100/60 overflow-hidden text-center text-slate-800"
    >
      {/* Red & Gold Ribbon & Glow */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-rose-500 to-amber-400" />
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-100/60 rounded-full blur-2xl pointer-events-none" />

      {/* Decorative Sunflowers on corners */}
      <div className="absolute top-4 left-4 text-amber-500/80 pointer-events-none">
        <SunflowerIcon className="w-7 h-7" />
      </div>
      <div className="absolute top-4 right-4 text-amber-500/80 pointer-events-none">
        <SunflowerIcon className="w-7 h-7" />
      </div>

      {/* Royal Crown Header */}
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-amber-500 text-white shadow-lg shadow-red-200 mb-4 ring-8 ring-amber-50">
        <Crown className="w-8 h-8 fill-white/20" />
      </div>

      <div className="space-y-1 mb-6 font-sans">
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-red-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          <span>Official Certificate of Appointment</span>
          <SunflowerIcon className="w-3.5 h-3.5" />
        </span>
        <h2 className="text-3xl md:text-4xl font-serif font-light text-gray-900 pt-2">
          Royal Decree of <span className="text-red-500 italic font-serif">Kinghood</span>
        </h2>
        <div className="w-20 h-0.5 bg-gradient-to-r from-amber-300 via-red-300 to-amber-300 mx-auto mt-2" />
      </div>

      {/* Certificate Body */}
      <div className="bg-gradient-to-b from-amber-50/40 to-red-50/30 rounded-2xl p-6 border border-amber-200/80 shadow-inner space-y-4 text-slate-700 font-sans">
        <div className="text-xs font-mono text-amber-800 bg-amber-100/60 py-1 px-3 rounded-full inline-block border border-amber-200">
          REGISTRATION REF: ROYAL-KING-APP-2026
        </div>

        <p className="text-sm md:text-base leading-relaxed">
          Be it proclaimed across the kingdom that on this day,{' '}
          <strong className="text-red-600 font-bold">{new Date(timestamp).toLocaleDateString()}</strong>:
        </p>

        <div className="py-4 px-4 bg-white/90 rounded-xl border border-amber-200 text-center space-y-2 shadow-xs">
          <div className="text-xl md:text-2xl font-serif font-normal text-gray-900 flex items-center justify-center space-x-2">
            <span>Queen {girlfriendName}</span>
            <Crown className="w-5 h-5 text-amber-500 fill-amber-400" />
            <span>King {boyfriendName}</span>
          </div>
          <p className="text-xs text-red-600 font-bold tracking-wide flex items-center justify-center gap-1">
            <span>APPLICATION APPROVED: {boyfriendName} is officially appointed as King of Her Heart!</span>
            <SunflowerIcon className="w-3.5 h-3.5" />
          </p>
        </div>

        {customNote && (
          <div className="text-xs italic text-gray-600 bg-white/60 p-3 rounded-lg border border-red-100">
            "{customNote}"
          </div>
        )}

        <div className="pt-2 text-xs text-red-800 flex items-center justify-center space-x-1 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Official Appointment Signed, Sealed & Logged in Royal Archives!</span>
        </div>
      </div>

      {/* Share / Copy Button */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          id="copy-royal-decree-btn"
          onClick={handleCopyShare}
          className="w-full sm:w-auto px-8 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-sans font-bold text-sm tracking-wider shadow-lg shadow-red-200 transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'COPIED LOVE ANNOUNCEMENT!' : 'COPY ANNOUNCEMENT'}</span>
        </button>
      </div>
    </motion.div>
  );
};
