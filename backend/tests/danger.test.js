import { describe, it, expect } from 'vitest';
import { detectDangerSigns } from '../danger/detector';
import testDictations from '../../shared/test-dictations.json';

describe('Danger Sign Detection Engine (100% Target Recall)', () => {
  const positiveSamples = testDictations.filter(t => t.has_danger_sign);
  const negativeSamples = testDictations.filter(t => !t.has_danger_sign);

  it('detects danger signs in all positive test samples (100% Recall)', () => {
    let detectedCount = 0;
    for (const sample of positiveSamples) {
      const detected = detectDangerSigns(sample.transcript);
      if (detected.length > 0) {
        detectedCount++;
      } else {
        console.error(`FAILED TO DETECT DANGER IN: "${sample.transcript}"`);
      }
    }
    expect(detectedCount).toBe(positiveSamples.length);
  });

  it('does not falsely trigger on explicit negations', () => {
    const neg1 = "Meena Kumari ANC visit, no bleeding, no headache, everything normal";
    const neg2 = "Geeta Bai ka ANC checkup, khoon nahi aa raha hai, sab theek hai";

    expect(detectDangerSigns(neg1).length).toBe(0);
    expect(detectDangerSigns(neg2).length).toBe(0);
  });

  // Additional 20+ variations across English, Devanagari, and Roman Hindi
  const additionalCases = [
    { text: "Patient has convulsions and eclampsia", positive: true },
    { text: "Bache ko jhatke aa rahe hain", positive: true },
    { text: "शिशु को दौरे पड़ रहे हैं", positive: true },
    { text: "Baby is lethargic and unresponsive", positive: true },
    { text: "Navjaat sust hai bilkul response nahi de raha", positive: true },
    { text: "Severe swelling in hands and face with high BP", positive: true },
    { text: "Pet mein bahut tez dard ho raha hai", positive: true },
    { text: "Neeche se paani aa raha hai prabhavit", positive: true },
    { text: "High fever 104 with severe body pain postpartum", positive: true },
    { text: "Newborn cord stump is red with foul pus", positive: true },
    { text: "Routine visit, beneficiary is completely fine, BP normal", positive: false },
    { text: "Baby is feeding well, smiling, weight 3.5 kg", positive: false },
    { text: "Koi taklif nahi hai, sab achha hai", positive: false },
    { text: "No danger signs observed today", positive: false }
  ];

  it('detects all additional danger variations with zero false negatives', () => {
    for (const testCase of additionalCases) {
      const signs = detectDangerSigns(testCase.text);
      if (testCase.positive) {
        expect(signs.length).toBeGreaterThan(0);
      } else {
        expect(signs.length).toBe(0);
      }
    }
  });
});
