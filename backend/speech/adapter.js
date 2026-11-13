/**
 * Sakhi Voice — Base Speech Adapter Interfaces
 */

class SttAdapter {
  constructor(config = {}) {
    this.config = config;
    this._transcriptCallbacks = [];
    this._partialCallbacks = [];
  }

  /** Start the STT engine */
  start() { throw new Error('start() not implemented'); }

  /** Stop the STT engine */
  stop() { throw new Error('stop() not implemented'); }

  /** Register callback for final transcript */
  onTranscript(cb) {
    this._transcriptCallbacks.push(cb);
  }

  /** Register callback for partial/interim transcript */
  onPartial(cb) {
    this._partialCallbacks.push(cb);
  }

  /** Feed raw audio chunk to the STT engine */
  processAudio(chunk) { throw new Error('processAudio() not implemented'); }

  /** Emit final transcript to all registered callbacks */
  _emitTranscript(text, meta = {}) {
    for (const cb of this._transcriptCallbacks) {
      cb(text, meta);
    }
  }

  /** Emit partial transcript to all registered callbacks */
  _emitPartial(text, meta = {}) {
    for (const cb of this._partialCallbacks) {
      cb(text, meta);
    }
  }
}

class TtsAdapter {
  constructor(config = {}) {
    this.config = config;
  }

  /** Speak text aloud */
  speak(text, lang = 'hi-IN') { throw new Error('speak() not implemented'); }

  /** Stop any current speech */
  stop() { throw new Error('stop() not implemented'); }
}

module.exports = { SttAdapter, TtsAdapter };
