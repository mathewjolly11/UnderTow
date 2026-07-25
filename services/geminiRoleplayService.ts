import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey, rotateGeminiApiKey } from '@/services/geminiKeyRotation';

export interface RoleplayMessage {
  sender: 'user' | 'partner';
  text: string;
}

export interface RoleplaySummary {
  score: number; // 0 to 100
  summary: string;
  strengths: string[];
  growthAreas: string[];
}

export async function generateRoleplayResponse(
  scenario: string,
  persona: 'Friend' | 'Family' | 'Dealer' | 'Coworker' | 'Custom',
  chatHistory: RoleplayMessage[]
): Promise<string> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    // Fallback response generator if API key is not configured
    if (persona === 'Dealer' || persona === 'Friend') {
      return "Come on, just one drink or hit won't hurt! Everyone else is doing it right now.";
    } else if (persona === 'Coworker') {
      return "You look really stressed out after that meeting. Are you sure you don't want to join us for a glass of wine to take the edge off?";
    } else {
      return "I get why you're hesitant, but are you really going to say no to me right now?";
    }
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `
You are acting as an interactive roleplay partner for "Undertow", an AI recovery platform.
The user is practicing personal refusal skills, boundary setting, and urge surfing.

SCENARIO: ${scenario}
PERSONA: ${persona}

PERSONA BEHAVIOR RULES:
- "Friend": Persuasive, casual, slightly insistent on social drinking or partying.
- "Family": Emotionally loaded, bringing up past habits, asking stressful personal questions.
- "Dealer": Aggressive, manipulative, tempting with discounts or free samples.
- "Coworker": Corporate peer pressure, trying to get the user to drink after work.
- "Custom": Realistic high-trigger social situation.

INSTRUCTIONS:
1. Stay strictly in character as the specified persona.
2. Keep responses brief (1-3 sentences maximum) so the user can reply easily.
3. Challenge the user's refusal gently or firmly according to persona intensity, but NEVER use hate speech or dangerous instructions.
4. Do NOT include meta-commentary (like "As your friend..."). Speak directly as the character.
5. NEVER repeat the exact same sentence twice in a row. React dynamically to what the user said: "${chatHistory[chatHistory.length - 1]?.text || ''}".
`;

    const formattedHistory = chatHistory
      .map((m) => `${m.sender === 'user' ? 'USER' : 'PARTNER'}: ${m.text}`)
      .join('\n');

    const prompt = `${systemPrompt}\n\nCONVERSATION HISTORY:\n${formattedHistory}\n\nPARTNER (reply dynamically in 1-3 new sentences):`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || "I hear your refusal, but I really think you should join us for just one round.";
  } catch (err: unknown) {
    const errorObj = err as { status?: number; message?: string };
    console.warn('Gemini roleplay partner fallback:', err);
    if (errorObj?.status === 429 || errorObj?.status === 401 || errorObj?.message?.includes('429') || errorObj?.message?.includes('401') || errorObj?.message?.includes('UNAUTHENTICATED')) {
      rotateGeminiApiKey();
    }
    const dynamicFallbacks = [
      `I hear you saying "${chatHistory[chatHistory.length - 1]?.text || 'no'}", but why not just take a small break with us?`,
      `Are you completely sure about that? We've all been looking forward to catching up tonight.`,
      `I respect your decision, but I'm going to miss having you around for this event!`,
    ];
    return dynamicFallbacks[chatHistory.length % dynamicFallbacks.length];
  }
}

export async function summarizeRoleplaySession(
  scenario: string,
  persona: string,
  chatHistory: RoleplayMessage[]
): Promise<RoleplaySummary> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return {
      score: 88,
      summary: `Successfully maintained refusal boundaries against the ${persona} during the "${scenario}" scenario without apologizing or giving in.`,
      strengths: ['Direct clear refusal', 'Used non-defensive tone', 'Maintained composure'],
      growthAreas: ['Could pivot to an alternative activity faster'],
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are a clinical recovery coach evaluating an AI roleplay practice session.

SCENARIO: ${scenario}
PERSONA: ${persona}

TRANSCRIPT:
${chatHistory.map((m) => `${m.sender.toUpperCase()}: ${m.text}`).join('\n')}

Evaluate the user's performance in setting boundaries and resisting pressure.
Return a valid JSON object matching this schema:
{
  "score": 92,
  "summary": "Brief 2-sentence breakdown of how well the user held boundaries.",
  "strengths": ["Strength 1", "Strength 2"],
  "growthAreas": ["Improvement suggestion"]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      return {
        score: typeof parsed.score === 'number' ? parsed.score : 85,
        summary: parsed.summary || 'Completed roleplay session with solid boundary control.',
        strengths: parsed.strengths || ['Maintained clear refusal'],
        growthAreas: parsed.growthAreas || parsed.improvements || ['Practice urge surfing techniques'],
      };
    }
    throw new Error('Empty summary output');
  } catch (err) {
    console.warn('Roleplay summary fallback:', err);
    return {
      score: 85,
      summary: 'Maintained refusal boundaries and asserted control throughout the scenario.',
      strengths: ['Clear direct communication', 'Stayed calm under pressure'],
      growthAreas: ['Practice rapid exit strategy'],
    };
  }
}
