import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, User, ChevronDown, Settings, UserCircle, LogOut, Store, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';
import { Separator } from "@/components/ui/separator";

// Define the BeforeInstallPromptEvent interface
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string
  }>;
  prompt(): Promise<void>;
}

const languageOptions = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" }
];

const MainNavbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;
  
  // For demo purposes, we'll use localStorage to simulate persistence
  const [cartCount, setCartCount] = useState(0);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("products");
  
  const { t } = useTranslation();
  
  useEffect(() => {
    // Check localStorage for cart items on initial load and when it changes
    const storedCart = localStorage.getItem('cartItems');
    
    const handleStorageChange = () => {
      const updatedCart = localStorage.getItem('cartItems');
      if (updatedCart) {
        try {
          const cartItems = JSON.parse(updatedCart);
          const itemCount = Array.isArray(cartItems) 
            ? cartItems.reduce((sum, item) => sum + item.quantity, 0) 
            : 0;
          setCartCount(itemCount);
        } catch (e) {
          console.error('Error parsing cart data', e);
        }
      } else {
        setCartCount(0);
      }
    };

    // Initial load
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
    
    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Create a custom event for updating cart count
    const checkCartInterval = setInterval(handleStorageChange, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkCartInterval);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}&type=${searchType}`);
    }
  };

  // Check if user is logged in as Buyer
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName');
  const token = localStorage.getItem('token');
  const isBuyerLoggedIn = userRole === 'Buyer' && !!token;

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    setShowLogoutConfirm(false);
    setUserDropdownOpen(false);
    navigate('/');
    window.location.reload(); // To force navbar update
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.buyer-dropdown')) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      window.addEventListener('mousedown', handleClick);
    }
    return () => window.removeEventListener('mousedown', handleClick);
  }, [userDropdownOpen]);

  const searchTypeOptions = [
    { value: "products", label: "Products", icon: Search },
    { value: "stores", label: "Stores", icon: Store },
    { value: "categories", label: "Categories", icon: Tag }
  ];

  return (
    <header className="border-b bg-white sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4">
        {/* Top bar with logo and user actions */}
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <Link to="/" className="font-bold text-xl flex items-center shrink-0">
            <img
              src="/logo.png"
              alt="Transac"
              className="h-8 w-auto mr-2"
            />
            <span className="hidden sm:inline text-gray-900">{t('welcome')}</span>
          </Link>
          
          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Sell Button - Very prominent and intuitive */}
            <Link to="/vendor/register">
              <Button 
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg text-base border-2 border-yellow-400"
              >
                <Store className="h-5 w-5" />
                <span className="hidden sm:inline">Start Selling</span>
                <span className="sm:hidden">Sell</span>
              </Button>
            </Link>

            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User menu - only show if logged in */}
            {isBuyerLoggedIn && (
              <div className="relative buyer-dropdown shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => setUserDropdownOpen((open) => !open)}
                >
                  <User className="h-4 w-4" />
                  <span className="text-gray-700">{userName}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </Button>
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-[100] overflow-hidden">
                    <div className="py-1">
                      <Button
                        variant="ghost"
                        className="w-full text-left px-4 py-2 flex items-center gap-2 text-gray-700"
                        onClick={() => { setUserDropdownOpen(false); navigate('/buyer/account-info'); }}
                      >
                        <User className="h-4 w-4" />
                        {t('accountInfo')}
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full text-left px-4 py-2 flex items-center gap-2 text-gray-700"
                        onClick={() => { setUserDropdownOpen(false); navigate('/buyer/settings'); }}
                      >
                        <Settings className="h-4 w-4" />
                        {t('settings')}
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full text-left px-4 py-2 flex items-center gap-2 text-gray-700"
                        onClick={() => { setUserDropdownOpen(false); navigate('/buyer/account'); }}
                      >
                        <UserCircle className="h-4 w-4" />
                        {t('account')}
                      </Button>
                      <Separator className="my-1" />
                      <Button
                        variant="ghost"
                        className="w-full text-left px-4 py-2 text-red-600 flex items-center gap-2"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        {t('logout')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Search section */}
        <div className="py-4">
          {/* Search type tabs - very visible and intuitive */}
          <div className="flex justify-center mb-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {searchTypeOptions.map(option => (
                <Button
                  key={option.value}
                  variant={searchType === option.value ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md transition-all",
                    searchType === option.value 
                      ? "bg-green-600 text-white shadow-sm" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  )}
                  onClick={() => setSearchType(option.value)}
                >
                  {React.createElement(option.icon, { className: "h-4 w-4" })}
                  <span className="font-medium">{option.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center justify-center">
            <form onSubmit={handleSearch} className="w-full max-w-2xl">
              <div className="relative">
                <Input
                  type="text"
                  placeholder={`What ${searchType} are you looking for?`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-20 py-4 text-lg border-2 border-gray-300 focus:border-green-500 rounded-lg"
                />
                <Button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md h-10 flex items-center justify-center"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-[200] bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <p className="mb-4">{t('logoutConfirm')}</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelLogout}>{t('cancel')}</Button>
              <Button variant="destructive" onClick={confirmLogout}>{t('Yes logout')}</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default MainNavbar;