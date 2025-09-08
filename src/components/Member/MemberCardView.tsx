import React from 'react';
import { Calendar, CreditCard, User, Phone, Mail, LogOut, QrCode, Star, Clock, Users, Dumbbell, Apple, Key, UserPlus, TrendingUp, Camera, Target } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { format } from 'date-fns';
import Button from '../UI/Button';

const MemberCardView: React.FC = () => {
  const { user, logout } = useAuth();
  const { members } = useApp();
  
  // Find member data based on logged-in user
  let memberData = members.find(m => m.email === user?.email);
  
  // Create mock profile for member@forfit.qa if not found in database
  if (!memberData && user?.email === 'member@forfit.qa') {
    memberData = {
      id: 'mock-member-1',
      name: 'Rachel Kim',
      email: 'member@forfit.qa',
      username: 'rachel_k',
      phone: '+974 5555-0123',
      memberId: 'FL-2024-009',
      joinDate: '2024-01-10',
      subscriptionPlan: 'Premium',
      subscriptionStatus: 'active' as const,
      subscriptionEnd: '2024-12-20',
      age: 29,
      emergencyContact: 'Sarah Kim (Sister) - +974 5555-0124',
      medicalNotes: 'No restrictions',
      lastAttendance: '2024-12-20',
      lastLogin: '2024-12-20',
      loginStatus: 'active' as const,
      totalSessions: 156,
      remainingSessions: 12,
      personalTrainer: 'Emma',
      photo: 'https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
      customBenefits: [
        '24/7 Gym Access',
        'Personal Training Sessions',
        'All Group Classes',
        'Nutrition Consultation',
        'Premium Locker',
        'Guest Passes'
      ],
      progressPhotos: [
        {
          id: '1',
          url: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
          date: '2024-01-10',
          type: 'before' as const,
          uploadedBy: 'Sarah Johnson'
        },
        {
          id: '2',
          url: 'https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
          date: '2024-12-20',
          type: 'progress' as const,
          weight: 62.5,
          uploadedBy: 'Sarah Johnson'
        }
      ],
      bodyMeasurements: [
        {
          id: '1',
          date: '2024-01-10',
          weight: 68.0,
          bodyFat: 28.5,
          waist: 78.0,
          recordedBy: 'Sarah Johnson'
        },
        {
          id: '2',
          date: '2024-12-20',
          weight: 62.5,
          bodyFat: 22.1,
          waist: 72.0,
          recordedBy: 'Sarah Johnson'
        }
      ],
      classBookings: [
        {
          id: '1',
          memberId: 'mock-member-1',
          classScheduleId: 'schedule-1-1',
          className: 'Morning Yoga',
          date: '2024-12-22',
          time: '08:00',
          status: 'booked' as const,
          bookingDate: '2024-12-20'
        },
        {
          id: '2',
          memberId: 'mock-member-1',
          classScheduleId: 'schedule-2-3',
          className: 'HIIT Blast',
          date: '2024-12-23',
          time: '18:00',
          status: 'booked' as const,
          bookingDate: '2024-12-20'
        }
      ]
    };
  }

  if (!memberData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-secondary to-primary flex items-center justify-center p-6">
        {/* Logout Button */}
        <div className="absolute top-6 right-6">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white border border-white/20"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Member Profile Not Found</h2>
          <p className="text-white/70">Please contact the studio to set up your profile.</p>
        </div>
      </div>
    );
  }

  const membershipBenefits = [
    { icon: Clock, text: '24/7 Gym Access' },
    { icon: User, text: '12 Personal Training Sessions/Month' },
    { icon: Users, text: 'All Group Classes Included' },
    { icon: Apple, text: 'Nutrition Consultation' },
    { icon: Key, text: 'Premium Locker' },
    { icon: UserPlus, text: 'Guest Pass (2/month)' },
  ];

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
        <h1 className="text-4xl font-bold text-white mb-2">Welcome Back!</h1>
        <p className="text-white/70 text-lg">{memberData.name}</p>
      </div>

      {/* Premium Membership Card */}
      <div className="max-w-5xl mx-auto bg-gradient-to-br from-primary via-secondary to-primary rounded-3xl p-10 border border-white/20 relative overflow-hidden shadow-2xl">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-accent-gold/20 rounded-full"></div>
        
        <div className="relative z-10">
          {/* Card Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Forfit Ladies</h2>
              <p className="text-white/80 text-lg">Premium Women's Fitness Studio</p>
              <div className="flex items-center gap-2 mt-2">
                <Star className="w-5 h-5 text-accent-gold" />
                <span className="text-accent-gold font-semibold">Premium Member</span>
              </div>
            </div>
            <div className="text-right">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-3">
                {memberData.photo ? (
                  <img src={memberData.photo} alt={memberData.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {memberData.name.split(' ').map(n => n[0]).join('')}
                  </span>
                )}
              </div>
              <div className="bg-white/10 rounded-lg p-2">
                <QrCode className="w-12 h-12 text-white mx-auto" />
                <p className="text-white/70 text-xs mt-1">Gym Access</p>
              </div>
            </div>
          </div>

          {/* Member Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <p className="text-white/70 mb-2">Member Name</p>
              <p className="text-white font-semibold text-xl">{memberData.name}</p>
            </div>
            <div>
              <p className="text-white/70 mb-2">Member ID</p>
              <p className="text-white font-semibold text-xl font-mono">{memberData.memberId}</p>
            </div>
            <div>
              <p className="text-white/70 mb-2">Membership Type</p>
              <p className="text-white font-semibold text-xl">{memberData.subscriptionPlan}</p>
            </div>
            <div>
              <p className="text-white/70 mb-2">Personal Trainer</p>
              <p className="text-white font-semibold text-lg">{memberData.personalTrainer || 'Not Assigned'}</p>
            </div>
            <div>
              <p className="text-white/70 mb-2">Valid From</p>
              <p className="text-white font-semibold text-lg">{format(new Date(memberData.joinDate), 'MMM dd, yyyy')}</p>
            </div>
            <div>
              <p className="text-white/70 mb-2">Valid Until</p>
              <p className="text-white font-semibold text-lg">{format(new Date(memberData.subscriptionEnd), 'MMM dd, yyyy')}</p>
            </div>
          </div>

          {/* Membership Status and Sessions */}
          <div className="flex items-center justify-between pt-8 border-t border-white/20">
            <div>
              <p className="text-white/70 mb-2">Membership Status</p>
              <span className={`inline-flex px-4 py-2 rounded-full font-medium text-lg ${
                memberData.subscriptionStatus === 'active' 
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-red-500/20 text-red-300'
              }`}>
                {memberData.subscriptionStatus.toUpperCase()}
              </span>
            </div>
            {memberData.remainingSessions && (
              <div className="text-right">
                <p className="text-white/70 mb-2">Sessions Remaining</p>
                <p className="text-white font-bold text-4xl">{memberData.remainingSessions}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Membership Benefits */}
      <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-6 text-center">Your Premium Benefits</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(memberData.customBenefits || membershipBenefits.map(b => b.text)).map((benefitText, index) => {
            const benefit = membershipBenefits.find(b => b.text === benefitText) || { icon: Clock, text: benefitText };
            return (
              <div key={index} className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <benefit.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-white font-medium">{benefit.text}</span>
            </div>
            );
          })}
        </div>
      </div>

      {/* Progress Overview */}
      <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-6 text-center flex items-center justify-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Your Progress Journey
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Progress Photos */}
          <div>
            <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-400" />
              Progress Photos
            </h4>
            {memberData.progressPhotos && memberData.progressPhotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {memberData.progressPhotos.map((photo) => (
                  <div key={photo.id} className="relative">
                    <img
                      src={photo.url}
                      alt={`${photo.type} photo`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="bg-black/70 rounded px-2 py-1">
                        <p className="text-white text-xs">
                          {photo.type.charAt(0).toUpperCase() + photo.type.slice(1)}
                        </p>
                        <p className="text-white/80 text-xs">
                          {format(new Date(photo.date), 'MMM dd, yyyy')}
                          {photo.weight && ` • ${photo.weight}kg`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No progress photos yet</p>
              </div>
            )}
          </div>

          {/* Body Measurements */}
          <div>
            <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              Body Measurements
            </h4>
            {memberData.bodyMeasurements && memberData.bodyMeasurements.length > 0 ? (
              <div className="space-y-4">
                {(() => {
                  const latest = memberData.bodyMeasurements[memberData.bodyMeasurements.length - 1];
                  const previous = memberData.bodyMeasurements.length > 1 ? memberData.bodyMeasurements[0] : null;
                  
                  return (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <p className="text-white font-bold text-xl">{latest.weight} kg</p>
                        <p className="text-white/60 text-sm">Current Weight</p>
                        {previous && (
                          <p className={`text-xs mt-1 ${
                            latest.weight < previous.weight ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {latest.weight < previous.weight ? '↓' : '↑'} {Math.abs(latest.weight - previous.weight).toFixed(1)}kg
                          </p>
                        )}
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <p className="text-white font-bold text-xl">{latest.bodyFat}%</p>
                        <p className="text-white/60 text-sm">Body Fat</p>
                        {previous && (
                          <p className={`text-xs mt-1 ${
                            latest.bodyFat < previous.bodyFat ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {latest.bodyFat < previous.bodyFat ? '↓' : '↑'} {Math.abs(latest.bodyFat - previous.bodyFat).toFixed(1)}%
                          </p>
                        )}
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <p className="text-white font-bold text-xl">{latest.waist} cm</p>
                        <p className="text-white/60 text-sm">Waist</p>
                        {previous && (
                          <p className={`text-xs mt-1 ${
                            latest.waist < previous.waist ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {latest.waist < previous.waist ? '↓' : '↑'} {Math.abs(latest.waist - previous.waist).toFixed(1)}cm
                          </p>
                        )}
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <p className="text-white font-bold text-xl">
                          {format(new Date(latest.date), 'MMM dd')}
                        </p>
                        <p className="text-white/60 text-sm">Last Measured</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No measurements recorded</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Classes */}
      <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-6 text-center flex items-center justify-center gap-2">
          <Calendar className="w-5 h-5" />
          Upcoming Classes
        </h3>
        
        {memberData.classBookings && memberData.classBookings.length > 0 ? (
          <div className="space-y-4">
            {memberData.classBookings.filter(b => new Date(b.date) >= new Date()).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-white font-bold text-lg">{format(new Date(booking.date), 'dd')}</p>
                    <p className="text-white/60 text-sm">{format(new Date(booking.date), 'MMM')}</p>
                  </div>
                  <div>
                    <p className="text-white font-medium">{booking.className}</p>
                    <p className="text-white/60 text-sm">{booking.time} • {format(new Date(booking.date), 'EEEE')}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium">
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-white/60">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No upcoming classes booked</p>
          </div>
        )}
      </div>

      {/* Contact Information */}
      <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Contact Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
            <Mail className="w-5 h-5 text-primary" />
            <div>
              <p className="text-white/70 text-sm">Email</p>
              <p className="text-white font-medium">{memberData.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
            <Phone className="w-5 h-5 text-primary" />
            <div>
              <p className="text-white/70 text-sm">Phone</p>
              <p className="text-white font-medium">{memberData.phone}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg md:col-span-2">
            <User className="w-5 h-5 text-primary" />
            <div>
              <p className="text-white/70 text-sm">Emergency Contact</p>
              <p className="text-white font-medium">{memberData.emergencyContact}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="max-w-5xl mx-auto">
        <h3 className="text-lg font-semibold text-white mb-4 text-center">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="glass" className="w-full py-4" icon={Clock}>
            Check In
          </Button>
          <Button variant="glass" className="w-full py-4" icon={Clock}>
            View Schedule
          </Button>
          <Button variant="glass" className="w-full py-4" icon={User}>
            Contact Trainer
          </Button>
          <Button variant="glass" className="w-full py-4" icon={CreditCard}>
            Payment History
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center">
          <Dumbbell className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-3xl font-bold text-white mb-2">{memberData.totalSessions}</p>
          <p className="text-white/70">Total Sessions</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center">
          <Calendar className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-3xl font-bold text-white mb-2">
            {memberData.lastAttendance ? format(new Date(memberData.lastAttendance), 'MMM dd') : 'Never'}
          </p>
          <p className="text-white/70">Last Visit</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center">
          <User className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-3xl font-bold text-white mb-2">{memberData.age}</p>
          <p className="text-white/70">Age</p>
        </div>
      </div>
    </div>
  );
};

export default MemberCardView;