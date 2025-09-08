import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseAvailable, testSupabaseConnection } from '../lib/supabase';
import { translations } from '../utils/translations';
import { Member, Payment, AttendanceRecord, Subscription, AppSettings } from '../types';
import { mockSubscriptionPlans } from '../mocks/subscriptions';
import toast from 'react-hot-toast';

interface AppContextType {
  members: Member[];
  payments: Payment[];
  attendance: AttendanceRecord[];
  settings: AppSettings;
  loading: boolean;
  error: string | null;
  addMember: (member: Partial<Member>) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  addPayment: (payment: Partial<Payment>) => void;
  checkInMember: (memberId: string, classType?: string) => void;
  checkOutMember: (memberId: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  getSubscriptionPlans: () => Subscription[];
  updateSubscriptionPlans: (plans: Subscription[]) => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const stored = localStorage.getItem('forfit-members');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  
  const [payments, setPayments] = useState<Payment[]>(() => {
    try {
      const stored = localStorage.getItem('forfit-payments');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    try {
      const stored = localStorage.getItem('forfit-attendance');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem('forfit-settings');
      return stored ? JSON.parse(stored) : {
        id: '1',
        studioName: 'Forfit Ladies',
        currency: 'USD',
        language: 'en' as 'en' | 'ar',
        theme: {
          primary: '#DC2684',
          secondary: '#523A7A',
          accentGold: '#FAD45B',
          accentOrange: '#F19F67',
        },
        typingGlowEnabled: true,
      };
    } catch {
      return {
        id: '1',
        studioName: 'Forfit Ladies',
        currency: 'USD',
        language: 'en' as 'en' | 'ar',
        theme: {
          primary: '#DC2684',
          secondary: '#523A7A',
          accentGold: '#FAD45B',
          accentOrange: '#F19F67',
        },
        typingGlowEnabled: true,
      };
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize database connection and settings
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (isSupabaseAvailable) {
          // Test database connection
          const connectionResult = await testSupabaseConnection();
          setIsDbConnected(connectionResult.success);
          
            // Table exists but is empty
            console.log('Settings table is empty, using localStorage settings');
            try {
              return true; // Use localStorage settings
            } catch (dbError) {
              console.warn('Failed to handle empty settings:', createError);
              setIsDbConnected(false);
            }
          } else {
            console.warn('Database unavailable, using localStorage settings');
          }
        } else {
          console.warn('Supabase not available, using localStorage settings');
          setIsDbConnected(false);
        }
      } catch (error) {
        console.error('App initialization error:', error);
        setError(null); // Don't show error to user, just log it
        setIsDbConnected(false);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
      } catch (error) {
        console.error('App initialization error:', error);
        setError(null); // Don't show error to user, just log it
        setIsDbConnected(false);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('forfit-members', JSON.stringify(members));
    } catch (error) {
      console.error('Failed to save members:', error);
    }
  }, [members]);

  useEffect(() => {
    try {
      localStorage.setItem('forfit-payments', JSON.stringify(payments));
    } catch (error) {
      console.error('Failed to save payments:', error);
    }
  }, [payments]);

  useEffect(() => {
    try {
      localStorage.setItem('forfit-attendance', JSON.stringify(attendance));
    } catch (error) {
      console.error('Failed to save attendance:', error);
    }
  }, [attendance]);

  useEffect(() => {
    try {
      localStorage.setItem('forfit-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings]);

  // Translation function
  const t = (key: string): string => {
    try {
      const keys = key.split('.');
      let value: any = translations[settings.language];
      
      for (const k of keys) {
        value = value?.[k];
      }
      
      return value || key;
    } catch (error) {
      console.error('Translation error:', error);
      return key;
    }
  };

  const addMember = (memberData: Partial<Member>) => {
    try {
      const newMember: Member = {
        id: Date.now().toString(),
        name: memberData.name || '',
        email: memberData.email || '',
        username: memberData.username || memberData.email || '',
        phone: memberData.phone || '',
        password: memberData.password || '',
        memberId: memberData.memberId || `FL-${new Date().getFullYear()}-${String(members.length + 1).padStart(3, '0')}`,
        joinDate: memberData.joinDate || new Date().toISOString().split('T')[0],
        subscriptionPlan: memberData.subscriptionPlan || 'Basic',
        subscriptionStatus: memberData.subscriptionStatus || 'active',
        subscriptionEnd: memberData.subscriptionEnd || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        age: memberData.age || 18,
        emergencyContact: memberData.emergencyContact || '',
        medicalNotes: memberData.medicalNotes,
        lastAttendance: memberData.lastAttendance,
        lastLogin: memberData.lastLogin,
        loginStatus: memberData.loginStatus || 'inactive',
        totalSessions: memberData.totalSessions || 0,
        remainingSessions: memberData.remainingSessions,
        personalTrainer: memberData.personalTrainer,
        photo: memberData.photo,
        customBenefits: memberData.customBenefits,
      };
      
      setMembers(prev => [newMember, ...prev]);
    } catch (error) {
      console.error('Error adding member:', error);
      setError('Failed to add member');
    }
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    try {
      setMembers(prev => prev.map(member => 
        member.id === id ? { ...member, ...updates } : member
      ));
    } catch (error) {
      console.error('Error updating member:', error);
      setError('Failed to update member');
    }
  };

  const deleteMember = (id: string) => {
    try {
      setMembers(prev => prev.filter(member => member.id !== id));
    } catch (error) {
      console.error('Error deleting member:', error);
      setError('Failed to delete member');
    }
  };

  const addPayment = (paymentData: Partial<Payment>) => {
    try {
      const newPayment: Payment = {
        id: Date.now().toString(),
        memberId: paymentData.memberId || '',
        memberName: paymentData.memberName || '',
        amount: paymentData.amount || 0,
        date: paymentData.date || new Date().toISOString().split('T')[0],
        status: paymentData.status || 'completed',
        method: paymentData.method || 'cash',
        description: paymentData.description || '',
      };
      
      setPayments(prev => [newPayment, ...prev]);
    } catch (error) {
      console.error('Error adding payment:', error);
      setError('Failed to add payment');
    }
  };

  const checkInMember = (memberId: string, classType?: string) => {
    try {
      const member = members.find(m => m.id === memberId);
      if (!member) return;
      
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        memberId,
        memberName: member.name,
        checkIn: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        classType,
      };
      
      setAttendance(prev => [newRecord, ...prev]);
      
      // Update member's last attendance
      updateMember(memberId, { 
        lastAttendance: newRecord.date,
        totalSessions: member.totalSessions + 1,
        remainingSessions: member.remainingSessions ? member.remainingSessions - 1 : undefined
      });
    } catch (error) {
      console.error('Error checking in member:', error);
      setError('Failed to check in member');
    }
  };

  const checkOutMember = (memberId: string) => {
    try {
      setAttendance(prev => prev.map(record => 
        record.memberId === memberId && !record.checkOut
          ? { ...record, checkOut: new Date().toISOString() }
          : record
      ));
    } catch (error) {
      console.error('Error checking out member:', error);
      setError('Fai
      )
    }
  }
}led to check out member');
    }
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    try {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      
      // Save to localStorage immediately
      localStorage.setItem('forfit-settings', JSON.stringify(newSettings));
      
      // Save to database
      if (isSupabaseAvailable && isDbConnected) {
        saveSettingsToDatabase(newSettings).then(success => {
          if (success) {
            toast.success('Settings saved successfully!');
          } else {
            toast.error('Failed to save to database, saved locally');
          }
        });
      } else {
        toast.success('Settings saved locally');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
      setError('Failed to update settings');
    }
  };

  // Save settings to Supabase database
  const saveSettingsToDatabase = async (settingsData: AppSettings): Promise<boolean> => {
    if (!isSupabaseAvailable) {
      console.warn('Supabase not available, skipping database save');
      return false;
    }

    try {
      setLoading(true);
      
      // Check if app_settings table exists and has records
      let existingSettings = null;
      try {
        const { data, error: selectError } = await supabase
          .from('app_settings')
          .select('id')
          .limit(1);
        
        if (selectError) {
          if (selectError.code === 'PGRST116') {
            // Table exists but is empty
            existingSettings = [];
          } else {
            throw selectError;
          }
        } else {
          existingSettings = data;
        }
      } catch (tableError) {
        console.warn('app_settings table not accessible:', tableError);
        return false;
      }

      const settingsRecord = {
        id: settingsData.id || '1',
        studio_name: settingsData.studioName,
        language: settingsData.language,
        currency: settingsData.currency,
        timezone: settingsData.timezone || 'UTC',
        studio_logo: settingsData.logo || null,
        favicon_url: settingsData.favicon || null,
        theme: settingsData.theme,
        typing_glow_enabled: settingsData.typingGlowEnabled !== false,
        updated_at: new Date().toISOString(),
      };

      let error;
      
      if (!existingSettings || (Array.isArray(existingSettings) && existingSettings.length === 0)) {
        // Insert new record
        const { error: insertError } = await supabase
          .from('app_settings')
          .insert({
            ...settingsRecord,
            created_at: new Date().toISOString(),
          });
        error = insertError;
      } else {
        // Update existing record
        const { error: updateError } = await supabase
          .from('app_settings')
          .update(settingsRecord)
          .eq('id', settingsRecord.id);
        error = updateError;
      }

      if (error) {
        throw error;
      }

      console.log('Settings saved to database successfully');
      setIsDbConnected(true);
      return true;

    } catch (error) {
      console.error('Database save error:', error);
      setIsDbConnected(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load settings from database with comprehensive error handling
  const loadSettingsFromDatabase = async (): Promise<boolean> => {
    if (!isSupabaseAvailable) {
      console.warn('Supabase not available, using localStorage settings');
      return false;
    }

    try {
      // Don't set loading here as it's already set in initializeApp
      
      let data = null;
      let error = null;
      
      try {
        const result = await supabase
          .from('settings')
          .select('*')
          .limit(1);
        data = result.data;
        error = result.error;
      } catch (queryError) {
        console.warn('Failed to query app_settings table:', queryError);
        return false;
      }

      if (error) {
        if (error.code === 'PGRST116') {
          // Table exists but is empty - create default settings
          console.log('No settings found, using localStorage settings');
          return true;
        }
        console.warn('Database query error:', error);
        // Parse settings from key-value pairs
        const settingsMap = new Map();
        data.forEach(row => {
          try {
            settingsMap.set(row.key, row.value ? JSON.parse(row.value) : row.value);
          } catch {
            settingsMap.set(row.key, row.value);
          }
        });

        if (settingsMap.size > 0) {
          const loadedSettings: AppSettings = {
            id: '1',
            studioName: settingsMap.get('studio_name') || 'Forfit Ladies',
            currency: settingsMap.get('currency') || 'USD',
            language: settingsMap.get('language') || 'en',
            timezone: settingsMap.get('timezone') || 'UTC',
            logo: settingsMap.get('studio_logo') || undefined,
            favicon: settingsMap.get('favicon_url') || undefined,
            theme: settingsMap.get('theme') || {
              primary: '#DC2684',
              secondary: '#523A7A',
              accentGold: '#FAD45B',
              accentOrange: '#F19F67',
            },
            typingGlowEnabled: settingsMap.get('typing_glow_enabled') !== false,
          };
          
          setSettings(loadedSettings);
          localStorage.setItem('forfit-settings', JSON.stringify(loadedSettings));
          console.log('Settings loaded from database successfully');
        }
        
        favicon: dbSettings.favicon_url || undefined,
        theme: dbSettings.theme || {
          primary: '#DC2684',
          secondary: '#523A7A',
          accentGold: '#FAD45B',
          accentOrange: '#F19F67',
        },
        typingGlowEnabled: dbSettings.typing_glow_enabled !== false,
      };
      
      setSettings(loadedSettings);
      localStorage.setItem('forfit-settings', JSON.stringify(loadedSettings));
      console.log('Settings loaded from database successfully');
      setIsDbConnected(true);
      return true;

    } catch (error) {
      console.error('Failed to load settings from database:', error);
      setIsDbConnected(false);
      return false;
    }
  };

  const getSubscriptionPlans = (): Subscription[] => {
    try {
      const stored = localStorage.getItem('forfit-subscription-plans');
      return stored ? JSON.parse(stored) : mockSubscriptionPlans;
    } catch (error) {
      console.error('Error getting subscription plans:', error);
      return mockSubscriptionPlans;
    }
  };

  const updateSubscriptionPlans = (plans: Subscription[]) => {
    try {
      localStorage.setItem('forfit-subscription-plans', JSON.stringify(plans));
    } catch (error) {
      console.error('Error updating subscription plans:', error);
      setError('Failed to update subscription plans');
    }
  };

  const value: AppContextType = {
    members,
    payments,
    attendance,
    settings,
    loading: loading || !isInitialized,
    error,
    addMember,
    updateMember,
    deleteMember,
    addPayment,
    checkInMember,
    checkOutMember,
    updateSettings,
    getSubscriptionPlans,
    updateSubscriptionPlans,
    t,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};