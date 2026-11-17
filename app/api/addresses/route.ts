
import { NextRequest, NextResponse } from "next/server";

import { authenticateMobileRequest } from "@/lib/mobileAuth";
import { getCorsHeaders } from "@/lib/cors";
import { backendClient } from "@/sanity/lib/backendClient";

const ADDRESSES_QUERY = `*[
  _type == "address" &&
  clerkUserId == $userId
] | order(Default desc, CreatedAT desc) {
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
}`;

const ZIP_REGEX = /^(\d{5,6})(-\d{4})?$/;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALID_LABELS = ["home", "office", "other"] as const;

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

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
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
        return { error: "Full name must be between 2 and 50 characters." };
    }

    if (!phone || phone.length < 7) {
        return { error: "Please provide a valid phone number." };
    }

    if (email && !EMAIL_REGEX.test(email)) {
        return { error: "Please provide a valid email address." };
    }

    if (street.length < 5 || street.length > 100) {
        return { error: "Street address must be between 5 and 100 characters." };
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
            Default: value.Default === true,
        },
    };
}

export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 204,
        headers: getCorsHeaders(request),
    });
}

export async function GET(request: NextRequest) {
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

        const addresses = await backendClient.fetch(
            ADDRESSES_QUERY,
            { userId: authenticatedUser.userId },
        );

        return NextResponse.json(
            { addresses },
            { status: 200, headers },
        );
    } catch (error) {
        console.error("Failed to retrieve customer addresses:", error);

        return NextResponse.json(
            { error: "Unable to retrieve addresses." },
            { status: 500, headers },
        );
    }
}

export async function POST(request: NextRequest) {
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

        let body: unknown;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid request body." },
                { status: 400, headers },
            );
        }

        const validation = validateAddressPayload(body);

        if ("error" in validation) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400, headers },
            );
        }

        const userId = authenticatedUser.userId;
        const data = validation.data;

        const existingAddresses = await backendClient.fetch<
            Array<{ _id: string }>
        >(
            `*[
        _type == "address" &&
        clerkUserId == $userId
      ]{ _id }`,
            { userId },
        );

        const shouldBeDefault =
            existingAddresses.length === 0 || data.Default === true;

        const newAddress = {
            _type: "address" as const,
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
        };

        let transaction = backendClient.transaction();

        if (shouldBeDefault) {
            for (const address of existingAddresses) {
                transaction = transaction.patch(address._id, {
                    set: { Default: false },
                });
            }
        }

        transaction = transaction.create(newAddress);

        const result = await transaction.commit();

        const createdAddress = result.results.find(
            (item) => item.operation === "create",
        );

        if (!createdAddress) {
            throw new Error("Address creation could not be confirmed.");
        }

        const savedAddress = await backendClient.fetch(
            `*[_type == "address" && _id == $addressId][0]{
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
            { addressId: createdAddress.id },
        );

        return NextResponse.json(
            {
                message: "Address added successfully.",
                address: savedAddress,
            },
            { status: 201, headers },
        );
    } catch (error) {
        console.error("Failed to create customer address:", error);

        return NextResponse.json(
            { error: "Unable to save address." },
            { status: 500, headers },
        );
    }
}
