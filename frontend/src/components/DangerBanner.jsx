import React from 'react';
import { AlertTriangle, PhoneCall, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export default function DangerBanner({ signs = [], onReferred = () => {} }) {
  const { t, language } = useTranslation();

  if (!signs || signs.length === 0) return null;

  return (
    <div className="w-full bg-red-600 text-white rounded-2xl p-4 sm:p-5 shadow-xl shadow-red-600/30 border border-red-500 animate-bounce-once mb-5">
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-xs flex-shrink-0">
          <AlertTriangle className="w-7 h-7 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-black/25 px-2 py-0.5 rounded-sm">
              {language === 'hi' ? 'खतरे का संकेत' : 'DANGER SIGN'}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold mt-1 leading-tight">
            {signs.map(s => language === 'hi' ? s.display_name_hi : s.display_name_en).join(', ')}
          </h3>

          <p className="text-sm text-red-50 mt-1 font-medium leading-snug">
            {language === 'hi' ? signs[0].referral_message_hi : signs[0].referral_message_en}
          </p>

          <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
            <button
              onClick={onReferred}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-red-700 font-bold text-sm shadow-md hover:bg-red-50 active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t('referred_confirm')}</span>
            </button>

            <a
              href="tel:108"
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-800/80 hover:bg-red-800 text-white text-xs font-semibold"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call 108 / 102</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
