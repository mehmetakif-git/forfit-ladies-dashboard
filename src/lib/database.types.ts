export interface Database {
  public: {
    Tables: {
      app_settings: {
        Row: {
          id: string;
          studio_name: string;
          language: string;
          currency: string;
          timezone: string;
          studio_logo: string | null;
          favicon_url: string | null;
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
          studio_logo?: string | null;
          favicon_url?: string | null;
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
          studio_logo?: string | null;
          favicon_url?: string | null;
          theme?: any;
          typing_glow_enabled?: boolean;
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