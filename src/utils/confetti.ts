import confetti from 'canvas-confetti';

export function fireWinnerConfetti(): void {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0284c7', '#db2777', '#f59e0b', '#10b981', '#6366f1']
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#0284c7', '#38bdf8']
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#db2777', '#f472b6']
      });
    }, 200);
  } catch (err) {
    console.error('Confetti error:', err);
  }
}
