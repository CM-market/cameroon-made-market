
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { User, LayoutDashboard, Package, ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";

const VendorNavbar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="bg-cm-green text-white px-4 py-3 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link to="/" className="font-bold text-xl flex items-center">
            <img
              src="/placeholder.svg"
              alt="Made in Cameroon"
              className="h-8 w-8 mr-2"
            />
            <span className="hidden sm:inline">Made in Cameroon</span>
          </Link>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto">
          <Button 
            variant="ghost" 
            className={`text-white ${isActive("/vendor/dashboard") ? "bg-cm-forest" : "hover:text-cm-yellow"}`}
            asChild
          >
            <Link to="/vendor/dashboard">
              <LayoutDashboard size={18} className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className={`text-white ${isActive("/vendor/products") ? "bg-cm-forest" : "hover:text-cm-yellow"}`}
            asChild
          >
            <Link to="/vendor/products">
              <Package size={18} className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Products</span>
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className={`text-white ${isActive("/vendor/orders") ? "bg-cm-forest" : "hover:text-cm-yellow"}`}
            asChild
          >
            <Link to="/vendor/orders">
              <ShoppingCart size={18} className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Orders</span>
            </Link>
          </Button>
          <Button 
            className={`bg-white text-cm-green hover:bg-cm-sand ${isActive("/vendor/account") ? "bg-cm-sand" : ""}`}
            asChild
          >
            <Link to="/vendor/account">
              <User size={18} className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Account</span>
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default VendorNavbar;
