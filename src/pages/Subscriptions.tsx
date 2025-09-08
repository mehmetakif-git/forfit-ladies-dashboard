import React, { useState } from 'react';
import { Check, Star, Plus, Crown, Circle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { mockSubscriptionPlans } from "../mocks/subscriptions";
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Breadcrumb from '../components/UI/Breadcrumb';
import toast from 'react-hot-toast';

const Subscriptions: React.FC = () => {
  const { members, getSubscriptionPlans } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  const subscriptionPlans = getSubscriptionPlans().filter(plan => plan.enabled !== false) || mockSubscriptionPlans;

  const getSubscriptionStats = () => {
    const stats = subscriptionPlans.map(plan => ({
      ...plan,
      activeMembers: members.filter(member => 
        member.subscriptionPlan === plan.name && member.subscriptionStatus === 'active'
      ).length,
    }));
    return stats;
  };

  const subscriptionStats = getSubscriptionStats();

  const handlePurchase = (planName: string) => {
    setSelectedPlan(planName);
    setIsModalOpen(true);
  };

  const processPurchase = () => {
    toast.success(`${selectedPlan} subscription activated!`);
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  return (
    <div className="p-6 space-y-8">
      <Breadcrumb />
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Subscription Plans</h1>
        <p className="text-xl text-white/70 max-w-2xl mx-auto">
          Choose the perfect plan for your fitness journey. All plans include access to our premium facilities.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {subscriptionStats.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:scale-105 transition-all duration-300 ${
              plan.name === 'VIP' ? 'ring-2 ring-accent-gold bg-gradient-to-br from-accent-gold/10 to-accent-orange/10' :
              plan.popular ? 'ring-2 ring-primary' : ''
            }`}
          >
            {plan.name === 'VIP' && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-accent-gold to-accent-orange px-4 py-1 rounded-full flex items-center gap-1">
                  <Crown className="w-4 h-4 text-dark" />
                  <span className="text-dark font-bold text-sm">VIP Exclusive</span>
                </div>
              </div>
            )}
            {plan.popular && plan.name !== 'VIP' && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-primary to-accent-orange px-4 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-4 h-4 text-white" />
                  <span className="text-white font-medium text-sm">Most Popular</span>
                </div>
              </div>
            )}

            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                {plan.name === 'VIP' && <Crown className="w-6 h-6 text-accent-gold" />}
                {plan.name === 'Premium' && <Star className="w-6 h-6 text-primary" />}
                {plan.name === 'Basic' && <Circle className="w-5 h-5 text-white/70" />}
                <h3 className={`text-2xl font-bold ${
                  plan.name === 'VIP' ? 'text-accent-gold' : 'text-white'
                } mb-0`}>{plan.name}</h3>
              </div>
              <div className="mb-4">
                <span className={`text-4xl font-bold ${
                  plan.name === 'VIP' ? 'text-accent-gold' : 'text-white'
                }`}>${plan.price}</span>
                <span className={`${
                  plan.name === 'VIP' ? 'text-accent-gold/70' : 'text-white/70'
                }`}>/month</span>
              </div>
              <p className="text-white/60 text-sm">
                {plan.activeMembers} active members
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white/80 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handlePurchase(plan.name)}
              variant={plan.name === 'VIP' ? 'secondary' : plan.popular ? 'primary' : 'glass'}
              className="w-full"
            >
              Select Plan
            </Button>
          </div>
        ))}
      </div>

      {/* Active Subscriptions Summary */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-4">Subscription Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subscriptionStats.map((plan) => (
            <div key={plan.id} className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent-orange rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">{plan.activeMembers}</span>
              </div>
              <p className="text-white font-medium">{plan.name}</p>
              <p className="text-white/60 text-sm">${plan.price * plan.activeMembers}/month</p>
            </div>
          ))}
        </div>
      </div>

      {/* Purchase Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Subscribe to ${selectedPlan}`}
      >
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent-orange rounded-full flex items-center justify-center mx-auto">
            <Plus className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Confirm Subscription
            </h3>
            <p className="text-white/70">
              You're about to subscribe to the {selectedPlan} plan.
            </p>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/70">Plan</span>
              <span className="text-white font-medium">{selectedPlan}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/70">Price</span>
              <span className="text-white font-medium">
                ${mockSubscriptionPlans.find(p => p.name === selectedPlan)?.price}/month
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-white/10 pt-2">
              <span className="text-white font-medium">Total</span>
              <span className="text-white font-bold text-lg">
                ${subscriptionPlans.find(p => p.name === selectedPlan)?.price}/month
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={processPurchase} className="flex-1">
              Confirm Payment
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Subscriptions;