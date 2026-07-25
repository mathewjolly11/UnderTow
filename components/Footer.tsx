import Link from 'next/link';
import { Activity, Shield, Heart, Lock, Globe } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[#27272A] bg-[#09090B] py-12 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6366F1] text-white">
                <Activity className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Undertow</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              It catches you before the pull does. Proactive voice stress detection, personalized AI grounding, and caregiver support.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Features</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/check-in" className="hover:text-white transition-colors">Voice Stress Check-In</Link></li>
              <li><Link href="/roleplay" className="hover:text-white transition-colors">AI Roleplay Simulator</Link></li>
              <li><Link href="/caregiver" className="hover:text-white transition-colors">Caregiver Privacy Hub</Link></li>
              <li><Link href="/learning" className="hover:text-white transition-colors">Coping Micro-Lessons</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Privacy & Safety</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-zinc-400">
                <Lock className="h-3 w-3 text-[#14B8A6]" /> Local Audio Processing
              </li>
              <li className="flex items-center gap-1.5 text-zinc-400">
                <Shield className="h-3 w-3 text-[#14B8A6]" /> Row Level Security
              </li>
              <li className="flex items-center gap-1.5 text-zinc-400">
                <Heart className="h-3 w-3 text-red-400" /> Crisis Line 988 Ready
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Hackathon Info</h4>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              Built for Next.js 15 & Gemini AI Hackathon.
            </p>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#18181B] border border-[#27272A] text-zinc-300">
                v1.0 MVP
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#27272A] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} Undertow Recovery Platform. Built with care.</p>
          <div className="flex gap-6">
            <span className="hover:text-zinc-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-zinc-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-zinc-300 cursor-pointer">Emergency Resources</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
