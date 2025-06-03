import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { productApi, Product } from "@/lib/api";
import { getImageUrl } from "@/services/minioService";

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        setLoading(true);
        const response = await productApi.list();
        // Sort products by creation date and take the most recent ones
        const recentProducts = response.data
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 8); // Get the 6 most recent products
        setProducts(recentProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching recent products:', err);
        setError('Failed to load featured products');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentProducts();
  }, []);

  if (loading) {
    return (
      <section className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">Featured Products</h2>
          <Link 
            to="/products" 
            className="text-cm-green hover:text-cm-forest text-base sm:text-lg font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <div className="h-6 bg-gray-200 rounded w-1/3" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">Featured Products</h2>
          <Link 
            to="/products" 
            className="text-cm-green hover:text-cm-forest text-base sm:text-lg font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="text-center py-8 text-gray-500">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold">Featured Products</h2>
        <Link 
          to="/products" 
          className="text-cm-green hover:text-cm-forest text-base sm:text-lg font-medium"
        >
          View All →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <Card 
            key={product.id} 
            className="hover:shadow-lg transition-shadow duration-200 h-full flex flex-col"
          >
            <Link to={`/products/${product.id}`} className="flex flex-col h-full">
              <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
                <img
                  src={getImageUrl(product.image_urls[0])}
                  alt={product.title}
                  className="w-full h-full object-contain p-2"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
              <CardContent className="p-4 flex-grow">
                <Badge variant="outline" className="mb-2 text-xs sm:text-sm">
                  {product.category || 'Uncategorized'}
                </Badge>
                <h3 className="font-semibold text-base sm:text-lg mb-1 line-clamp-2">
                  {product.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base line-clamp-1">
                  {product.description}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0 mt-auto">
                <p className="text-cm-green font-semibold text-base sm:text-lg">
                  {Number(product.price).toLocaleString()} FCFA
                </p>
              </CardFooter>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
