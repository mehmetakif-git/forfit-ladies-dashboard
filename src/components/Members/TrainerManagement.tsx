import React, { useState } from 'react';
import { format } from 'date-fns';
import { User, Calendar, MessageCircle, Star, Clock, Award, Phone, Mail, Plus, Edit } from 'lucide-react';
import { Member, Trainer } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import FormField from '../UI/FormField';
import toast from 'react-hot-toast';

interface TrainerManagementProps {
  member: Member;
}

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
    ],
    clients: ['member-1', 'member-2'],
    photo: 'https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    bio: 'Certified personal trainer with 5+ years experience in women\'s fitness and nutrition.'
  },
  {
    id: '2',
    name: 'Emma Wilson',
    email: 'emma@forfit.qa',
    phone: '+974 5555-0202',
    specializations: ['Yoga', 'Pilates', 'Flexibility'],
    certifications: ['RYT-500', 'Pilates Instructor'],
    experience: 3,
    hourlyRate: 65,
    availability: [
      { day: 'Thursday', startTime: '08:00', endTime: '16:00', isAvailable: true },
      { day: 'Friday', startTime: '08:00', endTime: '16:00', isAvailable: true },
      { day: 'Saturday', startTime: '08:00', endTime: '12:00', isAvailable: true },
    ],
    clients: ['member-3'],
    bio: 'Yoga and Pilates specialist focused on mind-body wellness and injury prevention.'
  }
];

const TrainerManagement: React.FC<TrainerManagementProps> = ({ member }) => {
  const { updateMember } = useApp();
  const { user } = useAuth();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');

  const assignedTrainer = mockTrainers.find(t => t.id === member.assignedTrainer);
  
  // Mock session history
  const sessionHistory = [
    {
      id: '1',
      date: '2024-12-18',
      duration: 60,
      type: 'Personal Training',
      notes: 'Focused on upper body strength. Great progress on bench press.',
      trainerName: 'Sarah Johnson'
    },
    {
      id: '2',
      date: '2024-12-15',
      duration: 45,
      type: 'Cardio Session',
      notes: 'HIIT workout. Improved endurance significantly.',
      trainerName: 'Sarah Johnson'
    },
    {
      id: '3',
      date: '2024-12-12',
      duration: 60,
      type: 'Strength Training',
      notes: 'Lower body focus. Proper squat form achieved.',
      trainerName: 'Sarah Johnson'
    }
  ];

  const handleAssignTrainer = (trainerId: string) => {
    updateMember(member.id, { assignedTrainer: trainerId });
    setIsAssignModalOpen(false);
    toast.success('Trainer assigned successfully!');
  };

  const handleUnassignTrainer = () => {
    updateMember(member.id, { assignedTrainer: undefined });
    toast.success('Trainer unassigned successfully!');
  };

  const handleAddSession = () => {
    if (!sessionNotes.trim()) {
      toast.error('Please add session notes');
      return;
    }
    
    // In real app, this would save to database
    setIsSessionModalOpen(false);
    setSessionNotes('');
    toast.success('Training session recorded!');
  };

  return (
    <div className="space-y-6">
      {/* Current Trainer */}
      <div className="bg-white/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            Assigned Trainer
          </h3>
          <div className="flex gap-3">
            {assignedTrainer && (
              <Button variant="outline" onClick={handleUnassignTrainer}>
                Unassign
              </Button>
            )}
            <Button onClick={() => setIsAssignModalOpen(true)} icon={assignedTrainer ? Edit : Plus}>
              {assignedTrainer ? 'Change Trainer' : 'Assign Trainer'}
            </Button>
          </div>
        </div>

        {assignedTrainer ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              {assignedTrainer.photo ? (
                <img
                  src={assignedTrainer.photo}
                  alt={assignedTrainer.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent-orange rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h4 className="text-white font-semibold text-lg">{assignedTrainer.name}</h4>
                <p className="text-white/70 text-sm">{assignedTrainer.experience} years experience</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-white/80 text-sm">4.9 rating</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-white/60" />
                <span className="text-white/80 text-sm">{assignedTrainer.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-white/60" />
                <span className="text-white/80 text-sm">{assignedTrainer.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-white/60" />
                <span className="text-white/80 text-sm">${assignedTrainer.hourlyRate}/hour</span>
              </div>
            </div>

            <div className="md:col-span-2">
              <p className="text-white/70 text-sm mb-2">Specializations</p>
              <div className="flex flex-wrap gap-2">
                {assignedTrainer.specializations.map((spec, index) => (
                  <span key={index} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <p className="text-white/70 text-sm mb-2">Certifications</p>
              <div className="flex flex-wrap gap-2">
                {assignedTrainer.certifications.map((cert, index) => (
                  <span key={index} className="px-3 py-1 bg-accent-gold/20 text-accent-gold rounded-full text-sm">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-white/60">
            <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No trainer assigned</p>
            <p className="text-sm">Assign a personal trainer to track progress and sessions</p>
          </div>
        )}
      </div>

      {/* Training Sessions */}
      <div className="bg-white/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Training Sessions ({sessionHistory.length})
          </h3>
          {assignedTrainer && (
            <Button onClick={() => setIsSessionModalOpen(true)} icon={Plus}>
              Record Session
            </Button>
          )}
        </div>

        {sessionHistory.length > 0 ? (
          <div className="space-y-3">
            {sessionHistory.map((session) => (
              <div key={session.id} className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-white font-medium">
                      {new Date(session.date).toLocaleDateString('en-GB')}
                    </span>
                    <span className="text-white/60">•</span>
                    <span className="text-white/80">{session.duration} min</span>
                  </div>
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                    {session.type}
                  </span>
                </div>
                <p className="text-white/80 text-sm mb-2">{session.notes}</p>
                <p className="text-white/60 text-xs">Trainer: {session.trainerName}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-white/60">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No training sessions recorded</p>
            <p className="text-sm">Sessions will appear here once a trainer is assigned</p>
          </div>
        )}
      </div>

      {/* Trainer Availability */}
      {assignedTrainer && (
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Trainer Availability
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedTrainer.availability.map((slot, index) => (
              <div key={index} className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{slot.day}</span>
                  <div className={`w-3 h-3 rounded-full ${
                    slot.isAvailable ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                </div>
                <p className="text-white/80 text-sm">
                  {slot.startTime} - {slot.endTime}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assign Trainer Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Personal Trainer"
        size="lg"
      >
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-2">
              Select Trainer for {member.name}
            </h3>
            <p className="text-white/70">
              Choose a qualified personal trainer based on member's goals
            </p>
          </div>

          <div className="space-y-4">
            {mockTrainers.map((trainer) => (
              <div key={trainer.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4 mb-3">
                  {trainer.photo ? (
                    <img
                      src={trainer.photo}
                      alt={trainer.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent-orange rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{trainer.name}</h4>
                    <p className="text-white/70 text-sm">{trainer.experience} years • ${trainer.hourlyRate}/hour</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-white/80 text-sm">4.9 • {trainer.clients.length} clients</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAssignTrainer(trainer.id)}
                    disabled={member.assignedTrainer === trainer.id}
                  >
                    {member.assignedTrainer === trainer.id ? 'Assigned' : 'Assign'}
                  </Button>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-white/70 text-sm mb-1">Specializations</p>
                    <div className="flex flex-wrap gap-1">
                      {trainer.specializations.map((spec, index) => (
                        <span key={index} className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-white/70 text-sm mb-1">Certifications</p>
                    <div className="flex flex-wrap gap-1">
                      {trainer.certifications.map((cert, index) => (
                        <span key={index} className="px-2 py-1 bg-accent-gold/20 text-accent-gold rounded text-xs">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>

                  {trainer.bio && (
                    <p className="text-white/80 text-sm">{trainer.bio}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Record Session Modal */}
      <Modal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        title="Record Training Session"
      >
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-2">
              Record Session for {member.name}
            </h3>
            <p className="text-white/70">
              Trainer: {assignedTrainer?.name}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Session Date"
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
            />
            
            <FormField
              label="Duration (minutes)"
              type="number"
              defaultValue="60"
              min="15"
              max="120"
            />
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/90 mb-2">
                Session Type
              </label>
              <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="personal-training">Personal Training</option>
                <option value="cardio">Cardio Session</option>
                <option value="strength">Strength Training</option>
                <option value="flexibility">Flexibility & Mobility</option>
                <option value="assessment">Fitness Assessment</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Session Notes
            </label>
            <textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Describe the session, exercises performed, member progress, and any observations..."
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleAddSession} className="flex-1">
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

export default TrainerManagement;