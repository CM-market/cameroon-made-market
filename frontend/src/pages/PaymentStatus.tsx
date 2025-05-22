import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePayment } from '@/contexts/PaymentContext';
import MainNavbar from '@/components/MainNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const PaymentStatus: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentPayment, checkPaymentStatus, isLoading, error } = usePayment();
  const transactionId = searchParams.get('transaction_id');

  useEffect(() => {
    if (transactionId) {
      checkPaymentStatus(transactionId);
    }
  }, [transactionId, checkPaymentStatus]);

  const getStatusContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
          <p className="text-muted-foreground">Please wait while we verify your payment...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <XCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Payment Failed</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate('/checkout')}>Try Again</Button>
        </div>
      );
    }

    if (currentPayment?.status === 'completed') {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Payment Successful</h2>
          <p className="text-muted-foreground mb-4">
            Thank you for your purchase! Your order has been confirmed.
          </p>
          <div className="space-y-2 text-center mb-6">
            <p>Transaction ID: {currentPayment.transaction_id}</p>
            <p>Amount: {currentPayment.amount.toLocaleString()} FCFA</p>
          </div>
          <Button onClick={() => navigate('/orders')}>View Order</Button>
        </div>
      );
    }

    if (currentPayment?.status === 'pending') {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">Payment Pending</h2>
          <p className="text-muted-foreground mb-4">
            Your payment is being processed. Please wait...
          </p>
          <Button onClick={() => checkPaymentStatus(currentPayment.transaction_id)}>
            Check Status
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-8">
        <XCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Payment Status Unknown</h2>
        <p className="text-muted-foreground mb-4">
          We couldn't determine the status of your payment.
        </p>
        <Button onClick={() => navigate('/checkout')}>Return to Checkout</Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainNavbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            {getStatusContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentStatus; 