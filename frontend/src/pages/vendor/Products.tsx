import React, { useState, useEffect } from 'react';
import VendorNavbar from '@/components/VendorNavbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { productApi, Product, CreateProductData, UpdateProductData } from '@/lib/api';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import ProductForm from '@/components/ProductForm';
import { getImageUrl } from '@/services/minioService';
import { useNavigate } from 'react-router-dom';

const VendorProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<CreateProductData>({
    title: '',
    description: '',
    price: 0,
    category: '',
    image_urls: [],
    quantity: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productApi.list(undefined, localStorage.getItem('userId') || undefined);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await productApi.create(formData);
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      setIsCreateDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        price: 0,
        category: '',
        image_urls: [],
        quantity: 0,
      });
      fetchProducts();
      navigate('/vendor/dashboard');
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const updateData: UpdateProductData = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        image_urls: formData.image_urls,
        quantity: formData.quantity,
      };

      await productApi.update(selectedProduct.id, updateData);
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await productApi.delete(productId);
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      fetchProducts();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      title: product.title,
      description: product.description || '',
      price: Number(product.price),
      quantity: Number(product.quantity),
      category: product.category || '',
      image_urls: product.image_urls
    });
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <VendorNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cm-green mx-auto"></div>
            <p className="mt-4 text-lg">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <VendorNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-500 text-lg">{error}</p>
            <Button
              className="mt-4 bg-cm-green hover:bg-cm-forest"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <VendorNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Products</h1>
          <div className="flex space-x-2">
            <Button
              onClick={() => navigate('/vendor/dashboard')}
              variant="outline"
            >
              Back to Dashboard
            </Button>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-cm-green hover:bg-cm-forest"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">You haven't added any products yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="relative aspect-square w-full bg-gray-100">
                  <img
                    src={getImageUrl(product.image_urls[0])}
                    alt={product.title}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      console.log('Image load failed:', product.image_urls[0]);
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg line-clamp-2 mb-2">{product.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{product.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-lg">FCFA {Number(product.price).toLocaleString()}</span>
                    <span className="text-sm text-gray-500">{product.category}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      className="w-full bg-cm-green hover:bg-cm-forest"
                      onClick={() => navigate(`/vendor/products/${product.id}`)}
                    >
                      View Details
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleEditClick(product)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-price">Price</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-cm-green hover:bg-cm-forest">Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <ProductForm onProductCreated={() => { setIsCreateDialogOpen(false); fetchProducts(); }} />
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default VendorProducts;
