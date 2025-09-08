import React, { useState } from 'react';
import { Calendar, Users, Clock, TrendingUp, Star, LogOut, Phone, Mail, Award, Eye, MessageCircle, Plus, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { format } from 'date-fns';
import Button from '../UI/Button';
import TrainerCard from './TrainerCard';
import Modal from '../UI/Modal';
import toast from 'react-hot-toast';

// Mock trainer data - would come from database
const mockTrainerData = {
  id: 'trainer-1',
  name: 'Sarah Johnson',
  email: 'sarah@forfit.qa',
  phone: '+974 5555-0201',
  specializations: ['Weight Loss', 'Strength Training', 'HIIT'],
  certifications: ['NASM-CPT', 'Nutrition Specialist'],
  experience: 5,
  hourlyRate: 75,
  availability: [
    { day: 'Monday', startTime: '06:00', endTime: '14:00', isAvailable: true },
    { day: 'Tuesday', startTime: '06:00', endTime: '14:00', isAvailable: true },
    { day: 'Wednesday', startTime: '06:00', endTime: '14:00', isAvailable: true },
    { day: 'Thursday', startTime: '06:00', endTime: '14:00', isAvailable: true },
    { day: 'Friday', startTime: '06:00', endTime: '14:00', isAvailable: true },
    { day: 'Saturday', startTime: '08:00', endTime: '12:00', isAvailable: true },
    { day: 'Sunday', startTime: '08:00', endTime: '12:00', isAvailable: false },
  ],
  clients: ['member-1', 'member-2', 'member-3'],
  photo: 'https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  bio: 'Certified personal trainer with 5+ years experience in women\'s fitness and nutrition.'
};

// Mock assigned members data
const mockAssignedMembers = [
  {
    id: 'member-1',
    name: 'Emily Rodriguez',
    email: 'emily@email.com',
    subscriptionPlan: 'Premium',
    joinDate: '2024-01-15',
    totalSessions: 45,
    lastSession: '2024-12-18',
    nextSession: '2024-12-22',
    progressNotes: 'Excellent progress in strength training. Increased bench press by 20%.',
    goals: ['Weight Loss', 'Muscle Building'],
    photo: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'
  },
  {
    id: 'member-2',
    name: 'Amanda Thompson',
    email: 'amanda@email.com',
    subscriptionPlan: 'VIP',
    joinDate: '2024-02-20',
    totalSessions: 38,
    lastSession: '2024-12-19',
    nextSession: '2024-12-23',
    progressNotes: 'Focused on HIIT training. Great improvement in cardiovascular endurance.',
    goals: ['Cardio Improvement', 'Flexibility'],
    photo: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'
  },
  {
    id: 'member-3',
    name: 'Lisa Williams',
    email: 'lisa@email.com',
    subscriptionPlan: 'Premium',
    joinDate: '2024-03-10',
    totalSessions: 32,
    lastSession: '2024-12-17',
    nextSession: '2024-12-24',
    progressNotes: 'Working on form correction and building confidence with weights.',
    goals: ['Strength Building', 'Confidence'],
  }
];

// Mock upcoming sessions
const mockUpcomingSessions = [
  {
    id: 'session-1',
    memberId: 'member-1',
    memberName: 'Emily Rodriguez',
    date: '2024-12-22',
    time: '08:00',
    duration: 60,
    type: 'Personal Training',
    status: 'confirmed'
  },
  {
    id: 'session-2',
    memberId: 'member-2',
    memberName: 'Amanda Thompson',
    date: '2024-12-23',
    time: '09:00',
    duration: 45,
    type: 'HIIT Session',
    status: 'confirmed'
  },
  {
    id: 'session-3',
    memberId: 'member-3',
    memberName: 'Lisa Williams',
    date: '2024-12-24',
    time: '10:00',
    duration: 60,
    type: 'Strength Training',
    status: 'pending'
  }
];

const TrainerPortal: React.FC = () => {
  const { logout } = useAuth();
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [sessionNotes, setSessionNotes] = useState('');

  const trainerStats = {
    totalClients: mockAssignedMembers.length,
    thisWeekSessions: 8,
    monthlyRevenue: 2400,
    clientRetention: 95,
    avgRating: 4.9,
    completedSessions: 156
  };

  const handleRecordSession = () => {
    if (!sessionNotes.trim()) {
      toast.error('Please add session notes');
      return;
    }
    
    setIsSessionModalOpen(false);
    setSessionNotes('');
    setSelectedMember(null);
    toast.success('Training session recorded successfully!');
  };

  const handleContactMember = (member: any) => {
    const message = `Hi ${member.name}! This is Sarah from Forfit Ladies. Hope you're having a great day!`;
    const whatsappUrl = `https://wa.me/${member.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-secondary to-primary p-6 space-y-8 relative">
      {/* Logout Button */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white border border-white/20"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {/* Welcome Header */}
      <div className="text-center pt-12">
        <h1 className="text-4xl font-bold text-white mb-2">Trainer Portal</h1>
        <p className="text-white/70 text-lg">Welcome back, {mockTrainerData.name}</p>
      </div>

      {/* Trainer Card */}
      <TrainerCard trainer={mockTrainerData} />

      {/* Quick Stats */}
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center">
          <Users className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-3xl font-bold text-white mb-2">{trainerStats.totalClients}</p>
          <p className="text-white/70">Active Clients</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center">
          <Calendar className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-3xl font-bold text-white mb-2">{trainerStats.thisWeekSessions}</p>
          <p className="text-white/70">This Week</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center">
          <Star className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-3xl font-bold text-white mb-2">{trainerStats.avgRating}</p>
          <p className="text-white/70">Avg Rating</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center">
          <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-3xl font-bold text-white mb-2">{trainerStats.clientRetention}%</p>
          <p className="text-white/70">Retention</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center">
          <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-3xl font-bold text-white mb-2">{trainerStats.completedSessions}</p>
          <p className="text-white/70">Total Sessions</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center">
          <Award className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-3xl font-bold text-white mb-2">${trainerStats.monthlyRevenue}</p>
          <p className="text-white/70">Monthly Revenue</p>
        </div>
      </div>

      {/* My Clients */}
      <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Users className="w-5 h-5" />
          My Clients ({mockAssignedMembers.length})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockAssignedMembers.map((member) => (
            <div key={member.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-4 mb-4">
                {member.photo ? (
                  <img src={member.photo} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent-orange rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="text-white font-semibold">{member.name}</h4>
                  <p className="text-white/60 text-sm">{member.subscriptionPlan}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Total Sessions</span>
                  <span className="text-white">{member.totalSessions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Last Session</span>
                  <span className="text-white">{format(new Date(member.lastSession), 'MMM dd')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Next Session</span>
                  <span className="text-white">{format(new Date(member.nextSession), 'MMM dd')}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-white/70 text-sm mb-1">Goals</p>
                <div className="flex flex-wrap gap-1">
                  {member.goals.map((goal, index) => (
                    <span key={index} className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                      {goal}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="glass"
                  onClick={() => {
                    setSelectedMember(member);
                    setIsSessionModalOpen(true);
                  }}
                  icon={Plus}
                  className="flex-1"
                >
                  Record Session
                </Button>
                <button
                  onClick={() => handleContactMember(member)}
                  className="p-2 rounded-lg hover:bg-white/10 text-green-400 hover:text-green-300 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Upcoming Sessions
        </h3>
        
        <div className="space-y-4">
          {mockUpcomingSessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-white font-bold text-lg">{format(new Date(session.date), 'dd')}</p>
                  <p className="text-white/60 text-sm">{format(new Date(session.date), 'MMM')}</p>
                </div>
                <div>
                  <p className="text-white font-medium">{session.time} - {session.memberName}</p>
                  <p className="text-white/60 text-sm">{session.type} • {session.duration} min</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  session.status === 'confirmed' 
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {session.status}
                </span>
                <Button size="sm" variant="outline">
                  Reschedule
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          My Schedule
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockTrainerData.availability.map((slot, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{slot.day}</span>
                <div className={`w-3 h-3 rounded-full ${
                  slot.isAvailable ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
              </div>
              <p className="text-white/80 text-sm">
                {slot.isAvailable ? `${slot.startTime} - ${slot.endTime}` : 'Day Off'}
              </p>
              {slot.isAvailable && (
                <p className="text-white/60 text-xs mt-1">
                  {Math.floor(Math.random() * 4) + 1} sessions booked
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Client Progress Overview */}
      <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Client Progress Overview
        </h3>
        
        <div className="space-y-4">
          {mockAssignedMembers.map((member) => (
            <div key={member.id} className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {member.photo ? (
                    <img src={member.photo} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent-orange rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  )}
                  <div>
                    <h4 className="text-white font-medium">{member.name}</h4>
                    <p className="text-white/60 text-sm">{member.totalSessions} total sessions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedMember(member);
                      setIsSessionModalOpen(true);
                    }}
                    className="p-2 rounded-lg hover:bg-white/10 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleContactMember(member)}
                    className="p-2 rounded-lg hover:bg-white/10 text-green-400 hover:text-green-300 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-white/70 text-sm">Goals</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {member.goals.map((goal, index) => (
                      <span key={index} className="px-2 py-1 bg-accent-gold/20 text-accent-gold rounded text-xs">
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Next Session</p>
                  <p className="text-white text-sm">{format(new Date(member.nextSession), 'MMM dd, yyyy')}</p>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-white/70 text-sm mb-1">Latest Progress Notes</p>
                <p className="text-white/80 text-sm">{member.progressNotes}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Record Session Modal */}
      <Modal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        title="Record Training Session"
      >
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-2">
              Record Session for {selectedMember?.name}
            </h3>
            <p className="text-white/70">
              {format(new Date(), 'MMMM dd, yyyy')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Session Type</label>
              <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="personal-training">Personal Training</option>
                <option value="cardio">Cardio Session</option>
                <option value="strength">Strength Training</option>
                <option value="flexibility">Flexibility & Mobility</option>
                <option value="assessment">Fitness Assessment</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Duration (minutes)</label>
              <input
                type="number"
                defaultValue="60"
                min="15"
                max="120"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Session Notes</label>
            <textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Describe the session, exercises performed, member progress, and any observations..."
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleRecordSession} className="flex-1" icon={CheckCircle}>
              Record Session
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsSessionModalOpen(false)}
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

export default TrainerPortal;