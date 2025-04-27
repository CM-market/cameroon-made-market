
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import HomeHero from "@/components/home/HomeHero";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CategoriesGrid from "@/components/home/CategoriesGrid";
import MarketplaceStats from "@/components/home/MarketplaceStats";

const Home = () => {
  return (
    <div className="min-h-screen">
      <HomeHero />
      <div className="container mx-auto px-4 py-12 space-y-16">
        <CategoriesGrid />
        <FeaturedProducts />
        <MarketplaceStats />
        
        <section className="text-center py-12">
          <h2 className="text-3xl font-bold mb-6">Join Our Growing Community</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Are you a Cameroonian artisan, farmer, or small business owner? Start selling your products to customers across the country.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild className="bg-cm-green hover:bg-cm-forest">
              <Link to="/vendor/register">Start Selling</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
