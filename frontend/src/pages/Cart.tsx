
import React, { useState } from "react";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

// Sample cart data - in a real app this would come from a cart state/context
const initialCartItems = [
  {
    id: "1",
    name: "Hand-woven Bamboo Basket",
    price: 15000,
    quantity: 2,
    image: "/placeholder.svg",
  },
  {
    id: "2",
    name: "Cameroonian Coffee Beans - 500g",
    price: 8500,
    quantity: 1,
    image: "/placeholder.svg",
  },
  {
    id: "3",
    name: "Traditional Handmade Jewelry",
    price: 24000,
    quantity: 1,
    image: "/placeholder.svg",
  }
];

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const navigate = useNavigate();
  
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = cartItems.length > 0 ? 2500 : 0;
  const total = subtotal + shipping;

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems(items => 
      items.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
    
    toast({
      title: "Cart Updated",
      description: "Item quantity has been updated."
    });
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
    
    toast({
      title: "Item Removed",
      description: "The item has been removed from your cart."
    });
  };

  const clearCart = () => {
    setCartItems([]);
    
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from your cart."
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainNavbar />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Your Shopping Cart</h1>
          {cartItems.length > 0 && (
            <Button variant="outline" className="text-red-500" onClick={clearCart}>
              Clear Cart
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {cartItems.length > 0 ? (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => navigate(`/product/${item.id}`)}
                          />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 
                              className="font-semibold cursor-pointer hover:text-cm-green"
                              onClick={() => navigate(`/product/${item.id}`)}
                            >
                              {item.name}
                            </h3>
                            <p className="font-bold text-cm-green">{item.price} FCFA</p>
                          </div>
                          
                          <div className="mt-4 flex justify-between items-center">
                            <div className="flex items-center border rounded-md">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 p-0"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input 
                                className="w-12 h-8 text-center border-0 p-0" 
                                value={item.quantity}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (!isNaN(value) && value > 0) {
                                    updateQuantity(item.id, value);
                                  }
                                }}
                              />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 p-0"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">Your cart is empty</p>
                  <Button onClick={() => navigate("/products")}>
                    Continue Shopping
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{subtotal.toLocaleString()} FCFA</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping.toLocaleString()} FCFA</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{total.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="w-full bg-cm-green hover:bg-cm-forest"
                  onClick={() => navigate("/checkout")}
                  disabled={cartItems.length === 0}
                >
                  Proceed to Checkout
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Input 
                    placeholder="Enter promo code" 
                    className="rounded-r-none" 
                  />
                  <Button className="rounded-l-none">Apply</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Cart;
