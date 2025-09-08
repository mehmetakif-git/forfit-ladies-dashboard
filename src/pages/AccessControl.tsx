import React, { useState, useEffect } from 'react';
import FeatureGuard from '../components/UI/FeatureGuard';
import { Shield, Eye, Clock, AlertTriangle, Users, Activity, Plus, Blocks as Block, Unlock, Download, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';
import { Member } from '../types';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Breadcrumb from '../components/UI/Breadcrumb';
import StatsCard from '../components/UI/StatsCard';
import toast from 'react-hot-toast';

interface AccessAttempt {
  id: string;
  memberId?: string;
  memberName: string;
  cardUid: string;
  time: string;
  type: 'entry' | 'exit';
  status: 'success' | 'failed';
  reason?: string;
  door: string;
}

interface DoorStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error';
  lastPing: string;
  todayEntries: number;
}

const AccessControl: React.FC = () => {
  const { members, updateMember } = useApp();

  return (
    <FeatureGuard feature="access_control">
      <AccessControlContent />
    </FeatureGuard>
  );
};

const AccessControlContent: React.FC = () => {
  const { members, updateMember } = useApp();
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [newCardUid, setNewCardUid] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  // Mock data - would come from real NFC system
  const [accessAttempts, setAccessAttempts] = useState<AccessAttempt[]>([
    {
      id: '1',
      memberId: 'member-1',
      memberName: 'Sarah Johnson',
      cardUid: 'A1B2C3D4',
      time: '2024-12-20T10:45:00',
      type: 'entry',
      status: 'success',
      door: 'Main Entrance'
    },
    {
      id: '2',
      memberId: 'member-2',
      memberName: 'Emily Rodriguez',
      cardUid: 'E5F6G7H8',
      time: '2024-12-20T10:30:00',
      type: 'exit',
      status: 'success',
      door: 'Main Entrance'
    },
    {
      id: '3',
      memberName: 'Unknown Card',
      cardUid: 'X9Y8Z7W6',
      time: '2024-12-20T10:15:00',
      type: 'entry',
      status: 'failed',
      reason: 'Card not registered',
      door: 'Main Entrance'
    },
    {
      id: '4',
      memberId: 'member-3',
      memberName: 'Amanda Thompson',
      cardUid: 'B2C3D4E5',
      time: '2024-12-20T10:00:00',
      type: 'entry',
      status: 'failed',
      reason: 'Membership expired',
      door: 'Main Entrance'
    },
    {
      id: '5',
      memberId: 'member-4',
      memberName: 'Maria Gonzalez',
      cardUid: 'F6G7H8I9',
      time: '2024-12-20T09:45:00',
      type: 'entry',
      status: 'success',
      door: 'Side Entrance'
    }
  ]);

  const [doorStatuses, setDoorStatuses] = useState<DoorStatus[]>([
    {
      id: '1',
      name: 'Main Entrance',
      status: 'online',
      lastPing: new Date().toISOString(),
      todayEntries: 18
    },
    {
      id: '2',
      name: 'Side Entrance',
      status: 'online',
      lastPing: new Date().toISOString(),
      todayEntries: 5
    },
    {
      id: '3',
      name: 'Emergency Exit',
      status: 'offline',
      lastPing: '2024-12-20T08:00:00',
      todayEntries: 0
    }
  ]);

  const currentlyInside = members.filter(m => m.currentStatus === 'inside');
  const todaySuccessfulEntries = accessAttempts.filter(a => 
    a.status === 'success' && 
    a.type === 'entry' && 
    a.time.startsWith(new Date().toISOString().split('T')[0])
  );
  const todayFailedAttempts = accessAttempts.filter(a => 
    a.status === 'failed' && 
    a.time.startsWith(new Date().toISOString().split('T')[0])
  );

  const filteredAttempts = accessAttempts.filter(attempt => {
    const matchesStatus = filterStatus === 'all' || attempt.status === filterStatus;
    const attemptDate = attempt.time.split('T')[0];
    const matchesDateRange = attemptDate >= selectedDateRange.from && attemptDate <= selectedDateRange.to;
    return matchesStatus && matchesDateRange;
  });

  const generateCardUid = () => {
    const chars = '0123456789ABCDEF';
    let uid = '';
    for (let i = 0; i < 8; i++) {
      uid += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return uid;
  };

  const handleIssueCard = (member: Member) => {
    setSelectedMember(member);
    setNewCardUid(generateCardUid());
    setIsCardModalOpen(true);
  };

  const handleAssignCard = () => {
    if (!selectedMember || !newCardUid) return;

    updateMember(selectedMember.id, {
      nfcCard: {
        uid: newCardUid,
        status: 'active',
        issuedDate: new Date().toISOString(),
        issuedBy: 'Admin User'
      }
    });

    setIsCardModalOpen(false);
    setSelectedMember(null);
    setNewCardUid('');
    toast.success('NFC card assigned successfully!');
  };

  const handleBlockCard = (member: Member) => {
    if (!member.nfcCard) return;

    updateMember(member.id, {
      nfcCard: {
        ...member.nfcCard,
        status: 'blocked'
      }
    });
    toast.success('Card blocked successfully!');
  };

  const handleUnblockCard = (member: Member) => {
    if (!member.nfcCard) return;

    updateMember(member.id, {
      nfcCard: {
        ...member.nfcCard,
        status: 'active'
      }
    });
    toast.success('Card unblocked successfully!');
  };

  const exportAccessReport = () => {
    toast.success('Access report exported to CSV!');
  };

  const exportAttendanceReport = () => {
    toast.success('Attendance patterns report exported!');
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDoorStatuses(prev => prev.map(door => ({
        ...door,
        lastPing: door.status === 'online' ? new Date().toISOString() : door.lastPing
      })));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Access Control</h1>
          <p className="text-white/70">Monitor and manage facility access in real-time</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportAttendanceReport} icon={Download}>
            Attendance Report
          </Button>
          <Button variant="outline" onClick={exportAccessReport} icon={Download}>
            Access Report
          </Button>
        </div>
      </div>

      {/* Access Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Currently Inside"
          value={currentlyInside.length}
          icon={Eye}
          color="from-blue-500 to-cyan-600"
        />
        <StatsCard
          title="Today's Entries"
          value={todaySuccessfulEntries.length}
          icon={Shield}
          trend={{ value: 8, isPositive: true }}
          color="from-green-500 to-emerald-600"
        />
        <StatsCard
          title="Failed Attempts"
          value={todayFailedAttempts.length}
          icon={AlertTriangle}
          color="from-red-500 to-orange-500"
        />
        <StatsCard
          title="Active Cards"
          value={members.filter(m => m.nfcCard?.status === 'active').length}
          icon={Shield}
          color="from-purple-500 to-indigo-600"
        />
      </div>

      {/* Live Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Who's Inside Now */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-400" />
            Who's Inside Now ({currentlyInside.length})
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {currentlyInside.length > 0 ? currentlyInside.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent-orange rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{member.name}</p>
                    <p className="text-white/60 text-xs">{member.memberId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-xs">8:30 AM</p>
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-1"></div>
                </div>
              </div>
            )) : (
              <p className="text-white/50 text-center py-4 text-sm">No one currently inside</p>
            )}
          </div>
        </div>

        {/* Door Status */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            Door Status
          </h3>
          <div className="space-y-3">
            {doorStatuses.map((door) => (
              <div key={door.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    door.status === 'online' ? 'bg-green-400' :
                    door.status === 'offline' ? 'bg-gray-400' : 'bg-red-400'
                  }`}></div>
                  <div>
                    <p className="text-white font-medium text-sm">{door.name}</p>
                    <p className="text-white/60 text-xs">
                      {door.todayEntries} entries today
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    door.status === 'online' ? 'bg-green-500/20 text-green-300' :
                    door.status === 'offline' ? 'bg-gray-500/20 text-gray-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {door.status}
                  </span>
                  <p className="text-white/50 text-xs mt-1">
                    {format(new Date(door.lastPing), 'h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            Recent Activity
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {accessAttempts.slice(0, 10).map((attempt) => (
              <div key={attempt.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  attempt.status === 'success' ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{attempt.memberName}</p>
                  <p className="text-white/60 text-xs">
                    {attempt.type} • {format(new Date(attempt.time), 'h:mm a')}
                    {attempt.reason && ` • ${attempt.reason}`}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  attempt.status === 'success' 
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-red-500/20 text-red-300'
                }`}>
                  {attempt.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card Management */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          NFC Card Management
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Member</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Card UID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Issued Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Last Access</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent-orange rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{member.name}</p>
                        <p className="text-white/60 text-sm">{member.memberId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white/80 font-mono text-sm">
                      {member.nfcCard?.uid || 'Not Assigned'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        member.nfcCard?.status === 'active' 
                          ? 'bg-green-500/20 text-green-300'
                          : member.nfcCard?.status === 'blocked'
                          ? 'bg-red-500/20 text-red-300'
                          : member.nfcCard?.status === 'lost'
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : 'bg-gray-500/20 text-gray-300'
                      }`}>
                        {member.nfcCard?.status || 'No Card'}
                      </span>
                      {member.currentStatus === 'inside' && (
                        <div className="w-2 h-2 bg-green-400 rounded-full" title="Currently inside"></div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white/80 text-sm">
                    {member.nfcCard?.issuedDate 
                      ? format(new Date(member.nfcCard.issuedDate), 'MMM dd, yyyy')
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4 text-white/80 text-sm">
                    {member.lastAttendance 
                      ? format(new Date(member.lastAttendance), 'MMM dd, yyyy')
                      : 'Never'
                    }
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {!member.nfcCard ? (
                        <Button
                          size="sm"
                          variant="glass"
                          onClick={() => handleIssueCard(member)}
                          icon={Plus}
                        >
                          Issue Card
                        </Button>
                      ) : (
                        <>
                          {member.nfcCard.status === 'active' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleBlockCard(member)}
                              icon={Block}
                            >
                              Block
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="glass"
                              onClick={() => handleUnblockCard(member)}
                              icon={Unlock}
                            >
                              Unblock
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="glass"
                            onClick={() => handleIssueCard(member)}
                            icon={Plus}
                          >
                            Reissue
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Access Reports */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Access History
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-white/70" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDateRange.from}
                onChange={(e) => setSelectedDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <span className="text-white/70">to</span>
              <input
                type="date"
                value={selectedDateRange.to}
                onChange={(e) => setSelectedDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Member</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Card UID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Time</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Door</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredAttempts.map((attempt) => (
                <tr key={attempt.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        attempt.status === 'success' 
                          ? 'bg-gradient-to-br from-primary to-accent-orange'
                          : 'bg-red-500/20'
                      }`}>
                        <span className="text-xs font-semibold text-white">
                          {attempt.memberName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="text-white font-medium">{attempt.memberName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white/80 font-mono text-sm">{attempt.cardUid}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      attempt.type === 'entry' 
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      {attempt.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/80 text-sm">
                    {format(new Date(attempt.time), 'MMM dd, h:mm a')}
                  </td>
                  <td className="px-6 py-4 text-white/80 text-sm">
                    {attempt.door}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      attempt.status === 'success' 
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {attempt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/80 text-sm">
                    {attempt.reason || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredAttempts.length === 0 && (
          <div className="text-center py-12 text-white/60">
            No access attempts found for the selected criteria
          </div>
        )}
      </div>

      {/* Access Patterns Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Peak Hours</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Morning Peak</span>
              <span className="text-white font-bold">8:00 - 10:00 AM</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Evening Peak</span>
              <span className="text-white font-bold">6:00 - 8:00 PM</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Busiest Day</span>
              <span className="text-white font-bold">Monday</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Security Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Success Rate</span>
              <span className="text-green-400 font-bold">94.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Failed Attempts</span>
              <span className="text-red-400 font-bold">5.8%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Blocked Cards</span>
              <span className="text-yellow-400 font-bold">2</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Doors Online</span>
              <span className="text-green-400 font-bold">
                {doorStatuses.filter(d => d.status === 'online').length}/{doorStatuses.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Last Sync</span>
              <span className="text-white font-bold">{format(new Date(), 'h:mm a')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Uptime</span>
              <span className="text-green-400 font-bold">99.8%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Issue Card Modal */}
      <Modal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        title="Issue NFC Card"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent-orange rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Issue Card for {selectedMember?.name}
            </h3>
            <p className="text-white/70">
              Assign a new NFC card to this member
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Card UID
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newCardUid}
                  onChange={(e) => setNewCardUid(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter card UID"
                />
                <Button
                  variant="outline"
                  onClick={() => setNewCardUid(generateCardUid())}
                >
                  Generate
                </Button>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Card Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Member:</span>
                  <span className="text-white">{selectedMember?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Member ID:</span>
                  <span className="text-white font-mono">{selectedMember?.memberId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Issued By:</span>
                  <span className="text-white">Admin User</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Issue Date:</span>
                  <span className="text-white">{format(new Date(), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleAssignCard} className="flex-1" disabled={!newCardUid}>
              Assign Card
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsCardModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AccessControl;