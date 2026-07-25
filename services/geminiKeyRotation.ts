/**
 * Helper to retrieve an active Gemini API key from environment variables or a comma-separated key pool.
 * Rotates to the next key if a key reaches quota rate limits (429 HTTP Too Many Requests).
 */

let currentKeyIndex = 0;

export function getGeminiApiKey(): string | null {
  const rawPool = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
  if (!rawPool) return null;

  // Split by comma in case multiple keys are provided: "key1,key2,key3"
  const keys = rawPool.split(',').map((k) => k.trim()).filter(Boolean);
  if (keys.length === 0) return null;

  return keys[currentKeyIndex % keys.length];
}

export function rotateGeminiApiKey(): string | null {
  const rawPool = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
  if (!rawPool) return null;

  const keys = rawPool.split(',').map((k) => k.trim()).filter(Boolean);
  if (keys.length <= 1) return keys[0] || null;

  currentKeyIndex = (currentKeyIndex + 1) % keys.length;
  console.warn(`[Undertow AI] Rotated to backup Gemini API key index ${currentKeyIndex}`);
  return keys[currentKeyIndex];
}
