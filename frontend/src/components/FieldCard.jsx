import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Edit3 } from 'lucide-react';

export default function FieldCard({ label, value, previousValue = null, confidence = 0.9, isHighlighted = false, onEdit, unit = '' }) {
  const isLowConfidence = confidence < 0.7;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onEdit}
      className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
        isHighlighted
          ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/40 shadow-md'
          : isLowConfidence
          ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-400'
          : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 hover:border-teal-300'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-tight">
          {label}
        </span>
        
        {isLowConfidence && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
            <AlertCircle className="w-3 h-3" />
            <span>Check?</span>
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2 mt-1">
        <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate flex items-baseline gap-2">
          {/* Correction animation: old value struck through */}
          {previousValue !== null && previousValue !== undefined && previousValue !== value && (
            <motion.span
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0.4 }}
              className="line-through text-red-500/80 text-sm font-semibold"
            >
              {String(previousValue)} {unit}
            </motion.span>
          )}

          {/* New value sliding in */}
          {value !== undefined && value !== null && value !== '' ? (
            <motion.span
              key={String(value)}
              initial={previousValue !== null ? { x: 15, opacity: 0 } : false}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            >
              {String(value)} {unit && <span className="text-xs font-normal text-slate-500">{unit}</span>}
            </motion.span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 text-sm italic font-normal">—</span>
          )}
        </div>
        
        <Edit3 className="w-4 h-4 text-slate-400 hover:text-teal-600 transition-colors flex-shrink-0" />
      </div>
    </motion.div>
  );
}
