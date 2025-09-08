import React, { useState } from 'react';
import { Palette, Save, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/UI/Button';
import FormField from '../components/UI/FormField';
import Breadcrumb from '../components/UI/Breadcrumb';
import LogoUpload from '../components/UI/LogoUpload';
import FaviconUpload from '../components/UI/FaviconUpload';
import toast from 'react-hot-toast';

const AdminPanel: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const [localSettings, setLocalSettings] = useState(settings);

  const colorPresets = [
    {
      name: 'Pink Passion',
      colors: { primary: '#DC2684', secondary: '#523A7A', accentGold: '#FAD45B', accentOrange: '#F19F67' }
    },
    {
      name: 'Purple Dreams',
      colors: { primary: '#8B5CF6', secondary: '#5B21B6', accentGold: '#F59E0B', accentOrange: '#EF4444' }
    },
    {
      name: 'Ocean Breeze',
      colors: { primary: '#0EA5E9', secondary: '#0369A1', accentGold: '#F59E0B', accentOrange: '#06B6D4' }
    },
    {
      name: 'Forest Green',
      colors: { primary: '#10B981', secondary: '#047857', accentGold: '#F59E0B', accentOrange: '#F97316' }
    },
  ];

  const handleColorChange = (colorKey: string, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        [colorKey]: value,
      },
    }));
  };

  const applyPreset = (preset: typeof colorPresets[0]) => {
    setLocalSettings(prev => ({
      ...prev,
      theme: preset.colors,
    }));
    toast.success(`Applied ${preset.name} color scheme!`);
  };

  const saveSettings = () => {
    updateSettings(localSettings);
    toast.success('Saving settings...');
  };

  const resetToDefault = () => {
    const defaultTheme = {
      primary: '#DC2684',
      secondary: '#523A7A',
      accentGold: '#FAD45B',
      accentOrange: '#F19F67',
    };
    setLocalSettings(prev => ({ ...prev, theme: defaultTheme, logo: undefined }));
    toast.success('Reset to default theme!');
  };

  const handleLogoChange = (logo: string | null) => {
    setLocalSettings(prev => ({ ...prev, logo: logo || undefined }));
  };

  const handleFaviconChange = (favicon: string | null) => {
    setLocalSettings(prev => ({ ...prev, favicon: favicon || undefined }));
  };

  return (
    <div className="p-6 space-y-8">
      <Breadcrumb />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-white/70">Customize your studio's branding and appearance</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={resetToDefault} icon={RotateCcw}>
            Reset
          </Button>
          <Button onClick={saveSettings} icon={Save}>
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Studio Branding */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Studio Branding
          </h2>
          
          <div className="space-y-6">
            <FormField
              label="Studio Name"
              value={localSettings.studioName}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, studioName: e.target.value }))}
            />

            <LogoUpload
              currentLogo={localSettings.logo}
              onLogoChange={handleLogoChange}
            />

            <FaviconUpload
              currentFavicon={localSettings.favicon}
              onFaviconChange={handleFaviconChange}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Currency</label>
                <select
                  value={localSettings.currency}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="USD" className="bg-secondary">USD ($)</option>
                  <option value="EUR" className="bg-secondary">EUR (€)</option>
                  <option value="QAR" className="bg-secondary">QAR (QR)</option>
                  <option value="AED" className="bg-secondary">AED (د.إ)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Language</label>
                <select
                  value={localSettings.language}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, language: e.target.value as 'en' | 'ar' }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="en" className="bg-secondary">English</option>
                  <option value="ar" className="bg-secondary">العربية</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Color Customization */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Color Theme
          </h2>
          
          <div className="space-y-6">
            {/* Color Presets */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-3">Quick Presets</label>
              <div className="grid grid-cols-2 gap-3">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="p-3 bg-white/5 rounded-lg border border-white/20 hover:bg-white/10 transition-colors text-left"
                  >
                    <div className="flex gap-2 mb-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: preset.colors.primary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: preset.colors.secondary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: preset.colors.accentGold }}
                      />
                    </div>
                    <p className="text-white text-sm font-medium">{preset.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-white/90">Custom Colors</label>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/70 mb-1">Primary</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={localSettings.theme.primary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="w-12 h-10 rounded-lg border border-white/20"
                    />
                    <input
                      type="text"
                      value={localSettings.theme.primary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs text-white/70 mb-1">Secondary</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={localSettings.theme.secondary}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="w-12 h-10 rounded-lg border border-white/20"
                    />
                    <input
                      type="text"
                      value={localSettings.theme.secondary}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs text-white/70 mb-1">Accent Gold</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={localSettings.theme.accentGold}
                      onChange={(e) => handleColorChange('accentGold', e.target.value)}
                      className="w-12 h-10 rounded-lg border border-white/20"
                    />
                    <input
                      type="text"
                      value={localSettings.theme.accentGold}
                      onChange={(e) => handleColorChange('accentGold', e.target.value)}
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs text-white/70 mb-1">Accent Orange</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={localSettings.theme.accentOrange}
                      onChange={(e) => handleColorChange('accentOrange', e.target.value)}
                      className="w-12 h-10 rounded-lg border border-white/20"
                    />
                    <input
                      type="text"
                      value={localSettings.theme.accentOrange}
                      onChange={(e) => handleColorChange('accentOrange', e.target.value)}
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-6">Live Preview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-3">
            <div 
              className="h-16 rounded-lg flex items-center justify-center text-white font-semibold"
              style={{ background: `linear-gradient(135deg, ${localSettings.theme.primary}, ${localSettings.theme.secondary})` }}
            >
              Primary Gradient
            </div>
            <div 
              className="h-12 rounded-lg flex items-center justify-center text-white text-sm"
              style={{ backgroundColor: localSettings.theme.primary }}
            >
              Primary Color
            </div>
          </div>
          
          <div className="space-y-3">
            <div 
              className="h-16 rounded-lg flex items-center justify-center text-white font-semibold"
              style={{ background: `linear-gradient(135deg, ${localSettings.theme.accentGold}, ${localSettings.theme.accentOrange})` }}
            >
              Accent Gradient
            </div>
            <div 
              className="h-12 rounded-lg flex items-center justify-center text-white text-sm"
              style={{ backgroundColor: localSettings.theme.secondary }}
            >
              Secondary Color
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="h-16 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 flex items-center justify-center text-white font-semibold">
              Glass Effect
            </div>
            <div className="flex gap-2">
              <div 
                className="flex-1 h-12 rounded-lg flex items-center justify-center text-white text-sm"
                style={{ backgroundColor: localSettings.theme.accentGold }}
              >
                Gold
              </div>
              <div 
                className="flex-1 h-12 rounded-lg flex items-center justify-center text-white text-sm"
                style={{ backgroundColor: localSettings.theme.accentOrange }}
              >
                Orange
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Studio Information */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-6">Studio Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Studio Address"
            placeholder="Al Bidda Park"
            defaultValue="Al Bidda Park"
          />
          
          <FormField
            label="Contact Phone"
            placeholder="+974 555-FORFIT"
            defaultValue="+974 555-FORFIT"
          />
          
          <FormField
            label="Email"
            type="email"
            placeholder="info@forfitladies.com"
            defaultValue="info@forfitladies.com"
          />
          
          <FormField
            label="Website"
            placeholder="https://forfit.qa"
            defaultValue="https://forfit.qa"
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-white/90 mb-2">
            Studio Description
          </label>
          <textarea
            rows={4}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            placeholder="Describe your studio's mission and services..."
            defaultValue="Forfit Ladies is a premium women-only fitness studio dedicated to empowering women through health and wellness. Our state-of-the-art facilities and expert trainers provide a supportive environment for women of all fitness levels."
          />
        </div>
      </div>

      {/* Business Hours */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-6">Business Hours</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
            <div key={day} className="flex items-center gap-4">
              <label className="w-20 text-white font-medium">{day}</label>
              <input
                type="time"
                defaultValue="06:00"
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <span className="text-white/70">to</span>
              <input
                type="time"
                defaultValue={day === 'Sunday' ? '18:00' : '22:00'}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;