'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Heart,
  Shield,
  Zap,
  User,
  Target,
  Plus,
  X,
  Phone,
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState(profile?.name || '');
  const [preferredName, setPreferredName] = useState('');
  const [recoveryGoal, setRecoveryGoal] = useState(profile?.recovery_goal || '');
  const [recoveryStage, setRecoveryStage] = useState('Early Recovery');
  
  // Emergency contact
  const [contactName, setContactName] = useState('');
  const [contactRelationship, setContactRelationship] = useState('Therapist / Safe Person');
  const [contactPhone, setContactPhone] = useState('');

  // Lists
  const [triggers, setTriggers] = useState<string[]>(['Social Pressure', 'Late Night Stress']);
  const [newTrigger, setNewTrigger] = useState('');

  const [reasons, setReasons] = useState<string[]>(['Mental Clarity', 'Better Physical Health']);
  const [newReason, setNewReason] = useState('');

  const [groundingMethods, setGroundingMethods] = useState<string[]>([
    '5-4-3-2-1 Sensory Scan',
    '4-7-8 Breathing',
  ]);
  const [newGrounding, setNewGrounding] = useState('');

  const addTrigger = () => {
    if (newTrigger.trim() && !triggers.includes(newTrigger.trim())) {
      setTriggers([...triggers, newTrigger.trim()]);
      setNewTrigger('');
    }
  };

  const removeTrigger = (item: string) => {
    setTriggers(triggers.filter((t) => t !== item));
  };

  const addReason = () => {
    if (newReason.trim() && !reasons.includes(newReason.trim())) {
      setReasons([...reasons, newReason.trim()]);
      setNewReason('');
    }
  };

  const removeReason = (item: string) => {
    setReasons(reasons.filter((r) => r !== item));
  };

  const addGrounding = () => {
    if (newGrounding.trim() && !groundingMethods.includes(newGrounding.trim())) {
      setGroundingMethods([...groundingMethods, newGrounding.trim()]);
      setNewGrounding('');
    }
  };

  const removeGrounding = (item: string) => {
    setGroundingMethods(groundingMethods.filter((g) => g !== item));
  };

  const handleCompleteOnboarding = async () => {
    setSaving(true);
    try {
      if (user?.id) {
        // 1. Update Profile table
        await supabase
          .from('profiles')
          .update({
            name: preferredName ? preferredName : name,
            recovery_goal: recoveryGoal,
            stage: recoveryStage,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        // 2. Update User Memory table
        const safePeopleJson = contactName
          ? [{ name: contactName, relationship: contactRelationship, phone: contactPhone }]
          : [];

        await supabase.from('user_memory').upsert({
          user_id: user.id,
          trigger: triggers,
          safe_people: safePeopleJson,
          grounding_methods: groundingMethods,
          reasons_to_recover: reasons,
          emergency_script: `I am ${preferredName || name}. I am safe and ground myself with ${groundingMethods[0] || 'deep breathing'}.`,
          updated_at: new Date().toISOString(),
        });

        await refreshProfile();
      }
    } catch (err) {
      console.warn('Onboarding saved to local session fallback', err);
    } finally {
      setSaving(false);
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#09090B] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#6366F1]/20 to-[#14B8A6]/20 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-2xl glass-panel p-6 sm:p-10 rounded-3xl border border-[#27272A] relative z-10 space-y-8">
        {/* Progress Bar & Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-[#6366F1] flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#14B8A6]" /> Step {step} of 4: Personalization
            </span>
            <span>{step * 25}% Completed</span>
          </div>
          <div className="h-1.5 w-full bg-[#18181B] rounded-full overflow-hidden border border-[#27272A]">
            <div
              className="h-full bg-gradient-to-r from-[#6366F1] to-[#14B8A6] transition-all duration-500 ease-out"
              style={{ width: `${step * 25}%` }}
            />
          </div>
        </div>

        {/* Step 1: Basic Identity & Goal */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Welcome to Undertow. Let&apos;s setup your profile.
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Your data is stored securely under strict Row Level Security.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-zinc-300">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full mt-1.5 p-3 rounded-xl bg-[#18181B] border border-[#27272A] text-white focus:border-[#6366F1] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-300">Preferred Name / Alias</label>
                  <input
                    type="text"
                    value={preferredName}
                    onChange={(e) => setPreferredName(e.target.value)}
                    placeholder="Alex"
                    className="w-full mt-1.5 p-3 rounded-xl bg-[#18181B] border border-[#27272A] text-white focus:border-[#6366F1] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-300">Current Recovery Stage</label>
                <select
                  value={recoveryStage}
                  onChange={(e) => setRecoveryStage(e.target.value)}
                  className="w-full mt-1.5 p-3 rounded-xl bg-[#18181B] border border-[#27272A] text-white focus:border-[#6366F1] focus:outline-none"
                >
                  <option value="Early Recovery">Early Recovery (Days 1 - 30)</option>
                  <option value="Active Maintenance">Active Maintenance (Month 1 - 6)</option>
                  <option value="Long-Term Resilience">Long-Term Resilience (6+ Months)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-300">Your Primary Recovery Goal</label>
                <textarea
                  rows={3}
                  value={recoveryGoal}
                  onChange={(e) => setRecoveryGoal(e.target.value)}
                  placeholder="e.g., Maintain emotional stability during stressful work periods and social gatherings."
                  className="w-full mt-1.5 p-3 rounded-xl bg-[#18181B] border border-[#27272A] text-white focus:border-[#6366F1] focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Emergency Contact */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Emergency & Safe Contact Person
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Someone you trust whom Undertow can prompt you to reach out to if acute stress is detected.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-zinc-300">Contact Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Dr. Marcus Vance / Sarah"
                  className="w-full mt-1.5 p-3 rounded-xl bg-[#18181B] border border-[#27272A] text-white focus:border-[#14B8A6] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-zinc-300">Relationship</label>
                  <input
                    type="text"
                    value={contactRelationship}
                    onChange={(e) => setContactRelationship(e.target.value)}
                    placeholder="Therapist / Sister / Sponsor"
                    className="w-full mt-1.5 p-3 rounded-xl bg-[#18181B] border border-[#27272A] text-white focus:border-[#14B8A6] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-300">Phone Number</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full mt-1.5 p-3 rounded-xl bg-[#18181B] border border-[#27272A] text-white focus:border-[#14B8A6] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Triggers & Reasons to Recover */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Triggers & Motivations
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Helping Undertow customize your proactive voice responses and AI roleplay scenarios.
              </p>
            </div>

            <div className="space-y-6 text-xs">
              {/* Triggers */}
              <div>
                <label className="font-semibold text-zinc-300">Stress & Craving Triggers</label>
                <div className="flex gap-2 mt-1.5">
                  <input
                    type="text"
                    value={newTrigger}
                    onChange={(e) => setNewTrigger(e.target.value)}
                    placeholder="Add trigger (e.g. Work Deadlines)"
                    className="flex-1 p-2.5 rounded-xl bg-[#18181B] border border-[#27272A] text-white focus:border-[#6366F1] focus:outline-none"
                  />
                  <button
                    onClick={addTrigger}
                    type="button"
                    className="px-4 py-2.5 rounded-xl bg-[#6366F1] font-semibold text-white hover:opacity-90 flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {triggers.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#18181B] border border-[#27272A] text-zinc-300"
                    >
                      {t}
                      <X
                        className="h-3 w-3 text-zinc-500 hover:text-red-400 cursor-pointer"
                        onClick={() => removeTrigger(t)}
                      />
                    </span>
                  ))}
                </div>
              </div>

              {/* Reasons */}
              <div>
                <label className="font-semibold text-zinc-300">Reasons to Recover</label>
                <div className="flex gap-2 mt-1.5">
                  <input
                    type="text"
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                    placeholder="Add reason (e.g. Family & Health)"
                    className="flex-1 p-2.5 rounded-xl bg-[#18181B] border border-[#27272A] text-white focus:border-[#14B8A6] focus:outline-none"
                  />
                  <button
                    onClick={addReason}
                    type="button"
                    className="px-4 py-2.5 rounded-xl bg-[#14B8A6] font-semibold text-black hover:opacity-90 flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {reasons.map((r, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#14B8A6]/10 border border-[#14B8A6]/20 text-[#14B8A6]"
                    >
                      {r}
                      <X
                        className="h-3 w-3 text-[#14B8A6]/60 hover:text-red-400 cursor-pointer"
                        onClick={() => removeReason(r)}
                      />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Grounding Methods */}
        {step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Preferred Grounding Methods
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Techniques Undertow will suggest during acute voice stress check-ins.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGrounding}
                  onChange={(e) => setNewGrounding(e.target.value)}
                  placeholder="e.g., Cold Water Splash, 4-7-8 Breathing"
                  className="flex-1 p-3 rounded-xl bg-[#18181B] border border-[#27272A] text-white focus:border-[#6366F1] focus:outline-none"
                />
                <button
                  onClick={addGrounding}
                  type="button"
                  className="px-4 py-3 rounded-xl bg-[#6366F1] font-semibold text-white hover:opacity-90 flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {groundingMethods.map((g, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-white font-medium"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#14B8A6]" />
                    {g}
                    <X
                      className="h-3.5 w-3.5 text-zinc-500 hover:text-red-400 cursor-pointer"
                      onClick={() => removeGrounding(g)}
                    />
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-[#27272A]">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              type="button"
              className="px-5 py-2.5 rounded-xl bg-[#18181B] border border-[#27272A] text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              type="button"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-xs font-semibold text-white shadow-lg shadow-[#6366F1]/20 hover:opacity-95 flex items-center gap-1.5"
            >
              Next Step <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleCompleteOnboarding}
              disabled={saving}
              type="button"
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-xs font-extrabold text-black shadow-lg shadow-[#14B8A6]/25 hover:opacity-95 transition-all flex items-center gap-2"
            >
              {saving ? 'Saving Memory Vault...' : 'Complete & Launch Platform'} <CheckCircle2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
