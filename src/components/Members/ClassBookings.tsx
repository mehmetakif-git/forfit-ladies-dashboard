import React, { useState } from 'react';
import { BookOpen, Calendar, Clock, Users, Plus, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Member, FitnessClass, ClassSchedule, ClassBooking } from '../../types';
import { useApp } from '../../context/AppContext';
import { format, addDays } from 'date-fns';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import toast from 'react-hot-toast';

interface ClassBookingsProps {
  member: Member;
}

// Mock fitness classes
const mockClasses: FitnessClass[] = [
  {
    id: '1',
    name: 'Morning Yoga',
    description: 'Start your day with gentle yoga flow',
    instructor: 'Emma Wilson',
    duration: 60,
    capacity: 15,
    difficulty: 'beginner',
    equipment: ['Yoga Mat', 'Blocks'],
    schedule: [],
    isActive: true
  },
  {
    id: '2',
    name: 'HIIT Blast',
    description: 'High-intensity interval training for maximum results',
    instructor: 'Sarah Johnson',
    duration: 45,
    capacity: 12,
    difficulty: 'intermediate',
    equipment: ['Dumbbells', 'Resistance Bands'],
    schedule: [],
    isActive: true
  },
  {
    id: '3',
    name: 'Strength & Sculpt',
    description: 'Build lean muscle with targeted strength training',
    instructor: 'Sarah Johnson',
    duration: 50,
    capacity: 10,
    difficulty: 'intermediate',
    equipment: ['Barbells', 'Dumbbells', 'Bench'],
    schedule: [],
    isActive: true
  }
];

// Mock class schedules for the next 7 days
const generateMockSchedules = (): ClassSchedule[] => {
  const schedules: ClassSchedule[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = addDays(new Date(), i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Morning Yoga - Daily at 8:00 AM
    schedules.push({
      id: `schedule-1-${i}`,
      classId: '1',
      date: dateStr,
      startTime: '08:00',
      endTime: '09:00',
      instructor: 'Emma Wilson',
      capacity: 15,
      enrolled: i < 3 ? ['member-1', 'member-2'] : ['member-1'],
      waitlist: [],
      status: 'scheduled'
    });
    
    // HIIT Blast - Mon, Wed, Fri at 6:00 PM
    if ([1, 3, 5].includes(date.getDay())) {
      schedules.push({
        id: `schedule-2-${i}`,
        classId: '2',
        date: dateStr,
        startTime: '18:00',
        endTime: '18:45',
        instructor: 'Sarah Johnson',
        capacity: 12,
        enrolled: ['member-3', 'member-4', 'member-5'],
        waitlist: ['member-6'],
        status: 'scheduled'
      });
    }
    
    // Strength & Sculpt - Tue, Thu at 7:00 PM
    if ([2, 4].includes(date.getDay())) {
      schedules.push({
        id: `schedule-3-${i}`,
        classId: '3',
        date: dateStr,
        startTime: '19:00',
        endTime: '19:50',
        instructor: 'Sarah Johnson',
        capacity: 10,
        enrolled: ['member-7', 'member-8'],
        waitlist: [],
        status: 'scheduled'
      });
    }
  }
  
  return schedules;
};

const ClassBookings: React.FC<ClassBookingsProps> = ({ member }) => {
  const { updateMember } = useApp();
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ClassSchedule | null>(null);
  
  const classSchedules = generateMockSchedules();
  const memberBookings = member.classBookings || [];
  
  // Get upcoming bookings
  const upcomingBookings = memberBookings.filter(booking => 
    new Date(booking.date) >= new Date() && booking.status !== 'cancelled'
  );
  
  // Get booking history
  const bookingHistory = memberBookings.filter(booking => 
    new Date(booking.date) < new Date() || booking.status === 'cancelled'
  );

  const handleBookClass = (schedule: ClassSchedule) => {
    const fitnessClass = mockClasses.find(c => c.id === schedule.classId);
    if (!fitnessClass) return;

    const isAlreadyBooked = memberBookings.some(b => 
      b.classScheduleId === schedule.id && b.status !== 'cancelled'
    );

    if (isAlreadyBooked) {
      toast.error('Already booked for this class');
      return;
    }

    const isFull = schedule.enrolled.length >= schedule.capacity;
    
    const newBooking: ClassBooking = {
      id: Date.now().toString(),
      memberId: member.id,
      classScheduleId: schedule.id,
      className: fitnessClass.name,
      date: schedule.date,
      time: schedule.startTime,
      status: 'booked',
      bookingDate: new Date().toISOString().split('T')[0],
      waitlistPosition: isFull ? schedule.waitlist.length + 1 : undefined
    };

    const updatedBookings = [...memberBookings, newBooking];
    updateMember(member.id, { classBookings: updatedBookings });

    if (isFull) {
      toast.success('Added to waitlist! You\'ll be notified if a spot opens up.');
    } else {
      toast.success('Class booked successfully!');
    }
    
    setIsBookModalOpen(false);
  };

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      const updatedBookings = memberBookings.map(b => 
        b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
      );
      updateMember(member.id, { classBookings: updatedBookings });
      toast.success('Booking cancelled successfully!');
    }
  };

  const getClassDetails = (classId: string) => {
    return mockClasses.find(c => c.id === classId);
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'booked': return 'bg-green-500/20 text-green-300';
      case 'attended': return 'bg-blue-500/20 text-blue-300';
      case 'no-show': return 'bg-red-500/20 text-red-300';
      case 'cancelled': return 'bg-gray-500/20 text-gray-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Class Bookings
        </h3>
        <Button onClick={() => setIsBookModalOpen(true)} icon={Plus}>
          Book Class
        </Button>
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-white/5 rounded-xl p-6">
        <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          Upcoming Classes ({upcomingBookings.length})
        </h4>
        
        {upcomingBookings.length > 0 ? (
          <div className="space-y-3">
            {upcomingBookings.map((booking) => {
              const classDetails = getClassDetails(booking.classScheduleId.split('-')[1]);
              return (
                <div key={booking.id} className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <div>
                        <h5 className="text-white font-medium">{booking.className}</h5>
                        <p className="text-white/60 text-sm">
                          {format(new Date(booking.date), 'MMM dd, yyyy')} at {booking.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBookingStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                      {booking.waitlistPosition && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">
                          Waitlist #{booking.waitlistPosition}
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelBooking(booking.id)}
                        icon={X}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                  {classDetails && (
                    <p className="text-white/70 text-sm">
                      {classDetails.description} • {classDetails.duration} min • {classDetails.instructor}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-white/60">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No upcoming class bookings</p>
            <p className="text-sm">Book a class to start your fitness journey</p>
          </div>
        )}
      </div>

      {/* Booking History */}
      <div className="bg-white/5 rounded-xl p-6">
        <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          Booking History ({bookingHistory.length})
        </h4>
        
        {bookingHistory.length > 0 ? (
          <div className="space-y-3">
            {bookingHistory.slice(0, 10).map((booking) => (
              <div key={booking.id} className="p-3 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{booking.className}</p>
                    <p className="text-white/60 text-sm">
                      {format(new Date(booking.date), 'MMM dd, yyyy')} at {booking.time}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBookingStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-white/60">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No booking history</p>
          </div>
        )}
      </div>

      {/* Book Class Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Book a Class"
        size="lg"
      >
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-2">
              Book Class for {member.name}
            </h3>
            <p className="text-white/70">
              Select from available classes in the next 7 days
            </p>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {classSchedules.map((schedule) => {
              const fitnessClass = mockClasses.find(c => c.id === schedule.classId);
              if (!fitnessClass) return null;

              const isBooked = memberBookings.some(b => 
                b.classScheduleId === schedule.id && b.status !== 'cancelled'
              );
              const isFull = schedule.enrolled.length >= schedule.capacity;
              const spotsLeft = schedule.capacity - schedule.enrolled.length;

              return (
                <div key={schedule.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <div>
                        <h5 className="text-white font-medium">{fitnessClass.name}</h5>
                        <p className="text-white/60 text-sm">
                          {format(new Date(schedule.date), 'MMM dd, yyyy')} • {schedule.startTime} - {schedule.endTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isFull && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">
                          Full
                        </span>
                      )}
                      {schedule.waitlist.length > 0 && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">
                          {schedule.waitlist.length} waiting
                        </span>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleBookClass(schedule)}
                        disabled={isBooked}
                        variant={isBooked ? 'outline' : 'glass'}
                      >
                        {isBooked ? 'Booked' : isFull ? 'Join Waitlist' : 'Book'}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-white/70">Instructor</p>
                      <p className="text-white">{schedule.instructor}</p>
                    </div>
                    <div>
                      <p className="text-white/70">Duration</p>
                      <p className="text-white">{fitnessClass.duration} minutes</p>
                    </div>
                    <div>
                      <p className="text-white/70">Availability</p>
                      <p className="text-white">
                        {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-white/80 text-sm">{fitnessClass.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        fitnessClass.difficulty === 'beginner' ? 'bg-green-500/20 text-green-300' :
                        fitnessClass.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {fitnessClass.difficulty}
                      </span>
                      <span className="text-white/60 text-xs">
                        Equipment: {fitnessClass.equipment.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>

      {/* Class Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-white font-bold text-xl">
            {memberBookings.filter(b => b.status === 'attended').length}
          </p>
          <p className="text-white/60 text-sm">Classes Attended</p>
        </div>
        
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <p className="text-white font-bold text-xl">{upcomingBookings.length}</p>
          <p className="text-white/60 text-sm">Upcoming Bookings</p>
        </div>
        
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-white font-bold text-xl">
            {memberBookings.filter(b => b.status === 'no-show').length}
          </p>
          <p className="text-white/60 text-sm">No-Shows</p>
        </div>
      </div>
    </div>
  );
};

export default ClassBookings;