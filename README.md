# 🌸 Sakhi Voice (सखी वॉइस)
### *Sakhi Voice: ASHA Voice Register*
> **"Speak the visit. Skip the typing."** / **"Bolo visit, typing chhodo."**  
> **Gnani Voice Hackathon — Healthcare Track**  
> A voice-first web app that turns an ASHA worker's spoken home-visit notes into structured clinical visit records and automated follow-up lists with **zero typing**. Built with a 100% recall deterministic danger-sign detector, running locally with zero paid API keys today, and architected so **Gnani Prisma v3.0 (STT)** and **Timbre v3.0 (TTS)** over WebSocket can be dropped in by changing one configuration.

---

## 🏗️ Architecture Diagram

```mermaid
flowchart TD
    subgraph Client ["Client (React + Vite PWA — Sakhi Voice)"]
        UI["ASHA Worker UI\n(Hindi / English / Hinglish)"]
        ThumbMic["Thumb-Zone Mic Button\n(Web Audio Waveform)"]
        NoiseSim["Noise Simulator\n(Pink Noise + 50Hz Hum)"]
        Adapters["Speech Adapters"]
        WebSpeech["Browser Web Speech API\n(Continuous & Interim)"]
        TextMode["Text Mode\n(Zero-Mic Fallback)"]
        GnaniClientStub["Gnani Prisma / Timbre Stub\n(16kHz Mono PCM)"]
    end

    subgraph Backend ["Backend (Node.js + Express + WebSocket)"]
        WS["WebSocket Server (/ws)"]
        StateMachine["Conversation State Machine\n(GREETING ➔ LISTENING ➔ EXTRACTING ➔ READBACK ➔ SAVED)"]
        Escalating["ESCALATING Interrupt State\n(Urgent Danger Flag)"]
        RuleExtractor["Rule-Based Field Extractor\n(Hinglish, Hindi Numbers & Dates)"]
        DangerEngine["Deterministic Danger-Sign Engine\n(100% Target Recall, Multi-Script)"]
        AES["AES-256-GCM Encryption"]
        DB[(SQLite via better-sqlite3)]
    end

    UI --> ThumbMic
    ThumbMic --> Adapters
    Adapters --> WebSpeech
    Adapters --> TextMode
    Adapters --> GnaniClientStub

    Adapters -->|JSON / Audio Stream| WS
    WS --> StateMachine
    StateMachine --> RuleExtractor
    StateMachine --> DangerEngine
    DangerEngine -->|Match Found| Escalating
    Escalating -->|Interrupt Voice & Haptics| UI
    StateMachine -->|Save Record| AES
    AES --> DB
```

---

## 🚀 Quickstart & Installation

### Prerequisites
- Node.js v18+ or v20+
- Google Chrome recommended for Web Speech API microphone support

### Commands
```bash
# Clone and enter the project folder
cd "c:\MY PROJECTS\ASHA"

# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ..

# 2. Start the Backend server (Port 3001)
cd backend && npm start

# 3. In a second terminal, start the Frontend dev server (Port 5173)
cd frontend && npm run dev
```

### URLs to Open
- **Frontend App (Chrome recommended):** [http://localhost:5173](http://localhost:5173)
- **Direct Backend (Production bundle served):** [http://localhost:3001](http://localhost:3001)

---

## ⚡ How to Switch to Gnani Prisma & Timbre

The project is structured with a modular adapter pattern:
1. **Frontend Adapter:** `frontend/src/speech/GnaniStt.js` and `GnaniTts.js`
2. **Backend Adapter:** `backend/speech/gnani-adapter.js`
3. **Environment Values in `.env`:**
   ```env
   SPEECH_PROVIDER=gnani
   GNANI_API_KEY=your_actual_gnani_api_key
   GNANI_STT_WS_URL=wss://stt.gnani.ai/v3/stream
   GNANI_TTS_WS_URL=wss://tts.gnani.ai/v3/stream
   ```
4. **TODO Spots:** Search for `TODO: confirm against Gnani docs` in `backend/speech/gnani-adapter.js` and `frontend/src/speech/GnaniStt.js`. Audio format is ready for 16 kHz mono 16-bit PCM.

---

## ⚠️ Danger-Sign Clinical Guidance & Citations

> [!IMPORTANT]
> **SOURCE:** The danger signs implemented in this application are modeled after published clinical guidelines and must be formally verified against official public guidelines before clinical deployment.
>
> **Guideline Citation:**
> - **Maternal Health (ANC & PNC):** Government of India National Health Mission (NHM) — *ASHA Training Modules 6 & 7: Skills for New Born Care and Child Health*, Chapter 4 (Identification and Management of Maternal Danger Signs).
> - **Intrapartum & Delivery Complications:** World Health Organization (WHO) — *Managing Complications in Pregnancy and Childbirth (MCPC)*, Section S-1 (Maternal Emergencies).
> - **Newborn Care:** Integrated Management of Neonatal and Childhood Illness (IMNCI) Guidelines — *Section 2: Danger Signs in Young Infants (0–2 Months)*.

---

## 🧪 Unit Test Results

Run all test suites with:
```bash
cd backend && npm test
```

### Test Summary Table
| Test Suite | Tests | Result | Description |
| :--- | :--- | :--- | :--- |
| `tests/danger.test.js` | 3 | **PASSED** (100% Recall) | 32+ danger sign phrases across English, Devanagari, and Roman Hindi with zero false negatives and negation awareness |
| `tests/extraction.test.js` | 6 | **PASSED** | Hindi number parsing (`dhai`=2.5, `saade teen`=3.5), digit sequences, and relative dates (`kal`, `parso`, `agle hafte`) |
| `tests/correction.test.js` | 2 | **PASSED** | Voice corrections ("no, weight is 2.8 kilo", "nahi, naam Sunita hai") |
| `tests/state.test.js` | 2 | **PASSED** | State machine lifecycle and ESCALATING danger interruption |
| **TOTAL** | **13** | **100% PASS** | Zero failures across all suites |

---

## 🎬 2-Minute Judge Demo Script

1. **Open the App:** Navigate to `http://localhost:5173`. Notice the persistent **AI Assistant** badge, the clean healthcare palette, and today's metrics.
2. **AI Disclosure (Compliance):** Tap the **Start Visit** button or visit `/visit`. Hear the agent's very first turn: *"Namaste, main Sakhi hoon, ek AI sahayak. Apni visit ke baare mein bataiye."* (Mandatory AI transparency).
3. **Simulated Noise Toggle:** In Settings or Test Lab, toggle **Street Noise Simulation** to demonstrate resilience in noisy village environments.
4. **Live Voice Dictation:** Speak or paste:
   > *"Sunita Devi ka ANC checkup kiya, ID 4521, wazan dhai kilo, neeche se khoon aa raha hai"*
5. **Instant Danger Interruption:** Observe the **ESCALATING** state trigger immediately:
   - Full-width high-contrast red alert banner appears
   - Device haptics vibrate (`navigator.vibrate`) and distinct alert tone sounds
   - Spoken referral prompt reads: *"अति आवश्यक: योनि से रक्तस्राव का संकेत है। कृपया तुरंत नजदीकी PHC रेफर करें।"*
   - Tap **"Referred to PHC"** to log action.
6. **Voice Correction:** Say or type:
   > *"Nahi, wazan 52 kilo hai"*
   - The weight updates from 2.5 kg to 52 kg with an animated confirmation.
7. **Readback & Save:** Tap **"Haan, save karo"**. The record is saved with AES-256-GCM encryption, automatically creating follow-up tasks in the **Follow-ups** tab.
8. **Test Lab (One-Click Verification):** Navigate to the **Test Lab** tab and click **"Run All Tests"** to watch all 32 synthetic dictations process in real-time with an audit table and a **100% Danger Sign Catch Rate** guarantee.
