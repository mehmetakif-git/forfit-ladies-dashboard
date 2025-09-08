import React, { useState } from 'react';
import { Settings, Shield, Users, DollarSign, BarChart3, MessageCircle, Calendar, TestTube, Palette, Save, RotateCcw, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useAllFeatureToggles, updateFeatureToggle, createFeatureToggle } from '../hooks/useFeatureToggle';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseAvailable } from '../lib/supabase';
import Button from '../components/UI/Button';
import Breadcrumb from '../components/UI/Breadcrumb';
import StatsCard from '../components/UI/StatsCard';
import toast from 'react-hot-toast';

interface FeatureToggle {
  id: string;
  feature_name: string;
  enabled: boolean;
  role_permissions: string[];
  description: string;
  category: string;
  created_at?: string;
  updated_at?: string;
}

interface FeatureCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
}

const FeatureManagement: React.FC = () => {
  const { user } = useAuth();
  const { features, loading } = useAllFeatureToggles();
  const [localFeatures, setLocalFeatures] = useState<FeatureToggle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [savingFeatures, setSavingFeatures] = useState<Set<string>>(new Set());
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize local features state and create missing features
  React.useEffect(() => {
    const initializeFeatures = async () => {
      if (!isSupabaseAvailable) {
        setIsInitializing(false);
        return;
      }

      // Define all expected features with their categories and descriptions
      const expectedFeatures = [
        { name: 'member_management', category: 'members', description: 'Core member management functionality' },
        { name: 'payment_system', category: 'finance', description: 'Payment processing and billing' },
        { name: 'attendance_tracking', category: 'operations', description: 'Member check-in and attendance tracking' },
        { name: 'trainer_management', category: 'trainers', description: 'Trainer profiles and client assignments' },
        { name: 'access_control', category: 'security', description: 'NFC card access and door control' },
        { name: 'security_cameras', category: 'security', description: 'Security camera monitoring and events' },
        { name: 'progress_tracking', category: 'health', description: 'Member progress photos and measurements' },
        { name: 'whatsapp_integration', category: 'communications', description: 'WhatsApp messaging and templates' },
        { name: 'class_booking', category: 'operations', description: 'Fitness class scheduling and booking' },
        { name: 'reports_analytics', category: 'reports', description: 'Business reports and analytics' },
        { name: 'system_testing', category: 'admin', description: 'System testing and diagnostics' },
        { name: 'theme_customization', category: 'admin', description: 'Theme and branding customization' },
      ];

      try {
        // Check which features exist in database
        const { data: existingFeatures, error } = await supabase
          .from('feature_toggles')
          .select('feature_name');

        if (error) {
          console.warn('Could not load existing features:', error);
          setIsInitializing(false);
          return;
        }

        const existingFeatureNames = existingFeatures?.map(f => f.feature_name) || [];
        
        // Create missing features
        const missingFeatures = expectedFeatures.filter(
          expected => !existingFeatureNames.includes(expected.name)
        );

        if (missingFeatures.length > 0) {
          console.log(`Creating ${missingFeatures.length} missing feature toggles...`);
          
          for (const feature of missingFeatures) {
            await createFeatureToggle(
              feature.name,
              true, // Default to enabled
              ['admin'], // Default to admin only
              feature.description,
              feature.category
            );
          }
          
          toast.success(`Initialized ${missingFeatures.length} feature toggles`);
        }
      } catch (error) {
        console.error('Error initializing features:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    if (features.length === 0 && !loading) {
      initializeFeatures();
    } else {
      setLocalFeatures(features);
      setIsInitializing(false);
    }
  }, [features, loading]);

  // Update local features when database features change
  React.useEffect(() => {
    setLocalFeatures(features);
  }, [features]);
  const categories: FeatureCategory[] = [
    { id: 'security', name: 'Security', icon: Shield, description: 'Camera monitoring, access control, and security events' },
    { id: 'members', name: 'Members', icon: Users, description: 'Member management, profiles, and documentation' },
    { id: 'trainers', name: 'Trainers', icon: Users, description: 'Trainer management and client assignments' },
    { id: 'finance', name: 'Finance', icon: DollarSign, description: 'Payments, subscriptions, and financial tracking' },
    { id: 'operations', name: 'Operations', icon: Calendar, description: 'Daily operations, attendance, and scheduling' },
    { id: 'health', name: 'Health', icon: BarChart3, description: 'Progress tracking and health measurements' },
    { id: 'communications', name: 'Communications', icon: MessageCircle, description: 'Messaging, notifications, and alerts' },
    { id: 'reports', name: 'Reports', icon: BarChart3, description: 'Analytics, reports, and business intelligence' },
    { id: 'admin', name: 'Admin', icon: Settings, description: 'System administration and configuration' },
  ];

  const availableRoles = ['admin', 'staff', 'trainer', 'member'];

  const filteredFeatures = selectedCategory === 'all' 
    ? localFeatures 
    : localFeatures.filter(f => f.category === selectedCategory);

  const handleToggleFeature = async (featureName: string) => {
    const currentFeature = localFeatures.find(f => f.feature_name === featureName);
    if (!currentFeature) return;
    
    const newEnabled = !currentFeature.enabled;
    
    setSavingFeatures(prev => new Set([...prev, featureName]));
    
    try {
      const success = await updateFeatureToggle(featureName, newEnabled, currentFeature.role_permissions);
      
      if (success) {
        // Update local state optimistically
        setLocalFeatures(prev => prev.map(f => 
          f.feature_name === featureName 
            ? { ...f, enabled: newEnabled, updated_at: new Date().toISOString() }
            : f
        ));
        toast.success(`Feature ${newEnabled ? 'enabled' : 'disabled'} successfully`);
      } else {
        throw new Error('Failed to update feature toggle');
      }
    } catch (error) {
      console.error('Error toggling feature:', error);
      toast.error('Failed to update feature toggle');
    } finally {
      setSavingFeatures(prev => {
        const newSet = new Set(prev);
        newSet.delete(featureName);
        return newSet;
      });
    }
  };
  
  const handleUpdateRolePermissions = async (featureName: string, newPermissions: string[]) => {
    const currentFeature = localFeatures.find(f => f.feature_name === featureName);
    if (!currentFeature) return;
    
    setSavingFeatures(prev => new Set([...prev, featureName]));
    
    try {
      const success = await updateFeatureToggle(featureName, currentFeature.enabled, newPermissions);
      
      if (success) {
        // Update local state optimistically
        setLocalFeatures(prev => prev.map(f => 
          f.feature_name === featureName 
            ? { ...f, role_permissions: newPermissions, updated_at: new Date().toISOString() }
            : f
        ));
        toast.success('Permissions updated successfully');
      } else {
        throw new Error('Failed to update permissions');
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Failed to update permissions');
    } finally {
      setSavingFeatures(prev => {
        const newSet = new Set(prev);
        newSet.delete(featureName);
        return newSet;
      });
    }
  };

  const refreshFeatures = async () => {
    window.location.reload();
  };

  const handleBulkAction = async (action: 'enable' | 'disable') => {
    const targetFeatures = selectedCategory === 'all' ? localFeatures : localFeatures.filter(f => f.category === selectedCategory);
    
    setSavingFeatures(new Set(targetFeatures.map(f => f.feature_name)));
    
    try {
      let successCount = 0;
      for (const feature of targetFeatures) {
        const success = await updateFeatureToggle(feature.feature_name, action === 'enable', feature.role_permissions);
        if (success) {
          successCount++;
          // Update local state
          setLocalFeatures(prev => prev.map(f => 
            f.feature_name === feature.feature_name 
              ? { ...f, enabled: action === 'enable', updated_at: new Date().toISOString() }
              : f
          ));
        }
      }
      
      if (successCount === targetFeatures.length) {
        toast.success(`${successCount} features ${action}d successfully!`);
      } else {
        toast.error(`${successCount}/${targetFeatures.length} features updated. Some changes failed.`);
      }
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error(`Failed to ${action} features`);
    } finally {
      setSavingFeatures(new Set());
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || Settings;
  };

  const getFeatureIcon = (featureName: string) => {
    if (featureName.includes('camera') || featureName.includes('security')) return Shield;
    if (featureName.includes('member')) return Users;
    if (featureName.includes('payment') || featureName.includes('subscription')) return DollarSign;
    if (featureName.includes('report') || featureName.includes('analytics')) return BarChart3;
    if (featureName.includes('whatsapp') || featureName.includes('notification')) return MessageCircle;
    if (featureName.includes('class') || featureName.includes('attendance')) return Calendar;
    if (featureName.includes('testing') || featureName.includes('admin')) return TestTube;
    if (featureName.includes('theme') || featureName.includes('customization')) return Palette;
    return Settings;
  };

  const featureStats = {
    total: localFeatures.length,
    enabled: localFeatures.filter(f => f.enabled).length,
    disabled: localFeatures.filter(f => !f.enabled).length,
    pendingChanges: 0 // Real-time updates, no pending changes
  };

  if (loading || isInitializing) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">{isInitializing ? 'Initializing features...' : 'Loading feature toggles...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Settings className="w-8 h-8" />
            Feature Management
          </h1>
          <p className="text-white/70">Control system features and role-based access permissions</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={resetChanges} icon={RotateCcw} disabled={Object.keys(localChanges).length === 0}>
            Refresh Features
          </Button>
          <Button onClick={refreshFeatures} icon={RefreshCw}>
            Refresh from Database
          </Button>
        </div>
      </div>

      {/* Feature Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Features"
          value={featureStats.total}
          icon={Settings}
          color="from-blue-500 to-cyan-600"
        />
        <StatsCard
          title="Enabled"
          value={featureStats.enabled}
          icon={Eye}
          color="from-green-500 to-emerald-600"
        />
        <StatsCard
          title="Disabled"
          value={featureStats.disabled}
          icon={EyeOff}
          color="from-red-500 to-pink-600"
        />
        <StatsCard
          title="Categories"
          value={categories.length}
          icon={Settings}
          color="from-purple-500 to-indigo-600"
        />
      </div>

      {/* Category Filter and Bulk Actions */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <label className="text-white font-medium">Filter by Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Categories ({localFeatures.length})</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({localFeatures.filter(f => f.category === category.id).length})
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="glass"
              onClick={() => handleBulkAction('enable')}
              icon={Eye}
            >
              Enable All
            </Button>
            <Button
              variant="outline"
              onClick={() => handleBulkAction('disable')}
              icon={EyeOff}
            >
              Disable All
            </Button>
          </div>
        </div>
      </div>

      {/* Feature Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map(category => {
          const categoryFeatures = localFeatures.filter(f => f.category === category.id);
          const enabledCount = categoryFeatures.filter(f => f.enabled).length;
          const Icon = category.icon;
          
          return (
            <div key={category.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent-orange rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{category.name}</h3>
                  <p className="text-white/60 text-sm">{enabledCount}/{categoryFeatures.length} enabled</p>
                </div>
              </div>
              <p className="text-white/70 text-sm mb-4">{category.description}</p>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${categoryFeatures.length > 0 ? (enabledCount / categoryFeatures.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Toggles List */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Feature Controls</h2>
        </div>
        
        <div className="divide-y divide-white/10">
          {filteredFeatures.map((feature) => {
            const Icon = getFeatureIcon(feature.feature_name);
            const isBeingSaved = savingFeatures.has(feature.feature_name);
            
            return (
              <div key={feature.id} className={`p-6 hover:bg-white/5 transition-colors ${isBeingSaved ? 'bg-blue-500/5 border-l-4 border-blue-500' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white font-medium capitalize">
                          {feature.feature_name.replace(/_/g, ' ')}
                        </h3>
                        {isBeingSaved && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                            Saving...
                          </span>
                        )}
                        {feature.updated_at && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                            Updated {new Date(feature.updated_at).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                      <p className="text-white/60 text-sm">{feature.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-white/50 text-xs">Category:</span>
                        <span className="px-2 py-1 bg-white/10 text-white/80 rounded text-xs capitalize">
                          {feature.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Role Permissions */}
                    <div className="text-right">
                      <p className="text-white/70 text-sm mb-2">Allowed Roles</p>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {availableRoles.map(role => (
                          <label key={role} className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={feature.role_permissions.includes(role)}
                              onChange={(e) => {
                                const newPermissions = e.target.checked
                                  ? [...feature.role_permissions, role]
                                  : feature.role_permissions.filter(r => r !== role);
                                handleUpdateRolePermissions(feature.feature_name, newPermissions);
                              }}
                              disabled={isBeingSaved}
                              className="w-3 h-3 text-primary bg-white/10 border-white/20 rounded focus:ring-primary/50"
                            />
                            <span className="text-white/80 text-xs capitalize">{role}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Enable/Disable Toggle */}
                    <div className="text-center">
                      <p className="text-white/70 text-sm mb-2">Status</p>
                      <button
                        onClick={() => handleToggleFeature(feature.feature_name)}
                        disabled={savingFeatures.has(feature.feature_name)}
                        className={`w-16 h-8 rounded-full transition-colors relative ${
                          feature.enabled ? 'bg-primary' : 'bg-white/20'
                        } ${savingFeatures.has(feature.feature_name) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {savingFeatures.has(feature.feature_name) && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <RefreshCw className="w-4 h-4 text-white animate-spin" />
                          </div>
                        )}
                        <div className={`w-7 h-7 bg-white rounded-full transition-transform absolute top-0.5 ${
                          feature.enabled ? 'translate-x-8' : 'translate-x-0.5'
                        }`} />
                      </button>
                      <p className={`text-xs mt-1 ${feature.enabled ? 'text-green-300' : 'text-red-300'}`}>
                        {feature.enabled ? 'Enabled' : 'Disabled'}
                      </p>
                      {savingFeatures.has(feature.feature_name) && (
                        <p className="text-xs text-blue-300 mt-1">Saving...</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Impact Warning */}
      {savingFeatures.size > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <h4 className="text-yellow-300 font-medium mb-1">Features Being Updated</h4>
              <p className="text-yellow-200/80 text-sm">
                {savingFeatures.size} feature(s) are being updated. Changes are applied immediately to the database.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* System Health Check */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-6">System Health Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Critical Features Status</h3>
            <div className="space-y-3">
              {localFeatures.filter(f => ['member_management', 'payment_system', 'attendance_tracking'].includes(f.feature_name)).map(feature => {
                return (
                  <div key={feature.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white/80 text-sm capitalize">{feature.feature_name.replace(/_/g, ' ')}</span>
                    <div className={`w-3 h-3 rounded-full ${feature.enabled ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-4">Feature Distribution</h3>
            <div className="space-y-3">
              {categories.map(category => {
                const categoryFeatures = localFeatures.filter(f => f.category === category.id);
                const enabledCount = categoryFeatures.filter(f => f.enabled).length;
                
                return (
                  <div key={category.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <category.icon className="w-4 h-4 text-primary" />
                      <span className="text-white/80 text-sm">{category.name}</span>
                    </div>
                    <span className="text-white text-sm">{enabledCount}/{categoryFeatures.length}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureManagement;
