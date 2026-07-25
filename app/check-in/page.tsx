'use client';

import { Sidebar } from '@/components/Sidebar';
import { Mic, Activity, AlertCircle, Play, Pause, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function CheckInPage() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#09090B]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8">
        <div>
          <span className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider">Voice Acoustic Engine</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Proactive Voice Stress Check-In
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Speak naturally for 30 seconds. Undertow calculates speech rate, pause frequency, and acoustic stress indicators.
          </p>
        </div>

        {/* Voice recording shell */}
        <div className="glass-panel p-8 rounded-3xl border border-[#27272A] flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto">
          <div className="relative">
            <div className={`h-32 w-32 rounded-full border-2 flex items-center justify-center transition-all ${
              isRecording
                ? 'border-red-500 bg-red-500/10 shadow-2xl shadow-red-500/30 animate-pulse'
                : 'border-[#6366F1] bg-[#6366F1]/10 shadow-xl shadow-[#6366F1]/20'
            }`}>
              <Mic className={`h-12 w-12 ${isRecording ? 'text-red-400' : 'text-[#6366F1]'}`} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">
              {isRecording ? 'Listening & Analyzing Acoustic Waves...' : 'Tap to Start Speaking'}
            </h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm">
              "How was your day? Are you feeling any physical tension or craving triggers right now?"
            </p>
          </div>

          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`px-8 py-3.5 rounded-2xl text-sm font-semibold transition-all ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25'
                : 'bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white shadow-xl shadow-[#6366F1]/25 hover:opacity-95'
            }`}
          >
            {isRecording ? 'Stop Check-In' : 'Start Recording'}
          </button>

          <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 pt-2">
            <ShieldCheck className="h-3.5 w-3.5 text-[#14B8A6]" /> Browser-only Web Audio API processing. Zero audio stored.
          </div>
        </div>
      </main>
    </div>
  );
}

function ShieldCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}
