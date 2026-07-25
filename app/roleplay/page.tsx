'use client';

import { Sidebar } from '@/components/Sidebar';
import { Brain, MessageSquare, Play, Sparkles } from 'lucide-react';
import { MOCK_ROLEPLAY_SESSIONS } from '@/lib/mockData';

export default function RoleplayPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#09090B]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8">
        <div>
          <span className="text-xs font-semibold text-[#14B8A6] uppercase tracking-wider">Cognitive Simulation</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            AI Roleplay Simulator
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Practice handling peer pressure, refusal strategies, and craving surges in safe simulated conversations.
          </p>
        </div>

        {/* Scenario Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Social Pressure at Work Event',
              desc: 'Coworker insistently offers drinks after a major win.',
              intensity: 'Medium',
              tags: ['Refusal Skills', 'Boundary Setting'],
            },
            {
              title: 'Late Night Craving Surge',
              desc: 'High stress alone at home after an exhausting day.',
              intensity: 'High',
              tags: ['Urge Surfing', 'Distraction'],
            },
            {
              title: 'Family Gathering Conflict',
              desc: 'Navigating past family triggers without relapsing.',
              intensity: 'Medium',
              tags: ['Emotional Regulation', 'Grounding'],
            },
          ].map((sc, i) => (
            <div key={i} className="glass-panel p-6 rounded-3xl border border-[#27272A] flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-xs font-bold text-[#14B8A6] bg-[#14B8A6]/10 px-2.5 py-0.5 rounded-full border border-[#14B8A6]/20">
                    Intensity: {sc.intensity}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{sc.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{sc.desc}</p>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {sc.tags.map((t, ti) => (
                    <span key={ti} className="text-[10px] px-2 py-0.5 rounded-md bg-[#18181B] border border-[#27272A] text-zinc-300">
                      {t}
                    </span>
                  ))}
                </div>
                <button className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#14B8A6] text-xs font-semibold text-black hover:opacity-90 transition-all">
                  <Play className="h-3.5 w-3.5 fill-black" /> Start Scenario
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
