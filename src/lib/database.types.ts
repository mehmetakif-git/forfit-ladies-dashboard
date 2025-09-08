export interface Database {
  public: {
    Tables: {
      settings: {
        Row: {
          id: number;
          key: string;
          value: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          key: string;
          value?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          key?: string;
          value?: string | null;
          updated_at?: string;
        };
      };
      app_settings: {
        Row: {
          id: string;
          studio_name: string | null;
          language: string | null;
          currency: string | null;
          timezone: string | null;
          theme: string | null;
          typing_glow_enabled: boolean | null;
          studio_logo: string | null;
          favicon_url: string | null;
          primary_color: string | null;
          secondary_color: string | null;
          accent_gold: string | null;
          accent_orange: string | null;
        };
        Insert: {
          id?: string;
          studio_name?: string | null;
          language?: string | null;
          currency?: string | null;
          timezone?: string | null;
          theme?: string | null;
          typing_glow_enabled?: boolean | null;
          studio_logo?: string | null;
          favicon_url?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          accent_gold?: string | null;
          accent_orange?: string | null;
        };
        Update: {
          id?: string;
          studio_name?: string | null;
          language?: string | null;
          currency?: string | null;
          timezone?: string | null;
          theme?: string | null;
          typing_glow_enabled?: boolean | null;
          studio_logo?: string | null;
          favicon_url?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          accent_gold?: string | null;
          accent_orange?: string | null;
        };
      };
      members: {
        Row: {
          id: number;
          name: string;
          email: string | null;
          phone: string | null;
          username: string | null;
          password: string | null;
          membership_plan: string | null;
          status: string | null;
          personal_trainer: string | null;
          start_date: string | null;
          end_date: string | null;
          discount_percentage: number | null;
          discount_reason: string | null;
          discount_applied_by: string | null;
          discount_date: string | null;
          original_price: number | null;
          final_price: number | null;
          qid_front_pdf: string | null;
          qid_back_pdf: string | null;
          additional_documents: any | null;
          member_id: string | null;
          age: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          email?: string | null;
          phone?: string | null;
          username?: string | null;
          password?: string | null;
          membership_plan?: string | null;
          status?: string | null;
          personal_trainer?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          discount_percentage?: number | null;
          discount_reason?: string | null;
          discount_applied_by?: string | null;
          discount_date?: string | null;
          original_price?: number | null;
          final_price?: number | null;
          qid_front_pdf?: string | null;
          qid_back_pdf?: string | null;
          additional_documents?: any | null;
          member_id?: string | null;
          age: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          email?: string | null;
          phone?: string | null;
          username?: string | null;
          password?: string | null;
          membership_plan?: string | null;
          status?: string | null;
          personal_trainer?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          discount_percentage?: number | null;
          discount_reason?: string | null;
          discount_applied_by?: string | null;
          discount_date?: string | null;
          original_price?: number | null;
          final_price?: number | null;
          qid_front_pdf?: string | null;
          qid_back_pdf?: string | null;
          additional_documents?: any | null;
          member_id?: string | null;
          age?: number;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: number;
          member_id: number | null;
          amount: number | null;
          payment_method: string | null;
          payment_date: string | null;
          status: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          member_id?: number | null;
          amount?: number | null;
          payment_method?: string | null;
          payment_date?: string | null;
          status?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          member_id?: number | null;
          amount?: number | null;
          payment_method?: string | null;
          payment_date?: string | null;
          status?: string | null;
        };
      };
      attendance_records: {
        Row: {
          id: number;
          member_id: number | null;
          check_in: string | null;
          check_out: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          member_id?: number | null;
          check_in?: string | null;
          check_out?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          member_id?: number | null;
          check_in?: string | null;
          check_out?: string | null;
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