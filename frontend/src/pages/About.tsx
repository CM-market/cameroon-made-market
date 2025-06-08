import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Store, Truck, Globe2, Shield, Users, Package } from "lucide-react";
import { t, use } from "i18next";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation('about');
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-primary">  <Link to="/">Transac</Link></h1>
            <p className="text-xl text-muted-foreground">
              {t('title')}
            </p>
          </div>

          {/* Mission Statement */}
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <p className="text-lg leading-relaxed">
                {t('description', { ns: 'about' })}
              </p>
            </CardContent>
          </Card>

          {/* Key Features */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Store className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">{t('column1r1')}</h3>
                </div>
                <p className="text-muted-foreground">
                  {t('column1r1Description')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Globe2 className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">{t('column2r1')}</h3>
                </div>
                <p className="text-muted-foreground">
                  {t('column2r1Description')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Truck className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">{t('column1r2')}</h3>
                </div>
                <p className="text-muted-foreground">
                  {t('column1r2Description')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">{t('column2r2')}</h3>
                </div>
                <p className="text-muted-foreground">
                  {t('column2r2Description')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Package className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">{t('column1r3')}</h3>
                </div>
                <p className="text-muted-foreground">
                  {t('column1r3Description')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">{t('column2r3')}</h3>
                </div>
                <p className="text-muted-foreground">
                  {t('column2r3Description')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Value Propositions */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-primary/5">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">{t('sellers')}</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>{t('sellersDescription1')}</li>
                  <li>{t('sellersDescription2')}</li>
                  <li>{t('sellersDescription3')}</li>
                  <li>{t('sellersDescription4')}</li>
                  <li>{t('sellersDescription5')}</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-secondary/5">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">{t('buyers')}</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>{t('buyersDescription1')}</li>
                  <li>{t('buyersDescription2')}</li>
                  <li>{t('buyersDescription3')}</li>
                  <li>{t('buyersDescription4')}</li>
                  <li>{t('buyersDescription5')}</li>
                </ul>
              </CardContent>
            </Card>

          </div>

          {/* Call to Action */}
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold">{t('footertitle')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('footerdescription')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;