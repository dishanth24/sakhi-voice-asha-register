import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import { useAppStore } from './store/appStore';

const Home = lazy(() => import('./pages/Home'));
const Visit = lazy(() => import('./pages/Visit'));
const FollowUps = lazy(() => import('./pages/FollowUps'));
const Records = lazy(() => import('./pages/Records'));
const TestLab = lazy(() => import('./pages/TestLab'));
const Settings = lazy(() => import('./pages/Settings'));
const Compliance = lazy(() => import('./pages/Compliance'));
const JudgeDemo = lazy(() => import('./pages/JudgeDemo'));
const UnderTheHood = lazy(() => import('./pages/UnderTheHood'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen bg-background dark:bg-dark-bg">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  const darkMode = useAppStore((s) => s.settings.darkMode);
  const textSize = useAppStore((s) => s.settings.textSize);
  const highContrast = useAppStore((s) => s.settings.highContrast);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${textSize}px`;
  }, [textSize]);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg pb-20">
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/visit" element={<Visit />} />
          <Route path="/follow-ups" element={<FollowUps />} />
          <Route path="/records" element={<Records />} />
          <Route path="/test-lab" element={<TestLab />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/judge-demo" element={<JudgeDemo />} />
          <Route path="/under-the-hood" element={<UnderTheHood />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Navigation />
    </div>
  );
}
