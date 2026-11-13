import { SttAdapter } from './SttAdapter';

export class TextStt extends SttAdapter {
  constructor() {
    super();
  }

  // Text mode triggers on user typing / submitting
  sendText(text) {
    if (this.onPartial) this.onPartial(text);
    if (this.onFinal) this.onFinal(text);
  }

  start() {}
  stop() {}
  cancel() {}
}
