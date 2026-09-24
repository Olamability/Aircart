"use server";

import { auth } from "@clerk/nextjs/server";
import { backendClient } from "@/sanity/lib/backendClient";

interface AddressData {
  fullName: string;
  phone: string;
  email?: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  zip: string;
  label: string;
  Default?: boolean;
}

export async function getAddresses() {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  const query = `*[
    _type == "address" &&
    clerkUserId == $userId
  ] | order(Default desc, CreatedAT desc)`;

  return await backendClient.fetch(query, { userId });
}

export async function createAddress(data: AddressData) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        message: "You must be signed in.",
      };
    }

    const existingAddresses = await getAddresses();

    const isFirstAddress = existingAddresses.length === 0;

    const shouldBeDefault = isFirstAddress || data.Default === true;

    if (shouldBeDefault && existingAddresses.length > 0) {
      const userAddressIds = existingAddresses.map(
        (address: { _id: string }) => address._id,
      );

      await Promise.all(
        userAddressIds.map((id: string) =>
          backendClient.patch(id).set({ Default: false }).commit(),
        ),
      );
    }

    const address = await backendClient.create({
      _type: "address",
      clerkUserId: userId,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email || "",
      street: data.street,
      city: data.city,
      state: data.state,
      country: data.country || "Nigeria",
      postalCode: data.postalCode || "",
      zip: data.zip,
      label: data.label,
      Default: shouldBeDefault,
      CreatedAT: new Date().toISOString(),
    });

    return {
      success: true,
      message: "Address added successfully.",
      address,
    };
  } catch (error) {
    console.error("Error creating address:", error);

    return {
      success: false,
      message: "Failed to add address.",
    };
  }
}

export async function updateAddress(addressId: string, data: AddressData) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        message: "You must be signed in.",
      };
    }

    const address = await backendClient.fetch(
      `*[
        _type == "address" &&
        _id == $addressId &&
        clerkUserId == $userId
      ][0]`,
      {
        addressId,
        userId,
      },
    );

    if (!address) {
      return {
        success: false,
        message: "Address not found.",
      };
    }

    if (data.Default === true) {
      const addresses = await getAddresses();

      await Promise.all(
        addresses
          .filter((item: { _id: string }) => item._id !== addressId)
          .map((item: { _id: string }) =>
            backendClient.patch(item._id).set({ Default: false }).commit(),
          ),
      );
    }

    const updatedAddress = await backendClient
      .patch(addressId)
      .set({
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || "",
        street: data.street,
        city: data.city,
        state: data.state,
        country: data.country || "Nigeria",
        postalCode: data.postalCode || "",
        zip: data.zip,
        label: data.label,
        Default: data.Default === true,
      })
      .commit();

    return {
      success: true,
      message: "Address updated successfully.",
      address: updatedAddress,
    };
  } catch (error) {
    console.error("Error updating address:", error);

    return {
      success: false,
      message: "Failed to update address.",
    };
  }
}

export async function deleteAddress(addressId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        message: "You must be signed in.",
      };
    }

    const address = await backendClient.fetch(
      `*[
        _type == "address" &&
        _id == $addressId &&
        clerkUserId == $userId
      ][0]`,
      {
        addressId,
        userId,
      },
    );

    if (!address) {
      return {
        success: false,
        message: "Address not found.",
      };
    }

    const wasDefault = address.Default === true;

    await backendClient.delete(addressId);

    if (wasDefault) {
      const remainingAddresses = await getAddresses();

      if (remainingAddresses.length > 0) {
        await backendClient
          .patch(remainingAddresses[0]._id)
          .set({ Default: true })
          .commit();
      }
    }

    return {
      success: true,
      message: "Address deleted successfully.",
    };
  } catch (error) {
    console.error("Error deleting address:", error);

    return {
      success: false,
      message: "Failed to delete address.",
    };
  }
}

export async function setDefaultAddress(addressId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        message: "You must be signed in.",
      };
    }

    const address = await backendClient.fetch(
      `*[
        _type == "address" &&
        _id == $addressId &&
        clerkUserId == $userId
      ][0]`,
      {
        addressId,
        userId,
      },
    );

    if (!address) {
      return {
        success: false,
        message: "Address not found.",
      };
    }

    const addresses = await getAddresses();

    await Promise.all(
      addresses.map((item: { _id: string }) =>
        backendClient
          .patch(item._id)
          .set({ Default: item._id === addressId })
          .commit(),
      ),
    );

    return {
      success: true,
      message: "Default address updated.",
    };
  } catch (error) {
    console.error("Error setting default address:", error);

    return {
      success: false,
      message: "Failed to update default address.",
    };
  }
}
