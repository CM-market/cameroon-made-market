import React from "react";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Settings: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MainNavbar />
      <div className="flex-1 container mx-auto px-4 py-12">
        <Card className="w-full max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Settings page for buyer preferences and notifications. (Coming soon!)</p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Settings; 