
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
    <section>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Featured Products</h2>
        <Link to="/products" className="text-cm-green hover:text-cm-forest">
          View All →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <Link to={`/product/${product.id}`}>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <CardContent className="p-4">
                <Badge variant="outline" className="mb-2">
                  {product.category}
                </Badge>
                <h3 className="font-semibold mb-1">{product.name}</h3>
                <p className="text-gray-600 text-sm">{product.vendor}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <p className="text-cm-green font-semibold">
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
