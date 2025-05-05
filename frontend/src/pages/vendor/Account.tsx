
import React from 'react';
import VendorNavbar from '@/components/VendorNavbar';

const VendorAccount: React.FC = () => {
  return (
    <div>
      <VendorNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Vendor Account</h1>
        {/* TODO: Add account management features */}
      </div>
    </div>
  );
};

export default VendorAccount;
