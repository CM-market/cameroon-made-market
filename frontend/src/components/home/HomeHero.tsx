import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HomeHero = () => {
  return (
    <div className="relative bg-cm-green text-white">
      <div className="absolute inset-0 bg-black/25" />
      <div className="container mx-auto px-4 py-20 relative z-10 flex justify-center items-center">
        <div className="max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold mb-6 tracking-tight sm:text-5xl">
            Empower Local, Shop Global
          </h1>
          <p className="text-lg font-semibold mb-8 text-white/95 leading-relaxed sm:text-xl">
            Launch your Cameroonian business nationwide with your own store. Shop unique local crafts and affordable global goods, delivered with ease.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-cm-green hover:bg-cm-sand px-8 py-6 h-auto text-base font-bold sm:text-lg">
              <Link to="/products">Explore Local & Global</Link>
            </Button>
            <Button asChild size="lg" className="bg-cm-yellow text-black font-extrabold hover:bg-yellow-400 px-8 py-6 h-auto text-base sm:text-lg">
              <Link to="/vendor/register">Create Your Store</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeHero;