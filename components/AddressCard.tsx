"use client";

import React, { useState } from "react";
import { Address } from "@/sanity.types";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import AddressDialog from "./AddressDialog";
import { deleteAddress, setDefaultAddress } from "@/actions/address";
import toast from "react-hot-toast";
import { Pencil, Trash2, Star } from "lucide-react";

interface AddressCardProps {
  address: Address;
  onChange: () => void;
}

const AddressCard = ({ address, onChange }: AddressCardProps) => {
  const [loading, setLoading] = useState(false);

  const handleDefault = async () => {
    setLoading(true);

    try {
      const result = await setDefaultAddress(address._id);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      onChange();
    } catch (error) {
      console.error("Default address error:", error);
      toast.error("Failed to update default address.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);

    try {
      const result = await deleteAddress(address._id);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      onChange();
    } catch (error) {
      console.error("Delete address error:", error);
      toast.error("Failed to delete address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className={`border ${
        address.Default
          ? "border-shop-dark-green bg-shop-dark-green/5"
          : "border-gray-200"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold capitalize">{address.label}</span>

              {address.Default && (
                <span className="flex items-center gap-1 text-xs font-semibold text-shop-dark-green">
                  <Star size={13} fill="currentColor" />
                  Default
                </span>
              )}
            </div>

            <p className="font-semibold text-sm">{address.fullName}</p>

            <p className="text-sm text-shop-light-text mt-1">
              {address.street}
            </p>

            <p className="text-sm text-shop-light-text">
              {address.city}, {address.state}
            </p>

            <p className="text-sm text-shop-light-text">
              {address.country}
              {address.zip && `, ${address.zip}`}
            </p>

            <p className="text-sm text-shop-light-text mt-2">{address.phone}</p>

            {address.email && (
              <p className="text-sm text-shop-light-text">{address.email}</p>
            )}
          </div>

          <AddressDialog address={address} onSuccess={onChange}>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              disabled={loading}
            >
              <Pencil size={16} />
            </Button>
          </AddressDialog>
        </div>

        <div className="flex flex-wrap gap-2 mt-5">
          {!address.Default && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={handleDefault}
              className="rounded-full"
            >
              <Star size={14} />
              Make Default
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={handleDelete}
            className="rounded-full text-red-600 hover:text-red-600"
          >
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddressCard;
