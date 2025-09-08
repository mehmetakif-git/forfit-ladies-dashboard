export interface Member {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  password?: string;
  memberId: string;
  qid?: string;
  joinDate: string;
  subscriptionPlan: string;
  subscriptionStatus: 'active' | 'expired' | 'pending';
  subscriptionEnd: string;
  age: number;
  emergencyContact: string;
  medicalNotes?: string;
  lastAttendance?: string;
  lastLogin?: string;
  loginStatus: 'active' | 'inactive';
  totalSessions: number;
  remainingSessions?: number;
  personalTrainer?: string;
  photo?: string;
  customBenefits?: string[];
  applicationId?: string;
  qidFrontPdf?: string;
  qidBackPdf?: string;
  nfcCard?: {
    uid: string;
    status: 'active' | 'blocked' | 'lost';
    issuedDate: string;
    issuedBy: string;
  };
  currentStatus?: 'inside' | 'outside';
  discount?: {
    percentage: number;
    reason: string;
    appliedBy: string;
    appliedDate: string;
  };
  progressPhotos?: ProgressPhoto[];
  bodyMeasurements?: BodyMeasurement[];
  assignedTrainer?: string;
  trainerNotes?: string;
  classBookings?: ClassBooking[];
}

export interface ProgressPhoto {
  id: string;
  url: string;
  date: string;
  weight?: number;
  notes?: string;
  type: 'before' | 'progress' | 'after';
  uploadedBy: string;
}

export interface BodyMeasurement {
  id: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  recordedBy: string;
  notes?: string;
}

export interface Trainer {
  id: string;
  name: string;
  email: string;
  phone: string;
  specializations: string[];
  certifications: string[];
  experience: number;
  hourlyRate: number;
  availability: TrainerAvailability[];
  clients: string[];
  photo?: string;
  bio?: string;
}

export interface TrainerAvailability {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface FitnessClass {
  id: string;
  name: string;
  description: string;
  instructor: string;
  duration: number;
  capacity: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  schedule: ClassSchedule[];
  isActive: boolean;
  price?: number;
}

export interface ClassSchedule {
  id: string;
  classId: string;
  date: string;
  startTime: string;
  endTime: string;
  instructor: string;
  capacity: number;
  enrolled: string[];
  waitlist: string[];
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

export interface ClassBooking {
  id: string;
  memberId: string;
  classScheduleId: string;
  className: string;
  date: string;
  time: string;
  status: 'booked' | 'attended' | 'no-show' | 'cancelled';
  bookingDate: string;
  waitlistPosition?: number;
}

export interface Subscription {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  color: string;
  sessions?: number;
  popular?: boolean;
  enabled?: boolean;
  durationOptions?: number[];
  promotionalPrice?: number;
}

export interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  method: string;
  description: string;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  checkIn: string;
  checkOut?: string;
  date: string;
  duration?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff' | 'member' | 'trainer';
}

export interface AppSettings {
  id?: string;
  studioName: string;
  currency: string;
  language: 'en' | 'ar';
  theme: {
    primary: string;
    secondary: string;
    accentGold: string;
    accentOrange: string;
  };
  logo?: string;
  favicon?: string;
  subscriptionPlans?: SubscriptionPlan[];
  typingGlowEnabled?: boolean;
}

export interface RegistrationQuestion {
  id: string;
  questionText: string;
  fieldType: 'text' | 'email' | 'phone' | 'number' | 'select' | 'textarea' | 'checkbox' | 'date';
  fieldName: string;
  options?: string[];
  isRequired: boolean;
  orderIndex: number;
  isActive: boolean;
}

export interface MemberApplication {
  id: string;
  formData: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  adminNotes?: string;
}