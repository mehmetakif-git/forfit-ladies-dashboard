import React from 'react';
import MemberManagement from '../components/Members/MemberManagement';
import Breadcrumb from '../components/UI/Breadcrumb';

const MemberManagementPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <Breadcrumb />
      <MemberManagement />
    </div>
  );
};

export default MemberManagementPage;