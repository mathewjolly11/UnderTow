import { Profile, VoiceSession, RoleplaySession, UserMemory } from '@/types/database';

export const MOCK_PROFILE: Profile = {
  id: 'usr_mock_123',
  name: 'Alex Rivera',
  email: 'alex.rivera@example.com',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  recovery_goal: 'Maintain daily mindfulness and handle social triggers with confidence.',
  stage: 'Maintenance (Day 42)',
  created_at: new Date(Date.now() - 42 * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
};

export const MOCK_MEMORY: UserMemory = {
  id: 'mem_1',
  user_id: 'usr_mock_123',
  trigger: ['Crowded social gatherings', 'Work deadline pressure', 'Late night isolation'],
  safe_people: [
    { name: 'Sarah Rivera', relationship: 'Sister', phone: '+1 (555) 234-5678' },
    { name: 'Dr. Marcus Vance', relationship: 'Therapist', phone: '+1 (555) 876-5432' },
  ],
  grounding_methods: ['5-4-3-2-1 Sensory Scan', '4-7-8 Deep Breathing', 'Cold Water Splash'],
  emergency_script: 'I am safe. This surge in stress is temporary. I can pause and step into a quiet space for 5 minutes.',
  reasons_to_recover: ['My physical health and clarity', 'Building deeper relationships', 'Achieving my creative goals'],
  updated_at: new Date().toISOString(),
};

export const MOCK_VOICE_SESSIONS: VoiceSession[] = [
  {
    id: 'vs_1',
    user_id: 'usr_mock_123',
    transcript: "I've been feeling slightly overwhelmed by the upcoming work presentation, but I tried taking a walk outside earlier today.",
    speech_rate: 142,
    average_volume: 68,
    pause_count: 4,
    stress_state: 'Mild',
    confidence: 0.89,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'vs_2',
    user_id: 'usr_mock_123',
    transcript: "Feeling calm and clear today. Morning meditation helped a lot.",
    speech_rate: 120,
    average_volume: 62,
    pause_count: 2,
    stress_state: 'Calm',
    confidence: 0.95,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'vs_3',
    user_id: 'usr_mock_123',
    transcript: "There was a loud disagreement at dinner. My heart started pounding fast.",
    speech_rate: 175,
    average_volume: 82,
    pause_count: 9,
    stress_state: 'High',
    confidence: 0.91,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export const MOCK_ROLEPLAY_SESSIONS: RoleplaySession[] = [
  {
    id: 'rp_1',
    user_id: 'usr_mock_123',
    scenario: 'Politely declining alcohol at a high-pressure corporate mixer',
    intensity: 'Medium',
    score: 92,
    summary: 'Successfully asserted personal boundary using clear direct statements without apologizing for staying sober.',
    created_at: new Date(Date.now() - 86400000 * 1.5).toISOString(),
  },
  {
    id: 'rp_2',
    user_id: 'usr_mock_123',
    scenario: 'Handling unexpected craving during a stressful evening alone',
    intensity: 'High',
    score: 85,
    summary: 'Applied the 15-minute urge surfing technique and called a safe contact.',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

export const MOCK_STRESS_TRENDS = [
  { day: 'Mon', stressScore: 25, label: 'Calm' },
  { day: 'Tue', stressScore: 40, label: 'Mild' },
  { day: 'Wed', stressScore: 78, label: 'High' },
  { day: 'Thu', stressScore: 35, label: 'Mild' },
  { day: 'Fri', stressScore: 20, label: 'Calm' },
  { day: 'Sat', stressScore: 55, label: 'Mild' },
  { day: 'Sun', stressScore: 22, label: 'Calm' },
];
