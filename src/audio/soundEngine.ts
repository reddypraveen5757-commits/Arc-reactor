/**
 * Procedural Web Audio API Sound Synthesizer for Arc Reactor
 * Generates all sci-fi sound effects in real-time without external audio files.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientGain: GainNode | null = null;
  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private isHumming: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      if (this.ambientGain) {
        this.ambientGain.gain.setTargetAtTime(0, this.getContext()?.currentTime || 0, 0.05);
      }
    } else {
      if (this.ambientGain && this.isHumming) {
        this.ambientGain.gain.setTargetAtTime(0.08, this.getContext()?.currentTime || 0, 0.1);
      }
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * UI Click / High-tech Chirp
   */
  public playClick(freq = 1200) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.8, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.07);
  }

  /**
   * Hologram Scan / Mode Toggle Sound
   */
  public playHologramToggle(active: boolean) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const baseFreq = active ? 440 : 880;
    const targetFreq = active ? 1760 : 330;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.25);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(baseFreq * 1.5, now);
    filter.frequency.exponentialRampToValueAtTime(targetFreq * 1.5, now + 0.25);
    filter.Q.value = 8;

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  /**
   * Exploded View Hydraulic / Mechanical Servo
   */
  public playServoSound(opening: boolean) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Filtered noise burst for hydraulic hiss
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(opening ? 800 : 1600, now);
    filter.frequency.exponentialRampToValueAtTime(opening ? 2400 : 600, now + 0.25);
    filter.Q.value = 5;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.08, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    // Subtle tonal servo glide
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(opening ? 160 : 320, now);
    osc.frequency.exponentialRampToValueAtTime(opening ? 360 : 140, now + 0.25);

    oscGain.gain.setValueAtTime(0.05, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.3);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  /**
   * Power Boost Overdrive Surge
   */
  public playPowerBoost(active: boolean) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (active) {
      // Ascending turbine surge
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(960, now + 0.7);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(3800, now + 0.7);
      filter.Q.value = 6;

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.9);

      // Deep sub impact at peak
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(65, now + 0.4);
      sub.frequency.exponentialRampToValueAtTime(35, now + 0.9);

      subGain.gain.setValueAtTime(0, now + 0.35);
      subGain.gain.linearRampToValueAtTime(0.25, now + 0.45);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

      sub.connect(subGain);
      subGain.connect(ctx.destination);

      sub.start(now + 0.35);
      sub.stop(now + 1.0);

      // Raise ambient hum pitch if running
      if (this.ambientOsc1 && this.ambientFilter) {
        this.ambientOsc1.frequency.setTargetAtTime(90, now, 0.4);
        this.ambientFilter.frequency.setTargetAtTime(700, now, 0.4);
      }
    } else {
      // Wind down
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.5);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.55);

      if (this.ambientOsc1 && this.ambientFilter) {
        this.ambientOsc1.frequency.setTargetAtTime(60, now, 0.3);
        this.ambientFilter.frequency.setTargetAtTime(350, now, 0.3);
      }
    }
  }

  /**
   * Dramatic Cinematic Startup Sequence Sound
   */
  public playStartup() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Phase 1: Sub-bass electrical charge buildup
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(40, now);
    subOsc.frequency.exponentialRampToValueAtTime(140, now + 2.0);

    subGain.gain.setValueAtTime(0.01, now);
    subGain.gain.linearRampToValueAtTime(0.18, now + 1.8);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.6);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 2.7);

    // Phase 2: Sequential coil charging clicks (10 pulses across 1.5s)
    for (let i = 0; i < 10; i++) {
      const clickTime = now + 0.4 + i * 0.14;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300 + i * 90, clickTime);

      gain.gain.setValueAtTime(0.08, clickTime);
      gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(clickTime);
      osc.stop(clickTime + 0.06);
    }

    // Phase 3: High resonance turbine windup
    const turbine = ctx.createOscillator();
    const turbineFilter = ctx.createBiquadFilter();
    const turbineGain = ctx.createGain();

    turbine.type = 'sawtooth';
    turbine.frequency.setValueAtTime(80, now + 0.8);
    turbine.frequency.exponentialRampToValueAtTime(1400, now + 2.5);

    turbineFilter.type = 'bandpass';
    turbineFilter.frequency.setValueAtTime(200, now + 0.8);
    turbineFilter.frequency.exponentialRampToValueAtTime(2800, now + 2.5);
    turbineFilter.Q.value = 7;

    turbineGain.gain.setValueAtTime(0.001, now + 0.8);
    turbineGain.gain.linearRampToValueAtTime(0.16, now + 2.2);
    turbineGain.gain.exponentialRampToValueAtTime(0.001, now + 2.7);

    turbine.connect(turbineFilter);
    turbineFilter.connect(turbineGain);
    turbineGain.connect(ctx.destination);

    turbine.start(now + 0.8);
    turbine.stop(now + 2.8);

    // Phase 4: Big Arc Reactor Ignition Blast at 2.5s!
    const blastTime = now + 2.45;
    const blastSub = ctx.createOscillator();
    const blastSubGain = ctx.createGain();
    blastSub.type = 'sine';
    blastSub.frequency.setValueAtTime(120, blastTime);
    blastSub.frequency.exponentialRampToValueAtTime(32, blastTime + 1.2);

    blastSubGain.gain.setValueAtTime(0.35, blastTime);
    blastSubGain.gain.exponentialRampToValueAtTime(0.001, blastTime + 1.4);

    blastSub.connect(blastSubGain);
    blastSubGain.connect(ctx.destination);
    blastSub.start(blastTime);
    blastSub.stop(blastTime + 1.5);

    // Plasma discharge crackle
    const bufferSize = ctx.sampleRate * 0.8;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.2));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const nFilter = ctx.createBiquadFilter();
    nFilter.type = 'lowpass';
    nFilter.frequency.setValueAtTime(3500, blastTime);
    nFilter.frequency.exponentialRampToValueAtTime(400, blastTime + 0.8);

    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.2, blastTime);
    nGain.gain.exponentialRampToValueAtTime(0.001, blastTime + 0.9);

    noise.connect(nFilter);
    nFilter.connect(nGain);
    nGain.connect(ctx.destination);
    noise.start(blastTime);
    noise.stop(blastTime + 1.0);

    // Start ambient continuous hum right after ignition
    setTimeout(() => {
      this.startAmbientHum();
    }, 2500);
  }

  /**
   * Continuous Sub-Bass Plasma Hum
   */
  public startAmbientHum() {
    if (this.isHumming) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.isHumming = true;
    const now = ctx.currentTime;

    this.ambientGain = ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.001, now);
    this.ambientGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.07, now + 1.0);

    this.ambientFilter = ctx.createBiquadFilter();
    this.ambientFilter.type = 'lowpass';
    this.ambientFilter.frequency.setValueAtTime(350, now);

    this.ambientOsc1 = ctx.createOscillator();
    this.ambientOsc1.type = 'triangle';
    this.ambientOsc1.frequency.setValueAtTime(60, now); // 60Hz hum

    this.ambientOsc2 = ctx.createOscillator();
    this.ambientOsc2.type = 'sine';
    this.ambientOsc2.frequency.setValueAtTime(120, now); // 2nd harmonic

    // Gentle LFO modulation
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.5, now);
    lfoGain.gain.setValueAtTime(15, now);

    lfo.connect(this.ambientFilter.frequency);
    lfo.start();

    this.ambientOsc1.connect(this.ambientFilter);
    this.ambientOsc2.connect(this.ambientFilter);
    this.ambientFilter.connect(this.ambientGain);
    this.ambientGain.connect(ctx.destination);

    this.ambientOsc1.start();
    this.ambientOsc2.start();
  }

  public stopAmbientHum() {
    if (!this.isHumming) return;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
    }
    setTimeout(() => {
      try {
        this.ambientOsc1?.stop();
        this.ambientOsc2?.stop();
        this.ambientOsc1?.disconnect();
        this.ambientOsc2?.disconnect();
        this.ambientGain?.disconnect();
      } catch {
        // ignore already stopped
      }
      this.isHumming = false;
    }, 400);
  }
}

export const soundEngine = new SoundEngine();
