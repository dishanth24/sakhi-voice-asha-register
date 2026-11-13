/**
 * Sakhi Voice — Gnani Speech Adapter (STUB)
 *
 * STUB implementation for Gnani Prisma v3.0 STT and Timbre v3.0 TTS.
 * This file will NOT crash when Gnani is not configured or not in use.
 *
 * All protocol details are best-guess and need verification.
 */

const { SttAdapter, TtsAdapter } = require('./adapter');

// TODO: confirm against Gnani docs — WebSocket URL patterns
const GNANI_STT_WS = process.env.GNANI_STT_WS_URL || 'wss://asr.gnani.ai/v3/stream';
const GNANI_TTS_WS = process.env.GNANI_TTS_WS_URL || 'wss://tts.gnani.ai/v3/stream';
const GNANI_API_KEY = process.env.GNANI_API_KEY || '';

class GnaniSttAdapter extends SttAdapter {
  constructor(config = {}) {
    super(config);
    this.ws = null;
    this.running = false;
    // TODO: confirm against Gnani docs — audio format requirements
    this.sampleRate = 16000;  // 16kHz mono PCM
    this.channels = 1;
  }

  start() {
    if (!GNANI_API_KEY) {
      console.warn('[GnaniSTT] No GNANI_API_KEY set — adapter will not connect');
      return;
    }

    this.running = true;

    try {
      // TODO: confirm against Gnani docs — WebSocket connection protocol
      // TODO: confirm against Gnani docs — authentication header format
      const WebSocket = require('ws');
      this.ws = new WebSocket(GNANI_STT_WS, {
        headers: {
          'Authorization': `Bearer ${GNANI_API_KEY}`,  // TODO: confirm against Gnani docs
          'x-api-key': GNANI_API_KEY,                   // TODO: confirm against Gnani docs
        }
      });

      // TODO: confirm against Gnani docs — initial config message format
      this.ws.on('open', () => {
        this.ws.send(JSON.stringify({
          config: {
            sample_rate: this.sampleRate,           // TODO: confirm against Gnani docs
            encoding: 'LINEAR16',                   // TODO: confirm against Gnani docs
            language: this.config.lang || 'hi-IN',  // TODO: confirm against Gnani docs
            interim_results: true,                  // TODO: confirm against Gnani docs
            model: 'prisma-v3',                     // TODO: confirm against Gnani docs
          }
        }));
      });

      // TODO: confirm against Gnani docs — response message format
      this.ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());

          // TODO: confirm against Gnani docs — transcript field names
          if (msg.is_final || msg.final) {
            this._emitTranscript(msg.transcript || msg.text || '', {
              source: 'gnani',
              confidence: msg.confidence,
              language: msg.language,
            });
          } else {
            this._emitPartial(msg.transcript || msg.text || '', {
              source: 'gnani',
              stability: msg.stability,
            });
          }
        } catch (e) {
          console.error('[GnaniSTT] Failed to parse message:', e.message);
        }
      });

      this.ws.on('error', (err) => {
        console.error('[GnaniSTT] WebSocket error:', err.message);
      });

      this.ws.on('close', () => {
        this.running = false;
      });

    } catch (err) {
      console.error('[GnaniSTT] Failed to start:', err.message);
      this.running = false;
    }
  }

  stop() {
    this.running = false;
    if (this.ws) {
      try {
        // TODO: confirm against Gnani docs — close/stop signal
        this.ws.send(JSON.stringify({ action: 'stop' }));
        this.ws.close();
      } catch (e) {
        // ignore close errors
      }
      this.ws = null;
    }
  }

  /**
   * Stream raw audio chunk (16kHz mono PCM Buffer) to Gnani.
   */
  processAudio(chunk) {
    // TODO: confirm against Gnani docs — binary frame format for audio chunks
    if (this.running && this.ws && this.ws.readyState === 1) {
      this.ws.send(chunk);
    }
  }
}

class GnaniTtsAdapter extends TtsAdapter {
  constructor(config = {}) {
    super(config);
    this.ws = null;
  }

  /**
   * Send text to Gnani Timbre v3.0 for TTS synthesis.
   * Returns a promise that resolves with audio data.
   */
  speak(text, lang = 'hi-IN') {
    if (!GNANI_API_KEY) {
      console.warn('[GnaniTTS] No GNANI_API_KEY set — cannot synthesize');
      return Promise.resolve(null);
    }

    // TODO: confirm against Gnani docs — TTS API might be REST, not WebSocket
    // TODO: confirm against Gnani docs — voice_id, speed, pitch parameters
    return new Promise((resolve, reject) => {
      try {
        const WebSocket = require('ws');
        this.ws = new WebSocket(GNANI_TTS_WS, {
          headers: {
            'Authorization': `Bearer ${GNANI_API_KEY}`,  // TODO: confirm against Gnani docs
            'x-api-key': GNANI_API_KEY,                   // TODO: confirm against Gnani docs
          }
        });

        const audioChunks = [];

        this.ws.on('open', () => {
          // TODO: confirm against Gnani docs — TTS request message format
          this.ws.send(JSON.stringify({
            text,
            language: lang,                              // TODO: confirm against Gnani docs
            voice_id: this.config.voiceId || 'default',  // TODO: confirm against Gnani docs
            model: 'timbre-v3',                          // TODO: confirm against Gnani docs
            sample_rate: 16000,                          // TODO: confirm against Gnani docs
            encoding: 'LINEAR16',                        // TODO: confirm against Gnani docs
          }));
        });

        // TODO: confirm against Gnani docs — response format (binary audio frames)
        this.ws.on('message', (data) => {
          if (Buffer.isBuffer(data)) {
            audioChunks.push(data);
          } else {
            try {
              const msg = JSON.parse(data.toString());
              if (msg.done || msg.end) {
                this.ws.close();
                resolve(Buffer.concat(audioChunks));
              }
            } catch (e) {
              // assume binary audio
              audioChunks.push(Buffer.from(data));
            }
          }
        });

        this.ws.on('close', () => {
          if (audioChunks.length > 0) {
            resolve(Buffer.concat(audioChunks));
          } else {
            resolve(null);
          }
        });

        this.ws.on('error', (err) => {
          console.error('[GnaniTTS] WebSocket error:', err.message);
          reject(err);
        });

      } catch (err) {
        console.error('[GnaniTTS] Failed to speak:', err.message);
        resolve(null);
      }
    });
  }

  stop() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {
        // ignore
      }
      this.ws = null;
    }
  }
}

module.exports = { GnaniSttAdapter, GnaniTtsAdapter };
