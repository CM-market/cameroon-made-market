
import React, { useEffect, useState } from "react";
import MainNavbar from "@/components/MainNavbar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight, XCircle } from "lucide-react";
import { paymentApi } from "@/lib/api";

const Payment: React.FC = () => {
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentOrder = localStorage.getItem("currentOrder");
    const order = currentOrder ? JSON.parse(currentOrder) : {};
    if (!order.data?.id) {
      console.error("Missing orderId");
      navigate("/products");
      return;
    }

    setOrderId(order.data.id);

    const processPayment = async () => {
      try {
        const paymentMethod = order.data.paymentMethod;
        let response;

        // if (paymentMethod === "mobileMoney") {
        //   // Direct payment
        //   response = await paymentApi.createDirect({
        //     order_id: order.data.id,
        //     name: order.data.customer_name,
        //     phone: order.data.mobileMoney.phone,
        //     medium: order.data.mobileMoney.provider === "mtn" ? "mtn" : "orange",
        //     amount: order.data.total,
        //     email: "customer@example.com", // Replace with actual customer email if available
        //     user_id: order.data.user_id || "guest",
        //     external_id: order.data.id,
        //     message: `Payment for order ${order.data.id}`,
        //   });
        // } else {
        // Indirect payment
        response = await paymentApi.create({
          order_id: order.data.id,
          name: order.data.customer_name,
          redirect_url: `${window.location.origin}/products`,
          phone: order.data.customer_phone,
        });
        //   }

        if (response.success) {
          if (paymentMethod === "mobileMoney") {
            // Direct payment: show status
            setSuccess(response.data.status === "successful");
            setStatusMessage(
              response.data.status === "successful"
                ? "Payment completed successfully!"
                : response.data.status === "pending"
                  ? "Payment is being processed. Please check your phone."
                  : "Payment failed. Please try again."
            );
          } if (response.success && response.data.payment_link) {
            window.location.href = response.data.payment_link;
            return;
          }
        } else {
          setSuccess(false);
          setStatusMessage("Payment processing failed.");
        }
      } catch (error) {
        console.error("Payment error:", error);
        setSuccess(false);
        setStatusMessage("Payment error. Please try again or contact support.");
      } finally {
        setProcessing(false);
      }
    };

    processPayment();
  }, [navigate]);

  const handleSuccess = () => {
    localStorage.removeItem("currentOrder");
    localStorage.removeItem("cartItems");
    navigate("/orders");
  };

  const handleCancel = () => {
    localStorage.removeItem("currentOrder");
    navigate("/");
  };

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
                  <p className="text-lg font-medium">{statusMessage}</p>
                  <p className="text-muted-foreground">
                    Your order has been received and is being processed.
                  </p>
                  <p className="font-semibold">Order {orderId}</p>
                </div>

                <div className="bg-muted w-full rounded-md p-4 text-sm">
                  <div className="flex justify-between mb-2">
                    <span>Order Total:</span>
                    <span className="font-bold">
                      {(localStorage.getItem("currentOrder") &&
                        JSON.parse(localStorage.getItem("currentOrder")!).data.total.toLocaleString())} FCFA
                    </span>
                    <span>May 3 - May 7, 2025</span>
                  </div>
                </div>
              </div>
            ) : (<div className="flex flex-col items-center">
              <XCircle className="h-20 w-20 text-red-500 mb-6" />
              <p className="text-center text-muted-foreground mb-6">
                {statusMessage}
              </p>
            </div>)}
          </CardContent>

          <CardFooter className="flex-col space-y-2">
            {!processing && success && (
              <>
                <Button
                  className="w-full bg-cm-green hover:bg-cm-forest"
                  onClick={() => { handleSuccess }}
                >
                  View Order
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCancel}
                >
                  Continue Shopping
                </Button>
              </>
            )}
            {!processing && !success && (
              <>
                <Button className="w-full" onClick={() => navigate("/checkout")}>
                  Retry Payment
                </Button>
                <Button variant="outline" className="w-full" onClick={handleCancel}>
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
