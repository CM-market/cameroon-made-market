import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const HomeHero = () => {
  const { t } = useTranslation('home');
  return (
    <div className="relative bg-cm-green text-white">
      <div className="absolute inset-0 bg-black/25" />
      <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 relative z-10 flex flex-col items-center justify-center">
        <div className="max-w-3xl text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 tracking-tight">
         {t('empowering')}
          </h1>
          <p className="text-base sm:text-lg md:text-xl font-semibold mb-6 sm:mb-8 text-white/95 leading-relaxed max-w-2xl mx-auto">
         {t('empoweringDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button 
              asChild 
              size="lg" 
              className="bg-white text-cm-green hover:bg-cm-sand px-6 sm:px-8 py-5 sm:py-6 h-auto text-base font-bold sm:text-lg w-full sm:w-auto"
            >
              <Link to="/products">{t('ExploreLocal')}</Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              className="bg-cm-yellow text-black font-extrabold hover:bg-yellow-400 px-6 sm:px-8 py-5 sm:py-6 h-auto text-base sm:text-lg w-full sm:w-auto"
            >
              <Link to="/vendor/register">{t('createYourStore')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeHero;