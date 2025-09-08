import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Validate that we have proper Supabase configuration
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          has_completed_onboarding: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          has_completed_onboarding?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          has_completed_onboarding?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          user_id: string;
          linkedin_url: string;
          google_sheet_url: string | null;
          status: 'processing' | 'completed' | 'error';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          linkedin_url: string;
          google_sheet_url?: string | null;
          status?: 'processing' | 'completed' | 'error';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          linkedin_url?: string;
          google_sheet_url?: string | null;
          status?: 'processing' | 'completed' | 'error';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};