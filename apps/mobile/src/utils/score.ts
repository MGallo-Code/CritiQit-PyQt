export const MAX_SCORE = 10000;
export const MIN_SCORE = 0;

export function clampScoreOptional(score?: number | null): number | null {
  if (score == null || Number.isNaN(score)) return null;
  return Math.max(MIN_SCORE, Math.min(MAX_SCORE, Math.round(score)));
}

export function formatScore(score: number): string {
  const value = score / 1000; // 3 decimal places
  return value.toFixed(3);
}

export function toScaled(score: number): number {
  return Math.round(score * 1000);
}

export function fromScaled(score: number): number {
  return Math.round(score) / 1000;
}


