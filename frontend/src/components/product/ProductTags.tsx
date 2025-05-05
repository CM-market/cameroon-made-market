
import React from "react";
import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TAGS } from "@/constants/productData";
import type { ProductFormData } from "@/hooks/useProductForm";

interface ProductTagsProps {
  formData: ProductFormData;
  onTagToggle: (tagId: string) => void;
}

export const ProductTags = ({ formData, onTagToggle }: ProductTagsProps) => {
  return (
    <div className="space-y-2">
      <Label>Product Tags</Label>
      <div className="flex flex-wrap gap-2">
        {TAGS.map((tag) => (
          <Badge
            key={tag.id}
            variant={formData.selectedTags.includes(tag.id) ? "default" : "outline"}
            className={`cursor-pointer ${
              formData.selectedTags.includes(tag.id)
                ? "bg-cm-green hover:bg-cm-forest"
                : ""
            }`}
            onClick={() => onTagToggle(tag.id)}
          >
            {tag.name}
            {formData.selectedTags.includes(tag.id) && (
              <Check size={14} className="ml-1" />
            )}
          </Badge>
        ))}
      </div>
    </div>
  );
};
