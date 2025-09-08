import React, { useState } from 'react';
import FeatureGuard from '../components/UI/FeatureGuard';
import { Plus, Download, Filter, DollarSign, CreditCard, Banknote } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Breadcrumb from '../components/UI/Breadcrumb';
import PaymentForm from '../components/Payments/PaymentForm';
import toast from 'react-hot-toast';

const Payments: React.FC = () => {
  const { payments } = useApp();

  return (
    <FeatureGuard feature="payment_system">
      <PaymentsContent />
    </FeatureGuard>
  );
};

const PaymentsContent: React.FC = () => {
  const { payments } = useApp();
  const [searchParams] = useSearchParams();
  const [isAddModalOpen, setIsAddModalOpen] = useState(searchParams.get('action') === 'add');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredPayments = payments.filter(payment => {
    const matchesMethod = filterMethod === 'all' || payment.method === filterMethod;
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    return matchesMethod && matchesStatus;
  });

  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const thisMonthRevenue = payments
    .filter(p => p.date.startsWith(format(new Date(), 'yyyy-MM')) && p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300';
      case 'failed': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'cash': return <Banknote className="w-4 h-4" />;
      case 'transfer': return <DollarSign className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const exportPayments = () => {
    toast.success('Payment report exported to PDF!');
  };

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Payments</h1>
          <p className="text-white/70">Track and manage all payment transactions</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportPayments} icon={Download}>
            Export Report
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} icon={Plus}>
            Record Payment
          </Button>
        </div>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-white/70 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-white/70 text-sm">This Month</p>
              <p className="text-2xl font-bold text-white">${thisMonthRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <Filter className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-white/70 text-sm">Pending</p>
              <p className="text-2xl font-bold text-white">{pendingPayments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/70" />
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Member</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Method</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent-orange rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">
                          {payment.memberName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="text-white font-medium">{payment.memberName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-semibold">${payment.amount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-white/80">
                      {getMethodIcon(payment.method)}
                      <span className="capitalize">{payment.method}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white/80">
                    {format(new Date(payment.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/80 text-sm">
                    {payment.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPayments.length === 0 && (
          <div className="text-center py-12 text-white/60">
            No payments found matching your criteria
          </div>
        )}
      </div>

      {/* Add Payment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record New Payment"
        size="lg"
      >
        <PaymentForm
          onSuccess={() => {
            setIsAddModalOpen(false);
            toast.success('Payment recorded successfully!');
          }}
        />
      </Modal>
    </div>
  );
};

export default Payments;