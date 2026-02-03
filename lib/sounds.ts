// 抽卡音效管理
// 使用 Web Audio API 生成音效

type Rarity = 'SSR' | 'SR' | 'R' | 'N';

// 音效配置
const SOUND_CONFIG = {
  SSR: { frequency: 880, duration: 0.8, type: 'sine' as OscillatorType, gain: 0.4 },
  SR: { frequency: 660, duration: 0.6, type: 'sine' as OscillatorType, gain: 0.35 },
  R: { frequency: 520, duration: 0.4, type: 'triangle' as OscillatorType, gain: 0.3 },
  N: { frequency: 400, duration: 0.3, type: 'triangle' as OscillatorType, gain: 0.25 },
};

let audioContext: AudioContext | null = null;

// 初始化音频上下文
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
      return null;
    }
  }
  return audioContext;
}

// 播放揭示音效
export function playRevealSound(rarity: Rarity): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const config = SOUND_CONFIG[rarity];
  const now = ctx.currentTime;

  // 创建振荡器
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = config.type;
  oscillator.frequency.setValueAtTime(config.frequency, now);

  // SSR/SR 添加频率滑动效果
  if (rarity === 'SSR' || rarity === 'SR') {
    oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 1.5, now + 0.1);
    oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 1.2, now + config.duration);
  }

  // 音量包络
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(config.gain, now + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + config.duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + config.duration);

  // SSR 添加额外的和弦音
  if (rarity === 'SSR') {
    playChord(ctx, [config.frequency, config.frequency * 1.25, config.frequency * 1.5], config.duration, 0.2);
  } else if (rarity === 'SR') {
    playChord(ctx, [config.frequency, config.frequency * 1.25], config.duration * 0.8, 0.15);
  }
}

// 播放和弦
function playChord(ctx: AudioContext, frequencies: number[], duration: number, gain: number): void {
  const now = ctx.currentTime;

  frequencies.forEach((freq, i) => {
    setTimeout(() => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    }, i * 100);
  });
}

// 播放成功/收藏音效
export function playSuccessSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5

  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.1);

    gainNode.gain.setValueAtTime(0, now + i * 0.1);
    gainNode.gain.linearRampToValueAtTime(0.2, now + i * 0.1 + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now + i * 0.1);
    osc.stop(now + i * 0.1 + 0.3);
  });
}

// 播放点击音效
export function playClickSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);

  gainNode.gain.setValueAtTime(0.15, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.1);
}
