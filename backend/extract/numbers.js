/**
 * Sakhi Voice — Hindi/English Number Parser
 *
 * Parses numbers from spoken Hindi (Roman + Devanagari), English, and mixed text.
 * Handles: digits, English words, Hindi words, fractions (dhai, dedh, saade, paune),
 * decimals, and spoken digit sequences.
 */

// ─── Hindi number words (Roman) ───
const HINDI_UNITS = {
  'ek': 1, 'do': 2, 'teen': 3, 'char': 4, 'paanch': 5, 'panch': 5,
  'chhe': 6, 'chha': 6, 'saat': 7, 'aath': 8, 'nau': 9, 'das': 10,
  'gyarah': 11, 'barah': 12, 'terah': 13, 'chaudah': 14, 'pandrah': 15,
  'solah': 16, 'satrah': 17, 'atharah': 18, 'unnis': 19,
};

const HINDI_TENS = {
  'bees': 20, 'ikkis': 21, 'bais': 22, 'teis': 23, 'chaubis': 24,
  'pachchis': 25, 'chhabbis': 26, 'sattais': 27, 'atthaais': 28, 'untees': 29,
  'tees': 30, 'iktees': 31, 'battees': 32, 'taintees': 33, 'chauntees': 34,
  'paintees': 35, 'chhattees': 36, 'saintees': 37, 'adtees': 38, 'untaalees': 39,
  'chaalees': 40, 'iktaalees': 41, 'bayaalees': 42, 'taintaalees': 43, 'chavaalees': 44,
  'paintaalees': 45, 'chhiyaalees': 46, 'saintaalees': 47, 'adtaalees': 48, 'unchaas': 49,
  'pachaas': 50, 'ikyaavan': 51, 'baavan': 52, 'tirpan': 53, 'chauvan': 54,
  'pachpan': 55, 'chhappan': 56, 'sattaavan': 57, 'athaavan': 58, 'unsath': 59,
  'saath': 60, 'iksath': 61, 'baasath': 62, 'tirsath': 63, 'chaunsath': 64,
  'painsath': 65, 'chhiyaasath': 66, 'sadsath': 67, 'adsath': 68, 'unhattar': 69,
  'sattar': 70, 'ikattar': 71, 'bahattar': 72, 'tihattar': 73, 'chauhattar': 74,
  'pachattar': 75, 'chhattar': 76, 'satattar': 77, 'athattar': 78, 'unnaasi': 79,
  'assi': 80, 'ikyaasi': 81, 'bayaasi': 82, 'tiraasi': 83, 'chauraasi': 84,
  'pachaasi': 85, 'chhiyaasi': 86, 'sataasi': 87, 'athaasi': 88, 'navaasi': 89,
  'nabbe': 90, 'ikyaanave': 91, 'baanave': 92, 'tiraanave': 93, 'chauraanave': 94,
  'pachaanave': 95, 'chhiyaanave': 96, 'sattaanave': 97, 'atthaanave': 98, 'ninyaanave': 99,
};

const HINDI_MULTIPLIERS = {
  'sau': 100, 'hazaar': 1000, 'hazar': 1000, 'lakh': 100000, 'crore': 10000000,
};

// ─── English number words ───
const ENGLISH_UNITS = {
  'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
  'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19,
};

const ENGLISH_TENS = {
  'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
  'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90,
};

const ENGLISH_MULTIPLIERS = {
  'hundred': 100, 'thousand': 1000, 'lakh': 100000, 'million': 1000000,
};

// ─── Hindi Devanagari digits ───
const DEVANAGARI_DIGITS = {
  '०': 0, '१': 1, '२': 2, '३': 3, '४': 4,
  '५': 5, '६': 6, '७': 7, '८': 8, '९': 9,
};

const HINDI_DEVANAGARI_NUMBERS = {
  'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पाँच': 5, 'पांच': 5,
  'छह': 6, 'छ:': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
  'ग्यारह': 11, 'बारह': 12, 'तेरह': 13, 'चौदह': 14, 'पंद्रह': 15,
  'सोलह': 16, 'सत्रह': 17, 'अठारह': 18, 'उन्नीस': 19, 'बीस': 20,
  'तीस': 30, 'चालीस': 40, 'पचास': 50, 'साठ': 60, 'सत्तर': 70,
  'अस्सी': 80, 'नब्बे': 90, 'सौ': 100, 'हज़ार': 1000, 'हजार': 1000,
  'लाख': 100000, 'करोड़': 10000000,
  'बावन': 52, 'अड़तालीस': 48, 'अड़सठ': 68,
};

// ─── Fractional values ───
const FRACTIONAL = {
  'dhai': 2.5, 'dhaai': 2.5, 'ढाई': 2.5,
  'dedh': 1.5, 'derh': 1.5, 'डेढ़': 1.5, 'डेढ': 1.5,
};

// All combined number words for lookup
const ALL_NUMBER_WORDS = {
  ...HINDI_UNITS, ...HINDI_TENS, ...HINDI_MULTIPLIERS,
  ...ENGLISH_UNITS, ...ENGLISH_TENS, ...ENGLISH_MULTIPLIERS,
};

/**
 * Parse a single number from a Hindi/English word.
 * Returns the numeric value or null.
 */
function parseWordToNumber(word) {
  if (!word) return null;
  const w = word.toLowerCase().trim();

  // Check fractional
  if (FRACTIONAL[w] !== undefined) return FRACTIONAL[w];

  // Check Devanagari
  if (HINDI_DEVANAGARI_NUMBERS[w] !== undefined) return HINDI_DEVANAGARI_NUMBERS[w];

  // Check all Roman words
  if (ALL_NUMBER_WORDS[w] !== undefined) return ALL_NUMBER_WORDS[w];

  // Check digit string
  if (/^\d+(\.\d+)?$/.test(w)) return parseFloat(w);

  // Devanagari digit string
  if (/^[०-९]+$/.test(w)) {
    return parseInt(w.split('').map(d => DEVANAGARI_DIGITS[d]).join(''), 10);
  }

  return null;
}

/**
 * Parse "saade" prefix: saade + number = number + 0.5
 * "saade teen" = 3.5, "saade char" = 4.5
 */
function parseSaade(text) {
  const match = text.match(/\b(?:saade|saadhe|साढ़े|साढे)\s+(\S+)/i);
  if (match) {
    const base = parseWordToNumber(match[1]);
    if (base !== null) {
      return { value: base + 0.5, match: match[0] };
    }
  }
  return null;
}

/**
 * Parse "paune" prefix: paune + number = number - 0.25
 * "paune char" = 3.75, "paune paanch" = 4.75
 */
function parsePaune(text) {
  const match = text.match(/\b(?:paune|paunay|पौने)\s+(\S+)/i);
  if (match) {
    const base = parseWordToNumber(match[1]);
    if (base !== null) {
      return { value: base - 0.25, match: match[0] };
    }
  }
  return null;
}

/**
 * Parse decimal spoken forms: "2 point 8", "do point aath", "2.8"
 */
function parseDecimal(text) {
  // Direct decimal: "2.8", "10.5"
  const directMatch = text.match(/\b(\d+)\.(\d+)\b/);
  if (directMatch) {
    return { value: parseFloat(directMatch[0]), match: directMatch[0] };
  }

  // Spoken: "X point Y"
  const spokenMatch = text.match(/\b(\S+)\s+point\s+(\S+)\b/i);
  if (spokenMatch) {
    const intPart = parseWordToNumber(spokenMatch[1]);
    const decPart = parseWordToNumber(spokenMatch[2]);
    if (intPart !== null && decPart !== null) {
      // decPart as decimal: if "aath" (8), result is X.8
      const decStr = String(decPart);
      const value = intPart + parseFloat('0.' + decStr);
      return { value, match: spokenMatch[0] };
    }
  }

  return null;
}

/**
 * Parse spoken digit sequences: "char paanch do ek" → "4521"
 * Used for IDs. Each word maps to a single digit.
 */
function parseDigitSequence(text) {
  const words = text.trim().split(/\s+/);
  let digits = '';
  let allDigits = true;

  for (const w of words) {
    const num = parseWordToNumber(w.toLowerCase());
    if (num !== null && num >= 0 && num <= 9) {
      digits += String(num);
    } else if (/^\d$/.test(w)) {
      digits += w;
    } else {
      allDigits = false;
      break;
    }
  }

  if (allDigits && digits.length > 1) {
    return digits;
  }
  return null;
}

/**
 * Extract the first number from a text string.
 * Tries fractional, saade, paune, decimal, then word/digit parsing.
 * Returns { value, match } or null.
 */
function extractNumber(text) {
  if (!text) return null;
  const t = text.trim().toLowerCase();

  // Try fractional words first
  for (const [word, val] of Object.entries(FRACTIONAL)) {
    if (t.includes(word)) {
      return { value: val, match: word };
    }
  }

  // Try saade
  const saade = parseSaade(t);
  if (saade) return saade;

  // Try paune
  const paune = parsePaune(t);
  if (paune) return paune;

  // Try decimal
  const dec = parseDecimal(t);
  if (dec) return dec;

  // Try direct digits
  const digitMatch = t.match(/\b\d+(\.\d+)?\b/);
  if (digitMatch) {
    return { value: parseFloat(digitMatch[0]), match: digitMatch[0] };
  }

  // Try word numbers
  const words = t.split(/\s+/);
  for (const w of words) {
    const num = parseWordToNumber(w);
    if (num !== null) {
      return { value: num, match: w };
    }
  }

  return null;
}

/**
 * Parse a compound number from a string of words.
 * E.g., "ek sau baavan" → 152, "do hazaar" → 2000
 */
function parseCompoundNumber(text) {
  if (!text) return null;
  const words = text.trim().toLowerCase().split(/\s+/);
  let total = 0;
  let current = 0;

  for (const w of words) {
    if (HINDI_MULTIPLIERS[w] || ENGLISH_MULTIPLIERS[w]) {
      const mult = HINDI_MULTIPLIERS[w] || ENGLISH_MULTIPLIERS[w];
      if (current === 0) current = 1;
      current *= mult;
      if (mult >= 1000) {
        total += current;
        current = 0;
      }
    } else {
      const num = parseWordToNumber(w);
      if (num !== null) {
        current += num;
      }
    }
  }

  total += current;
  return total > 0 ? total : null;
}

module.exports = {
  parseWordToNumber,
  parseSaade,
  parsePaune,
  parseDecimal,
  parseDigitSequence,
  extractNumber,
  parseCompoundNumber,
  FRACTIONAL,
  HINDI_UNITS,
  HINDI_TENS,
  HINDI_MULTIPLIERS,
  ENGLISH_UNITS,
  ENGLISH_TENS,
  ENGLISH_MULTIPLIERS,
  HINDI_DEVANAGARI_NUMBERS,
  DEVANAGARI_DIGITS,
};
