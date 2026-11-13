import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { ShieldCheck, CheckCircle2, Lock, Eye, AlertOctagon, Key, Database } from 'lucide-react';

export default function Compliance() {
  const { t } = useTranslation();

  const rules = [
    {
      title: 'AI Disclosure on First Turn',
      status: 'Enforced',
      desc: 'The agent explicitly identifies itself as an AI assistant on the very first turn in both Hindi & English with a persistent screen badge.',
      icon: Eye
    },
    {
      title: 'Zero Real PII / Synthetic Beneficiaries Only',
      status: 'Enforced',
      desc: 'Pre-seeded with 15 synthetic mock beneficiaries. Banner clearly warns users that all names, IDs and data are simulated.',
      icon: Database
    },
    {
      title: 'Strict Prohibition on Diagnosis & Medical Advice',
      status: 'Enforced',
      desc: 'Fixed refusal text triggered if medical advice is requested. No drug dosages or medical recommendations are generated.',
      icon: AlertOctagon
    },
    {
      title: 'AES-256-GCM Encryption at Rest',
      status: 'Enforced',
      desc: 'All sensitive SQLite records are encrypted with random 12-byte IVs and authenticated tags using environment key.',
      icon: Lock
    },
    {
      title: 'One-Tap Data Deletion & Wipe',
      status: 'Enforced',
      desc: 'Zero-trace wipe available in Settings UI and via npm run wipe command on the backend.',
      icon: ShieldCheck
    },
    {
      title: 'Secrets & API Keys in .env Only',
      status: 'Enforced',
      desc: '.gitignore strictly hides .env and SQLite databases. Fully runnable with zero paid API keys today.',
      icon: Key
    }
  ];

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-28">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <span>{t('compliance')}</span>
          <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">100% AUDITED</span>
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">Responsible AI, Clinical Safety & Data Security Checklist</p>
      </div>

      <div className="space-y-3">
        {rules.map((rule, idx) => {
          const Icon = rule.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-start gap-3.5"
            >
              <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{rule.title}</h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{rule.status}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rule.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
