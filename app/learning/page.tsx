'use client';

import { Sidebar } from '@/components/Sidebar';
import { BookOpen, Clock, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClientBrowser } from '@/lib/supabase/client';
import ReactMarkdown from 'react-markdown';

interface LearningModule {
  id: string;
  title: string;
  duration_minutes: number;
  content_markdown: string;
  category: string;
}

export default function LearningPage() {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const supabase = createClientBrowser();

  useEffect(() => {
    async function fetchModules() {
      const { data } = await supabase.from('learning_modules').select('*').order('created_at', { ascending: true });
      if (data) setModules(data);
      setLoading(false);
    }
    fetchModules();
  }, [supabase]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#09090B]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8">
        <div>
          {selectedModule ? (
            <button
              type="button"
              onClick={() => setSelectedModule(null)}
              className="mb-4 px-4 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Modules
            </button>
          ) : (
            <>
              <span className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider">Psychoeducation & Coping</span>
              <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
                Learning Modules
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Bite-sized evidence-based lessons on stress management and recovery neuroscience.
              </p>
            </>
          )}
        </div>

        {selectedModule ? (
          <div className="max-w-3xl glass-panel p-8 rounded-3xl border border-[#27272A] space-y-6">
            <div>
              <span className="text-xs font-bold text-[#6366F1] uppercase tracking-wider">{selectedModule.category}</span>
              <h2 className="text-2xl font-black text-white mt-2">{selectedModule.title}</h2>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mt-2">
                <Clock className="h-4 w-4" /> {selectedModule.duration_minutes} min read
              </div>
            </div>
            
            <div className="prose prose-invert prose-emerald max-w-none text-sm text-zinc-300">
              <ReactMarkdown>{selectedModule.content_markdown}</ReactMarkdown>
            </div>

            <div className="pt-6 border-t border-[#27272A]">
              <button
                type="button"
                onClick={() => setSelectedModule(null)}
                className="px-6 py-2.5 rounded-xl bg-[#14B8A6] hover:bg-emerald-500 text-xs font-bold text-black shadow-lg shadow-[#14B8A6]/20 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" /> Mark Complete & Return
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl">
            {loading ? (
              <div className="text-sm text-zinc-500">Loading modules...</div>
            ) : modules.length === 0 ? (
              <div className="text-sm text-zinc-500">No learning modules available yet.</div>
            ) : (
              modules.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setSelectedModule(item)}
                  className="w-full text-left glass-panel p-5 rounded-2xl border border-[#27272A] flex items-center justify-between hover:bg-[#18181B] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.duration_minutes} min</span>
                        <span className="flex items-center gap-1 text-[#6366F1]">{item.category}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                    Start
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
