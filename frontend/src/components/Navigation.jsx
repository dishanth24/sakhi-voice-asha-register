import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Mic, Clock, FileText, FlaskConical, Settings } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export default function Navigation() {
  const { t } = useTranslation();

  const navItems = [
    { to: '/', icon: Home, label: t('home') },
    { to: '/visit', icon: Mic, label: t('visits'), primary: true },
    { to: '/follow-ups', icon: Clock, label: t('follow_ups') },
    { to: '/records', icon: FileText, label: t('records') },
    { to: '/test-lab', icon: FlaskConical, label: t('test_lab') },
    { to: '/settings', icon: Settings, label: t('settings') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg px-2 py-1 safe-area-bottom">
      <div className="max-w-xl mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[56px] min-h-[56px] px-2 rounded-2xl transition-all duration-200 ${
                  item.primary
                    ? 'bg-teal-700 text-white shadow-md shadow-teal-700/30 -translate-y-2'
                    : isActive
                    ? 'text-teal-700 dark:text-teal-400 font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Icon className={item.primary ? 'w-6 h-6' : 'w-5 h-5'} />
              <span className={`text-[11px] mt-1 tracking-tight ${item.primary ? 'text-white' : ''}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
