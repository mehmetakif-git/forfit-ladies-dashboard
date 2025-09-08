import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, Mail, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import FormField from '../UI/FormField';
import Button from '../UI/Button';
import LoadingSpinner from '../UI/LoadingSpinner';
import Typewriter from '../UI/Typewriter';
import Logo from '../UI/Logo';
import toast from 'react-hot-toast';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const { t } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      const success = await login(data.email, data.password);
      
      if (success) {
        toast.success(t('auth.welcome'));
      } else {
        toast.error(t('forms.invalidCredentials') || 'Invalid email or password');
      }
    } catch (error) {
      toast.error(t('forms.loginFailed') || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-dark via-secondary to-primary">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" showText={false} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Forfit Ladies</h1>
          <Typewriter 
            text="Premium Fitness Admin Dashboard"
            speed={80}
            delay={500}
            className="text-white/70"
          />
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-6">
            <Lock className="w-8 h-8 text-primary mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-white mb-2">{t('auth.welcome')}</h2>
            <p className="text-white/70 text-sm">{t('auth.signInSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <input
                type="email"
                placeholder={t('auth.emailAddress')}
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.enterPassword')}
                {...register('password', { required: 'Password is required' })}
                className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" color="text-white" />
                  {t('auth.signingIn')}
                </>
              ) : (
                t('auth.signIn')
              )}
            </Button>
          </form>

          {/* Member Registration Section */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="text-center mb-4">
              <p className="text-white/70 text-sm mb-4">New to Forfit Ladies?</p>
              <Button
                onClick={() => window.location.href = '/register'}
                variant="glass"
                className="w-full"
                icon={UserPlus}
              >
                Join Forfit Ladies
              </Button>
              <p className="text-white/50 text-xs mt-2">
                Start your premium fitness journey today
              </p>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-white/70 text-sm text-center mb-4">{t('auth.demoCredentials')}:</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                <span className="text-white/80">{t('auth.admin')}:</span>
                <span className="text-white font-mono">admin@forfit.qa / admin123</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                <span className="text-white/80">{t('auth.staff')}:</span>
                <span className="text-white font-mono">staff@forfit.qa / staff123</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                <span className="text-white/80">{t('auth.member')}:</span>
                <span className="text-white font-mono">member@forfit.qa / member123</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                <span className="text-white/80">{t('auth.trainer')}:</span>
                <span className="text-white font-mono">trainer@forfit.qa / trainer123</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/50 text-sm">
            © 2025 Forfit Ladies. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;