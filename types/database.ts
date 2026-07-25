export type StressState = 'Calm' | 'Mild' | 'High' | 'Acute';

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  recovery_goal?: string;
  stage?: string;
  created_at: string;
  updated_at: string;
}

export interface UserMemory {
  id: string;
  user_id: string;
  trigger: string[];
  safe_people: { name: string; relationship: string; phone: string }[];
  grounding_methods: string[];
  emergency_script: string;
  reasons_to_recover: string[];
  updated_at: string;
}

export interface VoiceSession {
  id: string;
  user_id: string;
  transcript: string;
  speech_rate: number;
  average_volume: number;
  pause_count: number;
  stress_state: StressState;
  confidence: number;
  created_at: string;
}

export interface RoleplaySession {
  id: string;
  user_id: string;
  scenario: string;
  intensity: 'Low' | 'Medium' | 'High';
  score: number;
  summary: string;
  created_at: string;
}

export interface CaregiverProfile {
  id: string;
  user_id: string;
  caregiver_name: string;
  relationship: string;
  phone: string;
  email: string;
}

export interface LearningHistory {
  id: string;
  user_id: string;
  lesson: string;
  completed: boolean;
  created_at: string;
}
