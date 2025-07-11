import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Camera, X, Plus, Eye } from "lucide-react";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";

interface Product {
  id: string;
  image: string;
  description: string;
  price: number;
  createdAt: string;
  storeId?: string;
}

interface Store {
  id: string;
  storeName: string;
  phoneNumber: string;
  createdAt: string;
}

const SellUpload = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [showCreateStoreModal, setShowCreateStoreModal] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [newStorePhone, setNewStorePhone] = useState("");

  // Load stores on component mount
  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = () => {
    // Load from new multiple stores format
    const userStores = JSON.parse(localStorage.getItem('userStores') || '[]');

    // If no stores in new format, check for old single store format and migrate
    if (userStores.length === 0) {
      const oldStore = localStorage.getItem('userStore');
      if (oldStore) {
        const store = JSON.parse(oldStore);
        const migratedStore: Store = {
          id: store.id || Date.now().toString(),
          storeName: store.storeName,
          phoneNumber: store.phoneNumber,
          createdAt: store.createdAt || new Date().toISOString(),
        };
        const newStores = [migratedStore];
        localStorage.setItem('userStores', JSON.stringify(newStores));
        setStores(newStores);
        setSelectedStoreId(migratedStore.id);
      }
    } else {
      setStores(userStores);
      if (userStores.length > 0 && !selectedStoreId) {
        setSelectedStoreId(userStores[0].id);
      }
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newStoreName.trim() || !newStorePhone.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Basic E.164 phone number validation
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(newStorePhone)) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number in E.164 format (e.g., +237123456789).",
        variant: "destructive",
      });
      return;
    }

    const newStore: Store = {
      id: Date.now().toString(),
      storeName: newStoreName.trim(),
      phoneNumber: newStorePhone.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedStores = [...stores, newStore];
    setStores(updatedStores);
    localStorage.setItem('userStores', JSON.stringify(updatedStores));

    // Select the new store
    setSelectedStoreId(newStore.id);

    toast({
      title: "Success",
      description: "Store created successfully!",
    });

    // Reset form
    setShowCreateStoreModal(false);
    setNewStoreName("");
    setNewStorePhone("");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          setSelectedImage(imageUrl);
          setShowDescriptionModal(true);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "Error",
          description: "Please select a valid image file.",
          variant: "destructive",
        });
      }
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera if available
      });
      setStream(mediaStream);
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageUrl = canvas.toDataURL('image/jpeg');
        setSelectedImage(imageUrl);
        setShowDescriptionModal(true);
        stopCamera();
      }
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim() || !price.trim() || !selectedStoreId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select a store.",
        variant: "destructive",
      });
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0.01) {
      toast({
        title: "Error",
        description: "Please enter a valid price (minimum 0.01).",
        variant: "destructive",
      });
      return;
    }

    if (description.length > 280) {
      toast({
        title: "Error",
        description: "Description must be 280 characters or less.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create new product
      const newProduct: Product = {
        id: Date.now().toString(),
        image: selectedImage!,
        description: description.trim(),
        price: priceNum,
        createdAt: new Date().toISOString(),
        storeId: selectedStoreId,
      };

      // Add to local products list
      setProducts(prev => [newProduct, ...prev]);

      // Add to global products list in localStorage
      const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
      const updatedProducts = [newProduct, ...existingProducts];
      localStorage.setItem('products', JSON.stringify(updatedProducts));

      // In a real app, this would be a POST to /api/products
      // await fetch('/api/products', { method: 'POST', body: JSON.stringify(newProduct) });

      toast({
        title: "Success",
        description: "Product added successfully!",
      });

      // Reset form
      setShowDescriptionModal(false);
      setSelectedImage(null);
      setDescription("");
      setPrice("");
      // Don't reset selectedStoreId to keep the user's selection

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <MainNavbar />

      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Upload Product</h1>

          {/* Upload Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add Product Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Upload className="w-4 h-4" />
                  Upload Image
                </Button>

                <Button
                  onClick={isCameraActive ? stopCamera : startCamera}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Camera className="w-4 h-4" />
                  {isCameraActive ? "Stop Camera" : "Snap Photo"}
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Camera View */}
              {isCameraActive && (
                <div className="mt-4">
                  <div className="relative inline-block">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="max-w-full h-auto rounded-lg"
                    />
                    <Button
                      onClick={capturePhoto}
                      className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                    >
                      Capture
                    </Button>
                    <Button
                      onClick={stopCamera}
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />

              {/* Image Preview */}
              {selectedImage && !showDescriptionModal && (
                <div className="mt-4">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="max-w-xs h-auto rounded-lg"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Products List */}
          {products.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4">
                      <img
                        src={product.image}
                        alt={product.description}
                        className="w-full h-48 object-cover rounded-lg mb-2"
                      />
                      <p className="text-sm text-gray-600 mb-1">{product.description}</p>
                      <p className="font-bold text-lg mb-3">${product.price.toFixed(2)}</p>
                      <Button
                        onClick={() => navigate(`/products/${product.id}`)}
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Product Description Modal */}
      <Dialog open={showDescriptionModal} onOpenChange={setShowDescriptionModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Product Details</DialogTitle>
          </DialogHeader>

          {selectedImage && (
            <div className="mb-4">
              <img
                src={selectedImage}
                alt="Product preview"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          <form onSubmit={handleSubmitProduct} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product..."
                maxLength={280}
                required
                rows={3}
              />
              <p className="text-sm text-gray-500">
                {description.length}/280 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store">Select Store *</Label>
              <div className="flex gap-2">
                <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a store" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.storeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowCreateStoreModal(true)}
                  title="Create new store"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {stores.length === 0 && (
                <p className="text-sm text-gray-500">
                  No stores available. Create your first store to add products.
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDescriptionModal(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Store Modal */}
      <Dialog open={showCreateStoreModal} onOpenChange={setShowCreateStoreModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Store</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateStore} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newStoreName">Store Name *</Label>
              <Input
                id="newStoreName"
                type="text"
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                placeholder="Enter your store name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newStorePhone">Phone Number *</Label>
              <Input
                id="newStorePhone"
                type="tel"
                value={newStorePhone}
                onChange={(e) => setNewStorePhone(e.target.value)}
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
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Store
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default SellUpload;
