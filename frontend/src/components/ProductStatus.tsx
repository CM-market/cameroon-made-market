
import React from "react";
import { Check, Clock, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { cn } from "@/lib/utils";

type StatusType = "pending" | "approved" | "rejected";

interface ProductStatusProps {
  status: StatusType;
  message?: string;
  submittedAt: string;
  reviewedAt?: string;
}

const ProductStatus: React.FC<ProductStatusProps> = ({
  status,
  message,
  submittedAt,
  reviewedAt,
}) => {
  const statusConfig = {
    pending: {
      icon: Clock,
      title: "Verification Pending",
      description: "Your product is under review.",
      bgColor: "bg-cm-yellow bg-opacity-10",
      borderColor: "border-cm-yellow",
      textColor: "text-cm-yellow",
    },
    approved: {
      icon: Check,
      title: "Verified & Approved",
      description: "Your product has been verified as Made in Cameroon.",
      bgColor: "bg-cm-green bg-opacity-10",
      borderColor: "border-cm-green",
      textColor: "text-cm-green",
    },
    rejected: {
      icon: AlertTriangle,
      title: "Verification Failed",
      description: "Your product does not meet our Made in Cameroon criteria.",
      bgColor: "bg-cm-red bg-opacity-10",
      borderColor: "border-cm-red",
      textColor: "text-cm-red",
    },
  };

  const config = statusConfig[status];

  return (
    <Card
      className={cn(
        "border-l-4 transition-all",
        config.bgColor,
        config.borderColor
      )}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "p-1 rounded-full",
              config.bgColor,
              config.textColor
            )}
          >
            <config.icon size={18} />
          </div>
          <CardTitle className={config.textColor}>{config.title}</CardTitle>
        </div>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Submitted</span>
            <span>{submittedAt}</span>
          </div>
          {reviewedAt && (
            <div className="flex justify-between">
              <span className="font-medium">Reviewed</span>
              <span>{reviewedAt}</span>
            </div>
          )}
          {message && (
            <div className="mt-4 p-3 bg-white bg-opacity-50 rounded border border-gray-200">
              <p className="font-medium mb-1">Feedback:</p>
              <p className="text-gray-700">{message}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductStatus;
