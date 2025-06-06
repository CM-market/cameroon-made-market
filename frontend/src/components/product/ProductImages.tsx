import React from "react";
import { Label } from "@/components/ui/label";
import { Image, Loader2 } from "lucide-react";
import type { ProductFormData } from "@/hooks/useProductForm";
import { getImageUrl } from "@/services/minioService";

interface ProductImagesProps {
  formData: ProductFormData;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  isUploading: boolean;
}

export const ProductImages = ({
  formData,
  onImageUpload,
  onRemoveImage,
  isUploading,
}: ProductImagesProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="images">Product Images</Label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
        {formData.imagePreviewUrls.map((url, index) => (
          <div 
            key={index} 
            className="relative aspect-square bg-muted rounded-md overflow-hidden group"
          >
            <img 
              src={formData.uploadedImageUrls[index] || url} 
              alt={`Product ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => onRemoveImage(index)}
              className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
            >
              Remove
            </button>
          </div>
        ))}
        
        {formData.imagePreviewUrls.length < 5 && (
          <label 
            htmlFor="image-upload" 
            className={`aspect-square border-2 border-dashed border-muted-foreground rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin mb-2 text-muted-foreground" />
            ) : (
              <Image size={24} className="mb-2 text-muted-foreground" />
            )}
            <span className="text-sm text-muted-foreground">
              {isUploading ? 'Uploading...' : 'Add Image'}
            </span>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              multiple
              disabled={isUploading}
              className="hidden"
            />
          </label>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Upload up to 5 images. First image will be the cover. Max 2MB each (2G optimized).
      </p>
    </div>
  );
};
