import { rotateGeminiApiKey } from '@/services/geminiKeyRotation';

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  timeoutMs?: number;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  let delayMs = options.initialDelayMs ?? 1000;
  const timeoutMs = options.timeoutMs ?? 15000; // 15s default timeout

  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Operation timed out')), timeoutMs);
      });

      // Race the operation against the timeout
      const result = await Promise.race([operation(), timeoutPromise]);
      return result;
    } catch (error: unknown) {
      attempt++;
      
      const errorObj = error as { status?: number; message?: string };
      const isRateLimit =
        errorObj?.status === 429 ||
        errorObj?.message?.includes('429') ||
        errorObj?.message?.includes('quota');
        
      const isAuthError = 
        errorObj?.status === 401 || 
        errorObj?.message?.includes('401') || 
        errorObj?.message?.includes('UNAUTHENTICATED');

      if (isRateLimit || isAuthError) {
        console.warn(`[Retry ${attempt}/${maxRetries}] AI API error detected. Rotating key and retrying...`);
        rotateGeminiApiKey();
      } else {
        console.warn(`[Retry ${attempt}/${maxRetries}] AI Operation failed:`, errorObj?.message || error);
      }

      if (attempt >= maxRetries) {
        throw error;
      }

      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      delayMs *= 2;
    }
  }

  throw new Error('Maximum retries exceeded');
}
