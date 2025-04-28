
import React, { useState } from "react";
import MainNavbar from "@/components/MainNavbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { toast } from "@/hooks/use-toast";

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("customer");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would authenticate the user
    // For demo purposes, just navigate based on selected role
    if (activeTab === "producer") {
      toast({
        title: "Producer login successful",
        description: "Redirecting to vendor registration"
      });
      navigate("/vendor/register");
    } else if (activeTab === "admin") {
      toast({
        title: "Admin login successful"
      });
      navigate("/admin/dashboard");
    } else {
      toast({
        title: "Customer login successful"
      });
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainNavbar />
      
      <div className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Login to Made in Cameroon</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="customer" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="producer">Producer</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
            
            <TabsContent value="customer">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col">
                  <Button type="submit" className="w-full bg-cm-green hover:bg-cm-forest">Login as Customer</Button>
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    Don't have an account? <a href="#" className="text-primary underline">Register</a>
                  </div>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="producer">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="producer-email">Email</Label>
                    <Input id="producer-email" type="email" placeholder="your@business.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="producer-password">Password</Label>
                    <Input id="producer-password" type="password" required />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col">
                  <Button type="submit" className="w-full bg-cm-green hover:bg-cm-forest">Login as Producer</Button>
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    Want to sell your products? <a href="/vendor/register" className="text-primary underline">Register as Producer</a>
                  </div>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="admin">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input id="admin-email" type="email" placeholder="admin@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input id="admin-password" type="password" required />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-cm-green hover:bg-cm-forest">Login as Admin</Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;
