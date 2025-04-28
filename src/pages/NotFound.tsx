
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <MainNavbar />
      
      <div className="flex-1 flex flex-col justify-center items-center p-4">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl mb-8">Page not found</p>
        <p className="text-center text-muted-foreground mb-8 max-w-md">
          Sorry, we couldn't find the page you're looking for. It might have been
          moved or doesn't exist.
        </p>
        <Button asChild>
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
      
      <Footer />
    </div>
  );
};

export default NotFound;
