import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useSpeech } from '../hooks/useSpeech';
import { Play, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function JudgeDemo() {
  const { t } = useTranslation();
  const { speak } = useSpeech();
  const [step, setStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const demoScript = [
    { title: "1. Agent AI Disclosure", text: "Namaste, main Sakhi hoon, ek AI sahayak. Apni visit ke baare mein bataiye.", action: "Agent identifies itself as Sakhi, an AI assistant" },
    { title: "2. ASHA Spoken Dictation", text: "Sunita Devi, ID 4521, ANC checkup, wazan dhai kilo, blood bleeding ho rahi hai", action: "Streaming transcript converted into structured fields & danger sign flagged" },
    { title: "3. Danger Sign Interruption", text: "URGENT: Vaginal bleeding detected! Please refer to nearest PHC immediately.", action: "ESCALATING state fires with haptics and red banner" },
    { title: "4. Voice Correction", text: "No, weight is 52 kg", action: "Correction parser updates weight_kg from 2.5 to 52 kg" },
    { title: "5. One-Tap Save & Follow-Up", text: "Visit saved. Scheduled PHC referral follow-up for today.", action: "AES-256-GCM encrypted visit recorded in SQLite" }
  ];

  const runAutomatedDemo = async () => {
    setIsRunning(true);
    for (let i = 0; i < demoScript.length; i++) {
      setStep(i);
      speak(demoScript[i].text);
      await new Promise(r => setTimeout(r, 4500));
    }
    setIsRunning(false);
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-28">
      <div className="flex items-center justify-between gap-2 mb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {t('judge_demo')}
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">60-second scripted walkthrough (runs with or without mic)</p>
        </div>

        <button
          onClick={runAutomatedDemo}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs shadow-md active:scale-95 disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isRunning ? 'Running Script...' : 'Start 60s Demo'}</span>
        </button>
      </div>

      <div className="space-y-3">
        {demoScript.map((item, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border transition-all ${
              step === idx && isRunning
                ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 ring-2 ring-teal-500/30'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>{item.title}</span>
              {step > idx && isRunning && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
            </div>

            <div className="text-sm font-semibold text-teal-800 dark:text-teal-300 italic mt-1">
              "{item.text}"
            </div>

            <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span>{item.action}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
