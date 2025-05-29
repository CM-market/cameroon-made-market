import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Store, Truck, Globe2, Shield, Users, Package } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-primary">Transac</h1>
            <p className="text-xl text-muted-foreground">
              Your Gateway to Cameroonian Commerce & Global Products
            </p>
          </div>

          {/* Mission Statement */}
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <p className="text-lg leading-relaxed">
                We're transforming commerce in Cameroon by empowering local businesses
                and small entrepreneurs to reach customers nationwide without the complexity
                of building their own websites. Our platform also connects Cameroonians
                with quality international products through our streamlined import service,
                eliminating shipping hassles and making global commerce accessible to everyone.
              </p>
            </CardContent>
          </Card>

          {/* Key Features */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Store className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">Ready-Made Online Stores</h3>
                </div>
                <p className="text-muted-foreground">
                  Skip the technical complexity. Create your professional online store
                  in minutes and start selling across Cameroon without building a website.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Globe2 className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">Import Made Simple</h3>
                </div>
                <p className="text-muted-foreground">
                  Want international products? We handle the importing, shipping,
                  and logistics so you can access global goods without the stress.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Truck className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">Nationwide Delivery</h3>
                </div>
                <p className="text-muted-foreground">
                  From Douala to Garoua, we connect sellers with buyers across
                  all ten regions of Cameroon through reliable delivery networks.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">Supporting Local Business</h3>
                </div>
                <p className="text-muted-foreground">
                  Empowering artisans, farmers, and small business owners to grow
                  beyond their local markets and build sustainable online businesses.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Package className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">Dual Marketplace</h3>
                </div>
                <p className="text-muted-foreground">
                  Discover authentic Cameroonian products alongside carefully
                  curated international goods, all in one convenient platform.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">Trusted & Secure</h3>
                </div>
                <p className="text-muted-foreground">
                  Shop with confidence knowing all transactions are secure and
                  all sellers are verified to maintain quality standards.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Value Propositions */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-primary/5">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">For Sellers</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• No website building required</li>
                  <li>• Reach customers nationwide</li>
                  <li>• Simple store management tools</li>
                  <li>• Integrated payment processing</li>
                  <li>• Marketing support and visibility</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-secondary/5">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">For Buyers</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Access to local and international products</li>
                  <li>• Hassle-free international shopping</li>
                  <li>• Support local Cameroonian businesses</li>
                  <li>• Secure payment and delivery</li>
                  <li>• Quality assurance on all products</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold">Ready to Transform Your Business?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're a local entrepreneur ready to scale your business across
              Cameroon or a customer seeking the best of local and international products,
              Transac is your trusted partner in commerce.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;