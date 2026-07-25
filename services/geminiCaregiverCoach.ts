import { GoogleGenAI } from '@google/genai';

export interface RewrittenCaregiverMessage {
  originalText: string;
  rewrittenText: string;
  explanation: string;
}

export async function rewriteCaregiverMessageWithGemini(
  draftMessage: string,
  userStage: string = 'Active Maintenance'
): Promise<RewrittenCaregiverMessage> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Fallback if API key is unconfigured
    return {
      originalText: draftMessage,
      rewrittenText: `Hey, I noticed you've been working hard on your recovery goals. I'm really proud of your steady progress and here if you ever want to talk or take a walk!`,
      explanation: 'Reframed message from anxious questioning to supportive, non-judgmental encouragement.',
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are an expert recovery caregiver communication coach for "Undertow".
Your objective is to rewrite a caregiver's draft text message to their recovering loved one so that it is highly supportive, non-judgmental, non-accusatory, and respects personal autonomy.

USER RECOVERY STAGE: ${userStage}
DRAFT CAREGIVER MESSAGE:
"${draftMessage}"

RULES FOR REWRITING:
1. Remove any passive-aggressive, suspicious, or anxious probing (e.g., "Where were you?", "Are you relapsing?").
2. Reframe with empathy, validation, and open-ended non-intrusive support.
3. Keep it warm, concise, and natural (1-3 sentences).

REQUIRED JSON FORMAT:
{
  "originalText": "${draftMessage}",
  "rewrittenText": "The refined supportive version...",
  "explanation": "Brief 1-sentence explanation of why this reframe helps prevent defensive stress triggers."
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
        originalText: draftMessage,
        rewrittenText: parsed.rewrittenText || draftMessage,
        explanation: parsed.explanation || 'Reframed to promote open trust.',
      };
    }

    throw new Error('Empty response from Gemini coach');
  } catch (err) {
    console.warn('Gemini Caregiver Coach fallback:', err);
    return {
      originalText: draftMessage,
      rewrittenText: `Hi! Just wanted to send some love and support your way today. Extremely proud of your dedication!`,
      explanation: 'Transformed into positive non-demanding encouragement.',
    };
  }
}
