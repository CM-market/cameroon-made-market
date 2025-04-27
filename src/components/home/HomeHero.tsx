
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HomeHero = () => {
  return (
    <div className="relative bg-cm-green text-white">
      <div className="absolute inset-0 bg-black/20" />
      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold mb-6">
            Discover Authentic Cameroonian Products
          </h1>
          <p className="text-xl mb-8 text-white/90">
            Support local artisans and businesses while experiencing the rich cultural heritage of Cameroon through our carefully curated marketplace.
          </p>
          <div className="flex gap-4">
            <Button asChild size="lg" className="bg-white text-cm-green hover:bg-cm-sand">
              <Link to="/products">Browse Products</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white/20">
              <Link to="/categories">View Categories</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeHero;
