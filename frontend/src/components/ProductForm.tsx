import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus, Save } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useProductForm } from "@/hooks/useProductForm";
import { BasicDetails } from "./product/BasicDetails";
import { ProductImages } from "./product/ProductImages";
import { ProductTags } from "./product/ProductTags";
import { ProductPreview } from "./product/ProductPreview";

interface ProductFormProps {
  onProductCreated?: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ onProductCreated }) => {
  const {
    activeTab,
    setActiveTab,
    formData,
    isSubmitting,
    isSavingDraft,
    isPreviewing,
    setIsPreviewing,
    handleInputChange,
    handleSelectChange,
    handleTagToggle,
    handleImageUpload,
    removeImage,
    saveDraft,
    submitProduct,
  } = useProductForm(onProductCreated);

  const isFormValid = () => {
    return (
      formData.name &&
      formData.description &&
      formData.price &&
      formData.category &&
      formData.images.length > 0
    );
  };

  const previewProduct = () => {
    setIsPreviewing(true);
    setActiveTab("preview");
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Product Details</TabsTrigger>
          <TabsTrigger value="attributes">Attributes & Images</TabsTrigger>
          <TabsTrigger value="preview" disabled={!isFormValid() && !isPreviewing}>
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details about your product.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BasicDetails
                formData={formData}
                onInputChange={handleInputChange}
                onSelectChange={handleSelectChange}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={saveDraft} disabled={isSavingDraft}>
                {isSavingDraft ? (
                  "Saving..."
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save Draft
                  </>
                )}
              </Button>
              <Button onClick={() => setActiveTab("attributes")}>
                Next: Attributes & Images
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="attributes">
          <Card>
            <CardHeader>
              <CardTitle>Product Attributes & Images</CardTitle>
              <CardDescription>
                Add specific details and images of your product.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProductTags formData={formData} onTagToggle={handleTagToggle} />
              <ProductImages
                formData={formData}
                onImageUpload={handleImageUpload}
                onRemoveImage={removeImage}
                isUploading={formData.isUploading ?? false}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="materials">Materials</Label>
                  <Input
                    id="materials"
                    name="materials"
                    value={formData.materials}
                    onChange={handleInputChange}
                    placeholder="What is your product made from?"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dimensions">Size</Label>
                  <Input
                    id="dimensions"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleInputChange}
                    placeholder="Size or dimensions (optional)"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="returnPolicy"> Refund Policy</Label>
                  <Input
                    id="returnPolicy"
                    name="returnPolicy"
                    value={formData.returnPolicy}
                    onChange={handleInputChange}
                    placeholder="Refund policy (optional)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shippingInfo">Shipping Information</Label>
                  <Input
                    id="shippingInfo"
                    name="shippingInfo"
                    value={formData.shippingInfo}
                    onChange={handleInputChange}
                    placeholder="Shipping details (optional)"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("details")}>
                Back to Details
              </Button>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={saveDraft} disabled={isSavingDraft}>
                  {isSavingDraft ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Save Draft
                    </>
                  )}
                </Button>
                <Button 
                  onClick={previewProduct} 
                  disabled={!isFormValid()}
                >
                  Preview Product
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Product Preview</CardTitle>
              <CardDescription>
                Review how your product will appear to customers before submitting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductPreview formData={formData} />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("attributes")}>
                Back to Edit
              </Button>
              <Button 
                onClick={submitProduct} 
                disabled={isSubmitting || !isFormValid()}
                className="bg-cm-green hover:bg-cm-forest"
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Plus size={16} className="mr-2" />
                    Submit Product
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductForm;
