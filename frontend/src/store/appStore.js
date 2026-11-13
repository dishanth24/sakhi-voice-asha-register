import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Language
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),
      toggleLanguage: () => set((s) => ({ language: s.language === 'en' ? 'hi' : 'en' })),

      // Speech provider: 'browser' | 'gnani' | 'text'
      speechProvider: 'browser',
      setSpeechProvider: (p) => set({ speechProvider: p }),

      // Settings
      settings: {
        endpointingTime: 1.5,
        noiseSim: false,
        highContrast: false,
        textSize: 18,
        darkMode: false,
      },
      updateSetting: (key, value) =>
        set((s) => ({ settings: { ...s.settings, [key]: value } })),

      // Current visit state
      currentVisit: null,
      conversationState: 'GREETING',
      transcript: '',
      partialTranscript: '',
      extractedFields: {},
      fieldConfidences: {},
      dangerSigns: [],
      setCurrentVisit: (v) => set({ currentVisit: v }),
      setConversationState: (s) => set({ conversationState: s }),
      setTranscript: (t) => set({ transcript: t }),
      setPartialTranscript: (t) => set({ partialTranscript: t }),
      setExtractedFields: (fields) => set({ extractedFields: fields }),
      setFieldConfidences: (c) => set({ fieldConfidences: c }),
      setDangerSigns: (d) => set({ dangerSigns: d }),
      updateField: (key, value) =>
        set((s) => ({
          extractedFields: { ...s.extractedFields, [key]: value },
        })),

      // Visits list
      visits: [],
      addVisit: (visit) => set((s) => ({ visits: [visit, ...s.visits] })),
      setVisits: (visits) => set({ visits }),

      // Follow-ups
      followUps: [],
      setFollowUps: (f) => set({ followUps: f }),
      markFollowUpDone: (id) =>
        set((s) => ({
          followUps: s.followUps.map((f) =>
            f.id === id ? { ...f, done: true } : f
          ),
        })),

      // WebSocket connection
      wsConnected: false,
      setWsConnected: (c) => set({ wsConnected: c }),

      // Stats
      stats: { visitsToday: 0, followUpsDue: 0, referrals: 0 },
      setStats: (stats) => set({ stats }),

      // Timing (under the hood)
      timing: {},
      setTiming: (t) => set({ timing: t }),

      // Reset visit
      resetVisit: () =>
        set({
          currentVisit: null,
          conversationState: 'GREETING',
          transcript: '',
          partialTranscript: '',
          extractedFields: {},
          fieldConfidences: {},
          dangerSigns: [],
          timing: {},
        }),

      // Clear all data
      clearAll: () =>
        set({
          visits: [],
          followUps: [],
          stats: { visitsToday: 0, followUpsDue: 0, referrals: 0 },
        }),
    }),
    {
      name: 'asha-store',
      partialize: (state) => ({
        language: state.language,
        speechProvider: state.speechProvider,
        settings: state.settings,
        visits: state.visits,
        followUps: state.followUps,
      }),
    }
  )
);
