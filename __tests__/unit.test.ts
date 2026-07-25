import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getGeminiApiKey, rotateGeminiApiKey } from '../services/geminiKeyRotation';
import { cn } from '../lib/utils';
import { calculateAudioMetrics } from '../hooks/useAudioVisualizer';
import {
  saveVoiceSessionAction,
  saveRoleplaySessionAction,
  updateOnboardingProfileAction,
} from '../app/actions';

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock Supabase Server Client
vi.mock('../lib/supabase/server', () => ({
  createClientServer: vi.fn(),
}));

import { createClientServer } from '../lib/supabase/server';

describe('Unit Tests: Pure Logic', () => {
  const originalEnv = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    process.env.GEMINI_API_KEY = originalEnv;
  });

  describe('geminiKeyRotation', () => {
    it('returns null when no key is set', () => {
      delete process.env.GEMINI_API_KEY;
      expect(getGeminiApiKey()).toBeNull();
    });

    it('parses valid AIza keys from GEMINI_API_KEY pool', () => {
      process.env.GEMINI_API_KEY = 'AIzaKey1, AIzaKey2';
      expect(getGeminiApiKey()).toBe('AIzaKey1');
    });

    it('rotates to the next key in the pool', () => {
      process.env.GEMINI_API_KEY = 'AIzaKey1, AIzaKey2';
      const initialKey = getGeminiApiKey();
      const rotatedKey = rotateGeminiApiKey();
      expect(initialKey).not.toBe(rotatedKey);
    });
  });

  describe('cn utility', () => {
    it('combines class names and merges Tailwind conflicts properly', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
      expect(cn('text-red-500', { 'bg-blue-500': true })).toBe('text-red-500 bg-blue-500');
    });
  });

  describe('calculateAudioMetrics in useAudioVisualizer', () => {
    it('calculates average volume and returns 30 waveform bars', () => {
      const mockAudioData = new Uint8Array(64).fill(128);
      const metrics = calculateAudioMetrics(mockAudioData);

      expect(metrics.volume).toBe(100);
      expect(metrics.waveform).toHaveLength(30);
    });

    it('returns 0 volume for empty data', () => {
      const metrics = calculateAudioMetrics(new Uint8Array(0));
      expect(metrics.volume).toBe(0);
      expect(metrics.waveform).toHaveLength(30);
    });
  });
});

describe('Integration Tests: Server Actions (app/actions.ts)', () => {
  it('returns Unauthorized when user is not authenticated', async () => {
    (createClientServer as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    });

    const voiceRes = await saveVoiceSessionAction({
      transcript: 'Test',
      speechRate: 120,
      averageVolume: 50,
      pauseCount: 1,
      stressState: 'Calm',
      confidence: 0.95,
    });
    expect(voiceRes).toEqual({ success: false, error: 'Unauthorized' });

    const roleplayRes = await saveRoleplaySessionAction({
      scenario: 'Test',
      intensity: 'Low',
      score: 90,
      summary: 'Good session',
    });
    expect(roleplayRes).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('successfully saves session when authenticated', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    const mockUpsert = vi.fn().mockResolvedValue({ error: null });

    (createClientServer as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'usr_test_123' } } }),
      },
      from: (table: string) => {
        if (table === 'profiles') return { update: mockUpdate };
        if (table === 'user_memory') return { upsert: mockUpsert };
        return { insert: mockInsert };
      },
    });

    const voiceRes = await saveVoiceSessionAction({
      transcript: 'Test',
      speechRate: 120,
      averageVolume: 50,
      pauseCount: 1,
      stressState: 'Calm',
      confidence: 0.95,
    });
    expect(voiceRes).toEqual({ success: true });
    expect(mockInsert).toHaveBeenCalled();

    const onboardingRes = await updateOnboardingProfileAction({
      name: 'Alex',
      recoveryGoal: 'Sobriety',
      stage: 'Early Recovery',
      triggers: ['Stress'],
      safePeople: [{ name: 'Sam', relationship: 'Friend', phone: '555-0199' }],
      groundingMethods: ['Breathing'],
      reasonsToRecover: ['Health'],
    });
    expect(onboardingRes).toEqual({ success: true });
  });
});
