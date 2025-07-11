import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VendorNavbar from "@/components/VendorNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { productApi, Product } from "@/lib/api";
import { getImageUrl } from "@/services/minioService";
import axios from "axios";

const VendorProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await productApi.get(id);
        setProduct(response);
        setError(null);
      } catch (err) {
        console.error('Error fetching product:', err);
        if (axios.isAxiosError(err)) {
          setError(`Failed to fetch product details: ${err.response?.data?.message || err.message}`);
        } else {
          setError('Failed to fetch product details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const nextImage = () => {
    if (!product) return;
    setSelectedImageIndex((prev) => 
      prev === product.image_urls.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    if (!product) return;
    setSelectedImageIndex((prev) => 
      prev === 0 ? product.image_urls.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <VendorNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cm-green mx-auto"></div>
            <p className="mt-4 text-lg">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <VendorNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-500 text-lg">{error || 'Product not found'}</p>
            <Button
              className="mt-4 bg-cm-green hover:bg-cm-forest"
              onClick={() => navigate('/vendor/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <VendorNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => navigate('/vendor/dashboard')}
        >
          <ArrowLeft size={16} className="mr-2" /> Back to Dashboard 
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={getImageUrl(product.image_urls[selectedImageIndex])}
                alt={product.title}
                className="w-full h-full object-contain p-2"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              {product.image_urls.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={previousImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.image_urls.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.image_urls.map((image, index) => (
                  <button
                    key={index}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? 'border-cm-green' : 'border-transparent'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${product.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="mb-2">
                  <Badge className="bg-cm-sand text-black">{product.category}</Badge>
                </div>
                <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
                <p className="text-2xl font-bold text-cm-green">
                  {Number(product.price).toLocaleString()} FCFA
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate(`/vendor/products/${product.id}/edit`)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Product
              </Button>
            </div>

            <Separator className="my-6" />
            
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-700">{product.description}</p>
              </div>

              <div className="flex items-center gap-2 text-cm-green">
                <Check size={18} className="text-cm-green" />
                <span className="font-medium">In Stock: {product.quantity} available</span>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2">Product Details</h2>
                <div className="space-y-2">
                  <p><span className="font-medium">Category:</span> {product.category || 'Uncategorized'}</p>
                  <p><span className="font-medium">Available Quantity:</span> {product.quantity}</p>
                  {product.returnPolicy && (
                    <p><span className="font-medium">Return Policy:</span> {product.returnPolicy}</p>
                  )}
                  {product.sales !== undefined && (
                    <p><span className="font-medium">Total Sales:</span> {product.sales}</p>
                  )}
                  {product.revenue !== undefined && (
                    <p><span className="font-medium">Total Revenue:</span> {product.revenue.toLocaleString()} FCFA</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProductDetails; 