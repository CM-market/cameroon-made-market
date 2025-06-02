import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// This would come from an API in a real implementation
const featuredProducts = [
  {
    id: 1,
    name: "Hand-woven Basket",
    price: "15000",
    category: "Handcrafts",
    image: "/placeholder.svg",
    vendor: "Bamenda Artisans",
  },
  {
    id: 2,
    name: "Traditional Coffee Blend",
    price: "5000",
    category: "Food & Drinks",
    image: "/placeholder.svg",
    vendor: "Mountain Coffee Co.",
  },
  {
    id: 3,
    name: "Handmade Pottery Set",
    price: "25000",
    category: "Home & Decor",
    image: "/placeholder.svg",
    vendor: "Clay Masters",
  },
  {
    id: 4,
    name: "Organic Honey",
    price: "3500",
    category: "Food & Drinks",
    image: "/placeholder.svg",
    vendor: "Forest Harvest",
  },
];

const FeaturedProducts = () => {
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
        {featuredProducts.map((product) => (
          <Card 
            key={product.id} 
            className="hover:shadow-lg transition-shadow duration-200 h-full flex flex-col"
          >
            <Link to={`/product/${product.id}`} className="flex flex-col h-full">
              <div className="relative aspect-square w-full overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <CardContent className="p-4 flex-grow">
                <Badge variant="outline" className="mb-2 text-xs sm:text-sm">
                  {product.category}
                </Badge>
                <h3 className="font-semibold text-base sm:text-lg mb-1 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base line-clamp-1">
                  {product.vendor}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0 mt-auto">
                <p className="text-cm-green font-semibold text-base sm:text-lg">
                  {product.price} FCFA
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
