import React, { useState, useEffect } from 'react';
import VendorNavbar from '@/components/VendorNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Package, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { productApi, Product } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { getImageUrl } from '@/services/minioService';
import { orderApi } from '@/lib/api';

interface VendorStats {
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
}

const VendorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [vendorName, setVendorName] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<VendorStats>({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    averageOrderValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    try {
      setLoading(true);
      
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError("Vendor ID not found. Please log in.");
        setLoading(false);
        return;
      }

      // Fetch vendor's products (still needed for the product list)
      const productsResponse = await productApi.list(undefined, userId);
      setProducts(productsResponse.data);
      
      // Fetch vendor's orders
      const ordersResponse = await orderApi.list(userId);
      const vendorOrders = ordersResponse.data; // Assuming response.data is the array of orders

      // Calculate statistics based on orders
      const totalOrders = vendorOrders.length; // Total Sales = Number of Orders

      let totalRevenueBeforeCut = 0;
      vendorOrders.forEach(order => {
        // Note: To accurately calculate revenue per vendor product within an order,
        // the order items need to include product details or at least seller_id.
        // Assuming for now that order.total reflects the sum of items for this vendor's products
        // or that order items will be enhanced in the backend to filter/aggregate per vendor.
        // For a more accurate calculation, we would need to iterate through order.items
        // and check if each item's product belongs to the current vendor.
        totalRevenueBeforeCut += order.total;
      });

      const platformCutRate = 0.10; // 10%
      const totalRevenueAfterCut = totalRevenueBeforeCut * (1 - platformCutRate);

      // Calculate Total Sales (number of orders), Total Revenue (after cut)
      setStats({
        totalProducts: productsResponse.data.length,
        totalSales: totalOrders, // Use total number of orders as Total Sales
        totalRevenue: totalRevenueAfterCut, // Use revenue after platform cut
        // Recalculate or remove averageOrderValue if not relevant anymore
        averageOrderValue: totalOrders > 0 ? totalRevenueAfterCut / totalOrders : 0
      });
      
      setVendorName(localStorage.getItem('userName') || ''); // Fetch vendor name

      setError(null);
    } catch (error) {
      console.error('Error fetching vendor data:', error);
      setError('Failed to load vendor data');
      toast({
        title: "Error",
        description: "Failed to load vendor dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <VendorNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cm-green mx-auto"></div>
            <p className="mt-4 text-lg">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <VendorNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {vendorName}</h1>
            <p className="text-muted-foreground mt-1">Here's an overview of your business</p>
          </div>
          <Button 
            onClick={() => navigate('/vendor/products/new')}
            className="bg-cm-green hover:bg-cm-forest"
          >
            Add New Product
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                Active products in your store
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSales}</div>
              <p className="text-xs text-muted-foreground">
                Total units sold
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">FCFA {stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">FCFA {Math.round(stats.averageOrderValue).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Per order
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Products</CardTitle>
            <CardDescription>
              A list of all your products and their performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-gray-500">You haven't added any products yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id}>
                    <CardContent className="p-6">
                      <div className="aspect-square mb-4">
                        <img
                          src={getImageUrl(product.image_urls[0])}
                          alt={product.title}
                          className="w-full h-full object-contain rounded bg-gray-50"
                        />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{product.title}</h3>
                      <p className="text-gray-500 mb-4 line-clamp-2">{product.description}</p>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold">{Number(product.price).toLocaleString()} FCFA</span>
                        <span className="text-sm text-gray-500">{product.category}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {product.is_approved ? 'Approved' : 'Pending Approval'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/vendor/products/${product.id}`)}
                        >
                          <ArrowUpRight className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorDashboard;
