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
  returnPolicy?: string;
}

export interface CreateProductData {
  title: string;
  description?: string;
  price: number;
  category?: string;
  image_urls: string[];
  quantity?: number;
  returnPolicy?: string;
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

    const token = localStorage.getItem('token');

    const response = await axios.get<{ success: boolean; message: string; data: Product[] }>(
      `${API_URL}/products`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );


    return response.data;
  },

  get: async (id: string) => {
    const response = await axios.get<Product>(`${API_URL}/products/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    // If data is FormData, send as multipart/form-data
    if (data instanceof FormData) {
      const response = await axios.post(`${API_URL}/products`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } else {
      // Otherwise, send as JSON
      const response = await axios.post<Product>(`${API_URL}/products`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    }
  },

  update: async (id: string, data: UpdateProductData) => {
    const response = await axios.put<Product>(`${API_URL}/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await axios.delete(`${API_URL}/products/${id}`);
  },
};

export const userApi = {
  register: async (data: {
    full_name: string;
    email?: string;
    phone: number;
    password: string;
    role?: string;
  }) => {
    const response = await axios.post(`${API_URL}/api/users`, data);
    return response.data;
  },

  login: async (data: {
    phone: number;
    password: string;
    role?: "Vendor" | "Buyer";
  }) => {
    const response = await axios.post(`${API_URL}/api/users/login`, data);
    return response.data;
  },
  // ...other user API methods
}; 