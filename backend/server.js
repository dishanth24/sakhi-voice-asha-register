require('dotenv').config();
const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const { extractVisit } = require('./extract/extractor');
const { parseCorrection } = require('./extract/correction');
const { detectDangerSigns } = require('./danger/detector');
const { ConversationSession } = require('./state/machine');
const db = require('./db/database');
const testDictations = require('../shared/test-dictations.json');
const seedBeneficiaries = require('../shared/seed-beneficiaries.json');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts/styles for development
}));
app.use(cors());
app.use(express.json());

// ─── REST APIs ───

// 1. Visit Records
app.get('/api/visits', (req, res) => {
  try {
    const visits = db.getVisits();
    res.json(visits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/visits', (req, res) => {
  try {
    const saved = db.saveVisit(req.body);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/visits/:id', (req, res) => {
  try {
    const visit = db.getVisit(req.params.id);
    if (!visit) return res.status(404).json({ error: 'Not found' });
    res.json(visit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Follow-up Tasks
app.get('/api/followups', (req, res) => {
  try {
    const tasks = db.getFollowUps();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/followups/:id/complete', (req, res) => {
  try {
    db.completeFollowUp(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Beneficiaries
app.get('/api/beneficiaries', (req, res) => {
  try {
    const list = db.getBeneficiaries();
    res.json(list.length > 0 ? list : seedBeneficiaries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Extraction Engine API (used by Test Lab and Text Mode)
app.post('/api/extract', (req, res) => {
  const { transcript } = req.body;
  if (!transcript) return res.status(400).json({ error: 'Transcript required' });
  const result = extractVisit(transcript);
  res.json(result);
});

// 4b. Correction Engine API
app.post('/api/correct', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Correction text required' });
  const correction = parseCorrection(text);
  res.json({ correction });
});

// 5. Test Dictations Data
app.get('/api/test-dictations', (req, res) => {
  res.json(testDictations);
});

// 6. Delete all data (Data Privacy & Compliance)
app.delete('/api/data', (req, res) => {
  try {
    db.deleteAll();
    res.json({ success: true, message: 'All visit records and follow-ups deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend dist if built
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/ws')) return next();
  const indexHtml = path.join(frontendDist, 'index.html');
  res.sendFile(indexHtml, (err) => {
    if (err) res.status(200).send('Sakhi Voice Backend is running. Frontend dev server is at port 5173.');
  });
});

// ─── WebSocket Server ───
wss.on('connection', (ws) => {
  let session = null;

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      const { type, payload } = data;

      switch (type) {
        case 'INIT_SESSION': {
          session = new ConversationSession(
            payload?.sessionId || 'sess_' + Date.now(),
            payload?.language || 'hi',
            (event) => {
              if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify(event));
              }
            }
          );
          session.start();
          break;
        }

        case 'SPEECH_CHUNK': {
          if (session) {
            session.handleSpeechInput(payload.text, payload.isFinal || false);
          }
          break;
        }

        case 'CORRECTION': {
          if (session) {
            session.handleCorrection(payload.text);
          }
          break;
        }

        case 'SAVE_CONFIRM': {
          if (session) {
            session.saveRecord();
          }
          break;
        }

        case 'BARGE_IN': {
          if (session) {
            session.bargeIn();
          }
          break;
        }

        default:
          break;
      }
    } catch (e) {
      console.error('WS error:', e.message);
    }
  });

  ws.on('close', () => {
    session = null;
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Sakhi Voice Backend running on http://localhost:${PORT}`);
  console.log(`WebSocket endpoint ready at ws://localhost:${PORT}/ws`);
});
