import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface FeatureToggle {
  id: string;
  feature_name: string;
  enabled: boolean;
  role_permissions: string[];
  description: string;
  category: string;
}

export const useFeatureToggle = (featureName: string): boolean => {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(true); // Default to enabled
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFeatureToggle = async () => {
      try {
        const { data, error } = await supabase
          .from('feature_toggles')
          .select('*')
          .eq('feature_name', featureName)
          .single();

        if (error) {
          console.warn(`Feature toggle not found for ${featureName}, defaulting to enabled`);
          setIsEnabled(true);
          setLoading(false);
          return;
        }

        if (data) {
          const hasRolePermission = user?.role && data.role_permissions.includes(user.role);
          setIsEnabled(data.enabled && hasRolePermission);
        }
      } catch (error) {
        console.error('Error checking feature toggle:', error);
        setIsEnabled(true); // Default to enabled on error
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      checkFeatureToggle();
    } else {
      setLoading(false);
    }
  }, [featureName, user]);

  return loading ? true : isEnabled;
};

export const useAllFeatureToggles = (): { features: FeatureToggle[]; loading: boolean } => {
  const [features, setFeatures] = useState<FeatureToggle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatureToggles = async () => {
      try {
        const { data, error } = await supabase
          .from('feature_toggles')
          .select('*')
          .order('category', { ascending: true })
          .order('feature_name', { ascending: true });

        if (error) {
          console.warn('Feature toggles table not found, using fallback');
          setFeatures([]);
          setLoading(false);
          return;
        }

        setFeatures(data || []);
      } catch (error) {
        console.error('Error loading feature toggles:', error);
        setFeatures([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeatureToggles();
  }, []);

  return { features, loading };
};

export const updateFeatureToggle = async (
  featureName: string, 
  enabled: boolean, 
  rolePermissions?: string[]
): Promise<boolean> => {
  try {
    const updateData: any = { enabled, updated_at: new Date().toISOString() };
    if (rolePermissions) {
      updateData.role_permissions = rolePermissions;
    }

    const { error } = await supabase
      .from('feature_toggles')
      .update(updateData)
      .eq('feature_name', featureName);

    if (error) {
      console.error('Error updating feature toggle:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating feature toggle:', error);
    return false;
  }
};

export const createFeatureToggle = async (
  featureName: string,
  enabled: boolean = true,
  rolePermissions: string[] = ['admin'],
  description: string = '',
  category: string = 'general'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('feature_toggles')
      .insert({
        feature_name: featureName,
        enabled,
        role_permissions: rolePermissions,
        description,
        category
      });

    if (error) {
      console.error('Error creating feature toggle:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error creating feature toggle:', error);
    return false;
  }
};