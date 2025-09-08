import React from 'react';
import { useForm } from 'react-hook-form';
import { useApp } from '../../context/AppContext';
import FormField from '../UI/FormField';
import Button from '../UI/Button';

interface PaymentFormData {
  memberId: string;
  amount: number;
  method: 'cash' | 'card' | 'transfer';
  description: string;
  planName: string;
}

interface PaymentFormProps {
  onSuccess: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSuccess }) => {
  const { members, addPayment } = useApp();
  const { register, handleSubmit, formState: { errors }, watch } = useForm<PaymentFormData>();

  const selectedMemberId = watch('memberId');
  const selectedMember = members.find(m => m.id === selectedMemberId);

  const onSubmit = (data: PaymentFormData) => {
    const memberName = members.find(m => m.id === data.memberId)?.name || '';
    
    addPayment({
      ...data,
      memberName,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
    });
    
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-white/90">
            Member
          </label>
          <select
            {...register('memberId', { required: 'Member is required' })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Select a member</option>
            {members.map(member => (
              <option key={member.id} value={member.id} className="bg-secondary text-white">
                {member.name} - {member.subscriptionPlan}
              </option>
            ))}
          </select>
          {errors.memberId && (
            <p className="text-red-400 text-sm">{errors.memberId.message}</p>
          )}
        </div>

        <FormField
          label="Amount ($)"
          type="number"
          step="0.01"
          {...register('amount', { 
            required: 'Amount is required',
            min: { value: 0.01, message: 'Amount must be greater than 0' }
          })}
          error={errors.amount?.message}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-white/90">
            Payment Method
          </label>
          <select
            {...register('method', { required: 'Payment method is required' })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Select method</option>
            <option value="cash" className="bg-secondary text-white">Cash</option>
            <option value="card" className="bg-secondary text-white">Credit Card</option>
            <option value="transfer" className="bg-secondary text-white">Bank Transfer</option>
          </select>
          {errors.method && (
            <p className="text-red-400 text-sm">{errors.method.message}</p>
          )}
        </div>

        <FormField
          label="Plan Name"
          {...register('planName', { required: 'Plan name is required' })}
          error={errors.planName?.message}
          placeholder={selectedMember?.subscriptionPlan || 'Enter plan name'}
        />
      </div>

      <FormField
        label="Description"
        {...register('description', { required: 'Description is required' })}
        error={errors.description?.message}
        placeholder="Monthly subscription payment, personal training, etc."
      />

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          Record Payment
        </Button>
        <Button variant="outline" onClick={onSuccess} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;