
import React from 'react';
import VendorNavbar from '@/components/VendorNavbar';

const VendorDashboard: React.FC = () => {
  return (
    <div>
      <VendorNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Vendor Dashboard</h1>
        {/* TODO: Add dashboard content */}
      </div>
    </div>
  );
};

export default VendorDashboard;
