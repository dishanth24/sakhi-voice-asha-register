import { describe, it, expect } from 'vitest';
import { parseCorrection } from '../extract/correction';

describe('Voice Correction Parser', () => {
  it('parses weight corrections', () => {
    const c1 = parseCorrection('no, weight is 2.8 kilo');
    expect(c1.field).toBe('weight_kg');
    expect(c1.value).toBe(2.8);

    const c2 = parseCorrection('nahi, wazan 3 kilo');
    expect(c2.field).toBe('weight_kg');
    expect(c2.value).toBe(3);
  });

  it('parses name corrections', () => {
    const c = parseCorrection('nahi, naam Sunita Devi hai');
    expect(c.field).toBe('beneficiary_name');
    expect(c.value.toLowerCase()).toContain('sunita');
  });
});
