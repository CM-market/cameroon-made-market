
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  {
    label: "Active Vendors",
    value: "500+",
    description: "Local businesses and artisans",
  },
  {
    label: "Products Listed",
    value: "2,000+",
    description: "Authentic Cameroonian items",
  },
  {
    label: "Happy Customers",
    value: "10,000+",
    description: "Satisfied shoppers nationwide",
  },
  {
    label: "Local Communities",
    value: "50+",
    description: "Regions represented",
  },
];

const MarketplaceStats = () => {
  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-8 text-center">
        Growing Together
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-cm-green mb-2">
                {stat.value}
              </div>
              <div className="text-lg font-semibold mb-2">{stat.label}</div>
              <p className="text-gray-600 text-sm">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default MarketplaceStats;
