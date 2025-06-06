import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Check, ShoppingCart, Star, Plus, Minus, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { productApi, Product } from "@/lib/api";
import { getImageUrl } from "@/services/minioService";
import axios from "axios";

// Type definition for cart items
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  image: string;
  returnPolicy: string;
}

// Add this new component at the top of the file, before ProductDetails
const ZoomableImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition({ x, y });
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsZoomed(true)}
      onMouseLeave={() => setIsZoomed(false)}
      onMouseMove={handleMouseMove}
    >
      <img
        src={src}
        alt={alt}
        className={`w-full h-full transition-transform duration-300 ease-out ${
          isZoomed ? 'scale-150' : 'scale-100'
        }`}
        style={{
          transformOrigin: `${position.x}% ${position.y}%`
        }}
      />
      {isZoomed && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className={`absolute w-24 h-24 border-2 border-cm-green rounded-full -translate-x-1/2 -translate-y-1/2`}
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`
            }}
          />
        </div>
      )}
    </div>
  );
};

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        console.log('Fetching product with ID:', id);
        console.log('API URL:', import.meta.env.VITE_API_URL);
        const response = await productApi.get(id);
        console.log('Product response:', response);
        setProduct(response);
        setError(null);
      } catch (err) {
        console.error('Detailed error:', err);
        if (axios.isAxiosError(err)) {
          console.error('API Error:', {
            status: err.response?.status,
            data: err.response?.data,
            message: err.message
          });
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

  useEffect(() => {
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
          
          // Check if this product is already in cart and set quantity
          const existingItem = parsedCart.find(item => item.id === id);
          if (existingItem) {
            setQuantity(existingItem.quantity);
          }
        }
      } catch (e) {
        console.error('Error parsing cart data', e);
      }
    }
  }, [id]);
  
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);
  
  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };
  
  const handleAddToCart = () => {
    if (!product) return;

    const existingCart = localStorage.getItem('cartItems');
    let cartItems = existingCart ? JSON.parse(existingCart) : [];

    const existingItem = cartItems.find((item: any) => item.id === product.id);

    if (existingItem) {
      cartItems = cartItems.map((item: any) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      cartItems.push({
        id: product.id,
        name: product.title,
        price: Number(product.price),
        quantity: 1,
        category: product.category || 'Uncategorized',
        image: product.image_urls[0] || '/placeholder.svg',
        returnPolicy: product.returnPolicy || 'No return policy specified'
      });
    }

    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    toast({
      title: "Added to Cart",
      description: `${product.title} has been added to your cart.`
    });
  };
  
  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

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
      <div className="min-h-screen bg-background flex flex-col">
        <MainNavbar />
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cm-green mx-auto"></div>
            <p className="mt-4 text-lg">Loading product details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <MainNavbar />
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 text-lg">{error || 'Product not found'}</p>
            <Button
              className="mt-4 bg-cm-green hover:bg-cm-forest"
              onClick={() => navigate('/products')}
            >
              Back to Products
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <MainNavbar />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full bg-gray-100 rounded-lg overflow-hidden">
              <ZoomableImage
                src={getImageUrl(product.image_urls[selectedImageIndex])}
                alt={product.title}
                className="w-auto h-auto"
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
                      className="w-auto h-auto object-cover"
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
            <div className="mb-2">
              <Badge className="bg-cm-sand text-black">{product.category}</Badge>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <p className="text-2xl font-bold text-cm-green">
                {Number(product.price).toLocaleString()} FCFA
              </p>
            </div>

            <Separator />
            
            <p className="mb-6 text-gray-700">{product.description}</p>
            
            <div className="mb-6 flex items-center">
              <div className="flex items-center gap-2 text-cm-green">
                <Check size={18} className="text-cm-green" />
                <span className="font-medium">In Stock: {product.quantity} available</span>
              </div>
            </div>
            
            {/* Quantity selector */}
            <div className="mb-6">
              <label className="block mb-2 font-medium">Quantity</label>
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </Button>
                <span className="mx-4 w-8 text-center">{quantity}</span>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.quantity}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>
            
            <div className="flex gap-4 mb-8">
              <Button 
                size="lg" 
                onClick={handleAddToCart} 
                className="bg-cm-green hover:bg-cm-forest"
              >
                <ShoppingCart className="mr-2" size={18} />
                Add to Cart
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
            </div>
            
            <Separator className="my-6" />
            
            <div>
              <h2 className="text-xl font-semibold mb-2">Details</h2>
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
        
        {/* Reviews Section (placeholder) */}
        <Card className="mt-12 p-6">
          <h2 className="text-xl font-bold mb-6">Customer Reviews</h2>
          <div className="text-center py-12 text-gray-500">
            <p>Product reviews will appear here</p>
          </div>
        </Card>
        
        {/* Related Products (placeholder) */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <Card key={item} className="overflow-hidden">
                <div className="bg-gray-100 aspect-square">
                  <img
                    src="/placeholder.svg"
                    alt="Related Product"
                    className="w-auto h-auto object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">Related Product {item}</h3>
                  <p className="text-cm-green font-bold mt-2">10000 FCFA</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductDetails;
