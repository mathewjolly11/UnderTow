'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, UserCheck, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Voice Check-In', href: '/check-in' },
    { name: 'AI Roleplay', href: '/roleplay' },
    { name: 'Caregiver Hub', href: '/caregiver' },
    { name: 'Learning', href: '/learning' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#27272A] bg-[#09090B]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366F1] to-[#14B8A6] p-0.5 shadow-lg shadow-[#6366F1]/20 transition-transform group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#09090B]">
              <Activity className="h-5 w-5 text-[#6366F1]" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white">Undertow</span>
            <span className="text-[10px] font-medium text-[#14B8A6] -mt-1 hidden sm:inline">AI Recovery Safety Net</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#18181B]/60 p-1.5 rounded-full border border-[#27272A]">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all ${
                  isActive
                    ? 'bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400 bg-[#18181B] px-3 py-1.5 rounded-full border border-[#27272A]">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Privacy Guard Active</span>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#18181B] border border-[#27272A]">
                <UserCheck className="h-4 w-4 text-[#14B8A6]" />
                <span className="text-xs font-semibold text-white">{profile?.name || user.email?.split('@')[0]}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="px-3 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium transition-all"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-full bg-[#18181B] border border-[#27272A] text-xs font-medium text-zinc-300 hover:text-white transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6366F1] to-[#4F46E5] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-[#6366F1]/25 hover:opacity-95 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#27272A] bg-[#09090B] px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
                pathname === link.href
                  ? 'bg-[#6366F1] text-white'
                  : 'text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-[#27272A] flex flex-col gap-2">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-[#6366F1] text-sm font-medium text-white shadow-lg"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
