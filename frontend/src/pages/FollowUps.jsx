import React, { useEffect, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAppStore } from '../store/appStore';
import { CheckCircle2, AlertTriangle, Calendar, Clock } from 'lucide-react';

export default function FollowUps() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const setStoreFollowUps = useAppStore((s) => s.setFollowUps);

  const fetchFollowUps = async () => {
    try {
      const res = await fetch('/api/followups');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTasks(data);
        setStoreFollowUps(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const handleComplete = async (id) => {
    try {
      await fetch(`/api/followups/${id}/complete`, { method: 'POST' });
      const updated = tasks.map(t => t.id === id ? { ...t, completed: 1 } : t);
      setTasks(updated);
      setStoreFollowUps(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const referrals = tasks.filter(t => t.type === 'referral_followup');
  const regularTasks = tasks.filter(t => t.type !== 'referral_followup');

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-24">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {t('follow_ups')}
        </h1>
        <p className="text-slate-500 text-xs mt-1">Pending visits and emergency referral follow-ups</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading follow-ups...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-slate-400 text-sm">
          {t('no_followups')}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Referrals Pinned on Top in Red */}
          {referrals.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase tracking-wider mb-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{t('referrals')} (High Priority)</span>
              </div>
              <div className="space-y-2.5">
                {referrals.map(task => (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-base text-red-900 dark:text-red-200">{task.beneficiary_name}</div>
                      <div className="text-xs text-red-700 dark:text-red-300 font-medium mt-0.5">{task.reason}</div>
                      <div className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        <span>Due: {task.due_date}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleComplete(task.id)}
                      disabled={task.completed}
                      className={`min-h-[44px] px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                        task.completed
                          ? 'bg-red-200 text-red-700 cursor-default'
                          : 'bg-red-600 hover:bg-red-700 text-white shadow-sm active:scale-95'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{task.completed ? 'Done' : 'Mark Done'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Scheduled Follow-ups */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>{t('this_week')}</span>
            </div>
            <div className="space-y-2.5">
              {regularTasks.map(task => (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl bg-white dark:bg-slate-800 border transition-all flex items-center justify-between gap-3 ${
                    task.completed
                      ? 'border-slate-200 dark:border-slate-800 opacity-60'
                      : 'border-slate-200 dark:border-slate-700 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="font-bold text-base text-slate-900 dark:text-white">{task.beneficiary_name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{task.reason}</div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      <span>Due: {task.due_date}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleComplete(task.id)}
                    disabled={task.completed}
                    className={`min-h-[44px] px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                      task.completed
                        ? 'bg-emerald-50 text-emerald-700 cursor-default'
                        : 'bg-teal-700 hover:bg-teal-600 text-white shadow-sm active:scale-95'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{task.completed ? 'Done' : 'Mark Done'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
