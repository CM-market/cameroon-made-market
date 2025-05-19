import axios from 'axios';
import { CartItem } from '@/contexts/CartContext';

const API_BASE_URL = '/api';

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  region: string;
}

export interface CreateOrderRequest {
  items: CartItem[];
  total: number;
  shippingAddress: ShippingAddress;
}

export interface OrderResponse {
  id: string;
  user_id: string;
  items: CartItem[];
  total: number;
  status: string;
  shipping_address: ShippingAddress;
  created_at: string;
}

export const orderService = {
  async createOrder(data: CreateOrderRequest): Promise<OrderResponse> {
    const response = await axios.post(`${API_BASE_URL}/orders`, data);
    return response.data.data;
  },

  async getOrder(orderId: string): Promise<OrderResponse> {
    const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`);
    return response.data.data;
  },

  async listOrders(): Promise<OrderResponse[]> {
    const response = await axios.get(`${API_BASE_URL}/orders`);
    return response.data.data;
  }
}; 