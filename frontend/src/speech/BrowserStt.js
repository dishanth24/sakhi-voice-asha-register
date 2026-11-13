import { SttAdapter } from './SttAdapter';

export class BrowserStt extends SttAdapter {
  constructor() {
    super();
    this.recognition = null;
    this.isListening = false;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      this.recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) this.onPartial(interim);
        if (final) this.onFinal(final);
      };

      this.recognition.onerror = (event) => {
        this.onError(event.error);
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch (e) {
            this.isListening = false;
          }
        }
      };
    }
  }

  start() {
    if (!this.recognition) {
      this.onError('Speech recognition not supported in this browser. Please use Chrome or Text mode.');
      return;
    }
    this.recognition.lang = this.lang;
    this.isListening = true;
    try {
      this.recognition.start();
    } catch (e) {
      // already started or busy
    }
  }

  stop() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }

  cancel() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {}
    }
  }
}
