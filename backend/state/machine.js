/**
 * Sakhi Voice — Conversation State Machine
 * States: GREETING -> LISTENING -> EXTRACTING -> READBACK -> CORRECTING -> SAVED
 * Special: ESCALATING (interrupts any state when danger sign detected)
 */

const { STATES } = require('../../shared/types');
const { extractVisit } = require('../extract/extractor');
const { parseCorrection } = require('../extract/correction');
const { saveVisit } = require('../db/database');

class ConversationSession {
  constructor(sessionId, language = 'hi', onEvent = () => {}) {
    this.sessionId = sessionId;
    this.language = language; // 'hi' or 'en'
    this.state = STATES.GREETING;
    this.transcript = '';
    this.record = null;
    this.dangerSigns = [];
    this.onEvent = onEvent;
    this.created_at = new Date().toISOString();
  }

  emit(type, payload = {}) {
    this.onEvent({
      sessionId: this.sessionId,
      state: this.state,
      type,
      payload,
      timestamp: Date.now()
    });
  }

  // 1. GREETING - AI Disclosure
  start() {
    this.state = STATES.GREETING;
    const greetingText = this.language === 'en'
      ? "Hello, I am Sakhi, an AI assistant. Tell me about your visit."
      : "नमस्ते, मैं सखी हूँ, एक AI सहायक। अपनी विज़िट के बारे में बताइए।";

    this.emit('AGENT_SPEAK', {
      text: greetingText,
      disclosure: true
    });

    // Auto-transition to LISTENING
    this.state = STATES.LISTENING;
    this.emit('STATE_CHANGE', { state: this.state });
  }

  // 2. LISTENING - Receive live transcript chunk
  handleSpeechInput(text, isFinal = false) {
    if (this.state === STATES.SAVED) return;

    this.transcript = (this.transcript ? this.transcript + ' ' : '') + text;
    this.emit('TRANSCRIPT_PARTIAL', { transcript: this.transcript, partial: text });

    if (isFinal) {
      if (this.state === STATES.READBACK || this.state === STATES.CORRECTING) {
        this.handleCorrection(this.transcript);
      } else {
        this.processExtraction();
      }
    }
  }

  // 3. EXTRACTING & DANGER CHECK
  processExtraction() {
    if (!this.transcript.trim()) {
      const msg = this.language === 'en'
        ? "I didn't hear anything. Please try again."
        : "कुछ सुनाई नहीं दिया। कृपया फिर से कोशिश करें।";
      this.emit('AGENT_SPEAK', { text: msg });
      this.state = STATES.LISTENING;
      this.emit('STATE_CHANGE', { state: this.state });
      return;
    }

    this.state = STATES.EXTRACTING;
    this.emit('STATE_CHANGE', { state: this.state });

    const extraction = extractVisit(this.transcript);
    this.record = extraction.fields;
    this.dangerSigns = extraction.danger_signs;

    // Check danger signs -> ESCALATING interrupts immediately
    if (this.dangerSigns.length > 0) {
      this.state = STATES.ESCALATING;
      this.emit('STATE_CHANGE', { state: this.state });
      
      const firstSign = this.dangerSigns[0];
      const alertMsg = this.language === 'en'
        ? firstSign.referral_message_en
        : firstSign.referral_message_hi;

      this.emit('DANGER_ALERT', {
        signs: this.dangerSigns,
        audio_alert: true,
        speech_text: alertMsg
      });

      this.emit('AGENT_SPEAK', { text: alertMsg, priority: 'URGENT' });
      // Record continues to be populated so user can review and save
    }

    // Move to READBACK
    this.state = STATES.READBACK;
    this.emit('STATE_CHANGE', { state: this.state, record: this.record });
    this.readbackForm();
  }

  // 4. READBACK - Spoken verification with field highlighting
  readbackForm() {
    if (!this.record) return;

    let readbackText = '';
    const name = this.record.beneficiary_name || (this.language === 'en' ? 'Beneficiary' : 'लाभार्थी');
    const weight = this.record.weight_kg ? `${this.record.weight_kg} kg` : '';
    const type = this.record.visit_type || '';

    if (this.language === 'en') {
      readbackText = `I noted: ${name}, ${type} visit. ${weight ? 'Weight ' + weight + '.' : ''} Should I save this?`;
    } else {
      readbackText = `मैंने दर्ज किया: ${name}, ${type} विज़िट। ${weight ? 'वज़न ' + weight + '।' : ''} क्या मैं इसे सेव करूँ?`;
    }

    this.emit('AGENT_SPEAK', {
      text: readbackText,
      highlight_fields: ['beneficiary_name', 'visit_type', 'weight_kg']
    });
  }

  // 5. CORRECTING or CONFIRMING
  handleCorrection(text) {
    const lower = text.toLowerCase();
    // Check confirmation words
    if (lower.includes('yes') || lower.includes('save') || lower.includes('haan') || 
        lower.includes('ha') || lower.includes('theek hai') || lower.includes('sahi hai') || lower.includes('हाँ')) {
      this.saveRecord();
      return;
    }

    // Otherwise check for correction
    const corr = parseCorrection(text);
    if (corr) {
      this.state = STATES.CORRECTING;
      this.emit('STATE_CHANGE', { state: this.state });
      this.record[corr.field] = corr.value;

      const confirmChange = this.language === 'en'
        ? `Updated ${corr.field} to ${corr.value}. Should I save now?`
        : `बदल दिया, नया मान ${corr.value} है। अब सेव करूँ?`;

      this.emit('FIELD_CORRECTED', { field: corr.field, value: corr.value });
      this.emit('AGENT_SPEAK', { text: confirmChange });
      this.state = STATES.READBACK;
    } else {
      const clarify = this.language === 'en'
        ? "Please say yes to save, or tell me which field to change."
        : "कृपया सेव करने के लिए 'हाँ' कहें, या बताएं क्या बदलना है।";
      this.emit('AGENT_SPEAK', { text: clarify });
    }
  }

  // 6. SAVED - Persist & follow-ups
  saveRecord() {
    this.state = STATES.SAVED;
    const finalRecord = {
      ...this.record,
      danger_signs: this.dangerSigns,
      flagged: this.dangerSigns.length > 0,
      transcript: this.transcript,
      created_at: new Date().toISOString()
    };

    const saved = saveVisit(finalRecord);

    const savedText = this.language === 'en' ? "Visit successfully saved." : "विज़िट सुरक्षित रूप से सेव हो गई है।";
    this.emit('AGENT_SPEAK', { text: savedText });
    this.emit('STATE_CHANGE', { state: this.state, savedRecord: saved });
  }

  // 7. BARGE-IN: User interrupts agent speaking
  bargeIn() {
    this.emit('CANCEL_TTS');
    this.state = STATES.LISTENING;
    this.emit('STATE_CHANGE', { state: this.state, barge_in: true });
  }
}

module.exports = { ConversationSession };
