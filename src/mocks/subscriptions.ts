import { SubscriptionPlan } from '../types';

export const mockSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: '1',
    name: 'Basic',
    price: 79,
    duration: 1,
    features: [
      'Access to gym equipment',
      'Basic fitness classes',
      '1 personal training session',
      'Locker access',
      'Mobile app access',
    ],
    color: 'from-purple-500 to-pink-500',
    sessions: 12,
  },
  {
    id: '2',
    name: 'Premium',
    price: 129,
    duration: 1,
    features: [
      'Everything in Basic',
      'All group fitness classes',
      '2 personal training sessions',
      'Nutrition consultation',
      'Priority booking',
      'Guest passes (2/month)',
    ],
    color: 'from-pink-500 to-orange-400',
    popular: true,
    sessions: 20,
  },
  {
    id: '3',
    name: 'VIP',
    price: 199,
    duration: 1,
    features: [
      'Everything in Premium',
      'Unlimited personal training',
      'Spa access & wellness treatments',
      'Custom meal planning',
      'Priority support',
      'Unlimited guest passes',
      '24/7 gym access',
    ],
    color: 'from-yellow-400 to-orange-400',
  },
];