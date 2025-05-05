
import React from "react";
import { useNavigate } from "react-router-dom";
import VendorNavbar from "@/components/VendorNavbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// This would come from the backend in a real implementation
const sampleProduct = {
  id: "1",
  name: "Hand-woven Bamboo Basket",
  price: "15000",
  description:
    "Traditional bamboo basket handcrafted by skilled artisans in the West Region of Cameroon. Each basket is unique with intricate patterns that showcase generations of craftsmanship.",
  category: "Handcrafts",
  tags: ["Handmade", "Traditional", "Sustainable"],
  images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
  materials: "Locally sourced bamboo, natural dyes",
  dimensions: "30cm x 30cm x 15cm",
  weight: "0.8",
  shippingInfo: "Ships within 3-5 business days",
  returnPolicy: "Returns accepted within 14 days of delivery",
  stockQuantity: "25",
  status: "pending",
};

const ProductPreview: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <VendorNavbar />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={16} className="mr-2" /> Back to Form
        </Button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold text-gray-800">
                {sampleProduct.name}
              </h1>
              <Badge className="bg-cm-yellow text-black">Preview Mode</Badge>
            </div>
            <p className="text-gray-600 mt-2">
              This is how your product will appear to customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            <div>
              <div className="mb-6">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={sampleProduct.images[0]}
                    alt={sampleProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2 mt-2">
                  {sampleProduct.images.slice(1).map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                    >
                      <img
                        src={image}
                        alt={`${sampleProduct.name} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-semibold text-lg mb-2">Product Details</h2>
                <div className="space-y-3">
                  {sampleProduct.materials && (
                    <div className="flex">
                      <span className="font-medium w-24">Materials:</span>
                      <span>{sampleProduct.materials}</span>
                    </div>
                  )}
                  {sampleProduct.dimensions && (
                    <div className="flex">
                      <span className="font-medium w-24">Dimensions:</span>
                      <span>{sampleProduct.dimensions}</span>
                    </div>
                  )}
                  {sampleProduct.weight && (
                    <div className="flex">
                      <span className="font-medium w-24">Weight:</span>
                      <span>{sampleProduct.weight} kg</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="text-3xl font-bold text-cm-green mb-4">
                {sampleProduct.price} FCFA
              </div>

              <div className="flex gap-2 mb-4">
                <Badge variant="outline" className="bg-cm-sand bg-opacity-30">
                  {sampleProduct.category}
                </Badge>
                {sampleProduct.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <Check size={18} className="text-cm-green" />
                  <span className="text-cm-green font-medium">
                    In Stock: {sampleProduct.stockQuantity} available
                  </span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="mb-6">
                <h2 className="font-semibold text-lg mb-2">Description</h2>
                <p className="text-gray-700">{sampleProduct.description}</p>
              </div>

              <Separator className="my-4" />

              {sampleProduct.shippingInfo && (
                <div className="mb-4">
                  <h2 className="font-semibold text-lg mb-2">
                    Shipping Information
                  </h2>
                  <p className="text-gray-700">{sampleProduct.shippingInfo}</p>
                </div>
              )}

              {sampleProduct.returnPolicy && (
                <div>
                  <h2 className="font-semibold text-lg mb-2">Return Policy</h2>
                  <p className="text-gray-700">{sampleProduct.returnPolicy}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-6 border-t">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                Preview mode shows how your product will appear to customers.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate("/")}>
                  Edit Product
                </Button>
                <Button className="bg-cm-green hover:bg-cm-forest">
                  Submit Product
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;
