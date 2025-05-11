import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface Product {
  id: string;
  seller_id: string;
  title: string;
  description?: string;
  price: number;
  category?: string;
  image_urls: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateProductData {
  title: string;
  description?: string;
  price: number;
  category?: string;
  image_urls: string[];
}

export interface UpdateProductData {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  image_urls?: string[];
}

export const productApi = {
  list: async (category?: string, seller_id?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (seller_id) params.append('seller_id', seller_id);
    
    const response = await axios.get<Product[]>(`${API_URL}/products?${params.toString()}`);
    return response.data;
  },

  get: async (id: string) => {
    const response = await axios.get<Product>(`${API_URL}/products/${id}`);
    return response.data;
  },

  create: async (data: CreateProductData) => {
    const response = await axios.post<Product>(`${API_URL}/products`, data);
    return response.data;
  },

  update: async (id: string, data: UpdateProductData) => {
    const response = await axios.put<Product>(`${API_URL}/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await axios.delete(`${API_URL}/products/${id}`);
  },
}; 