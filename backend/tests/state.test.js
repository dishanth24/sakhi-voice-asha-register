import { describe, it, expect, vi } from 'vitest';
import { ConversationSession } from '../state/machine';
import { STATES } from '../../shared/types';

describe('State Machine Transitions', () => {
  it('initializes in GREETING with AI disclosure then LISTENING', () => {
    const events = [];
    const session = new ConversationSession('test_sess', 'hi', (e) => events.push(e));
    session.start();

    expect(events.some(e => e.type === 'AGENT_SPEAK' && e.payload.disclosure)).toBe(true);
    expect(session.state).toBe(STATES.LISTENING);
  });

  it('triggers ESCALATING upon danger sign extraction', () => {
    const events = [];
    const session = new ConversationSession('test_danger', 'en', (e) => events.push(e));
    session.start();

    session.handleSpeechInput('Priya Gupta ANC visit, heavy vaginal bleeding since morning', true);

    expect(events.some(e => e.type === 'DANGER_ALERT')).toBe(true);
    expect(session.dangerSigns.length).toBeGreaterThan(0);
  });
});
