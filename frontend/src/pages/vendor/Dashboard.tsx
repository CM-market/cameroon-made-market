import React, { useState, useEffect } from 'react';
import VendorNavbar from '@/components/VendorNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Package, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';

// Mock data - replace with actual API calls
const mockProducts = [
  {
    id: 1,
    name: "Handmade Soap",
    price: 2500,
    stock: 50,
    sales: 120,
    revenue: 300000
  },
  {
    id: 2,
    name: "Traditional Basket",
    price: 5000,
    stock: 30,
    sales: 45,
    revenue: 225000
  },
  // Add more mock products as needed
];

const VendorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    averageOrderValue: 0
  });

  useEffect(() => {
    // Calculate statistics from mock data
    const totalProducts = mockProducts.length;
    const totalSales = mockProducts.reduce((sum, product) => sum + product.sales, 0);
    const totalRevenue = mockProducts.reduce((sum, product) => sum + product.revenue, 0);
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    setStats({
      totalProducts,
      totalSales,
      totalRevenue,
      averageOrderValue
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <VendorNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
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
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium">Product</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Price</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Stock</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Sales</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Revenue</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockProducts.map((product) => (
                    <tr key={product.id} className="border-b">
                      <td className="p-4 align-middle">{product.name}</td>
                      <td className="p-4 align-middle">FCFA {product.price.toLocaleString()}</td>
                      <td className="p-4 align-middle">{product.stock}</td>
                      <td className="p-4 align-middle">{product.sales}</td>
                      <td className="p-4 align-middle">FCFA {product.revenue.toLocaleString()}</td>
                      <td className="p-4 align-middle">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/vendor/products/${product.id}`)}
                        >
                          <ArrowUpRight className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorDashboard;
