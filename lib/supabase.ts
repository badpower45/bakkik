import { createClient } from '@supabase/supabase-js';

// Environment variables with build-time fallbacks
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTYwOTQ1OTIwMCwiZXhwIjoxOTI1MDM1MjAwfQ.placeholder';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDk0NTkyMDAsImV4cCI6MTkyNTAzNTIwMH0.placeholder';

// Validate environment variables at runtime
if (typeof window === 'undefined') {
  // Server-side validation
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NODE_ENV === 'production') {
    console.warn('⚠️ NEXT_PUBLIC_SUPABASE_URL is not set! Using placeholder.');
  }
}

// Supabase client with service role (for backend operations)
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Supabase client with anon key (for public operations)
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Database types (auto-generated or manual)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_id: string;
          name: string;
          email: string;
          phone: string | null;
          profile_picture: string | null;
          user_type: 'fan' | 'fighter' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      fighters: {
        Row: {
          id: string;
          user_id: string;
          nickname: string;
          bio: string | null;
          weight_class_id: number;
          record_wins: number;
          record_losses: number;
          record_draws: number;
          titles: string[];
          profile_picture: string | null;
          height: number | null;
          weight: number | null;
          age: number | null;
          nationality: string;
          status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'retired';
          created_at: string;
          updated_at: string;
        };
      };
      events: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          event_date: string;
          location: string;
          poster_image: string | null;
          status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
          live_stream_enabled: boolean;
          stream_price: number | null;
          stream_url: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      fights: {
        Row: {
          id: string;
          event_id: string;
          fighter1_id: string;
          fighter2_id: string;
          weight_class_id: number;
          scheduled_time: string | null;
          fight_type: 'mainEvent' | 'coMain' | 'undercard';
          status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
          winner_id: string | null;
          win_method: string | null;
          round: number | null;
          time: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};
