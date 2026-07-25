'use server';

import { createClientServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { evaluateStressWithGemini } from '@/services/geminiService';
import { generateRoleplayResponse, summarizeRoleplaySession, RoleplayMessage } from '@/services/geminiRoleplayService';
import { rewriteCaregiverMessageWithGemini } from '@/services/geminiCaregiverCoach';
import { AcousticMetrics } from '@/components/StressMeter';
import { UserMemory, SafePerson } from '@/types/database';
import { z } from 'zod';

const saveVoiceSessionSchema = z.object({
  transcript: z.string().min(1),
  speechRate: z.number(),
  averageVolume: z.number(),
  pauseCount: z.number(),
  stressState: z.enum(['Calm', 'Mild', 'High', 'Acute']),
  confidence: z.number(),
});

const saveRoleplaySessionSchema = z.object({
  scenario: z.string().min(1),
  intensity: z.enum(['Low', 'Medium', 'High']),
  score: z.number(),
  summary: z.string(),
});

const updateOnboardingProfileSchema = z.object({
  name: z.string().min(1),
  recoveryGoal: z.string(),
  stage: z.string(),
  triggers: z.array(z.string()),
  safePeople: z.array(z.unknown()),
  groundingMethods: z.array(z.string()),
  reasonsToRecover: z.array(z.string()),
});

const evaluateStressSchema = z.object({
  transcript: z.string(),
  metrics: z.unknown(),
  userMemory: z.unknown().optional().nullable(),
});

const generateRoleplayResponseSchema = z.object({
  scenario: z.string(),
  persona: z.enum(['Friend', 'Family', 'Dealer', 'Coworker', 'Custom']),
  chatHistory: z.array(z.unknown()),
});

const summarizeRoleplaySessionSchema = z.object({
  scenario: z.string(),
  persona: z.string(),
  chatHistory: z.array(z.unknown()),
});

const rewriteCaregiverMessageSchema = z.object({
  draftMessage: z.string(),
  userStage: z.string().optional(),
});

// Save Voice Session Action
export async function saveVoiceSessionAction(data: {
  transcript: string;
  speechRate: number;
  averageVolume: number;
  pauseCount: number;
  stressState: 'Calm' | 'Mild' | 'High' | 'Acute';
  confidence: number;
}) {
  const parsed = saveVoiceSessionSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Invalid input' };

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
  const parsed = saveRoleplaySessionSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Invalid input' };

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
  safePeople: SafePerson[];
  groundingMethods: string[];
  reasonsToRecover: string[];
}) {
  const parsed = updateOnboardingProfileSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Invalid input' };

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

// Gemini Server Actions
export async function evaluateStressAction(
  transcript: string,
  metrics: AcousticMetrics,
  userMemory?: UserMemory | null
) {
  const parsed = evaluateStressSchema.safeParse({ transcript, metrics, userMemory });
  if (!parsed.success) throw new Error('Invalid input');

  return evaluateStressWithGemini(transcript, metrics, userMemory);
}

export async function generateRoleplayResponseAction(
  scenario: string,
  persona: 'Friend' | 'Family' | 'Dealer' | 'Coworker' | 'Custom',
  chatHistory: RoleplayMessage[]
) {
  const parsed = generateRoleplayResponseSchema.safeParse({ scenario, persona, chatHistory });
  if (!parsed.success) throw new Error('Invalid input');

  return generateRoleplayResponse(scenario, persona, chatHistory);
}

export async function summarizeRoleplaySessionAction(
  scenario: string,
  persona: string,
  chatHistory: RoleplayMessage[]
) {
  const parsed = summarizeRoleplaySessionSchema.safeParse({ scenario, persona, chatHistory });
  if (!parsed.success) throw new Error('Invalid input');

  return summarizeRoleplaySession(scenario, persona, chatHistory);
}

export async function rewriteCaregiverMessageAction(
  draftMessage: string,
  userStage: string = 'Active Maintenance'
) {
  const parsed = rewriteCaregiverMessageSchema.safeParse({ draftMessage, userStage });
  if (!parsed.success) throw new Error('Invalid input');

  return rewriteCaregiverMessageWithGemini(draftMessage, userStage);
}

