import { Track } from '../types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private intervalId: number | null = null;
  private gainNode: GainNode | null = null;

  public init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playTrack(track: Track) {
    this.stop();
    this.init();
    if (!this.ctx) return;

    this.gainNode = this.ctx.createGain();
    this.gainNode.connect(this.ctx.destination);
    this.gainNode.gain.value = 0.1; // Master volume

    switch (track.type) {
      case 'drone':
        this.playDrone();
        break;
      case 'arp':
        this.playArp();
        break;
      case 'noise':
        this.playNoise();
        break;
    }
  }

  private playDrone() {
    if (!this.ctx || !this.gainNode) return;
    this.osc = this.ctx.createOscillator();
    this.osc.type = 'sawtooth';
    this.osc.frequency.value = 40; // Deep bass
    
    // LFO for pulsing
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.5;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 10;
    lfo.connect(lfoGain);
    lfoGain.connect(this.osc.frequency);
    
    this.osc.connect(this.gainNode);
    this.osc.start();
    lfo.start();
  }

  private playArp() {
    if (!this.ctx || !this.gainNode) return;
    const baseFreq = 220;
    const scale = [1, 1.2, 1.5, 1.8, 2];
    
    this.intervalId = window.setInterval(() => {
      if (!this.ctx || !this.gainNode) return;
      const o = this.ctx.createOscillator();
      o.type = 'square';
      const multiplier = scale[Math.floor(Math.random() * scale.length)];
      o.frequency.value = baseFreq * multiplier;
      
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.1, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
      
      o.connect(g);
      g.connect(this.gainNode);
      o.start();
      o.stop(this.ctx.currentTime + 0.1);
    }, 150);
  }

  private playNoise() {
    if (!this.ctx || !this.gainNode) return;
    
    this.intervalId = window.setInterval(() => {
      if (!this.ctx || !this.gainNode) return;
      const bufferSize = this.ctx.sampleRate * 0.1;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.05, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
      
      // Filter for more "hi-hat" sound
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 5000;

      noise.connect(filter);
      filter.connect(g);
      g.connect(this.gainNode);
      noise.start();
    }, 200);
  }

  public stop() {
    if (this.osc) {
      this.osc.stop();
      this.osc.disconnect();
      this.osc = null;
    }
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
  }
}

export const audioEngine = new AudioEngine();
