let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playClick() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    console.warn('Audio click play failed:', e);
  }
}

export function playPop() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.09);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch (e) {
    console.warn('Audio pop play failed:', e);
  }
}

export function playCoin() {
  try {
    const ctx = getAudioContext();
    const time = ctx.currentTime;
    
    // Coin consists of two notes: B5 (988Hz) for 0.07s then E6 (1319Hz) for 0.25s
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(988, time);
    osc.frequency.setValueAtTime(1319, time + 0.07);

    gain.gain.setValueAtTime(0.06, time);
    gain.gain.setValueAtTime(0.06, time + 0.07);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(time + 0.3);
  } catch (e) {
    console.warn('Audio coin play failed:', e);
  }
}

export function playPlant() {
  try {
    const ctx = getAudioContext();
    const time = ctx.currentTime;
    const duration = 0.15;
    
    // Synthesize rustle/thud using white noise buffer
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // Filter to make it a low-pitch dirt thud
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(150, time);
    filter.frequency.linearRampToValueAtTime(80, time + duration);
    filter.Q.value = 4.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.28, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noiseSource.start();
    noiseSource.stop(time + duration);
  } catch (e) {
    console.warn('Audio plant play failed:', e);
  }
}

export function playGrow() {
  // A short, bright two-note "sprout" chime — softer than a level-up fanfare.
  try {
    const ctx = getAudioContext();
    const time = ctx.currentTime;
    const notes = [659.25, 987.77]; // E5 -> B5
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time + index * 0.09);
      gain.gain.setValueAtTime(0, time + index * 0.09);
      gain.gain.linearRampToValueAtTime(0.09, time + index * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + index * 0.09 + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time + index * 0.09);
      osc.stop(time + index * 0.09 + 0.24);
    });
  } catch (e) {
    console.warn('Audio grow play failed:', e);
  }
}

export function playLevelUp() {
  try {
    const ctx = getAudioContext();
    const time = ctx.currentTime;
    const noteLength = 0.08;

    // Play retro arpeggio: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, time + index * noteLength);

      gain.gain.setValueAtTime(0, time + index * noteLength);
      gain.gain.linearRampToValueAtTime(0.05, time + index * noteLength + 0.01);
      
      const endLength = (index === notes.length - 1) ? 0.35 : noteLength;
      gain.gain.exponentialRampToValueAtTime(0.001, time + index * noteLength + endLength);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time + index * noteLength);
      osc.stop(time + index * noteLength + endLength);
    });
  } catch (e) {
    console.warn('Audio levelUp play failed:', e);
  }
}
