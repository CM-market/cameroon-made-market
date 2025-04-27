
import React from 'react';
import VendorNavbar from '@/components/VendorNavbar';

const VendorProducts: React.FC = () => {
  return (
    <div>
      <VendorNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Products</h1>
        {/* TODO: Add products list and management features */}
      </div>
    </div>
  );
};

export default VendorProducts;
