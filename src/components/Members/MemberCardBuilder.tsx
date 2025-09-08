import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Upload, User, CreditCard, QrCode, Star, Check } from 'lucide-react';
import { Member } from '../../types';
import { useApp } from '../../context/AppContext';
import FormField from '../UI/FormField';
import Button from '../UI/Button';
import toast from 'react-hot-toast';

interface MemberCardBuilderProps {
  member?: Member;
  onSuccess: () => void;
}

interface MemberFormData {
  name: string;
  email: string;
  username: string;
  phone: string;
  password: string;
  confirmPassword: string;
  newPassword?: string;
  confirmNewPassword?: string;
  age: number;
  subscriptionPlan: string;
  subscriptionEnd: string;
  emergencyContact: string;
  personalTrainer: string;
  medicalNotes?: string;
  sendCredentials: boolean;
}

const MemberCardBuilder: React.FC<MemberCardBuilderProps> = ({ member, onSuccess }) => {
  const { addMember, updateMember, members, getSubscriptionPlans } = useApp();
  const [memberPhoto, setMemberPhoto] = useState<string | null>(member?.photo || null);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>(
    member?.customBenefits || []
  );
  const [previewData, setPreviewData] = useState({
    name: member?.name || '',
    plan: member?.subscriptionPlan || '',
    memberId: member?.memberId || ''
  });
  
  const subscriptionPlans = getSubscriptionPlans().filter(plan => plan.enabled !== false);
  
  // Generate unique Member ID
  const generateMemberId = () => {
    const year = new Date().getFullYear();
    const existingIds = members.map(m => m.memberId).filter(id => id && typeof id === 'string' && id.startsWith(`FL-${year}-`));
    const numbers = existingIds.map(id => parseInt(id.split('-')[2])).filter(n => !isNaN(n));
    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `FL-${year}-${nextNumber.toString().padStart(3, '0')}`;
  };

  const generatedMemberId = member?.memberId || generateMemberId();

  const { register, handleSubmit, formState: { errors }, watch } = useForm<MemberFormData>({
    defaultValues: member ? {
      name: member.name,
      email: member.email,
      username: member.username || '',
      phone: member.phone,
      age: member.age,
      subscriptionPlan: member.subscriptionPlan,
      subscriptionEnd: member.subscriptionEnd,
      emergencyContact: member.emergencyContact,
      personalTrainer: member.personalTrainer || '',
      medicalNotes: member.medicalNotes || '',
      sendCredentials: false,
    } : {
      subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      sendCredentials: true,
      memberId: generatedMemberId
    }
  });

  const selectedPlan = watch('subscriptionPlan');
  const planDetails = subscriptionPlans.find(p => p.name === selectedPlan);
  const watchedName = watch('name');
  const watchedPlan = watch('subscriptionPlan');

  // Update preview data when form changes
  React.useEffect(() => {
    setPreviewData({
      name: watchedName || 'Member Name',
      plan: watchedPlan || 'Select Plan',
      memberId: generatedMemberId
    });
  }, [watchedName, watchedPlan, generatedMemberId]);

  const availableBenefits = [
    '24/7 Gym Access',
    'Personal Training Sessions',
    'All Group Classes',
    'Nutrition Consultation',
    'Premium Locker',
    'Guest Passes',
    'Spa Access',
    'Meal Planning',
    'Priority Booking',
    'Mobile App Access',
  ];

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setMemberPhoto(e.target?.result as string);
        toast.success('Photo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleBenefit = (benefit: string) => {
    setSelectedBenefits(prev => 
      prev.includes(benefit) 
        ? prev.filter(b => b !== benefit)
        : [...prev, benefit]
    );
  };

  const onSubmit = (data: MemberFormData) => {
    // Password validation for new members
    if (!member) {
      if (data.password !== data.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (data.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
    } else {
      // Password validation for existing members (only if they're updating password)
      if (data.newPassword && data.newPassword !== data.confirmNewPassword) {
        toast.error('New passwords do not match');
        return;
      }
      if (data.newPassword && data.newPassword.length < 6) {
        toast.error('New password must be at least 6 characters');
        return;
      }
    }

    // Email uniqueness check
    const emailExists = members.some(m => m.email === data.email && m.id !== member?.id);
    if (emailExists) {
      toast.error('Email already exists');
      return;
    }

    // Username uniqueness check
    const usernameExists = members.some(m => m.username === data.username && m.id !== member?.id);
    if (usernameExists) {
      toast.error('Username already exists');
      return;
    }

    const memberData = {
      ...data,
      memberId: generatedMemberId,
      joinDate: member?.joinDate || new Date().toISOString().split('T')[0],
      subscriptionStatus: 'active' as const,
      totalSessions: member?.totalSessions || 0,
      remainingSessions: planDetails?.sessions || 0,
      lastLogin: member?.lastLogin,
      loginStatus: member?.loginStatus || 'inactive' as const,
      photo: memberPhoto,
      customBenefits: selectedBenefits,
      // Only update password if it's provided (for existing members)
      ...(member && data.newPassword ? { password: data.newPassword } : {}),
      // For new members, always include password
      ...(!member ? { password: data.password } : {}),
    };

    if (member) {
      updateMember(member.id, memberData);
      toast.success('Member updated successfully!');
    } else {
      addMember(memberData);
      if (data.sendCredentials) {
        toast.success(`Member created! Username: ${data.username}, Email: ${data.email}, Password: ${data.password}`);
      } else {
        toast.success('Member created successfully!');
      }
    }
    
    onSuccess();
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Full Name"
              {...register('name', { required: 'Name is required' })}
              error={errors.name?.message}
            />
            
            <FormField
              label="Age"
              type="number"
              {...register('age', { 
                required: 'Age is required',
                min: { value: 16, message: 'Must be at least 16 years old' }
              })}
              error={errors.age?.message}
            />
            
            <FormField
              label="Phone Number"
              {...register('phone', { required: 'Phone is required' })}
              error={errors.phone?.message}
            />
            
            <FormField
              label="Emergency Contact"
              {...register('emergencyContact', { required: 'Emergency contact is required' })}
              error={errors.emergencyContact?.message}
              placeholder="Name - Phone Number"
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-white/90 mb-2">
              Medical Notes (Optional)
            </label>
            <textarea
              {...register('medicalNotes')}
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Any medical conditions, allergies, or restrictions..."
            />
          </div>
        </div>

        {/* Member Photo Upload */}
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Member Photo
          </h3>
          
          <div className="flex items-center gap-6">
            {memberPhoto ? (
              <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10">
                <img src={memberPhoto} alt="Member" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
                <User className="w-12 h-12 text-white/50" />
              </div>
            )}
            
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white hover:bg-white/20 transition-colors"
              >
                Upload Photo
              </label>
              <p className="text-white/60 text-sm mt-2">Recommended: 400x400px, max 5MB</p>
            </div>
          </div>
        </div>

        {/* Login Credentials */}
        {!member && (
          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Login Credentials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Email (Login)"
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                error={errors.email?.message}
              />
              
              <FormField
                label="Username"
                {...register('username', { 
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Username must be at least 3 characters' }
                })}
                error={errors.username?.message}
              />
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Member ID</label>
                <input
                  type="text"
                  value={generatedMemberId}
                  disabled
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white/80 font-mono"
                />
              </div>
              <div></div>
              
              <FormField
                label="Password"
                type="password"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                error={errors.password?.message}
              />
              
              <FormField
                label="Confirm Password"
                type="password"
                {...register('confirmPassword', { required: 'Please confirm password' })}
                error={errors.confirmPassword?.message}
              />
            </div>
            
            <div className="mt-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  {...register('sendCredentials')}
                  className="w-4 h-4 text-primary bg-white/10 border-white/20 rounded focus:ring-primary/50"
                />
                <span className="text-white/80">Email credentials to member</span>
              </label>
            </div>
          </div>
        )}

        {/* Edit Login Credentials for Existing Members */}
        {member && (
          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Login Credentials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Email (Login)"
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                error={errors.email?.message}
              />
              
              <FormField
                label="Username"
                {...register('username', { 
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Username must be at least 3 characters' }
                })}
                error={errors.username?.message}
              />
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Member ID</label>
                <input
                  type="text"
                  value={member.memberId}
                  disabled
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white/60"
                />
              </div>
              <div></div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-md font-medium text-white mb-4">Update Password (Optional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="New Password"
                  type="password"
                  {...register('newPassword')}
                  placeholder="Leave blank to keep current password"
                />
                <FormField
                  label="Confirm New Password"
                  type="password"
                  {...register('confirmNewPassword')}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-md font-medium text-white mb-4">Subscription Plan</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Subscription Plan</label>
                  <select
                    {...register('subscriptionPlan', { required: 'Subscription plan is required' })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Select a plan</option>
                    {subscriptionPlans.map(plan => (
                      <option key={plan.name} value={plan.name}>
                        {plan.name} - ${plan.promotionalPrice || plan.price}/month
                        {plan.promotionalPrice && <span className="line-through ml-1">${plan.price}</span>}
                      </option>
                    ))}
                  </select>
                  {errors.subscriptionPlan && (
                    <p className="text-red-400 text-sm mt-1">{errors.subscriptionPlan.message}</p>
                  )}
                </div>
                
                <FormField
                  label="Membership End Date"
                  type="date"
                  {...register('subscriptionEnd', { required: 'End date is required' })}
                  error={errors.subscriptionEnd?.message}
                />
              </div>
            </div>
            
            <FormField
              label="Personal Trainer (Optional)"
              {...register('personalTrainer')}
              placeholder="Trainer name"
            />
          </div>
        )}

        {/* Subscription Plan for New Members */}
        {!member && (
          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Subscription Plan
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Subscription Plan</label>
                <select
                  {...register('subscriptionPlan', { required: 'Subscription plan is required' })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select a plan</option>
                  {subscriptionPlans.map(plan => (
                    <option key={plan.name} value={plan.name}>
                      {plan.name} - ${plan.promotionalPrice || plan.price}/month
                      {plan.promotionalPrice && <span className="line-through ml-1">${plan.price}</span>}
                    </option>
                  ))}
                </select>
                {errors.subscriptionPlan && (
                  <p className="text-red-400 text-sm mt-1">{errors.subscriptionPlan.message}</p>
                )}
              </div>
              
              <FormField
                label="Membership End Date"
                type="date"
                {...register('subscriptionEnd', { required: 'End date is required' })}
                error={errors.subscriptionEnd?.message}
              />
            </div>
            
            <FormField
              label="Personal Trainer (Optional)"
              {...register('personalTrainer')}
              placeholder="Trainer name"
            />
          </div>
        )}

        {/* Benefits Customization */}
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Check className="w-5 h-5" />
            Membership Benefits
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableBenefits.map((benefit) => (
              <label key={benefit} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                <input
                  type="checkbox"
                  checked={selectedBenefits.includes(benefit)}
                  onChange={() => toggleBenefit(benefit)}
                  className="w-4 h-4 text-primary bg-white/10 border-white/20 rounded focus:ring-primary/50"
                />
                <span className="text-white/80">{benefit}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Card Preview */}
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Card Preview
          </h3>
          
          <div className="bg-gradient-to-br from-primary via-secondary to-primary rounded-2xl p-6 border border-white/20 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-white font-bold text-lg">Forfit Ladies</h4>
                <p className="text-white/80 text-sm">{previewData.plan}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <QrCode className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              {memberPhoto ? (
                <img src={memberPhoto} alt="Member" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <p className="text-white font-semibold">{previewData.name}</p>
                <p className="text-white/70 text-sm font-mono">{previewData.memberId}</p>
              </div>
            </div>
            
            <div className="text-white/80 text-sm">
              <p>Benefits: {selectedBenefits.length} selected</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            {member ? 'Update Member Card' : 'Create Member Card'}
          </Button>
          <Button variant="outline" onClick={onSuccess} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MemberCardBuilder;