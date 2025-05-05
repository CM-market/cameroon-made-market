
import React from "react";
import AdminNavbar from "@/components/AdminNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard: React.FC = () => {
  // Sample chart data
  const salesData = [
    { month: 'Jan', sales: 12500 },
    { month: 'Feb', sales: 18000 },
    { month: 'Mar', sales: 15800 },
    { month: 'Apr', sales: 27500 },
    { month: 'May', sales: 21400 },
    { month: 'Jun', sales: 32000 },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-6">Overview of marketplace activities and metrics</p>
        
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,457,900 FCFA</div>
              <p className="text-xs text-green-500 flex items-center mt-1">
                +12.5% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Producers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87</div>
              <p className="text-xs text-green-500 flex items-center mt-1">
                +8 new this month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Products Listed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs text-green-500 flex items-center mt-1">
                +24 new this month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                12 products, 6 producers
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sales Overview</CardTitle>
                  <CardDescription>Monthly sales performance</CardDescription>
                </div>
                <Tabs defaultValue="area">
                  <TabsList className="grid grid-cols-2 h-8">
                    <TabsTrigger value="area" className="h-8 px-2">
                      <LineChart className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="bar" className="h-8 px-2">
                      <BarChart className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={salesData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#8884d8" 
                      fillOpacity={1} 
                      fill="url(#colorSales)" 
                    />
                  </AreaChart>
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
                {[
                  { name: "Crafts", value: 32, percentage: 32 },
                  { name: "Food & Beverages", value: 28, percentage: 28 },
                  { name: "Textiles", value: 18, percentage: 18 },
                  { name: "Jewelry", value: 12, percentage: 12 },
                  { name: "Art", value: 10, percentage: 10 },
                ].map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.value}%</p>
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
        
        {/* Recent activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest actions on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { type: "New Producer", name: "Bafut Weavers Cooperative", time: "2 hours ago", action: "Registration submitted" },
                { type: "Product Approval", name: "Traditional Ceremonial Mask", time: "5 hours ago", action: "Approved by admin" },
                { type: "New Order", name: "Order #CM2304092", time: "Yesterday", action: "Placed for 65,000 FCFA" },
                { type: "Producer Approval", name: "Kribi Seafood Products", time: "Yesterday", action: "Approved by admin" },
                { type: "Product Update", name: "Hand-carved Wooden Bowl", time: "2 days ago", action: "Price updated" },
              ].map((activity, idx) => (
                <div key={idx} className="flex">
                  <div className="mr-4 relative">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    {idx < 4 && <div className="absolute top-3 bottom-0 left-[3px] w-[2px] bg-muted"></div>}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.type}</p>
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
