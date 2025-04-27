
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, TAGS } from "@/constants/productData";
import type { ProductFormData } from "@/hooks/useProductForm";

interface ProductPreviewProps {
  formData: ProductFormData;
}

export const ProductPreview = ({ formData }: ProductPreviewProps) => {
  return (
    <div className="mb-6 grid gap-6 md:grid-cols-2">
      <div className="bg-white rounded-lg overflow-hidden">
        {formData.imagePreviewUrls.length > 0 ? (
          <img
            src={formData.imagePreviewUrls[0]}
            alt={formData.name}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">No image available</p>
          </div>
        )}
        
        {formData.imagePreviewUrls.length > 1 && (
          <div className="flex mt-2 space-x-2 overflow-x-auto p-1">
            {formData.imagePreviewUrls.slice(1).map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Product ${index + 2}`}
                className="w-16 h-16 object-cover rounded"
              />
            ))}
          </div>
        )}
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-2">{formData.name || "Product Name"}</h2>
        <div className="text-xl font-semibold text-cm-green mb-4">
          {formData.price ? `${formData.price} FCFA` : "Price not set"}
        </div>
        
        {formData.category && (
          <div className="mb-2">
            <Badge variant="outline" className="bg-cm-sand bg-opacity-30">
              {CATEGORIES.find(c => c.id === formData.category)?.name}
            </Badge>
          </div>
        )}
        
        {formData.selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {formData.selectedTags.map((tagId) => (
              <Badge key={tagId} variant="secondary" className="bg-muted">
                {TAGS.find(t => t.id === tagId)?.name}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="text-sm mb-6">
          {formData.stockQuantity ? (
            <span className="text-cm-green">
              In stock: {formData.stockQuantity} available
            </span>
          ) : (
            <span className="text-muted-foreground">Stock quantity not set</span>
          )}
        </div>
        
        <div className="mb-6">
          <h3 className="font-semibold mb-1">Description</h3>
          <p className="text-sm text-gray-600">
            {formData.description || "No description provided."}
          </p>
        </div>
        
        {(formData.materials || formData.dimensions || formData.weight) && (
          <div className="mb-4">
            <h3 className="font-semibold mb-1">Details</h3>
            <ul className="text-sm space-y-1">
              {formData.materials && (
                <li><span className="font-medium">Materials:</span> {formData.materials}</li>
              )}
              {formData.dimensions && (
                <li><span className="font-medium">Dimensions:</span> {formData.dimensions}</li>
              )}
              {formData.weight && (
                <li><span className="font-medium">Weight:</span> {formData.weight} kg</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
