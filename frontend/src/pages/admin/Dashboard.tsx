import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DashboardMetrics {
  total_users: number;
  total_vendors: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  pending_approvals?: number;
}

interface SalesTrend {
  month: string;
  sales: number;
}

interface BuyerConversion {
  month: string;
  registered_buyers: number;
  buyers_with_orders: number;
  conversion_rate: number;
}

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<SalesTrend[]>([]);
  const [buyerConversion, setBuyerConversion] = useState<BuyerConversion[]>([]);
  const [topCategories, setTopCategories] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (data.data) {
          setMetrics(data.data);
        } else {
          console.error('Error in response format:', data);
        }
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  useEffect(() => {
    const fetchSalesTrends = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/sales-trends', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setSalesData(data);
      } catch (error) {
        console.error('Error fetching sales trends:', error);
      }
    };
    fetchSalesTrends();
  }, []);

  useEffect(() => {
    const fetchBuyerConversion = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/buyer-conversion', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setBuyerConversion(data);
      } catch (error) {
        console.error('Error fetching buyer conversion:', error);
      }
    };
    fetchBuyerConversion();
  }, []);

  useEffect(() => {
    const fetchTopCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/top-categories', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setTopCategories(data);
      } catch (error) {
        console.error('Error fetching top categories:', error);
      }
    };
    fetchTopCategories();
  }, []);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/recent-activities', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setRecentActivities(data);
      } catch (error) {
        console.error('Error fetching recent activities:', error);
      }
    };
    fetchRecentActivities();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_revenue?.toLocaleString()} FCFA</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Producers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_vendors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Products Listed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_products}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.pending_approvals ?? 0}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#8884d8" name="Sales" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>Sales by product category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCategories.map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{item.category}</p>
                    <p className="text-sm text-muted-foreground">{Math.round(item.percentage)}%</p>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Buyer Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={buyerConversion} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 1]} tickFormatter={v => typeof v === 'number' ? `${Math.round(v * 100)}%` : v} />
                  <Tooltip formatter={v => typeof v === 'number' ? `${Math.round(v * 100)}%` : v} />
                  <Legend />
                  <Line type="monotone" dataKey="conversion_rate" stroke="#82ca9d" name="Conversion Rate" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest actions on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentActivities.map((activity, idx) => (
                <div key={idx} className="flex">
                  <div className="mr-4 relative">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    {idx < recentActivities.length - 1 && (
                      <div className="absolute top-3 bottom-0 left-[3px] w-[2px] bg-muted"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.activity_type}</p>
                    <p className="text-sm text-muted-foreground">{activity.name}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                      <span className="text-xs font-medium">{activity.action}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
