'use client';

import { Sparkles, Brain, HeartPulse } from 'lucide-react';
import { GeminiStressEvaluation } from '@/services/geminiService';

export function GeminiAnalysisResult({ evaluation }: { evaluation: GeminiStressEvaluation }) {
  const getBadgeStyle = (classification: string) => {
    switch (classification) {
      case 'Calm':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
          text: 'text-emerald-400',
          badge: 'Calm Trajectory',
        };
      case 'Elevated':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/20',
          text: 'text-yellow-400',
          badge: 'Elevated Stress Alert',
        };
      case 'Crisis':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          text: 'text-red-400',
          badge: 'Crisis Intercept Triggered',
        };
      default:
        return {
          bg: 'bg-[#6366F1]/10',
          border: 'border-[#6366F1]/20',
          text: 'text-[#6366F1]',
          badge: 'Evaluated',
        };
    }
  };

  const style = getBadgeStyle(evaluation.classification);

  return (
    <div className="glass-panel p-6 rounded-3xl border border-[#27272A] space-y-5 w-full max-w-3xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1]">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-[#14B8A6]" /> Gemini AI Neural Classifier
            </div>
            <h3 className="text-lg font-extrabold text-white tracking-tight">AI Stress Assessment</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${style.bg} ${style.border} border ${style.text}`}>
            {style.badge}
          </span>
          <span className="text-[11px] font-mono text-zinc-400 bg-[#18181B] px-2.5 py-1 rounded-full border border-[#27272A]">
            Conf: {Math.round(evaluation.confidence * 100)}%
          </span>
        </div>
      </div>

      {/* Clinical Reason */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Diagnostic Rationale</span>
        <p className="text-xs text-zinc-200 bg-[#18181B] p-4 rounded-2xl border border-[#27272A] leading-relaxed">
          {evaluation.reason}
        </p>
      </div>

      {/* Personal Grounding Advice */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-[#14B8A6] uppercase tracking-wider flex items-center gap-1.5">
          <HeartPulse className="h-4 w-4" /> Personal Grounding Intervention
        </span>
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#14B8A6]/10 via-[#18181B] to-[#6366F1]/10 border border-[#14B8A6]/30 text-xs text-white leading-relaxed font-medium">
          &quot;{evaluation.groundingMessage}&quot;
        </div>
      </div>
    </div>
  );
}
