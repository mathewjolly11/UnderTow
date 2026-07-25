'use client';

import { useEffect, useRef, useState } from 'react';

export function calculateAudioMetrics(dataArray: Uint8Array) {
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i];
  }
  const avgVolume = dataArray.length > 0 ? Math.min(100, Math.round(sum / dataArray.length)) : 0;

  const rawBars = Array.from(dataArray.slice(0, 30)).map((val) =>
    Math.max(8, Math.round((val / 255) * 80))
  );

  const waveformBars =
    rawBars.length < 30
      ? [...rawBars, ...Array(30 - rawBars.length).fill(10)]
      : rawBars.slice(0, 30);

  return {
    volume: avgVolume,
    waveform: waveformBars,
  };
}

export function useAudioVisualizer(isRecording: boolean) {
  const [audioMetrics, setAudioMetrics] = useState({
    volume: 0,
    waveform: Array(30).fill(10),
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRecording) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try {
          audioCtxRef.current.close();
        } catch {}
        audioCtxRef.current = null;
      }
      requestAnimationFrame(() => {
        setAudioMetrics({ volume: 0, waveform: Array(30).fill(10) });
      });
      return;
    }

    async function initAudio() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioCtxRef.current = audioCtx;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const renderWaveform = () => {
          analyser.getByteFrequencyData(dataArray);
          setAudioMetrics(calculateAudioMetrics(dataArray));
          animFrameRef.current = requestAnimationFrame(renderWaveform);
        };

        renderWaveform();
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Microphone audio context access blocked or unavailable:', err);
        }
      }
    }

    initAudio();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try {
          audioCtxRef.current.close();
        } catch {}
        audioCtxRef.current = null;
      }
    };
  }, [isRecording]);

  return audioMetrics;
}
