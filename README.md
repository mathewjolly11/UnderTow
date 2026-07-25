# Undertow

> *"It catches you before the pull does."*

Undertow is a modern, privacy-focused AI-powered recovery platform designed to proactively detect stress through voice interactions, provide personalized voice/chat support, enable interactive AI roleplay practice for high-stress scenarios, and support caregivers—all wrapped in a premium dark glassmorphism interface inspired by Apple, Linear, and Vercel.

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
