import { useState } from "react";
import { useToast } from "./use-toast";
import { productApi } from '@/lib/api';

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stockQuantity: string;
  category: string;
  selectedTags: string[];
  quantity: number;
  images: File[];
  imagePreviewUrls: string[];
  shippingInfo: string;
  dimensions: string;
  weight: string;
  materials: string;
  returnPolicy: string;
}

export const useProductForm = (onProductCreated?: () => void) => {
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
    quantity: 1,
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

<<<<<<< Updated upstream
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
=======
  const token = localStorage.getItem('token');
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
>>>>>>> Stashed changes
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));
    console.log(newPreviewUrls);

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newFiles],
      imagePreviewUrls: [...prev.imagePreviewUrls, ...newPreviewUrls],
    }));

    toast({
      title: "Images added",
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
    if (!formData.images || formData.images.length === 0) {
      toast({
        title: "Image required",
        description: "Please upload at least one product image before submitting.",
        variant: "destructive",
      });
      return;
    }

    const data = new FormData();
    data.append('title', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price === '' ? '0' : formData.price);
    data.append('category', formData.category);
    data.append('quantity', formData.stockQuantity === '' ? '0' : formData.stockQuantity);
    data.append('returnPolicy', formData.returnPolicy);
    formData.images.forEach((file) => {
      data.append('images', file);
    });

    setIsSubmitting(true);
    try {
      await productApi.create(data);
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
        quantity: 1,
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
      if (onProductCreated) onProductCreated();
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
