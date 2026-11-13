import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useSpeech } from '../hooks/useSpeech';
import { useAppStore } from '../store/appStore';
import AIBadge from '../components/AIBadge';
import LanguageToggle from '../components/LanguageToggle';
import SpeechProviderChip from '../components/SpeechProviderChip';
import MicButton from '../components/MicButton';
import Waveform from '../components/Waveform';
import { Activity, Users, Clock, AlertTriangle, ArrowRight, Volume2 } from 'lucide-react';

export default function Home() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const { speak } = useSpeech();
  const visits = useAppStore((s) => s.visits);
  const setVisits = useAppStore((s) => s.setVisits);
  const followUps = useAppStore((s) => s.followUps);
  const setFollowUps = useAppStore((s) => s.setFollowUps);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Sync with database on mount
    fetch('/api/visits')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setVisits(data); })
      .catch(() => {});

    fetch('/api/followups')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setFollowUps(data); })
      .catch(() => {});
  }, []);

  // Today's summary stats
  const visitsDone = visits.length;
  const followUpsDue = followUps.filter(f => !f.completed).length;
  const referralsCount = visits.filter(v => v.flagged).length;

  const exampleSentences = [
    { text: t('first_run_1'), voice: language === 'hi' ? "सुनीता देवी का ANC चेकअप, वजन बावन किलो" : "Sunita Devi ANC checkup, weight 52 kilo" },
    { text: t('first_run_2'), voice: language === 'hi' ? "नवजात शिशु, वजन ढाई किलो, बीसीजी दी" : "Newborn baby, weight 2.5 kilo, gave BCG" },
    { text: t('first_run_3'), voice: language === 'hi' ? "मीना को खून आ रहा है, जल्दी पीएचसी भेजो" : "Meena has bleeding, refer to PHC immediately" }
  ];

  const handleStartVisit = () => {
    navigate('/visit');
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-24">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <AIBadge />
          <SpeechProviderChip />
        </div>
        <LanguageToggle />
      </div>

      {/* Synthetic data banner */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl px-3.5 py-2 text-xs font-medium text-amber-800 dark:text-amber-300 flex items-center justify-between mb-5 shadow-2xs">
        <span>🛡️ {t('demo_data_banner')}</span>
        <span className="text-[10px] bg-amber-200/60 dark:bg-amber-800/60 px-1.5 py-0.5 rounded font-mono">15 SEED RECORDS</span>
      </div>

      {/* Greeting card */}
      <div className="bg-gradient-to-br from-teal-800 to-teal-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden mb-6">
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-teal-200 text-xs font-bold uppercase tracking-wider">Gnani Voice Hackathon</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mt-1 tracking-tight">
            {t('app_name')}
          </h1>
          <p className="text-teal-300 text-xs font-bold uppercase tracking-wider mt-0.5">
            {t('app_subtitle')}
          </p>
          <p className="text-white font-medium text-sm sm:text-base mt-2 tracking-wide">
            "{t('tagline')}"
          </p>
          <p className="text-teal-100 text-xs mt-2 leading-relaxed opacity-90">
            {t('greeting')}
          </p>

          <button
            onClick={handleStartVisit}
            className="mt-5 inline-flex items-center gap-2 bg-white text-teal-900 px-5 py-3 rounded-2xl font-bold text-sm shadow-lg hover:bg-teal-50 active:scale-95 transition-all"
          >
            <span>{t('start_visit')}</span>
            <ArrowRight className="w-4 h-4 text-teal-800" />
          </button>
        </div>
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-teal-600/30 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Today's Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs text-center">
          <Users className="w-5 h-5 mx-auto text-teal-600 dark:text-teal-400 mb-1" />
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">{visitsDone}</div>
          <div className="text-[11px] text-slate-500 font-medium">{t('visits_done')}</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs text-center">
          <Clock className="w-5 h-5 mx-auto text-amber-500 mb-1" />
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">{followUpsDue}</div>
          <div className="text-[11px] text-slate-500 font-medium">{t('follow_ups_due')}</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs text-center">
          <AlertTriangle className="w-5 h-5 mx-auto text-red-500 mb-1" />
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">{referralsCount}</div>
          <div className="text-[11px] text-slate-500 font-medium">{t('referrals_count')}</div>
        </div>
      </div>

      {/* First Run / Spoken Examples */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
          {language === 'hi' ? 'बोलने के उदाहरण (टैप करें सुनने के लिए)' : 'Sample Phrases (Tap to hear & try)'}
        </h2>
        <div className="space-y-2">
          {exampleSentences.map((s, idx) => (
            <div
              key={idx}
              onClick={() => {
                speak(s.voice);
              }}
              className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:border-teal-400 cursor-pointer shadow-2xs active:scale-[0.99] transition-all"
            >
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200 pr-2">{s.text}</span>
              <Volume2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Huge Mic Button in Thumb Zone */}
      <div className="mt-8 flex flex-col items-center justify-center">
        <Waveform active={isListening} />
        <div className="mt-3">
          <MicButton
            size="large"
            isListening={isListening}
            onClick={handleStartVisit}
          />
        </div>
        <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-tight">
          {t('tap_to_speak')}
        </p>
      </div>
    </div>
  );
}
