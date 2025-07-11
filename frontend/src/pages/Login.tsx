import React, { useState } from "react";
import MainNavbar from "@/components/MainNavbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { toast } from "@/hooks/use-toast";
import { userApi } from "@/lib/api";
import { cn } from "@/lib/utils";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });
  const [role, setRole] = useState<"Vendor" | "Buyer">("Buyer"); // Default to Buyer as Customer

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (selectedRole: "Vendor" | "Buyer") => {
    setRole(selectedRole);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await userApi.login({
        phone: parseInt(formData.phone),
        password: formData.password,
        role: role
      });
      
      // Store the token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.user_id);
      localStorage.setItem('userRole', response.data.role);
      localStorage.setItem('userName', response.data.full_name || '');

      toast({
        title: "Login successful",
        description: "Welcome back to your dashboard"
      });
      
      // Redirect based on selected role
      if (role === "Vendor") {
        navigate("/vendor/dashboard");
      } else {
        navigate("/products"); // Or a buyer dashboard if you have one
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid phone number or password",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainNavbar />
      
      <div className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              Login to Transac
            </CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
            <div className="flex w-full bg-muted p-1 rounded-md mt-4">
              <Button
                variant="ghost"
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-sm",
                  role === "Buyer" && "bg-background shadow-sm"
                )}
                onClick={() => handleRoleChange("Buyer")}
              >
                Buyer
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-sm",
                  role === "Vendor" && "bg-background shadow-sm"
                )}
                onClick={() => handleRoleChange("Vendor")}
              >
                Vendor
              </Button>
            </div>
          </CardHeader>
          
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required 
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button 
                type="submit" 
                className="w-full bg-cm-green hover:bg-cm-forest"
              >
                Login as {role}
              </Button>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                {role === "Vendor" ? (
                  <>
                    Want to sell your products?{" "}
                    <a href="/vendor/register" className="text-primary underline">
                      Register as Producer
                    </a>
                  </>
                ) : (
                  <>
                    Don't have an account?{" "}
                    <a href="/buyer/register" className="text-primary underline">
                      Register
                    </a>
                  </>
                )}
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;
