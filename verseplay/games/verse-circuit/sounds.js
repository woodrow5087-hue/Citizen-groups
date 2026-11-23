// Optional synthesized audio; failures never block play. Original envelope preserved.
export function createSound(enabled) {
  let audioCtx;
  return (freq = 480) => {
    if (!enabled()) return;
    try {
      audioCtx =
        audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime,
        osc = audioCtx.createOscillator(),
        g = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.17, now + 0.085);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.05, now + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      osc.connect(g);
      g.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.17);
    } catch {}
  };
}
