import React, { useState } from 'react';
import { MessageCircle, Send, Eye, Copy } from 'lucide-react';
import { Member } from '../../types';
import Button from '../UI/Button';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface WhatsAppTemplate {
  title: string;
  message: string;
  image: string;
}

interface WhatsAppPanelProps {
  member: Member;
}

const whatsappTemplates: Record<string, WhatsAppTemplate> = {
  monthlyProgress: {
    title: "Monthly Progress Report",
    message: "Hi {memberName}! 🌟 Your fitness journey this month:\n\n✓ {attendanceCount} gym visits - consistent dedication!\n✓ Completed {trainingSessionsCount} personal training sessions\n✓ Attended {classesCount} group classes\n✓ {achievementText}\n\nKeep up the healthy lifestyle! See you at the gym. 💪\n\n*Reply STOP to opt out of monthly reports*",
    image: "/assets/whatsapp/monthly-progress.jpg"
  },
  membershipExpiry: {
    title: "Membership Expiring Soon",
    message: "Hi {memberName}! Your Forfit Ladies membership expires in 7 days. Renew now to continue enjoying our premium facilities!",
    image: "/assets/whatsapp/membership-renewal.jpg"
  },
  paymentReminder: {
    title: "Payment Reminder", 
    message: "Dear {memberName}, your monthly payment is due. Please complete payment to avoid interruption.",
    image: "/assets/whatsapp/payment-reminder.jpg"
  },
  classReminder: {
    title: "Class Booking Confirmation",
    message: "Hi {memberName}! Your {className} is scheduled for {date} at {time}. See you there!",
    image: "/assets/whatsapp/class-reminder.jpg"
  },
  welcomeMessage: {
    title: "Welcome New Member",
    message: "Welcome to Forfit Ladies family, {memberName}! Your premium fitness journey starts now.",
    image: "/assets/whatsapp/welcome.jpg"
  }
};

const WhatsAppPanel: React.FC<WhatsAppPanelProps> = ({ member }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [progressReportSettings, setProgressReportSettings] = useState({
    includeAttendance: true,
    includeClasses: true,
    includeTraining: true,
    includeAchievements: true,
    frequency: 'monthly'
  });

  const generateProgressData = () => {
    // Mock data - in real app would come from database
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    return {
      attendanceCount: 12,
      trainingSessionsCount: 4,
      classesCount: 6,
      achievementText: "New personal best in strength training",
      totalSessions: member.totalSessions || 0,
      consistencyRate: "85%"
    };
  };

  const formatMessage = (template: WhatsAppTemplate): string => {
    const progressData = generateProgressData();
    
    return template.message
      .replace('{memberName}', member.name)
      .replace('{attendanceCount}', progressData.attendanceCount.toString())
      .replace('{trainingSessionsCount}', progressData.trainingSessionsCount.toString())
      .replace('{classesCount}', progressData.classesCount.toString())
      .replace('{achievementText}', progressData.achievementText)
      .replace('{className}', 'Morning Yoga')
      .replace('{date}', 'Tomorrow')
      .replace('{time}', '9:00 AM');
  };

  const getCurrentMessage = (): string => {
    if (customMessage) return customMessage;
    if (selectedTemplate && whatsappTemplates[selectedTemplate]) {
      return formatMessage(whatsappTemplates[selectedTemplate]);
    }
    return '';
  };

  const sendWhatsApp = () => {
    const message = getCurrentMessage();
    if (!message) {
      toast.error('Please select a template or enter a custom message');
      return;
    }

    // Clean phone number (remove non-digits)
    const cleanPhone = member.phone.replace(/\D/g, '');
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp Web
    window.open(whatsappUrl, '_blank');
    toast.success('WhatsApp opened with message');
  };

  const copyMessage = () => {
    const message = getCurrentMessage();
    if (message) {
      navigator.clipboard.writeText(message);
      toast.success('Message copied to clipboard');
    }
  };

  return (
    <div className="bg-white/5 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-green-400" />
        WhatsApp Notifications
      </h3>

      {/* Template Selector */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Message Template
          </label>
          <select
            value={selectedTemplate}
            onChange={(e) => {
              setSelectedTemplate(e.target.value);
              setCustomMessage('');
            }}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Select a template</option>
            {Object.entries(whatsappTemplates).map(([key, template]) => (
              <option key={key} value={key} className="bg-secondary text-white">
                {template.title}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Message */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Custom Message (Optional)
          </label>
          <textarea
            value={customMessage}
            onChange={(e) => {
              setCustomMessage(e.target.value);
              setSelectedTemplate('');
            }}
            rows={4}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            placeholder="Type your custom message here..."
          />
        </div>

        {/* Monthly Progress Report Settings */}
        {selectedTemplate === 'monthlyProgress' && (
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Progress Report Settings</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={progressReportSettings.includeAttendance}
                  onChange={(e) => setProgressReportSettings(prev => ({ ...prev, includeAttendance: e.target.checked }))}
                  className="w-4 h-4 text-primary bg-white/10 border-white/20 rounded focus:ring-primary/50"
                />
                <span className="text-white/80">Include attendance statistics</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={progressReportSettings.includeClasses}
                  onChange={(e) => setProgressReportSettings(prev => ({ ...prev, includeClasses: e.target.checked }))}
                  className="w-4 h-4 text-primary bg-white/10 border-white/20 rounded focus:ring-primary/50"
                />
                <span className="text-white/80">Include class participation</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={progressReportSettings.includeTraining}
                  onChange={(e) => setProgressReportSettings(prev => ({ ...prev, includeTraining: e.target.checked }))}
                  className="w-4 h-4 text-primary bg-white/10 border-white/20 rounded focus:ring-primary/50"
                />
                <span className="text-white/80">Include personal training sessions</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={progressReportSettings.includeAchievements}
                  onChange={(e) => setProgressReportSettings(prev => ({ ...prev, includeAchievements: e.target.checked }))}
                  className="w-4 h-4 text-primary bg-white/10 border-white/20 rounded focus:ring-primary/50"
                />
                <span className="text-white/80">Include achievements and milestones</span>
              </label>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-white/90 mb-2">Report Frequency</label>
              <select
                value={progressReportSettings.frequency}
                onChange={(e) => setProgressReportSettings(prev => ({ ...prev, frequency: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
            
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-300 text-sm font-medium mb-1">Privacy Notice</p>
              <p className="text-blue-200/80 text-xs">
                Progress reports focus on positive achievements and consistency. No sensitive health data or body measurements are included.
              </p>
            </div>
          </div>
        )}

        {/* Message Preview */}
        {(selectedTemplate || customMessage) && (
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium">Message Preview</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={copyMessage}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {showPreview && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/90 text-sm leading-relaxed">
                      {getCurrentMessage()}
                    </p>
                    <p className="text-white/60 text-xs mt-2">
                      To: {member.name} ({member.phone})
                    </p>
                    {selectedTemplate === 'monthlyProgress' && (
                      <div className="mt-3 pt-3 border-t border-green-500/20">
                        <p className="text-green-200/80 text-xs">
                          ✓ Safe content - No sensitive health data included
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={sendWhatsApp}
            disabled={!getCurrentMessage()}
            className="flex-1"
            icon={Send}
          >
            Send via WhatsApp
          </Button>
          <Button
            variant="outline"
            onClick={copyMessage}
            disabled={!getCurrentMessage()}
            icon={Copy}
          >
            Copy Message
          </Button>
        </div>

        {/* Member Info */}
        <div className="bg-white/5 rounded-lg p-3 mt-4">
          <p className="text-white/70 text-sm">
            <strong>Member:</strong> {member.name}
          </p>
          <p className="text-white/70 text-sm">
            <strong>Phone:</strong> {member.phone}
          </p>
          <p className="text-white/70 text-sm">
            <strong>Plan:</strong> {member.subscriptionPlan}
          </p>
          {selectedTemplate === 'monthlyProgress' && (
            <>
              <p className="text-white/70 text-sm">
                <strong>Total Sessions:</strong> {member.totalSessions || 0}
              </p>
              <p className="text-white/70 text-sm">
                <strong>Last Visit:</strong> {member.lastAttendance ? format(new Date(member.lastAttendance), 'MMM dd') : 'Never'}
              </p>
            </>
          )}
        </div>
        
        {/* Automated Reports Schedule */}
        <div className="bg-white/5 rounded-lg p-4 mt-4">
          <h4 className="text-white font-medium mb-3">Automated Progress Reports</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Monthly Reports</span>
              <button className="w-12 h-6 rounded-full bg-primary relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Achievement Alerts</span>
              <button className="w-12 h-6 rounded-full bg-white/20 relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
              </button>
            </div>
            <p className="text-white/60 text-xs">
              Next report: {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppPanel;