import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { productApi, Product } from "@/lib/api";
import { getImageUrl } from "@/services/minioService";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productApi.list();
        setProducts(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <MainNavbar />
        <div className="flex-grow container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <CardContent className="p-3">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <MainNavbar />
        <div className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-8 text-gray-500">
            {error}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <MainNavbar />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {products.map((product) => (
            <Card 
              key={product.id} 
              className="hover:shadow-md transition-shadow duration-200 h-full flex flex-col bg-white border border-gray-200"
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
                <CardContent className="p-3 flex-grow">
                  <h3 className="font-medium text-sm text-gray-900 line-clamp-2 leading-tight mb-1">
                    {product.title}
                  </h3>
                  <p className="text-red-600 font-bold text-sm">
                    ${Number(product.price).toFixed(2)}
                  </p>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Home;