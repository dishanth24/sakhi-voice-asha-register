import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useSpeech } from '../hooks/useSpeech';
import { useAppStore } from '../store/appStore';
import AIBadge from '../components/AIBadge';
import LanguageToggle from '../components/LanguageToggle';
import MicButton from '../components/MicButton';
import DangerBanner from '../components/DangerBanner';
import VisitForm from '../components/VisitForm';
import TranscriptDisplay from '../components/TranscriptDisplay';
import Waveform from '../components/Waveform';
import { Check, X, ArrowLeft, Send, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Visit() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const { startListening, stopListening, speak, cancelSpeak } = useSpeech();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [partial, setPartial] = useState('');
  const [isReadback, setIsReadback] = useState(false);
  const [highlightedFields, setHighlightedFields] = useState([]);
  const [dangerSigns, setDangerSigns] = useState([]);
  const [fields, setFields] = useState({});
  const [previousFields, setPreviousFields] = useState({});
  const [confidences, setConfidences] = useState({});
  const [manualText, setManualText] = useState('');
  const [editModal, setEditModal] = useState({ open: false, field: '', value: '' });
  const [toast, setToast] = useState({ show: false, message: '' });

  const addVisit = useAppStore((s) => s.addVisit);
  const setVisits = useAppStore((s) => s.setVisits);
  const setFollowUps = useAppStore((s) => s.setFollowUps);
  const endpointingTime = useAppStore((s) => s.settings.endpointingTime || 1.5);
  const silenceTimer = useRef(null);

  // Initial AI Disclosure Greeting
  useEffect(() => {
    const greetingText = language === 'hi'
      ? "नमस्ते, मैं सखी हूँ, एक AI सहायक। अपनी विज़िट के बारे में बताइए।"
      : "Hello, I am Sakhi, an AI assistant. Tell me about your visit.";
    speak(greetingText);
  }, []);

  const triggerExtraction = async (textToExtract) => {
    if (!textToExtract.trim()) return;
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: textToExtract })
      });
      const data = await res.json();
      
      setFields(data.fields || {});
      setConfidences(data.confidence || {});
      
      if (data.danger_signs && data.danger_signs.length > 0) {
        setDangerSigns(data.danger_signs);
        // Haptic feedback & alert
        if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
        // Audio alert tone
        playAlertTone();
        // Speak referral text
        const alertMsg = language === 'hi' ? data.danger_signs[0].referral_message_hi : data.danger_signs[0].referral_message_en;
        speak(alertMsg);
      } else {
        // Normal readback
        startReadback(data.fields);
      }
    } catch (e) {
      console.error('Extraction error:', e);
    }
  };

  const playAlertTone = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  };

  const startReadback = (filledFields) => {
    setIsReadback(true);
    setHighlightedFields(['beneficiary_name', 'visit_type', 'weight_kg']);
    const name = filledFields.beneficiary_name || (language === 'hi' ? 'लाभार्थी' : 'Beneficiary');
    const weight = filledFields.weight_kg ? `${filledFields.weight_kg} kg` : '';
    const type = filledFields.visit_type || '';
    const nextDate = filledFields.next_visit_date ? (language === 'hi' ? `अगली विज़िट ${filledFields.next_visit_date} को है।` : `Next visit on ${filledFields.next_visit_date}.`) : '';
    const readText = language === 'hi'
      ? `मैंने दर्ज किया: ${name}, ${type} विज़िट। ${weight ? 'वज़न ' + weight + '।' : ''} ${nextDate} क्या यह सही है?`
      : `I noted: ${name}, ${type} visit. ${weight ? 'Weight ' + weight + '.' : ''} ${nextDate} Is this correct?`;
    speak(readText);
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
      const spoken = (transcript + ' ' + partial).trim();
      if (hasExtractedField && isConfirmationPhrase(spoken)) {
        handleSaveVisit();
      } else if (hasExtractedField && isCorrectionPhrase(spoken)) {
        handleApplyCorrection(spoken);
      } else {
        triggerExtraction(spoken);
      }
    } else {
      cancelSpeak(); // Barge-in
      setIsListening(true);
      startListening({
        onPartial: (p) => {
          setPartial(p);
          if (silenceTimer.current) clearTimeout(silenceTimer.current);
          silenceTimer.current = setTimeout(() => {
            stopListening();
            setIsListening(false);
            const combined = (transcript + ' ' + p).trim();
            setTranscript((prev) => (prev ? prev + ' ' : '') + p);
            setPartial('');
            if (hasExtractedField && isConfirmationPhrase(p)) {
              handleSaveVisit();
            } else if (hasExtractedField && isCorrectionPhrase(p)) {
              handleApplyCorrection(p);
            } else {
              triggerExtraction(combined);
            }
          }, endpointingTime * 1000);
        },
        onFinal: (f) => {
          const combined = (transcript + ' ' + f).trim();
          setTranscript((prev) => (prev ? prev + ' ' : '') + f);
          setPartial('');
          if (silenceTimer.current) clearTimeout(silenceTimer.current);
          if (hasExtractedField && isConfirmationPhrase(f)) {
            handleSaveVisit();
          } else if (hasExtractedField && isCorrectionPhrase(f)) {
            handleApplyCorrection(f);
          } else {
            triggerExtraction(combined);
          }
        },
        onError: (err) => {
          console.warn('STT Error:', err);
          setIsListening(false);
        }
      });
    }
  };

  const isCorrectionPhrase = (text) => {
    if (!text) return false;
    const lower = text.trim().toLowerCase();
    return lower.startsWith('no') || lower.startsWith('nahi') || lower.startsWith('nahin') ||
           lower.includes('weight is') || lower.includes('wazan') || lower.includes('naam') ||
           lower.includes('name is') || lower.includes('change') || lower.includes('correct') ||
           lower.includes('बदलो') || lower.includes('नहीं');
  };

  const handleApplyCorrection = async (text) => {
    try {
      const res = await fetch('/api/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (data.correction && data.correction.field) {
        const { field, value, extra } = data.correction;
        const oldVal = fields[field];

        // Record previous value to trigger strikethrough animation
        setPreviousFields(prev => ({ ...prev, [field]: oldVal }));
        
        // Update ONLY the named field
        setFields(prev => {
          const updated = { ...prev, [field]: value };
          if (extra) Object.assign(updated, extra);
          return updated;
        });

        // Highlight only the changed field
        setHighlightedFields([field]);

        // Read back ONLY the changed field
        const fieldLabel = field === 'weight_kg'
          ? (language === 'hi' ? 'वज़न' : 'weight')
          : field === 'beneficiary_name'
          ? (language === 'hi' ? 'नाम' : 'name')
          : field === 'next_visit_date'
          ? (language === 'hi' ? 'अगली विज़िट' : 'next visit')
          : field;

        const valString = field === 'weight_kg' ? `${value} kg` : String(value);
        const replyText = language === 'hi'
          ? `सुधार दिया, नया ${fieldLabel} ${valString} है।`
          : `Updated ${fieldLabel} to ${valString}.`;

        speak(replyText);
        return true;
      }
    } catch (e) {
      console.error('Correction failed:', e);
    }
    return false;
  };

  const handleSaveVisit = async () => {
    const record = {
      ...fields,
      danger_signs: dangerSigns,
      flagged: dangerSigns.length > 0,
      transcript: transcript || manualText,
      created_at: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      const savedRecord = await res.json();
      
      // Update global store
      addVisit(savedRecord || record);

      // Re-fetch updated followups and visits for immediate consistency
      const [vRes, fRes] = await Promise.all([
        fetch('/api/visits'),
        fetch('/api/followups')
      ]);
      const vData = await vRes.json();
      const fData = await fRes.json();
      if (Array.isArray(vData)) setVisits(vData);
      if (Array.isArray(fData)) setFollowUps(fData);

      // Clear the form
      setFields({});
      setConfidences({});
      setDangerSigns([]);
      setTranscript('');
      setPartial('');
      setManualText('');
      setIsReadback(false);

      // Show green toast "Visit saved"
      setToast({ show: true, message: language === 'hi' ? 'विज़िट सेव हो गई (Visit saved)' : 'Visit saved' });
      speak(language === 'hi' ? "विज़िट सुरक्षित रूप से सेव हो गई है।" : "Visit saved.");

      setTimeout(() => {
        setToast({ show: false, message: '' });
      }, 3000);
    } catch (e) {
      console.error('Save failed:', e);
    }
  };

  const hasExtractedField = Object.entries(fields).some(([key, val]) => {
    if (key === 'notes') return false; // don't count default transcript notes alone
    if (Array.isArray(val)) return val.length > 0;
    return val !== undefined && val !== null && val !== '';
  });

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualText.trim()) return;
    const text = manualText.trim();
    if (hasExtractedField && isConfirmationPhrase(text)) {
      handleSaveVisit();
      return;
    }
    if (hasExtractedField && isCorrectionPhrase(text)) {
      const corrected = await handleApplyCorrection(text);
      if (corrected) {
        setManualText('');
        return;
      }
    }
    setTranscript(text);
    triggerExtraction(text);
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-4 pb-28">
      {/* Top action bar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </button>
        <AIBadge />
        <LanguageToggle />
      </div>

      {/* Green Toast Notification */}
      {toast.show && (
        <div className="fixed top-5 left-4 right-4 max-w-sm mx-auto z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-bounce-once">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-bold tracking-tight">{toast.message}</span>
        </div>
      )}

      {/* Danger Sign Full-Width Banner (Interrupt) */}
      <DangerBanner
        signs={dangerSigns}
        onReferred={() => {
          setFields(prev => ({ ...prev, referred_to_phc: true }));
        }}
      />

      {/* Live Transcript / Health Terms display */}
      <div className="mb-4">
        <TranscriptDisplay transcript={transcript} partial={partial} />
      </div>

      {/* Manual Type Box (Zero microphone fallback) */}
      <form onSubmit={handleManualSubmit} className="flex items-center gap-2 mb-5">
        <input
          type="text"
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          placeholder={language === 'hi' ? "या यहाँ लिखें... (जैसे: सुनीता देवी वजन 52 किलो)" : "Or type visit details here..."}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          className="p-2.5 rounded-xl bg-teal-700 text-white shadow-sm hover:bg-teal-600 active:scale-95 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Live Form Fields */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>{language === 'hi' ? 'विज़िट विवरण (लाइव फॉर्म)' : 'Visit Details (Live Form)'}</span>
          </span>
          {isReadback && (
            <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 animate-pulse">
              ● {language === 'hi' ? 'पुष्टि मोड' : 'Readback Mode'}
            </span>
          )}
        </div>

        <VisitForm
          fields={fields}
          previousFields={previousFields}
          confidences={confidences}
          highlightedFields={highlightedFields}
          onEditField={(f, v) => setEditModal({ open: true, field: f, value: v || '' })}
        />
      </div>

      {/* Sticky Bottom Action Bar when at least one field is extracted */}
      {hasExtractedField && (
        <div className="fixed bottom-20 left-0 right-0 px-4 max-w-xl mx-auto z-40">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex items-center gap-3">
            <button
              onClick={() => {
                console.log('[Visit Action] "Haan, save karo / Save" clicked', fields);
                handleSaveVisit();
              }}
              className="flex-1 flex items-center justify-center gap-2 min-h-[56px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Check className="w-5 h-5" />
              <span>{language === 'hi' ? 'हाँ, सेव करो / Save' : 'Haan, save karo / Save'}</span>
            </button>

            <button
              onClick={() => {
                console.log('[Visit Action] "Sudhaaro / Correct" clicked', fields);
                setIsReadback(false);
                speak(language === 'hi' ? "कृपया बताएं क्या सुधारना है।" : "Please speak what to correct.");
                handleToggleListening();
              }}
              className="flex-1 flex items-center justify-center gap-2 min-h-[56px] px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{language === 'hi' ? 'सुधारो / Correct' : 'Sudhaaro / Correct'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Bottom Mic Button Bar when no fields are extracted yet */}
      {!hasExtractedField && (
        <div className="fixed bottom-20 left-0 right-0 px-4 max-w-xl mx-auto z-40 flex items-center justify-center">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-xl flex items-center gap-4">
            <Waveform active={isListening} />
            <MicButton
              size="normal"
              isListening={isListening}
              onClick={handleToggleListening}
            />
          </div>
        </div>
      )}

      {/* Simple Edit Modal */}
      {editModal.open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Edit {editModal.field}
            </h3>
            <input
              type="text"
              value={editModal.value}
              onChange={(e) => setEditModal({ ...editModal, value: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-base focus:ring-2 focus:ring-teal-500 mb-4"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setEditModal({ open: false, field: '', value: '' })}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  setFields(prev => ({ ...prev, [editModal.field]: editModal.value }));
                  setEditModal({ open: false, field: '', value: '' });
                }}
                className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-sm shadow-sm"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
