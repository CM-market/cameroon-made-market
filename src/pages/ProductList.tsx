
import React, { useState, useEffect } from "react";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Grid, List, ShoppingCart, Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

// Type definition for cart items
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  image: string;
}

// Sample product data - in a real app this would come from an API
const sampleProducts = Array(12).fill(null).map((_, index) => ({
  id: `product-${index + 1}`,
  name: `Cameroon ${index % 3 === 0 ? 'Handmade Basket' : index % 3 === 1 ? 'Coffee Beans' : 'Traditional Fabric'}`,
  price: Math.floor(Math.random() * 20000) + 5000,
  category: index % 3 === 0 ? 'Crafts' : index % 3 === 1 ? 'Food' : 'Textiles',
  image: '/placeholder.svg',
}));

const ProductList: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<number[]>([5000, 25000]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();

  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        }
      } catch (e) {
        console.error('Error parsing cart data', e);
      }
    }
  }, []);

  // Update localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const handleAddToCart = (productId: string, productName: string, productPrice: number, productCategory: string, productImage: string) => {
    const existingItem = cartItems.find(item => item.id === productId);
    
    if (existingItem) {
      // If item exists, increase quantity
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      // If item doesn't exist, add new item
      setCartItems(prevItems => [
        ...prevItems,
        {
          id: productId,
          name: productName,
          price: productPrice,
          quantity: 1,
          category: productCategory,
          image: productImage
        }
      ]);
    }
    
    toast({
      title: "Added to Cart",
      description: `${productName} has been added to your cart.`
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainNavbar />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Filters</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Categories</h3>
                    <div className="space-y-2">
                      {['All', 'Crafts', 'Food', 'Textiles', 'Art', 'Jewelry'].map((category) => (
                        <div key={category} className="flex items-center">
                          <input type="checkbox" id={category} className="mr-2" />
                          <label htmlFor={category} className="text-sm">{category}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Price Range</h3>
                    <Slider 
                      value={priceRange}
                      min={0} 
                      max={50000} 
                      step={1000}
                      onValueChange={setPriceRange}
                      className="my-4"
                    />
                    <div className="flex justify-between text-sm">
                      <span>{priceRange[0]} FCFA</span>
                      <span>{priceRange[1]} FCFA</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Region</h3>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Regions</SelectItem>
                        <SelectItem value="west">West</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="littoral">Littoral</SelectItem>
                        <SelectItem value="north">North</SelectItem>
                        <SelectItem value="south">South</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button className="w-full bg-cm-green hover:bg-cm-forest">
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Cart summary section */}
            <Card className="mt-4">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Your Cart</h2>
                  <Badge variant="secondary">{totalCartItems} items</Badge>
                </div>
                
                {totalCartItems > 0 && (
                  <>
                    <div className="mt-4 font-semibold text-right">
                      Total: {totalCartPrice.toLocaleString()} FCFA
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <Button 
                        className="w-full bg-cm-green hover:bg-cm-forest"
                        onClick={() => navigate('/cart')}
                      >
                        View Cart
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setShowCart(!showCart)}
                      >
                        {showCart ? 'Hide Cart Items' : 'Show Cart Items'}
                      </Button>
                    </div>
                  </>
                )}
                
                {showCart && totalCartItems > 0 && (
                  <div className="mt-4 space-y-3 max-h-60 overflow-y-auto pr-2">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center border-b pb-2">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 p-0"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus size={12} />
                          </Button>
                          <span className="w-6 text-center">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 p-0"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus size={12} />
                          </Button>
                        </div>
                        <div className="flex-1 mx-2 truncate">
                          <div className="text-sm truncate">{item.name}</div>
                          <div className="text-xs text-muted-foreground">{(item.price * item.quantity).toLocaleString()} FCFA</div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 p-0 text-red-500"
                          onClick={() => handleRemoveFromCart(item.id)}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {totalCartItems === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    Your cart is empty
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Products grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Products</h1>
              
              <div className="flex items-center gap-2">
                <Select defaultValue="newest">
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rating</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'outline'} 
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Products */}
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {sampleProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className={`overflow-hidden transition-all ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  <div 
                    className={viewMode === 'list' ? 'w-1/3 cursor-pointer' : 'cursor-pointer'}
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <div className={`bg-gray-100 ${viewMode === 'grid' ? 'aspect-square' : 'h-full'}`}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  <div className={viewMode === 'list' ? 'w-2/3' : ''}>
                    <CardContent className="p-4">
                      <Badge variant="outline" className="mb-2 bg-cm-sand bg-opacity-30">
                        {product.category}
                      </Badge>
                      <h3 
                        className="font-semibold mb-1 cursor-pointer hover:text-cm-green" 
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        {product.name}
                      </h3>
                      <p className="text-cm-green font-bold">{product.price} FCFA</p>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between p-4 pt-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-cm-green hover:bg-cm-forest"
                        onClick={() => handleAddToCart(product.id, product.name, product.price, product.category, product.image)}
                      >
                        <ShoppingCart size={16} className="mr-1" />
                        Add to Cart
                      </Button>
                    </CardFooter>
                  </div>
                </Card>
              ))}
            </div>
            
            {/* Pagination */}
            <div className="mt-8 flex justify-center">
              <div className="flex gap-1">
                <Button variant="outline" size="sm">Previous</Button>
                <Button variant="outline" size="sm" className="bg-cm-green text-white">1</Button>
                <Button variant="outline" size="sm">2</Button>
                <Button variant="outline" size="sm">3</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductList;
