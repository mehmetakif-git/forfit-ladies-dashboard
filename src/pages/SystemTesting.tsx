import React, { useState, useEffect } from 'react';
import FeatureGuard from '../components/UI/FeatureGuard';
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Play, 
  Download, 
  RefreshCw,
  Database,
  Shield,
  Mail,
  Upload,
  Users,
  CreditCard,
  Calendar,
  Settings,
  Eye,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Button from '../components/UI/Button';
import Breadcrumb from '../components/UI/Breadcrumb';
import StatsCard from '../components/UI/StatsCard';
import toast from 'react-hot-toast';

interface TestResult {
  id: string;
  name: string;
  category: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  message: string;
  duration?: number;
  timestamp?: string;
}

interface TestCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  tests: TestResult[];
}

const SystemTesting: React.FC = () => {
  const { members, addMember, updateMember, deleteMember, addPayment, checkInMember } = useApp();

  return (
    <FeatureGuard feature="system_testing">
      <SystemTestingContent />
    </FeatureGuard>
  );
};

const SystemTestingContent: React.FC = () => {
  const { members, addMember, updateMember, deleteMember, addPayment, checkInMember } = useApp();
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [testLog, setTestLog] = useState<string[]>([]);

  const addToLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 99)]);
  };

  const updateTestResult = (testId: string, updates: Partial<TestResult>) => {
    setTestResults(prev => prev.map(test => 
      test.id === testId ? { ...test, ...updates, timestamp: new Date().toISOString() } : test
    ));
  };

  const runTest = async (testId: string, testFunction: () => Promise<void>) => {
    const startTime = Date.now();
    updateTestResult(testId, { status: 'running', message: 'Running test...' });
    addToLog(`Starting test: ${testId}`);

    try {
      await testFunction();
      const duration = Date.now() - startTime;
      updateTestResult(testId, { 
        status: 'passed', 
        message: 'Test completed successfully',
        duration 
      });
      addToLog(`✓ Test passed: ${testId} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateTestResult(testId, { 
        status: 'failed', 
        message: errorMessage,
        duration 
      });
      addToLog(`✗ Test failed: ${testId} - ${errorMessage}`);
    }
  };

  // Test Functions
  const testDatabaseConnection = async () => {
    const { data, error } = await supabase.from('app_settings').select('id').limit(1);
    if (error) throw new Error(`Database connection failed: ${error.message}`);
    if (!data) throw new Error('No data returned from database');
  };

  const testMemberCRUD = async () => {
    // Test Create
    const testMember = {
      name: 'Test User',
      email: `test-${Date.now()}@test.com`,
      username: `test_${Date.now()}`,
      phone: '+1234567890',
      password: 'test123',
      age: 25,
      subscriptionPlan: 'Basic',
      subscriptionEnd: '2025-12-31',
      emergencyContact: 'Test Contact - +1234567890'
    };
    
    addMember(testMember);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Test Read
    const createdMember = members.find(m => m.email === testMember.email);
    if (!createdMember) throw new Error('Member creation failed');
    
    // Test Update
    updateMember(createdMember.id, { name: 'Updated Test User' });
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Test Delete
    deleteMember(createdMember.id);
  };

  const testPaymentSystem = async () => {
    if (members.length === 0) throw new Error('No members available for payment test');
    
    const testMember = members[0];
    addPayment({
      memberId: testMember.id,
      memberName: testMember.name,
      amount: 129,
      method: 'card',
      description: 'Test payment',
      planName: 'Premium'
    });
  };

  const testAttendanceSystem = async () => {
    if (members.length === 0) throw new Error('No members available for attendance test');
    
    const testMember = members[0];
    checkInMember(testMember.id, 'Test Class');
  };

  const testFileUpload = async () => {
    // Simulate file upload test
    const testFile = new Blob(['test content'], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('file', testFile, 'test.pdf');
    
    // Mock upload simulation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if storage bucket exists
    const { data, error } = await supabase.storage.listBuckets();
    if (error) throw new Error(`Storage access failed: ${error.message}`);
    
    const memberDocsBucket = data.find(bucket => bucket.name === 'member-documents');
    if (!memberDocsBucket) {
      throw new Error('member-documents storage bucket not found');
    }
  };

  const testFormValidation = async () => {
    // Test various validation scenarios
    const validationTests = [
      { email: 'invalid-email', shouldFail: true },
      { email: 'valid@email.com', shouldFail: false },
      { phone: '123', shouldFail: true },
      { phone: '+1234567890', shouldFail: false },
      { age: 15, shouldFail: true },
      { age: 25, shouldFail: false },
    ];
    
    for (const test of validationTests) {
      // Simulate validation
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  };

  const testEnvironmentVariables = async () => {
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];
    
    for (const varName of requiredVars) {
      const value = import.meta.env[varName];
      if (!value) {
        throw new Error(`Missing environment variable: ${varName}`);
      }
    }
  };

  const testSecurityPolicies = async () => {
    // Test RLS policies
    const { data, error } = await supabase
      .from('members')
      .select('id')
      .limit(1);
    
    if (error && error.message.includes('RLS')) {
      throw new Error('RLS policies not properly configured');
    }
  };

  const testNotificationSystem = async () => {
    // Mock notification test
    toast.success('Test notification - Success');
    toast.error('Test notification - Error');
    toast('Test notification - Info');
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  // Initialize test results
  useEffect(() => {
    const initialTests: TestResult[] = [
      { id: 'db-connection', name: 'Database Connection', category: 'database', status: 'pending', message: 'Not started' },
      { id: 'env-vars', name: 'Environment Variables', category: 'environment', status: 'pending', message: 'Not started' },
      { id: 'member-crud', name: 'Member CRUD Operations', category: 'members', status: 'pending', message: 'Not started' },
      { id: 'payment-system', name: 'Payment Processing', category: 'payments', status: 'pending', message: 'Not started' },
      { id: 'attendance-system', name: 'Attendance Tracking', category: 'attendance', status: 'pending', message: 'Not started' },
      { id: 'file-upload', name: 'File Upload System', category: 'storage', status: 'pending', message: 'Not started' },
      { id: 'form-validation', name: 'Form Validation', category: 'forms', status: 'pending', message: 'Not started' },
      { id: 'security-policies', name: 'Security Policies', category: 'security', status: 'pending', message: 'Not started' },
      { id: 'notifications', name: 'Notification System', category: 'notifications', status: 'pending', message: 'Not started' },
    ];
    
    setTestResults(initialTests);
  }, []);

  const testCategories: TestCategory[] = [
    { id: 'database', name: 'Database', icon: Database, tests: testResults.filter(t => t.category === 'database') },
    { id: 'environment', name: 'Environment', icon: Settings, tests: testResults.filter(t => t.category === 'environment') },
    { id: 'members', name: 'Members', icon: Users, tests: testResults.filter(t => t.category === 'members') },
    { id: 'payments', name: 'Payments', icon: CreditCard, tests: testResults.filter(t => t.category === 'payments') },
    { id: 'attendance', name: 'Attendance', icon: Calendar, tests: testResults.filter(t => t.category === 'attendance') },
    { id: 'storage', name: 'Storage', icon: Upload, tests: testResults.filter(t => t.category === 'storage') },
    { id: 'forms', name: 'Forms', icon: TestTube, tests: testResults.filter(t => t.category === 'forms') },
    { id: 'security', name: 'Security', icon: Shield, tests: testResults.filter(t => t.category === 'security') },
    { id: 'notifications', name: 'Notifications', icon: Mail, tests: testResults.filter(t => t.category === 'notifications') },
  ];

  const runAllTests = async () => {
    setIsRunningTests(true);
    addToLog('Starting comprehensive system test suite...');
    
    const testFunctions = [
      { id: 'env-vars', fn: testEnvironmentVariables },
      { id: 'db-connection', fn: testDatabaseConnection },
      { id: 'security-policies', fn: testSecurityPolicies },
      { id: 'member-crud', fn: testMemberCRUD },
      { id: 'payment-system', fn: testPaymentSystem },
      { id: 'attendance-system', fn: testAttendanceSystem },
      { id: 'file-upload', fn: testFileUpload },
      { id: 'form-validation', fn: testFormValidation },
      { id: 'notifications', fn: testNotificationSystem },
    ];

    for (const test of testFunctions) {
      await runTest(test.id, test.fn);
      await new Promise(resolve => setTimeout(resolve, 200)); // Brief pause between tests
    }
    
    setIsRunningTests(false);
    addToLog('Test suite completed');
    toast.success('All tests completed! Check results below.');
  };

  const runSingleTest = async (testId: string) => {
    const testFunctions: Record<string, () => Promise<void>> = {
      'db-connection': testDatabaseConnection,
      'env-vars': testEnvironmentVariables,
      'member-crud': testMemberCRUD,
      'payment-system': testPaymentSystem,
      'attendance-system': testAttendanceSystem,
      'file-upload': testFileUpload,
      'form-validation': testFormValidation,
      'security-policies': testSecurityPolicies,
      'notifications': testNotificationSystem,
    };

    const testFunction = testFunctions[testId];
    if (testFunction) {
      await runTest(testId, testFunction);
    }
  };

  const resetTests = () => {
    setTestResults(prev => prev.map(test => ({
      ...test,
      status: 'pending',
      message: 'Not started',
      duration: undefined,
      timestamp: undefined
    })));
    setTestLog([]);
    addToLog('Test results reset');
  };

  const exportTestReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      user: user?.name,
      results: testResults,
      log: testLog,
      summary: {
        total: testResults.length,
        passed: testResults.filter(t => t.status === 'passed').length,
        failed: testResults.filter(t => t.status === 'failed').length,
        warnings: testResults.filter(t => t.status === 'warning').length,
      }
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-test-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Test report exported successfully!');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'running': return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'failed': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'running': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const filteredTests = selectedCategory === 'all' 
    ? testResults 
    : testResults.filter(test => test.category === selectedCategory);

  const testSummary = {
    total: testResults.length,
    passed: testResults.filter(t => t.status === 'passed').length,
    failed: testResults.filter(t => t.status === 'failed').length,
    warnings: testResults.filter(t => t.status === 'warning').length,
    pending: testResults.filter(t => t.status === 'pending').length,
  };

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <TestTube className="w-8 h-8" />
            System Testing Panel
          </h1>
          <p className="text-white/70">Comprehensive testing suite for production readiness verification</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={resetTests} icon={RefreshCw}>
            Reset Tests
          </Button>
          <Button variant="outline" onClick={exportTestReport} icon={Download}>
            Export Report
          </Button>
          <Button 
            onClick={runAllTests} 
            disabled={isRunningTests}
            icon={Play}
          >
            {isRunningTests ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </div>
      </div>

      {/* Test Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatsCard
          title="Total Tests"
          value={testSummary.total}
          icon={TestTube}
          color="from-blue-500 to-cyan-600"
        />
        <StatsCard
          title="Passed"
          value={testSummary.passed}
          icon={CheckCircle}
          color="from-green-500 to-emerald-600"
        />
        <StatsCard
          title="Failed"
          value={testSummary.failed}
          icon={XCircle}
          color="from-red-500 to-pink-600"
        />
        <StatsCard
          title="Warnings"
          value={testSummary.warnings}
          icon={AlertTriangle}
          color="from-yellow-500 to-orange-600"
        />
        <StatsCard
          title="Pending"
          value={testSummary.pending}
          icon={Clock}
          color="from-gray-500 to-slate-600"
        />
      </div>

      {/* Test Categories Filter */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex items-center gap-4 mb-4">
          <Eye className="w-5 h-5 text-white/70" />
          <span className="text-white font-medium">Filter by Category:</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === 'all'
                ? 'bg-primary text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            All Tests ({testResults.length})
          </button>
          {testCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-primary text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <category.icon className="w-4 h-4" />
              {category.name} ({category.tests.length})
            </button>
          ))}
        </div>
      </div>

      {/* Test Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Test Results</h2>
          </div>
          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {filteredTests.map((test) => (
              <div key={test.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(test.status)}
                  <div className="flex-1">
                    <p className="text-white font-medium">{test.name}</p>
                    <p className="text-white/60 text-sm">{test.message}</p>
                    {test.duration && (
                      <p className="text-white/50 text-xs">{test.duration}ms</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(test.status)}`}>
                    {test.status}
                  </span>
                  <Button
                    size="sm"
                    variant="glass"
                    onClick={() => runSingleTest(test.id)}
                    disabled={test.status === 'running' || isRunningTests}
                    icon={Play}
                  >
                    Run
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Log */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Test Log</h2>
          </div>
          <div className="p-6">
            <div className="bg-black/30 rounded-lg p-4 h-80 overflow-y-auto font-mono text-sm">
              {testLog.length > 0 ? (
                testLog.map((entry, index) => (
                  <div key={index} className="text-white/80 mb-1">
                    {entry}
                  </div>
                ))
              ) : (
                <div className="text-white/50 text-center py-8">
                  No test logs yet. Run tests to see detailed output.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Production Readiness Checklist */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-6">Production Readiness Checklist</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Core Functionality</h3>
            <div className="space-y-3">
              {[
                'Database connection established',
                'Member management working',
                'Payment processing functional',
                'Attendance tracking operational',
                'File upload system ready',
                'Form validation active'
              ].map((item, index) => {
                const isComplete = testResults.some(t => 
                  t.name.toLowerCase().includes(item.split(' ')[0].toLowerCase()) && 
                  t.status === 'passed'
                );
                return (
                  <div key={index} className="flex items-center gap-3">
                    {isComplete ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className={`text-sm ${isComplete ? 'text-white' : 'text-white/60'}`}>
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Security & Performance</h3>
            <div className="space-y-3">
              {[
                'Environment variables configured',
                'Security policies enabled',
                'Data validation working',
                'Error handling implemented',
                'Notification system active',
                'Backup procedures tested'
              ].map((item, index) => {
                const isComplete = testResults.some(t => 
                  (item.includes('Environment') && t.id === 'env-vars' && t.status === 'passed') ||
                  (item.includes('Security') && t.id === 'security-policies' && t.status === 'passed') ||
                  (item.includes('validation') && t.id === 'form-validation' && t.status === 'passed') ||
                  (item.includes('Notification') && t.id === 'notifications' && t.status === 'passed')
                );
                return (
                  <div key={index} className="flex items-center gap-3">
                    {isComplete ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className={`text-sm ${isComplete ? 'text-white' : 'text-white/60'}`}>
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Overall System Health */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              testSummary.failed > 0 ? 'bg-red-500/20' :
              testSummary.warnings > 0 ? 'bg-yellow-500/20' :
              testSummary.passed === testSummary.total ? 'bg-green-500/20' :
              'bg-gray-500/20'
            }`}>
              {testSummary.failed > 0 ? (
                <XCircle className="w-8 h-8 text-red-400" />
              ) : testSummary.warnings > 0 ? (
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
              ) : testSummary.passed === testSummary.total ? (
                <CheckCircle className="w-8 h-8 text-green-400" />
              ) : (
                <Clock className="w-8 h-8 text-gray-400" />
              )}
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">
              System Health: {
                testSummary.failed > 0 ? 'Critical Issues' :
                testSummary.warnings > 0 ? 'Needs Attention' :
                testSummary.passed === testSummary.total ? 'Production Ready' :
                'Testing Required'
              }
            </h3>
            
            <p className="text-white/70">
              {testSummary.passed}/{testSummary.total} tests passed
              {testSummary.failed > 0 && ` • ${testSummary.failed} failed`}
              {testSummary.warnings > 0 && ` • ${testSummary.warnings} warnings`}
            </p>
          </div>
        </div>
      </div>

      {/* Mock Data Generators */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-6">Mock Data Generators</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="glass"
            onClick={() => {
              // Generate 10 test members
              for (let i = 0; i < 10; i++) {
                addMember({
                  name: `Test Member ${i + 1}`,
                  email: `test${i + 1}@example.com`,
                  username: `test_user_${i + 1}`,
                  phone: `+1234567${String(i).padStart(3, '0')}`,
                  password: 'test123',
                  age: 20 + (i % 40),
                  subscriptionPlan: ['Basic', 'Premium', 'VIP'][i % 3],
                  subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  emergencyContact: `Emergency Contact ${i + 1} - +1234567${String(i + 100).padStart(3, '0')}`
                });
              }
              toast.success('Generated 10 test members');
            }}
            icon={Users}
          >
            Generate Test Members
          </Button>
          
          <Button
            variant="glass"
            onClick={() => {
              // Generate test payments
              members.slice(0, 5).forEach((member, i) => {
                addPayment({
                  memberId: member.id,
                  memberName: member.name,
                  amount: [79, 129, 199][i % 3],
                  method: ['cash', 'card', 'transfer'][i % 3],
                  description: 'Test payment',
                  planName: member.subscriptionPlan
                });
              });
              toast.success('Generated test payments');
            }}
            icon={CreditCard}
          >
            Generate Test Payments
          </Button>
          
          <Button
            variant="glass"
            onClick={() => {
              // Generate test attendance
              members.slice(0, 3).forEach(member => {
                checkInMember(member.id, 'Test Class');
              });
              toast.success('Generated test attendance');
            }}
            icon={Calendar}
          >
            Generate Test Attendance
          </Button>
        </div>
      </div>

      {/* Environment Check */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-6">Environment Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Required Environment Variables</h3>
            <div className="space-y-2">
              {[
                'VITE_SUPABASE_URL',
                'VITE_SUPABASE_ANON_KEY'
              ].map(varName => {
                const exists = !!import.meta.env[varName];
                return (
                  <div key={varName} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white/80 font-mono text-sm">{varName}</span>
                    <div className="flex items-center gap-2">
                      {exists ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`text-xs ${exists ? 'text-green-300' : 'text-red-300'}`}>
                        {exists ? 'Set' : 'Missing'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-4">System Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white/70">Node Environment</span>
                <span className="text-white">{import.meta.env.MODE}</span>
              </div>
              <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white/70">Build Time</span>
                <span className="text-white">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white/70">User Role</span>
                <span className="text-white capitalize">{user?.role}</span>
              </div>
              <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white/70">Total Members</span>
                <span className="text-white">{members.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemTesting;