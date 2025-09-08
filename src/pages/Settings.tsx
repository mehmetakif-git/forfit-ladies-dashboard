import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Database, Globe, Download, CreditCard, Save, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { mockSubscriptionPlans } from '../mocks/subscriptions';
import { SubscriptionPlan } from '../types';
import Button from '../components/UI/Button';
import FormField from '../components/UI/FormField';
import Breadcrumb from '../components/UI/Breadcrumb';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(
    settings.subscriptionPlans || mockSubscriptionPlans
  );
  const [notifications, setNotifications] = useState({
    newMembers: true,
    paymentReminders: true,
    expiringSubscriptions: true,
    dailySummary: false,
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: 30,
  });

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success('Notification settings updated!');
  };

  const handleSecurityToggle = (key: keyof typeof security) => {
    setSecurity(prev => ({
      ...prev,
      [key]: typeof prev[key] === 'boolean' ? !prev[key] : prev[key],
    }));
    toast.success('Security settings updated!');
  };

  const exportData = () => {
    toast.success('Data export initiated! Download will begin shortly.');
  };

  const backupData = () => {
    toast.success('Backup created successfully!');
  };

  const availableFeatures = [
    'Gym Access (24/7)',
    'Gym Access (Limited Hours)',
    'All Group Classes',
    'Basic Group Classes',
    'Locker Access',
    'Premium Locker',
    'Guest Passes (2/month)',
    'Guest Passes (5/month)',
    'Personal Training Sessions',
    'Unlimited Personal Training',
    'Nutrition Consultation',
    'Priority Class Booking',
    'Spa Access',
    'Private Training Area',
    'Complimentary Supplements',
    'Mobile App Access',
    'Meal Planning',
    'Wellness Assessments',
  ];

  const updatePlan = (planId: string, updates: Partial<SubscriptionPlan>) => {
    setSubscriptionPlans(prev => prev.map(plan => 
      plan.id === planId ? { ...plan, ...updates } : plan
    ));
  };

  const togglePlanFeature = (planId: string, feature: string) => {
    setSubscriptionPlans(prev => prev.map(plan => {
      if (plan.id === planId) {
        const features = plan.features.includes(feature)
          ? plan.features.filter(f => f !== feature)
          : [...plan.features, feature];
        return { ...plan, features };
      }
      return plan;
    }));
  };

  const savePlans = () => {
    updateSubscriptionPlans(subscriptionPlans);
    toast.success('Subscription plans updated successfully!');
  };

  const resetPlans = () => {
    // Reset to default plans from database
    window.location.reload();
    toast.success('Plans reset to default!');
  };

  return (
    <div className="p-6 space-y-8">
      <Breadcrumb />
      
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-white/70">Configure your studio management system</p>
      </div>

      {/* General Settings */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5" />
          General Settings
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Time Zone</label>
            <select
              value={settings.timezone}
              onChange={(e) => updateSettings({ timezone: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="UTC" className="bg-secondary">UTC</option>
              <option value="America/New_York" className="bg-secondary">Eastern Time</option>
              <option value="America/Chicago" className="bg-secondary">Central Time</option>
              <option value="America/Denver" className="bg-secondary">Mountain Time</option>
              <option value="America/Los_Angeles" className="bg-secondary">Pacific Time</option>
              <option value="Asia/Dubai" className="bg-secondary">UAE Time</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Date Format</label>
            <select
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              defaultValue="MM/DD/YYYY"
            >
              <option value="MM/DD/YYYY" className="bg-secondary">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY" className="bg-secondary">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD" className="bg-secondary">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Preferences
        </h2>
        
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, enabled]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <p className="text-white font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </p>
                <p className="text-white/60 text-sm">
                  {key === 'newMembers' && 'Get notified when new members join'}
                  {key === 'paymentReminders' && 'Receive alerts for upcoming payment dues'}
                  {key === 'expiringSubscriptions' && 'Alert when member subscriptions are expiring'}
                  {key === 'dailySummary' && 'Daily summary of studio activity'}
                </p>
              </div>
              <button
                onClick={() => handleNotificationToggle(key as keyof typeof notifications)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  enabled ? 'bg-primary' : 'bg-white/20'
                } relative`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  enabled ? 'translate-x-6' : 'translate-x-0.5'
                } absolute top-0.5`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Security & Privacy
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <p className="text-white font-medium">Two-Factor Authentication</p>
              <p className="text-white/60 text-sm">Add an extra layer of security to your account</p>
            </div>
            <button
              onClick={() => handleSecurityToggle('twoFactorAuth')}
              className={`w-12 h-6 rounded-full transition-colors ${
                security.twoFactorAuth ? 'bg-primary' : 'bg-white/20'
              } relative`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                security.twoFactorAuth ? 'translate-x-6' : 'translate-x-0.5'
              } absolute top-0.5`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <p className="text-white font-medium">Login Alerts</p>
              <p className="text-white/60 text-sm">Get notified of new login attempts</p>
            </div>
            <button
              onClick={() => handleSecurityToggle('loginAlerts')}
              className={`w-12 h-6 rounded-full transition-colors ${
                security.loginAlerts ? 'bg-primary' : 'bg-white/20'
              } relative`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                security.loginAlerts ? 'translate-x-6' : 'translate-x-0.5'
              } absolute top-0.5`} />
            </button>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <label className="block text-white font-medium mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              value={security.sessionTimeout}
              onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
              className="w-32 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              min="5"
              max="120"
            />
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Data Management
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Export & Backup</h3>
            <div className="space-y-3">
              <Button variant="outline" onClick={exportData} icon={Download} className="w-full">
                Export All Data (CSV)
              </Button>
              <Button variant="outline" onClick={backupData} icon={Database} className="w-full">
                Create Backup
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Data Retention</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-white/80 text-sm mb-1">Keep attendance records for</label>
                <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="6" className="bg-secondary">6 months</option>
                  <option value="12" className="bg-secondary">12 months</option>
                  <option value="24" className="bg-secondary">24 months</option>
                  <option value="0" className="bg-secondary">Forever</option>
                </select>
              </div>
              
              <div>
                <label className="block text-white/80 text-sm mb-1">Keep payment records for</label>
                <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="12" className="bg-secondary">12 months</option>
                  <option value="24" className="bg-secondary">24 months</option>
                  <option value="60" className="bg-secondary">5 years</option>
                  <option value="0" className="bg-secondary">Forever</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Plans Management */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Subscription Plans Management
          </h2>
          <div className="flex gap-3">
            <Button variant="outline" onClick={resetPlans} icon={Trash2}>
              Reset to Default
            </Button>
            <Button onClick={savePlans} icon={Save}>
              Save Plans
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {subscriptionPlans.map((plan) => (
            <div key={plan.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">{plan.name} Plan Settings</h3>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={plan.enabled !== false}
                    onChange={(e) => updatePlan(plan.id, { enabled: e.target.checked })}
                    className="w-4 h-4 text-primary bg-white/10 border-white/20 rounded focus:ring-primary/50"
                  />
                  <span className="text-white/80">Enable Plan</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Plan Name</label>
                  <input
                    type="text"
                    value={plan.name}
                    onChange={(e) => updatePlan(plan.id, { name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Monthly Price ($)</label>
                  <input
                    type="number"
                    value={plan.price}
                    onChange={(e) => updatePlan(plan.id, { price: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Promotional Price ($)</label>
                  <input
                    type="number"
                    value={plan.promotionalPrice || ''}
                    onChange={(e) => updatePlan(plan.id, { promotionalPrice: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Optional"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Sessions per Month</label>
                  <input
                    type="number"
                    value={plan.sessions || ''}
                    onChange={(e) => updatePlan(plan.id, { sessions: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Unlimited if empty"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={plan.popular || false}
                      onChange={(e) => updatePlan(plan.id, { popular: e.target.checked })}
                      className="w-4 h-4 text-primary bg-white/10 border-white/20 rounded focus:ring-primary/50"
                    />
                    <span className="text-white/80">Mark as Popular</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-3">Included Features</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableFeatures.map((feature) => (
                    <label key={feature} className="flex items-center gap-2 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="checkbox"
                        checked={plan.features.includes(feature)}
                        onChange={() => togglePlanFeature(plan.id, feature)}
                        className="w-4 h-4 text-primary bg-white/10 border-white/20 rounded focus:ring-primary/50"
                      />
                      <span className="text-white/80 text-sm">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Plan Preview */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="text-sm font-medium text-white/90 mb-3">Plan Preview</h4>
                <div className="bg-white/5 rounded-lg p-4 max-w-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-white font-semibold">{plan.name}</h5>
                    {plan.popular && <span className="text-xs bg-primary px-2 py-1 rounded-full text-white">Popular</span>}
                  </div>
                  <div className="mb-3">
                    {plan.promotionalPrice ? (
                      <div>
                        <span className="text-2xl font-bold text-white">${plan.promotionalPrice}</span>
                        <span className="text-white/60 line-through ml-2">${plan.price}</span>
                        <span className="text-white/60">/month</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-2xl font-bold text-white">${plan.price}</span>
                        <span className="text-white/60">/month</span>
                      </div>
                    )}
                  </div>
                  <div className="text-white/70 text-sm">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 mb-1">
                        <div className="w-1 h-1 bg-primary rounded-full"></div>
                        {feature}
                      </div>
                    ))}
                    {plan.features.length > 3 && (
                      <div className="text-white/50 text-xs mt-2">
                        +{plan.features.length - 3} more features
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Language & Localization */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Language & Localization
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Interface Language</label>
            <select
              value={settings.language}
              onChange={(e) => updateSettings({ language: e.target.value as 'en' | 'ar' })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="en" className="bg-secondary">English</option>
              <option value="ar" className="bg-secondary">العربية (Arabic)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => updateSettings({ currency: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="USD" className="bg-secondary">USD ($)</option>
              <option value="EUR" className="bg-secondary">EUR (€)</option>
              <option value="GBP" className="bg-secondary">GBP (£)</option>
              <option value="AED" className="bg-secondary">AED (د.إ)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Number Format</label>
            <select
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              defaultValue="1,234.56"
            >
              <option value="1,234.56" className="bg-secondary">1,234.56</option>
              <option value="1.234,56" className="bg-secondary">1.234,56</option>
              <option value="1 234,56" className="bg-secondary">1 234,56</option>
            </select>
          </div>
        </div>
      </div>

      {/* Typewriter Effects */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-6">Typewriter Effects</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <p className="text-white font-medium">Typing Glow Effect</p>
              <p className="text-white/60 text-sm">Show animated gradient border while typing</p>
            </div>
            <button
              onClick={() => updateSettings({ typingGlowEnabled: !settings.typingGlowEnabled })}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.typingGlowEnabled !== false ? 'bg-primary' : 'bg-white/20'
              } relative`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                settings.typingGlowEnabled !== false ? 'translate-x-6' : 'translate-x-0.5'
              } absolute top-0.5`} />
            </button>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-6">System Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/70">App Version</span>
              <span className="text-white font-medium">v2.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Last Backup</span>
              <span className="text-white font-medium">Dec 20, 2024</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Database Size</span>
              <span className="text-white font-medium">2.4 MB</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/70">Total Members</span>
              <span className="text-white font-medium">127</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Total Payments</span>
              <span className="text-white font-medium">542</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Attendance Records</span>
              <span className="text-white font-medium">1,238</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-white/10 flex gap-3">
          <Button variant="outline" onClick={exportData} icon={Download}>
            Export Data
          </Button>
          <Button variant="outline" onClick={backupData} icon={Database}>
            Create Backup
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;