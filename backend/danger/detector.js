/**
 * Sakhi Voice — Danger Sign Detector
 * Deterministic, rule-based matching across English, Roman Hindi, and Devanagari.
 * High RECALL prioritization: When in doubt, flag!
 */

const dangerSigns = require('./danger_signs.json');

const NEGATION_PATTERNS = [
  /\b(?:no|not|without|nahi|nahin|na)\s+([a-zA-Z\u0900-\u097F\s]{1,25})/i,
  /([a-zA-Z\u0900-\u097F\s]{1,25})\s+(?:nahi\s+hai|nahin\s+hai|nahi|nahin|नहीं\s+है|नहीं)\b/i
];

/**
 * Checks if a matched keyword is negated in the sentence.
 * E.g. "no bleeding", "bleeding nahi hai", "khoon nahi aa raha"
 */
function isNegated(text, keyword) {
  const lowerText = text.toLowerCase();
  const kw = keyword.toLowerCase();

  // Explicit Hindi phrases
  if (lowerText.includes(kw + " nahi hai") || lowerText.includes(kw + " nahin hai") || lowerText.includes(kw + " नहीं है")) {
    return true;
  }
  if (lowerText.includes("no " + kw) || lowerText.includes("nahi " + kw) || lowerText.includes("nahin " + kw)) {
    return true;
  }

  // Specifically check bleeding negation like "khoon nahi aa raha"
  if ((kw.includes("khoon") || kw.includes("bleeding")) && 
      (lowerText.includes("khoon nahi") || lowerText.includes("bleeding nahi") || lowerText.includes("no bleeding") || lowerText.includes("no blood"))) {
    return true;
  }

  // Check headache negation like "no headache", "sar dard nahi hai"
  if ((kw.includes("headache") || kw.includes("sar dard")) && 
      (lowerText.includes("no headache") || lowerText.includes("sar dard nahi") || lowerText.includes("headache nahi"))) {
    return true;
  }

  return false;
}

/**
 * Detects any danger signs present in the transcript.
 * @param {string} text - Raw or cleaned transcript
 * @returns {Array<Object>} List of detected danger signs
 */
function detectDangerSigns(text) {
  if (!text || typeof text !== 'string') return [];
  const cleanText = text.toLowerCase().trim();
  const detected = [];

  for (const sign of dangerSigns) {
    let matched = false;
    let matchedKeyword = '';

    const allKeywords = [
      ...(sign.keywords_en || []),
      ...(sign.keywords_hi_devanagari || []),
      ...(sign.keywords_hi_roman || [])
    ];

    for (const kw of allKeywords) {
      const lowerKw = kw.toLowerCase();
      if (cleanText.includes(lowerKw)) {
        if (!isNegated(cleanText, lowerKw)) {
          matched = true;
          matchedKeyword = kw;
          break; // Avoid duplicate matching of the same sign
        }
      }
    }

    if (matched) {
      detected.push({
        sign_id: sign.id,
        group: sign.group,
        display_name_en: sign.display_name_en,
        display_name_hi: sign.display_name_hi,
        matched_text: matchedKeyword,
        referral_message_en: sign.referral_message_en,
        referral_message_hi: sign.referral_message_hi,
        source_citation: sign.source_citation,
        confidence: 0.98
      });
    }
  }

  return detected;
}

module.exports = {
  detectDangerSigns,
  dangerSigns
};
