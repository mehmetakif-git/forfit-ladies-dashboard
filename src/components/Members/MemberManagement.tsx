import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Users, Crown, Star, Circle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Member } from '../../types';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import MemberCardBuilder from './MemberCardBuilder';
import MemberProfile from './MemberProfile';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const MemberManagement: React.FC = () => {
  const { members, deleteMember } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.memberId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const handleView = (member: Member) => {
    setSelectedMember(member);
    setIsProfileModalOpen(true);
  };

  const handleDelete = (member: Member) => {
    if (window.confirm(`Are you sure you want to delete ${member.name}?`)) {
      deleteMember(member.id);
      toast.success('Member deleted successfully');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300';
      case 'expired': return 'bg-red-500/20 text-red-300';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'vip':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-accent-gold to-accent-orange text-dark shadow-lg">
            <Crown className="w-3 h-3" />
            VIP
          </div>
        );
      case 'premium':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-primary to-secondary text-white shadow-md">
            <Star className="w-3 h-3" />
            Premium
          </div>
        );
      case 'basic':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 text-white/90 border border-white/20">
            <Circle className="w-2.5 h-2.5" />
            Basic
          </div>
        );
      default:
        return (
          <div className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300">
            {plan}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Member Management
          </h2>
          <p className="text-white/70">Create and manage member cards and profiles</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} icon={Plus}>
          Add New Member
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
          <input
            type="text"
            placeholder="Search members by name, email, or member ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div key={member.id} className="member-card bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-300">
            {/* Member Card Preview */}
            <div className="bg-gradient-to-br from-primary via-secondary to-primary p-4 relative">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-white font-bold">Forfit Ladies</h4>
                  <div className="mt-1">
                    {getPlanBadge(member.subscriptionPlan)}
                  </div>
                </div>
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs">QR</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {member.photo ? (
                  <img src={member.photo} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-white font-semibold text-sm">{member.name}</p>
                  <p className="text-white/70 text-xs font-mono">{member.memberId}</p>
                </div>
              </div>
            </div>

            {/* Member Details */}
            <div className="p-4">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.subscriptionStatus)}`}>
                    {member.subscriptionStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Expires</span>
                  <span className="text-white text-sm">{format(new Date(member.subscriptionEnd), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Login Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    member.loginStatus === 'active' 
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-gray-500/20 text-gray-300'
                  }`}>
                    {member.loginStatus}
                  </span>
                </div>
                {member.discount && member.discount.percentage > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Discount</span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300">
                      {member.discount.percentage}% OFF
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleView(member)}
                  className="flex-1 p-2 rounded-lg hover:bg-white/10 text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">View</span>
                </button>
                <button
                  onClick={() => handleEdit(member)}
                  className="flex-1 p-2 rounded-lg hover:bg-white/10 text-yellow-400 hover:text-yellow-300 transition-colors flex items-center justify-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(member)}
                  className="flex-1 p-2 rounded-lg hover:bg-white/10 text-red-400 hover:text-red-300 transition-colors flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12 text-white/60">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No members found</p>
          <p className="text-sm">Try adjusting your search or add a new member</p>
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Member Card"
        size="xl"
      >
        <MemberCardBuilder
          onSuccess={() => {
            setIsAddModalOpen(false);
            toast.success('Member card created successfully!');
          }}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMember(null);
        }}
        title="Edit Member Card"
        size="xl"
      >
        {selectedMember && (
          <MemberCardBuilder
            member={selectedMember}
            onSuccess={() => {
              setIsEditModalOpen(false);
              setSelectedMember(null);
              toast.success('Member card updated successfully!');
            }}
          />
        )}
      </Modal>

      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedMember(null);
        }}
        title="Member Profile"
        size="xl"
      >
        {selectedMember && <MemberProfile member={selectedMember} />}
      </Modal>
    </div>
  );
};

export default MemberManagement;