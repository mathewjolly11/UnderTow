'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  PhoneCall,
  MessageSquare,
  X,
  Wind,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { UserMemory } from '@/types/database';

export function CrisisOverlay({ userMemory, onClose }: { userMemory?: UserMemory | null; onClose: () => void }) {
  // Breathing Timer State (4 seconds inhale, 7 seconds hold, 8 seconds exhale)
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathCount, setBreathCount] = useState(4);

  const safeContact = userMemory?.safe_people?.[0] || {
    name: 'Sarah Rivera',
    relationship: 'Sister / Safe Person',
    phone: '+1 (555) 234-5678',
  };

  const emergencyScript =
    userMemory?.emergency_script ||
    'I am safe. This surge in acute stress is temporary and will pass. I can step into a quiet space and ground myself.';

  const groundingMethod = userMemory?.grounding_methods?.[0] || '5-4-3-2-1 Sensory Focus Scan';

  const modalRef = useRef<HTMLDivElement>(null);

  // Focus Trap and Escape Key Handler
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (!modalRef.current) return;
        const focusableElements = modalRef.current.querySelectorAll(
          'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    if (modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll('button, a[href]');
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocus) {
        previousFocus.focus();
      }
    };
  }, [onClose]);

  // 4-7-8 Breathing Loop Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathCount((prev) => {
        if (prev > 1) return prev - 1;

        // Phase transition
        if (breathPhase === 'Inhale') {
          setBreathPhase('Hold');
          return 7;
        } else if (breathPhase === 'Hold') {
          setBreathPhase('Exhale');
          return 8;
        } else {
          setBreathPhase('Inhale');
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [breathPhase]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crisis-overlay-title"
      ref={modalRef}
    >
      <div className="w-full max-w-2xl bg-[#09090B] border-2 border-red-500/50 rounded-3xl p-6 sm:p-8 space-y-6 text-left relative shadow-[0_0_80px_rgba(239,68,68,0.35)] my-auto">
        {/* Top Header & Dismiss Button */}
        <div className="flex items-center justify-between border-b border-red-500/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <ShieldAlert className="h-7 w-7 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-red-400">
                Acute Crisis Intercept Triggered
              </span>
              <h2 id="crisis-overlay-title" className="text-xl sm:text-2xl font-black text-white">Emergency Safety Grounding</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-[#18181B] hover:bg-zinc-800 text-zinc-400 hover:text-white border border-[#27272A] transition-all"
            aria-label="Close Overlay"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 1. Interactive 4-7-8 Breathing Circle Timer */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-[#18181B] to-[#09090B] border border-red-500/20 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#14B8A6] uppercase tracking-wider">
            <Wind className="h-4 w-4" /> 4-7-8 Grounding Breathing Timer
          </div>

          <div className="relative flex items-center justify-center py-2">
            <div
              className={`h-28 w-28 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-1000 ${
                breathPhase === 'Inhale'
                  ? 'border-[#14B8A6] bg-[#14B8A6]/10 scale-110'
                  : breathPhase === 'Hold'
                  ? 'border-yellow-500 bg-yellow-500/10 scale-105'
                  : 'border-[#6366F1] bg-[#6366F1]/10 scale-95'
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">{breathPhase}</span>
              <span className="text-3xl font-extrabold text-white mt-0.5">{breathCount}s</span>
            </div>
          </div>

          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Focus gently on the circle expanding and contracting. Inhale for 4s, hold for 7s, exhale for 8s.
          </p>
        </div>

        {/* 2. Emergency Grounding Script & Method */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Personal Anchor Script</span>
          <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-2">
            <p className="text-xs text-zinc-200 leading-relaxed italic font-serif">&quot;{emergencyScript}&quot;</p>
            <div className="text-[11px] text-[#14B8A6] font-semibold flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Recommended technique: {groundingMethod}
            </div>
          </div>
        </div>

        {/* 3. Caregiver Call & SMS Quick Actions */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Contact Emergency Caregiver</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={`tel:${safeContact.phone}`}
              className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/30 transition-all"
            >
              <PhoneCall className="h-4 w-4 fill-white" /> Call {safeContact.name} ({safeContact.phone})
            </a>
            <a
              href={`sms:${safeContact.phone}?body=${encodeURIComponent(
                'Undertow Emergency Alert: I am experiencing acute stress right now and requested support. Please reach out when you see this.'
              )}`}
              className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-[#6366F1] hover:bg-indigo-500 text-xs font-extrabold text-white shadow-lg shadow-[#6366F1]/30 transition-all"
            >
              <MessageSquare className="h-4 w-4" /> Send Help SMS to {safeContact.name}
            </a>
          </div>
        </div>

        {/* 4. Official Emergency Disclaimer */}
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 space-y-1">
          <div className="flex items-center gap-2 font-bold text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" /> Immediate Medical & Crisis Support
          </div>
          <p className="text-[11px] leading-relaxed text-zinc-400">
            Undertow is an AI support companion, not a medical provider. If you or someone you know is in immediate danger or feeling suicidal, please call or text <strong>988</strong> (Suicide & Crisis Lifeline) or contact emergency services immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
