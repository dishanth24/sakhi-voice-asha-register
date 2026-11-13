import React from 'react';
import { useAppStore } from '../store/appStore';
import { Radio } from 'lucide-react';

export default function SpeechProviderChip() {
  const provider = useAppStore((s) => s.speechProvider);

  const labels = {
    browser: 'Browser Speech (Demo)',
    gnani: 'Gnani Prisma v3.0',
    text: 'Text Mode'
  };

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300">
      <Radio className="w-3 h-3 text-teal-600 animate-pulse" />
      <span>{labels[provider] || provider}</span>
    </div>
  );
}
