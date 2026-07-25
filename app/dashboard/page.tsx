'use client';

import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import {
  Mic,
  Activity,
  ShieldCheck,
  TrendingUp,
  Brain,
  Flame,
} from 'lucide-react';
import {
  MOCK_PROFILE,
  MOCK_VOICE_SESSIONS,
  MOCK_ROLEPLAY_SESSIONS,
  MOCK_STRESS_TRENDS,
  MOCK_MEMORY,
} from '@/lib/mockData';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { VoiceSession, RoleplaySession, UserMemory } from '@/types/database';

export default function DashboardPage() {
  const { profile, user } = useAuth();
  const [dbVoiceSessions, setDbVoiceSessions] = useState<VoiceSession[]>(MOCK_VOICE_SESSIONS);
  const [dbRoleplaySessions, setDbRoleplaySessions] = useState<RoleplaySession[]>(MOCK_ROLEPLAY_SESSIONS);
  const [dbUserMemory, setDbUserMemory] = useState<UserMemory>(MOCK_MEMORY);

  useEffect(() => {
    async function loadLiveDashboardData() {
      if (!user?.id) return;
      try {
        // 1. Fetch live voice sessions
        const { data: voiceData } = await supabase
          .from('voice_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (voiceData && voiceData.length > 0) {
          setDbVoiceSessions(voiceData);
        }

        // 2. Fetch live roleplay sessions
        const { data: roleplayData } = await supabase
          .from('roleplay_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (roleplayData && roleplayData.length > 0) {
          setDbRoleplaySessions(roleplayData);
        }

        // 3. Fetch live user memory
        const { data: memData } = await supabase
          .from('user_memory')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (memData) {
          setDbUserMemory(memData);
        }
      } catch (err) {
        console.warn('Dashboard live query notice:', err);
      }
    }

    loadLiveDashboardData();
  }, [user]);

  const latestSession = dbVoiceSessions[0] || MOCK_VOICE_SESSIONS[0];
  const displayName = profile?.name || user?.email?.split('@')[0] || MOCK_PROFILE.name;
  const userGoal = profile?.recovery_goal || MOCK_PROFILE.recovery_goal;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#09090B]">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#14B8A6] font-semibold mb-1">
              <Flame className="h-4 w-4" /> 42 Day Recovery Streak
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {displayName.split(' ')[0]}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Goal: {userGoal}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/check-in"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-xs font-semibold text-white shadow-lg shadow-[#6366F1]/20 hover:opacity-95 transition-all"
            >
              <Mic className="h-4 w-4" /> Voice Stress Check-In
            </Link>
          </div>
        </div>

        {/* Overview Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Metric 1 */}
          <div className="glass-panel p-5 rounded-2xl space-y-2 border border-[#27272A]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Current Stress Status</span>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-2xl font-bold text-white flex items-center gap-2">
              {latestSession.stress_state}
              <span className="text-xs font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Stable
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">Based on last voice check-in (2h ago)</p>
          </div>

          {/* Metric 2 */}
          <div className="glass-panel p-5 rounded-2xl space-y-2 border border-[#27272A]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Avg Speech Cadence</span>
              <Activity className="h-4 w-4 text-[#6366F1]" />
            </div>
            <div className="text-2xl font-bold text-white">
              {latestSession.speech_rate} <span className="text-xs font-normal text-zinc-400">WPM</span>
            </div>
            <p className="text-[11px] text-zinc-500">Optimal baseline: 120-150 WPM</p>
          </div>

          {/* Metric 3 */}
          <div className="glass-panel p-5 rounded-2xl space-y-2 border border-[#27272A]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Roleplay Mastery Score</span>
              <Brain className="h-4 w-4 text-[#14B8A6]" />
            </div>
            <div className="text-2xl font-bold text-white">
              92<span className="text-xs text-zinc-400 font-normal">/100</span>
            </div>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +8 pts this week
            </p>
          </div>

          {/* Metric 4 */}
          <div className="glass-panel p-5 rounded-2xl space-y-2 border border-[#27272A]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Caregiver Sync</span>
              <ShieldCheck className="h-4 w-4 text-[#14B8A6]" />
            </div>
            <div className="text-2xl font-bold text-white">Active</div>
            <p className="text-[11px] text-zinc-500">Weekly report sent to Sarah</p>
          </div>
        </div>

        {/* Stress Trend Chart & Emergency Script */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart column */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-[#27272A] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Vocal Stress Progression</h3>
                <p className="text-xs text-zinc-400">Weekly voice acoustic pattern analysis</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#18181B] border border-[#27272A] text-zinc-300">
                Last 7 Days
              </span>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_STRESS_TRENDS}>
                  <defs>
                    <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#52525B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#52525B" fontSize={11} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181B',
                      borderColor: '#27272A',
                      borderRadius: '12px',
                      color: '#FFF',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="stressScore"
                    stroke="#6366F1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#stressGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Emergency Grounding Vault */}
          <div className="glass-panel p-6 rounded-3xl border border-[#27272A] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#14B8A6] uppercase tracking-wider mb-2">
                <ShieldCheck className="h-4 w-4" /> Personal Memory Vault
              </div>
              <h3 className="text-base font-bold text-white mb-2">Emergency Grounding Script</h3>
              <p className="text-xs text-zinc-300 bg-[#09090B] p-3.5 rounded-2xl border border-[#27272A] leading-relaxed italic">
                &quot;{dbUserMemory.emergency_script || MOCK_MEMORY.emergency_script}&quot;
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-semibold text-zinc-400">Safe Contact Person</div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#18181B] border border-[#27272A]">
                <div>
                  <div className="text-xs font-semibold text-white">
                    {dbUserMemory.safe_people?.[0]?.name || MOCK_MEMORY.safe_people[0].name}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {dbUserMemory.safe_people?.[0]?.relationship || MOCK_MEMORY.safe_people[0].relationship}
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-[#14B8A6]/20 border border-[#14B8A6]/30 text-xs font-medium text-[#14B8A6] hover:bg-[#14B8A6]/30">
                  Call Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Voice Check-Ins */}
          <div className="glass-panel p-6 rounded-3xl border border-[#27272A] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Mic className="h-4 w-4 text-[#6366F1]" /> Recent Voice Check-Ins
              </h3>
              <Link href="/check-in" className="text-xs text-[#6366F1] font-semibold hover:underline">
                New Check-In →
              </Link>
            </div>

            <div className="space-y-3">
              {dbVoiceSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 rounded-2xl bg-[#18181B]/60 border border-[#27272A] space-y-2 hover:border-zinc-700 transition-all"
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
                    <span className="text-zinc-500 text-[10px]">
                      {new Date(session.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 line-clamp-2 italic">
                    &quot;{session.transcript}&quot;
                  </p>
                  <div className="flex items-center gap-4 text-[10px] text-zinc-500 pt-1">
                    <span>Rate: {session.speech_rate} WPM</span>
                    <span>Pauses: {session.pause_count}</span>
                    <span>Confidence: {Math.round(session.confidence * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Roleplay Sessions */}
          <div className="glass-panel p-6 rounded-3xl border border-[#27272A] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Brain className="h-4 w-4 text-[#14B8A6]" /> AI Roleplay Simulator
              </h3>
              <Link href="/roleplay" className="text-xs text-[#14B8A6] font-semibold hover:underline">
                Practice Scenario →
              </Link>
            </div>

            <div className="space-y-3">
              {dbRoleplaySessions.map((rp) => (
                <div
                  key={rp.id}
                  className="p-4 rounded-2xl bg-[#18181B]/60 border border-[#27272A] space-y-2 hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{rp.scenario}</span>
                    <span className="font-extrabold text-[#14B8A6] bg-[#14B8A6]/10 px-2 py-0.5 rounded-lg border border-[#14B8A6]/20">
                      Score {rp.score}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">{rp.summary}</p>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                    <span>Intensity: {rp.intensity}</span>
                    <span>{new Date(rp.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
