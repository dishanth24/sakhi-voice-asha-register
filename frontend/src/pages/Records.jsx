import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAppStore } from '../store/appStore';
import { Search, Download, AlertTriangle, FileText, ChevronRight } from 'lucide-react';

export default function Records() {
  const { t, language } = useTranslation();
  const [visits, setVisits] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const setStoreVisits = useAppStore((s) => s.setVisits);

  const fetchVisits = async () => {
    try {
      const res = await fetch('/api/visits');
      const data = await res.json();
      if (Array.isArray(data)) {
        setVisits(data);
        setStoreVisits(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const filteredVisits = visits.filter(v => {
    if (!v) return false;
    const nameMatch = (v.beneficiary_name || '').toLowerCase().includes(search.toLowerCase()) ||
                      (v.beneficiary_id || '').includes(search);
    const typeMatch = filterType === 'ALL' || v.visit_type === filterType;
    const flagMatch = !flaggedOnly || v.flagged;
    return nameMatch && typeMatch && flagMatch;
  });

  const exportCSV = () => {
    if (filteredVisits.length === 0) return;
    const headers = ['ID', 'Name', 'Visit Type', 'Weight (kg)', 'Next Visit', 'Flagged', 'Notes'];
    const rows = filteredVisits.map(v => [
      v.beneficiary_id || '',
      `"${v.beneficiary_name || ''}"`,
      v.visit_type || '',
      v.weight_kg || '',
      v.next_visit_date || '',
      v.flagged ? 'YES' : 'NO',
      `"${(v.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `asha_records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-24">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {t('records')}
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">Encrypted at rest (AES-256-GCM)</p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 active:scale-95 shadow-2xs"
        >
          <Download className="w-3.5 h-3.5 text-teal-600" />
          <span>{t('export_csv')}</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-2.5 mb-5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search')}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['ALL', 'ANC', 'Newborn', 'Immunisation', 'PNC'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                filterType === type
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {type}
            </button>
          ))}

          <button
            onClick={() => setFlaggedOnly(!flaggedOnly)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
              flaggedOnly
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>{t('flagged_only')}</span>
          </button>
        </div>
      </div>

      {/* Records list */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading records...</div>
      ) : filteredVisits.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-slate-400 text-sm">
          {t('no_records')}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVisits.map((v, idx) => (
            <div
              key={v.id || idx}
              className={`p-4 rounded-2xl bg-white dark:bg-slate-800 border transition-all ${
                v.flagged
                  ? 'border-red-300 dark:border-red-800/80 bg-red-50/20'
                  : 'border-slate-200 dark:border-slate-700 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-slate-900 dark:text-white">
                      {v.beneficiary_name || 'Beneficiary'}
                    </span>
                    {v.beneficiary_id && (
                      <span className="text-[11px] font-mono bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                        #{v.beneficiary_id}
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 mt-0.5">
                    {v.visit_type} Checkup
                  </div>
                </div>

                {v.flagged && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-100 dark:bg-red-950 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3 h-3" />
                    <span>REFERRAL</span>
                  </span>
                )}
              </div>

              {/* Vitals summary */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Weight</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{v.weight_kg ? `${v.weight_kg} kg` : '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Next Visit</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{v.next_visit_date || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Vaccines</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200 truncate block">
                    {Array.isArray(v.vaccinations_given) ? v.vaccinations_given.join(', ') : '—'}
                  </span>
                </div>
              </div>

              {v.notes && (
                <div className="mt-2 text-xs text-slate-500 italic bg-slate-50 dark:bg-slate-900/40 p-2 rounded-lg">
                  "{v.notes}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
