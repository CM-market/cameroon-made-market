import { useState } from "react";
import { useToast } from "./use-toast";
import { uploadImage } from "@/services/minioService";
import { useNavigate } from "react-router-dom";
import { productApi } from "@/lib/api";
import { analyzeImage } from "@/services/imageService";

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  selectedTags: string[];
  quantity: string;
  images: File[];
  imagePreviewUrls: string[];
  uploadedImageUrls: string[];
  shippingInfo: string;
  dimensions: string;
  weight: string;
  materials: string;
  returnPolicy: string;
}

export const useProductForm = (onProductCreated?: () => void) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("details");
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    quantity: "",
    category: "",
    selectedTags: [],
    images: [],
    imagePreviewUrls: [],
    uploadedImageUrls: [],
    shippingInfo: "",
    dimensions: "",
    weight: "",
    materials: "",
    returnPolicy: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false); 
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
  // analyse image before uploading
    // Analyse images before uploading
    const newFiles = Array.from(files);

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      try {
        // analyzeImage expects a string (path), but we have a File object.
        // To analyze, we need to read the file as a data URL or upload it first and get a URL.
        // For now, let's read the file as a data URL and pass that to analyzeImage.
        const fileDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        let a = await analyzeImage(fileDataUrl);
        console.log(a)
      } catch (error) {
        console.error(error);
        toast({
          title: "Image analysis failed",
          description: error instanceof Error ? error.message : "One of your images could not be analyzed. Please try a different image.",
          variant: "destructive",
        });
        return; // Stop further processing if analysis fails
      }
    }
  
    
    setIsUploading(true);
    let newPreviewUrls: string[] = [];
    
    try {
      const newFiles = Array.from(files);
      // If you want to analyze the first image file, you need to provide its path or handle accordingly.
      // For now, skip analyzeImage or implement logic to upload the file and get its path before analyzing.
      // Example: let imgalyser = await analyzeImage(filePathString);
      // newFiles.map(file => analyzeImage(file))

      newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file)); 
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        try {
          const imageUrl = await uploadImage(file);
          uploadedUrls.push(imageUrl);
        } catch (error) {
          // Clean up any preview URLs created so far
          newPreviewUrls.forEach(URL.revokeObjectURL);
          throw new Error(`An error occurred when uploading the image`);
        }
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newFiles],
        imagePreviewUrls: [...prev.imagePreviewUrls, ...newPreviewUrls],
        uploadedImageUrls: [...prev.uploadedImageUrls, ...uploadedUrls],
      }));

      toast({
        title: "Images uploaded",
        description: `${newFiles.length} image(s) have been added to your product.`,
      });
    } catch (error) {
      // Clean up any preview URLs
      newPreviewUrls.forEach(URL.revokeObjectURL);

      toast({
        title: "Error uploading images",
        description: error instanceof Error ? error.message : "There was an error uploading your images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => {
      const newImages = [...prev.images];
      const newPreviewUrls = [...prev.imagePreviewUrls];
      const newUploadedUrls = [...prev.uploadedImageUrls];
      
      URL.revokeObjectURL(newPreviewUrls[index]);
      newImages.splice(index, 1);
      newPreviewUrls.splice(index, 1);
      newUploadedUrls.splice(index, 1);
      
      return { 
        ...prev, 
        images: newImages, 
        imagePreviewUrls: newPreviewUrls,
        uploadedImageUrls: newUploadedUrls 
      };
    });
  };

  const saveDraft = async () => {
    setIsSavingDraft(true);
    try {
      // TODO: Implement draft saving functionality
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
    data.append('quantity', formData.quantity === '' ? '1' : formData.quantity);
    data.append('returnPolicy', formData.returnPolicy);
    formData.images.forEach((file) => {
      data.append('images', file);
    });

    setIsSubmitting(true);
    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.price || !formData.category) {
        throw new Error("Please fill in all required fields");
      }

      // Create product data
      const productData = {
        title: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image_urls: formData.uploadedImageUrls,
        quantity: Number(formData.quantity),
        return_policy: formData.returnPolicy,
        // Add other fields as needed
      };

      // Submit product to backend
      const product = await productApi.create(productData);

      toast({
        title: "Product submitted",
        description: "Your product has been submitted successfully.",
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        quantity: "",
        selectedTags: [],
        images: [],
        imagePreviewUrls: [],
        uploadedImageUrls: [],
        shippingInfo: "",
        dimensions: "",
        weight: "",
        materials: "",
        returnPolicy: "",
      });
      setActiveTab("details");

      // Navigate to product page or dashboard
      navigate(`/vendor/dashboard`);
    } catch (error) {
      toast({
        title: "Error submitting product",
        description: error instanceof Error ? error.message : "There was an error submitting your product. Please try again.",
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
    isUploading,
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
