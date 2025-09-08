import React, { useState } from 'react';
import { Settings, Shield, Users, DollarSign, BarChart3, MessageCircle, Calendar, TestTube, Palette, Save, RotateCcw, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useAllFeatureToggles, updateFeatureToggle } from '../hooks/useFeatureToggle';
import { useAuth } from '../context/AuthContext';
import Button from '../components/UI/Button';
import Breadcrumb from '../components/UI/Breadcrumb';
import StatsCard from '../components/UI/StatsCard';
import toast from 'react-hot-toast';

interface FeatureCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
}

const FeatureManagement: React.FC = () => {
  const { user } = useAuth();
  const { features, loading } = useAllFeatureToggles();
  const [localChanges, setLocalChanges] = useState<Record<string, { enabled: boolean; rolePermissions: string[] }>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [bulkAction, setBulkAction] = useState<'enable' | 'disable' | null>(null);
  const [savingFeatures, setSavingFeatures] = useState<Set<string>>(new Set());

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
    ? features 
    : features.filter(f => f.category === selectedCategory);

  const getFeatureState = (featureName: string) => {
    return localChanges[featureName] || {
      enabled: features.find(f => f.feature_name === featureName)?.enabled || false,
      rolePermissions: features.find(f => f.feature_name === featureName)?.role_permissions || []
    };
  };

  const updateLocalFeature = (featureName: string, updates: Partial<{ enabled: boolean; rolePermissions: string[] }>) => {
    setLocalChanges(prev => ({
      ...prev,
      [featureName]: {
        ...getFeatureState(featureName),
        ...updates
      }
    }));
  };

  const handleToggleFeature = async (featureName: string) => {
    const currentState = getFeatureState(featureName);
    const newEnabled = !currentState.enabled;
    
    setSavingFeatures(prev => new Set([...prev, featureName]));
    
    try {
      const success = await updateFeatureToggle(featureName, newEnabled, currentState.rolePermissions);
      
      if (success) {
        updateLocalFeature(featureName, { enabled: newEnabled });
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
  const saveChanges = async () => {
    const changes = Object.entries(localChanges);
    if (changes.length === 0) {
      toast.error('No changes to save');
      return;
    }

    let successCount = 0;
    for (const [featureName, state] of changes) {
      const success = await updateFeatureToggle(featureName, state.enabled, state.rolePermissions);
      if (success) successCount++;
    }

    if (successCount === changes.length) {
      toast.success(`${successCount} features updated successfully!`);
      setLocalChanges({});
      window.location.reload(); // Refresh to apply changes
    } else {
      toast.error(`${successCount}/${changes.length} features updated. Some changes failed.`);
    }
  };

  const resetChanges = () => {
    setLocalChanges({});
    toast.success('Changes reset');
  };

  const handleBulkAction = async (action: 'enable' | 'disable') => {
    const targetFeatures = selectedCategory === 'all' ? features : features.filter(f => f.category === selectedCategory);
    
    for (const feature of targetFeatures) {
      updateLocalFeature(feature.feature_name, { enabled: action === 'enable' });
    }
    
    toast.success(`${targetFeatures.length} features ${action}d`);
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
    total: features.length,
    enabled: features.filter(f => getFeatureState(f.feature_name).enabled).length,
    disabled: features.filter(f => !getFeatureState(f.feature_name).enabled).length,
    pendingChanges: Object.keys(localChanges).length
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading feature toggles...</p>
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
            Reset Changes
          </Button>
          <Button onClick={saveChanges} icon={Save} disabled={Object.keys(localChanges).length === 0}>
            Save Changes ({Object.keys(localChanges).length})
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
          title="Pending Changes"
          value={featureStats.pendingChanges}
          icon={Save}
          color="from-yellow-500 to-orange-600"
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
              <option value="all">All Categories ({features.length})</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({features.filter(f => f.category === category.id).length})
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
          const categoryFeatures = features.filter(f => f.category === category.id);
          const enabledCount = categoryFeatures.filter(f => getFeatureState(f.feature_name).enabled).length;
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
            const state = getFeatureState(feature.feature_name);
            const Icon = getFeatureIcon(feature.feature_name);
            const hasChanges = localChanges[feature.feature_name];
            
            return (
              <div key={feature.id} className={`p-6 hover:bg-white/5 transition-colors ${hasChanges ? 'bg-yellow-500/5 border-l-4 border-yellow-500' : ''}`}>
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
                        {hasChanges && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">
                            Modified
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
                              checked={state.rolePermissions.includes(role)}
                              onChange={(e) => {
                                const newPermissions = e.target.checked
                                  ? [...state.rolePermissions, role]
                                  : state.rolePermissions.filter(r => r !== role);
                                updateLocalFeature(feature.feature_name, { rolePermissions: newPermissions });
                              }}
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
                          state.enabled ? 'bg-primary' : 'bg-white/20'
                        } ${savingFeatures.has(feature.feature_name) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {savingFeatures.has(feature.feature_name) && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <RefreshCw className="w-4 h-4 text-white animate-spin" />
                          </div>
                        )}
                        <div className={`w-7 h-7 bg-white rounded-full transition-transform absolute top-0.5 ${
                          state.enabled ? 'translate-x-8' : 'translate-x-0.5'
                        }`} />
                      </button>
                      <p className={`text-xs mt-1 ${state.enabled ? 'text-green-300' : 'text-red-300'}`}>
                        {state.enabled ? 'Enabled' : 'Disabled'}
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
      {Object.keys(localChanges).length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <h4 className="text-yellow-300 font-medium mb-1">Feature Changes Pending</h4>
              <p className="text-yellow-200/80 text-sm">
                You have {Object.keys(localChanges).length} unsaved changes. Disabling features may affect user access and system functionality. 
                Save changes to apply them system-wide.
              </p>
              <div className="mt-3 space-y-1">
                {Object.entries(localChanges).map(([featureName, state]) => (
                  <div key={featureName} className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${state.enabled ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className="text-yellow-200/90 capitalize">
                      {featureName.replace(/_/g, ' ')}: {state.enabled ? 'Enable' : 'Disable'}
                    </span>
                  </div>
                ))}
              </div>
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
              {features.filter(f => ['member_management', 'payment_system', 'attendance_tracking'].includes(f.feature_name)).map(feature => {
                const state = getFeatureState(feature.feature_name);
                return (
                  <div key={feature.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white/80 text-sm capitalize">{feature.feature_name.replace(/_/g, ' ')}</span>
                    <div className={`w-3 h-3 rounded-full ${state.enabled ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-4">Feature Distribution</h3>
            <div className="space-y-3">
              {categories.map(category => {
                const categoryFeatures = features.filter(f => f.category === category.id);
                const enabledCount = categoryFeatures.filter(f => getFeatureState(f.feature_name).enabled).length;
                
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
