'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Mic,
  MessageSquare,
  Users,
  BookOpen,
  Settings,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Voice Check-In', href: '/check-in', icon: Mic, badge: 'AI Live' },
    { name: 'Roleplay Simulator', href: '/roleplay', icon: MessageSquare },
    { name: 'Caregiver Hub', href: '/caregiver', icon: Users },
    { name: 'Learning Modules', href: '/learning', icon: BookOpen },
    { name: 'Settings & Memory', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-[#27272A] bg-[#09090B] flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-6">
        {/* Quick Grounding Trigger */}
        <div className="rounded-2xl bg-gradient-to-b from-[#18181B] to-[#09090B] p-4 border border-[#27272A] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="h-16 w-16 text-[#14B8A6]" />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#14B8A6] uppercase tracking-wider mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#14B8A6] animate-ping" />
            Quick Reset
          </div>
          <p className="text-xs text-zinc-300 mb-3">Feeling overwhelmed right now?</p>
          <Link
            href="/check-in"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#14B8A6]/20 border border-[#14B8A6]/40 py-2 text-xs font-medium text-[#14B8A6] hover:bg-[#14B8A6]/30 transition-all"
          >
            <Mic className="h-3.5 w-3.5" /> Start Instant Check-In
          </Link>
        </div>

        {/* Nav list */}
        <nav className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Main Menu
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/20 font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-[#18181B]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#14B8A6]/20 text-[#14B8A6] border border-[#14B8A6]/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User privacy status footer */}
      <div className="border-t border-[#27272A] pt-4 mt-auto">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#18181B]/50 border border-[#27272A]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-zinc-200">Zero-Knowledge AI</span>
            <span className="text-[10px] text-zinc-500">Audio raw data unstored</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
