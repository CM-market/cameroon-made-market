import React, { useState } from "react";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const AccountInfo: React.FC = () => {
  // In a real app, fetch these from the backend
  const [formData, setFormData] = useState({
    fullName: localStorage.getItem('userName') || '',
    phone: '',
    email: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send update to backend
    toast({
      title: "Profile updated!",
      description: "Your account info has been updated.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MainNavbar />
      <div className="flex-1 container mx-auto px-4 py-12">
        <Card className="w-full max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Account Info</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              {/* Add more fields as needed */}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-cm-green hover:bg-cm-forest">
                Update Info
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default AccountInfo; 