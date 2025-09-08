import React from 'react';
import { Star, Users, Calendar, Phone, Mail, Award, Clock, QrCode, Shield } from 'lucide-react';
import { Trainer } from '../../types';
import { format } from 'date-fns';

interface TrainerCardProps {
  trainer: Trainer;
  showFullDetails?: boolean;
}

const TrainerCard: React.FC<TrainerCardProps> = ({ trainer, showFullDetails = true }) => {
  const activeClients = trainer.clients.length;
  const availableDays = trainer.availability.filter(a => a.isAvailable).length;
  
  return (
    <div className="max-w-5xl mx-auto bg-gradient-to-br from-secondary via-primary to-secondary rounded-3xl p-10 border border-white/20 relative overflow-hidden shadow-2xl">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      <div className="absolute top-1/2 right-10 w-16 h-16 bg-accent-gold/20 rounded-full"></div>
      
      <div className="relative z-10">
        {/* Card Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Forfit Ladies</h2>
            <p className="text-white/80 text-lg">Premium Women's Fitness Studio</p>
            <div className="flex items-center gap-2 mt-2">
              <Shield className="w-5 h-5 text-accent-gold" />
              <span className="text-accent-gold font-semibold">Certified Trainer</span>
            </div>
          </div>
          <div className="text-right">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-3">
              {trainer.photo ? (
                <img src={trainer.photo} alt={trainer.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white">
                  {trainer.name.split(' ').map(n => n[0]).join('')}
                </span>
              )}
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <QrCode className="w-12 h-12 text-white mx-auto" />
              <p className="text-white/70 text-xs mt-1">Trainer ID</p>
            </div>
          </div>
        </div>

        {/* Trainer Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <p className="text-white/70 mb-2">Trainer Name</p>
            <p className="text-white font-semibold text-xl">{trainer.name}</p>
          </div>
          <div>
            <p className="text-white/70 mb-2">Experience</p>
            <p className="text-white font-semibold text-xl">{trainer.experience} Years</p>
          </div>
          <div>
            <p className="text-white/70 mb-2">Hourly Rate</p>
            <p className="text-white font-semibold text-xl">${trainer.hourlyRate}</p>
          </div>
          <div>
            <p className="text-white/70 mb-2">Active Clients</p>
            <p className="text-white font-semibold text-lg">{activeClients}</p>
          </div>
          <div>
            <p className="text-white/70 mb-2">Available Days</p>
            <p className="text-white font-semibold text-lg">{availableDays}/7</p>
          </div>
          <div>
            <p className="text-white/70 mb-2">Rating</p>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-accent-gold" />
              <p className="text-white font-semibold text-lg">4.9</p>
            </div>
          </div>
        </div>

        {/* Specializations and Status */}
        <div className="flex items-center justify-between pt-8 border-t border-white/20">
          <div>
            <p className="text-white/70 mb-2">Specializations</p>
            <div className="flex flex-wrap gap-2">
              {trainer.specializations.slice(0, 3).map((spec, index) => (
                <span key={index} className="px-3 py-1 bg-accent-gold/20 text-accent-gold rounded-full text-sm font-medium">
                  {spec}
                </span>
              ))}
              {trainer.specializations.length > 3 && (
                <span className="px-3 py-1 bg-white/10 text-white/70 rounded-full text-sm">
                  +{trainer.specializations.length - 3} more
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/70 mb-2">Status</p>
            <span className="inline-flex px-4 py-2 rounded-full font-medium text-lg bg-green-500/20 text-green-300">
              ACTIVE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerCard;