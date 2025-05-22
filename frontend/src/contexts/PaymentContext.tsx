import React, { createContext, useContext, useState, useCallback } from 'react';
import { paymentService, PaymentRequest, PaymentResponse } from '@/services/paymentService';
import { useToast } from '@/components/ui/use-toast';

interface PaymentContextType {
  currentPayment: PaymentResponse | null;
  isLoading: boolean;
  error: string | null;
  initiatePayment: (data: PaymentRequest, isDirect: boolean) => Promise<void>;
  checkPaymentStatus: (transactionId: string) => Promise<void>;
  clearPayment: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPayment, setCurrentPayment] = useState<PaymentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const initiatePayment = useCallback(async (data: PaymentRequest, isDirect: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = isDirect
        ? await paymentService.createDirectPayment(data)
        : await paymentService.createIndirectPayment(data);
      
      setCurrentPayment(response);
      
      if (!isDirect && response.payment_link) {
        window.location.href = response.payment_link;
      }
      
      toast({
        title: "Payment initiated",
        description: "Your payment has been initiated successfully.",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate payment');
      toast({
        title: "Payment failed",
        description: "There was an error initiating your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const checkPaymentStatus = useCallback(async (transactionId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const status = await paymentService.getPaymentStatus(transactionId);
      setCurrentPayment(status);
      
      if (status.status === 'completed') {
        toast({
          title: "Payment successful",
          description: "Your payment has been processed successfully.",
        });
      } else if (status.status === 'failed') {
        toast({
          title: "Payment failed",
          description: "Your payment could not be processed.",
          variant: "destructive",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check payment status');
      toast({
        title: "Error",
        description: "Failed to check payment status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const clearPayment = useCallback(() => {
    setCurrentPayment(null);
    setError(null);
  }, []);

  return (
    <PaymentContext.Provider
      value={{
        currentPayment,
        isLoading,
        error,
        initiatePayment,
        checkPaymentStatus,
        clearPayment,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}; 