/**
 * Sakhi Voice — Text Adapter
 * 
 * Receives plain text (no audio), passes through the pipeline identically.
 * Used for text-mode input and testing.
 */

const { SttAdapter, TtsAdapter } = require('./adapter');

class TextSttAdapter extends SttAdapter {
  constructor(config = {}) {
    super(config);
    this.running = false;
  }

  start() {
    this.running = true;
  }

  stop() {
    this.running = false;
  }

  processAudio(chunk) {
    // Text adapter does not process audio
  }

  /**
   * Receive text input directly (e.g. from a text box).
   */
  receiveText(text) {
    if (this.running && text && text.trim()) {
      this._emitTranscript(text.trim(), { source: 'text' });
    }
  }
}

class TextTtsAdapter extends TtsAdapter {
  /**
   * In text mode, TTS just returns the text for display.
   */
  speak(text, lang = 'hi-IN') {
    return { action: 'display_text', text, lang };
  }

  stop() {
    return { action: 'stop_display' };
  }
}

module.exports = { TextSttAdapter, TextTtsAdapter };
