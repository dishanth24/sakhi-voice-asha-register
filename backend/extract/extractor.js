/**
 * Sakhi Voice — Visit Form Field Extractor
 * Rule-based extraction engine for ASHA home-visit logs.
 * Supports English, Hinglish, Devanagari Hindi, and noise tolerance.
 */

const { extractNumber, parseDigitSequence } = require('./numbers');
const { parseDate } = require('./dates');
const { detectDangerSigns } = require('../danger/detector');
const vocab = require('../vocab.json');

// List of known seed beneficiaries for fuzzy name matching
const seedBeneficiaries = require('../../shared/seed-beneficiaries.json');

/**
 * Extracts structured visit data from voice transcript.
 */
function extractVisit(transcript) {
  if (!transcript || typeof transcript !== 'string') {
    return {
      fields: {},
      danger_signs: [],
      flagged: false,
      confidence: 0,
      transcript: ''
    };
  }

  const text = transcript.trim();
  const lower = text.toLowerCase();
  const fields = {};
  const confidence = {};
  const spans = {};

  // 1. DANGER SIGNS (Highest priority)
  const danger = detectDangerSigns(text);
  const flagged = danger.length > 0;

  // 2. BENEFICIARY ID
  // e.g. "ID 4521", "MCTS number 5567", "ID number 3456", "आईडी 4521"
  let idMatch = lower.match(/(?:id\s*(?:number)?|mcts\s*(?:number)?|आईडी)\s*([0-9\s]+)/i);
  if (idMatch) {
    const rawDigits = idMatch[1].replace(/\s+/g, '');
    if (rawDigits.length >= 2) {
      fields.beneficiary_id = rawDigits;
      confidence.beneficiary_id = 0.95;
      spans.beneficiary_id = idMatch[0];
    }
  }

  // Check spoken digit sequence for ID e.g. "char paanch do ek"
  if (!fields.beneficiary_id) {
    const spokenIdMatch = lower.match(/(?:id|number)\s+([a-z\s]+)/i);
    if (spokenIdMatch) {
      const seq = parseDigitSequence(spokenIdMatch[1]);
      if (seq) {
        fields.beneficiary_id = seq;
        confidence.beneficiary_id = 0.9;
        spans.beneficiary_id = spokenIdMatch[0];
      }
    }
  }

  // 3. BENEFICIARY NAME
  // Match known names from seed data or pattern "X ka checkup / baby of X / X Devi"
  for (const b of seedBeneficiaries) {
    const nameLower = b.name.toLowerCase();
    const firstName = nameLower.split(' ')[0];
    if (lower.includes(nameLower) || lower.includes(firstName)) {
      fields.beneficiary_name = b.name;
      confidence.beneficiary_name = 0.95;
      spans.beneficiary_name = b.name;
      if (!fields.beneficiary_id && b.id) {
        fields.beneficiary_id = b.id;
      }
      break;
    }
  }

  // Name regex fallback if not matched from seed
  if (!fields.beneficiary_name) {
    const nameRegex = /([A-Z\u0900-\u097F][a-z\u0900-\u097F]+(?:\s+[A-Z\u0900-\u097F][a-z\u0900-\u097F]+)*)\s*(?:ka|ki|ke|ID|ko|devi|sharma|gupta|yadav|bai|kumari)/i;
    const nMatch = text.match(nameRegex);
    if (nMatch && nMatch[1] && nMatch[1].length > 2) {
      fields.beneficiary_name = nMatch[1].trim();
      confidence.beneficiary_name = 0.8;
      spans.beneficiary_name = nMatch[1];
    }
  }

  // 4. VISIT TYPE
  // Check vocab keywords
  for (const [type, keywords] of Object.entries(vocab.visit_type_keywords)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        fields.visit_type = type;
        confidence.visit_type = 0.95;
        spans.visit_type = kw;
        break;
      }
    }
    if (fields.visit_type) break;
  }
  if (!fields.visit_type) {
    fields.visit_type = 'Other';
    confidence.visit_type = 0.4;
  }

  // 5. WEIGHT
  // e.g. "weight 52 kg", "wazan dhai kilo", "weight 48 kilo", "wazan 3 kilo", "वजन 52 किलो"
  // Handles correction: "weight 52 kg, sorry no weight is 54 kg" -> picks the last or correction weight
  const weightMatches = [...text.matchAll(/(?:weight|wazan|वजन|wajan)\s*(?:is|tha|=|:)?\s*([a-zA-Z0-9\.\s]+?)(?:kg|kilo|किलो|gram|\,|$)/gi)];
  if (weightMatches.length > 0) {
    const targetText = weightMatches[weightMatches.length - 1][1];
    const parsedNum = extractNumber(targetText);
    if (parsedNum) {
      fields.weight_kg = parsedNum.value;
      confidence.weight_kg = 0.95;
      spans.weight_kg = weightMatches[weightMatches.length - 1][0];
    }
  } else {
    // Look for phrases like "dhai kilo" or "2.8 kilo"
    const kiloMatch = text.match(/([a-zA-Z0-9\.\s]+?)\s*(?:kilo|kg|किलो)/i);
    if (kiloMatch) {
      const parsedNum = extractNumber(kiloMatch[1]);
      if (parsedNum && parsedNum.value < 150) { // realistic human weight
        fields.weight_kg = parsedNum.value;
        confidence.weight_kg = 0.9;
        spans.weight_kg = kiloMatch[0];
      }
    }
  }

  // 6. BLOOD PRESSURE
  // "BP 120 over 80", "BP 120/80", "BP 160/110"
  const bpMatch = text.match(/(?:bp|blood\s*pressure)\s*(?:is|:)?\s*(\d{2,3})\s*(?:\/|over|by)\s*(\d{2,3})/i);
  if (bpMatch) {
    fields.bp_systolic = parseInt(bpMatch[1], 10);
    fields.bp_diastolic = parseInt(bpMatch[2], 10);
    confidence.bp_systolic = 0.95;
    confidence.bp_diastolic = 0.95;
    spans.bp = bpMatch[0];
  }

  // 7. HEMOGLOBIN
  // "hemoglobin 11", "hemo globe in ten point five", "hb 10.5"
  const hbMatch = text.match(/(?:hemoglobin|hemo\s*globe\s*in|hb)\s*(?:is|:)?\s*([a-zA-Z0-9\.\s]+)/i);
  if (hbMatch) {
    const num = extractNumber(hbMatch[1].slice(0, 20));
    if (num && num.value >= 3 && num.value <= 20) {
      fields.hemoglobin = num.value;
      confidence.hemoglobin = 0.9;
      spans.hemoglobin = hbMatch[0];
    }
  }

  // 8. TEMPERATURE
  // "temperature 103", "temp 99.4"
  const tempMatch = text.match(/(?:temperature|temp)\s*(?:is|:)?\s*(\d{2,3}(?:\.\d+)?)/i);
  if (tempMatch) {
    fields.temperature = parseFloat(tempMatch[1]);
    confidence.temperature = 0.95;
    spans.temperature = tempMatch[0];
  }

  // 9. GESTATIONAL WEEKS
  // "28 weeks pregnant", "32 weeks"
  const gestMatch = text.match(/(\d{1,2})\s*weeks?(?:\s*pregnant)?/i);
  if (gestMatch) {
    fields.gestational_weeks = parseInt(gestMatch[1], 10);
    confidence.gestational_weeks = 0.9;
    spans.gestational_weeks = gestMatch[0];
  }

  // 10. VACCINATIONS & SUPPLEMENTS
  const vaccinesGiven = [];
  for (const [kw, details] of Object.entries(vocab.mappings)) {
    if (lower.includes(kw)) {
      if (details.field === 'ifa_tablets') {
        fields.ifa_tablets = true;
        confidence.ifa_tablets = 0.95;
      } else if (details.field === 'tt_injection') {
        fields.tt_injection = true;
        confidence.tt_injection = 0.95;
      } else if (details.field === 'vaccinations_given') {
        if (!vaccinesGiven.includes(details.value)) {
          vaccinesGiven.push(details.value);
        }
      }
    }
  }
  if (vaccinesGiven.length > 0) {
    fields.vaccinations_given = vaccinesGiven;
    confidence.vaccinations_given = 0.95;
  }

  // 11. NEXT VISIT DATE
  const parsedDate = parseDate(text);
  if (parsedDate) {
    fields.next_visit_date = parsedDate.value;
    confidence.next_visit_date = 0.9;
    spans.next_visit_date = parsedDate.match;
  }

  // 12. NOTES
  fields.notes = text;

  return {
    fields,
    confidence,
    spans,
    danger_signs: danger,
    flagged,
    transcript: text
  };
}

module.exports = { extractVisit };
