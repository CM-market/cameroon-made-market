import React, { useState, useEffect } from 'react';
import VendorNavbar from '@/components/VendorNavbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from '@/hooks/use-toast';
import { Order, productApi, orderApi } from '@/lib/api'; 
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from 'lucide-react';

const VendorOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVendorOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const vendorId = localStorage.getItem('userId');
        if (!vendorId) {
          setError("Vendor ID not found. Please log in.");
          setLoading(false);
          return;
        }
        
        const response = await orderApi.list(vendorId);
        // Assuming response.data contains the list of orders
        setOrders(response.data);

      } catch (err) {
        console.error('Error fetching vendor orders:', err);
        setError("Failed to fetch orders. Please try again.");
        toast({
          title: "Error",
          description: "Failed to fetch vendor orders.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVendorOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <VendorNavbar />
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cm-green mx-auto"></div>
            <p className="mt-4 text-lg">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <VendorNavbar />
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <VendorNavbar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-6">Your Orders</h1>
        
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">No orders found for your products.</p>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Order List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>{order.total.toLocaleString()} FCFA</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="icon" onClick={() => navigate(`/vendor/orders/${order.id}`)}>
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VendorOrders;
