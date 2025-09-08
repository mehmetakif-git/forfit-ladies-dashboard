import React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Member } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import FormField from '../UI/FormField';
import Button from '../UI/Button';
import { supabase } from '../../lib/supabase'; // Supabase client
import { useState } from 'react';
interface MemberFormProps {
  member?: Member;
  onSuccess: () => void;
}

interface MemberFormData {
  name: string;
  email: string;
  username: string;
  phone: string;
  qid?: string;
  qidFrontPdf?: string;
  qidBackPdf?: string;
  additionalDocuments?: string[];
  password: string;
  confirmPassword: string;
  age: number;
  subscriptionPlan: string;
  subscriptionEnd: string;
  emergencyContact: string;
  personalTrainer?: string;
  medicalNotes?: string;
  discountPercentage?: number;
  discountReason?: string;
}

const MemberForm: React.FC<MemberFormProps> = ({ member, onSuccess }) => {
  const { addMember, updateMember, members, getSubscriptionPlans } = useApp();
  const { user } = useAuth();
  const { t } = useApp();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [qidFrontFile, setQidFrontFile] = useState<string>('');
  const [qidBackFile, setQidBackFile] = useState<string>(member?.qidBackPdf || '');

  const uploadPdfToStorage = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('member-documents')
      .upload(path, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('member-documents')
      .getPublicUrl(path);
      
    return publicUrl;
  };

  const handleQidFrontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.includes('pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    
    setUploading(true);
    setUploadProgress(prev => ({ ...prev, qidFront: 0 }));
    
    try {
      const fileName = `qid_front_${Date.now()}.pdf`;
      const url = await uploadPdfToStorage(file, fileName);
      setQidFrontFile(url);
      toast.success('QID front document uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(prev => ({ ...prev, qidFront: 100 }));
    }
  };

  const handleQidBackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.includes('pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    
    setUploading(true);
    setUploadProgress(prev => ({ ...prev, qidBack: 0 }));
    
    try {
      const fileName = `qid_back_${Date.now()}.pdf`;
      const url = await uploadPdfToStorage(file, fileName);
      setQidBackFile(url);
      toast.success('QID back document uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(prev => ({ ...prev, qidBack: 100 }));
    }
  };

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
      username: member.username || member.email,
      phone: member.phone,
      qid: member.qid || '',
      age: member.age,
      subscriptionPlan: member.subscriptionPlan,
      subscriptionEnd: member.subscriptionEnd,
      emergencyContact: member.emergencyContact,
      personalTrainer: member.personalTrainer || '',
      medicalNotes: member.medicalNotes || '',
      discountPercentage: member.discount?.percentage || 0,
      discountReason: member.discount?.reason || '',
      qidFrontPdf: member.qidFrontPdf || '',
      qidBackPdf: member.qidBackPdf || '',
    } : {
      subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      discountPercentage: 0,
    }
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');
  const discountPercentage = watch('discountPercentage') || 0;
  const selectedPlan = watch('subscriptionPlan');
  
  const planPrice = subscriptionPlans.find(p => p.name === selectedPlan)?.price || 0;
  const discountAmount = (planPrice * discountPercentage) / 100;
  const finalPrice = planPrice - discountAmount;

  const onSubmit = (data: MemberFormData) => {
    // Validation
    if (!member && data.password !== data.confirmPassword) {
      return;
    }

    // Check for duplicate email/username
    const emailExists = members.some(m => m.email === data.email && m.id !== member?.id);
    const usernameExists = members.some(m => m.username === data.username && m.id !== member?.id);
    
    if (emailExists || usernameExists) {
      return;
    }

    const memberData = {
      name: data.name,
      email: data.email,
      username: data.username,
      phone: data.phone,
      qid: data.qid,
      age: data.age,
      subscriptionPlan: data.subscriptionPlan,
      subscriptionEnd: data.subscriptionEnd,
      emergencyContact: data.emergencyContact,
      personalTrainer: data.personalTrainer,
      medicalNotes: data.medicalNotes,
      discount: data.discountPercentage && data.discountPercentage > 0 ? {
        percentage: data.discountPercentage,
        reason: data.discountReason || '',
        appliedBy: user?.name || 'Admin',
        appliedDate: new Date().toISOString().split('T')[0],
      } : undefined,
      qidFrontPdf: qidFrontFile || member?.qidFrontPdf,
      qidBackPdf: qidBackFile || member?.qidBackPdf,
      memberId: generatedMemberId,
      joinDate: member?.joinDate || new Date().toISOString().split('T')[0],
      subscriptionStatus: 'active' as const,
      loginStatus: member?.loginStatus || 'inactive' as const,
      totalSessions: member?.totalSessions || 0,
      remainingSessions: subscriptionPlans.find(p => p.name === data.subscriptionPlan)?.sessions,
      lastAttendance: member?.lastAttendance,
      lastLogin: member?.lastLogin,
      password: data.password,
    };

    if (member) {
      updateMember(member.id, memberData);
    } else {
      addMember(memberData);
    }
    
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal Information Section */}
      <div className="bg-white/5 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{t('members.personalInfo')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label={t('members.fullName')}
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
          />
          
          <FormField
            label={t('members.age')}
            type="number"
            {...register('age', { 
              required: 'Age is required',
              min: { value: 16, message: 'Must be at least 16 years old' },
              max: { value: 80, message: 'Must be under 80 years old' }
            })}
            error={errors.age?.message}
          />
          
          <FormField
            label={t('members.phone')}
            {...register('phone', { required: 'Phone is required' })}
            error={errors.phone?.message}
          />
          
          <FormField
            label="Qatar ID (QID)"
            {...register('qid', { 
              pattern: {
                value: /^\d{11}$/,
                message: 'Qatar ID must be exactly 11 digits'
              }
            })}
            error={errors.qid?.message}
            placeholder="12345678901"
          />
          
          <FormField
            label={t('members.emergencyContact')}
            {...register('emergencyContact', { required: 'Emergency contact is required' })}
            error={errors.emergencyContact?.message}
            placeholder="Name - Phone Number"
          />
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-white/90 mb-2">
            {t('members.medicalNotes')} (Optional)
          </label>
          <textarea
            {...register('medicalNotes')}
            rows={3}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            placeholder="Any medical conditions, allergies, or restrictions..."
          />
        </div>
        {/* PDF Documents Section */}
        <div className="mt-6">
          <h4 className="text-md font-medium text-white mb-4">QID Documents</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-white/90">
                QID Front (PDF)
              </label>
              {qidFrontFile && (
                <div className="mb-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-300 text-sm">✓ Document uploaded successfully</p>
                </div>
              )}
              <input
                type="file"
                accept=".pdf"
                onChange={handleQidFrontUpload}
                disabled={uploading}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80"
              />
              {uploadProgress.qidFront !== undefined && uploadProgress.qidFront < 100 && (
                <div className="mt-2">
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${uploadProgress.qidFront}%` }}></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-white/90">
                QID Back (PDF)
              </label>
              {qidBackFile && (
                <div className="mb-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-300 text-sm">✓ Document uploaded successfully</p>
                </div>
              )}
              <input
                type="file"
                accept=".pdf"
                onChange={handleQidBackUpload}
                disabled={uploading}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80"
              />
              {uploadProgress.qidBack !== undefined && uploadProgress.qidBack < 100 && (
                <div className="mt-2">
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${uploadProgress.qidBack}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 space-y-1">
            <label className="block text-sm font-medium text-white/90">
              Additional Documents (PDF)
            </label>
            <input
              type="file"
              accept=".pdf"
              multiple
              disabled={uploading}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80"
            />
            <p className="text-white/50 text-xs mt-1">
              Upload additional documents like medical certificates, ID copies, etc.
            </p>
          </div>
          
          {uploading && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-300 text-sm">Uploading document... Please wait.</p>
            </div>
          )}
        </div>
      </div>

      {/* Login Credentials Section */}
      <div className="bg-white/5 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{t('members.loginCredentials')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label={t('members.email')}
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
            label={t('members.username')}
            {...register('username', { 
              required: 'Username is required',
              minLength: { value: 3, message: 'Username must be at least 3 characters' }
            })}
            error={errors.username?.message}
          />
          
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">{t('members.memberId')}</label>
            <input
              type="text"
              value={generatedMemberId}
              disabled
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white/80 font-mono"
            />
          </div>
          
          <div></div>
          
          <FormField
            label={t('members.password')}
            type="password"
            {...register('password', { 
              required: !member ? 'Password is required' : false,
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
            error={errors.password?.message}
            placeholder={member ? 'Leave blank to keep current password' : 'Enter password'}
          />
          
          <FormField
            label={t('members.confirmPassword')}
            type="password"
            {...register('confirmPassword', { 
              required: !member && password ? 'Please confirm password' : false,
              validate: value => !password || value === password || 'Passwords do not match'
            })}
            error={errors.confirmPassword?.message}
            placeholder={member ? 'Confirm new password' : 'Confirm password'}
          />
        </div>
      </div>

      {/* Membership Details Section */}
      <div className="bg-white/5 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{t('members.membershipDetails')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-white/90">
              {t('members.subscriptionPlan')}
            </label>
            <select
              {...register('subscriptionPlan', { required: 'Plan is required' })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 dropdown-theme"
            >
              <option value="" className="bg-secondary text-white">{t('common.select')} a plan</option>
              {subscriptionPlans.map(plan => (
                <option key={plan.id} value={plan.name} className="bg-secondary text-white">
                  {plan.name} - ${plan.promotionalPrice || plan.price}/month
                </option>
              ))}
            </select>
            {errors.subscriptionPlan && (
              <p className="text-red-400 text-sm">{errors.subscriptionPlan.message}</p>
            )}
          </div>
          
          <FormField
            label={t('members.subscriptionEnd')}
            type="date"
            {...register('subscriptionEnd', { required: 'End date is required' })}
            error={errors.subscriptionEnd?.message}
          />
          
          <FormField
            label={`${t('members.personalTrainer')} (Optional)`}
            {...register('personalTrainer')}
            placeholder="Trainer name"
          />
        </div>
      </div>

      {/* Discount Management - Admin Only */}
      {user?.role === 'admin' && (
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Discount Management</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Discount Percentage (0-50%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                step="1"
                {...register('discountPercentage', {
                  min: { value: 0, message: 'Discount cannot be negative' },
                  max: { value: 50, message: 'Maximum discount is 50%' }
                })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="0"
              />
              {errors.discountPercentage && (
                <p className="text-red-400 text-sm mt-1">{errors.discountPercentage.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Discount Reason {discountPercentage > 0 && <span className="text-red-400">*</span>}
              </label>
              <textarea
                {...register('discountReason', {
                  required: discountPercentage > 0 ? 'Discount reason is required when discount is applied' : false
                })}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                placeholder="Reason for discount (e.g., Student discount, Loyalty reward, etc.)"
              />
              {errors.discountReason && (
                <p className="text-red-400 text-sm mt-1">{errors.discountReason.message}</p>
              )}
            </div>
          </div>
          
          {/* Price Calculation Display */}
          {selectedPlan && (
            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <h4 className="text-white font-medium mb-3">Price Calculation</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Original Price:</span>
                  <span className={`text-white ${discountPercentage > 0 ? 'line-through text-white/60' : 'font-semibold'}`}>
                    ${planPrice}
                  </span>
                </div>
                {discountPercentage > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-white/70">Discount ({discountPercentage}%):</span>
                      <span className="text-red-400">-${discountAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/20 pt-2">
                      <span className="text-white font-medium">Final Price:</span>
                      <span className="text-green-400 font-bold">${finalPrice.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
              
              {member?.discount && (
                <div className="mt-4 pt-4 border-t border-white/20 text-xs text-white/60">
                  <p>Applied by: {member.discount.appliedBy}</p>
                  <p>Applied on: {new Date(member.discount.appliedDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          {member ? t('members.editMember') : t('members.addMember')}
        </Button>
        <Button variant="outline" onClick={onSuccess} className="flex-1">
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  );
};

export default MemberForm;