'use client';

import { Sidebar } from '@/components/Sidebar';
import { BookOpen, Clock } from 'lucide-react';

export default function LearningPage() {
  const lessons = [
    { title: 'The Acoustics of Urges: Recognizing Vocal Tension', duration: '4 min', status: 'Completed' },
    { title: 'De-escalating Craving Surges via Urge Surfing', duration: '6 min', status: 'In Progress' },
    { title: 'Building Bulletproof Social Boundaries', duration: '5 min', status: 'Upcoming' },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#09090B]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8">
        <div>
          <span className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider">Psychoeducation & Coping</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Learning Modules
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Bite-sized evidence-based lessons on stress management and recovery neuroscience.
          </p>
        </div>

        <div className="space-y-4 max-w-3xl">
          {lessons.map((item, i) => (
            <div key={i} className="glass-panel p-5 rounded-2xl border border-[#27272A] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.duration}</span>
                  </div>
                </div>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                item.status === 'Completed'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : item.status === 'In Progress'
                  ? 'bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20'
                  : 'bg-zinc-800 text-zinc-400'
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
