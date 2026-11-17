
import { NextRequest, NextResponse } from "next/server";

import { authenticateMobileRequest } from "@/lib/mobileAuth";
import { getCorsHeaders } from "@/lib/cors";
import { backendClient } from "@/sanity/lib/backendClient";

interface RouteContext {
    params: Promise<{ id: string }>;
}

const VALID_LABELS = ["home", "office", "other"] as const;

const ZIP_REGEX = /^(\d{5,6})(-\d{4})?$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface AddressPayload {
    fullName: string;
    phone: string;
    email?: string;
    street: string;
    city: string;
    state: string;
    country?: string;
    postalCode?: string;
    zip: string;
    label: (typeof VALID_LABELS)[number];
    Default?: boolean;
}

interface ExistingAddress {
    _id: string;
    Default?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
    );
}

function validateAddressPayload(
    value: unknown,
): { data: AddressPayload } | { error: string } {
    if (!isRecord(value)) {
        return { error: "Invalid address data." };
    }

    const fullName =
        typeof value.fullName === "string" ? value.fullName.trim() : "";

    const phone =
        typeof value.phone === "string" ? value.phone.trim() : "";

    const email =
        typeof value.email === "string" ? value.email.trim() : "";

    const street =
        typeof value.street === "string" ? value.street.trim() : "";

    const city =
        typeof value.city === "string" ? value.city.trim() : "";

    const state =
        typeof value.state === "string" ? value.state.trim() : "";

    const country =
        typeof value.country === "string"
            ? value.country.trim()
            : "Nigeria";

    const zip =
        typeof value.zip === "string" ? value.zip.trim() : "";

    const postalCode =
        typeof value.postalCode === "string"
            ? value.postalCode.trim()
            : zip;

    const label = value.label;

    if (fullName.length < 2 || fullName.length > 50) {
        return {
            error: "Full name must be between 2 and 50 characters.",
        };
    }

    if (!phone || phone.length < 7) {
        return { error: "Please provide a valid phone number." };
    }

    if (email && !EMAIL_REGEX.test(email)) {
        return { error: "Please provide a valid email address." };
    }

    if (street.length < 5 || street.length > 100) {
        return {
            error: "Street address must be between 5 and 100 characters.",
        };
    }

    if (!city || !state) {
        return { error: "City and state are required." };
    }

    if (!country) {
        return { error: "Country is required." };
    }

    if (!ZIP_REGEX.test(zip)) {
        return { error: "Please provide a valid postal code." };
    }

    if (
        typeof label !== "string" ||
        !VALID_LABELS.includes(label as AddressPayload["label"])
    ) {
        return { error: "Please select a valid address label." };
    }

    if (
        value.Default !== undefined &&
        typeof value.Default !== "boolean"
    ) {
        return { error: "Invalid default address value." };
    }

    return {
        data: {
            fullName,
            phone,
            email,
            street,
            city,
            state,
            country,
            postalCode,
            zip,
            label: label as AddressPayload["label"],
            Default: value.Default as boolean | undefined,
        },
    };
}

export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 204,
        headers: getCorsHeaders(request),
    });
}

export async function PATCH(
    request: NextRequest,
    context: RouteContext,
) {
    const headers = getCorsHeaders(request);

    try {
        const authenticatedUser =
            await authenticateMobileRequest(request);

        if (!authenticatedUser) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers },
            );
        }

        const { id: addressId } = await context.params;

        if (!addressId) {
            return NextResponse.json(
                { error: "Address ID is required." },
                { status: 400, headers },
            );
        }

        let body: unknown;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid request body." },
                { status: 400, headers },
            );
        }

        if (!isRecord(body)) {
            return NextResponse.json(
                { error: "Invalid address data." },
                { status: 400, headers },
            );
        }

        const userId = authenticatedUser.userId;

        // Verify that the requested address belongs to this user.
        const existingAddress = await backendClient.fetch<ExistingAddress | null>(
            `*[
        _type == "address" &&
        _id == $addressId &&
        clerkUserId == $userId
      ][0]{
        _id,
        Default
      }`,
            { addressId, userId },
        );

        if (!existingAddress) {
            return NextResponse.json(
                { error: "Address not found." },
                { status: 404, headers },
            );
        }

        // Allow a default-only update without requiring the full address form.
        const isDefaultOnlyUpdate =
            Object.keys(body).length === 1 &&
            typeof body.Default === "boolean";

        if (isDefaultOnlyUpdate) {
            const addresses = await backendClient.fetch<ExistingAddress[]>(
                `*[
          _type == "address" &&
          clerkUserId == $userId
        ]{
          _id,
          Default
        }`,
                { userId },
            );

            let transaction = backendClient.transaction();

            for (const address of addresses) {
                transaction = transaction.patch(address._id, {
                    set: {
                        Default:
                            body.Default === true &&
                            address._id === addressId,
                    },
                });
            }

            await transaction.commit();

            return NextResponse.json(
                { message: "Default address updated successfully." },
                { status: 200, headers },
            );
        }

        // Validate a complete address update.
        const validation = validateAddressPayload(body);

        if ("error" in validation) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400, headers },
            );
        }

        const data = validation.data;

        const shouldBeDefault =
            data.Default ?? existingAddress.Default === true;

        const updatedFields = {
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
        };

        let transaction = backendClient.transaction();

        if (shouldBeDefault) {
            const addresses = await backendClient.fetch<ExistingAddress[]>(
                `*[
          _type == "address" &&
          clerkUserId == $userId
        ]{
          _id
        }`,
                { userId },
            );

            for (const address of addresses) {
                if (address._id !== addressId) {
                    transaction = transaction.patch(address._id, {
                        set: { Default: false },
                    });
                }
            }
        }

        transaction = transaction.patch(addressId, {
            set: updatedFields,
        });

        await transaction.commit();

        const updatedAddress = await backendClient.fetch(
            `*[
        _type == "address" &&
        _id == $addressId &&
        clerkUserId == $userId
      ][0]{
        _id,
        clerkUserId,
        fullName,
        phone,
        email,
        street,
        city,
        state,
        country,
        postalCode,
        zip,
        Default,
        label,
        CreatedAT
      }`,
            { addressId, userId },
        );

        return NextResponse.json(
            {
                message: "Address updated successfully.",
                address: updatedAddress,
            },
            { status: 200, headers },
        );
    } catch (error) {
        console.error("Failed to update customer address:", error);

        return NextResponse.json(
            { error: "Unable to update address." },
            { status: 500, headers },
        );
    }
}

export async function DELETE(
    request: NextRequest,
    context: RouteContext,
) {
    const headers = getCorsHeaders(request);

    try {
        const authenticatedUser =
            await authenticateMobileRequest(request);

        if (!authenticatedUser) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers },
            );
        }

        const { id: addressId } = await context.params;

        if (!addressId) {
            return NextResponse.json(
                { error: "Address ID is required." },
                { status: 400, headers },
            );
        }

        const userId = authenticatedUser.userId;

        // Verify ownership before allowing deletion.
        const address = await backendClient.fetch<ExistingAddress | null>(
            `*[
        _type == "address" &&
        _id == $addressId &&
        clerkUserId == $userId
      ][0]{
        _id,
        Default
      }`,
            { addressId, userId },
        );

        if (!address) {
            return NextResponse.json(
                { error: "Address not found." },
                { status: 404, headers },
            );
        }

        const wasDefault = address.Default === true;

        const remainingAddresses = await backendClient.fetch<
            ExistingAddress[]
        >(
            `*[
        _type == "address" &&
        clerkUserId == $userId &&
        _id != $addressId
      ] | order(Default desc, CreatedAT desc){
        _id
      }`,
            { addressId, userId },
        );

        let transaction = backendClient.transaction();

        transaction = transaction.delete(addressId);

        // If the deleted address was the default, promote the next
        // available address belonging to the same authenticated user.
        if (wasDefault && remainingAddresses.length > 0) {
            transaction = transaction.patch(remainingAddresses[0]._id, {
                set: { Default: true },
            });
        }

        await transaction.commit();

        return NextResponse.json(
            { message: "Address deleted successfully." },
            { status: 200, headers },
        );
    } catch (error) {
        console.error("Failed to delete customer address:", error);

        return NextResponse.json(
            { error: "Unable to delete address." },
            { status: 500, headers },
        );
    }
}
