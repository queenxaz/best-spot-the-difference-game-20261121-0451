// Tiny WebAudio synth: every sound is generated, no audio files.
// A short chime for a found difference, a low buzz for a miss,
// a soft pluck for a hint, and a little arpeggio for a level clear.
export function createAudio() {
  let ctx = null;
  let enabled = true;

  function ensure() {
    if (!ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        ctx = new AC();
      } catch {
        ctx = null;
      }
    }
    if (ctx && ctx.state === 'suspended') void ctx.resume();
    return ctx;
  }

  /** Play one oscillator note. */
  function tone(freq, when, dur, type, vol) {
    const ac = ensure();
    if (!ac || !enabled) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t0 = ac.currentTime + when;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  return {
    unlock() { ensure(); },
    toggle() { enabled = !enabled; return enabled; },
    get enabled() { return enabled; },
    found(combo) {
      const base = 660 + Math.min(combo, 8) * 40;
      tone(base, 0, 0.14, 'sine', 0.22);
      tone(base * 1.5, 0.07, 0.2, 'sine', 0.2);
    },
    wrong() { tone(140, 0, 0.18, 'sawtooth', 0.1); },
    hint() { tone(880, 0, 0.1, 'triangle', 0.16); tone(1174, 0.09, 0.16, 'triangle', 0.14); },
    clear() {
      [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.24, 'triangle', 0.18));
    },
    victory() {
      [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => tone(f, i * 0.12, 0.3, 'triangle', 0.16));
    },
    over() { [392, 330, 262].forEach((f, i) => tone(f, i * 0.16, 0.26, 'sine', 0.16)); },
    tick() { tone(1200, 0, 0.05, 'square', 0.05); },
    click() { tone(520, 0, 0.06, 'triangle', 0.12); },
  };
}
