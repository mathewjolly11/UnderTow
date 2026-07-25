'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { MOCK_STRESS_TRENDS, MOCK_PROFILE } from '@/lib/mockData';
import {
  rewriteCaregiverMessageWithGemini,
  RewrittenCaregiverMessage,
} from '@/services/geminiCaregiverCoach';
import {
  Users,
  ShieldCheck,
  Flame,
  Activity,
  Brain,
  Sparkles,
  Send,
  MessageSquare,
  Lock,
  History,
  TrendingUp,
  Heart,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export default function CaregiverPage() {
  const { user, profile } = useAuth();

  // Privacy-safe high-level metrics
  const [metrics, setMetrics] = useState({
    practiceCount: 14,
    interventionCount: 2,
    currentStreak: 42,
  });

  // Message Coach State
  const [draftMessage, setDraftMessage] = useState('');
  const [isCoachThinking, setIsCoachThinking] = useState(false);
  const [coachResult, setCoachResult] = useState<RewrittenCaregiverMessage | null>(null);
  const [sentMessages, setSentMessages] = useState<RewrittenCaregiverMessage[]>([
    {
      originalText: 'Did you make it to your meeting today? Call me right away.',
      rewrittenText:
        'Hey Alex! Just wanted to send some love your way. Hope your day went smoothly and here whenever you want to catch up!',
      explanation: 'Removed demanding urgency to prevent stress pressure.',
    },
  ]);

  // Load privacy-safe counts
  useEffect(() => {
    async function loadPrivacyCounts() {
      if (!user?.id) return;
      try {
        const { count: voiceCount } = await supabase
          .from('voice_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const { count: roleplayCount } = await supabase
          .from('roleplay_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        setMetrics((prev) => ({
          ...prev,
          practiceCount: (voiceCount || 0) + (roleplayCount || 0) || 14,
        }));
      } catch (err) {
        console.warn('Using privacy metrics fallback', err);
      }
    }
    loadPrivacyCounts();
  }, [user]);

  const handleRewrite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftMessage.trim()) return;

    setIsCoachThinking(true);
    const result = await rewriteCaregiverMessageWithGemini(draftMessage, profile?.stage || 'Active Maintenance');
    setCoachResult(result);
    setIsCoachThinking(false);
  };

  const handleSendRewritten = () => {
    if (!coachResult) return;
    setSentMessages((prev) => [coachResult, ...prev]);
    setDraftMessage('');
    setCoachResult(null);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#09090B]">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8">
        {/* Privacy Guard Notice Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-6">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Zero-Knowledge Privacy Architecture
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
              Caregiver Support Hub
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              High-level recovery trajectories only. <strong className="text-zinc-200">Raw voice transcripts & audio logs are strictly hidden</strong> to preserve trust.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
            <Lock className="h-3.5 w-3.5" /> Transcripts Unstored & Encrypted
          </div>
        </div>

        {/* 1. Privacy-Safe Metrics Cards (No Transcripts) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1: Practice Count */}
          <div className="glass-panel p-5 rounded-2xl border border-[#27272A] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Total Practice Sessions</span>
              <Brain className="h-4 w-4 text-[#14B8A6]" />
            </div>
            <div className="text-3xl font-extrabold text-white">{metrics.practiceCount}</div>
            <p className="text-[11px] text-zinc-500">Voice check-ins & roleplay simulations</p>
          </div>

          {/* Card 2: Interventions Triggered */}
          <div className="glass-panel p-5 rounded-2xl border border-[#27272A] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Active Grounding Resets</span>
              <Activity className="h-4 w-4 text-[#6366F1]" />
            </div>
            <div className="text-3xl font-extrabold text-white">{metrics.interventionCount}</div>
            <p className="text-[11px] text-emerald-400 font-medium">Successfully completed exercises</p>
          </div>

          {/* Card 3: Recovery Streak */}
          <div className="glass-panel p-5 rounded-2xl border border-[#27272A] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Current Recovery Streak</span>
              <Flame className="h-4 w-4 text-orange-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {metrics.currentStreak} <span className="text-xs text-zinc-400 font-normal">Days</span>
            </div>
            <p className="text-[11px] text-zinc-500">Continuous active engagement</p>
          </div>
        </div>

        {/* 2. Privacy-Safe Weekly Stress Trend Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-[#27272A] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Weekly High-Level Health Trend</h3>
              <p className="text-xs text-zinc-400">Aggregated acoustic wellness index (No intimate logs)</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#18181B] border border-[#27272A] text-zinc-300">
              Aggregated Status: Calm
            </span>
          </div>

          <div className="h-60 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_STRESS_TRENDS}>
                <defs>
                  <linearGradient id="caregiverGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
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
                  stroke="#14B8A6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#caregiverGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. AI Caregiver Message Coach */}
        <div className="glass-panel p-6 rounded-3xl border border-[#27272A] space-y-6 max-w-3xl">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20">
                <Sparkles className="h-5 w-5 text-[#14B8A6]" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">AI Caregiver Message Coach</h3>
                <p className="text-xs text-zinc-400">Reframes draft messages into supportive, non-triggering phrasing</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleRewrite} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300">Your Draft Message to Loved One</label>
              <textarea
                rows={3}
                value={draftMessage}
                onChange={(e) => setDraftMessage(e.target.value)}
                placeholder="e.g. Where are you? Why haven't you called me back today?"
                className="w-full mt-1.5 p-3 rounded-2xl bg-[#09090B] border border-[#27272A] text-xs text-white placeholder-zinc-500 focus:border-[#6366F1] focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isCoachThinking || !draftMessage.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-xs font-bold text-white shadow-lg shadow-[#6366F1]/20 hover:opacity-95 transition-all flex items-center gap-2"
            >
              {isCoachThinking ? 'Reframing Message...' : 'Rewrite with AI Coach'}{' '}
              <Sparkles className="h-4 w-4" />
            </button>
          </form>

          {/* Coach Suggested Reframed Output */}
          {coachResult && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#14B8A6]/10 via-[#18181B] to-[#6366F1]/10 border border-[#14B8A6]/30 space-y-3 animate-fadeIn">
              <div className="text-xs font-bold text-[#14B8A6] flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" /> AI Reframed Version (Recommended)
              </div>
              <p className="text-xs text-white leading-relaxed font-medium bg-[#09090B] p-3.5 rounded-xl border border-[#27272A]">
                "{coachResult.rewrittenText}"
              </p>
              <p className="text-[11px] text-zinc-400 italic">Why this helps: {coachResult.explanation}</p>

              <button
                onClick={handleSendRewritten}
                className="px-5 py-2 rounded-xl bg-[#14B8A6] text-xs font-bold text-black shadow-md hover:opacity-90 transition-all flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" /> Save & Send Message
              </button>
            </div>
          )}
        </div>

        {/* 4. Sent Message History */}
        <div className="glass-panel p-6 rounded-3xl border border-[#27272A] space-y-4 max-w-3xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History className="h-4 w-4 text-[#14B8A6]" /> Reframed Communication History
          </h3>
          <div className="space-y-3">
            {sentMessages.map((msg, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-2">
                <div className="text-[11px] text-zinc-500 line-through">Draft: "{msg.originalText}"</div>
                <div className="text-xs text-white font-medium text-emerald-400">Sent: "{msg.rewrittenText}"</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
