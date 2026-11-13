import React from 'react';

const HIGHLIGHT_TERMS = ['TT', 'IFA', 'ANC', 'BCG', 'OPV', 'Penta', 'Measles', 'Vitamin A', 'PHC', 'Anganwadi', 'Hb', 'BP', 'kilo', 'kg', 'dhai', 'dedh'];

export default function TranscriptDisplay({ transcript = '', partial = '' }) {
  const fullText = (transcript + ' ' + partial).trim();

  if (!fullText) {
    return (
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-center text-slate-400 text-sm italic">
        Speak now or type your visit notes...
      </div>
    );
  }

  // Tokenize and render chips for recognized health terms
  const tokens = fullText.split(/(\s+)/);

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs max-h-36 overflow-y-auto">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Live Transcript</div>
      <p className="text-base sm:text-lg leading-relaxed text-slate-800 dark:text-slate-100 font-medium">
        {tokens.map((token, idx) => {
          const clean = token.replace(/[^a-zA-Z0-9]/g, '');
          const isTerm = HIGHLIGHT_TERMS.some(t => t.toLowerCase() === clean.toLowerCase());

          if (isTerm) {
            return (
              <span
                key={idx}
                className="inline-block px-1.5 py-0.5 mx-0.5 rounded-md bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 font-bold text-sm border border-teal-200 dark:border-teal-700"
              >
                {token}
              </span>
            );
          }
          return <span key={idx}>{token}</span>;
        })}
      </p>
    </div>
  );
}
