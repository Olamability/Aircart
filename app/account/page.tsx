import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAddresses } from "@/actions/address";
import AddressList from "@/components/AddressList";

const AccountPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const addresses = await getAddresses();

  return (
    <main className="min-h-screen bg-shop-light-bg py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-shop-dark-green">
            My Account
          </h1>

          <p className="text-sm text-shop-light-text mt-1">
            Manage your account and delivery addresses.
          </p>
        </div>

        <div className="bg-white rounded-md p-4 sm:p-6">
          <AddressList addresses={addresses} />
        </div>
      </div>
    </main>
  );
};

export default AccountPage;
