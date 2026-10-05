import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export type UserRole = 'framer' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface JobSite {
  id: string;
  site_name: string;
  location: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SafetySubmission {
  id: string;
  user_id: string;
  job_site_id: string;
  submission_date: string;
  ppe_worn: boolean;
  hard_hat: boolean;
  safety_vest: boolean;
  steel_toe_boots: boolean;
  eye_protection: boolean;
  fall_protection_in_place: boolean;
  ladders_inspected: boolean;
  tools_in_good_condition: boolean;
  hazards_identified: boolean;
  notes: string | null;
  status: 'submitted' | 'reviewed';
  created_at: string;
  updated_at: string;
}

export interface SubmissionPhoto {
  id: string;
  submission_id: string;
  photo_url: string;
  file_name: string;
  file_size: number | null;
  photo_type: 'site_condition' | 'ppe' | 'hazard' | 'other';
  created_at: string;
}

// Extended types with joined data
export interface SafetySubmissionWithDetails extends SafetySubmission {
  users?: User;
  job_sites?: JobSite;
  submission_photos?: SubmissionPhoto[];
}
