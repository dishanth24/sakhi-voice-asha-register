import { TtsAdapter } from './SttAdapter';

export class BrowserTts extends TtsAdapter {
  constructor() {
    super();
    this.synth = window.speechSynthesis;
    this.voices = [];
    if (this.synth) {
      this.voices = this.synth.getVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          this.voices = this.synth.getVoices();
        };
      }
    }
  }

  speak(text, lang = 'hi-IN', callbacks = {}) {
    if (!this.synth) return;
    this.cancel(); // barge-in cancel previous speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;

    // Pick best matching voice
    if (this.voices.length > 0) {
      const match = this.voices.find(v => v.lang === lang || v.lang.startsWith(lang.split('-')[0])) ||
                    this.voices.find(v => v.lang.includes('IN'));
      if (match) utterance.voice = match;
    }

    if (callbacks.onStart) utterance.onstart = callbacks.onStart;
    if (callbacks.onEnd) utterance.onend = callbacks.onEnd;
    if (callbacks.onError) utterance.onerror = callbacks.onError;

    this.synth.speak(utterance);
  }

  cancel() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
  }
}
