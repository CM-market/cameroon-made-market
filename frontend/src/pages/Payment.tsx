import React, { useEffect, useState } from "react";
import MainNavbar from "@/components/MainNavbar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, ArrowRight, XCircle } from "lucide-react";
import axios from "axios";

const Payment: React.FC = () => {
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Assume the orderId is passed in location state from previous step
  useEffect(() => {
    const state = location.state as { orderId?: string };
    if (!state?.orderId) {
      console.error("Missing orderId");
      navigate("/products"); // redirect to home if no orderId
      return;
    }

    setOrderId(state.orderId);

    // Call your backend payment endpoint
    const processPayment = async () => {
      try {
        const response = await axios.post("/api/payments", { orderId: state.orderId });

        if (response.status === 200 && response.data.status === "success") {
          setSuccess(true);
        } else {
          setSuccess(false);
        }
      } catch (error) {
        console.error("Payment error:", error);
        setSuccess(false);
      } finally {
        setProcessing(false);
      }
    };

    processPayment();
  }, [location.state, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainNavbar />

      <div className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              {processing
                ? "Processing Payment..."
                : success
                ? "Payment Successful!"
                : "Payment Failed"}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col items-center py-8">
            {processing ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-cm-green border-t-transparent mb-4"></div>
                <p className="text-muted-foreground text-center">
                  Please wait while we process your payment...
                </p>
              </div>
            ) : success ? (
              <div className="flex flex-col items-center">
                <CheckCircle2 className="h-20 w-20 text-cm-green mb-6" />
                <div className="text-center space-y-2 mb-6">
                  <p className="text-lg font-medium">Thank you for your order!</p>
                  <p className="text-muted-foreground">
                    Your order has been received and payment is confirmed.
                  </p>
                  <p className="font-semibold">Order #{orderId}</p>
                </div>

                <div className="bg-muted w-full rounded-md p-4 text-sm">
                  <div className="flex justify-between mb-2">
                    <span>Order Total:</span>
                    <span className="font-bold">65,000 FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Delivery:</span>
                    <span>May 3 - May 7, 2025</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <XCircle className="h-20 w-20 text-red-500 mb-6" />
                <p className="text-center text-muted-foreground mb-6">
                  Payment failed. Please try again or contact support.
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex-col space-y-2">
            {!processing && success && (
              <>
                <Button
                  className="w-full bg-cm-green hover:bg-cm-forest"
                  onClick={() => navigate("/orders")}
                >
                  View Order
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
                  Continue Shopping
                </Button>
              </>
            )}

            {!processing && !success && (
              <>
                <Button className="w-full" onClick={() => window.location.reload()}>
                  Retry Payment
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
                  Cancel
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Payment;
