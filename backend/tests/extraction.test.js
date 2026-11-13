import { describe, it, expect } from 'vitest';
import { extractNumber, parseSaade, parseDigitSequence } from '../extract/numbers';
import { parseDate } from '../extract/dates';
import { extractVisit } from '../extract/extractor';
import testDictations from '../../shared/test-dictations.json';

describe('Number and Date Extraction', () => {
  it('parses fractions (dhai, dedh)', () => {
    expect(extractNumber('dhai kilo').value).toBe(2.5);
    expect(extractNumber('dedh kilo').value).toBe(1.5);
  });

  it('parses saade (3.5)', () => {
    expect(parseSaade('saade teen').value).toBe(3.5);
    expect(extractNumber('saade teen kilo').value).toBe(3.5);
  });

  it('parses decimals and digit sequences', () => {
    expect(extractNumber('2.8 kilo').value).toBe(2.8);
    expect(parseDigitSequence('char paanch do ek')).toBe('4521');
  });

  it('parses relative dates', () => {
    const today = new Date('2026-11-13T00:00:00Z');
    expect(parseDate('kal', today).value).toBe('2026-11-14');
    expect(parseDate('parso', today).value).toBe('2026-11-15');
    expect(parseDate('agle hafte', today).value).toBe('2026-11-20');
  });
});

describe('Visit Extraction on Test Dictations', () => {
  it('extracts ANC visit data correctly', () => {
    const sample = testDictations[0];
    const res = extractVisit(sample.transcript);
    expect(res.fields.beneficiary_name).toBe('Sunita Devi');
    expect(res.fields.beneficiary_id).toBe('4521');
    expect(res.fields.visit_type).toBe('ANC');
    expect(res.fields.weight_kg).toBe(52);
    expect(res.fields.ifa_tablets).toBe(true);
    expect(res.fields.tt_injection).toBe(true);
  });

  it('extracts newborn visit with dhai kilo', () => {
    const sample = testDictations[2];
    const res = extractVisit(sample.transcript);
    expect(res.fields.visit_type).toBe('Newborn');
    expect(res.fields.weight_kg).toBe(2.5);
  });
});
