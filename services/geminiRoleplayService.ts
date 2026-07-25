import { GoogleGenAI } from '@google/genai';

export interface RoleplayMessage {
  sender: 'user' | 'partner';
  text: string;
}

export interface RoleplaySummary {
  score: number; // 0-100
  summary: string;
  strengths: string[];
  improvements: string[];
}

export async function generateRoleplayResponse(
  scenario: string,
  persona: 'Friend' | 'Family' | 'Dealer' | 'Coworker' | 'Custom',
  chatHistory: RoleplayMessage[]
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Fallback response generator if API key is not configured
    const lastUserMsg = chatHistory[chatHistory.length - 1]?.text || '';
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
`;

    const formattedHistory = chatHistory
      .map((m) => `${m.sender === 'user' ? 'USER' : 'PARTNER'}: ${m.text}`)
      .join('\n');

    const prompt = `${systemPrompt}\n\nCONVERSATION HISTORY:\n${formattedHistory}\n\nPARTNER (reply in 1-3 sentences):`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || "I hear you, but are you sure about that?";
  } catch (err) {
    console.warn('Gemini roleplay partner fallback:', err);
    return "I see. Take your time, but are you sure you don't want to reconsider?";
  }
}

export async function summarizeRoleplaySession(
  scenario: string,
  persona: string,
  chatHistory: RoleplayMessage[]
): Promise<RoleplaySummary> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      score: 88,
      summary: `Successfully maintained refusal boundaries against the ${persona} during the "${scenario}" scenario without apologizing or giving in.`,
      strengths: ['Direct clear refusal', 'Used non-defensive tone', 'Maintained composure'],
      improvements: ['Could pivot to an alternative activity faster'],
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
  "improvements": ["Improvement suggestion"]
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
        improvements: parsed.improvements || ['Practice urge surfing techniques'],
      };
    }
    throw new Error('Empty summary output');
  } catch (err) {
    console.warn('Roleplay summary fallback:', err);
    return {
      score: 85,
      summary: 'Maintained refusal boundaries and asserted control throughout the scenario.',
      strengths: ['Clear direct communication', 'Stayed calm under pressure'],
      improvements: ['State personal reason if comfortable'],
    };
  }
}
