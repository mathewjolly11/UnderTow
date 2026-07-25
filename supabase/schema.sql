-- Undertow SQL Schema & RLS Setup

-- Execute this script in your Supabase SQL Editor:

-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  recovery_goal TEXT,
  stage TEXT DEFAULT 'Active Maintenance',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);


-- 2. Create User Memory Table
CREATE TABLE IF NOT EXISTS public.user_memory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  trigger TEXT[] DEFAULT '{}',
  safe_people JSONB DEFAULT '[]'::jsonb,
  grounding_methods TEXT[] DEFAULT '{}',
  emergency_script TEXT,
  reasons_to_recover TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own memory"
  ON public.user_memory FOR ALL USING (auth.uid() = user_id);


-- 3. Create Voice Sessions Table
CREATE TABLE IF NOT EXISTS public.voice_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transcript TEXT NOT NULL,
  speech_rate NUMERIC DEFAULT 0,
  average_volume NUMERIC DEFAULT 0,
  pause_count INT DEFAULT 0,
  stress_state TEXT NOT NULL CHECK (stress_state IN ('Calm', 'Mild', 'High', 'Acute')),
  confidence NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own voice sessions"
  ON public.voice_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own voice sessions"
  ON public.voice_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 4. Create Roleplay Sessions Table
CREATE TABLE IF NOT EXISTS public.roleplay_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scenario TEXT NOT NULL,
  intensity TEXT CHECK (intensity IN ('Low', 'Medium', 'High')),
  score INT DEFAULT 0,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.roleplay_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own roleplay sessions"
  ON public.roleplay_sessions FOR ALL USING (auth.uid() = user_id);


-- 5. Create Caregiver Profiles Table
CREATE TABLE IF NOT EXISTS public.caregiver_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  caregiver_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT,
  email TEXT
);

ALTER TABLE public.caregiver_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own caregiver profiles"
  ON public.caregiver_profiles FOR ALL USING (auth.uid() = user_id);


-- 6. Create Learning History Table
CREATE TABLE IF NOT EXISTS public.learning_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.learning_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own learning history"
  ON public.learning_history FOR ALL USING (auth.uid() = user_id);


-- 7. Create Learning Modules Table
CREATE TABLE IF NOT EXISTS public.learning_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  duration_minutes INT NOT NULL,
  content_markdown TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view learning modules"
  ON public.learning_modules FOR SELECT USING (true);

-- 8. Automated Profile Trigger on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  
  INSERT INTO public.user_memory (user_id, emergency_script)
  VALUES (
    new.id,
    'I am safe. This stress surge is temporary and will pass. Take 3 deep breaths.'
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
