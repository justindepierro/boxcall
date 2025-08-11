import { describe, it, expect } from 'vitest';
import { canonicalizePlayInput, computeDuplicateKey } from '../../utils/playDataStandardization';

describe('playDataStandardization', () => {
  it('canonicalizes play name trimming and casing', () => {
    const c = canonicalizePlayInput({ play_name: '  Power O  ' });
    expect(c.play_name).toBe('Power O');
  });

  it('defaults missing required fields', () => {
    const c = canonicalizePlayInput({});
    expect(c.play_name).toBe('Untitled Play');
    expect(c.p_type).toBe('Pass');
  });

  it('computes stable duplicate key (case/space insensitive)', () => {
    const key1 = computeDuplicateKey({ play_name: 'Power O', formation: 'Trips Rt' });
    const key2 = computeDuplicateKey({ play_name: 'power   o', formation: '  trips  rt ' });
    expect(key1).toBe(key2);
  });

  it('produces different keys for different formations', () => {
    const k1 = computeDuplicateKey({ play_name: 'Power O', formation: 'Trips' });
    const k2 = computeDuplicateKey({ play_name: 'Power O', formation: 'I Right' });
    expect(k1).not.toBe(k2);
  });
});
