
import { useState } from "react";
import { useToast } from "./use-toast";

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stockQuantity: string;
  category: string;
  selectedTags: string[];
  images: File[];
  imagePreviewUrls: string[];
  shippingInfo: string;
  dimensions: string;
  weight: string;
  materials: string;
  returnPolicy: string;
}

export const useProductForm = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("details");
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    category: "",
    selectedTags: [],
    images: [],
    imagePreviewUrls: [],
    shippingInfo: "",
    dimensions: "",
    weight: "",
    materials: "",
    returnPolicy: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleTagToggle = (tagId: string) => {
    setFormData((prev) => {
      const selectedTags = prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter((id) => id !== tagId)
        : [...prev.selectedTags, tagId];
      return { ...prev, selectedTags };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newFiles],
      imagePreviewUrls: [...prev.imagePreviewUrls, ...newPreviewUrls],
    }));

    toast({
      title: "Images uploaded",
      description: `${newFiles.length} image(s) have been added to your product.`,
    });
  };

  const removeImage = (index: number) => {
    setFormData((prev) => {
      const newImages = [...prev.images];
      const newPreviewUrls = [...prev.imagePreviewUrls];
      URL.revokeObjectURL(newPreviewUrls[index]);
      newImages.splice(index, 1);
      newPreviewUrls.splice(index, 1);
      return { ...prev, images: newImages, imagePreviewUrls: newPreviewUrls };
    });
  };

  const saveDraft = async () => {
    setIsSavingDraft(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Draft saved",
        description: "Your product has been saved as a draft.",
      });
    } catch (error) {
      toast({
        title: "Error saving draft",
        description: "There was an error saving your draft. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  const submitProduct = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Product submitted",
        description: "Your product has been submitted for verification.",
      });
      setFormData({
        name: "",
        description: "",
        price: "",
        stockQuantity: "",
        category: "",
        selectedTags: [],
        images: [],
        imagePreviewUrls: [],
        shippingInfo: "",
        dimensions: "",
        weight: "",
        materials: "",
        returnPolicy: "",
      });
      setActiveTab("details");
    } catch (error) {
      toast({
        title: "Error submitting product",
        description: "There was an error submitting your product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsPreviewing(false);
    }
  };

  return {
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
  };
};
