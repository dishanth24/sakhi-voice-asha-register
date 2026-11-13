import React from 'react';
import { Bot } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export default function AIBadge() {
  const { t } = useTranslation();
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold shadow-xs">
      <Bot className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
      <span>{t('ai_badge')}</span>
    </div>
  );
}
