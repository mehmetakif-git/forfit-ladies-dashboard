import { Member, Payment, AttendanceRecord, DashboardStats } from '../types';

// Mock data removed - now using Supabase database

export const mockDashboardStats: DashboardStats = {
  totalMembers: 127,
  activeMembers: 98,
  todayAttendance: 23,
  monthlyRevenue: 12480,
  newMembersThisMonth: 8,
  expiringSubscriptions: 5,
};

export const revenueChartData = [
  { month: 'Jan', revenue: 8200, members: 85 },
  { month: 'Feb', revenue: 9100, members: 92 },
  { month: 'Mar', revenue: 10500, members: 98 },
  { month: 'Apr', revenue: 11200, members: 105 },
  { month: 'May', revenue: 10800, members: 103 },
  { month: 'Jun', revenue: 12100, members: 115 },
  { month: 'Jul', revenue: 11900, members: 118 },
  { month: 'Aug', revenue: 12800, members: 125 },
  { month: 'Sep', revenue: 12200, members: 121 },
  { month: 'Oct', revenue: 12900, members: 129 },
  { month: 'Nov', revenue: 12600, members: 127 },
  { month: 'Dec', revenue: 12480, members: 127 },
];

export const attendanceChartData = [
  { day: 'Mon', count: 28 },
  { day: 'Tue', count: 32 },
  { day: 'Wed', count: 25 },
  { day: 'Thu', count: 35 },
  { day: 'Fri', count: 30 },
  { day: 'Sat', count: 42 },
  { day: 'Sun', count: 38 },
];