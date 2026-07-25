'use client';

import { ShieldCheck, HeartPulse } from 'lucide-react';

export interface AcousticMetrics {
  speechRate: number; // WPM
  volume: number; // 0 - 100 dB scale
  pauseCount: number; // count
  duration: number; // seconds
  stressState: 'Calm' | 'Mild' | 'High' | 'Acute';
  stressScore: number; // 0 - 100
}

export function StressMeter({ metrics }: { metrics: AcousticMetrics }) {
  const getStressColor = (state: string) => {
    switch (state) {
      case 'Calm':
        return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', bar: 'bg-emerald-500' };
      case 'Mild':
        return { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', bar: 'bg-yellow-500' };
      case 'High':
        return { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', bar: 'bg-orange-500' };
      case 'Acute':
        return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', bar: 'bg-red-500' };
      default:
        return { text: 'text-[#6366F1]', bg: 'bg-[#6366F1]/10', border: 'border-[#6366F1]/20', bar: 'bg-[#6366F1]' };
    }
  };

  const style = getStressColor(metrics.stressState);

  return (
    <div className="glass-panel p-6 rounded-3xl border border-[#27272A] space-y-6 w-full max-w-3xl mx-auto animate-fadeIn">
      {/* Header & Main Score Gauge */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#27272A] pb-5">
        <div className="flex items-center gap-3">
          <div className={`h-12 w-12 rounded-2xl ${style.bg} ${style.border} border flex items-center justify-center ${style.text}`}>
            <HeartPulse className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Vocal Stress Evaluation</div>
            <div className={`text-2xl font-extrabold ${style.text} flex items-center gap-2`}>
              {metrics.stressState} Stress State
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${style.bg} ${style.border} border`}>
                Score: {metrics.stressScore}/100
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400 bg-[#09090B] px-3.5 py-1.5 rounded-full border border-[#27272A]">
          <ShieldCheck className="h-4 w-4 text-[#14B8A6]" />
          <span>Real-time Audio Parsing</span>
        </div>
      </div>

      {/* Stress Bar Visual Gauge */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-zinc-400 font-medium">
          <span>Calm (0-25)</span>
          <span>Mild (26-50)</span>
          <span>High (51-75)</span>
          <span>Acute (76-100)</span>
        </div>
        <div className="h-3 w-full bg-[#18181B] rounded-full overflow-hidden border border-[#27272A] p-0.5 relative">
          <div
            className={`h-full ${style.bar} rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${Math.max(5, metrics.stressScore)}%` }}
          />
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Metric 1: Speech Rate */}
        <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-1">
          <div className="text-[11px] font-medium text-zinc-400">Speech Pace</div>
          <div className="text-xl font-bold text-white">{metrics.speechRate} <span className="text-xs text-zinc-500 font-normal">WPM</span></div>
          <div className="text-[10px] text-zinc-500">Baseline: 120-150</div>
        </div>

        {/* Metric 2: Volume */}
        <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-1">
          <div className="text-[11px] font-medium text-zinc-400">Avg Volume</div>
          <div className="text-xl font-bold text-white">{metrics.volume} <span className="text-xs text-zinc-500 font-normal">dB</span></div>
          <div className="text-[10px] text-zinc-500">Acoustic power</div>
        </div>

        {/* Metric 3: Pauses */}
        <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-1">
          <div className="text-[11px] font-medium text-zinc-400">Hesitations</div>
          <div className="text-xl font-bold text-white">{metrics.pauseCount} <span className="text-xs text-zinc-500 font-normal">pauses</span></div>
          <div className="text-[10px] text-zinc-500">Micro-stalls</div>
        </div>

        {/* Metric 4: Duration */}
        <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-1">
          <div className="text-[11px] font-medium text-zinc-400">Speaking Time</div>
          <div className="text-xl font-bold text-white">{metrics.duration} <span className="text-xs text-zinc-500 font-normal">sec</span></div>
          <div className="text-[10px] text-zinc-500">Total sample</div>
        </div>
      </div>
    </div>
  );
}
