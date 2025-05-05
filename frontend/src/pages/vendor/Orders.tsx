
import React from 'react';
import VendorNavbar from '@/components/VendorNavbar';

const VendorOrders: React.FC = () => {
  return (
    <div>
      <VendorNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Orders</h1>
        {/* TODO: Add orders list and management features */}
      </div>
    </div>
  );
};

export default VendorOrders;
