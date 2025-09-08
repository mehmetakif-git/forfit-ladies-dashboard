import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Wifi,
  WifiOff,
  Settings
} from 'lucide-react';
import { supabase, testSupabaseConnection, getConnectionStatus, getLastTestResult } from '../lib/supabase';
import Button from './UI/Button';
import toast from 'react-hot-toast';

interface ConnectionTestProps {
  showDetails?: boolean;
  onStatusChange?: (status: string) => void;
}

const ConnectionTest: React.FC<ConnectionTestProps> = ({ 
  showDetails = false, 
  onStatusChange 
}) => {
  const [status, setStatus] = useState(getConnectionStatus());
  const [testResult, setTestResult] = useState(getLastTestResult());
  const [isExpanded, setIsExpanded] = useState(showDetails);
  const [isTesting, setIsTesting] = useState(false);
  const [envVars, setEnvVars] = useState({
    url: !!import.meta.env.VITE_SUPABASE_URL,
    key: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    urlValue: import.meta.env.VITE_SUPABASE_URL || '',
    keyValue: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const currentStatus = getConnectionStatus();
      const currentResult = getLastTestResult();
      
      if (currentStatus !== status) {
        setStatus(currentStatus);
        onStatusChange?.(currentStatus);
      }
      
      if (currentResult.timestamp !== testResult.timestamp) {
        setTestResult(currentResult);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status, testResult, onStatusChange]);

  const runConnectionTest = async () => {
    setIsTesting(true);
    try {
      const result = await testSupabaseConnection();
      setTestResult(result);
      setStatus(getConnectionStatus());
      
      if (result.success) {
        toast.success('Connection test passed!');
      } else {
        toast.error('Connection test failed');
      }
    } catch (error) {
      console.error('Connection test error:', error);
      toast.error('Connection test failed');
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'disconnected':
        return <WifiOff className="w-5 h-5 text-gray-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'testing':
        return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'disconnected':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'testing':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    }
  };

  if (!showDetails && !isExpanded) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor()}`}>
            {status}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(true)}
          className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Database className="w-5 h-5" />
          Database Connection Status
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor()}`}>
              {status}
            </span>
          </div>
          <Button
            variant="glass"
            size="sm"
            onClick={runConnectionTest}
            disabled={isTesting}
            icon={RefreshCw}
          >
            Test
          </Button>
          {!showDetails && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* Environment Variables Check */}
          <div>
            <h4 className="text-white font-medium mb-3">Environment Variables</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white/80 text-sm">VITE_SUPABASE_URL</span>
                <div className="flex items-center gap-2">
                  {envVars.url ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-xs ${envVars.url ? 'text-green-300' : 'text-red-300'}`}>
                    {envVars.url ? 'Set' : 'Missing'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white/80 text-sm">VITE_SUPABASE_ANON_KEY</span>
                <div className="flex items-center gap-2">
                  {envVars.key ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-xs ${envVars.key ? 'text-green-300' : 'text-red-300'}`}>
                    {envVars.key ? 'Set' : 'Missing'}
                  </span>
                </div>
              </div>
            </div>
            
            {envVars.url && (
              <div className="mt-3 p-3 bg-white/5 rounded-lg">
                <p className="text-white/70 text-sm">Supabase URL:</p>
                <p className="text-white/90 text-xs font-mono break-all">{envVars.urlValue}</p>
              </div>
            )}
          </div>

          {/* Connection Test Results */}
          <div>
            <h4 className="text-white font-medium mb-3">Connection Test Results</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white/80 text-sm">Last Test</span>
                <span className="text-white text-sm">
                  {testResult.timestamp > 0 
                    ? new Date(testResult.timestamp).toLocaleTimeString()
                    : 'Never'
                  }
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white/80 text-sm">Response Time</span>
                <span className="text-white text-sm">
                  {testResult.responseTime ? `${testResult.responseTime}ms` : 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white/80 text-sm">Status</span>
                <span className={`text-sm ${testResult.success ? 'text-green-300' : 'text-red-300'}`}>
                  {testResult.success ? 'Connected' : 'Failed'}
                </span>
              </div>
              
              {testResult.error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-300 text-sm font-medium mb-1">Error Details:</p>
                  <p className="text-red-200/80 text-xs font-mono">{testResult.error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Database Tables Check */}
          <div>
            <h4 className="text-white font-medium mb-3">Database Tables</h4>
            <div className="space-y-2">
              {[
                'settings',
                'app_settings',
                'members', 
                'payments',
                'attendance_records',
                'subscription_plans',
                'feature_toggles'
              ].map(table => (
                <div key={table} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white/80 text-sm">{table}</span>
                  <div className="flex items-center gap-2">
                    {status === 'connected' ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    )}
                    <span className={`text-xs ${
                      status === 'connected' ? 'text-green-300' : 'text-yellow-300'
                    }`}>
                      {status === 'connected' ? 'Available' : 'Unknown'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Troubleshooting */}
          {status !== 'connected' && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <h4 className="text-yellow-300 font-medium mb-2">Troubleshooting</h4>
              <ul className="text-yellow-200/80 text-sm space-y-1">
                <li>• Check if environment variables are properly set</li>
                <li>• Verify Supabase project is active and accessible</li>
                <li>• Ensure network connectivity is available</li>
                <li>• Check if RLS policies allow access</li>
                <li>• Verify API keys have correct permissions</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectionTest;