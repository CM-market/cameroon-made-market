import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, User, Download, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(() => localStorage.getItem('lang') || 'en');
  const langButtonRef = useRef<HTMLButtonElement>(null);
  
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
          // If parsing fails, it's safer to assume no items or keep previous state
          // For now, we'll just log the error and not change the count
          // If you want to reset the count on error, uncomment the line below:
          // setCartCount(0);
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

  const handleInstallPWA = () => {
    // This will only work if the app is installable
    if ('BeforeInstallPromptEvent' in window) {
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the default browser install prompt
        e.preventDefault();
        
        // Cast the event to our custom type
        const promptEvent = e as BeforeInstallPromptEvent;
        
        // Show the install prompt
        promptEvent.prompt();
        
        // Wait for the user to respond to the prompt
        promptEvent.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
          } else {
            console.log('User dismissed the install prompt');
          }
        });
      });
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
    setDropdownOpen(false);
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
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      window.addEventListener('mousedown', handleClick);
    }
    return () => window.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  const handleLangSelect = (code: string) => {
    setSelectedLang(code);
    localStorage.setItem('lang', code);
    i18n.changeLanguage(code);
    setLangDropdownOpen(false);
  };

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        langDropdownOpen &&
        langButtonRef.current &&
        !(e.target as HTMLElement).closest('.lang-dropdown')
      ) {
        setLangDropdownOpen(false);
      }
    };
    if (langDropdownOpen) {
      window.addEventListener('mousedown', handleClick);
    }
    return () => window.removeEventListener('mousedown', handleClick);
  }, [langDropdownOpen]);

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between md:justify-start h-16 px-4">
        {/* Logo */}
        <Link to="/" className="font-bold text-xl flex items-center justify-center w-full md:w-auto md:justify-start">
          <img
            src="/logo.png"
            alt="Transac"
            className="h-10 sm:h-12 w-auto mr-2"
          />
          <span className="hidden sm:inline">{t('welcome')}</span>
        </Link>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 rounded-lg hover:bg-accent absolute right-4"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {dropdownOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Main Navigation - Desktop */}
        <NavigationMenu className="hidden md:flex md:ml-6">
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
        <div className="hidden md:flex items-center gap-2 ml-auto">
          <Link to="/search">
            <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-12 sm:w-12">
              <Search className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative h-10 w-10 sm:h-12 sm:w-12">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-cm-green text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={handleInstallPWA} className="md:flex hidden">
            <Download className="h-5 w-5" />
          </Button>
          {/* Language Selector */}
          <div className="relative lang-dropdown">
            <button
              ref={langButtonRef}
              className="flex items-center gap-1 px-2 py-1 border rounded bg-white hover:bg-gray-100 focus:outline-none"
              onClick={() => setLangDropdownOpen((open) => !open)}
            >
              <span className="text-xl">
                {languageOptions.find(l => l.code === selectedLang)?.flag || '🌐'}
              </span>
              <span className="font-semibold uppercase">{selectedLang}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
                <div className="px-4 py-2 text-xs text-gray-500">{t('changeLanguage')}</div>
                {languageOptions.map(opt => (
                  <button
                    key={opt.code}
                    className={`w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-cm-green/10 ${selectedLang === opt.code ? 'text-cm-green font-bold' : ''}`}
                    onClick={() => handleLangSelect(opt.code)}
                  >
                    <span className="text-lg">{opt.flag}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {isBuyerLoggedIn ? (
            <div className="relative buyer-dropdown">
              <button
                className="ml-4 font-semibold text-cm-green flex items-center gap-1 focus:outline-none"
                onClick={() => setDropdownOpen((open) => !open)}
              >
                {userName}
                <ChevronDown className="w-4 h-4" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-cm-green/10"
                    onClick={() => { setDropdownOpen(false); navigate('/buyer/account-info'); }}
                  >
                    {t('accountInfo')}
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-cm-green/10"
                    onClick={() => { setDropdownOpen(false); navigate('/buyer/settings'); }}
                  >
                    {t('settings')}
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-cm-green/10"
                    onClick={() => { setDropdownOpen(false); navigate('/buyer/account'); }}
                  >
                    {t('account')}
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    {t('logout')}
                  </button>
                </div>
              )}
              {showLogoutConfirm && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
                  <div className="bg-white rounded shadow-lg p-6 w-80">
                    <p className="mb-4">{t('logoutConfirm')}</p>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={cancelLogout}>{t('cancel')}</Button>
                      <Button variant="destructive" onClick={confirmLogout}>{t('yesLogout')}</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  {t('login')}
                </Button>
              </Link>
              <Link to="/buyer/register">
                <Button variant="default" size="sm" className="bg-cm-green text-white hover:bg-cm-forest">
                  {t('signUp')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {dropdownOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto px-4 py-2">
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className={cn(
                    "block px-4 py-3 rounded-lg text-lg font-medium",
                    isActive("/") ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                  )}
                  onClick={() => setDropdownOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className={cn(
                    "block px-4 py-3 rounded-lg text-lg font-medium",
                    isActive("/products") ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                  )}
                  onClick={() => setDropdownOpen(false)}
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className={cn(
                    "block px-4 py-3 rounded-lg text-lg font-medium",
                    isActive("/about") ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                  )}
                  onClick={() => setDropdownOpen(false)}
                >
                  About
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default MainNavbar;
