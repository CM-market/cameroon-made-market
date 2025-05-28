
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Users, Handshake, Award } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-primary">Transac</h1>
            <p className="text-xl text-muted-foreground">
              Empowering Cameroonian Artisans and Businesses
            </p>
          </div>

          {/* Mission Statement */}
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <p className="text-lg leading-relaxed">
                Our mission is to create a vibrant digital marketplace that showcases 
                the rich diversity of Cameroonian products while providing artisans, 
                farmers, and small business owners with the tools they need to reach 
                customers across the nation and beyond.
              </p>
            </CardContent>
          </Card>

          {/* Key Features */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">National Reach</h3>
                </div>
                <p className="text-muted-foreground">
                  Connect with customers across Cameroon through our digital platform, 
                  expanding your market reach beyond local boundaries.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">Community Growth</h3>
                </div>
                <p className="text-muted-foreground">
                  Join a growing community of Cameroonian entrepreneurs and artisans 
                  sharing knowledge and supporting each other.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Handshake className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">Easy to Use</h3>
                </div>
                <p className="text-muted-foreground">
                  Simple and intuitive tools for managing your online store, 
                  processing orders, and tracking your business growth.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Award className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">Quality Assurance</h3>
                </div>
                <p className="text-muted-foreground">
                  We maintain high standards for all products listed on our platform, 
                  ensuring authentic Cameroonian quality for our customers.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <p className="text-lg text-muted-foreground">
              Join us in building a stronger, more connected Cameroonian marketplace. 
              Whether you're a seller looking to expand your reach or a customer 
              seeking quality Cameroonian products, we're here to serve you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
