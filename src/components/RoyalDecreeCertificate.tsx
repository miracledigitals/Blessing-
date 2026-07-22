import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart, Crown, CheckCircle2, Share2, Copy } from 'lucide-react';

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
    const text = `👑 OFFICIAL ROYAL DECREE 💖\n${girlfriendName} said YES to ${boyfriendName}! "Can I be your king?" proposal accepted on ${new Date(timestamp).toLocaleDateString()}! ✨❤️`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
      className="relative max-w-lg w-full mx-auto bg-white/95 backdrop-blur-2xl rounded-3xl p-8 md:p-10 border border-red-200 shadow-2xl shadow-red-100/60 overflow-hidden text-center text-slate-800"
    >
      {/* Red Ribbon & Glow */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-400 via-rose-500 to-red-400" />
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-100/50 rounded-full blur-2xl pointer-events-none" />

      {/* Royal Crown Header */}
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500 text-white shadow-lg shadow-red-200 mb-4 ring-8 ring-red-50">
        <Crown className="w-8 h-8 fill-white/20" />
      </div>

      <div className="space-y-1 mb-6 font-sans">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">
          Official Royal Decree of Love
        </span>
        <h2 className="text-3xl md:text-4xl font-serif font-light text-gray-900 pt-2">
          Forever & <span className="text-red-500 italic font-serif">Always</span>
        </h2>
        <div className="w-16 h-0.5 bg-red-200 mx-auto mt-2" />
      </div>

      {/* Certificate Body */}
      <div className="bg-red-50/40 rounded-2xl p-6 border border-red-100 shadow-inner space-y-4 text-slate-700 font-sans">
        <p className="text-sm md:text-base leading-relaxed">
          Be it known throughout the realm that on this day,{' '}
          <strong className="text-red-600 font-bold">{new Date(timestamp).toLocaleDateString()}</strong>:
        </p>

        <div className="py-4 px-4 bg-white/80 rounded-xl border border-red-100 text-center space-y-1 shadow-xs">
          <div className="text-xl md:text-2xl font-serif font-normal text-gray-900 flex items-center justify-center space-x-2">
            <span>{girlfriendName}</span>
            <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
            <span>{boyfriendName}</span>
          </div>
          <p className="text-xs text-red-600 font-semibold tracking-wide">
            {girlfriendName} is officially crowned My Queen in Love! 👑💖
          </p>
        </div>

        {customNote && (
          <div className="text-xs italic text-gray-600 bg-white/60 p-3 rounded-lg border border-red-100">
            "{customNote}"
          </div>
        )}

        <div className="pt-2 text-xs text-red-800 flex items-center justify-center space-x-1 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Email Alert Dispatched & Recorded in Royal Archives!</span>
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
