import React from 'react';
import { Users, DollarSign, Calendar, TrendingUp, UserX, Clock, Shield, Activity, Eye, Camera, AlertTriangle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import StatsCard from '../components/UI/StatsCard';
import Breadcrumb from '../components/UI/Breadcrumb';
import Layout from '../components/Layout/Layout';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { mockDashboardStats, revenueChartData, attendanceChartData } from '../utils/mockData';
import { format } from 'date-fns';
import MembershipCard from '../components/Member/MembershipCard';
import Typewriter from '../components/UI/Typewriter';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Admin and Staff get the full dashboard with layout
  return (
    <Layout>
      <DashboardContent />
    </Layout>
  );
};

const DashboardContent: React.FC = () => {
  const { members, payments, attendance } = useApp();
  const { user } = useAuth();
  const { t } = useApp();

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(record => record.date === today);
  const activeMembers = members.filter(member => member.subscriptionStatus === 'active');
  const expiringMembers = members.filter(member => {
    const endDate = new Date(member.subscriptionEnd);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return endDate <= thirtyDaysFromNow && member.subscriptionStatus === 'active';
  });

  const thisMonthRevenue = payments
    .filter(payment => 
      payment.date.startsWith(format(new Date(), 'yyyy-MM')) && 
      payment.status === 'completed'
    )
    .reduce((sum, payment) => sum + payment.amount, 0);

  // NFC Access Data (mock data - would come from real NFC system)
  const currentlyInside = [
    { id: '1', name: 'Sarah Johnson', entryTime: '2024-12-20T08:30:00', memberId: 'FL-2024-001' },
    { id: '2', name: 'Emily Rodriguez', entryTime: '2024-12-20T09:15:00', memberId: 'FL-2024-002' },
    { id: '3', name: 'Maria Gonzalez', entryTime: '2024-12-20T10:00:00', memberId: 'FL-2024-005' },
  ];

  const todayAccess = {
    totalEntries: 23,
    uniqueMembers: 18,
    peakHour: '6:00 PM - 7:00 PM',
    securityEvents: 3,
    camerasOnline: 5
  };

  const recentActivity = [
    { id: '1', memberName: 'Lisa Williams', time: '2024-12-20T10:45:00', status: 'success', action: 'Entry' },
    { id: '2', memberName: 'Nicole Davis', time: '2024-12-20T10:30:00', status: 'success', action: 'Exit' },
    { id: '3', memberName: 'Rachel Kim', time: '2024-12-20T10:15:00', status: 'success', action: 'Entry' },
    { id: '4', memberName: 'Unknown Card', time: '2024-12-20T10:00:00', status: 'failed', action: 'Entry' },
    { id: '5', memberName: 'Amanda Thompson', time: '2024-12-20T09:45:00', status: 'failed', action: 'Entry' },
  ];

  const recentMembers = members
    .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb items={[{ label: 'Dashboard' }]} />
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/70">
            {t('dashboard.welcome')}, {user?.name}! Here's what's happening at your studio today.
          </p>
        </div>
        <div className="text-white/70 text-sm">
          {format(new Date(), 'EEEE, MMMM do, yyyy')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title={t('dashboard.totalMembers')}
          value={members.length}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          color="from-primary to-accent-orange"
        />
        <StatsCard
          title={t('dashboard.activeMembers')}
          value={activeMembers.length}
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
          color="from-secondary to-primary"
        />
        <StatsCard
          title={t('dashboard.todayAttendance')}
          value={todayAttendance.length}
          icon={Calendar}
          color="from-accent-gold to-accent-orange"
        />
        {user?.role === 'admin' && (
          <StatsCard
            title={t('dashboard.monthlyRevenue')}
            value={`$${thisMonthRevenue.toLocaleString()}`}
            icon={DollarSign}
            trend={{ value: 15, isPositive: true }}
            color="from-green-500 to-emerald-600"
          />
        )}
        <StatsCard
          title={t('dashboard.expiringSoon')}
          value={expiringMembers.length}
          icon={Clock}
          color="from-orange-500 to-red-500"
        />
        <StatsCard
          title={t('dashboard.inactiveMembers')}
          value={members.filter(m => m.subscriptionStatus !== 'active').length}
          icon={UserX}
          color="from-gray-500 to-gray-600"
        />
        {user?.role === 'admin' && (
          <>
            <StatsCard
              title="Currently Inside"
              value={currentlyInside.length}
              icon={Eye}
              color="from-blue-500 to-cyan-600"
            />
            <StatsCard
              title="Today's Entries"
              value={todayAccess.totalEntries}
              icon={Shield}
              trend={{ value: 8, isPositive: true }}
              color="from-purple-500 to-indigo-600"
            />
            <StatsCard
              title="Cameras Online"
              value={`${todayAccess.camerasOnline}/6`}
              icon={Camera}
              color="from-blue-500 to-cyan-600"
            />
            <StatsCard
              title="Security Events"
              value={todayAccess.securityEvents}
              icon={AlertTriangle}
              color="from-orange-500 to-red-500"
            />
          </>
        )}
      </div>

      {/* NFC Access Management - Admin Only */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Who's Inside Now */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-400" />
              Who's Inside Now ({currentlyInside.length})
            </h3>
            <div className="space-y-3">
              {currentlyInside.length > 0 ? currentlyInside.map((person) => (
                <div key={person.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent-orange rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-white">
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{person.name}</p>
                      <p className="text-white/60 text-xs">{person.memberId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/80 text-xs">
                      {format(new Date(person.entryTime), 'h:mm a')}
                    </p>
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-1"></div>
                  </div>
                </div>
              )) : (
                <p className="text-white/50 text-center py-4 text-sm">No one currently inside</p>
              )}
            </div>
          </div>

          {/* Today's Access Stats */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Today's Access
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Total Entries</span>
                <span className="text-white font-bold text-lg">{todayAccess.totalEntries}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Unique Members</span>
                <span className="text-white font-bold text-lg">{todayAccess.uniqueMembers}</span>
              </div>
              <div className="pt-3 border-t border-white/10">
                <p className="text-white/70 text-sm mb-1">Peak Hour</p>
                <p className="text-white font-medium text-sm">{todayAccess.peakHour}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-white/80 text-sm">System Status: Online</span>
                </div>
                <p className="text-white/60 text-xs">Last sync: {format(new Date(), 'h:mm a')}</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Recent Activity
            </h3>
            <div className="space-y-2">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{activity.memberName}</p>
                    <p className="text-white/60 text-xs">
                      {activity.action} • {format(new Date(activity.time), 'h:mm a')}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.status === 'success' 
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {activity.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Charts - Only for Admin */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">{t('dashboard.revenueChart')}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="#E5E6E6" />
                  <YAxis stroke="#E5E6E6" />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#DC2684" 
                    strokeWidth={3}
                    dot={{ fill: '#DC2684', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">{t('dashboard.attendanceChart')}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" stroke="#E5E6E6" />
                  <YAxis stroke="#E5E6E6" />
                  <Bar 
                    dataKey="count" 
                    fill="url(#colorGradient)"
                    radius={4}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DC2684" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#523A7A" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">{t('dashboard.recentMembers')}</h3>
          <div className="space-y-3">
            {recentMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent-orange rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{member.name}</p>
                  <p className="text-white/60 text-sm">
                    Joined {format(new Date(member.joinDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  member.subscriptionStatus === 'active' 
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-red-500/20 text-red-300'
                }`}>
                  {member.subscriptionStatus}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">{t('dashboard.todayCheckins')}</h3>
          <div className="space-y-3">
            {todayAttendance.slice(0, 5).map((record) => (
              <div key={record.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white font-medium">{record.memberName}</p>
                  <p className="text-white/60 text-sm">
                    {format(new Date(record.checkIn), 'h:mm a')} 
                    {record.classType && ` - ${record.classType}`}
                  </p>
                </div>
                {record.checkOut && (
                  <span className="text-green-300 text-sm">Completed</span>
                )}
              </div>
            ))}
            {todayAttendance.length === 0 && (
              <p className="text-white/50 text-center py-4">{t('common.noData') || 'No check-ins today'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;