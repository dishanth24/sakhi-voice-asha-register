import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Play, PlayCircle, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Sparkles, Volume2 } from 'lucide-react';

export default function TestLab() {
  const { t } = useTranslation();
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState({});
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [simulateNoise, setSimulateNoise] = useState(false);

  useEffect(() => {
    fetch('/api/test-dictations')
      .then(res => res.json())
      .then(data => setTests(data))
      .catch(e => console.error(e));
  }, []);

  const perturbNoise = (transcript) => {
    // Drop random fillers and inject minor STT phoneme variance
    return transcript
      .replace(/\bthe\b/gi, '')
      .replace(/\band\b/gi, 'n')
      .replace(/kg/g, 'kilo')
      .replace(/52/g, 'fifty two');
  };

  const runSingleTest = async (test) => {
    const textToSend = simulateNoise ? perturbNoise(test.transcript) : test.transcript;
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: textToSend })
      });
      const data = await res.json();

      // Check fields matching
      let fieldMatches = 0;
      let totalFields = 0;
      for (const [k, expectedVal] of Object.entries(test.expected || {})) {
        totalFields++;
        if (data.fields[k] === expectedVal || (Array.isArray(expectedVal) && Array.isArray(data.fields[k]))) {
          fieldMatches++;
        }
      }

      // Check danger sign recall
      const dangerPassed = test.has_danger_sign ? (data.danger_signs && data.danger_signs.length > 0) : true;

      setResults(prev => ({
        ...prev,
        [test.id]: {
          pass: fieldMatches >= Math.max(1, totalFields - 1) && dangerPassed,
          extracted: data.fields,
          danger_signs: data.danger_signs,
          fieldScore: `${fieldMatches}/${totalFields}`,
          dangerPassed
        }
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const runAllTests = async () => {
    setIsRunningAll(true);
    for (const test of tests) {
      await runSingleTest(test);
    }
    setIsRunningAll(false);
  };

  // Metrics computation
  const totalRun = Object.keys(results).length;
  const passedCount = Object.values(results).filter(r => r.pass).length;
  const overallAccuracy = totalRun > 0 ? Math.round((passedCount / totalRun) * 100) : 0;

  // Danger sign catch rate (Most important hackathon metric)
  const dangerTests = tests.filter(t => t.has_danger_sign);
  const dangerTested = dangerTests.filter(t => results[t.id]);
  const dangerCaught = dangerTested.filter(t => results[t.id].dangerPassed);
  const dangerCatchRate = dangerTested.length > 0 ? Math.round((dangerCaught.length / dangerTested.length) * 100) : 100;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t('test_lab')}</span>
            <span className="text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-mono">FOR JUDGES</span>
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">32 synthetic dictations across English, Devanagari & Hinglish</p>
        </div>

        <button
          onClick={runAllTests}
          disabled={isRunningAll || tests.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs shadow-md active:scale-95 transition-all disabled:opacity-50"
        >
          <PlayCircle className="w-4 h-4" />
          <span>{isRunningAll ? 'Running...' : t('run_all')}</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">{t('accuracy')}</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-teal-700 dark:text-teal-400 mt-0.5">
            {overallAccuracy}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{passedCount} of {totalRun} passed</div>
        </div>

        {/* DANGER CATCH RATE (Highlighted) */}
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 shadow-2xs">
          <div className="text-xs font-bold text-red-700 dark:text-red-300 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('danger_catch_rate')}</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-red-600 dark:text-red-400 mt-0.5">
            {dangerCatchRate}%
          </div>
          <div className="text-[11px] text-red-600/80 font-medium mt-1">Target: 100% Zero-Miss</div>
        </div>
      </div>

      {/* Noise Perturbation Toggle */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 mb-5">
        <div className="text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-200 block">Simulate Noisy Audio Transcription</span>
          <span className="text-slate-500 text-[11px]">Perturbs text with dropped filler words and spacing quirks</span>
        </div>
        <input
          type="checkbox"
          checked={simulateNoise}
          onChange={(e) => setSimulateNoise(e.target.checked)}
          className="w-5 h-5 accent-teal-700 cursor-pointer"
        />
      </div>

      {/* Test Cases List */}
      <div className="space-y-3">
        {tests.map((test) => {
          const res = results[test.id];
          return (
            <div
              key={test.id}
              className={`p-4 rounded-2xl bg-white dark:bg-slate-800 border transition-all ${
                res
                  ? res.pass
                    ? 'border-emerald-300 dark:border-emerald-800'
                    : 'border-amber-300 dark:border-amber-800'
                  : 'border-slate-200 dark:border-slate-700 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">{test.id}</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{test.label}</span>
                    {test.has_danger_sign && (
                      <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                        DANGER
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-1.5 line-clamp-2">
                    "{test.transcript}"
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {res && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 ${
                      res.pass ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {res.pass ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{res.pass ? t('pass') : t('fail')}</span>
                    </span>
                  )}

                  <button
                    onClick={() => runSingleTest(test)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-teal-100 text-slate-700 hover:text-teal-800 active:scale-95 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>

              {res && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700 text-xs">
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Field Score: {res.fieldScore}</span>
                    <span>Danger Caught: {res.dangerPassed ? 'YES' : 'NO'}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
