/**
 * Sakhi Voice — Database Layer (SQLite via better-sqlite3)
 * Implements AES-256-GCM encryption at rest for sensitive health visit records.
 */

const Database = require('better-sqlite3');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'asha_register.db');
const db = new Database(dbPath);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');

// AES-256-GCM Encryption key (from env or fallback safe 32-byte hash)
const rawKey = process.env.ENCRYPTION_KEY || 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';
const KEY = crypto.createHash('sha256').update(String(rawKey)).digest();

function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag
  };
}

function decrypt(encrypted, ivHex, tagHex) {
  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption failed:', err.message);
    return null;
  }
}

// ─── Initialize Tables ───
db.exec(`
  CREATE TABLE IF NOT EXISTS visits (
    id TEXT PRIMARY KEY,
    data_encrypted TEXT NOT NULL,
    iv TEXT NOT NULL,
    tag TEXT NOT NULL,
    beneficiary_name TEXT,
    visit_type TEXT,
    flagged INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS follow_ups (
    id TEXT PRIMARY KEY,
    visit_id TEXT,
    type TEXT NOT NULL,
    beneficiary_name TEXT NOT NULL,
    reason TEXT NOT NULL,
    due_date TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS beneficiaries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    data_json TEXT NOT NULL
  );
`);

// Seed beneficiaries if empty
const countBeneficiaries = db.prepare('SELECT COUNT(*) as count FROM beneficiaries').get().count;
if (countBeneficiaries === 0) {
  const seedFile = path.join(__dirname, '..', '..', 'shared', 'seed-beneficiaries.json');
  if (fs.existsSync(seedFile)) {
    const list = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
    const insert = db.prepare('INSERT INTO beneficiaries (id, name, data_json) VALUES (?, ?, ?)');
    for (const b of list) {
      insert.run(b.id, b.name, JSON.stringify(b));
    }
  }
}

function saveVisit(visit) {
  const id = visit.id || crypto.randomUUID();
  const now = new Date().toISOString();
  const jsonStr = JSON.stringify(visit);
  const { encrypted, iv, tag } = encrypt(jsonStr);

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO visits (id, data_encrypted, iv, tag, beneficiary_name, visit_type, flagged, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    encrypted,
    iv,
    tag,
    visit.beneficiary_name || 'Unknown',
    visit.visit_type || 'Other',
    visit.flagged ? 1 : 0,
    visit.created_at || now,
    now
  );

  // Generate automatic follow-ups
  if (visit.next_visit_date) {
    saveFollowUp({
      id: crypto.randomUUID(),
      visit_id: id,
      type: 'next_visit',
      beneficiary_name: visit.beneficiary_name || 'Beneficiary',
      reason: `Next scheduled ${visit.visit_type || 'routine'} checkup`,
      due_date: visit.next_visit_date,
      completed: 0,
      created_at: now
    });
  }

  // Vaccination due follow-ups if present
  if (Array.isArray(visit.vaccinations_due) && visit.vaccinations_due.length > 0) {
    saveFollowUp({
      id: crypto.randomUUID(),
      visit_id: id,
      type: 'vaccination_due',
      beneficiary_name: visit.beneficiary_name || 'Beneficiary',
      reason: `Vaccination due: ${visit.vaccinations_due.join(', ')}`,
      due_date: visit.next_visit_date || now.split('T')[0],
      completed: 0,
      created_at: now
    });
  }

  if (visit.flagged) {
    saveFollowUp({
      id: crypto.randomUUID(),
      visit_id: id,
      type: 'referral_followup',
      beneficiary_name: visit.beneficiary_name || 'Beneficiary',
      reason: `PHC referral follow-up: ${Array.isArray(visit.danger_signs) ? visit.danger_signs.map(d => d.display_name_en || d.sign_id).join(', ') : 'Danger Sign'}`,
      due_date: now.split('T')[0],
      completed: 0,
      created_at: now
    });
  }

  return { id, ...visit };
}

function getVisits() {
  const rows = db.prepare('SELECT id, data_encrypted, iv, tag, created_at FROM visits ORDER BY created_at DESC').all();
  return rows.map(r => {
    const raw = decrypt(r.data_encrypted, r.iv, r.tag);
    return raw ? JSON.parse(raw) : null;
  }).filter(Boolean);
}

function getVisit(id) {
  const row = db.prepare('SELECT id, data_encrypted, iv, tag FROM visits WHERE id = ?').get(id);
  if (!row) return null;
  const raw = decrypt(row.data_encrypted, row.iv, row.tag);
  return raw ? JSON.parse(raw) : null;
}

function saveFollowUp(task) {
  const id = task.id || crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO follow_ups (id, visit_id, type, beneficiary_name, reason, due_date, completed, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    id,
    task.visit_id || null,
    task.type,
    task.beneficiary_name,
    task.reason,
    task.due_date,
    task.completed ? 1 : 0,
    task.created_at || new Date().toISOString()
  );
  return { id, ...task };
}

function getFollowUps() {
  return db.prepare('SELECT * FROM follow_ups ORDER BY completed ASC, due_date ASC').all();
}

function completeFollowUp(id) {
  db.prepare('UPDATE follow_ups SET completed = 1 WHERE id = ?').run(id);
}

function deleteAll() {
  db.prepare('DELETE FROM visits').run();
  db.prepare('DELETE FROM follow_ups').run();
  return { success: true };
}

function getBeneficiaries() {
  return db.prepare('SELECT * FROM beneficiaries').all().map(b => JSON.parse(b.data_json));
}

module.exports = {
  db,
  saveVisit,
  getVisits,
  getVisit,
  saveFollowUp,
  getFollowUps,
  completeFollowUp,
  deleteAll,
  getBeneficiaries,
  encrypt,
  decrypt
};
