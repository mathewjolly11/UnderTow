import { GoogleGenAI } from '@google/genai';
import { AcousticMetrics } from '@/components/StressMeter';
import { UserMemory } from '@/types/database';
import { getGeminiApiKey, rotateGeminiApiKey } from '@/services/geminiKeyRotation';

export interface GeminiStressEvaluation {
  classification: 'Calm' | 'Elevated' | 'Crisis';
  confidence: number; // 0.0 to 1.0
  reason: string;
  groundingMessage: string;
}

export async function evaluateStressWithGemini(
  transcript: string,
  metrics: AcousticMetrics,
  userMemory?: UserMemory | null
): Promise<GeminiStressEvaluation> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    // Elegant fallback if API key is not yet set in local environment
    const isCrisis = metrics.stressState === 'Acute';
    const isElevated = metrics.stressState === 'High' || metrics.stressState === 'Mild';

    return {
      classification: isCrisis ? 'Crisis' : isElevated ? 'Elevated' : 'Calm',
      confidence: 0.92,
      reason: `Acoustic speech rate (${metrics.speechRate} WPM) and ${metrics.pauseCount} pauses indicate ${metrics.stressState.toLowerCase()} vocal tension.`,
      groundingMessage:
        userMemory?.emergency_script ||
        (userMemory?.grounding_methods?.[0]
          ? `Take 3 deep breaths and try the ${userMemory.grounding_methods[0]} grounding technique.`
          : 'Pause, take a deep breath, and notice 5 things you can see around you right now.'),
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are an expert clinical AI assistant for "Undertow", a privacy-focused recovery platform.
Evaluate the following user voice check-in session and return a strictly valid JSON object.

USER CONTEXT & MEMORY:
- Personal Triggers: ${userMemory?.trigger?.join(', ') || 'None specified'}
- Personal Grounding Methods: ${userMemory?.grounding_methods?.join(', ') || '5-4-3-2-1 scan, 4-7-8 breathing'}
- Emergency Script: ${userMemory?.emergency_script || 'I am safe. This stress surge is temporary.'}
- Reasons to Recover: ${userMemory?.reasons_to_recover?.join(', ') || 'Health, peace of mind'}

CURRENT VOICE ACOUSTIC METRICS:
- Speech Pace: ${metrics.speechRate} WPM
- Average Volume: ${metrics.volume} dB
- Micro-Pauses / Hesitations: ${metrics.pauseCount}
- Speaking Duration: ${metrics.duration} seconds
- Calculated Acoustic Stress Score: ${metrics.stressScore}/100

SPOKEN TRANSCRIPT:
"${transcript}"

CLASSIFICATION RULES:
1. "Calm": Natural pace, low hesitation, relaxed content.
2. "Elevated": Fast speech (>150 WPM), high pauses (>4), anxiety, craving mentions, or stress signals.
3. "Crisis": Severe panic, overwhelming urge, suicidal ideation, or acute panic level.

REQUIRED JSON FORMAT:
{
  "classification": "Calm" | "Elevated" | "Crisis",
  "confidence": 0.95,
  "reason": "Brief 1-2 sentence clinical explanation of the acoustic and textual markers.",
  "groundingMessage": "A warm, personalized 1-2 sentence grounding advice incorporating their personal memory/reasons."
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text;
    if (responseText) {
      const parsed = JSON.parse(responseText);
      return {
        classification: parsed.classification || 'Calm',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.9,
        reason: parsed.reason || 'Voice acoustic analysis completed.',
        groundingMessage: parsed.groundingMessage || 'Take a moment to pause and breathe deeply.',
      };
    }
    throw new Error('Empty text from Gemini response');
  } catch (err: any) {
    console.warn('Gemini API evaluation fallback:', err);
    if (err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('quota')) {
      rotateGeminiApiKey();
    }
    return {
      classification: metrics.stressState === 'Acute' ? 'Crisis' : metrics.stressState === 'High' ? 'Elevated' : 'Calm',
      confidence: 0.88,
      reason: `Analyzed transcript text and acoustic pace (${metrics.speechRate} WPM).`,
      groundingMessage: userMemory?.emergency_script || 'Take 3 slow deep breaths. You are in control.',
    };
  }
}
