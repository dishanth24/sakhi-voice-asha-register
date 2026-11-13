import { SttAdapter } from './SttAdapter';

/**
 * Gnani Prisma v3.0 WebSocket Streaming STT Stub
 * Captures 16kHz mono PCM via AudioWorklet and streams to backend/Gnani.
 */
export class GnaniStt extends SttAdapter {
  constructor() {
    super();
    this.mediaStream = null;
    this.audioContext = null;
    this.workletNode = null;
    this.isStreaming = false;
  }

  async start() {
    console.log('[Gnani STT Stub] Starting audio capture 16kHz mono PCM');
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      
      // TODO: confirm against Gnani docs - WebSocket handshake parameters and binary audio frame headers
      this.isStreaming = true;
      this.onPartial('Connecting to Gnani Prisma v3.0...');
    } catch (err) {
      this.onError('Gnani mic capture error: ' + err.message);
    }
  }

  stop() {
    this.isStreaming = false;
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    console.log('[Gnani STT Stub] Stopped');
  }

  cancel() {
    this.stop();
  }
}
