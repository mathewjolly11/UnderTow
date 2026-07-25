'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { User, Heart } from 'lucide-react';
import { MOCK_PROFILE, MOCK_MEMORY } from '@/lib/mockData';
import { UserMemory } from '@/types/database';

export default function SettingsPage() {
  const { profile, user } = useAuth();
  const [memory, setMemory] = useState<UserMemory | null>(null);

  useEffect(() => {
    async function loadMemory() {
      if (!user?.id) return;
      const { data } = await supabase.from('user_memory').select('*').eq('user_id', user.id).single();
      if (data) {
        setMemory(data);
      }
    }
    loadMemory();
  }, [user]);

  const displayName = profile?.name || user?.email?.split('@')[0] || MOCK_PROFILE.name;
  const displayEmail = profile?.email || user?.email || MOCK_PROFILE.email;
  
  const triggers = memory?.trigger || MOCK_MEMORY.trigger;
  const reasonsToRecover = memory?.reasons_to_recover || MOCK_MEMORY.reasons_to_recover;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#09090B]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8 max-w-4xl">
        <div>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Account & Safety Vault</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Settings & Memory Vault
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your profile, personal recovery anchors, triggers, and Supabase integration preferences.
          </p>
        </div>

        {/* Profile Card */}
        <div className="glass-panel p-6 rounded-3xl border border-[#27272A] space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="h-5 w-5 text-[#6366F1]" /> User Profile
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-zinc-400 font-medium">Name</label>
              <input
                readOnly
                value={displayName}
                className="w-full mt-1 p-3 rounded-xl bg-[#18181B] border border-[#27272A] text-white"
              />
            </div>
            <div>
              <label className="text-zinc-400 font-medium">Email</label>
              <input
                readOnly
                value={displayEmail}
                className="w-full mt-1 p-3 rounded-xl bg-[#18181B] border border-[#27272A] text-white"
              />
            </div>
          </div>
        </div>

        {/* Memory Vault */}
        <div className="glass-panel p-6 rounded-3xl border border-[#27272A] space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-400" /> Grounding Memory Vault
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-zinc-400 font-medium">Registered Triggers</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {triggers.map((t, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-[#18181B] border border-[#27272A] text-zinc-300">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-2">
              <label className="text-zinc-400 font-medium">Reasons to Recover</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {reasonsToRecover.map((r, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-[#14B8A6]/10 border border-[#14B8A6]/20 text-[#14B8A6]">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
