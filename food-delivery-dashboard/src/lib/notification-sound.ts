const ALERT_TYPES = new Set(["order", "order_ready", "order_update"]);

export function playNotificationSound() {
  if (typeof window === "undefined") return;

  try {
    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;

    const ctx = new AudioContextCtor();
    const playTone = (frequency: number, start: number, duration: number) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.value = 0.08;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + duration);
    };

    playTone(880, ctx.currentTime, 0.12);
    playTone(1175, ctx.currentTime + 0.14, 0.18);

    window.setTimeout(() => {
      ctx.close();
    }, 500);
  } catch {
    // Ignore audio failures in unsupported browsers.
  }
}

export function shouldAlertForNotification(type: string) {
  return ALERT_TYPES.has(type);
}
