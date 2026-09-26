"use client";

import React from "react";
import VendorProductForm from "@/components/VendorProductForm";
import type { VendorProductInput } from "@/lib/validators/product";

interface VendorCreateProductFormProps {
  onSubmit: (data: VendorProductInput) => Promise<void>;
}

const VendorCreateProductForm: React.FC<VendorCreateProductFormProps> = ({
  onSubmit,
}) => {
  return (
    <VendorProductForm
      onSubmit={onSubmit}
      submitButtonLabel="Create Product"
      successMessage="Product created successfully"
    />
  );
};

export default VendorCreateProductForm;

