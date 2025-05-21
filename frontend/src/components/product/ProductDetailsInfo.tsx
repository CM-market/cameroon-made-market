import React from "react";
import type { ProductFormData } from "@/hooks/useProductForm";

interface ProductDetailsInfoProps {
  materials?: string;
  dimensions?: string;
  returnPolicy?: string;
}

export const ProductDetailsInfo = ({ materials, dimensions, returnPolicy }: ProductDetailsInfoProps) => {
  if (!materials && !dimensions && !returnPolicy) return null;
  
  return (
    <div className="mb-4">
      <h3 className="font-semibold mb-1">Details</h3>
      <ul className="text-sm space-y-1">
        {materials && (
          <li><span className="font-medium">Materials:</span> {materials}</li>
        )}
        {dimensions && (
          <li><span className="font-medium">Dimensions:</span> {dimensions}</li>
        )}
        {returnPolicy && (
          <li><span className="font-medium">Return Policy:</span> {returnPolicy}</li>
        )}
      </ul>
    </div>
  );
};
