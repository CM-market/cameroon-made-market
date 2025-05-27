import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { getImageUrl } from "@/services/minioService";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  vendor_id: string;
  vendor_name: string;
  is_approved: boolean;
  created_at: string;
  image_urls: string[];
  quantity: number;
  return_policy: string;
}

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/products/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data.data) {
          setProducts(data.data);
        } else {
          console.error('Error in response format:', data);
        }
      } catch (jsonError) {
        console.error('Non-JSON response:', text);
      }
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (productId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/products/${productId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        setProducts(products.filter(product => product.id !== productId));
      }
    } catch (error) {
      console.error('Error approving product:', error);
    }
  };

  const handleReject = async (productId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/products/${productId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        setProducts(products.filter(product => product.id !== productId));
      }
    } catch (error) {
      console.error('Error rejecting product:', error);
    }
  };

  const handleView = (product: Product) => {
    setViewProduct(product);
    setSelectedImageIdx(0);
  };

  const closeModal = () => setViewProduct(null);

  const filteredProducts = products.filter(product =>
    (product.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.vendor_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <div className="w-72">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.title}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.vendor_name}</TableCell>
                <TableCell>
                  <Badge variant={product.is_approved ? "default" : "destructive"}>
                    {product.is_approved ? "Approved" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(product.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2" >
                    <Button
                      variant="green"
                      size="sm"
                      onClick={() => handleApproval(product.id)}
                      disabled={product.is_approved}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleReject(product.id)}
                      disabled={product.is_approved}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleView(product)}
                    >
                      View
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {viewProduct && (
        <Dialog open={!!viewProduct} onOpenChange={closeModal}>
          <div className="flex flex-col md:flex-row bg-white rounded shadow-lg max-w-3xl mx-auto p-6">
            {/* Left: Images */}
            <div className="flex flex-col items-center md:w-1/2">
              <img
                src={getImageUrl(viewProduct.image_urls[selectedImageIdx]) || "/placeholder.png"}
                onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                alt={viewProduct.title}
                className="w-64 h-64 object-contain rounded mb-4 border"
              />
              <div className="flex gap-2">
                {viewProduct.image_urls.map((url, idx) => (
                  <img
                    key={idx}
                    src={getImageUrl(url)}
                    onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                    alt={`thumb-${idx}`}
                    className={`w-16 h-16 object-cover rounded cursor-pointer border ${selectedImageIdx === idx ? "border-blue-500" : "border-gray-300"}`}
                    onClick={() => setSelectedImageIdx(idx)}
                  />
                ))}
              </div>
            </div>
            {/* Right: Details */}
            <div className="md:ml-8 mt-6 md:mt-0 md:w-1/2">
              <h2 className="text-2xl font-bold mb-2">{viewProduct.title}</h2>
              <div className="text-green-700 text-xl font-semibold mb-2">
                {viewProduct.price.toLocaleString()} FCFA
              </div>
              <div className="mb-2 text-gray-500">
                Stock quantity {viewProduct.quantity > 0 ? viewProduct.quantity : "not set"}
              </div>
              <div className="mb-2">
                <strong>Description</strong>
                <div>{viewProduct.description || "No description"}</div>
              </div>
              <div className="mb-2">
                <strong>Shipping Information</strong>
                <div>{viewProduct.vendor_name}</div>
              </div>
              <div className="mb-2">
                <strong>Return Policy</strong>
                <div>{viewProduct.return_policy || "No refund"}</div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={closeModal}>Close</Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
} 