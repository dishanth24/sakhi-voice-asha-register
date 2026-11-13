import React from 'react';
import { useAppStore } from '../store/appStore';
import { Languages } from 'lucide-react';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useAppStore();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 active:scale-95 transition-all"
    >
      <Languages className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
      <span>{language === 'hi' ? 'हिंदी' : 'English'}</span>
    </button>
  );
}
