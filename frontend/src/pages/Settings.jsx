import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAppStore } from '../store/appStore';
import { NoiseSimulator } from '../speech/NoiseSimulator';
import { Trash2, AlertCircle, VolumeX } from 'lucide-react';

let noiseSimInstance = null;

export default function Settings() {
  const { t, language } = useTranslation();
  const {
    speechProvider,
    setSpeechProvider,
    settings,
    updateSetting,
    setLanguage,
    clearAll
  } = useAppStore();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [noiseActive, setNoiseActive] = useState(false);

  const toggleNoise = () => {
    if (!noiseSimInstance) noiseSimInstance = new NoiseSimulator();
    if (noiseActive) {
      noiseSimInstance.stop();
      setNoiseActive(false);
    } else {
      noiseSimInstance.start();
      setNoiseActive(true);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await fetch('/api/data', { method: 'DELETE' });
      clearAll();
      setConfirmDelete(false);
      alert('All local and encrypted database records successfully wiped.');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-28">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {t('settings')}
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">Customizations, hardware modes & privacy controls</p>
      </div>

      <div className="space-y-4">
        {/* Language Selection */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            {t('language')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setLanguage('hi')}
              className={`py-3 rounded-xl font-bold text-sm transition-all ${
                language === 'hi'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              हिंदी (Hindi)
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`py-3 rounded-xl font-bold text-sm transition-all ${
                language === 'en'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Speech Provider Selection */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            {t('speech_provider')}
          </label>
          <div className="space-y-2">
            {[
              { id: 'browser', title: t('browser_speech'), desc: 'Web Speech API continuous recognition' },
              { id: 'gnani', title: t('gnani_speech'), desc: 'Prisma v3.0 WebSocket streaming (ready for API key)' },
              { id: 'text', title: t('text_mode'), desc: 'Type-only input mode (zero microphone required)' }
            ].map(p => (
              <div
                key={p.id}
                onClick={() => setSpeechProvider(p.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  speechProvider === p.id
                    ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/40'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-sm text-slate-900 dark:text-white">{p.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Audio Noise Simulator */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">{t('noise_sim')}</div>
              <div className="text-xs text-slate-500 mt-0.5 max-w-[260px]">{t('noise_sim_desc')}</div>
            </div>
            <button
              onClick={toggleNoise}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                noiseActive
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {noiseActive ? 'Active (Street Sound)' : 'Start Noise'}
            </button>
          </div>
        </div>

        {/* Endpointing Slider */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-sm text-slate-900 dark:text-white">{t('endpointing')}</span>
            <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
              {settings.endpointingTime}s
            </span>
          </div>
          <div className="text-xs text-slate-500 mb-3">{t('endpointing_desc')}</div>
          <input
            type="range"
            min="0.6"
            max="3.0"
            step="0.1"
            value={settings.endpointingTime}
            onChange={(e) => updateSetting('endpointingTime', parseFloat(e.target.value))}
            className="w-full accent-teal-700 cursor-pointer"
          />
        </div>

        {/* Accessibility & Visual toggles */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-slate-900 dark:text-white">{t('high_contrast')}</span>
            <input
              type="checkbox"
              checked={settings.highContrast}
              onChange={(e) => updateSetting('highContrast', e.target.checked)}
              className="w-5 h-5 accent-teal-700"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-slate-900 dark:text-white">{t('dark_mode')}</span>
            <input
              type="checkbox"
              checked={settings.darkMode}
              onChange={(e) => updateSetting('darkMode', e.target.checked)}
              className="w-5 h-5 accent-teal-700"
            />
          </div>
        </div>

        {/* Wipe Data (Compliance / Privacy) */}
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 shadow-2xs">
          <div className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
            Responsible AI & Data Privacy
          </div>
          <p className="text-xs text-red-700 dark:text-red-300 mb-3 leading-relaxed">
            {t('delete_confirm')}
          </p>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('delete_all')}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDeleteAll}
                className="px-4 py-2.5 rounded-xl bg-red-700 text-white font-bold text-xs shadow-sm"
              >
                Yes, permanently delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
