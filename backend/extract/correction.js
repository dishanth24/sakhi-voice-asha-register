/**
 * Sakhi Voice — Correction Parser
 * Parses vocal corrections such as:
 * - "no, weight is 2.8 kilo" -> { field: 'weight_kg', value: 2.8 }
 * - "nahi, wazan 3 kilo" -> { field: 'weight_kg', value: 3.0 }
 * - "nahi, naam Sunita hai" -> { field: 'beneficiary_name', value: 'Sunita' }
 * - "next visit 20th" -> { field: 'next_visit_date', value: '2026-11-20' }
 */

const { extractNumber } = require('./numbers');
const { parseDate } = require('./dates');

function parseCorrection(transcript) {
  if (!transcript) return null;
  const text = transcript.trim();
  const lower = text.toLowerCase();

  // Name correction
  const nameMatch = lower.match(/(?:nahi|no|change|correct)?.*?(?:naam|name)\s+(?:hai\s+)?([A-Za-z\u0900-\u097F\s]+)/i) ||
                    text.match(/(?:नहीं|बदलो|नाम)\s+(?:नाम\s+)?([A-Za-z\u0900-\u097F\s]+?)(?:\s+है|\s+hai|$)/i);
  if (nameMatch && !nameMatch[1].includes('kilo') && !nameMatch[1].includes('date')) {
    const cleanName = nameMatch[1].replace(/hai|is|tha|ko|है|था|को/gi, '').trim();
    if (cleanName.length > 1) {
      return { field: 'beneficiary_name', value: cleanName, source: text };
    }
  }

  // Weight correction
  if (lower.includes('weight') || lower.includes('wazan') || lower.includes('kilo') || lower.includes('kg') || text.includes('वजन') || text.includes('किलो')) {
    const num = extractNumber(lower);
    if (num && num.value) {
      return { field: 'weight_kg', value: num.value, source: text };
    }
  }

  // BP correction
  const bpMatch = text.match(/(?:bp|blood\s*pressure)\s*(?:is|:)?\s*(\d{2,3})\s*(?:\/|over|by)\s*(\d{2,3})/i);
  if (bpMatch) {
    return { field: 'bp_systolic', value: parseInt(bpMatch[1], 10), extra: { bp_diastolic: parseInt(bpMatch[2], 10) }, source: text };
  }

  // Next visit date correction
  if (lower.includes('visit') || lower.includes('tarikh') || lower.includes('tareekh') || lower.includes('date') || lower.includes('aana') || text.includes('तारीख') || text.includes('विज़िट')) {
    const parsedD = parseDate(lower);
    if (parsedD && parsedD.value) {
      return { field: 'next_visit_date', value: parsedD.value, source: text };
    }
  }

  // Fallback: check if just a weight was spoken e.g. "3 kilo", "2.8 kilo"
  const generalNum = extractNumber(lower);
  if (generalNum && (lower.includes('kilo') || lower.includes('kg'))) {
    return { field: 'weight_kg', value: generalNum.value, source: text };
  }

  return null;
}

module.exports = { parseCorrection };
