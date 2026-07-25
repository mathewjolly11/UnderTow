# 🎬 Undertow Hackathon Judge Demo Script

**Tagline:** *"It catches you before the pull does."*

---

## Demo Flow (3 Minutes)

### Step 1: The Problem & Vision (30 Seconds)
- "Relapse and severe stress surges happen in quiet moments—before someone realizes they are slipping. Traditional apps rely on manual journaling after the crisis has already happened."
- "Undertow is a proactive recovery safety net that listens to ambient vocal acoustics, classifies stress with Gemini AI, enables real-time AI roleplay practice, and keeps caregivers informed while preserving zero-knowledge user privacy."

### Step 2: Proactive Voice Stress Check-In (60 Seconds)
- Navigate to `/check-in`.
- Click **"Start Voice Check-In"**.
- Speak into the microphone:
  > *"I've had an extremely stressful day at work. My team missed our deadline and I'm feeling really anxious right now."*
- Watch the **Web Audio Waveform** and volume meter respond in real time.
- Click **"Stop & Save Check-In"**.
- **Showcase to Judges:**
  1. **StressMeter Component:** Displays WPM pace, volume dB, micro-pauses, speaking duration, and calculated stress score.
  2. **Gemini AI Classification:** Displays Gemini `gemini-2.5-flash` classification (`Calm`, `Elevated`, or `Crisis`), confidence percentage, diagnostic rationale, and personalized grounding advice.

### Step 3: Emergency Crisis Intercept (30 Seconds)
- Demonstrate what happens when high acute stress or `Crisis` is classified:
- The **Crisis Safety Overlay** launches automatically:
  - 4-7-8 Animated Breathing Circle.
  - Personal Emergency Script.
  - One-tap **Call Caregiver** & **Send SMS** buttons.
  - 988 Lifeline Crisis Disclaimer.

### Step 4: AI Roleplay Simulator (30 Seconds)
- Navigate to `/roleplay`.
- Select the **"Persuasive Friend"** or **"Workplace Peer"** persona.
- Click **"Begin Voice Roleplay Session"**.
- The AI speaks aloud via SpeechSynthesis.
- Reply via voice: *"No thanks, I'm staying sober tonight and sticking to water."*
- End session to view the **Roleplay Mastery Summary** score card.

### Step 5: Privacy-Preserving Caregiver Hub (30 Seconds)
- Navigate to `/caregiver`.
- Highlight the **Zero-Knowledge Privacy Architecture**:
  - Raw audio logs & text transcripts are **never shared**.
  - Caregivers see only weekly health trends, practice counts, and recovery streak days (`42 Days`).
- Showcase the **AI Caregiver Message Coach**:
  - Enter draft message: *"Where are you? Why haven't you called me?"*
  - Click **"Rewrite with AI Coach"** to see Gemini reframe it into warm, non-accusatory support.

---

## Technical Stack Quick Summary
- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Recharts.
- **Backend & Auth**: Supabase PostgreSQL with Row Level Security (RLS) & Supabase SSR.
- **AI Engine**: Google Gemini API (`@google/genai` SDK with `gemini-2.5-flash`).
- **Voice**: Browser Speech Recognition API, SpeechSynthesis API, Web Audio API.
