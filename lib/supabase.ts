import { createClient } from '@supabase/supabase-js';

// Default values for build time
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

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
          full_name: string | null;
          nickname: string;
          bio: string | null;
          stylistics: string | null;
          place: string | null;
          gym_team: string | null;
          coach: string | null;
          phone: string | null;
          email: string | null;
          facebook_link: string | null;
          instagram_link: string | null;
          sherdog_link: string | null;
          tapology_link: string | null;
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
          registration_open_at: string | null;
          registration_close_at: string | null;
          registration_fee: number | null;
          registration_paid: boolean;
          registration_enabled: boolean;
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
          fighter1_id: string | null;
          fighter2_id: string | null;
          weight_class_id: number;
          scheduled_time: string | null;
          fight_type: 'mainEvent' | 'coMain' | 'undercard';
          status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
          winner_id: string | null;
          win_method: string | null;
          round: number | null;
          time: string | null;
          bracket_round: string | null;
          bracket_position: number | null;
          next_fight_id: string | null;
          next_fight_slot: 'fighter1' | 'fighter2' | null;
          created_at: string;
          updated_at: string;
        };
      };
      event_registrations: {
        Row: {
          id: string;
          event_id: string;
          fighter_id: string;
          user_id: string;
          status: 'pending' | 'approved' | 'rejected' | 'cancelled';
          payment_status: 'pending' | 'paid' | 'free' | 'refunded';
          created_at: string;
          updated_at: string;
        };
      };
      home_banners: {
        Row: {
          id: string;
          title: string | null;
          subtitle: string | null;
          image_url: string;
          type: 'event' | 'image' | 'teaser';
          event_id: string | null;
          cta_text: string | null;
          is_active: boolean;
          sort_order: number;
          start_at: string | null;
          end_at: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};
