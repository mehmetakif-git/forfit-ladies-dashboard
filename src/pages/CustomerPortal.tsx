import React, { useState } from 'react';
import { UserPlus, Check, Settings, Eye, ThumbsUp, ThumbsDown, MessageSquare, Plus, Trash2, X, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { mockSubscriptionPlans } from '../mocks/subscriptions';
import { RegistrationQuestion, MemberApplication } from '../types';
import FormField from '../components/UI/FormField';
import Button from '../components/UI/Button';
import TabNavigation from '../components/UI/TabNavigation';
import BackButton from '../components/UI/BackButton';
import Modal from '../components/UI/Modal';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Breadcrumb from '../components/UI/Breadcrumb';

const CustomerPortal: React.FC = () => {
  const { addMember, getSubscriptionPlans } = useApp();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationQuestions, setRegistrationQuestions] = useState<RegistrationQuestion[]>([]);
  const [memberApplications, setMemberApplications] = useState<MemberApplication[]>([]);
  const [isFormBuilderOpen, setIsFormBuilderOpen] = useState(false);
  const [isApplicationsOpen, setIsApplicationsOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<MemberApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [activeTab, setActiveTab] = useState('public');
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();
  
  const subscriptionPlans = getSubscriptionPlans().filter(plan => plan.enabled !== false);

  // Load registration questions and applications
  React.useEffect(() => {
    loadRegistrationQuestions();
    if (user?.role === 'admin' || user?.role === 'staff') {
      loadMemberApplications();
    }
  }, [user]);

  const loadRegistrationQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('registration_questions')
        .select('*')
        .eq('active', true)
        .order('order_index');
      
      if (error) {
        console.warn('Registration questions table not found, using fallback questions');
        // Fallback to default questions
        setRegistrationQuestions([
          { id: '1', questionText: 'Full Name', fieldType: 'text', fieldName: 'name', isRequired: true, orderIndex: 1, isActive: true },
          { id: '2', questionText: 'Email Address', fieldType: 'email', fieldName: 'email', isRequired: true, orderIndex: 2, isActive: true },
          { id: '3', questionText: 'Phone Number', fieldType: 'phone', fieldName: 'phone', isRequired: true, orderIndex: 3, isActive: true },
          { id: '4', questionText: 'Qatar ID (QID)', fieldType: 'text', fieldName: 'qid', isRequired: true, orderIndex: 4, isActive: true },
          { id: '5', questionText: 'Age', fieldType: 'number', fieldName: 'age', isRequired: true, orderIndex: 5, isActive: true },
          { id: '6', questionText: 'Emergency Contact', fieldType: 'text', fieldName: 'emergencyContact', isRequired: true, orderIndex: 6, isActive: true },
          { id: '7', questionText: 'Subscription Plan', fieldType: 'select', fieldName: 'subscriptionPlan', options: subscriptionPlans.map(p => p.name), isRequired: true, orderIndex: 7, isActive: true },
        ]);
        return;
      }
      
      if (data) {
        setRegistrationQuestions(data.map(q => ({
          id: q.id,
          questionText: q.question_text,
          fieldType: q.field_type,
          fieldName: q.field_name,
          options: q.options ? JSON.parse(q.options) : undefined,
          isRequired: q.is_required,
          orderIndex: q.order_index,
          isActive: q.is_active
        })));
      } else {
        // Fallback to default questions
        setRegistrationQuestions([
          { id: '1', questionText: 'Full Name', fieldType: 'text', fieldName: 'name', isRequired: true, orderIndex: 1, isActive: true },
          { id: '2', questionText: 'Email Address', fieldType: 'email', fieldName: 'email', isRequired: true, orderIndex: 2, isActive: true },
          { id: '3', questionText: 'Phone Number', fieldType: 'phone', fieldName: 'phone', isRequired: true, orderIndex: 3, isActive: true },
          { id: '4', questionText: 'Qatar ID (QID)', fieldType: 'text', fieldName: 'qid', isRequired: true, orderIndex: 4, isActive: true },
          { id: '5', questionText: 'Age', fieldType: 'number', fieldName: 'age', isRequired: true, orderIndex: 5, isActive: true },
          { id: '6', questionText: 'Emergency Contact', fieldType: 'text', fieldName: 'emergencyContact', isRequired: true, orderIndex: 6, isActive: true },
          { id: '7', questionText: 'Subscription Plan', fieldType: 'select', fieldName: 'subscriptionPlan', options: subscriptionPlans.map(p => p.name), isRequired: true, orderIndex: 7, isActive: true },
        ]);
      }
    } catch (error) {
      console.error('Failed to load registration questions:', error);
      // Fallback to default questions
      setRegistrationQuestions([
        { id: '1', questionText: 'Full Name', fieldType: 'text', fieldName: 'name', isRequired: true, orderIndex: 1, isActive: true },
        { id: '2', questionText: 'Email Address', fieldType: 'email', fieldName: 'email', isRequired: true, orderIndex: 2, isActive: true },
        { id: '3', questionText: 'Phone Number', fieldType: 'phone', fieldName: 'phone', isRequired: true, orderIndex: 3, isActive: true },
        { id: '4', questionText: 'Qatar ID (QID)', fieldType: 'text', fieldName: 'qid', isRequired: true, orderIndex: 4, isActive: true },
        { id: '5', questionText: 'Age', fieldType: 'number', fieldName: 'age', isRequired: true, orderIndex: 5, isActive: true },
        { id: '6', questionText: 'Emergency Contact', fieldType: 'text', fieldName: 'emergencyContact', isRequired: true, orderIndex: 6, isActive: true },
        { id: '7', questionText: 'Subscription Plan', fieldType: 'select', fieldName: 'subscriptionPlan', options: subscriptionPlans.map(p => p.name), isRequired: true, orderIndex: 7, isActive: true },
      ]);
    }
  };

  const loadMemberApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('member_applications')
        .select('*')
        .order('submitted_at', { ascending: false });
      
      if (error) {
        console.warn('Member applications table not found, using empty array');
        toast.error('Member applications table could not be loaded - database configuration issue');
        setMemberApplications([]);
        return;
      }
      
      if (data) {
        setMemberApplications(data.map(app => ({
          id: app.id,
          formData: app.form_data,
          status: app.status,
          submittedAt: app.submitted_at,
          reviewedAt: app.reviewed_at,
          reviewedBy: app.reviewed_by,
          adminNotes: app.admin_notes
        })));
      } else {
        setMemberApplications([]);
      }
    } catch (error) {
      console.error('Failed to load member applications:', error);
      setMemberApplications([]);
    }
  };

  const selectedPlan = watch('subscriptionPlan');
  const planDetails = subscriptionPlans.find(p => p.name === selectedPlan);
  const qidValue = watch('qid');

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
        const { data: application, error } = await supabase
          .from('member_applications')
          .insert({
            form_data: data,
            status: 'pending'
          })
          .select()
          .single();

        if (error) throw error;
      } catch (dbError) {
        console.warn('Member applications table not available, proceeding without database storage');
        // Continue with form submission even if database is not available
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

  const handleApproveApplication = async (application: MemberApplication) => {
    try {
      // Create member from application data
      const memberData = {
        ...application.formData,
        username: application.formData.email,
        password: 'temp123', // Temporary password
        memberId: `FL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
        joinDate: new Date().toISOString().split('T')[0],
        subscriptionStatus: 'active',
        subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalSessions: 0,
        remainingSessions: planDetails?.sessions,
        applicationId: application.id,
      };

      addMember(memberData);

      // Update application status
      await supabase
        .from('member_applications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.name,
          admin_notes: adminNotes
        })
        .eq('id', application.id);

      await loadMemberApplications();
      setSelectedApplication(null);
      setAdminNotes('');
      toast.success('Application approved and member created!');
    } catch (error) {
      console.error('Failed to approve application:', error);
      toast.error('Failed to approve application');
    }
  };

  const handleRejectApplication = async (application: MemberApplication) => {
    try {
      await supabase
        .from('member_applications')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.name,
          admin_notes: adminNotes
        })
        .eq('id', application.id);

      await loadMemberApplications();
      setSelectedApplication(null);
      setAdminNotes('');
      toast.success('Application rejected');
    } catch (error) {
      console.error('Failed to reject application:', error);
      toast.error('Failed to reject application');
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
              {(question.options || []).map(option => (
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
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center">
          <BackButton label="Back" className="mb-4" />
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Application Submitted!</h2>
            <p className="text-white/70 mb-6">
              Thank you for your interest in Forfit Ladies! Your application has been submitted and is under review. 
              We will contact you within 24-48 hours with the next steps.
            </p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Return to Portal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Admin/Staff view
  if (user?.role === 'admin' || user?.role === 'staff') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white border border-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <Breadcrumb />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Customer Portal Management</h1>
            <p className="text-white/70">Manage registration forms and review member applications</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsApplicationsOpen(true)} icon={Eye}>
              Review Applications ({memberApplications.filter(a => a.status === 'pending').length})
            </Button>
            {user?.role === 'admin' && (
              <Button onClick={() => setIsFormBuilderOpen(true)} icon={Settings}>
                Form Builder
              </Button>
            )}
          </div>
        </div>

        {/* Applications Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <UserPlus className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-white/70 text-sm">Pending Applications</p>
                <p className="text-2xl font-bold text-white">
                  {memberApplications.filter(a => a.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <Check className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-white/70 text-sm">Approved This Month</p>
                <p className="text-2xl font-bold text-white">
                  {memberApplications.filter(a => a.status === 'approved' && a.reviewedAt?.startsWith(format(new Date(), 'yyyy-MM'))).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-white/70 text-sm">Active Questions</p>
                <p className="text-2xl font-bold text-white">{registrationQuestions.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Recent Applications</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Applicant</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Plan</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Submitted</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {memberApplications.slice(0, 10).map((application) => (
                  <tr key={application.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{application.formData.name}</p>
                        <p className="text-white/60 text-sm">{application.formData.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/80">{application.formData.subscriptionPlan}</td>
                    <td className="px-6 py-4 text-white/80">
                      {format(new Date(application.submittedAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        application.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                        application.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {application.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        size="sm"
                        variant="glass"
                        onClick={() => setSelectedApplication(application)}
                        icon={Eye}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Review Application Modal */}
        <Modal
          isOpen={!!selectedApplication}
          onClose={() => {
            setSelectedApplication(null);
            setAdminNotes('');
          }}
          title="Review Member Application"
          size="lg"
        >
          {selectedApplication && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Application Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedApplication.formData).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-white/70 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-white font-medium">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="Add notes about this application..."
                />
              </div>

              {selectedApplication.status === 'pending' && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApproveApplication(selectedApplication)}
                    className="flex-1"
                    icon={ThumbsUp}
                  >
                    Approve Application
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleRejectApplication(selectedApplication)}
                    className="flex-1"
                    icon={ThumbsDown}
                  >
                    Reject Application
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Form Builder Slide Panel */}
        <div className={`fixed inset-y-0 right-0 w-96 bg-secondary/95 backdrop-blur-xl border-l border-white/20 shadow-2xl transform transition-transform duration-300 z-50 ${
          isFormBuilderOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Registration Form Builder</h3>
              <button
                onClick={() => setIsFormBuilderOpen(false)}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <FormBuilder 
                questions={registrationQuestions}
                onUpdate={loadRegistrationQuestions}
                onClose={() => setIsFormBuilderOpen(false)}
              />
            </div>
          </div>
        </div>
        
        {/* Backdrop */}
        {isFormBuilderOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsFormBuilderOpen(false)}
          />
        )}
      </div>
    );
  }

  // Public registration form
  const steps = registrationQuestions.length > 0 ? [
    'Personal Information',
    'Plan Selection', 
    'Additional Details',
    'Terms & Signature'
  ] : ['Loading...'];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <BackButton label="Back" />
        
        <div className="text-center mb-8">
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
                        selectedPlan === plan.name
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
                        <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
                        <div className="text-2xl font-bold text-white mb-3">
                          ${plan.promotionalPrice || plan.price}<span className="text-sm text-white/60">/mo</span>
                          {plan.promotionalPrice && (
                            <div className="text-sm text-white/60 line-through">${plan.price}</div>
                          )}
                        </div>
                        <ul className="text-left space-y-1">
                          {plan.features.slice(0, 3).map((feature, index) => (
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
                    I understand the risks associated with fitness activities.
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
      </div>
    </div>
  );
};

// Form Builder Component
const FormBuilder: React.FC<{ 
  questions: RegistrationQuestion[]; 
  onUpdate: () => void;
  onClose: () => void;
}> = ({ questions, onUpdate, onClose }) => {
  const [editingQuestion, setEditingQuestion] = useState<RegistrationQuestion | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Partial<RegistrationQuestion>>({
    questionText: '',
    fieldType: 'text',
    fieldName: '',
    isRequired: false,
    isActive: true,
    options: []
  });

  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'number', label: 'Number' },
    { value: 'select', label: 'Dropdown' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'date', label: 'Date' },
  ];

  const handleSaveQuestion = async () => {
    if (!newQuestion.questionText?.trim() || !newQuestion.fieldName?.trim()) {
      toast.error('Question text and field name are required');
      return;
    }

    try {
      const { error } = await supabase
        .from('registration_questions')
        .insert({
          question_text: newQuestion.questionText,
          field_type: newQuestion.fieldType,
          field_name: newQuestion.fieldName,
          options: newQuestion.options && newQuestion.options.length > 0 ? JSON.stringify(newQuestion.options) : null,
          is_required: newQuestion.isRequired,
          order_index: questions.length + 1,
          is_active: true
        });

      if (error) throw error;

      // Reset form and close modal
      handleCloseAddModal();
      await onUpdate();
      onClose();
      toast.success('Question added successfully!');
    } catch (error) {
      console.error('Failed to save question:', error);
      toast.error('Failed to save question');
    }
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setNewQuestion({
      questionText: '',
      fieldType: 'text',
      fieldName: '',
      isRequired: false,
      isActive: true,
      options: []
    });
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        const { error } = await supabase
          .from('registration_questions')
          .delete()
          .eq('id', questionId);

        if (error) throw error;

        onUpdate();
        toast.success('Question deleted successfully!');
      } catch (error) {
        console.error('Failed to delete question:', error);
        toast.error('Failed to delete question');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Registration Form Questions</h3>
        <Button onClick={() => setIsAddModalOpen(true)} icon={Plus}>
          Add Question
        </Button>
      </div>

      <div className="space-y-3">
        {questions.map((question) => (
          <div key={question.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex-1">
              <p className="text-white font-medium">{question.questionText}</p>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-white/60 text-sm capitalize">{question.fieldType}</span>
                <span className="text-white/60 text-sm">Field: {question.fieldName}</span>
                {question.isRequired && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">Required</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingQuestion(question)}
                className="p-2 rounded-lg hover:bg-white/10 text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteQuestion(question.id)}
                className="p-2 rounded-lg hover:bg-white/10 text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Question Form */}
      {isAddModalOpen && (
        <div className="mt-6 bg-white/5 rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Add New Question</h4>
            <button
              onClick={handleCloseAddModal}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Question Text <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={newQuestion.questionText || ''}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, questionText: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="What is your full name?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Field Name (Internal) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={newQuestion.fieldName || ''}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, fieldName: e.target.value.replace(/\s+/g, '') }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="fullName"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Field Type</label>
              <select
                value={newQuestion.fieldType || 'text'}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, fieldType: e.target.value as any }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {fieldTypes.map(type => (
                  <option key={type.value} value={type.value} className="bg-secondary text-white">
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {newQuestion.fieldType === 'select' && (
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Options (one per line)</label>
                <textarea
                  value={(newQuestion.options || []).join('\n')}
                  onChange={(e) => setNewQuestion(prev => ({ 
                    ...prev, 
                    options: e.target.value.split('\n').filter(o => o.trim()) 
                  }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={newQuestion.isRequired || false}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, isRequired: e.target.checked }))}
                className="w-4 h-4 text-primary bg-white/10 border-white/20 rounded focus:ring-primary/50"
              />
              <label className="text-white/80">Required field</label>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleSaveQuestion} 
                className="flex-1"
                disabled={!newQuestion.questionText?.trim() || !newQuestion.fieldName?.trim()}
              >
                Add Question
              </Button>
              <Button variant="outline" onClick={handleCloseAddModal} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPortal;