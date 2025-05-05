
import React from "react";
import VendorNavbar from "@/components/VendorNavbar";
import ProductForm from "@/components/ProductForm";
import ProductStatus from "@/components/ProductStatus";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 cm-pattern-bg">
      <VendorNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Add New Product</h1>
            <p className="text-gray-600">
              List your product on the Made in Cameroon Marketplace
            </p>
          </div>
          <div>
            <Button type="submit" className="w-full bg-cm-green hover:bg-cm-forest">
            <a href="/vendor/dashboard" className="hover:bg-cm-forest">
              View My Products
            </a>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProductForm />
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Verification Process</h2>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cm-green text-white flex items-center justify-center">
                      1
                    </div>
                    <div>
                      <h3 className="font-medium">Create Listing</h3>
                      <p className="text-sm text-gray-600">
                        Fill out the product form with details about your product.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cm-green text-white flex items-center justify-center">
                      2
                    </div>
                    <div>
                      <h3 className="font-medium">Submit for Verification</h3>
                      <p className="text-sm text-gray-600">
                        Our team verifies that your product meets our Made in Cameroon criteria.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cm-green text-white flex items-center justify-center">
                      3
                    </div>
                    <div>
                      <h3 className="font-medium">Get Approved</h3>
                      <p className="text-sm text-gray-600">
                        Once approved, your product will be listed on the marketplace.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="requirements">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
              </TabsList>
              
              <TabsContent value="requirements">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <h3 className="font-medium text-cm-green">Product Origin</h3>
                      <p className="text-sm">
                        Products must be made or significantly transformed in Cameroon.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-cm-green">Local Materials</h3>
                      <p className="text-sm">
                        At least 60% of materials should be sourced locally when possible.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-cm-green">Documentation</h3>
                      <p className="text-sm">
                        Be ready to provide documentation on product origin if requested.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-cm-green">Image Quality</h3>
                      <p className="text-sm">
                        Clear images showing the product from multiple angles.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="examples">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <h3 className="font-medium text-cm-green">Qualifying Products:</h3>
                      <ul className="text-sm list-disc pl-5 space-y-1 mt-2">
                        <li>Handmade baskets using locally grown raffia</li>
                        <li>Clothing made with Cameroonian cotton</li>
                        <li>Food products using locally grown ingredients</li>
                        <li>Traditional art created by Cameroonian artisans</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-cm-red">Non-qualifying Products:</h3>
                      <ul className="text-sm list-disc pl-5 space-y-1 mt-2">
                        <li>Imported products with minimal modification</li>
                        <li>Products where the primary materials are imported</li>
                        <li>Digital products without significant local content</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            {/* Example of a product status card - this would come from backend data */}
            <ProductStatus
              status="pending"
              submittedAt="April 26, 2025 • 10:23 AM"
              message="Your product is being reviewed by our team for Made in Cameroon verification."
            />
          </div>
        </div>
      </div>
      
      <footer className="mt-auto py-6 bg-gray-100 border-t">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-600 text-sm">
            <p>&copy; 2025 Made in Cameroon Marketplace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
