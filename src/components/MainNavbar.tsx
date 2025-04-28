
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const MainNavbar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
  // In a real app, this would be managed by a global state
  // For demo purposes, we'll use localStorage to simulate persistence
  const [cartCount, setCartCount] = useState(0);
  
  useEffect(() => {
    // Check localStorage for cart items on initial load
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      try {
        const cartItems = JSON.parse(storedCart);
        const itemCount = Array.isArray(cartItems) 
          ? cartItems.reduce((sum, item) => sum + item.quantity, 0) 
          : 0;
        setCartCount(itemCount);
      } catch (e) {
        console.error('Error parsing cart data', e);
      }
    }
  }, []);

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="font-bold text-xl flex items-center">
          <img
            src="/placeholder.svg"
            alt="Made in Cameroon"
            className="h-8 w-8 mr-2"
          />
          <span className="hidden sm:inline">Made in Cameroon</span>
        </Link>

        {/* Main Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/">
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    isActive("/") && "bg-accent text-accent-foreground"
                  )}
                >
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/products">
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    isActive("/products") && "bg-accent text-accent-foreground"
                  )}
                >
                  Products
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/about">
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    isActive("/about") && "bg-accent text-accent-foreground"
                  )}
                >
                  About
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right-side actions */}
        <div className="flex items-center gap-2">
          <Link to="/search">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-cm-green text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="sm" className="ml-2">
              <User className="h-4 w-4 mr-2" />
              Login
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default MainNavbar;
