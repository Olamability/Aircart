"use client";

import React, { ReactNode, useState } from "react";
import { Address } from "@/sanity.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import AddressForm from "./AddressForm";

interface AddressDialogProps {
  children: ReactNode;
  address?: Address | null;
  onSuccess?: () => void;
}

const AddressDialog = ({
  children,
  address,
  onSuccess,
}: AddressDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<span>{children}</span>} />

      <DialogContent className="w-[calc(100%-1rem)] max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center font-bold text-shop-dark-green">
            {address ? "Edit Address" : "Add New Address"}
          </DialogTitle>
        </DialogHeader>

        <AddressForm
          address={address}
          onSuccess={() => {
            setOpen(false);
            onSuccess?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddressDialog;
