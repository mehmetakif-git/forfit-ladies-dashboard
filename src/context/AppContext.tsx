import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseAvailable } from '../lib/supabase';
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

  // Test database connection on initialization
const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('app_settings').select('*').limit(1);
    if (error) {
      console.error('Supabase connection failed:', error);
      return false;
    }
    console.log('Supabase connected successfully');
    return true;
  } catch (err) {
    console.error('Connection error:', err);
    return false;
  }
};

// Veya daha basit - çağrıyı kaldır:
// testSupabaseConnection(); satırını comment'le veya sil
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
      setError('Failed to check out member');
    }
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    try {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      
      // Save to database
      if (isSupabaseAvailable) {
        saveSettingsToDatabase(newSettings);
      } else {
        toast.success('Settings saved locally (database unavailable)');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setError('Failed to update settings');
    }
  };

  // Save settings to Supabase database
  const saveSettingsToDatabase = async (settingsData: AppSettings) => {
    if (!isSupabaseAvailable) {
      return;
    }

    if (!isDbConnected) {
      console.warn('Database not available, settings saved to localStorage only');
      toast.success('Settings saved locally (database unavailable)');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          id: settingsData.id || '1',
          studio_name: settingsData.studioName,
          language: settingsData.language,
          currency: settingsData.currency,
          timezone: settingsData.timezone || 'UTC',
          logo: settingsData.logo,
          favicon: settingsData.favicon,
          theme: settingsData.theme,
          typing_glow_enabled: settingsData.typingGlowEnabled !== false,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      } else {
        toast.success('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Database save error:', error);
      toast.error('Failed to save settings to database, saved locally instead');
    } finally {
      setLoading(false);
    }
  };

  // Load settings from database on app initialization
  const loadSettingsFromDatabase = async () => {
    if (!isSupabaseAvailable) {
      return;
    }

    if (!isDbConnected) {
      console.warn('Database not available, using localStorage settings');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1);

      if (error) {
        console.warn('App settings table not found or error:', error);
        return;
      }

      if (!data || data.length === 0) {
        // Table is empty, insert default settings
        const defaultSettings = {
          id: '1',
          studio_name: 'Forfit Ladies',
          language: 'en',
          currency: 'USD',
          timezone: 'UTC',
          theme: {
            primary: '#DC2684',
            secondary: '#523A7A',
            accentGold: '#FAD45B',
            accentOrange: '#F19F67',
          },
          typing_glow_enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        try {
          const { error: insertError } = await supabase
          .from('app_settings')
          .insert(defaultSettings);

          if (insertError) {
            console.error('Failed to insert default settings:', insertError);
            return;
          }
        } catch (insertError) {
          console.error('Failed to insert default settings:', insertError);
          return;
        }

        // Set the default settings in state
        const appSettings: AppSettings = {
          id: defaultSettings.id,
          studioName: defaultSettings.studio_name,
          currency: defaultSettings.currency,
          language: defaultSettings.language as 'en' | 'ar',
          timezone: defaultSettings.timezone,
          theme: defaultSettings.theme,
          typingGlowEnabled: defaultSettings.typing_glow_enabled,
        };
        
        setSettings(appSettings);
        localStorage.setItem('forfit-settings', JSON.stringify(appSettings));
        return;
      }

      if (data && data.length > 0) {
        const dbData = data[0];
        const dbSettings: AppSettings = {
          id: dbData.id,
          studioName: dbData.studio_name || 'Forfit Ladies',
          currency: dbData.currency || 'USD',
          language: dbData.language || 'en',
          timezone: dbData.timezone || 'UTC',
          logo: dbData.logo,
          favicon: dbData.favicon,
          theme: dbData.theme || {
            primary: '#DC2684',
            secondary: '#523A7A',
            accentGold: '#FAD45B',
            accentOrange: '#F19F67',
          },
          typingGlowEnabled: dbData.typing_glow_enabled !== false,
        };
        
        setSettings(dbSettings);
        // Also update localStorage as cache
        localStorage.setItem('forfit-settings', JSON.stringify(dbSettings));
      }
    } catch (error) {
      console.error('Failed to load settings from database:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load settings on app initialization
  useEffect(() => {
    const initializeSettings = async () => {
      // Wait a bit for Supabase connection test to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      await loadSettingsFromDatabase();
    };
    
    initializeSettings();
  }, []);

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
    loading,
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