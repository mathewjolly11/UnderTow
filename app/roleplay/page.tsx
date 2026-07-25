'use client';

import { useState, useRef, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import type { RoleplayMessage, RoleplaySummary } from '@/services/geminiRoleplayService';
import { generateRoleplayResponseAction, summarizeRoleplaySessionAction } from '@/app/actions';
import { supabase } from '@/lib/supabase/client';
import { MOCK_ROLEPLAY_SESSIONS } from '@/lib/mockData';
import { RoleplaySession, IWindowSpeech } from '@/types/database';
import {
  Brain,
  Mic,
  Square,
  Sparkles,
  Award,
  CheckCircle2,
  Play,
  RotateCcw,
  MessageSquare,
} from 'lucide-react';

type PersonaType = 'Friend' | 'Family' | 'Dealer' | 'Coworker' | 'Custom';

export default function RoleplayPage() {
  const { user } = useAuth();
  const { speak, stop: stopSpeech } = useSpeechSynthesis();

  // Persona Selection State
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>('Friend');
  const [customScenarioText, setCustomScenarioText] = useState('');
  const [sessionActive, setSessionActive] = useState(false);
  const [messages, setMessages] = useState<RoleplayMessage[]>([]);
  
  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Summary State
  const [sessionSummary, setSessionSummary] = useState<RoleplaySummary | null>(null);
  const [pastSessions, setPastSessions] = useState<RoleplaySession[]>(MOCK_ROLEPLAY_SESSIONS);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Fetch past roleplay sessions
  useEffect(() => {
    async function loadSessions() {
      if (!user?.id) return;
      try {
        const { data } = await supabase
          .from('roleplay_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          setPastSessions(data);
        }
      } catch (err) {
        console.warn('Using mock roleplay fallback', err);
      }
    }
    loadSessions();
  }, [user]);

  const personas = [
    {
      type: 'Friend' as PersonaType,
      title: 'Persuasive Friend',
      scenario: 'High-pressure party where drinks or substances are being passed around.',
      desc: 'Practices casual refusal without ruining social relationships.',
      color: 'border-[#6366F1] text-[#6366F1] bg-[#6366F1]/10',
    },
    {
      type: 'Coworker' as PersonaType,
      title: 'Workplace Peer',
      scenario: 'After-hours corporate mixer where colleagues insist on celebrating.',
      desc: 'Practices professional boundary setting and non-apologetic refusal.',
      color: 'border-[#14B8A6] text-[#14B8A6] bg-[#14B8A6]/10',
    },
    {
      type: 'Family' as PersonaType,
      title: 'Family Member',
      scenario: 'Tense family dinner with old emotional triggers and past expectations.',
      desc: 'Practices emotional regulation and firm boundary enforcement.',
      color: 'border-yellow-500 text-yellow-400 bg-yellow-500/10',
    },
    {
      type: 'Dealer' as PersonaType,
      title: 'Aggressive Trigger',
      scenario: 'High-temptation offer with free samples or discounts.',
      desc: 'Practices immediate direct refusal and exit strategies.',
      color: 'border-red-500 text-red-400 bg-red-500/10',
    },
    {
      type: 'Custom' as PersonaType,
      title: 'Custom Scenario',
      scenario: customScenarioText || 'Define your own personal trigger scenario.',
      desc: 'Tailor the simulation to your exact personal recovery goals.',
      color: 'border-purple-500 text-purple-400 bg-purple-500/10',
    },
  ];

  const currentScenarioStr =
    selectedPersona === 'Custom'
      ? customScenarioText || 'Custom recovery scenario'
      : personas.find((p) => p.type === selectedPersona)?.scenario || 'Refusal scenario';

  // Start Roleplay Session
  const startSession = async () => {
    setSessionActive(true);
    setSessionSummary(null);
    setMessages([]);
    setIsAiThinking(true);

    const firstAiText = await generateRoleplayResponseAction(currentScenarioStr, selectedPersona, []);
    setIsAiThinking(false);

    const initialMessages: RoleplayMessage[] = [{ sender: 'partner', text: firstAiText }];
    setMessages(initialMessages);

    // Vocalize first response
    speak(firstAiText);
  };

  // Start Voice Recognition
  const startVoiceInput = () => {
    setIsListening(true);
    setTranscript('');
    setInterimText('');

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

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalStr += t + ' ';
          else interimStr += t;
        }

        if (finalStr) setTranscript((prev) => prev + finalStr);
        setInterimText(interimStr);
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch {}
    }
  };

  // Stop Voice Recognition & Submit User Turn
  const stopVoiceInputAndSend = async () => {
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    const userText = (transcript + ' ' + interimText).trim();
    if (!userText) return;

    const newHistory: RoleplayMessage[] = [...messages, { sender: 'user', text: userText }];
    setMessages(newHistory);
    setTranscript('');
    setInterimText('');

    // Generate AI Partner Response
    setIsAiThinking(true);
    const partnerReply = await generateRoleplayResponseAction(currentScenarioStr, selectedPersona, newHistory);
    setIsAiThinking(false);

    const updatedHistory: RoleplayMessage[] = [...newHistory, { sender: 'partner', text: partnerReply }];
    setMessages(updatedHistory);

    // Speak partner response
    speak(partnerReply);
  };

  // End Session & Generate Summary
  const endSession = async () => {
    stopSpeech();
    setIsListening(false);
    setSessionActive(false);

    if (messages.length > 0) {
      setIsAiThinking(true);
      const summaryResult = await summarizeRoleplaySessionAction(currentScenarioStr, selectedPersona, messages);
      setSessionSummary(summaryResult);
      setIsAiThinking(false);

      // Save to Supabase
      const newSessionRecord: RoleplaySession = {
        id: 'rp_' + Date.now(),
        user_id: user?.id || 'usr_mock_123',
        scenario: currentScenarioStr,
        intensity: 'Medium',
        score: summaryResult.score,
        summary: summaryResult.summary,
        created_at: new Date().toISOString(),
      };

      setPastSessions((prev) => [newSessionRecord, ...prev]);

      if (user?.id) {
        try {
          await supabase.from('roleplay_sessions').insert({
            user_id: user.id,
            scenario: currentScenarioStr,
            intensity: 'Medium',
            score: summaryResult.score,
            summary: summaryResult.summary,
          });
        } catch (err) {
          console.warn('Failed saving roleplay session to Supabase:', err);
        }
      }
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#09090B]">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-6">
          <div>
            <span className="text-xs font-semibold text-[#14B8A6] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#6366F1]" /> Gemini AI Cognitive Partner
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
              AI Roleplay Refusal Simulator
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Practice setting boundaries in real-time voice conversations before facing high-trigger social situations.
            </p>
          </div>
        </div>

        {/* 1. Persona Selector Grid (when session is inactive) */}
        {!sessionActive && !sessionSummary && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-white">Select Persona & Trigger Scenario</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {personas.map((p) => (
                <div
                  key={p.type}
                  onClick={() => setSelectedPersona(p.type)}
                  className={`glass-panel p-6 rounded-3xl border cursor-pointer transition-all space-y-3 ${
                    selectedPersona === p.type
                      ? 'border-[#14B8A6] bg-[#14B8A6]/10 shadow-[0_0_30px_rgba(20,184,166,0.15)] scale-[1.02]'
                      : 'border-[#27272A] hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${p.color}`}>
                      {p.title}
                    </span>
                    {selectedPersona === p.type && (
                      <CheckCircle2 className="h-5 w-5 text-[#14B8A6]" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-300 font-medium leading-relaxed">{p.scenario}</p>
                  <p className="text-[11px] text-zinc-500">{p.desc}</p>
                </div>
              ))}
            </div>

            {selectedPersona === 'Custom' && (
              <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-2 max-w-2xl">
                <label className="text-xs font-semibold text-zinc-300">Custom Trigger Description</label>
                <textarea
                  rows={2}
                  value={customScenarioText}
                  onChange={(e) => setCustomScenarioText(e.target.value)}
                  placeholder="e.g. Neighbor offering drinks during a weekend BBQ..."
                  className="w-full p-3 rounded-xl bg-[#09090B] border border-[#27272A] text-xs text-white resize-none focus:outline-none"
                />
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={startSession}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-sm font-extrabold text-black shadow-xl shadow-[#14B8A6]/25 hover:opacity-95 transition-all flex items-center gap-2"
              >
                <Play className="h-5 w-5 fill-black" /> Begin Voice Roleplay Session
              </button>
            </div>
          </div>
        )}

        {/* 2. Active Voice Conversation Interface */}
        {sessionActive && (
          <div className="glass-panel p-8 rounded-3xl border border-[#27272A] space-y-6 max-w-3xl mx-auto">
            {/* Session Top Bar */}
            <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-white">
                  Active Simulation: {selectedPersona} Persona
                </span>
              </div>
              <button
                onClick={endSession}
                className="px-4 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-all"
              >
                End & Evaluate Session
              </button>
            </div>

            {/* Chat Transcript Box */}
            <div className="space-y-4 max-h-[350px] overflow-y-auto p-4 bg-[#09090B] rounded-2xl border border-[#27272A]">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md p-4 rounded-2xl text-xs leading-relaxed space-y-1 ${
                      msg.sender === 'user'
                        ? 'bg-[#6366F1] text-white rounded-br-none'
                        : 'bg-[#18181B] text-zinc-200 border border-[#27272A] rounded-bl-none'
                    }`}
                  >
                    <div className="text-[10px] font-bold opacity-70 uppercase tracking-wider">
                      {msg.sender === 'user' ? 'You' : `AI (${selectedPersona})`}
                    </div>
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}

              {isAiThinking && (
                <div className="text-xs text-[#14B8A6] flex items-center gap-2 italic p-2">
                  <Sparkles className="h-4 w-4 animate-spin" /> Gemini AI partner is formulating response...
                </div>
              )}
            </div>

            {/* Speech Controls */}
            <div className="flex flex-col items-center gap-4 pt-2">
              <div className="text-xs text-zinc-400 min-h-[20px] text-center italic">
                {transcript || interimText ? (
                  <span>&quot;{transcript} {interimText}&quot;</span>
                ) : (
                  <span>Press &quot;Speak Response&quot; to state your refusal aloud</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {!isListening ? (
                  <button
                    onClick={startVoiceInput}
                    disabled={isAiThinking}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-xs font-bold text-white shadow-xl shadow-[#6366F1]/25 hover:opacity-95 transition-all flex items-center gap-2"
                  >
                    <Mic className="h-4 w-4" /> Press to Speak Refusal
                  </button>
                ) : (
                  <button
                    onClick={stopVoiceInputAndSend}
                    className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-xl shadow-emerald-600/30 transition-all flex items-center gap-2 animate-pulse"
                  >
                    <Square className="h-4 w-4 fill-white" /> Finish & Send Turn to AI
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. Session End Breakdown Summary */}
        {sessionSummary && !sessionActive && (
          <div className="glass-panel p-8 rounded-3xl border border-[#27272A] space-y-6 max-w-3xl mx-auto animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-[#14B8A6]" />
                <div>
                  <h3 className="text-xl font-extrabold text-white">Roleplay Mastery Summary</h3>
                  <p className="text-xs text-zinc-400">Clinical breakdown of boundary control</p>
                </div>
              </div>
              <div className="text-2xl font-black text-[#14B8A6] bg-[#14B8A6]/10 px-4 py-1.5 rounded-2xl border border-[#14B8A6]/20">
                Score: {sessionSummary.score}/100
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Boundary Evaluation</span>
              <p className="text-xs text-zinc-200 bg-[#18181B] p-4 rounded-2xl border border-[#27272A] leading-relaxed">
                {sessionSummary.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Key Strengths
                </span>
                <ul className="space-y-1 text-zinc-300">
                  {sessionSummary.strengths.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 space-y-2">
                <span className="font-bold text-yellow-400 flex items-center gap-1.5">
                  <Brain className="h-4 w-4" /> Growth Areas
                </span>
                <ul className="space-y-1 text-zinc-300">
                  {sessionSummary.growthAreas.map((imp: string, i: number) => (
                    <li key={i}>• {imp}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                onClick={() => setSessionSummary(null)}
                className="px-6 py-2.5 rounded-xl bg-[#27272A] hover:bg-zinc-700 text-xs font-semibold text-white flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" /> Practice Another Scenario
              </button>
            </div>
          </div>
        )}

        {/* 4. Past Roleplay History Table */}
        <div className="glass-panel p-6 rounded-3xl border border-[#27272A] space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-[#6366F1]" /> Completed Practice History
          </h3>
          <div className="space-y-3">
            {pastSessions.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white">{s.scenario}</div>
                  <div className="text-[11px] text-zinc-400 italic">&quot;{s.summary}&quot;</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-extrabold text-[#14B8A6]">{s.score} PTS</div>
                  <div className="text-[10px] text-zinc-500">{new Date(s.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
