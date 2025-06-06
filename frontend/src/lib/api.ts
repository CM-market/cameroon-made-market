import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL + '/api'; ;


export interface Product {
  id: string;
  seller_id: string;
  title: string;
  description?: string;
  quantity: number;
  price: number;
  category?: string;
  image_urls: string[];
  created_at: string;
  updated_at: string;
  returnPolicy?: string;
  sales?: number;
  revenue?: number;
}

export interface CreateProductData {
  title: string;
  description?: string;
  price: number;
  category?: string;
  image_urls: string[];
  quantity: number;
  returnPolicy?: string;
}

export interface UpdateProductData {
  title?: string;
  description?: string;
  price?: number;
  quantity: number;
  category?: string;
  image_urls?: string[];
}
export interface CreateOrderData {
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  city: string;
  region: string;
  paymentMethod: string;
  items: [{ product_id: string, quantity: number, price: number }];
  total: number;
}

export interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
}

export const orderApi = {
  create: async (data: CreateOrderData): Promise<Order> => {
    const token = localStorage.getItem('token');
    const res = await axios.post(`${API_URL}/orders`, data,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return res.data;
  }
};

export const ImageUploadApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API_URL}/products/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    });
    return res;
  }
}

export const paymentApi = {
  create: async (data: { order_id: string; name: string; redirect_url: string; phone: string }) => {
    const token = localStorage.getItem('token');
    const res = await axios.post(`${API_URL}/indirect_payment`, data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  },

  verify: async (transactionId: string) => {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_URL}/verify_payment/${transactionId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  }
};

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
    const token = localStorage.getItem('token');
    const response = await axios.get<{ success: boolean; message: string; data: Product }>(
      `${API_URL}/products/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data.data;
  },

  create: async (data: CreateProductData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post<Product>(`${API_URL}/products`, data,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  update: async (id: string, data: UpdateProductData) => {
    const token = localStorage.getItem('token');
    const response = await axios.put<Product>(`${API_URL}/products/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  delete: async (id: string) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/products/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
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
    const response = await axios.post(`${API_URL}/api/users/login`, data, {
    });
    return response.data;
  },
  // ...other user API methods
};

