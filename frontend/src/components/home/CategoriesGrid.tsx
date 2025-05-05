
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, Headphones, Sofa, Home, ShoppingBag } from "lucide-react";

const categories = [
  { id: 1, name: "Handcrafts", icon: "🎨" },
  { id: 2, name: "Food & Drinks", icon: "🍲" },
  { id: 3, name: "Clothing & Fashion", icon: "👗" },
  { id: 4, name: "Home & Decor", icon: "🏡" },
  { id: 5, name: "Art & Collectibles", icon: "🎭" },
  { id: 6, name: "Electronics", icon: <Headphones className="h-10 w-10" /> },
  { id: 7, name: "Home Furniture", icon: <Sofa className="h-10 w-10" /> },
  { id: 8, name: "Jewelry", icon: "💍" }, // Changed to emoji since Jewel icon doesn't exist
];

const CategoriesGrid = () => {
  return (
    <section>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Browse Categories</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link key={category.id} to={`/products?category=${category.name.toLowerCase()}`}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                {typeof category.icon === 'string' ? (
                  <span className="text-4xl mb-3 block">{category.icon}</span>
                ) : (
                  <div className="flex justify-center mb-3">{category.icon}</div>
                )}
                <h3 className="font-medium">{category.name}</h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <Button asChild variant="outline" className="flex items-center gap-1">
          <Link to="/products">
            More Categories <ChevronDown size={16} />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default CategoriesGrid;
