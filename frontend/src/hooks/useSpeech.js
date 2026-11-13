import { useRef, useCallback, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { BrowserStt } from '../speech/BrowserStt';
import { GnaniStt } from '../speech/GnaniStt';
import { TextStt } from '../speech/TextStt';
import { BrowserTts } from '../speech/BrowserTts';
import { GnaniTts } from '../speech/GnaniTts';

export function useSpeech() {
  const provider = useAppStore((s) => s.speechProvider);
  const language = useAppStore((s) => s.language);
  const sttRef = useRef(null);
  const ttsRef = useRef(null);

  const getStt = useCallback(() => {
    if (sttRef.current?.provider === provider) return sttRef.current.instance;
    
    let instance;
    switch (provider) {
      case 'gnani':
        instance = new GnaniStt();
        break;
      case 'text':
        instance = new TextStt();
        break;
      default:
        instance = new BrowserStt();
    }
    sttRef.current = { provider, instance };
    return instance;
  }, [provider]);

  const getTts = useCallback(() => {
    if (ttsRef.current?.provider === provider) return ttsRef.current.instance;
    
    let instance;
    switch (provider) {
      case 'gnani':
        instance = new GnaniTts();
        break;
      default:
        instance = new BrowserTts();
    }
    ttsRef.current = { provider, instance };
    return instance;
  }, [provider]);

  useEffect(() => {
    const stt = getStt();
    stt.setLanguage(language === 'hi' ? 'hi-IN' : 'en-IN');
  }, [language, getStt]);

  const startListening = useCallback(
    (callbacks) => {
      const stt = getStt();
      stt.onPartial = callbacks.onPartial || (() => {});
      stt.onFinal = callbacks.onFinal || (() => {});
      stt.onError = callbacks.onError || (() => {});
      stt.start();
    },
    [getStt]
  );

  const stopListening = useCallback(() => {
    const stt = getStt();
    stt.stop();
  }, [getStt]);

  const cancelListening = useCallback(() => {
    const stt = getStt();
    stt.cancel();
  }, [getStt]);

  const speak = useCallback(
    (text, callbacks = {}) => {
      const tts = getTts();
      tts.speak(text, language === 'hi' ? 'hi-IN' : 'en-IN', callbacks);
    },
    [getTts, language]
  );

  const cancelSpeak = useCallback(() => {
    const tts = getTts();
    tts.cancel();
  }, [getTts]);

  return {
    startListening,
    stopListening,
    cancelListening,
    speak,
    cancelSpeak,
    provider,
  };
}
