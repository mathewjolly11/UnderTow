import { describe, it, expect, vi, beforeEach } from 'vitest';
import { evaluateStressWithGemini } from '@/services/geminiService';
import * as keyRotation from '@/services/geminiKeyRotation';

// Mock the dependencies
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class MockGoogleGenAI {
      models = {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify({
            classification: 'Calm',
            confidence: 0.95,
            reason: 'Looks calm',
            groundingMessage: 'Take a breath',
          })
        })
      };
    }
  };
});

describe('geminiService', () => {
  const mockMetrics = {
    speechRate: 140,
    volume: 50,
    pauseCount: 2,
    duration: 30,
    stressState: 'Calm' as const,
    stressScore: 20
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('falls back to local logic if no API key is available', async () => {
    vi.spyOn(keyRotation, 'getGeminiApiKey').mockReturnValue(null);

    const result = await evaluateStressWithGemini('Hello', mockMetrics);
    
    expect(result.classification).toBe('Calm');
    expect(result.reason).toContain('Acoustic speech rate');
  });

  it('calls Gemini and parses the response when key is available', async () => {
    vi.spyOn(keyRotation, 'getGeminiApiKey').mockReturnValue('mock-key');

    const result = await evaluateStressWithGemini('Hello', mockMetrics);
    
    expect(result.classification).toBe('Calm');
    expect(result.confidence).toBe(0.95);
    expect(result.reason).toBe('Looks calm');
  });
});
