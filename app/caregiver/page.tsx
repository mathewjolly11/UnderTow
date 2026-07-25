'use client';

import { Sidebar } from '@/components/Sidebar';
import { Users, Shield, Lock, FileText, Send } from 'lucide-react';
import { MOCK_MEMORY } from '@/lib/mockData';

export default function CaregiverPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#09090B]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8">
        <div>
          <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Privacy-Safe Caregiver Network</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Caregiver Support Hub
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Share progress summaries with loved ones while preserving your exact private voice transcripts and personal memory vault.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Linked Caregivers */}
          <div className="glass-panel p-6 rounded-3xl border border-[#27272A] space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-[#6366F1]" /> Connected Caregiver
            </h3>
            {MOCK_MEMORY.safe_people.map((person, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">{person.name}</div>
                  <div className="text-xs text-zinc-400">{person.relationship} • {person.phone}</div>
                </div>
                <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  Verified Contact
                </span>
              </div>
            ))}
          </div>

          {/* Report Preview */}
          <div className="glass-panel p-6 rounded-3xl border border-[#27272A] space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#14B8A6]" /> Weekly AI Caregiver Brief
            </h3>
            <p className="text-xs text-zinc-300 bg-[#09090B] p-4 rounded-2xl border border-[#27272A] leading-relaxed">
              "Alex completed 5 voice check-ins this week with consistent calm vocal acoustics. 1 high-stress moment resolved using 4-7-8 breathing. Overall recovery trajectory is steady."
            </p>
            <button className="w-full py-2.5 rounded-xl bg-[#27272A] hover:bg-zinc-700 text-xs font-semibold text-white flex items-center justify-center gap-2">
              <Send className="h-3.5 w-3.5" /> Send Updated Briefing
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
