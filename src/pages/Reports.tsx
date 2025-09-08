import React, { useState } from 'react';
import { Download, TrendingUp, Users, DollarSign, Calendar, Percent, Filter } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useApp } from '../context/AppContext';
import { revenueChartData, attendanceChartData } from '../utils/mockData';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import Button from '../components/UI/Button';
import Breadcrumb from '../components/UI/Breadcrumb';
import toast from 'react-hot-toast';

const Reports: React.FC = () => {
  const { members, payments, attendance } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [showDiscountFilters, setShowDiscountFilters] = useState(false);
  const [discountFilters, setDiscountFilters] = useState({
    membersWithDiscounts: false,
    discountRange: [0, 50],
    discountReason: '',
    dateFrom: '',
    dateTo: ''
  });

  const membershipDistribution = [
    { name: 'Basic', value: members.filter(m => m.subscriptionPlan === 'Basic').length, color: '#8B5CF6' },
    { name: 'Premium', value: members.filter(m => m.subscriptionPlan === 'Premium').length, color: '#DC2684' },
    { name: 'VIP', value: members.filter(m => m.subscriptionPlan === 'VIP').length, color: '#F59E0B' },
  ];

  const monthlyStats = {
    revenue: payments
      .filter(p => p.date.startsWith(selectedMonth) && p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0),
    newMembers: members.filter(m => m.joinDate.startsWith(selectedMonth)).length,
    totalAttendance: attendance.filter(a => a.date.startsWith(selectedMonth)).length,
    activeMembers: members.filter(m => m.subscriptionStatus === 'active').length,
  };

  // Discount Analytics
  const membersWithDiscounts = members.filter(m => m.discount && m.discount.percentage > 0);
  const totalDiscountAmount = membersWithDiscounts.reduce((sum, m) => {
    const planPrice = 129; // Default price, should be dynamic based on plan
    return sum + (planPrice * (m.discount?.percentage || 0) / 100);
  }, 0);
  const averageDiscountPercentage = membersWithDiscounts.length > 0 
    ? membersWithDiscounts.reduce((sum, m) => sum + (m.discount?.percentage || 0), 0) / membersWithDiscounts.length 
    : 0;

  // Filter members based on discount criteria
  const filteredMembers = members.filter(member => {
    if (discountFilters.membersWithDiscounts && (!member.discount || member.discount.percentage === 0)) {
      return false;
    }
    
    if (member.discount && member.discount.percentage > 0) {
      const discountPercent = member.discount.percentage;
      if (discountPercent < discountFilters.discountRange[0] || discountPercent > discountFilters.discountRange[1]) {
        return false;
      }
      
      if (discountFilters.discountReason && !member.discount.reason.toLowerCase().includes(discountFilters.discountReason.toLowerCase())) {
        return false;
      }
      
      if (discountFilters.dateFrom && member.discount.appliedDate < discountFilters.dateFrom) {
        return false;
      }
      
      if (discountFilters.dateTo && member.discount.appliedDate > discountFilters.dateTo) {
        return false;
      }
    }
    
    return true;
  });

  const exportReport = () => {
    toast.success('Report exported to PDF successfully!');
  };

  const exportDiscountReport = () => {
    toast.success('Discount report exported to CSV successfully!');
  };

  const generateMonthlySummary = () => {
    toast.success('Monthly summary generated!');
  };

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h1>
          <p className="text-white/70">Comprehensive insights into your studio's performance</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={generateMonthlySummary} icon={Calendar}>
            Monthly Summary
          </Button>
          <Button variant="outline" onClick={exportDiscountReport} icon={Percent}>
            Discount Report
          </Button>
          <Button onClick={exportReport} icon={Download}>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Month Selector */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex items-center gap-4">
          <label className="text-white font-medium">Report Period:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Discount Filters */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Discount Filters
          </h2>
          <button
            onClick={() => setShowDiscountFilters(!showDiscountFilters)}
            className="text-white/70 hover:text-white transition-colors"
          >
            {showDiscountFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
        
        {showDiscountFilters && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="membersWithDiscounts"
                  checked={discountFilters.membersWithDiscounts}
                  onChange={(e) => setDiscountFilters(prev => ({ ...prev, membersWithDiscounts: e.target.checked }))}
                  className="w-4 h-4 text-primary bg-white/10 border-white/20 rounded focus:ring-primary/50"
                />
                <label htmlFor="membersWithDiscounts" className="text-white/80">
                  Members with Discounts Only
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Discount Range: {discountFilters.discountRange[0]}% - {discountFilters.discountRange[1]}%
                </label>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={discountFilters.discountRange[0]}
                    onChange={(e) => setDiscountFilters(prev => ({ 
                      ...prev, 
                      discountRange: [parseInt(e.target.value), prev.discountRange[1]] 
                    }))}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={discountFilters.discountRange[1]}
                    onChange={(e) => setDiscountFilters(prev => ({ 
                      ...prev, 
                      discountRange: [prev.discountRange[0], parseInt(e.target.value)] 
                    }))}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Discount Reason</label>
                <input
                  type="text"
                  value={discountFilters.discountReason}
                  onChange={(e) => setDiscountFilters(prev => ({ ...prev, discountReason: e.target.value }))}
                  placeholder="Search reason..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Date From</label>
                <input
                  type="date"
                  value={discountFilters.dateFrom}
                  onChange={(e) => setDiscountFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Date To</label>
                <input
                  type="date"
                  value={discountFilters.dateTo}
                  onChange={(e) => setDiscountFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Monthly Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 stats-card">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-white/70 text-sm">Revenue</p>
              <p className="text-2xl font-bold text-white">${monthlyStats.revenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 stats-card">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-white/70 text-sm">New Members</p>
              <p className="text-2xl font-bold text-white">{monthlyStats.newMembers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 stats-card">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-white/70 text-sm">Total Visits</p>
              <p className="text-2xl font-bold text-white">{monthlyStats.totalAttendance}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 stats-card">
          <div className="flex items-center gap-3">
            <Percent className="w-8 h-8 text-orange-400" />
            <div>
              <p className="text-white/70 text-sm">Total Discounts</p>
              <p className="text-2xl font-bold text-white">${totalDiscountAmount.toFixed(0)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 stats-card">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-white/70 text-sm">Active Members</p>
              <p className="text-2xl font-bold text-white">{monthlyStats.activeMembers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Discount Analytics */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Discount Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-white mb-1">{membersWithDiscounts.length}</p>
            <p className="text-white/70 text-sm">Members with Discounts</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white mb-1">${totalDiscountAmount.toFixed(0)}</p>
            <p className="text-white/70 text-sm">Total Discount Amount</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white mb-1">{averageDiscountPercentage.toFixed(1)}%</p>
            <p className="text-white/70 text-sm">Average Discount</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white mb-1">
              {((membersWithDiscounts.length / members.length) * 100).toFixed(1)}%
            </p>
            <p className="text-white/70 text-sm">Members with Discounts</p>
          </div>
        </div>
      </div>

      {/* Filtered Members Table */}
      {discountFilters.membersWithDiscounts && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">Members with Discounts ({filteredMembers.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Member</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Plan</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Original Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Discount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Final Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Reason</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Applied By</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredMembers.filter(m => m.discount && m.discount.percentage > 0).map((member) => {
                  const originalPrice = 129; // Should be dynamic based on plan
                  const discountAmount = originalPrice * (member.discount?.percentage || 0) / 100;
                  const finalPrice = originalPrice - discountAmount;
                  
                  return (
                    <tr key={member.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent-orange rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-white">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="text-white font-medium">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/80">{member.subscriptionPlan}</td>
                      <td className="px-6 py-4">
                        <span className="text-white/60 line-through">${originalPrice}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-red-400 font-semibold">
                          {member.discount?.percentage}% (-${discountAmount.toFixed(2)})
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-green-400 font-bold">${finalPrice.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 text-white/80 text-sm">
                        {member.discount?.reason || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-white/80 text-sm">
                        {member.discount?.appliedBy || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-white/80 text-sm">
                        {member.discount?.appliedDate ? format(new Date(member.discount.appliedDate), 'MMM dd, yyyy') : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend (12 Months)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#E5E6E6" />
                <YAxis stroke="#E5E6E6" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(82, 58, 122, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
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
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Attendance Pattern</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="day" stroke="#E5E6E6" />
                <YAxis stroke="#E5E6E6" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(82, 58, 122, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="url(#attendanceGradient)"
                  radius={4}
                />
                <defs>
                  <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2684" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#523A7A" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Membership Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={membershipDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {membershipDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(82, 58, 122, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Member Growth</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#E5E6E6" />
                <YAxis stroke="#E5E6E6" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(82, 58, 122, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="members" 
                  stroke="#FAD45B" 
                  strokeWidth={3}
                  dot={{ fill: '#FAD45B', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Report */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Key Performance Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-white mb-1">
              {((monthlyStats.totalAttendance / (monthlyStats.activeMembers * 20)) * 100).toFixed(1)}%
            </p>
            <p className="text-white/70 text-sm">Attendance Rate</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white mb-1">
              ${(monthlyStats.revenue / monthlyStats.activeMembers).toFixed(0)}
            </p>
            <p className="text-white/70 text-sm">Revenue per Member</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white mb-1">
              {((monthlyStats.activeMembers / members.length) * 100).toFixed(1)}%
            </p>
            <p className="text-white/70 text-sm">Member Retention</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white mb-1">
              {(monthlyStats.totalAttendance / 30).toFixed(1)}
            </p>
            <p className="text-white/70 text-sm">Daily Average</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;