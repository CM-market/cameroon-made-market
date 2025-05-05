
import React from "react";
import MainNavbar from "@/components/MainNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const Orders: React.FC = () => {
  const navigate = useNavigate();
  
  // Sample orders data - in a real app this would come from an API
  const sampleOrders = [
    {
      id: "CM2304092",
      date: "April 28, 2025",
      total: 65000,
      status: "processing",
      items: [
        { name: "Hand-woven Bamboo Basket", quantity: 2 },
        { name: "Cameroonian Coffee Beans - 500g", quantity: 1 },
        { name: "Traditional Handmade Jewelry", quantity: 1 }
      ]
    },
    {
      id: "CM2303087",
      date: "April 21, 2025",
      total: 42500,
      status: "delivered",
      items: [
        { name: "Traditional Fabric (3 meters)", quantity: 1 },
        { name: "Carved Wooden Statue", quantity: 1 }
      ]
    },
    {
      id: "CM2302045",
      date: "March 15, 2025",
      total: 37000,
      status: "delivered",
      items: [
        { name: "Spice Mix Collection", quantity: 2 },
        { name: "Handcrafted Leather Wallet", quantity: 1 }
      ]
    }
  ];
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>;
      case "shipped":
        return <Badge className="bg-orange-500">Shipped</Badge>;
      case "delivered":
        return <Badge className="bg-green-500">Delivered</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-4 max-w-md">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="space-y-4">
              {sampleOrders.length > 0 ? (
                sampleOrders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="bg-muted p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                          <p className="text-sm text-muted-foreground">Placed on {order.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(order.status)}
                          <span className="font-semibold">{order.total.toLocaleString()} FCFA</span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{item.name}</span>
                            <span className="text-muted-foreground">Qty: {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          View Details
                        </Button>
                        {order.status === "delivered" && (
                          <Button size="sm" className="bg-cm-green hover:bg-cm-forest">
                            Buy Again
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">You don't have any orders yet</p>
                    <Button onClick={() => navigate("/products")}>Start Shopping</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="processing">
            <div className="space-y-4">
              {sampleOrders.filter(order => order.status === "processing").length > 0 ? (
                sampleOrders
                  .filter(order => order.status === "processing")
                  .map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                      {/* Similar order card structure as above */}
                      <CardHeader className="bg-muted p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                            <p className="text-sm text-muted-foreground">Placed on {order.date}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(order.status)}
                            <span className="font-semibold">{order.total.toLocaleString()} FCFA</span>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>{item.name}</span>
                              <span className="text-muted-foreground">Qty: {item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/orders/${order.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No processing orders</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="shipped">
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No shipped orders</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="delivered">
            <div className="space-y-4">
              {sampleOrders.filter(order => order.status === "delivered").length > 0 ? (
                sampleOrders
                  .filter(order => order.status === "delivered")
                  .map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                      {/* Similar order card structure as above */}
                      <CardHeader className="bg-muted p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                            <p className="text-sm text-muted-foreground">Placed on {order.date}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(order.status)}
                            <span className="font-semibold">{order.total.toLocaleString()} FCFA</span>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>{item.name}</span>
                              <span className="text-muted-foreground">Qty: {item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/orders/${order.id}`)}
                          >
                            View Details
                          </Button>
                          <Button size="sm" className="bg-cm-green hover:bg-cm-forest">
                            Buy Again
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No delivered orders</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Orders;
