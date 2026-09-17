"use client";

import React, { useState } from "react";
import { Address } from "@/sanity.types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import toast from "react-hot-toast";
import { createAddress, updateAddress } from "@/actions/address";

interface AddressFormProps {
  address?: Address | null;
  onSuccess: () => void;
}

const AddressForm = ({ address, onSuccess }: AddressFormProps) => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: address?.fullName ?? "",
    phone: address?.phone ?? "",
    email: address?.email ?? "",
    street: address?.street ?? "",
    city: address?.city ?? "",
    state: address?.state ?? "",
    country: address?.country ?? "Nigeria",
    postalCode: address?.postalCode ?? "",
    zip: address?.zip ?? "",
    label: address?.label ?? "home",
    Default: address?.Default ?? false,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.street ||
      !formData.city ||
      !formData.state ||
      !formData.zip
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const result = address
        ? await updateAddress(address._id, formData)
        : await createAddress(formData);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      onSuccess();
    } catch (error) {
      console.error("Address form error:", error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>

          <Input
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>

          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="08012345678"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>

        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="street">Street Address</Label>

        <Input
          id="street"
          name="street"
          value={formData.street}
          onChange={handleChange}
          placeholder="House number, street name"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>

          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>

          <Input
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="State"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>

          <Input
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zip">Postal Code</Label>

          <Input
            id="zip"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            placeholder="e.g. 500001"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="label">Address Label</Label>

        <select
          id="label"
          value={formData.label}
          onChange={(event) =>
            setFormData((prev) => ({
              ...prev,
              label: event.target.value as "home" | "office" | "other",
            }))
          }
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-shop-dark-green"
        >
          <option value="home">Home</option>
          <option value="office">Office</option>
          <option value="other">Other</option>
        </select>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.Default}
          onChange={(event) =>
            setFormData((prev) => ({
              ...prev,
              Default: event.target.checked,
            }))
          }
          className="h-4 w-4 accent-shop-dark-green"
        />

        <span className="text-sm font-medium">
          Make this my default address
        </span>
      </label>

      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-full font-semibold tracking-wide hoverEffect"
      >
        {loading
          ? "Please wait..."
          : address
            ? "Update Address"
            : "Save Address"}
      </Button>
    </form>
  );
};

export default AddressForm;
