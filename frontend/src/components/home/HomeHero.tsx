import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const HomeHero = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showCreateStoreModal, setShowCreateStoreModal] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const checkUserStore = () => {
    // Check if user already has a store in localStorage
    const existingStore = localStorage.getItem('userStore');
    if (existingStore) {
      // User has a store, navigate directly to upload page
      navigate('/sell/upload');
    } else {
      // User doesn't have a store, show create store modal
      setShowCreateStoreModal(true);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeName.trim() || !phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Basic E.164 phone number validation
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number in E.164 format (e.g., +237123456789).",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // For now, we'll store in localStorage as mentioned in requirements
      // In a real app, this would be a POST to /api/stores
      const storeData = {
        id: Date.now().toString(),
        storeName: storeName.trim(),
        phoneNumber: phoneNumber.trim(),
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('userStore', JSON.stringify(storeData));

      toast({
        title: "Success",
        description: "Store created successfully!",
      });

      setShowCreateStoreModal(false);
      navigate('/sell/upload');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create store. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="relative bg-cm-green text-white">
        <div className="absolute inset-0 bg-black/25" />
        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 relative z-10 flex flex-col items-center justify-center">
          <div className="max-w-3xl text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 tracking-tight">
              Empower Local, Shop Global
            </h1>
            <p className="text-base sm:text-lg md:text-xl font-semibold mb-6 sm:mb-8 text-white/95 leading-relaxed max-w-2xl mx-auto">
              Launch your Cameroonian business nationwide with your own store. Shop unique local crafts and affordable global goods, delivered with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-white text-cm-green hover:bg-cm-sand px-6 sm:px-8 py-5 sm:py-6 h-auto text-base font-bold sm:text-lg w-full sm:w-auto"
              >
                <Link to="/products">Buy</Link>
              </Button>
              <Button 
                onClick={checkUserStore}
                size="lg" 
                className="bg-cm-yellow text-black font-extrabold hover:bg-yellow-400 px-6 sm:px-8 py-5 sm:py-6 h-auto text-base sm:text-lg w-full sm:w-auto"
              >
                Sell
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Store Modal */}
      <Dialog open={showCreateStoreModal} onOpenChange={setShowCreateStoreModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Store</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateStore} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name *</Label>
              <Input
                id="storeName"
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Enter your store name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+237123456789"
                required
              />
              <p className="text-sm text-gray-500">
                Please enter in E.164 format (e.g., +237123456789)
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateStoreModal(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Store"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HomeHero;
