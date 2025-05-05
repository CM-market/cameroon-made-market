
import React, { useState } from "react";
import MainNavbar from "@/components/MainNavbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  
  // Sample search results - in a real app these would come from an API based on the search query
  const sampleResults = {
    products: [
      {
        id: "1",
        name: "Hand-woven Bamboo Basket",
        price: 15000,
        category: "Crafts",
        image: "/placeholder.svg",
      },
      {
        id: "2",
        name: "Cameroonian Coffee Beans - 500g",
        price: 8500,
        category: "Food",
        image: "/placeholder.svg",
      },
      {
        id: "3",
        name: "Traditional Handmade Jewelry",
        price: 24000,
        category: "Jewelry",
        image: "/placeholder.svg",
      },
    ],
    vendors: [
      {
        id: "1",
        name: "Bamenda Crafts",
        region: "North-West",
        products: 24,
        image: "/placeholder.svg",
      },
      {
        id: "2",
        name: "Douala Textiles",
        region: "Littoral",
        products: 18,
        image: "/placeholder.svg",
      },
    ],
    categories: [
      { id: "1", name: "Traditional Crafts", count: 42 },
      { id: "2", name: "Food & Beverages", count: 36 },
      { id: "3", name: "Textiles & Clothing", count: 28 },
    ]
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would trigger a search API call
    console.log("Searching for:", query);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto mb-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Search Products</h1>
          
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, categories, or vendors..."
              className="flex-1"
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </div>
        
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {["Crafts", "Food", "Textiles", "Jewelry", "Art", "Home Decor"].map((tag) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="cursor-pointer hover:bg-muted"
                onClick={() => setQuery(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid grid-cols-3 max-w-md mx-auto mb-6">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleResults.products.map((product) => (
                <Card 
                  key={product.id} 
                  className="overflow-hidden cursor-pointer hover:shadow-md"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="bg-gray-100 aspect-square">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <Badge variant="outline" className="mb-2 bg-cm-sand bg-opacity-30">
                      {product.category}
                    </Badge>
                    <h3 className="font-semibold mb-1">{product.name}</h3>
                    <p className="text-cm-green font-bold">{product.price.toLocaleString()} FCFA</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="vendors">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleResults.vendors.map((vendor) => (
                <Card 
                  key={vendor.id} 
                  className="overflow-hidden cursor-pointer hover:shadow-md"
                  onClick={() => navigate(`/vendor-profile/${vendor.id}`)}
                >
                  <div className="bg-gray-100 aspect-video">
                    <img
                      src={vendor.image}
                      alt={vendor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1">{vendor.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {vendor.region} Region
                    </p>
                    <Badge variant="outline">
                      {vendor.products} Products
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="categories">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleResults.categories.map((category) => (
                <Card 
                  key={category.id} 
                  className="cursor-pointer hover:shadow-md"
                  onClick={() => navigate(`/products?category=${category.name}`)}
                >
                  <CardContent className="p-6 flex justify-between items-center">
                    <h3 className="font-semibold">{category.name}</h3>
                    <Badge variant="outline">
                      {category.count} Products
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SearchPage;
