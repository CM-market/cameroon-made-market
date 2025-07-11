import React, { useState, useEffect } from 'react';
import VendorNavbar from '@/components/VendorNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { orderApi, Order, ApiResponse } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const VendorOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVendorOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        const vendorId = localStorage.getItem('userId');

        if (!token || !vendorId) {
          toast({
            title: "Are you logged in?",
            description: "Vendor not logged in. Please log in to view orders.",
            variant: "destructive",
          });
          setError("Authentication required.");
          setLoading(false);
          return;
        }
        
        const response: ApiResponse<Order[]> = await orderApi.listVendorOrders(vendorId, token);
        console.log("API Response data (before setOrders):", response.data);
        setOrders(response.data);
        console.log("Orders state immediately after set (should be array):", orders);

      } catch (err) {
        console.error('Failed to fetch vendor orders:', err);
        toast({
          title: "Error",
          description: "Failed to fetch orders. Please try again.",
          variant: "destructive",
        });
        setError("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchVendorOrders();
  }, []);

  return (
    <div>
      <VendorNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Your Orders</h1>
          <Button 
            variant="outline"
            onClick={() => navigate('/vendor/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-cm-green" />
            <p className="ml-2 text-lg text-gray-600">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 text-lg py-12">
            <p>{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">No orders found for your account.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Order #{order.id.substring(0, 8)}</span>
                    <span className={`text-sm font-normal ${order.status === 'Pending' ? 'text-yellow-600' : order.status === 'Completed' ? 'text-green-600' : 'text-blue-600'}`}>
                      Status: {order.status}
                    </span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Order Date: {new Date(order.orderDate).toLocaleDateString()}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between text-sm">
                        <span>{item.quantity} x {item.productName}</span>
                        <span>{item.price.toLocaleString()} FCFA</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4 mt-4 flex justify-between items-center font-semibold">
                    <span>Total:</span>
                    <span>{order.totalAmount.toLocaleString()} FCFA</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorOrders;
