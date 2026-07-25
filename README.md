# Undertow

> *"It catches you before the pull does."*

Undertow is a modern, privacy-focused AI-powered recovery platform designed to proactively detect stress through voice interactions, provide personalized voice/chat support, enable interactive AI roleplay practice for high-stress scenarios, and support caregivers—all wrapped in a premium dark glassmorphism interface inspired by Apple, Linear, and Vercel.

---

## 🏆 Hackathon Submission Information

### 1. Chosen Vertical
**Mental Health, Addiction Recovery, and Wellness**
Undertow is designed as a proactive support companion for individuals in active maintenance of addiction recovery. It bridges the gap between therapy sessions by providing 24/7 AI-assisted stress detection, roleplay boundary practice, and caregiver integration.

### 2. Approach and Logic
The logic of Undertow centers around **Proactive Stress Detection and De-escalation**:
- **Detection**: By analyzing voice inputs (speech rate, volume, and micro-pauses), the application detects physiological stress markers before a craving or relapse event occurs.
- **Evaluation**: The acoustic data and transcript are sent to the Gemini AI API, which evaluates the user's state (Calm, Elevated, or Crisis) against their customized recovery profile and known triggers.
- **Intervention**: If a crisis is detected, the platform triggers a high-priority "Emergency Safety Grounding" overlay. This bypasses normal UI flows to enforce a 4-7-8 breathing exercise, display a personalized grounding script, and offer immediate one-tap contact to a designated safe person or the 988 Lifeline.
- **Practice**: Through the Roleplay Simulator, users practice asserting boundaries in a safe, AI-simulated environment (e.g., refusing a drink from a coworker) to build neural pathways and confidence for real-world encounters.

### 3. How the Solution Works
1. **User Profiling (Supabase)**: Users onboard by defining their triggers, safe people, and grounding methods. This data is stored securely in Supabase with strict Row Level Security (RLS).
2. **Voice Check-ins (Browser Web Speech/Audio API + Gemini)**: Users speak into their microphone. The app captures the transcript and acoustic metrics locally, then securely passes them to a Next.js Server Action where Gemini evaluates the stress level.
3. **Roleplay (SpeechSynthesis + Gemini)**: The user interacts with a conversational AI persona (powered by Gemini) via voice or text. Gemini evaluates the user's boundary-setting effectiveness and provides a clinical breakdown score.
4. **Caregiver Coach (Gemini)**: Caregivers can draft messages to their loved ones in recovery. Gemini reframes these messages to be non-judgmental and supportive, preventing triggering communications.

### 4. Assumptions Made
- **Browser Support**: Assumes the user is operating on a Chromium-based browser (Chrome/Edge) for full support of the `window.SpeechRecognition` API. Fallback UI warnings are provided for unsupported browsers (Firefox/Safari).
- **Environment**: Assumes the user has access to a microphone and a safe space to speak aloud.
- **AI Limitations**: The application clearly assumes and states that it is an AI companion and *not* a substitute for professional medical or psychiatric care (explicitly disclaimed in the Crisis Overlay).
- **Rate Limits**: Assumes standard hackathon/demo traffic, mitigated by a sliding-window in-memory rate limiter on Gemini Server Actions to prevent API quota exhaustion.

---

## ✨ Features

- 🎙️ **Proactive Voice Stress Analyzer**: Calculates speech pace (WPM), average volume (dB), micro-pauses, and vocal jitter in real time using the Browser Web Audio API & Speech Recognition.
- 🧠 **Gemini AI Stress Classification**: Uses Google Gemini `gemini-2.5-flash` to evaluate voice check-ins into **Calm**, **Elevated**, or **Crisis** states with diagnostic rationale and personal grounding advice.
- 🚨 **Emergency Crisis Intercept Overlay**: Triggers an automatic high-priority modal during acute stress featuring an interactive 4-7-8 breathing circle timer, personal anchor script, one-tap caregiver phone/SMS triggers, and 988 Lifeline access.
- 🎭 **AI Roleplay Refusal Simulator**: Practice setting boundaries against simulated personas (**Friend**, **Family**, **Dealer**, **Coworker**, or **Custom**) with real-time SpeechSynthesis voice audio and end-session clinical breakdown scores.
- 🔒 **Zero-Knowledge Caregiver Support Hub**: Shared weekly progress trends and recovery streak counters with caregivers **without ever revealing raw transcripts or audio logs**.
- 💬 **AI Caregiver Message Coach**: Reframes draft caregiver text messages into non-judgmental, non-accusatory supportive phrasing using Gemini AI.
- 🔐 **Supabase Auth & Row Level Security**: Secure email/password login, Google OAuth, session management, and PostgreSQL RLS policies ensuring data privacy.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Glassmorphism design tokens
- **Database & Auth**: Supabase PostgreSQL with RLS, Supabase SSR Auth
- **AI**: Google Gemini API (`@google/genai` SDK with `gemini-2.5-flash`)
- **Voice**: Web Audio API, Speech Recognition API, SpeechSynthesis API
- **Charts & Icons**: Recharts, Lucide React

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/your-username/undertow.git
cd undertow
npm install --legacy-peer-deps
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Database Migration
Run the SQL script located in `supabase/schema.sql` in your Supabase SQL Editor.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 Hackathon Documentation & Resources

- [Judge Demo Script (3-Minute Presentation)](./JUDGE_DEMO.md)
- [Production Deployment Guide](./DEPLOYMENT.md)
- [Database SQL Schema & RLS Policies](./supabase/schema.sql)
