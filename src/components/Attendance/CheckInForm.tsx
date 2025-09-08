import React from 'react';
import { useForm } from 'react-hook-form';
import { useApp } from '../../context/AppContext';
import Button from '../UI/Button';

interface CheckInFormData {
  memberId: string;
  classType?: string;
}

interface CheckInFormProps {
  onSuccess: () => void;
}

const CheckInForm: React.FC<CheckInFormProps> = ({ onSuccess }) => {
  const { members, checkInMember } = useApp();
  const { register, handleSubmit, formState: { errors } } = useForm<CheckInFormData>();

  const activeMembers = members.filter(member => member.subscriptionStatus === 'active');

  const classTypes = [
    'General Access',
    'Morning Yoga',
    'HIIT Training',
    'Personal Training',
    'Pilates',
    'Strength Training',
    'Cardio Blast',
    'Zumba',
    'Spinning',
    'Meditation',
  ];

  const onSubmit = (data: CheckInFormData) => {
    checkInMember(data.memberId, data.classType);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-white/90">
          Member
        </label>
        <select
          {...register('memberId', { required: 'Member is required' })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Select a member</option>
          {activeMembers.map(member => (
            <option key={member.id} value={member.id} className="bg-secondary text-white">
              {member.name} - {member.subscriptionPlan}
            </option>
          ))}
        </select>
        {errors.memberId && (
          <p className="text-red-400 text-sm">{errors.memberId.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-white/90">
          Class/Activity (Optional)
        </label>
        <select
          {...register('classType')}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {classTypes.map(classType => (
            <option key={classType} value={classType} className="bg-secondary text-white">
              {classType}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          Check In
        </Button>
        <Button variant="outline" onClick={onSuccess} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default CheckInForm;