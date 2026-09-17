"use client";

import React from "react";
import { Address } from "@/sanity.types";
import { useRouter } from "next/navigation";
import AddressCard from "./AddressCard";
import AddressDialog from "./AddressDialog";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

const AddressList = ({ addresses }: { addresses: Address[] }) => {
  const router = useRouter();

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-bold text-xl text-shop-dark-green">
            Delivery Addresses
          </h2>

          <p className="text-sm text-shop-light-text mt-1">
            Manage the addresses you use for your orders.
          </p>
        </div>

        <AddressDialog onSuccess={() => router.refresh()}>
          <Button className="rounded-full font-semibold hoverEffect">
            <Plus size={17} />
            Add New Address
          </Button>
        </AddressDialog>
      </div>

      {addresses.length === 0 ? (
        <div className="border border-dashed rounded-md p-8 text-center">
          <p className="font-semibold">No delivery address added yet.</p>

          <p className="text-sm text-shop-light-text mt-1">
            Add an address to make checkout faster.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address._id}
              address={address}
              onChange={() => router.refresh()}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressList;
