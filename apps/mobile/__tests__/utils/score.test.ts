import { toScaled, fromScaled } from '../../src/utils/score';

describe('score utils conversion', () => {
  // Not expected to be clamped, that's the job of clampScoreOptional
  test('toScaled converts from decimals', () => {
    expect(toScaled(0)).toBe(0);
    expect(toScaled(8.5)).toBe(8500);
    expect(toScaled(10)).toBe(10000);
  });

  test('toScaled rounds decimals with 4 decimal places', () => {
    expect(toScaled(0.0004)).toBe(0);
    expect(toScaled(0.0005)).toBe(1);
    expect(toScaled(0.0006)).toBe(1);
  });

  test('fromScaled converts to decimals', () => {
    expect(fromScaled(0)).toBe(0);
    expect(fromScaled(3500)).toBe(3.5);
    expect(fromScaled(9999)).toBe(9.999);
  });

  test('fromScaled rounds decimals with 4 decimal places', () => {
    expect(fromScaled(0.1)).toBe(0.000);
    expect(fromScaled(0.5)).toBe(0.001);
    expect(fromScaled(0.75)).toBe(0.001);
  });

  test('round-trip within 3 decimals', () => {
    for (const v of [0, 7.123, 9.999, 10]) {
      expect(fromScaled(toScaled(v))).toBeCloseTo(v, 3);
    }
  });
});

import { clampScoreOptional, formatScore, MAX_SCORE, MIN_SCORE } from '../../src/utils/score';

describe('rating model utils', () => {
  test('clampScoreOptional handles null/undefined/NaN', () => {
    expect(clampScoreOptional(undefined)).toBeNull();
    expect(clampScoreOptional(null)).toBeNull();
    expect(clampScoreOptional(NaN)).toBeNull();
  });

  test('clampScoreOptional clamps to bounds', () => {
    expect(clampScoreOptional(-10)).toBe(MIN_SCORE);
    expect(clampScoreOptional(12456)).toBe(MAX_SCORE);
    expect(clampScoreOptional(8500)).toBe(8500);
  });

  test('clampScoreOptional rounds', () => {
    expect(clampScoreOptional(123.4)).toBe(123);
  });

  test('formatScore formats scaled ints', () => {
    expect(formatScore(0)).toBe('0.000');
    expect(formatScore(1)).toBe('0.001');
    expect(formatScore(9999)).toBe('9.999');
    expect(formatScore(10000)).toBe('10.000');
  });

  test('formatScore rounds to 3 decimals', () => {
    expect(formatScore(0.5)).toBe('0.001');
    expect(formatScore(0.3)).toBe('0.000');
  });

});


