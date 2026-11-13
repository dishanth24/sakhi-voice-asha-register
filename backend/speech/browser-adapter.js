/**
 * Sakhi Voice — Browser Speech Adapter
 * 
 * In browser mode, STT/TTS is handled entirely by the frontend
 * using the Web Speech API. The backend only receives final
 * transcript text via WebSocket messages.
 */

const { SttAdapter, TtsAdapter } = require('./adapter');

class BrowserSttAdapter extends SttAdapter {
  constructor(config = {}) {
    super(config);
    this.running = false;
  }

  start() {
    this.running = true;
    // Browser handles actual STT — we just wait for transcript text via WS
  }

  stop() {
    this.running = false;
  }

  /**
   * Called when a transcript string arrives from the frontend via WebSocket.
   * Not real audio processing — browser already did the STT.
   */
  processAudio(chunk) {
    // In browser mode, we don't process raw audio.
    // Use receiveTranscript() instead.
  }

  /**
   * Receive a final transcript string from the frontend.
   */
  receiveTranscript(text) {
    if (this.running) {
      this._emitTranscript(text, { source: 'browser' });
    }
  }

  /**
   * Receive a partial/interim transcript from the frontend.
   */
  receivePartial(text) {
    if (this.running) {
      this._emitPartial(text, { source: 'browser' });
    }
  }
}

class BrowserTtsAdapter extends TtsAdapter {
  /**
   * TTS is handled by the frontend using the Web Speech API.
   * We just send a speak event via WebSocket.
   */
  speak(text, lang = 'hi-IN') {
    // Return instruction for the frontend to speak
    return { action: 'speak', text, lang };
  }

  stop() {
    return { action: 'stop_speak' };
  }
}

module.exports = { BrowserSttAdapter, BrowserTtsAdapter };
