/**
 * Audio Noise Simulator (Web Audio API, zero external files)
 * Mixes generated pink/filtered noise bursts and 50Hz hum to simulate real village street conditions.
 */
export class NoiseSimulator {
  constructor() {
    this.ctx = null;
    this.gainNode = null;
    this.noiseNode = null;
    this.humOsc = null;
    this.isPlaying = false;
  }

  start() {
    if (this.isPlaying) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    // 1. Buffer for street noise
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02; // Pink-ish filter
      lastOut = data[i];
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;

    // 2. Hum oscillator (motorcycle / generator hum ~100Hz)
    this.humOsc = this.ctx.createOscillator();
    this.humOsc.type = 'sawtooth';
    this.humOsc.frequency.setValueAtTime(85, this.ctx.currentTime);

    // 3. Lowpass filter for muffled background sound
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.08, this.ctx.currentTime); // Safe pleasant level

    this.noiseNode.connect(filter);
    this.humOsc.connect(filter);
    filter.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);

    this.noiseNode.start();
    this.humOsc.start();
    this.isPlaying = true;
  }

  stop() {
    if (!this.isPlaying) return;
    try {
      if (this.noiseNode) this.noiseNode.stop();
      if (this.humOsc) this.humOsc.stop();
      if (this.ctx) this.ctx.close();
    } catch (e) {}
    this.isPlaying = false;
  }
}
