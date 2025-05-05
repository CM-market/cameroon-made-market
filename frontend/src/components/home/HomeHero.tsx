
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HomeHero = () => {
  return (
    <div className="relative bg-cm-green text-white">
      <div className="absolute inset-0 bg-black/20" />
      <div className="container mx-auto px-4 py-24 relative z-10 flex justify-center items-center">
        <div className="max-w-3xl text-center">
          <h1 className="text-5xl font-bold mb-6">
            Discover Authentic Cameroonian Products
          </h1>
          <p className="text-xl mb-8 text-white/90">
            Support local artisans and businesses while experiencing the rich cultural heritage of Cameroon through our carefully curated marketplace.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-cm-green hover:bg-cm-sand px-8 py-6 h-auto">
              <Link to="/products">Browse Products</Link>
            </Button>
            <Button asChild size="lg" className="bg-cm-yellow text-black font-bold hover:bg-yellow-400 px-8 py-6 h-auto">
              <Link to="/vendor/register">Start Selling</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeHero;
