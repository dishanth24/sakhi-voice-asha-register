import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Square } from 'lucide-react';

export default function MicButton({ isListening, onClick, disabled = false, size = 'large' }) {
  const isLarge = size === 'large';
  const btnSize = isLarge ? 'w-24 h-24' : 'w-16 h-16';
  const iconSize = isLarge ? 'w-10 h-10' : 'w-7 h-7';

  return (
    <div className="relative flex items-center justify-center">
      {/* Animated pulsing outer ring when listening */}
      {isListening && (
        <>
          <motion.div
            initial={{ scale: 0.9, opacity: 0.8 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeOut' }}
            className={`absolute ${btnSize} rounded-full bg-teal-500/30 dark:bg-teal-400/20 pointer-events-none`}
          />
          <motion.div
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.4, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.6, delay: 0.4, ease: 'easeOut' }}
            className={`absolute ${btnSize} rounded-full bg-teal-600/20 dark:bg-teal-500/20 pointer-events-none`}
          />
        </>
      )}

      {/* Main thumb-zone button (min target 56px, large is 96px) */}
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label={isListening ? 'Stop recording' : 'Start voice recording'}
        className={`relative z-10 flex items-center justify-center ${btnSize} rounded-full shadow-xl transition-all duration-300 active:scale-95 ${
          isListening
            ? 'bg-rose-600 text-white shadow-rose-600/40 animate-pulse'
            : 'bg-teal-700 hover:bg-teal-600 text-white shadow-teal-700/35 hover:shadow-teal-700/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {isListening ? (
          <Square className={`${iconSize} fill-current`} />
        ) : (
          <Mic className={iconSize} />
        )}
      </button>
    </div>
  );
}
