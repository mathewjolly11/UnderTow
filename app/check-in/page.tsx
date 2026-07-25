'use client';

import { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useAudioVisualizer } from '@/hooks/useAudioVisualizer';
import { supabase } from '@/lib/supabase/client';
import { MOCK_VOICE_SESSIONS } from '@/lib/mockData';
import { StressMeter, AcousticMetrics } from '@/components/StressMeter';
import { analyzeVoiceAcoustics } from '@/services/voiceAnalysisService';
import type { GeminiStressEvaluation } from '@/services/geminiService';
import { evaluateStressAction } from '@/app/actions';
import { GeminiAnalysisResult } from '@/components/GeminiAnalysisResult';
import { CrisisOverlay } from '@/components/CrisisOverlay';
import { VoiceSession, UserMemory, IWindowSpeech } from '@/types/database';
import {
  Mic,
  Square,
  Clock,
  ShieldCheck,
  Sparkles,
  History,
} from 'lucide-react';

export default function CheckInPage() {
  const { user } = useAuth();

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [pauseCount, setPauseCount] = useState(0);
  const [pastSessions, setPastSessions] = useState<VoiceSession[]>(MOCK_VOICE_SESSIONS);
  const [isSupported, setIsSupported] = useState(true);

  // Audio Visualizer
  const { volume, waveform } = useAudioVisualizer(isRecording);

  // Speech Recognition Ref
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSpeechTimeRef = useRef<number>(0);

  // Fetch past sessions from Supabase
  useEffect(() => {
    async function loadPastSessions() {
      if (!user?.id) return;
      try {
        const { data } = await supabase
          .from('voice_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          setPastSessions(data);
        }
      } catch (err) {
        console.warn('Using mock voice session fallback', err);
      }
    }

    loadPastSessions();
  }, [user]);

  // Timer effect
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Check Browser Support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const win = window as unknown as IWindowSpeech;
      if (!win.SpeechRecognition && !win.webkitSpeechRecognition) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsSupported(false);
      }
    }
  }, []);

  // Speech Recognition setup
  const startRecording = () => {
    setIsRecording(true);
    setTimerSeconds(0);
    setLiveTranscript('');
    setInterimText('');
    setPauseCount(0);
    lastSpeechTimeRef.current = Date.now();

    const win = window as unknown as IWindowSpeech;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalStr = '';
        let interimStr = '';

        const now = Date.now();
        if (now - lastSpeechTimeRef.current > 2000) {
          setPauseCount((p) => p + 1);
        }
        lastSpeechTimeRef.current = now;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptSegment = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalStr += transcriptSegment + ' ';
          } else {
            interimStr += transcriptSegment;
          }
        }

        if (finalStr) {
          setLiveTranscript((prev) => prev + finalStr);
        }
        setInterimText(interimStr);
      };

      recognition.onerror = (err: unknown) => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Speech recognition notice:', err);
        }
      };

      recognition.onend = () => {
        // Restart if still marked recording
        if (isRecording && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch {}
        }
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (e) {
        console.warn('Failed to start speech recognition engine', e);
      }
    } else {
      console.warn('Browser speech recognition not supported in this environment.');
    }
  };

  const [lastMetrics, setLastMetrics] = useState<AcousticMetrics | null>(null);
  const [geminiResult, setGeminiResult] = useState<GeminiStressEvaluation | null>(null);
  const [evaluatingAI, setEvaluatingAI] = useState(false);
  const [showCrisisOverlay, setShowCrisisOverlay] = useState(false);
  const [userMemoryState, setUserMemoryState] = useState<UserMemory | null>(null);

  const stopRecording = async () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    const fullText =
      (liveTranscript + ' ' + interimText).trim() ||
      'Spoke for ' + timerSeconds + ' seconds during voice check-in session.';

    // 1. Acoustic Metrics
    const metrics = analyzeVoiceAcoustics(fullText, timerSeconds, volume || 60, pauseCount);
    setLastMetrics(metrics);

    // 2. Fetch User Memory for Gemini Prompt Context
    let memoryData = null;
    if (user?.id) {
      const { data: mem } = await supabase.from('user_memory').select('*').eq('user_id', user.id).single();
      memoryData = mem;
      if (mem) setUserMemoryState(mem);
    }

    // 3. Evaluate with Gemini API via Server Action
    setEvaluatingAI(true);
    const geminiEval = await evaluateStressAction(fullText, metrics, memoryData);
    setGeminiResult(geminiEval);
    setEvaluatingAI(false);

    // If Gemini evaluates Crisis or acoustic metrics are Acute, launch Crisis Overlay
    if (geminiEval.classification === 'Crisis' || metrics.stressState === 'Acute') {
      setShowCrisisOverlay(true);
    }

    // Map Gemini classification to DB stress_state
    const finalStressState =
      geminiEval.classification === 'Crisis'
        ? 'Acute'
        : geminiEval.classification === 'Elevated'
        ? 'High'
        : metrics.stressState;

    const newSession: VoiceSession = {
      id: 'vs_' + Date.now(),
      user_id: user?.id || 'usr_mock_123',
      transcript: fullText,
      speech_rate: metrics.speechRate,
      average_volume: metrics.volume,
      pause_count: metrics.pauseCount,
      stress_state: finalStressState,
      confidence: geminiEval.confidence,
      created_at: new Date().toISOString(),
    };

    setPastSessions((prev) => [newSession, ...prev]);

    // 4. Save metrics & Gemini classification to Supabase
    if (user?.id) {
      try {
        await supabase.from('voice_sessions').insert({
          user_id: user.id,
          transcript: fullText,
          speech_rate: metrics.speechRate,
          average_volume: metrics.volume,
          pause_count: metrics.pauseCount,
          stress_state: finalStressState,
          confidence: geminiEval.confidence,
        });
      } catch (err) {
        console.warn('Failed saving voice session with Gemini analysis to Supabase:', err);
      }
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#09090B]">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-6">
          <div>
            <span className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#14B8A6]" /> Browser Voice Acoustics Engine
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
              Proactive Voice Stress Check-In
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Speak naturally. Undertow tracks volume, speech pace, and pause count in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#18181B] border border-[#27272A] text-xs text-emerald-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Zero-Storage Local Processing</span>
            </div>
          </div>
        </div>

        {/* Live Audio Control Card */}
        <div className="glass-panel p-8 rounded-3xl border border-[#27272A] flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto relative overflow-hidden">
          {/* Animated Glow Halo */}
          <div
            className={`absolute inset-0 bg-gradient-to-r ${
              isRecording
                ? 'from-red-500/10 via-[#6366F1]/10 to-red-500/10 animate-pulse'
                : 'from-transparent'
            } pointer-events-none`}
          />

          {/* Top Timer Indicator */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#18181B] border border-[#27272A] text-xs font-mono font-semibold text-zinc-300">
            <Clock className={`h-4 w-4 ${isRecording ? 'text-red-400 animate-spin' : 'text-[#6366F1]'}`} />
            <span>{formatTimer(timerSeconds)}</span>
          </div>

          {/* Microphone Pulse Orb */}
          <div className="relative">
            <div
              className={`h-36 w-36 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                isRecording
                  ? 'border-red-500 bg-red-500/10 shadow-[0_0_50px_rgba(239,68,68,0.3)] scale-105'
                  : 'border-[#6366F1] bg-[#6366F1]/10 shadow-[0_0_40px_rgba(99,102,241,0.2)]'
              }`}
            >
              <Mic
                className={`h-16 w-16 transition-colors ${
                  isRecording ? 'text-red-400 animate-bounce' : 'text-[#6366F1]'
                }`}
              />
            </div>
          </div>

          {/* Real-time Waveform Bars */}
          <div className="w-full flex items-center justify-center gap-1 h-16 pt-2">
            {waveform.map((barHeight, idx) => (
              <div
                key={idx}
                className={`w-1.5 rounded-full transition-all duration-75 ${
                  isRecording
                    ? 'bg-gradient-to-t from-[#6366F1] to-[#14B8A6]'
                    : 'bg-zinc-800'
                }`}
                style={{ height: `${isRecording ? barHeight : 8}px` }}
              />
            ))}
          </div>

          {/* Live Transcript Display Box */}
          <div className="w-full bg-[#09090B] p-5 rounded-2xl border border-[#27272A] min-h-[100px] text-left space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              <span>Live Transcript Stream</span>
              {isRecording && (
                <span className="flex items-center gap-1.5 text-[#14B8A6]">
                  <span className="h-2 w-2 rounded-full bg-[#14B8A6] animate-ping" /> Listening...
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-200 leading-relaxed font-sans min-h-[40px]">
              {liveTranscript || interimText ? (
                <>
                  <span>{liveTranscript}</span>
                  <span className="text-zinc-500 italic">{interimText}</span>
                </>
              ) : (
                <span className="text-zinc-600 italic">
                  {isRecording
                    ? 'Start speaking... Your words will appear here in real time.'
                    : 'Press "Start Check-In" to begin speaking.'}
                </span>
              )}
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2 flex items-center gap-4">
            {!isSupported ? (
              <button
                type="button"
                disabled
                className="px-8 py-3.5 rounded-2xl bg-[#18181B] border border-[#27272A] text-sm font-bold text-zinc-500 cursor-not-allowed flex items-center gap-2"
              >
                Voice Features Require Chrome/Edge
              </button>
            ) : !isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-sm font-bold text-white shadow-xl shadow-[#6366F1]/25 hover:opacity-95 hover:scale-[1.02] transition-all flex items-center gap-2"
              >
                <Mic className="h-5 w-5" /> Start Voice Check-In
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="px-8 py-3.5 rounded-2xl bg-red-500 hover:bg-red-600 text-sm font-bold text-white shadow-xl shadow-red-500/30 transition-all flex items-center gap-2"
              >
                <Square className="h-5 w-5 fill-white" /> Stop & Save Check-In
              </button>
            )}
          </div>
        </div>

        {/* Acoustic Stress Meter Evaluation Results */}
        {lastMetrics && <StressMeter metrics={lastMetrics} />}

        {/* Gemini AI Neural Analysis Loading State */}
        {evaluatingAI && (
          <div className="glass-panel p-6 rounded-3xl border border-[#27272A] text-center space-y-3 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-[#6366F1]">
              <Sparkles className="h-5 w-5 animate-spin text-[#14B8A6]" />
              <span className="text-sm font-bold">Gemini AI is analyzing transcript and acoustic markers...</span>
            </div>
          </div>
        )}

        {/* Gemini AI Evaluation Card */}
        {geminiResult && !evaluatingAI && <GeminiAnalysisResult evaluation={geminiResult} />}

        {/* Emergency Crisis Intercept Overlay Modal */}
        {showCrisisOverlay && (
          <CrisisOverlay
            userMemory={userMemoryState}
            onClose={() => setShowCrisisOverlay(false)}
          />
        )}

        {/* Transcript History */}
        <div className="glass-panel p-6 rounded-3xl border border-[#27272A] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <History className="h-4 w-4 text-[#14B8A6]" /> Saved Transcript History
            </h3>
            <span className="text-xs text-zinc-500">{pastSessions.length} total sessions</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastSessions.map((session) => (
              <div
                key={session.id}
                className="p-4 rounded-2xl bg-[#18181B]/70 border border-[#27272A] space-y-2 hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`font-semibold px-2.5 py-0.5 rounded-full ${
                      session.stress_state === 'Calm'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : session.stress_state === 'Mild'
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {session.stress_state} Stress
                  </span>
                  <span suppressHydrationWarning className="text-[10px] text-zinc-500">
                    {new Date(session.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 italic line-clamp-3 leading-relaxed">
                  &quot;{session.transcript}&quot;
                </p>

                <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-2 border-t border-[#27272A]/50">
                  <span>Rate: {session.speech_rate} WPM</span>
                  <span>Pauses: {session.pause_count}</span>
                  <span>Confidence: {Math.round(session.confidence * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
