
import React from "react";

interface ProductImageGalleryProps {
  images: string[];
  name: string;
}

export const ProductImageGallery = ({ images, name }: ProductImageGalleryProps) => {
  if (images.length === 0) {
    return (
      <div className="w-full h-64 bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">No image available</p>
      </div>
    );
  }

  return (
    <div>
      <div className="w-full h-64 bg-white rounded-lg overflow-hidden">
        <img
          src={images[0]}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      
      {images.length > 1 && (
        <div className="flex mt-2 space-x-2 overflow-x-auto p-1">
          {images.slice(1).map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`${name} ${index + 2}`}
              className="w-16 h-16 object-cover rounded"
            />
          ))}
        </div>
      )}
    </div>
  );
};
