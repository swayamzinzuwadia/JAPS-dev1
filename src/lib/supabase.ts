import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          mobile: string;
          address: string | null;
          date_of_birth: string | null;
          role: 'guest' | 'admin';
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          mobile: string;
          address?: string | null;
          date_of_birth?: string | null;
          role?: 'guest' | 'admin';
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          mobile?: string;
          address?: string | null;
          date_of_birth?: string | null;
          role?: 'guest' | 'admin';
          created_at?: string;
        };
      };
      rooms: {
        Row: {
          id: string;
          room_number: string;
          capacity: number;
          price_per_night: number;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
      };
      halls: {
        Row: {
          id: string;
          hall_name: string;
          capacity: number;
          price_per_day: number;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          guest_id: string;
          room_id: string | null;
          hall_id: string | null;
          check_in_date: string;
          check_out_date: string;
          number_of_persons: number;
          extra_beds: number;
          extra_bed_price: number;
          food_breakfast: boolean;
          food_lunch: boolean;
          food_dinner: boolean;
          food_total_cost: number;
          base_amount: number;
          total_amount: number;
          advance_amount: number;
          balance_amount: number;
          payment_due_date: string;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          special_requests: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          guest_id: string;
          room_id?: string | null;
          hall_id?: string | null;
          check_in_date: string;
          check_out_date: string;
          number_of_persons: number;
          extra_beds?: number;
          extra_bed_price?: number;
          food_breakfast?: boolean;
          food_lunch?: boolean;
          food_dinner?: boolean;
          food_total_cost?: number;
          base_amount: number;
          total_amount: number;
          advance_amount: number;
          balance_amount: number;
          payment_due_date: string;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          special_requests?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          amount: number;
          payment_mode: 'Cash' | 'GPay' | 'Online';
          payment_type: 'advance' | 'balance' | 'full';
          transaction_reference: string | null;
          received_by: string | null;
          payment_date: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          booking_id: string;
          amount: number;
          payment_mode: 'Cash' | 'GPay' | 'Online';
          payment_type: 'advance' | 'balance' | 'full';
          transaction_reference?: string | null;
          received_by?: string | null;
          payment_date?: string;
          notes?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          booking_id: string;
          notification_type: 'payment_due' | 'checkin_reminder';
          message: string;
          is_read: boolean;
          created_at: string;
        };
      };
    };
  };
};
