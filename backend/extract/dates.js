/**
 * Sakhi Voice — Date Parser
 *
 * Parses dates from spoken Hindi/English text relative to today.
 * Supports: kal, parso, agle hafte, X din baad, X tareekh, next <day>, X weeks/months.
 * Returns ISO date string (YYYY-MM-DD).
 */

const { extractNumber, parseWordToNumber } = require('./numbers');

const DAY_NAMES_EN = {
  'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
  'thursday': 4, 'friday': 5, 'saturday': 6,
};

const DAY_NAMES_HI = {
  'ravivaar': 0, 'somvaar': 1, 'mangalvaar': 2, 'budhvaar': 3,
  'guruvaar': 4, 'brihaspativaar': 4, 'shukravaar': 5, 'shanivaar': 6,
};

/**
 * Parse a date reference from text.
 * @param {string} text - The text to parse
 * @param {Date} [refDate] - Reference date (defaults to today)
 * @returns {{ value: string, match: string } | null}
 */
function parseDate(text, refDate) {
  if (!text) return null;
  const t = text.toLowerCase().trim();
  const today = refDate || new Date();
  today.setHours(0, 0, 0, 0);

  // "kal" / "tomorrow"
  if (/\bkal\b|\btomorrow\b/.test(t)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return { value: toISO(d), match: t.match(/\bkal\b|\btomorrow\b/)[0] };
  }

  // "parso" / "parson" / "day after tomorrow"
  if (/\bparso\b|\bparson\b|\bday\s+after\s+tomorrow\b/.test(t)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 2);
    const m = t.match(/\bparso\b|\bparson\b|\bday\s+after\s+tomorrow\b/);
    return { value: toISO(d), match: m[0] };
  }

  // "agle hafte" / "next week" / "agle week"
  if (/\bagle\s+hafte\b|\bnext\s+week\b|\bagle\s+week\b/.test(t)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 7);
    const m = t.match(/\bagle\s+hafte\b|\bnext\s+week\b|\bagle\s+week\b/);
    return { value: toISO(d), match: m[0] };
  }

  // "X din baad" / "X days later" / "after X days" / "X din mein" / "X din me"
  const dinMatch = t.match(/\b(\S+)\s+(?:din|days?)\s+(?:baad|later|mein|me|after)\b/i) ||
                   t.match(/\bafter\s+(\S+)\s+(?:din|days?)\b/i);
  if (dinMatch) {
    const num = parseWordToNumber(dinMatch[1]) ?? parseInt(dinMatch[1], 10);
    if (num && !isNaN(num)) {
      const d = new Date(today);
      d.setDate(d.getDate() + num);
      return { value: toISO(d), match: dinMatch[0] };
    }
  }

  // "X weeks" / "X hafte baad" / "after X weeks"
  const weekMatch = t.match(/\b(\S+)\s+(?:weeks?|hafte)\s*(?:baad|later|after)?\b/i) ||
                    t.match(/\bafter\s+(\S+)\s+(?:weeks?|hafte)\b/i);
  if (weekMatch) {
    const num = parseWordToNumber(weekMatch[1]) ?? parseInt(weekMatch[1], 10);
    if (num && !isNaN(num) && num <= 52) {
      const d = new Date(today);
      d.setDate(d.getDate() + (num * 7));
      return { value: toISO(d), match: weekMatch[0] };
    }
  }

  // "X months" / "X mahine baad"
  const monthMatch = t.match(/\b(\S+)\s+(?:months?|mahine?)\s*(?:baad|later|after)?\b/i) ||
                     t.match(/\bafter\s+(\S+)\s+(?:months?|mahine?)\b/i);
  if (monthMatch) {
    const num = parseWordToNumber(monthMatch[1]) ?? parseInt(monthMatch[1], 10);
    if (num && !isNaN(num) && num <= 12) {
      const d = new Date(today);
      d.setMonth(d.getMonth() + num);
      return { value: toISO(d), match: monthMatch[0] };
    }
  }

  // "X tareekh" / "Xth" — day of current or next month
  const tareekh = t.match(/\b(\d{1,2})\s*(?:tareekh|tarikh|tareeq)\b/i) ||
                  t.match(/\b(\d{1,2})(?:st|nd|rd|th)\b/i);
  if (tareekh) {
    const day = parseInt(tareekh[1], 10);
    if (day >= 1 && day <= 31) {
      const d = new Date(today);
      d.setDate(day);
      // If that date is in the past or today, use next month
      if (d <= today) {
        d.setMonth(d.getMonth() + 1);
      }
      return { value: toISO(d), match: tareekh[0] };
    }
  }

  // "next <day name>"
  const nextDayMatch = t.match(/\bnext\s+(\w+)\b/i);
  if (nextDayMatch) {
    const dayName = nextDayMatch[1].toLowerCase();
    const targetDay = DAY_NAMES_EN[dayName] ?? DAY_NAMES_HI[dayName];
    if (targetDay !== undefined) {
      const d = new Date(today);
      const currentDay = d.getDay();
      let daysUntil = targetDay - currentDay;
      if (daysUntil <= 0) daysUntil += 7;
      d.setDate(d.getDate() + daysUntil);
      return { value: toISO(d), match: nextDayMatch[0] };
    }
  }

  return null;
}

function toISO(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

module.exports = { parseDate };
