import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Environment variables with validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient<Database> | null = null;
let isSupabaseAvailable = false;
let connectionStatus: 'connected' | 'disconnected' | 'error' | 'testing' = 'testing';
let lastConnectionTest = 0;
const CONNECTION_TEST_INTERVAL = 30000; // 30 seconds

// Connection test results
interface ConnectionTestResult {
  success: boolean;
  error?: string;
  timestamp: number;
  responseTime?: number;
}

let lastTestResult: ConnectionTestResult = {
  success: false,
  timestamp: 0
};

// Initialize Supabase client with comprehensive error handling
const initializeSupabase = (): SupabaseClient<Database> | null => {
  try {
    // Validate environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase environment variables missing:', {
        url: !!supabaseUrl,
        key: !!supabaseAnonKey
      });
      return null;
    }

    // Validate URL format
    try {
      new URL(supabaseUrl);
    } catch {
      console.error('Invalid Supabase URL format:', supabaseUrl);
      return null;
    }

    // Create client with proper configuration
    const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      },
      global: {
        headers: {
          'X-Client-Info': 'forfit-ladies-dashboard'
        }
      }
    });

    console.log('Supabase client initialized successfully');
    return client;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
};

// Test database connection with retry logic
export const testSupabaseConnection = async (retries = 3): Promise<ConnectionTestResult> => {
  const startTime = Date.now();
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      connectionStatus = 'testing';
      
      // Test basic connectivity
      const { data, error } = await supabase
        .from('settings')
        .select('id')
        .limit(1);

      const responseTime = Date.now() - startTime;

      if (error) {
        // Handle specific error cases
        if (error.code === 'PGRST116') {
          // Table exists but is empty - this is actually success
          lastTestResult = {
            success: true,
            timestamp: Date.now(),
            responseTime
          };
          connectionStatus = 'connected';
          isSupabaseAvailable = true;
          return lastTestResult;
        }
        
        throw error;
      }

      lastTestResult = {
        success: true,
        timestamp: Date.now(),
        responseTime
      };
      connectionStatus = 'connected';
      isSupabaseAvailable = true;
      return lastTestResult;

    } catch (error) {
      console.warn(`Connection test attempt ${attempt}/${retries} failed:`, error);
      
      if (attempt === retries) {
        lastTestResult = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now()
        };
        connectionStatus = 'error';
        isSupabaseAvailable = false;
        return lastTestResult;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  return lastTestResult;
};

// Initialize client and test connection
supabase = initializeSupabase();

if (supabase) {
  // Test connection immediately
  testSupabaseConnection().then(result => {
    console.log('Initial connection test:', result);
  });

  // Set up periodic connection testing
  setInterval(async () => {
    if (Date.now() - lastConnectionTest > CONNECTION_TEST_INTERVAL) {
      lastConnectionTest = Date.now();
      await testSupabaseConnection();
    }
  }, CONNECTION_TEST_INTERVAL);
} else {
  connectionStatus = 'disconnected';
  isSupabaseAvailable = false;
  console.warn('Running in offline mode - Supabase unavailable');
}

// Create mock client for offline mode
const createMockClient = () => ({
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
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: { message: 'Offline mode' } }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
});

// Export the client (real or mock)
export const client = supabase || createMockClient();
export { client as supabase };
export { isSupabaseAvailable };
export { connectionStatus };
export { lastTestResult };

// Utility functions
export const getConnectionStatus = () => connectionStatus;
export const getLastTestResult = () => lastTestResult;
export const forceConnectionTest = () => testSupabaseConnection();

// Database types
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
          name: string | null;
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
          price: number | null;
          features: string[] | null;
          end_date?: string | null;
          discount_percentage?: number | null;
          discount_reason?: string | null;
          discount_applied_by?: string | null;
          id?: number;
          original_price?: number | null;
          price?: number | null;
          features?: string[] | null;
        };
        Update: {
          id?: number;
          name?: string;
          id?: number;
          phone?: string | null;
          price?: number | null;
          status?: string | null;
          discount_reason?: string | null;
          discount_applied_by?: string | null;
          discount_date?: string | null;
          original_price?: number | null;
          final_price?: number | null;
          id: number;
          member_id: number | null;
          amount: number | null;
          payment_method: string | null;
          payment_date: string | null;
          status: string | null;
          };
          id: number;
          id?: number;
          member_id?: number | null;
          amount?: number | null;
          payment_method?: string | null;
          payment_date?: string | null;
          status?: string | null;
          id?: number;
          member_id?: number | null;
          payment_method?: string | null;
          payment_date?: string | null;
          id: number;
          member_id: number | null;
          check_in: string | null;
          id?: number;
          member_id?: number | null;
          check_in?: string | null;
          id?: number;
          member_id?: number | null;
          check_in?: string | null;
      }
    }
  }
}