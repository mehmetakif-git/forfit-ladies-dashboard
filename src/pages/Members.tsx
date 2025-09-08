import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Crown, Star, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Member } from '../types';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Breadcrumb from '../components/UI/Breadcrumb';
import BackButton from '../components/UI/BackButton';
import MemberForm from '../components/Members/MemberForm';
import MemberProfile from '../components/Members/MemberProfile';
import toast from 'react-hot-toast';

const Members: React.FC = () => {
  const { members, deleteMember } = useApp();
  const { t } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(searchParams.get('action') === 'add');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || member.subscriptionStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
    <span className="vip-badge inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-accent-gold to-accent-orange text-dark shadow-lg border border-accent-gold/30">
      <Crown className="w-4 h-4 crown-bounce" />
      VIP
    </span>
  );
      case 'premium':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-primary to-secondary text-white shadow-md border border-primary/30">
            <Star className="w-4 h-4" />
            Premium
          </span>
        );
      case 'basic':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-white/10 text-white/90 border border-white/20">
            <Circle className="w-3 h-3" />
            Basic
          </span>
        );
      default:
        return (
          <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-gray-500/20 text-gray-300">
            {plan}
          </span>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('members.title')}</h1>
          <p className="text-white/70">{t('members.subtitle')}</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} icon={Plus}>
          {t('members.addMember')}
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
            <input
              type="text"
              placeholder={t('members.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/70" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 dropdown-theme"
            >
              <option value="all" className="bg-secondary text-white">{t('common.all')} Status</option>
              <option value="active" className="bg-secondary text-white">{t('common.active')}</option>
              <option value="expired" className="bg-secondary text-white">{t('common.expired')}</option>
              <option value="pending" className="bg-secondary text-white">{t('common.pending')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">{t('members.name')}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">{t('members.plan')}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">{t('members.status')}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">{t('members.expires')}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">{t('members.lastVisit')}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">{t('members.loginStatus')}</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white">{t('members.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredMembers.map((member, index) => (
                <tr key={member.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent-orange rounded-full flex items-center justify-center">
                        {member.discount && member.discount.percentage > 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-dark">%</span>
                          </div>
                        )}
                        <span className="text-sm font-semibold text-white">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{member.name}</p>
                        <p className="text-sm text-white/60">{member.email}</p>
                        {member.lastLogin && (
                          <p className="text-xs text-white/40">
                            Last login: {format(new Date(member.lastLogin), 'MMM dd')}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getPlanBadge(member.subscriptionPlan)}
                    {member.discount && member.discount.percentage > 0 && (
                      <div className="mt-1">
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300">
                          {member.discount.percentage}% OFF
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(member.subscriptionStatus)}`}>
                      {member.subscriptionStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white/80 text-sm">
                      {format(new Date(member.subscriptionEnd), 'MMM dd, yyyy')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {member.lastAttendance ? format(new Date(member.lastAttendance), 'MMM dd') : 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      member.loginStatus === 'active' 
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-gray-500/20 text-gray-300'
                    }`}>
                      {member.loginStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleView(member)}
                        className="p-2 rounded-lg hover:bg-white/10 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(member)}
                        className="p-2 rounded-lg hover:bg-white/10 text-yellow-400 hover:text-yellow-300 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(member)}
                        className="p-2 rounded-lg hover:bg-white/10 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredMembers.length === 0 && (
          <div className="text-center py-12 text-white/60">
            {t('members.noMembers')}
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t('members.addMember')}
        size="lg"
      >
        <MemberForm
          onSuccess={() => {
            setIsAddModalOpen(false);
            setSearchParams({});
            toast.success(t('common.success'));
          }}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMember(null);
        }}
        title={t('members.editMember')}
        size="lg"
      >
        {selectedMember && (
          <MemberForm
            member={selectedMember}
            onSuccess={() => {
              setIsEditModalOpen(false);
              setSelectedMember(null);
              toast.success(t('common.success'));
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
        title={t('members.viewProfile')}
        size="xl"
      >
        {selectedMember && <MemberProfile member={selectedMember} />}
      </Modal>
    </div>
  );
};

export default Members;