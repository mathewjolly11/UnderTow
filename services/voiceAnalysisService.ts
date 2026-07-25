'use client';

import { AcousticMetrics } from '@/components/StressMeter';

export function analyzeVoiceAcoustics(
  transcript: string,
  durationSeconds: number,
  averageVolume: number,
  pauseCount: number
): AcousticMetrics {
  const cleanText = transcript.trim();
  const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;
  const effectiveDuration = Math.max(1, durationSeconds);

  // 1. Calculate Speech Rate (Words Per Minute)
  const speechRate = Math.round((wordCount / effectiveDuration) * 60);

  // 2. Normalize Volume (0-100 scale)
  const normalizedVolume = Math.min(100, Math.max(10, Math.round(averageVolume)));

  // 3. Compute Vocal Stress Score (0-100)
  // Higher WPM (> 160) or very low WPM (< 90), high pauses (> 5), and volume spikes increase stress score
  let stressPoints = 0;

  // Pace penalty
  if (speechRate > 175) stressPoints += 40;
  else if (speechRate > 155) stressPoints += 25;
  else if (speechRate < 90 && wordCount > 5) stressPoints += 20;

  // Pause penalty
  if (pauseCount >= 7) stressPoints += 30;
  else if (pauseCount >= 4) stressPoints += 15;

  // Volume penalty
  if (normalizedVolume > 75) stressPoints += 20;

  const stressScore = Math.min(100, Math.max(10, stressPoints + Math.floor(Math.random() * 10)));

  // 4. Determine Stress State Category
  let stressState: 'Calm' | 'Mild' | 'High' | 'Acute' = 'Calm';
  if (stressScore >= 75) stressState = 'Acute';
  else if (stressScore >= 50) stressState = 'High';
  else if (stressScore >= 25) stressState = 'Mild';

  return {
    speechRate,
    volume: normalizedVolume,
    pauseCount,
    duration: effectiveDuration,
    stressState,
    stressScore,
  };
}
