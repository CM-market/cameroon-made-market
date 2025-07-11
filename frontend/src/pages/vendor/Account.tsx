import React from 'react';
import VendorNavbar from '@/components/VendorNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const VendorAccount: React.FC = () => {
  const navigate = useNavigate();

  const vendorName = localStorage.getItem('userName');
  const vendorId = localStorage.getItem('userId');
  const vendorRole = localStorage.getItem('userRole');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/login'); // Redirect to login page
    window.location.reload(); // Force a full page reload to clear all state
  };

  return (
    <div className="min-h-screen bg-background">
      <VendorNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Vendor Account</h1>
          <Button 
            variant="outline"
            onClick={() => navigate('/vendor/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Name:</h3>
              <p className="text-gray-700">{vendorName || 'N/A'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">User ID:</h3>
              <p className="text-gray-700 break-all">{vendorId || 'N/A'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Role:</h3>
              <p className="text-gray-700">{vendorRole || 'N/A'}</p>
            </div>
            <Button
              variant="destructive"
              className="w-full flex items-center gap-2 mt-6"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorAccount;
