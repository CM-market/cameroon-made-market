
import React from "react";
import type { ProductFormData } from "@/hooks/useProductForm";

interface ProductShippingInfoProps {
  shippingInfo: string;
  returnPolicy?: string;
}

export const ProductShippingInfo = ({ shippingInfo, returnPolicy }: ProductShippingInfoProps) => {
  if (!shippingInfo && !returnPolicy) return null;
  
  return (
    <div className="space-y-4">
      {shippingInfo && (
        <div>
          <h2 className="font-semibold text-lg mb-2">Shipping Information</h2>
          <p className="text-gray-700">{shippingInfo}</p>
        </div>
      )}
      
      {returnPolicy && (
        <div>
          <h2 className="font-semibold text-lg mb-2">Return Policy</h2>
          <p className="text-gray-700">{returnPolicy}</p>
        </div>
      )}
    </div>
  );
};
