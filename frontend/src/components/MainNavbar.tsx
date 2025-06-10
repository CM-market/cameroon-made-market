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
import { Search, ShoppingCart, User, Download, ChevronDown, Settings, UserCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
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
    <header className="border-b bg-background sticky top-0 z-50 w-full">
      <div className="container mx-auto flex items-center h-16 px-4">
        {/* Logo */}
        <Link to="/" className="font-bold text-xl flex items-center shrink-0">
          <img
            src="/logo.png"
            alt="Transac"
            className="h-10 sm:h-12 w-auto mr-2"
          />
          <span className="hidden sm:inline">{t('welcome')}</span>
        </Link>
        
        {/* Mobile Action Buttons - Always visible on mobile */}
        <div className="flex-1 flex items-center justify-center md:hidden">
          <div className="flex items-center gap-1">
            <Link to="/search">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Search className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-cm-green text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <Button 
          className="md:hidden p-2 rounded-lg hover:bg-accent shrink-0"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
            {mobileMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </Button>

        {/* Main Navigation - Desktop */}
        <div className="hidden md:flex flex-1 justify-center">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
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
        </div>

        {/* Right-side actions - Desktop */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
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
          <div className="relative lang-dropdown shrink-0">
            <Button
              ref={langButtonRef}
              className="flex items-center gap-1 px-2 py-1 border rounded focus:outline-none hover:bg-accent/50"
              onClick={() => setLangDropdownOpen((open) => !open)}
            >
              <span className="text-xl">
                {languageOptions.find(l => l.code === selectedLang)?.flag || '🌐'}
              </span>
              <span className="font-semibold uppercase text-gray-900">{selectedLang}</span>
              <ChevronDown className="w-4 h-4 text-gray-900" />
            </Button>
            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-[100]">
                <div className="px-4 py-2 text-xs text-gray-500">{t('changeLanguage')}</div>
                {languageOptions.map(opt => (
                  <Button
                   variant="ghost"
                    key={opt.code}
                    className={`w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-accent/50 ${selectedLang === opt.code ? 'text-gray-900 font-bold' : 'text-gray-700'}`}
                    onClick={() => handleLangSelect(opt.code)}
                  >
                    <span className="text-lg">{opt.flag}</span>
                    <span>{opt.label}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
          {isBuyerLoggedIn ? (
            <div className="relative buyer-dropdown shrink-0">
              <Button
                className="ml-4 font-semibold flex items-center gap-1 focus:outline-none hover:bg-accent/50 px-3 py-2 rounded-md"
                onClick={() => setUserDropdownOpen((open) => !open)}
              >
                <User className="h-4 w-4 text-gray-900" />
                <span className="text-gray-900">{userName}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${userDropdownOpen ? 'rotate-180' : ''} text-gray-900`} />
              </Button>
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-[100] overflow-hidden">
                  <div className="py-1">
                    <Button
                      variant="ghost"
                      className="w-full text-left px-4 py-3 flex items-center gap-2 text-gray-700"
                      onClick={() => { setUserDropdownOpen(false); navigate('/buyer/account-info'); }}
                    >
                      <User className="h-4 w-4" />
                      {t('accountInfo')}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full text-left px-4 py-3 flex items-center gap-2 text-gray-700"
                      onClick={() => { setUserDropdownOpen(false); navigate('/buyer/settings'); }}
                    >
                      <Settings className="h-4 w-4" />
                      {t('settings')}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full text-left px-4 py-3 flex items-center gap-2 text-gray-700"
                      onClick={() => { setUserDropdownOpen(false); navigate('/buyer/account'); }}
                    >
                      <UserCircle className="h-4 w-4" />
                      {t('account')}
                    </Button>
                    <Separator className="my-1" />
                    <Button
                      variant="ghost"
                      className="w-full text-left px-4 py-3 text-red-600 flex items-center gap-2"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      {t('logout')}
                    </Button>
                  </div>
                </div>
              )}
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
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2 shrink-0">
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
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background w-full">
          <nav className="container mx-auto px-4 py-2">
            <ul className="space-y-2">
              {/* Login and Signup buttons in toggle menu */}
              {!isBuyerLoggedIn && (
                <>
                  <li className="mt-4">
                    <Link
                      to="/login"
                      className="block px-4 py-3 rounded-lg text-lg font-medium border border-black text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4 inline mr-2" />
                      {t('login')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/buyer/register"
                      className="block px-4 py-3 rounded-lg text-lg font-medium border-2 bg-cm-green text-white text-center mt-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('signUp')}
                    </Link>
                  </li>
                </>
              )}
            </ul>
            
            {/* Language options */}
            <div className="mt-4 pt-4 border-t">
              <div className="font-medium text-sm text-muted-foreground mb-2">{t('changeLanguage')}</div>
              <div className="flex gap-2">
                {languageOptions.map(opt => (
                  <Button
                    key={opt.code}
                    className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${selectedLang === opt.code ? 'bg-cm-green/10 text-cm-green font-bold' : 'hover:bg-accent/50'}`}
                    onClick={() => handleLangSelect(opt.code)}
                  >
                    <span className="text-lg">{opt.flag}</span>
                    <span>{opt.label}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Account options for logged-in buyers */}
            {isBuyerLoggedIn && (
              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="font-semibold text-cm-green mb-2">{userName}</div>
                <Link 
                  to="/buyer/account-info" 
                  className="px-4 py-2 rounded-lg hover:bg-accent/50 flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  {t('accountInfo')}
                </Link>
                <Link 
                  to="/buyer/settings" 
                  className="px-4 py-2 rounded-lg hover:bg-accent/50 flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  {t('settings')}
                </Link>
                <Link 
                  to="/buyer/account" 
                  className="px-4 py-2 rounded-lg hover:bg-accent/50 flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserCircle className="h-4 w-4" />
                  {t('account')}
                </Link>
                <Button
                  variant="ghost"
                  className="w-full text-left px-4 py-3 text-red-600 flex items-center gap-2"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="h-4 w-4 inline mr-2" />
                  {t('logout')}
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}

      {/* Logout Confirmation Modal - Shared between mobile and desktop */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-[200] bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <p className="mb-4">{t('Are you sure!')}</p>
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
