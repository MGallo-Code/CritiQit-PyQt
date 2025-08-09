export function toScaled(score: number): number {
  // accepts 0..10 or 0..10000; if <= 10, assume decimal scale *1000
  if (score <= 10) return Math.round(score * 1000);
  return Math.round(score);
}

export function fromScaled(score: number): number {
  return Math.round(score) / 1000;
}


