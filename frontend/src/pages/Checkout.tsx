
import React, { useState } from "react";
import MainNavbar from "@/components/MainNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { orderApi } from "@/lib/api"; // make sure this is added at the top
import { useNavigate } from "react-router-dom";


const Checkout: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState("mobileMoney");
  const cartItemsString = localStorage.getItem("cartItems");
  const cartItems = cartItemsString ? JSON.parse(cartItemsString) : [];
  const orderItems = cartItems.map(item => ({
    product_id: item.id,
    quantity: item.quantity,
    price: item.price,
  }));
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    delivery_address: '',
    city: '',
    region: '',
    total: Number(),
    items: [{ product_id: '', quantity: Number(), price: Number() }],
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const total = orderSummary.total;

    const data = {
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      delivery_address: form.delivery_address,
      city: form.city,
      region: form.region,
      paymentMethod,
      items: orderItems,
      total,
    };

    try {
      const order = await orderApi.create(data);
      // Store full order in localStorage
      localStorage.setItem("currentOrder", JSON.stringify(order));
      navigate("/payment");
    } catch (error) {
      console.error("Failed to place order", error);
      alert("There was an issue placing your order. Please try again.");
    }
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
                        <Input id="fullName" required value={form.customer_name}
                          onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" required value={form.customer_phone}
                          onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Street Address</Label>
                        <Input id="address" required value={form.delivery_address}
                          onChange={(e) => setForm({ ...form, delivery_address: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" required value={form.city}
                          onChange={(e) => setForm({ ...form, city: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="region">Region</Label>
                        <Input id="region" required value={form.region}
                          onChange={(e) => setForm({ ...form, region: e.target.value })} />
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
                          <div className="w-10 h-6 bg-gray-200 rounded"></div>
                          <div className="w-10 h-6 bg-gray-200 rounded"></div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 border rounded-md p-4">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex-1 cursor-pointer">
                          Credit/Debit Card
                          <p className="text-sm text-muted-foreground">Visa, MasterCard</p>
                        </Label>
                        <div className="flex gap-2">
                          <div className="w-10 h-6 bg-gray-200 rounded"></div>
                          <div className="w-10 h-6 bg-gray-200 rounded"></div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 border rounded-md p-4">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className="flex-1 cursor-pointer">
                          Cash on Delivery
                          <p className="text-sm text-muted-foreground">Pay when you receive the products</p>
                        </Label>
                      </div>
                    </RadioGroup>

                    {paymentMethod === "card" && (
                      <div className="mt-4 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input id="expiry" placeholder="MM/YY" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvv">CVV</Label>
                            <Input id="cvv" placeholder="123" />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "mobileMoney" && (
                      <div className="mt-4">
                        <Tabs defaultValue="mtn">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="mtn">MTN Mobile Money</TabsTrigger>
                            <TabsTrigger value="orange">Orange Money</TabsTrigger>
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
