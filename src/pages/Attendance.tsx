import React, { useState } from 'react';
import { Clock, Users, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Breadcrumb from '../components/UI/Breadcrumb';
import CheckInForm from '../components/Attendance/CheckInForm';
import toast from 'react-hot-toast';

const Attendance: React.FC = () => {
  const { attendance, members, checkOutMember } = useApp();
  const [searchParams] = useSearchParams();
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(searchParams.get('action') === 'checkin');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const todayAttendance = attendance.filter(record => record.date === selectedDate);
  const activeCheckIns = todayAttendance.filter(record => !record.checkOut);
  
  const handleCheckOut = (memberId: string, memberName: string) => {
    checkOutMember(memberId);
    toast.success(`${memberName} checked out successfully!`);
  };

  const getAttendanceStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const todayCount = attendance.filter(r => r.date === today).length;
    const weeklyCount = attendance.filter(r => new Date(r.date) >= thisWeek).length;
    const averageDaily = Math.round(weeklyCount / 7);

    return { todayCount, weeklyCount, averageDaily };
  };

  const stats = getAttendanceStats();

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Attendance</h1>
          <p className="text-white/70">Track member check-ins and daily attendance</p>
        </div>
        <Button onClick={() => setIsCheckInModalOpen(true)} icon={CheckCircle}>
          Check In Member
        </Button>
      </div>

      {/* Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-white/70 text-sm">Today's Attendance</p>
              <p className="text-2xl font-bold text-white">{stats.todayCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-white/70 text-sm">Currently Active</p>
              <p className="text-2xl font-bold text-white">{activeCheckIns.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-white/70 text-sm">Daily Average</p>
              <p className="text-2xl font-bold text-white">{stats.averageDaily}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Selector */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex items-center gap-4">
          <label className="text-white font-medium">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <span className="text-white/70">
            {todayAttendance.length} check-ins on {format(new Date(selectedDate), 'MMM dd, yyyy')}
          </span>
        </div>
      </div>

      {/* Attendance List */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">
            Attendance for {format(new Date(selectedDate), 'EEEE, MMMM dd, yyyy')}
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Member</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Check In</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Check Out</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Class/Activity</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {todayAttendance.map((record) => (
                <tr key={record.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent-orange rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">
                          {record.memberName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="text-white font-medium">{record.memberName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white/80">
                    {format(new Date(record.checkIn), 'h:mm a')}
                  </td>
                  <td className="px-6 py-4 text-white/80">
                    {record.checkOut ? format(new Date(record.checkOut), 'h:mm a') : '-'}
                  </td>
                  <td className="px-6 py-4 text-white/80">
                    {record.classType || 'General Access'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {!record.checkOut ? (
                        <Button
                          onClick={() => handleCheckOut(record.memberId, record.memberName)}
                          variant="glass"
                          size="sm"
                          icon={XCircle}
                        >
                          Check Out
                        </Button>
                      ) : (
                        <span className="text-green-400 text-sm">Completed</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {todayAttendance.length === 0 && (
          <div className="text-center py-12 text-white/60">
            No attendance records for this date
          </div>
        )}
      </div>

      {/* Check-in Modal */}
      <Modal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        title="Check In Member"
      >
        <CheckInForm
          onSuccess={() => {
            setIsCheckInModalOpen(false);
            toast.success('Member checked in successfully!');
          }}
        />
      </Modal>
    </div>
  );
};

export default Attendance;