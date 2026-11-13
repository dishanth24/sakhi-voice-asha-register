import { TtsAdapter } from './SttAdapter';

/**
 * Gnani Timbre v3.0 WebSocket TTS Stub
 * Plays raw audio chunks via Web Audio API. Supports cancel for barge-in.
 */
export class GnaniTts extends TtsAdapter {
  constructor() {
    super();
    this.audioContext = null;
    this.currentSource = null;
  }

  speak(text, lang = 'hi-IN', callbacks = {}) {
    console.log(`[Gnani TTS Stub] Requesting synthesis for: "${text}" with lang ${lang}`);
    // TODO: confirm against Gnani docs - Timbre v3.0 audio format (Opus/PCM/WAV)
    if (callbacks.onStart) callbacks.onStart();
    setTimeout(() => {
      if (callbacks.onEnd) callbacks.onEnd();
    }, 1500);
  }

  cancel() {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch (e) {}
      this.currentSource = null;
    }
  }
}
