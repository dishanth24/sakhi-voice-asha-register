export class SttAdapter {
  constructor() {
    this.onPartial = () => {};
    this.onFinal = () => {};
    this.onError = () => {};
    this.lang = 'en-IN';
  }
  setLanguage(lang) { this.lang = lang; }
  start() {}
  stop() {}
  cancel() {}
}

export class TtsAdapter {
  constructor() {
    this.lang = 'en-IN';
  }
  setLanguage(lang) { this.lang = lang; }
  speak(text, lang, callbacks) {}
  cancel() {}
}
