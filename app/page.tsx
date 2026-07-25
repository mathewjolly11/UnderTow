import Link from 'next/link';
import {
  Mic,
  Shield,
  Sparkles,
  Activity,
  ArrowRight,
  Brain,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { Footer } from '@/components/Footer';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-28">
        {/* Glow background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#6366F1]/20 to-[#14B8A6]/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#6366F1]/30 bg-[#6366F1]/10 px-4 py-1.5 text-xs font-semibold text-[#6366F1] mb-8 shadow-inner">
            <Sparkles className="h-3.5 w-3.5 text-[#14B8A6]" />
            <span>Introducing Undertow AI Recovery Companion</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            It catches you <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#6366F1] via-[#818CF8] to-[#14B8A6] bg-clip-text text-transparent">
              before the pull does.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Proactive stress detection through ambient voice conversations, AI roleplay simulator for high-stakes triggers, and zero-knowledge caregiver peace of mind.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#4F46E5] px-8 py-4 text-base font-semibold text-white shadow-xl shadow-[#6366F1]/30 hover:opacity-95 hover:scale-[1.02] transition-all"
            >
              Open Recovery Dashboard <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/check-in"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#18181B] border border-[#27272A] px-8 py-4 text-base font-semibold text-zinc-200 hover:bg-[#27272A] hover:text-white transition-all"
            >
              <Mic className="h-5 w-5 text-[#14B8A6]" /> Try Voice Check-In Demo
            </Link>
          </div>

          {/* Core Highlights */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            {[
              { label: 'Voice Stress Rate', val: 'Real-time Audio Parsing', icon: Activity },
              { label: 'Privacy Standard', val: 'Zero Audio Storage', icon: Shield },
              { label: 'AI Simulations', val: 'Adaptive Roleplay', icon: Brain },
              { label: 'Caregiver Safeguard', val: 'Privacy-Safe Reports', icon: Users },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="p-4 rounded-2xl bg-[#18181B]/50 border border-[#27272A]">
                  <Icon className="h-5 w-5 text-[#6366F1] mb-2" />
                  <div className="text-xs text-zinc-400 font-medium">{stat.label}</div>
                  <div className="text-sm font-bold text-white mt-0.5">{stat.val}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Feature Cards */}
      <section className="py-16 bg-[#09090B] border-t border-[#27272A]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Engineered for Modern Recovery
            </h2>
            <p className="mt-4 text-base text-zinc-400">
              Combining vocal acoustics, cognitive behavioral framing, and privacy by design.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="glass-panel p-8 rounded-3xl space-y-4 relative overflow-hidden group">
              <div className="h-12 w-12 rounded-2xl bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center text-[#6366F1]">
                <Mic className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Vocal Stress Analyzer</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Calculates speech rate, volume spikes, micro-pauses, and vocal jitter in real-time to intercept stress early.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#6366F1] flex items-center gap-1">
                Explore Voice Engine <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="glass-panel p-8 rounded-3xl space-y-4 relative overflow-hidden group">
              <div className="h-12 w-12 rounded-2xl bg-[#14B8A6]/10 border border-[#14B8A6]/20 flex items-center justify-center text-[#14B8A6]">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">AI Scenario Roleplay</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Practice high-trigger scenarios (party offers, work stress, late-night urges) with a reactive AI partner before they happen in real life.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#14B8A6] flex items-center gap-1">
                Start Practice <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="glass-panel p-8 rounded-3xl space-y-4 relative overflow-hidden group">
              <div className="h-12 w-12 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center text-red-400">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Caregiver Shield</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Generates high-level recovery health summaries for your loved ones without revealing intimate audio logs or private journal details.
              </p>
              <div className="pt-2 text-xs font-semibold text-red-400 flex items-center gap-1">
                View Privacy Protocol <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Commitment Banner */}
      <section className="py-12 bg-gradient-to-r from-[#18181B] via-[#09090B] to-[#18181B] border-y border-[#27272A]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Built for Complete Privacy & Trust</h4>
              <p className="text-xs text-zinc-400">Your voice is processed entirely in ephemeral browser memory. Raw audio is never saved.</p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl bg-[#27272A] hover:bg-zinc-700 text-xs font-semibold text-white transition-all shrink-0"
          >
            Launch MVP Dashboard
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
