
import React from "react";
import MainNavbar from "@/components/MainNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Sample cart data - in a real app this would come from a cart state/context
const sampleCartItems = [
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
  const navigate = useNavigate();
  
  const subtotal = sampleCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 2500;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {sampleCartItems.length > 0 ? (
              <div className="space-y-4">
                {sampleCartItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="font-bold text-cm-green">{item.price} FCFA</p>
                          </div>
                          
                          <div className="mt-4 flex justify-between items-center">
                            <div className="flex items-center border rounded-md">
                              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <Button variant="ghost" size="sm" className="text-red-500">
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
                >
                  Proceed to Checkout
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <input id="promo" type="text" placeholder="Enter promo code" 
                    className="flex-1 border rounded-l-md px-3 py-2 focus:outline-none" 
                  />
                  <Button className="rounded-l-none">Apply</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
