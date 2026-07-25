'use server';

import { createClientServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Save Voice Session Action
export async function saveVoiceSessionAction(data: {
  transcript: string;
  speechRate: number;
  averageVolume: number;
  pauseCount: number;
  stressState: 'Calm' | 'Mild' | 'High' | 'Acute';
  confidence: number;
}) {
  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase.from('voice_sessions').insert({
    user_id: user.id,
    transcript: data.transcript,
    speech_rate: data.speechRate,
    average_volume: data.averageVolume,
    pause_count: data.pauseCount,
    stress_state: data.stressState,
    confidence: data.confidence,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard');
  revalidatePath('/check-in');
  return { success: true };
}

// Save Roleplay Session Action
export async function saveRoleplaySessionAction(data: {
  scenario: string;
  intensity: 'Low' | 'Medium' | 'High';
  score: number;
  summary: string;
}) {
  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase.from('roleplay_sessions').insert({
    user_id: user.id,
    scenario: data.scenario,
    intensity: data.intensity,
    score: data.score,
    summary: data.summary,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard');
  revalidatePath('/roleplay');
  return { success: true };
}

// Update Onboarding Profile Action
export async function updateOnboardingProfileAction(data: {
  name: string;
  recoveryGoal: string;
  stage: string;
  triggers: string[];
  safePeople: any[];
  groundingMethods: string[];
  reasonsToRecover: string[];
}) {
  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  // Update Profile
  await supabase
    .from('profiles')
    .update({
      name: data.name,
      recovery_goal: data.recoveryGoal,
      stage: data.stage,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  // Upsert Memory
  await supabase.from('user_memory').upsert({
    user_id: user.id,
    trigger: data.triggers,
    safe_people: data.safePeople,
    grounding_methods: data.groundingMethods,
    reasons_to_recover: data.reasonsToRecover,
    emergency_script: `I am ${data.name}. I am safe and ground myself with ${data.groundingMethods[0] || 'deep breathing'}.`,
    updated_at: new Date().toISOString(),
  });

  revalidatePath('/dashboard');
  revalidatePath('/settings');
  return { success: true };
}
