# 🚀 Undertow Deployment Guide (Vercel & Supabase)

"Undertow: It catches you before the pull does."

---

## 1. Supabase Backend Setup

1. Log in to [Supabase](https://supabase.com) and create a new project.
2. Navigate to **SQL Editor** in your Supabase dashboard.
3. Paste the contents of `supabase/schema.sql` and click **Run**.
4. Go to **Project Settings -> API** and copy:
   - `Project URL`
   - `anon / public` API Key
5. Go to **Authentication -> Providers** and enable **Google Login** (add OAuth Client ID & Secret).
6. Set Authentication Redirect URL to:
   `https://your-vercel-domain.vercel.app/auth/callback`

---

## 2. Google Gemini AI Setup

1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Create an API Key for Gemini.

---

## 3. Vercel Deployment

1. Push your repository to GitHub.
2. Import your repository into [Vercel](https://vercel.com).
3. Add the following **Environment Variables** in Vercel:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
   ```
4. Click **Deploy**. Vercel will build and launch your production Next.js 16 App Router application.
