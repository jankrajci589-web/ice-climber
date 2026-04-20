// Generates all sounds procedurally via Web Audio API — no audio files needed.
const SoundManager = (() => {
  let ctx = null;

  function _getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  function _tone({ type = 'sine', freq = 440, freq2 = null, gain = 0.3,
    duration = 0.15, delay = 0, attack = 0.01, decay = 0.1 }) {
    const ac = _getCtx();
    const t = ac.currentTime + delay;

    const osc = ac.createOscillator();
    const gainNode = ac.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (freq2 !== null) {
      osc.frequency.linearRampToValueAtTime(freq2, t + duration);
    }

    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(gain, t + attack);
    gainNode.gain.linearRampToValueAtTime(0, t + duration);

    osc.connect(gainNode);
    gainNode.connect(ac.destination);

    osc.start(t);
    osc.stop(t + duration + 0.01);
  }

  function _noise(duration = 0.1, gain = 0.15, delay = 0) {
    const ac = _getCtx();
    const t = ac.currentTime + delay;
    const bufSize = ac.sampleRate * duration;
    const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

    const src = ac.createBufferSource();
    src.buffer = buf;

    const gainNode = ac.createGain();
    gainNode.gain.setValueAtTime(gain, t);
    gainNode.gain.linearRampToValueAtTime(0, t + duration);

    // Low-pass filter for rumble
    const filter = ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;

    src.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ac.destination);

    src.start(t);
    src.stop(t + duration);
  }

  return {
    // Resume context on first user gesture (browser autoplay policy)
    unlock() {
      _getCtx().resume();
    },

    climb() {
      // Quick upward swoosh
      _tone({ type: 'sine', freq: 300, freq2: 520, gain: 0.18, duration: 0.18, attack: 0.01 });
      _tone({ type: 'triangle', freq: 600, freq2: 900, gain: 0.08, duration: 0.12, delay: 0.06 });
    },

    land() {
      // Soft thud on landing
      _tone({ type: 'sine', freq: 180, freq2: 100, gain: 0.25, duration: 0.12, attack: 0.005 });
      _noise(0.08, 0.12);
    },

    crack() {
      // Ice crack — sharp noise burst + low drop
      _noise(0.15, 0.3);
      _tone({ type: 'sawtooth', freq: 220, freq2: 60, gain: 0.2, duration: 0.25, attack: 0.005 });
    },

    fall() {
      // Descending scream tone
      _tone({ type: 'sawtooth', freq: 400, freq2: 80, gain: 0.22, duration: 0.6, attack: 0.01 });
      _noise(0.5, 0.2, 0.1);
    },

    avalanche() {
      // Rolling rumble
      _noise(1.2, 0.35);
      _tone({ type: 'sine', freq: 80, freq2: 40, gain: 0.3, duration: 1.0, attack: 0.05 });
    },

    cashOut() {
      // Rising arpeggio — success
      const notes = [523, 659, 784, 1047];
      notes.forEach((f, i) => {
        _tone({ type: 'triangle', freq: f, gain: 0.2, duration: 0.15, delay: i * 0.1, attack: 0.01 });
      });
    },

    milestone() {
      // 5/10/15 ledge fanfare
      const notes = [523, 784, 1047, 1318];
      notes.forEach((f, i) => {
        _tone({ type: 'triangle', freq: f, gain: 0.18, duration: 0.2, delay: i * 0.08 });
        _tone({ type: 'sine', freq: f * 1.5, gain: 0.08, duration: 0.2, delay: i * 0.08 });
      });
    },

    tick() {
      // Subtle click on button hover/press
      _tone({ type: 'sine', freq: 800, gain: 0.08, duration: 0.05, attack: 0.005 });
    },

    wind() {
      // Ambient wind — call periodically
      _noise(2.0, 0.06 + Math.random() * 0.06);
    },
  };
})();

export default SoundManager;
