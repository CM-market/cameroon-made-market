import React, { useState } from "react";
import MainNavbar from "@/components/MainNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Banknote, CreditCard, Smartphone } from "lucide-react";

const Checkout: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState("mobileMoney");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    region: "",
    mobileMoneyNumber: ""
  });
  const navigate = useNavigate();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would process payment and create order
    const checkoutData = {
      ...formData,
      paymentMethod,
      // Add other order details here
    };
    console.log('Checkout data:', checkoutData);
    navigate("/payment");
  };

  // Sample order summary data
  const orderSummary = {
    subtotal: 62500,
    shipping: 2500,
    total: 65000,
    items: 4
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Delivery Address */}
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input 
                          id="fullName" 
                          required 
                          value={formData.fullName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          type="tel" 
                          required 
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Street Address</Label>
                        <Input 
                          id="address" 
                          required 
                          value={formData.address}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input 
                          id="city" 
                          required 
                          value={formData.city}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="region">Region</Label>
                        <Input 
                          id="region" 
                          required 
                          value={formData.region}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      className="space-y-4"
                    >
                      <div className="flex items-center space-x-2 border rounded-md p-4">
                        <RadioGroupItem value="mobileMoney" id="mobileMoney" />
                        <Label htmlFor="mobileMoney" className="flex-1 cursor-pointer">
                          Mobile Money
                          <p className="text-sm text-muted-foreground">MTN Mobile Money, Orange Money</p>
                        </Label>
                        <div className="flex gap-2">
                          <img src="/mtn-money-logo.png" alt="MTN Money" className="h-10 w-auto" />
                          <img src="/orange-money-logo.png" alt="Orange Money" className="h-10 w-auto" />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 border rounded-md p-4 relative">
                        <RadioGroupItem value="card" id="card" disabled />
                        <Label htmlFor="card" className="flex-1 cursor-not-allowed">
                          <div className="flex items-center gap-2">
                            <span>Credit/Debit Card</span>
                            <Badge variant="destructive">Not Available</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Visa, MasterCard</p>
                        </Label>
                        <div className="flex gap-2">
                          <CreditCard className="h-6 w-6 text-muted-foreground" />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 border rounded-md p-4">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className="flex-1 cursor-pointer">
                          Cash on Delivery
                          <p className="text-sm text-muted-foreground">Pay when you receive the products</p>
                        </Label>
                        <Banknote className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </RadioGroup>
                    
                    {paymentMethod === "mobileMoney" && (
                      <div className="mt-4">
                        <Tabs defaultValue="mtn">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="mtn" className="flex items-center gap-2">
                              <img src="/mtn-money-logo.png" alt="MTN" className="h-8 w-auto" />
                              MTN Mobile Money
                            </TabsTrigger>
                            <TabsTrigger value="orange" className="flex items-center gap-2">
                              <img src="/orange-money-logo.png" alt="Orange" className="h-8 w-auto" />
                              Orange Money
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="mtn" className="space-y-4 mt-4">
                            <div className="space-y-2">
                              <Label htmlFor="mtnNumber">MTN Phone Number</Label>
                              <Input id="mtnNumber" placeholder="6xx xxx xxx" />
                            </div>
                          </TabsContent>
                          <TabsContent value="orange" className="space-y-4 mt-4">
                            <div className="space-y-2">
                              <Label htmlFor="orangeNumber">Orange Phone Number</Label>
                              <Input id="orangeNumber" placeholder="6xx xxx xxx" />
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Button 
                  type="submit" 
                  className="w-full bg-cm-green hover:bg-cm-forest"
                >
                  Place Order
                </Button>
              </div>
            </form>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Items ({orderSummary.items})</span>
                    <span>{orderSummary.subtotal.toLocaleString()} FCFA</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{orderSummary.shipping.toLocaleString()} FCFA</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{orderSummary.total.toLocaleString()} FCFA</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="bg-muted rounded-md p-4">
                    <h3 className="font-medium mb-1">Estimated Delivery</h3>
                    <p className="text-sm text-muted-foreground">
                      3-5 business days after payment confirmation
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
