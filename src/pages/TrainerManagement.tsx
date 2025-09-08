import React, { useState } from 'react';
import FeatureGuard from '../components/UI/FeatureGuard';
import { Users, Plus, Edit, Trash2, Eye, Star, Calendar, Clock, Award, Phone, Mail, TrendingUp, UserCheck, DollarSign, Activity, Filter, Download, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Trainer, Member } from '../types';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Breadcrumb from '../components/UI/Breadcrumb';
import StatsCard from '../components/UI/StatsCard';
import FormField from '../components/UI/FormField';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// Mock trainers data
const mockTrainers: Trainer[] = [
  {
    id: '1',
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
    bio: 'Certified personal trainer with 5+ years experience in women\'s fitness and nutrition. Specializes in weight loss and strength training programs.'
  },
  {
    id: '2',
    name: 'Emma Wilson',
    email: 'emma@forfit.qa',
    phone: '+974 5555-0202',
    specializations: ['Yoga', 'Pilates', 'Flexibility', 'Meditation'],
    certifications: ['RYT-500', 'Pilates Instructor', 'Mindfulness Coach'],
    experience: 3,
    hourlyRate: 65,
    availability: [
      { day: 'Monday', startTime: '08:00', endTime: '16:00', isAvailable: true },
      { day: 'Tuesday', startTime: '08:00', endTime: '16:00', isAvailable: true },
      { day: 'Wednesday', startTime: '08:00', endTime: '16:00', isAvailable: true },
      { day: 'Thursday', startTime: '08:00', endTime: '16:00', isAvailable: true },
      { day: 'Friday', startTime: '08:00', endTime: '16:00', isAvailable: true },
      { day: 'Saturday', startTime: '08:00', endTime: '12:00', isAvailable: true },
      { day: 'Sunday', startTime: '08:00', endTime: '12:00', isAvailable: true },
    ],
    clients: ['member-4', 'member-5'],
    bio: 'Yoga and Pilates specialist focused on mind-body wellness and injury prevention. Certified in various yoga styles and meditation techniques.'
  },
  {
    id: '3',
    name: 'Jessica Martinez',
    email: 'jessica@forfit.qa',
    phone: '+974 5555-0203',
    specializations: ['Cardio', 'Dance Fitness', 'Group Classes'],
    certifications: ['ACE-CPT', 'Zumba Instructor', 'Spin Instructor'],
    experience: 4,
    hourlyRate: 70,
    availability: [
      { day: 'Monday', startTime: '16:00', endTime: '21:00', isAvailable: true },
      { day: 'Tuesday', startTime: '16:00', endTime: '21:00', isAvailable: true },
      { day: 'Wednesday', startTime: '16:00', endTime: '21:00', isAvailable: true },
      { day: 'Thursday', startTime: '16:00', endTime: '21:00', isAvailable: true },
      { day: 'Friday', startTime: '16:00', endTime: '21:00', isAvailable: true },
      { day: 'Saturday', startTime: '09:00', endTime: '15:00', isAvailable: true },
      { day: 'Sunday', startTime: '09:00', endTime: '15:00', isAvailable: false },
    ],
    clients: ['member-6'],
    photo: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    bio: 'High-energy fitness instructor specializing in cardio and dance fitness. Creates fun, engaging workouts that keep members motivated.'
  }
];

const TrainerManagement: React.FC = () => {
  const { members } = useApp();

  return (
    <FeatureGuard feature="trainer_management">
      <TrainerManagementContent />
    </FeatureGuard>
  );
};

const TrainerManagementContent: React.FC = () => {
  const { members } = useApp();
  const [trainers, setTrainers] = useState<Trainer[]>(mockTrainers);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [filterSpecialization, setFilterSpecialization] = useState<string>('all');
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);

  // Mock session data
  const mockSessions = [
    { id: '1', trainerId: '1', memberId: 'member-1', date: '2024-12-20', time: '08:00', duration: 60, status: 'completed' },
    { id: '2', trainerId: '1', memberId: 'member-2', date: '2024-12-20', time: '10:00', duration: 45, status: 'completed' },
    { id: '3', trainerId: '2', memberId: 'member-4', date: '2024-12-20', time: '09:00', duration: 60, status: 'scheduled' },
    { id: '4', trainerId: '1', memberId: 'member-3', date: '2024-12-21', time: '08:00', duration: 60, status: 'scheduled' },
  ];

  const getTrainerStats = (trainer: Trainer) => {
    const trainerSessions = mockSessions.filter(s => s.trainerId === trainer.id);
    const completedSessions = trainerSessions.filter(s => s.status === 'completed');
    const thisMonthSessions = completedSessions.filter(s => s.date.startsWith('2024-12'));
    
    return {
      totalClients: trainer.clients.length,
      completedSessions: completedSessions.length,
      thisMonthSessions: thisMonthSessions.length,
      monthlyRevenue: thisMonthSessions.length * trainer.hourlyRate,
      retentionRate: 95, // Mock data
      satisfactionScore: 4.8, // Mock data
    };
  };

  const allSpecializations = Array.from(
    new Set(trainers.flatMap(t => t.specializations))
  );

  const filteredTrainers = trainers.filter(trainer => 
    filterSpecialization === 'all' || trainer.specializations.includes(filterSpecialization)
  );

  const handleAddTrainer = () => {
    setSelectedTrainer(null);
    setIsAddModalOpen(true);
  };

  const handleEditTrainer = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setIsEditModalOpen(true);
  };

  const handleViewProfile = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setIsProfileModalOpen(true);
  };

  const handleDeleteTrainer = (trainer: Trainer) => {
    if (window.confirm(`Are you sure you want to remove ${trainer.name}?`)) {
      setTrainers(prev => prev.filter(t => t.id !== trainer.id));
      toast.success('Trainer removed successfully');
    }
  };

  const exportTrainerReport = () => {
    toast.success('Trainer performance report exported to PDF!');
  };

  const exportScheduleReport = () => {
    toast.success('Trainer schedule report exported to CSV!');
  };

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Trainer Management</h1>
          <p className="text-white/70">Manage trainers, schedules, and performance metrics</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportScheduleReport} icon={Download}>
            Schedule Report
          </Button>
          <Button variant="outline" onClick={exportTrainerReport} icon={Download}>
            Performance Report
          </Button>
          <Button onClick={handleAddTrainer} icon={Plus}>
            Add Trainer
          </Button>
        </div>
      </div>

      {/* Trainer Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Trainers"
          value={trainers.length}
          icon={Users}
          color="from-blue-500 to-cyan-600"
        />
        <StatsCard
          title="Active Trainers"
          value={trainers.filter(t => t.availability.some(a => a.isAvailable)).length}
          icon={UserCheck}
          color="from-green-500 to-emerald-600"
        />
        <StatsCard
          title="Total Clients"
          value={trainers.reduce((sum, t) => sum + t.clients.length, 0)}
          icon={Activity}
          color="from-purple-500 to-indigo-600"
        />
        <StatsCard
          title="Monthly Revenue"
          value={`$${trainers.reduce((sum, t) => sum + getTrainerStats(t).monthlyRevenue, 0).toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 12, isPositive: true }}
          color="from-green-500 to-emerald-600"
        />
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex items-center gap-4">
          <Filter className="w-4 h-4 text-white/70" />
          <select
            value={filterSpecialization}
            onChange={(e) => setFilterSpecialization(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Specializations</option>
            {allSpecializations.map(spec => (
              <option key={spec} value={spec} className="bg-secondary text-white">{spec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Trainers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTrainers.map((trainer) => {
          const stats = getTrainerStats(trainer);
          return (
            <div key={trainer.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="flex items-start gap-4 mb-6">
                {trainer.photo ? (
                  <img
                    src={trainer.photo}
                    alt={trainer.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent-orange rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-white">{trainer.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-white/80 text-sm">{stats.satisfactionScore}</span>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm mb-2">{trainer.experience} years experience • ${trainer.hourlyRate}/hour</p>
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="w-4 h-4 text-white/60" />
                    <span className="text-white/80 text-sm">{trainer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-white/60" />
                    <span className="text-white/80 text-sm">{trainer.phone}</span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-white font-bold text-lg">{stats.totalClients}</p>
                  <p className="text-white/60 text-sm">Active Clients</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-white font-bold text-lg">{stats.thisMonthSessions}</p>
                  <p className="text-white/60 text-sm">Sessions This Month</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-white font-bold text-lg">{stats.retentionRate}%</p>
                  <p className="text-white/60 text-sm">Retention Rate</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-white font-bold text-lg">${stats.monthlyRevenue}</p>
                  <p className="text-white/60 text-sm">Monthly Revenue</p>
                </div>
              </div>

              {/* Specializations */}
              <div className="mb-4">
                <p className="text-white/70 text-sm mb-2">Specializations</p>
                <div className="flex flex-wrap gap-2">
                  {trainer.specializations.map((spec, index) => (
                    <span key={index} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="mb-6">
                <p className="text-white/70 text-sm mb-2">Certifications</p>
                <div className="flex flex-wrap gap-2">
                  {trainer.certifications.map((cert, index) => (
                    <span key={index} className="px-3 py-1 bg-accent-gold/20 text-accent-gold rounded-full text-sm">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="glass"
                  onClick={() => handleViewProfile(trainer)}
                  icon={Eye}
                  className="flex-1"
                >
                  View Profile
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditTrainer(trainer)}
                  icon={Edit}
                  className="flex-1"
                >
                  Edit
                </Button>
                <button
                  onClick={() => handleDeleteTrainer(trainer)}
                  className="p-2 rounded-lg hover:bg-white/10 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Schedule Overview */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Schedule Overview
          </h3>
          <div className="flex items-center gap-4">
            <input
              type="week"
              value={selectedWeek.getFullYear() + '-W' + String(Math.ceil((selectedWeek.getTime() - new Date(selectedWeek.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))).padStart(2, '0')}
              onChange={(e) => setSelectedWeek(new Date(e.target.value))}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Trainer</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-white">Mon</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-white">Tue</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-white">Wed</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-white">Thu</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-white">Fri</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-white">Sat</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-white">Sun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {trainers.map((trainer) => (
                <tr key={trainer.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent-orange rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">
                          {trainer.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="text-white font-medium">{trainer.name}</span>
                    </div>
                  </td>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                    const dayAvailability = trainer.availability.find(a => a.day === day);
                    return (
                      <td key={day} className="px-4 py-3 text-center">
                        {dayAvailability?.isAvailable ? (
                          <div className="text-xs">
                            <div className="text-green-300 font-medium">
                              {dayAvailability.startTime} - {dayAvailability.endTime}
                            </div>
                            <div className="text-white/60 mt-1">
                              {mockSessions.filter(s => s.trainerId === trainer.id && new Date(s.date).getDay() === ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(day)).length} sessions
                            </div>
                          </div>
                        ) : (
                          <span className="text-red-400 text-xs">Off</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Assignments */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <UserCheck className="w-5 h-5" />
          Client Assignments
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Member</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Assigned Trainer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Sessions This Month</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Last Session</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Next Session</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {members.filter(m => m.personalTrainer).map((member) => {
                const trainer = trainers.find(t => t.name === member.personalTrainer);
                const memberSessions = mockSessions.filter(s => s.memberId === member.id);
                const lastSession = memberSessions.filter(s => s.status === 'completed').pop();
                const nextSession = memberSessions.find(s => s.status === 'scheduled');
                
                return (
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
                          <p className="text-white/60 text-sm">{member.subscriptionPlan}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {trainer?.photo ? (
                          <img src={trainer.photo} alt={trainer.name} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                            <Users className="w-3 h-3 text-primary" />
                          </div>
                        )}
                        <span className="text-white/80">{member.personalTrainer}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/80">
                      {memberSessions.filter(s => s.status === 'completed' && s.date.startsWith('2024-12')).length}
                    </td>
                    <td className="px-6 py-4 text-white/80">
                      {lastSession ? format(new Date(lastSession.date), 'MMM dd') : 'None'}
                    </td>
                    <td className="px-6 py-4 text-white/80">
                      {nextSession ? `${format(new Date(nextSession.date), 'MMM dd')} at ${nextSession.time}` : 'None scheduled'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button size="sm" variant="glass">
                        Manage
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Upcoming Sessions (Next 7 Days)
        </h3>
        
        <div className="space-y-3">
          {mockSessions.filter(s => s.status === 'scheduled').map((session) => {
            const trainer = trainers.find(t => t.id === session.trainerId);
            const member = members.find(m => m.id === session.memberId);
            
            return (
              <div key={session.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-white font-bold">{format(new Date(session.date), 'dd')}</p>
                    <p className="text-white/60 text-xs">{format(new Date(session.date), 'MMM')}</p>
                  </div>
                  <div>
                    <p className="text-white font-medium">{session.time} - {trainer?.name}</p>
                    <p className="text-white/60 text-sm">with {member?.name} • {session.duration} min</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                    Scheduled
                  </span>
                  <Button size="sm" variant="outline">
                    Reschedule
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Trainer Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setEditingTrainer(null);
        }}
        title={editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}
        size="lg"
      >
        <TrainerForm
          trainer={editingTrainer}
          onSuccess={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            setEditingTrainer(null);
            toast.success(editingTrainer ? 'Trainer updated successfully!' : 'Trainer added successfully!');
          }}
        />
      </Modal>

      {/* Trainer Profile Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedTrainer(null);
        }}
        title="Trainer Profile"
        size="xl"
      >
        {selectedTrainer && <TrainerProfile trainer={selectedTrainer} />}
      </Modal>
    </div>
  );
};

// Trainer Form Component
const TrainerForm: React.FC<{ trainer?: Trainer | null; onSuccess: () => void }> = ({ trainer, onSuccess }) => {
  const [trainerPhoto, setTrainerPhoto] = useState<string | null>(trainer?.photo || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: trainer?.name || '',
    email: trainer?.email || '',
    phone: trainer?.phone || '',
    experience: trainer?.experience || 1,
    hourlyRate: trainer?.hourlyRate || 50,
    bio: trainer?.bio || '',
    specializations: trainer?.specializations || [],
  });
  const [certifications, setCertifications] = useState<string[]>(trainer?.certifications || ['']);
  const [newCertification, setNewCertification] = useState('');

  const availableSpecializations = [
    'Weight Loss', 'Strength Training', 'HIIT', 'Yoga', 'Pilates', 
    'Flexibility', 'Meditation', 'Cardio', 'Dance Fitness', 'Group Classes',
    'Nutrition', 'Rehabilitation', 'Sports Performance'
  ];

  const handlePhotoUpload = (file: File) => {
    if (!file.type.match(/^image\/(png|jpg|jpeg)$/)) {
      toast.error('Please upload a PNG or JPG file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setTrainerPhoto(e.target?.result as string);
      toast.success('Photo uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handlePhotoUpload(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handlePhotoUpload(files[0]);
    }
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setCertifications(prev => [...prev, newCertification.trim()]);
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    setCertifications(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trainerData = {
      ...formData,
      certifications: certifications.filter(cert => cert.trim()),
      photo: trainerPhoto
    };
    
    // In real app, would save to database
    console.log('Saving trainer:', trainerData);
    onSuccess();
  };

  const toggleSpecialization = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Picture Upload */}
      <div className="bg-white/5 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Profile Picture</h3>
        
        <div className="flex items-center gap-6">
          {trainerPhoto ? (
            <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10">
              <img src={trainerPhoto} alt="Trainer" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
              <User className="w-12 h-12 text-white/50" />
            </div>
          )}
          
          <div className="flex-1">
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
                isDragging
                  ? 'border-primary bg-primary/10'
                  : 'border-white/20 hover:border-white/40'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
            >
              <div className="space-y-2">
                <p className="text-white/80 text-sm">Drag & drop photo here or</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="glass"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </Button>
                <p className="text-white/50 text-xs">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Full Name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
        
        <FormField
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
        
        <FormField
          label="Phone"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          required
        />
        
        <FormField
          label="Years of Experience"
          type="number"
          min="1"
          max="30"
          value={formData.experience.toString()}
          onChange={(e) => setFormData(prev => ({ ...prev, experience: parseInt(e.target.value) }))}
          required
        />
        
        <FormField
          label="Hourly Rate ($)"
          type="number"
          min="25"
          max="200"
          value={formData.hourlyRate.toString()}
          onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) }))}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">Bio</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          rows={3}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          placeholder="Brief description of trainer's background and approach..."
        />
      </div>

      {/* Certifications Management */}
      <div className="bg-white/5 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Certifications</h3>
        
        <div className="space-y-4">
          {certifications.map((cert, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="text"
                value={cert}
                onChange={(e) => {
                  const updated = [...certifications];
                  updated[index] = e.target.value;
                  setCertifications(updated);
                }}
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Enter certification name"
              />
              <button
                type="button"
                onClick={() => removeCertification(index)}
                className="p-2 rounded-lg hover:bg-white/10 text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newCertification}
              onChange={(e) => setNewCertification(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Add new certification"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCertification();
                }
              }}
            />
            <Button
              type="button"
              variant="glass"
              size="sm"
              onClick={addCertification}
              icon={Plus}
              disabled={!newCertification.trim()}
            >
              Add
            </Button>
          </div>
          
          {certifications.length === 0 && (
            <p className="text-white/50 text-center py-4 text-sm">No certifications added yet</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/90 mb-3">Specializations</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {availableSpecializations.map((spec) => (
            <label key={spec} className="flex items-center gap-2 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                checked={formData.specializations.includes(spec)}
                onChange={() => toggleSpecialization(spec)}
                className="w-4 h-4 text-primary bg-white/10 border-white/20 rounded focus:ring-primary/50"
              />
              <span className="text-white/80 text-sm">{spec}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" className="flex-1">
          {trainer ? 'Update Trainer' : 'Add Trainer'}
        </Button>
        <Button variant="outline" onClick={onSuccess} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};

// Trainer Profile Component
const TrainerProfile: React.FC<{ trainer: Trainer }> = ({ trainer }) => {
  const stats = {
    totalClients: trainer.clients.length,
    completedSessions: 45,
    thisMonthSessions: 12,
    monthlyRevenue: 12 * trainer.hourlyRate,
    retentionRate: 95,
    satisfactionScore: 4.8,
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center gap-6 p-6 bg-white/5 rounded-xl">
        {trainer.photo ? (
          <img
            src={trainer.photo}
            alt={trainer.name}
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent-orange rounded-full flex items-center justify-center">
            <Users className="w-12 h-12 text-white" />
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-2">{trainer.name}</h2>
          <div className="grid grid-cols-2 gap-4 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {trainer.email}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {trainer.phone}
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              {trainer.experience} years experience
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              ${trainer.hourlyRate}/hour
            </div>
          </div>
          {trainer.bio && (
            <p className="text-white/80 mt-3">{trainer.bio}</p>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-white font-bold text-2xl">{stats.totalClients}</p>
          <p className="text-white/60 text-sm">Active Clients</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-white font-bold text-2xl">{stats.thisMonthSessions}</p>
          <p className="text-white/60 text-sm">Sessions This Month</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-white font-bold text-2xl">{stats.retentionRate}%</p>
          <p className="text-white/60 text-sm">Client Retention</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-white font-bold text-2xl">{stats.satisfactionScore}</p>
          <p className="text-white/60 text-sm">Satisfaction Score</p>
        </div>
      </div>

      {/* Specializations & Certifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl p-6">
          <h4 className="text-lg font-medium text-white mb-4">Specializations</h4>
          <div className="flex flex-wrap gap-2">
            {trainer.specializations.map((spec, index) => (
              <span key={index} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                {spec}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6">
          <h4 className="text-lg font-medium text-white mb-4">Certifications</h4>
          <div className="flex flex-wrap gap-2">
            {trainer.certifications.map((cert, index) => (
              <span key={index} className="px-3 py-1 bg-accent-gold/20 text-accent-gold rounded-full text-sm">
                {cert}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="bg-white/5 rounded-xl p-6">
        <h4 className="text-lg font-medium text-white mb-4">Weekly Schedule</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainer.availability.map((slot, index) => (
            <div key={index} className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{slot.day}</span>
                <div className={`w-3 h-3 rounded-full ${
                  slot.isAvailable ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
              </div>
              <p className="text-white/80 text-sm">
                {slot.isAvailable ? `${slot.startTime} - ${slot.endTime}` : 'Not Available'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainerManagement;