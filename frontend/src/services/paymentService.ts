import axios from 'axios';

const API_BASE_URL = '/api';

export interface PaymentRequest {
  order_id: string;
  name: string;
  phone: string;
  redirect_url?: string;
}

export interface PaymentResponse {
  id: string;
  user_id: string;
  order_id: string;
  amount: number;
  status: string;
  transaction_id: string;
  created_at: string;
  payment_link?: string;
}

export const paymentService = {
  async createDirectPayment(data: PaymentRequest): Promise<PaymentResponse> {
    const response = await axios.post(`${API_BASE_URL}/payments`, data);
    return response.data.data;
  },

  async createIndirectPayment(data: PaymentRequest): Promise<PaymentResponse> {
    const response = await axios.post(`${API_BASE_URL}/indirect_payment`, data);
    return response.data.data;
  },

  async getPaymentStatus(transactionId: string): Promise<PaymentResponse> {
    const response = await axios.get(`${API_BASE_URL}/payments/${transactionId}`);
    return response.data.data;
  },

  async listPayments(): Promise<PaymentResponse[]> {
    const response = await axios.get(`${API_BASE_URL}/payments`);
    return response.data.data;
  }
}; 