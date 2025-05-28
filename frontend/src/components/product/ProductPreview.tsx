
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, TAGS } from "@/constants/productData";
import type { ProductFormData } from "@/hooks/useProductForm";
import { ProductImageGallery } from "./ProductImageGallery";
import { ProductDetailsInfo } from "./ProductDetailsInfo";
import { ProductShippingInfo } from "./ProductShippingInfo";

interface ProductPreviewProps {
  formData: ProductFormData;
}

export const ProductPreview = ({ formData }: ProductPreviewProps) => {
  return (
    <div className="mb-6 grid gap-6 md:grid-cols-2">
      <div className="bg-white rounded-lg overflow-hidden">
        <ProductImageGallery 
          images={formData.imagePreviewUrls} 
          name={formData.name} 
        />
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
          {formData.quantity? (
            <span className="text-cm-green">
              In stock: {formData.quantity} available
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
        
        <ProductDetailsInfo
          materials={formData.materials}
          dimensions={formData.dimensions}
          returnPolicy={formData.returnPolicy}
        />

        <ProductShippingInfo
          shippingInfo={formData.shippingInfo}
          returnPolicy={formData.returnPolicy}
        />
      </div>
    </div>
  );
};
