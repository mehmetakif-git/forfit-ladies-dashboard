import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase: any = null;
let isSupabaseAvailable = false;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    isSupabaseAvailable = true;
  } else {
    console.warn('Supabase environment variables not found, running in offline mode');
    // Create mock client for offline mode
    supabase = {
      from: () => ({
        select: () => Promise.resolve({ data: null, error: { message: 'Offline mode' } }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Offline mode' } }),
        update: () => Promise.resolve({ data: null, error: { message: 'Offline mode' } }),
        upsert: () => Promise.resolve({ data: null, error: { message: 'Offline mode' } }),
        delete: () => Promise.resolve({ data: null, error: { message: 'Offline mode' } }),
      }),
      auth: {
        signInWithPassword: () => Promise.resolve({ data: { user: null }, error: { message: 'Offline mode' } }),
        signOut: () => Promise.resolve({ error: null }),
      },
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: { message: 'Offline mode' } }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
        }),
      },
    };
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  isSupabaseAvailable = false;
}

export { supabase, isSupabaseAvailable };

// Test connection function
export const testSupabaseConnection = async (): Promise<boolean> => {
  if (!isSupabaseAvailable) return false;
  
  try {
    const { data, error } = await supabase.from('app_settings').select('id').limit(1);
    return !error;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};

// Database types
export interface Database {
  public: {
    Tables: {
      registration_questions: {
        Row: {
          id: string;
          question_text: string;
          field_type: string;
          field_name: string;
          options: string | null;
          is_required: boolean;
          order_index: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question_text: string;
          field_type: string;
          field_name: string;
          options?: string | null;
          is_required?: boolean;
          order_index?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question_text?: string;
          field_type?: string;
          field_name?: string;
          options?: string | null;
          is_required?: boolean;
          order_index?: number;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      member_applications: {
        Row: {
          id: string;
          form_data: any;
          status: string;
          submitted_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          admin_notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          form_data: any;
          status?: string;
          submitted_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          admin_notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          form_data?: any;
          status?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          admin_notes?: string | null;
        };
      };
      app_settings: {
        Row: {
          id: string;
          studio_name: string;
          language: string;
          currency: string;
          timezone: string;
          logo: string | null;
          favicon: string | null;
          theme: any;
          typing_glow_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          studio_name?: string;
          language?: string;
          currency?: string;
          timezone?: string;
          logo?: string | null;
          favicon?: string | null;
          theme?: any;
          typing_glow_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          studio_name?: string;
          language?: string;
          currency?: string;
          timezone?: string;
          logo?: string | null;
          favicon?: string | null;
          theme?: any;
          typing_glow_enabled?: boolean;
          updated_at?: string;
        };
      };
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          price: number;
          promotional_price: number | null;
          duration: number;
          features: string[];
          color: string;
          sessions: number | null;
          popular: boolean;
          enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          price: number;
          promotional_price?: number | null;
          duration?: number;
          features: string[];
          color?: string;
          sessions?: number | null;
          popular?: boolean;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          promotional_price?: number | null;
          duration?: number;
          features?: string[];
          color?: string;
          sessions?: number | null;
          popular?: boolean;
          enabled?: boolean;
          updated_at?: string;
        };
      };
      members: {
        Row: {
          id: string;
          name: string;
          email: string;
          username: string;
          phone: string;
          password: string;
          member_id: string;
          qid: string | null;
          join_date: string;
          subscription_plan: string;
          subscription_status: string;
          subscription_end: string;
          age: number;
          emergency_contact: string;
          medical_notes: string | null;
          last_attendance: string | null;
          last_login: string | null;
          login_status: string;
          total_sessions: number;
          remaining_sessions: number | null;
          personal_trainer: string | null;
          photo: string | null;
          custom_benefits: string[] | null;
          application_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          username: string;
          phone: string;
          password: string;
          member_id: string;
          qid?: string | null;
          join_date?: string;
          subscription_plan: string;
          subscription_status?: string;
          subscription_end: string;
          age: number;
          emergency_contact: string;
          medical_notes?: string | null;
          last_attendance?: string | null;
          last_login?: string | null;
          login_status?: string;
          total_sessions?: number;
          remaining_sessions?: number | null;
          personal_trainer?: string | null;
          photo?: string | null;
          custom_benefits?: string[] | null;
          application_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          username?: string;
          phone?: string;
          password?: string;
          member_id?: string;
          qid?: string | null;
          join_date?: string;
          subscription_plan?: string;
          subscription_status?: string;
          subscription_end?: string;
          age?: number;
          emergency_contact?: string;
          medical_notes?: string | null;
          last_attendance?: string | null;
          last_login?: string | null;
          login_status?: string;
          total_sessions?: number;
          remaining_sessions?: number | null;
          personal_trainer?: string | null;
          photo?: string | null;
          custom_benefits?: string[] | null;
          application_id?: string | null;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          member_id: string;
          member_name: string;
          amount: number;
          date: string;
          status: string;
          method: string;
          description: string;
          plan_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          member_name: string;
          amount: number;
          date?: string;
          status?: string;
          method: string;
          description: string;
          plan_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          member_name?: string;
          amount?: number;
          date?: string;
          status?: string;
          method?: string;
          description?: string;
          plan_name?: string;
        };
      };
      attendance_records: {
        Row: {
          id: string;
          member_id: string;
          member_name: string;
          check_in: string;
          check_out: string | null;
          date: string;
          class_type: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          member_name: string;
          check_in: string;
          check_out?: string | null;
          date?: string;
          class_type?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          member_name?: string;
          check_in?: string;
          check_out?: string | null;
          date?: string;
          class_type?: string | null;
        };
      };
    };
  };
}