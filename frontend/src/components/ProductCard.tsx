import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '@/services/minioService';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (product.image_urls && product.image_urls.length > 0) {
      const url = getImageUrl(product.image_urls[0]);
      setImageUrl(url);
    }
  }, [product.image_urls]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setError(true);
    setIsLoading(false);
  };

  return (
    <Link to={`/products/${product.id}`} className="block">
      <div className="group relative overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md">
        <div className="aspect-square w-full overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          )}
          {error ? (
            <div className="flex h-full items-center justify-center bg-gray-100">
              <span className="text-gray-400">Image not available</span>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={product.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </div>
        <div className="p-4">
          <h3 className="mb-1 text-lg font-semibold text-gray-900 line-clamp-1">
            {product.title}
          </h3>
          <p className="mb-2 text-sm text-gray-500 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">
              {product.quantity} in stock
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}; 