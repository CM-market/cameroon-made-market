import React from "react";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Account: React.FC = () => {
  // In a real app, fetch transaction history from backend
  const transactions = [
    // Example data
    {
      id: "TXN123456",
      product: "Hand-woven Basket",
      quantity: 2,
      price: 15000,
      total: 30000,
    },
    {
      id: "TXN654321",
      product: "Cameroonian Coffee Beans",
      quantity: 1,
      price: 8500,
      total: 8500,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MainNavbar />
      <div className="flex-1 container mx-auto px-4 py-12">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border">
                <thead>
                  <tr className="bg-cm-green text-white">
                    <th className="px-4 py-2">Transaction ID</th>
                    <th className="px-4 py-2">Product</th>
                    <th className="px-4 py-2">Quantity</th>
                    <th className="px-4 py-2">Price</th>
                    <th className="px-4 py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(txn => (
                    <tr key={txn.id} className="border-b">
                      <td className="px-4 py-2">{txn.id}</td>
                      <td className="px-4 py-2">{txn.product}</td>
                      <td className="px-4 py-2">{txn.quantity}</td>
                      <td className="px-4 py-2">{txn.price.toLocaleString()} FCFA</td>
                      <td className="px-4 py-2">{txn.total.toLocaleString()} FCFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Account; 