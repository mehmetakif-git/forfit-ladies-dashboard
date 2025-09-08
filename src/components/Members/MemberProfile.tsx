import React from 'react';
import { Member } from '../../types';
import { format } from 'date-fns';
import { Calendar, Phone, Mail, AlertCircle, Activity, CreditCard, MessageCircle, CreditCard as NFCIcon, Clock, MapPin, Shield, Plus, Camera, TrendingUp, User, Dumbbell, BookOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Button from '../UI/Button';
import TabNavigation from '../UI/TabNavigation';
import WhatsAppPanel from './WhatsAppPanel';
import ProgressPhotos from './ProgressPhotos';
import BodyMeasurements from './BodyMeasurements';
import TrainerManagement from './TrainerManagement';
import ClassBookings from './ClassBookings';
import toast from 'react-hot-toast';

interface MemberProfileProps {
  member: Member;
}

const MemberProfile: React.FC<MemberProfileProps> = ({ member }) => {
  const { attendance, payments } = useApp();
  const [activeTab, setActiveTab] = React.useState('overview');
  
  const memberAttendance = attendance.filter(record => record.memberId === member.id);
  const memberPayments = payments.filter(payment => payment.memberId === member.id);
  
  const recentAttendance = memberAttendance
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const recentPayments = memberPayments
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Mock NFC access history
  const accessHistory = [
    { id: '1', type: 'entry', time: '2024-12-20T08:30:00', duration: '1h 30m' },
    { id: '2', type: 'exit', time: '2024-12-20T10:00:00', duration: null },
    { id: '3', type: 'entry', time: '2024-12-19T18:00:00', duration: '2h 15m' },
    { id: '4', type: 'exit', time: '2024-12-19T20:15:00', duration: null },
    { id: '5', type: 'entry', time: '2024-12-18T07:45:00', duration: '1h 45m' },
  ];

  const handleIssueNewCard = () => {
    toast.success('New NFC card issued successfully!');
  };

  const handleBlockCard = () => {
    toast.success('NFC card blocked successfully!');
  };

  const handleUnblockCard = () => {
    toast.success('NFC card unblocked successfully!');
  };

  return (
    <div className="space-y-6">
      <TabNavigation
        tabs={[
          { id: 'overview', label: 'Overview', content: <OverviewTab /> },
          { id: 'progress', label: 'Progress', content: <ProgressTab /> },
          { id: 'measurements', label: 'Measurements', content: <MeasurementsTab /> },
          { id: 'trainer', label: 'Trainer', content: <TrainerTab /> },
          { id: 'classes', label: 'Classes', content: <ClassesTab /> },
          { id: 'nfc', label: 'NFC Access', content: <NFCTab /> },
          { id: 'whatsapp', label: 'WhatsApp', content: <WhatsAppTab /> },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showNavButtons={false}
      />
    </div>
  );

  function ProgressTab() {
    return (
      <div className="space-y-6">
        <ProgressPhotos member={member} />
      </div>
    );
  }

  function MeasurementsTab() {
    return (
      <div className="space-y-6">
        <BodyMeasurements member={member} />
      </div>
    );
  }

  function TrainerTab() {
    return (
      <div className="space-y-6">
        <TrainerManagement member={member} />
      </div>
    );
  }

  function ClassesTab() {
    return (
      <div className="space-y-6">
        <ClassBookings member={member} />
      </div>
    );
  }

  function OverviewTab() {
    return (
      <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center gap-6 p-6 bg-white/5 rounded-xl">
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent-orange rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-white">
            {member.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-2">{member.name}</h2>
          <div className="grid grid-cols-2 gap-4 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {member.email}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {member.phone}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Joined {format(new Date(member.joinDate), 'MMM dd, yyyy')}
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Age {member.age}
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Subscription
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-white/70 text-sm">Current Plan</p>
              <p className="text-white font-medium">{member.subscriptionPlan}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Status</p>
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                member.subscriptionStatus === 'active' 
                  ? 'bg-green-500/20 text-green-300'
                  : member.subscriptionStatus === 'expired'
                  ? 'bg-red-500/20 text-red-300'
                  : 'bg-yellow-500/20 text-yellow-300'
              }`}>
                {member.subscriptionStatus}
              </span>
            </div>
            <div>
              <p className="text-white/70 text-sm">Expires</p>
              <p className="text-white font-medium">
                {format(new Date(member.subscriptionEnd), 'MMM dd, yyyy')}
              </p>
            </div>
            {member.remainingSessions && (
              <div>
                <p className="text-white/70 text-sm">Sessions Remaining</p>
                <p className="text-white font-medium">{member.remainingSessions}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Additional Info
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-white/70 text-sm">Emergency Contact</p>
              <p className="text-white font-medium">{member.emergencyContact}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Total Sessions</p>
              <p className="text-white font-medium">{member.totalSessions}</p>
            </div>
            {member.medicalNotes && (
              <div>
                <p className="text-white/70 text-sm">Medical Notes</p>
                <p className="text-white font-medium">{member.medicalNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Attendance</h3>
          <div className="space-y-3">
            {recentAttendance.length > 0 ? recentAttendance.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">
                    {format(new Date(record.date), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-white/60 text-sm">
                    {format(new Date(record.checkIn), 'h:mm a')}
                    {record.classType && ` - ${record.classType}`}
                  </p>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
            )) : (
              <p className="text-white/50 text-center py-4">No recent attendance</p>
            )}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Payment History</h3>
          <div className="space-y-3">
            {recentPayments.length > 0 ? recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">${payment.amount}</p>
                  <p className="text-white/60 text-sm">
                    {format(new Date(payment.date), 'MMM dd, yyyy')} - {payment.method}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  payment.status === 'completed'
                    ? 'bg-green-500/20 text-green-300'
                    : payment.status === 'pending'
                    ? 'bg-yellow-500/20 text-yellow-300'
                    : 'bg-red-500/20 text-red-300'
                }`}>
                  {payment.status}
                </span>
              </div>
            )) : (
              <p className="text-white/50 text-center py-4">No payment history</p>
            )}
          </div>
        </div>
      </div>

      </div>
    );
  }

  function NFCTab() {
    return (
      <div className="space-y-6">
        {/* NFC Card Management */}
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <NFCIcon className="w-5 h-5 text-blue-400" />
            NFC Card Management
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Card UID</label>
                <input
                  type="text"
                  value={member.nfcCard?.uid || 'Not Assigned'}
                  disabled
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white/80 font-mono"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Card Status</label>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    member.nfcCard?.status === 'active' 
                      ? 'bg-green-500/20 text-green-300'
                      : member.nfcCard?.status === 'blocked'
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {member.nfcCard?.status || 'Not Issued'}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${
                    member.currentStatus === 'inside' ? 'bg-green-400' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-white/70 text-sm">
                    Currently {member.currentStatus || 'outside'}
                  </span>
                </div>
              </div>
              
              {member.nfcCard?.issuedDate && (
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Issued</label>
                  <p className="text-white/80 text-sm">
                    {format(new Date(member.nfcCard.issuedDate), 'MMM dd, yyyy')} by {member.nfcCard.issuedBy}
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={handleIssueNewCard}
                variant="glass"
                icon={Plus}
                className="w-full"
              >
                Issue New Card
              </Button>
              
              {member.nfcCard?.status === 'active' && (
                <Button
                  onClick={handleBlockCard}
                  variant="outline"
                  icon={Shield}
                  className="w-full"
                >
                  Block Card
                </Button>
              )}
              
              {member.nfcCard?.status === 'blocked' && (
                <Button
                  onClick={handleUnblockCard}
                  variant="glass"
                  icon={Shield}
                  className="w-full"
                >
                  Unblock Card
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Access History */}
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Access History (Last 10 entries)
          </h3>
          
          <div className="space-y-3">
            {accessHistory.map((access) => (
              <div key={access.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    access.type === 'entry' ? 'bg-green-400' : 'bg-blue-400'
                  }`}></div>
                  <div>
                    <p className="text-white font-medium capitalize">{access.type}</p>
                    <p className="text-white/60 text-sm">
                      {format(new Date(access.time), 'MMM dd, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {access.duration && (
                    <p className="text-white/80 text-sm">{access.duration}</p>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-white/50" />
                    <span className="text-white/50 text-xs">Main Entrance</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Access Patterns */}
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Access Patterns</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white mb-1">8:30 AM</p>
              <p className="text-white/70 text-sm">Most Frequent Entry</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white mb-1">1h 45m</p>
              <p className="text-white/70 text-sm">Average Session</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white mb-1">Mon-Wed</p>
              <p className="text-white/70 text-sm">Preferred Days</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function WhatsAppTab() {
    return (
      <div className="space-y-6">
        <WhatsAppPanel member={member} />
      </div>
    );
  }
};

export default MemberProfile;