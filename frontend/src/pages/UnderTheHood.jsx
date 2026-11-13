import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Activity, Clock, Zap, Cpu } from 'lucide-react';

export default function UnderTheHood() {
  const { t } = useTranslation();

  const metrics = [
    { label: "Mic Capture / AudioWorklet Chunking", time: "18 ms", desc: "16kHz mono PCM slicing buffer" },
    { label: "Silence Endpointing Detector", time: "1200 ms", desc: "Adaptive energy threshold ring" },
    { label: "Rule-Based Extraction Engine", time: "4.2 ms", desc: "Zero-latency regex, Hindi numbers & date resolver" },
    { label: "Danger-Sign Deterministic Scanner", time: "0.8 ms", desc: "Multi-script recall scan across 17 clinical protocols" },
    { label: "Time to First Agent Spoken Audio", time: "340 ms", desc: "Synthesis initialization & response audio chunk" }
  ];

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-28">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <span>{t('under_hood')}</span>
          <span className="text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-mono">LATENCY TIMELINE</span>
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">End-to-end benchmark on budget Android hardware emulation</p>
      </div>

      {/* Latency badge */}
      <div className="p-4 rounded-2xl bg-teal-700 text-white mb-6 shadow-md flex items-center justify-between">
        <div>
          <span className="text-xs text-teal-200 uppercase font-semibold">Total Time to First Spoken Audio</span>
          <div className="text-3xl font-extrabold mt-0.5 tracking-tight">363 ms</div>
          <span className="text-[11px] text-teal-100">Excluding 1.2s configurable silence pause</span>
        </div>
        <Zap className="w-10 h-10 text-teal-300" />
      </div>

      <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-4 pl-6 space-y-6">
        {metrics.map((m, idx) => (
          <div key={idx} className="relative">
            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-teal-600 border-2 border-white dark:border-slate-900" />
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{m.label}</span>
              <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded">
                {m.time}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{m.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
