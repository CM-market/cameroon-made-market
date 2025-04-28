
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Check, ShoppingCart, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const ProductDetails: React.FC = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  
  // In a real app, this would fetch product data from API based on productId
  // For demo purposes, we'll use mock data
  const product = {
    id: productId || "1",
    name: "Hand-woven Bamboo Basket",
    price: 15000,
    description: "Traditional bamboo basket handcrafted by skilled artisans in the West Region of Cameroon. Each basket is unique with intricate patterns that showcase generations of craftsmanship.",
    category: "Handcrafts",
    tags: ["Handmade", "Traditional", "Sustainable"],
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    rating: 4.8,
    reviews: 24,
    vendor: "Bamenda Artisans Collective",
    materials: "Locally sourced bamboo, natural dyes",
    dimensions: "30cm x 30cm x 15cm",
    weight: "0.8kg",
    inStock: 25,
    shippingInfo: "Ships within 3-5 business days",
    returnPolicy: "Returns accepted within 14 days of delivery",
  };
  
  const handleAddToCart = () => {
    // In a real app, this would add the product to the cart
    // For demo purposes, we'll just show a toast message
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`
    });
  };

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
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1).map((image, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Product Details */}
          <div>
            <div className="mb-2">
              <Badge className="bg-cm-sand text-black">{product.category}</Badge>
            </div>
            
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>
              <span className="text-sm">{product.rating} ({product.reviews} reviews)</span>
            </div>
            
            <div className="text-3xl font-bold text-cm-green mb-4">
              {product.price.toLocaleString()} FCFA
            </div>
            
            <p className="mb-6 text-gray-700">{product.description}</p>
            
            <div className="mb-6 flex items-center">
              <div className="flex items-center gap-2 text-cm-green">
                <Check size={18} className="text-cm-green" />
                <span className="font-medium">In Stock: {product.inStock} available</span>
              </div>
            </div>
            
            <div className="flex gap-4 mb-8">
              <Button size="lg" onClick={handleAddToCart} className="bg-cm-green hover:bg-cm-forest">
                <ShoppingCart className="mr-2" size={18} />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline">
                Buy Now
              </Button>
            </div>
            
            <Separator className="my-6" />
            
            <div className="mb-6">
              <h2 className="font-semibold text-lg mb-4">Product Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-500">Vendor</span>
                  <span>{product.vendor}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-500">Materials</span>
                  <span>{product.materials}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-500">Dimensions</span>
                  <span>{product.dimensions}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-500">Weight</span>
                  <span>{product.weight}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-500">Shipping</h3>
                <p>{product.shippingInfo}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Return Policy</h3>
                <p>{product.returnPolicy}</p>
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
                    className="w-full h-full object-cover"
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
