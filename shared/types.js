/**
 * Sakhi Voice: ASHA Voice Register — Shared Type Definitions & JSON Schemas
 * Used by both backend and frontend
 */

// ─── Visit Types ───
const VISIT_TYPES = ['ANC', 'Newborn', 'Immunisation', 'PNC', 'Other'];

// ─── Conversation States ───
const STATES = {
  GREETING: 'GREETING',
  LISTENING: 'LISTENING',
  EXTRACTING: 'EXTRACTING',
  READBACK: 'READBACK',
  CORRECTING: 'CORRECTING',
  SAVED: 'SAVED',
  ESCALATING: 'ESCALATING',
};

// ─── Visit Record Schema ───
const visitFieldSchema = {
  beneficiary_id: { type: 'string', label_en: 'Beneficiary ID', label_hi: 'लाभार्थी आईडी' },
  beneficiary_name: { type: 'string', label_en: 'Name', label_hi: 'नाम' },
  visit_type: { type: 'enum', values: VISIT_TYPES, label_en: 'Visit Type', label_hi: 'विज़िट का प्रकार' },
  weight_kg: { type: 'number', unit: 'kg', label_en: 'Weight (kg)', label_hi: 'वज़न (किलो)' },
  bp_systolic: { type: 'number', label_en: 'BP Systolic', label_hi: 'बीपी सिस्टोलिक' },
  bp_diastolic: { type: 'number', label_en: 'BP Diastolic', label_hi: 'बीपी डायस्टोलिक' },
  hemoglobin: { type: 'number', unit: 'g/dL', label_en: 'Hemoglobin', label_hi: 'हीमोग्लोबिन' },
  temperature: { type: 'number', unit: '°F', label_en: 'Temperature', label_hi: 'तापमान' },
  vaccinations_given: { type: 'array', label_en: 'Vaccinations Given', label_hi: 'दिए गए टीके' },
  vaccinations_due: { type: 'array', label_en: 'Vaccinations Due', label_hi: 'बाकी टीके' },
  ifa_tablets: { type: 'boolean', label_en: 'IFA Tablets Given', label_hi: 'आयरन की गोली दी' },
  tt_injection: { type: 'boolean', label_en: 'TT Injection Given', label_hi: 'टीटी का टीका दिया' },
  next_visit_date: { type: 'date', label_en: 'Next Visit Date', label_hi: 'अगली विज़िट की तारीख' },
  gestational_weeks: { type: 'number', label_en: 'Gestational Weeks', label_hi: 'गर्भावस्था के हफ्ते' },
  notes: { type: 'string', label_en: 'Notes', label_hi: 'नोट्स' },
  danger_signs: { type: 'array', label_en: 'Danger Signs', label_hi: 'खतरे के संकेत' },
  flagged: { type: 'boolean', label_en: 'Flagged for Referral', label_hi: 'रेफरल के लिए चिह्नित' },
  referred_to_phc: { type: 'boolean', label_en: 'Referred to PHC', label_hi: 'PHC को रेफर किया' },
};

// ─── Follow-up Task ───
const followUpTypes = ['next_visit', 'vaccination_due', 'referral_followup', 'custom'];

// ─── Confidence levels ───
const CONFIDENCE = {
  HIGH: 0.85,
  MEDIUM: 0.6,
  LOW: 0.3,
};

module.exports = {
  VISIT_TYPES,
  STATES,
  visitFieldSchema,
  followUpTypes,
  CONFIDENCE,
};
