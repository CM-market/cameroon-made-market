import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import HomeHero from "@/components/home/HomeHero";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CategoriesGrid from "@/components/home/CategoriesGrid";
import MarketplaceStats from "@/components/home/MarketplaceStats";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <MainNavbar />
      
      <div className="flex-grow">
        <HomeHero />
        <div className="container mx-auto px-4 py-12 space-y-16">
          <CategoriesGrid />
          <FeaturedProducts />
          <MarketplaceStats />
          
          <section className="bg-cm-green text-white py-16 rounded-lg">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-6">Join Our Growing Community</h2>
              <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                Are you a Cameroonian artisan, farmer, or small business owner? Start selling your products to customers across the country.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button asChild size="lg" className="bg-cm-yellow text-black hover:bg-yellow-400 text-lg px-10 py-7 h-auto font-bold text-xl shadow-lg">
                  <Link to="/vendor/register">Start Selling Today</Link>
                </Button>
                <Button asChild size="lg" className="bg-white text-cm-green hover:bg-cm-sand text-lg px-10 py-7 h-auto font-bold text-xl shadow-lg border border-cm-green">
                  <Link to="/buyer/register">Start Buying</Link>
                </Button>
              </div>
            </div> 
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Home;
