import React, { useState } from 'react';
import { motion } from 'motion/react';
import { playEvasiveWhoosh } from '../utils/audio';

interface EvasiveButtonProps {
  onAttemptClick?: () => void;
  disabled?: boolean;
}

const EVASIVE_LABELS = [
  "Reject Application ❌",
  "Are you sure, Queen? 💔",
  "Re-read Resume first! 📜",
  "Applicant is 100% qualified! 👑",
  "Approve is the right button! 💕",
  "Candidate offers infinite hugs! 🤗",
  "Can't reject this King! 🏃‍♀️",
  "Application approval inevitable! 😘",
  "Try clicking APPROVE instead! ✨",
];

export const EvasiveButton: React.FC<EvasiveButtonProps> = ({ onAttemptClick, disabled }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [attemptCount, setAttemptCount] = useState(0);

  const moveButton = () => {
    if (disabled) return;
    playEvasiveWhoosh();

    // Calculate a random offset within bounds (-140 to 140 px X, -80 to 80 px Y)
    const randomX = (Math.random() - 0.5) * 280;
    const randomY = (Math.random() - 0.5) * 160;

    setPosition({ x: randomX, y: randomY });
    setAttemptCount((prev) => prev + 1);

    if (onAttemptClick) {
      onAttemptClick();
    }
  };

  const currentLabel = EVASIVE_LABELS[attemptCount % EVASIVE_LABELS.length];

  return (
    <motion.button
      id="evasive-no-button"
      type="button"
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      onMouseEnter={moveButton}
      onTouchStart={(e) => {
        e.preventDefault();
        moveButton();
      }}
      onClick={moveButton}
      className="px-6 py-3 rounded-full text-slate-600 bg-slate-200/80 hover:bg-slate-300 font-medium shadow-sm transition-colors text-sm md:text-base cursor-pointer select-none border border-slate-300/60"
    >
      {currentLabel}
    </motion.button>
  );
};
