import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VendorNavbar from '@/components/VendorNavbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from '@/hooks/use-toast';
import { Order, productApi, orderApi, OrderItem } from '@/lib/api'; // Assuming orderApi will be enhanced
import { ArrowLeft } from 'lucide-react';
import { getImageUrl } from '@/services/minioService';

// Define OrderItemWithProduct interface inheriting from OrderItem
interface OrderItemWithProduct extends OrderItem {
  product: {
    id: string;
    title: string;
    image_urls: string[];
  };
}

// Assuming the backend get order endpoint will return city and region
// and that the Order interface in api.ts is updated to include them.
interface OrderDetails extends Order {
  city: string;
  region: string;
  items: OrderItemWithProduct[]; // Add items to OrderDetails for placeholder
}

const VendorOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // TODO: Replace with actual API calls once backend is updated
        // Fetch order details (assuming city and region are included)
        // const orderResponse = await orderApi.get(id);
        // setOrder(orderResponse.data);

        // Placeholder data for now, matching the desired structure:
        setOrder({
          id: id,
          total: 15000,
          status: "Processing",
          created_at: "2023-10-27T10:00:00Z",
          customer_name: "John Doe",
          city: "Yaounde",
          region: "Centre",
          items: [
            {
              product_id: "prod1",
              quantity: 2,
              price: 5000,
              product: {
                id: "prod1",
                title: "Sample Product 1",
                image_urls: ['placeholder.svg'], // Use placeholder.svg directly
              },
            },
            {
              product_id: "prod2",
              quantity: 1,
              price: 5000,
              product: {
                id: "prod2",
                title: "Sample Product 2",
                image_urls: ['placeholder.svg'], // Use placeholder.svg directly
              },
            },
          ], // Include items in the order object
        });

        // No need to set orderItems separately if included in order
        // setOrderItems([]);

      } catch (err) {
        console.error('Error fetching order details:', err);
        setError("Failed to fetch order details. Please try again.");
        toast({
          title: "Error",
          description: "Failed to fetch order details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <VendorNavbar />
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cm-green mx-auto"></div>
            <p className="mt-4 text-lg">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <VendorNavbar />
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 text-lg">{error || 'Order not found'}</p>
            <Button
              className="mt-4 bg-cm-green hover:bg-cm-forest"
              onClick={() => navigate('/vendor/orders')}
            >
              Back to Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <VendorNavbar />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} className="mr-2" /> Back to Orders
        </Button>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>Information about order #{order.id}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p><span className="font-medium">Buyer Name:</span> {order.customer_name}</p>
              <p><span className="font-medium">City:</span> {order.city}</p>
              <p><span className="font-medium">Region:</span> {order.region}</p>
              <p><span className="font-medium">Order Date:</span> {new Date(order.created_at).toLocaleDateString()}</p>
              <p><span className="font-medium">Status:</span> {order.status}</p>
              <p><span className="font-medium">Total Amount:</span> {order.total.toLocaleString()} FCFA</p>
            </div>
            {/* Add more order details here if needed */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ordered Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.length === 0 ? (
                <p className="text-gray-500">No products in this order.</p>
              ) : (
                order.items.map(item => (
                  <div key={item.product.id} className="flex items-center space-x-4 border-b pb-4 last:pb-0 last:border-b-0">
                    <img 
                      src={getImageUrl(item.product.image_urls[0]) || '/placeholder.svg'}
                      alt={item.product.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.title}</h3>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      <p className="text-sm font-medium">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorOrderDetails; 