import React, { useState } from 'react';
import { UserPlus, Check, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { RegistrationQuestion } from '../types';
import FormField from '../components/UI/FormField';
import Button from '../components/UI/Button';
import Logo from '../components/UI/Logo';
import toast from 'react-hot-toast';

const MemberRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationQuestions, setRegistrationQuestions] = useState<RegistrationQuestion[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  // Load registration questions and subscription plans
  React.useEffect(() => {
    loadRegistrationData();
  }, []);

  const loadRegistrationData = async () => {
    try {
      // Load registration questions
      let questionsData = null;
      let questionsError = null;
      
      try {
        const result = await supabase
          .from('registration_questions')
          .select('*')
          .eq('active', true)
          .order('order_index');
        questionsData = result.data;
        questionsError = result.error;
      } catch (queryError) {
        console.warn('Failed to query registration_questions table:', queryError);
        questionsError = queryError;
      }
      
      if (questionsError) {
        console.warn('Registration questions table not found, using fallback questions');
        setRegistrationQuestions([
          { id: '1', questionText: 'Full Name', fieldType: 'text', fieldName: 'name', isRequired: true, orderIndex: 1, isActive: true },
          { id: '2', questionText: 'Email Address', fieldType: 'email', fieldName: 'email', isRequired: true, orderIndex: 2, isActive: true },
          { id: '3', questionText: 'Phone Number', fieldType: 'phone', fieldName: 'phone', isRequired: true, orderIndex: 3, isActive: true },
          { id: '4', questionText: 'Qatar ID (QID)', fieldType: 'text', fieldName: 'qid', isRequired: true, orderIndex: 4, isActive: true },
          { id: '5', questionText: 'Age', fieldType: 'number', fieldName: 'age', isRequired: true, orderIndex: 5, isActive: true },
          { id: '6', questionText: 'Emergency Contact', fieldType: 'text', fieldName: 'emergencyContact', isRequired: true, orderIndex: 6, isActive: true },
          { id: '7', questionText: 'Subscription Plan', fieldType: 'select', fieldName: 'subscriptionPlan', isRequired: true, orderIndex: 7, isActive: true },
        ]);
      } else {
        setRegistrationQuestions(questionsData.map(q => ({
          id: q.id,
          questionText: q.question_text,
          fieldType: q.field_type,
          fieldName: q.field_name,
          options: q.options ? JSON.parse(q.options) : undefined,
          isRequired: q.is_required,
          orderIndex: q.order_index,
          isActive: q.is_active
        })));
      }

      // Load subscription plans
      let plansData = null;
      let plansError = null;
      
      try {
        const result = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price');
        plansData = result.data;
        plansError = result.error;
      } catch (queryError) {
        console.warn('Failed to query subscription_plans table:', queryError);
        plansError = queryError;
      }
      
      if (plansError) {
        console.warn('Subscription plans table not found, using fallback plans');
        setSubscriptionPlans([
          { id: '1', name: 'Basic', price: 79, features: ['Access to gym equipment', 'Basic fitness classes'] },
          { id: '2', name: 'Premium', price: 129, features: ['Everything in Basic', 'All group fitness classes'], popular: true },
          { id: '3', name: 'VIP', price: 199, features: ['Everything in Premium', 'Unlimited personal training'] },
        ]);
      } else {
        setSubscriptionPlans(plansData);
      }
    } catch (error) {
      console.error('Failed to load registration data:', error);
      // Use fallback data
      setRegistrationQuestions([
        { id: '1', questionText: 'Full Name', fieldType: 'text', fieldName: 'name', isRequired: true, orderIndex: 1, isActive: true },
        { id: '2', questionText: 'Email Address', fieldType: 'email', fieldName: 'email', isRequired: true, orderIndex: 2, isActive: true },
        { id: '3', questionText: 'Phone Number', fieldType: 'phone', fieldName: 'phone', isRequired: true, orderIndex: 3, isActive: true },
        { id: '4', questionText: 'Qatar ID (QID)', fieldType: 'text', fieldName: 'qid', isRequired: true, orderIndex: 4, isActive: true },
        { id: '5', questionText: 'Age', fieldType: 'number', fieldName: 'age', isRequired: true, orderIndex: 5, isActive: true },
        { id: '6', questionText: 'Emergency Contact', fieldType: 'text', fieldName: 'emergencyContact', isRequired: true, orderIndex: 6, isActive: true },
        { id: '7', questionText: 'Subscription Plan', fieldType: 'select', fieldName: 'subscriptionPlan', isRequired: true, orderIndex: 7, isActive: true },
      ]);
      setSubscriptionPlans([
        { id: '1', name: 'Basic', price: 79, features: ['Access to gym equipment', 'Basic fitness classes'] },
        { id: '2', name: 'Premium', price: 129, features: ['Everything in Basic', 'All group fitness classes'], popular: true },
        { id: '3', name: 'VIP', price: 199, features: ['Everything in Premium', 'Unlimited personal training'] },
      ]);
    }
  };

  const selectedPlan = watch('subscriptionPlan');
  const planDetails = subscriptionPlans.find(p => p.name === selectedPlan);

  const validateQID = (qid: string) => {
    if (!qid) return false;
    const cleanQID = qid.replace(/\D/g, '');
    return cleanQID.length === 11;
  };

  const onSubmit = async (data: any) => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Validate QID
    if (!validateQID(data.qid)) {
      toast.error('Qatar ID must be exactly 11 digits');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Submit application to database
      try {
        const { error } = await supabase
          .from('member_applications')
          .insert({
            form_data: data,
            status: 'pending'
          });

        if (error) throw error;
      } catch (dbError) {
        console.warn('Member applications table not available, proceeding without database storage');
      }

      setIsSubmitting(false);
      setCurrentStep(5);
      toast.success('Application submitted successfully! We will review and contact you soon.');
    } catch (error) {
      console.error('Failed to submit application:', error);
      setIsSubmitting(false);
      toast.error('Failed to submit application. Please try again.');
    }
  };

  const renderFormField = (question: RegistrationQuestion) => {
    const commonProps = {
      ...register(question.fieldName, { 
        required: question.isRequired ? `${question.questionText} is required` : false,
        ...(question.fieldName === 'qid' && {
          pattern: {
            value: /^\d{11}$/,
            message: 'Qatar ID must be exactly 11 digits'
          }
        }),
        ...(question.fieldName === 'age' && {
          min: { value: 16, message: 'Must be at least 16 years old' },
          max: { value: 80, message: 'Must be under 80 years old' }
        })
      }),
      error: errors[question.fieldName]?.message
    };

    switch (question.fieldType) {
      case 'select':
        const options = question.fieldName === 'subscriptionPlan' 
          ? subscriptionPlans.map(p => p.name)
          : question.options || [];
          
        return (
          <div key={question.id}>
            <label className="block text-sm font-medium text-white/90 mb-2">
              {question.questionText} {question.isRequired && <span className="text-red-400">*</span>}
            </label>
            <select
              {...register(question.fieldName, { required: question.isRequired ? `${question.questionText} is required` : false })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select {question.questionText.toLowerCase()}</option>
              {options.map(option => (
                <option key={option} value={option} className="bg-secondary text-white">
                  {option}
                </option>
              ))}
            </select>
            {errors[question.fieldName] && (
              <p className="text-red-400 text-sm mt-1">{errors[question.fieldName]?.message}</p>
            )}
          </div>
        );
      
      case 'textarea':
        return (
          <div key={question.id}>
            <label className="block text-sm font-medium text-white/90 mb-2">
              {question.questionText} {question.isRequired && <span className="text-red-400">*</span>}
            </label>
            <textarea
              {...register(question.fieldName, { required: question.isRequired ? `${question.questionText} is required` : false })}
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder={`Enter ${question.questionText.toLowerCase()}...`}
            />
            {errors[question.fieldName] && (
              <p className="text-red-400 text-sm mt-1">{errors[question.fieldName]?.message}</p>
            )}
          </div>
        );
      
      case 'checkbox':
        return (
          <div key={question.id} className="flex items-start gap-3">
            <input
              type="checkbox"
              {...register(question.fieldName, { required: question.isRequired ? `${question.questionText} is required` : false })}
              className="mt-1 w-4 h-4 text-primary bg-white/10 border-white/20 rounded focus:ring-primary/50"
            />
            <label className="text-white/80 text-sm">
              {question.questionText} {question.isRequired && <span className="text-red-400">*</span>}
            </label>
            {errors[question.fieldName] && (
              <p className="text-red-400 text-sm mt-1">{errors[question.fieldName]?.message}</p>
            )}
          </div>
        );
      
      default:
        return (
          <FormField
            key={question.id}
            label={`${question.questionText} ${question.isRequired ? '*' : ''}`}
            type={question.fieldType === 'phone' ? 'tel' : question.fieldType}
            {...commonProps}
            placeholder={question.fieldName === 'qid' ? '12345678901 (11 digits)' : undefined}
          />
        );
    }
  };

  if (currentStep === 5) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-secondary to-primary flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white border border-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Application Submitted!</h2>
            <p className="text-white/70 mb-6">
              Thank you for your interest in Forfit Ladies! Your application has been submitted and is under review. 
              We will contact you within 24-48 hours with the next steps.
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/')} className="w-full">
                Return to Home
              </Button>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 text-white/70 hover:text-white transition-colors text-sm"
              >
                Submit Another Application
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const steps = ['Personal Info', 'Plan Selection', 'Additional Details', 'Terms & Signature'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-secondary to-primary p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white border border-white/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" showText={false} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Join Forfit Ladies</h1>
          <p className="text-xl text-white/70">
            Start your premium fitness journey with us today
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index + 1 <= currentStep 
                    ? 'bg-primary text-white' 
                    : 'bg-white/20 text-white/60'
                }`}>
                  {index + 1 <= currentStep ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    index + 1 < currentStep ? 'bg-primary' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <span className="text-white/70">{steps[currentStep - 1]}</span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {registrationQuestions
                    .filter(q => ['name', 'email', 'phone', 'qid', 'age'].includes(q.fieldName))
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map(renderFormField)}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Choose Your Plan</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {subscriptionPlans.map((plan) => (
                    <label
                      key={plan.id}
                      className={`cursor-pointer block p-6 rounded-xl border-2 transition-all ${
                        watch('subscriptionPlan') === plan.name
                          ? 'border-primary bg-primary/10'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      <input
                        type="radio"
                        value={plan.name}
                        {...register('subscriptionPlan', { required: 'Please select a plan' })}
                        className="sr-only"
                      />
                      <div className="text-center">
                        {plan.popular && (
                          <div className="bg-primary px-3 py-1 rounded-full text-white text-xs font-medium mb-3 inline-block">
                            Most Popular
                          </div>
                        )}
                        <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
                        <div className="text-2xl font-bold text-white mb-3">
                          ${plan.promotional_price || plan.price}<span className="text-sm text-white/60">/mo</span>
                          {plan.promotional_price && (
                            <div className="text-sm text-white/60 line-through">${plan.price}</div>
                          )}
                        </div>
                        <ul className="text-left space-y-1">
                          {(plan.features || []).slice(0, 3).map((feature: string, index: number) => (
                            <li key={index} className="text-white/80 text-sm flex items-center gap-2">
                              <Check className="w-3 h-3 text-green-400" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.subscriptionPlan && (
                  <p className="text-red-400 text-sm text-center">{errors.subscriptionPlan.message}</p>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Additional Information</h2>
                <div className="space-y-6">
                  {registrationQuestions
                    .filter(q => !['name', 'email', 'phone', 'qid', 'age', 'subscriptionPlan', 'terms', 'signature'].includes(q.fieldName))
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map(renderFormField)}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Terms & Digital Signature</h2>
                
                <div className="bg-white/5 rounded-xl p-4 max-h-40 overflow-y-auto">
                  <p className="text-white/80 text-sm leading-relaxed">
                    By signing up for Forfit Ladies, you agree to our terms of service and privacy policy. 
                    You understand that fitness activities involve inherent risks and agree to participate at your own risk. 
                    You confirm that all information provided is accurate and complete. Monthly payments are due on the same date each month.
                    Cancellation requires 30 days written notice. Studio rules must be followed at all times.
                  </p>
                </div>

                <FormField
                  label="Digital Signature (Type your full name)"
                  {...register('signature', { required: 'Digital signature is required' })}
                  error={errors.signature?.message}
                  placeholder="Type your full name as digital signature"
                />

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    {...register('terms', { required: 'You must accept the terms' })}
                    className="mt-1 w-4 h-4 text-primary bg-white/10 border-white/20 rounded focus:ring-primary/50"
                  />
                  <label className="text-white/80 text-sm">
                    I agree to the terms and conditions, privacy policy, and waiver of liability. 
                    I understand the risks associated with fitness activities. <span className="text-red-400">*</span>
                  </label>
                </div>
                {errors.terms && (
                  <p className="text-red-400 text-sm">{errors.terms.message}</p>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-6">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1"
                >
                  Previous
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Submitting Application...' : currentStep === 4 ? 'Submit Application' : 'Next Step'}
              </Button>
            </div>
          </form>
        </div>

        {/* Selected Plan Summary */}
        {planDetails && currentStep > 1 && currentStep < 5 && (
          <div className="mt-6 bg-white/5 rounded-xl p-4 border border-white/20">
            <h3 className="text-white font-medium mb-2">Selected Plan: {planDetails.name}</h3>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Monthly Price:</span>
              <span className="text-white font-bold">
                ${planDetails.promotional_price || planDetails.price}/month
                {planDetails.promotional_price && (
                  <span className="text-white/60 line-through ml-2">${planDetails.price}</span>
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberRegistration;