
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
  { id: 1, name: "Handcrafts", icon: "🎨" },
  { id: 2, name: "Food & Drinks", icon: "🍲" },
  { id: 3, name: "Clothing & Fashion", icon: "👗" },
  { id: 4, name: "Home & Decor", icon: "🏡" },
  { id: 5, name: "Art & Collectibles", icon: "🎭" },
  { id: 6, name: "Agriculture", icon: "🌾" },
];

const CategoriesGrid = () => {
  return (
    <section>
      <h2 className="text-3xl font-bold mb-8 text-center">Browse Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Link key={category.id} to={`/category/${category.id}`}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <span className="text-4xl mb-3 block">{category.icon}</span>
                <h3 className="font-medium">{category.name}</h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoriesGrid;
