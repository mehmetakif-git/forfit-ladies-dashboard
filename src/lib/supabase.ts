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
        .from('app_settings')
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
export { supabase: supabase || createMockClient(), isSupabaseAvailable, connectionStatus, lastTestResult };

// Utility functions
export const getConnectionStatus = () => connectionStatus;
export const getLastTestResult = () => lastTestResult;
export const forceConnectionTest = () => testSupabaseConnection();

// Database types
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
    };
  };
}