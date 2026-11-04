
"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { urlFor } from "@/sanity/lib/image";
import { client } from "@/sanity/lib/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowRight,
  ShieldCheck,
  MapPin,
  ShoppingBag,
  Package,
  Plus,
  ChevronRight,
  Lock,
  Edit3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import useStore from "@/store";
import Container from "@/components/Container";
import PriceFormat from "@/components/PriceFormat";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";
import NoAccess from "@/components/NoAccess";
import EmptyCart from "@/components/EmptyCart";
import {
  createCheckoutSession,
  type Metadata,
} from "@/actions/createCheckoutSession";
import type { ADDRESS_QUERY_RESULT } from "@/sanity.types";
import AddressDialog from "@/components/AddressDialog";

const CheckoutPage = () => {
  const searchParams = useSearchParams();
  const requestedAddressId = searchParams.get("addressId");

  const getTotalPrice = useStore((state) => state.getTotalPrice);
  const getSubTotalPrice = useStore((state) => state.getSubTotalPrice);
  const getDiscountAmount = useStore((state) => state.getDiscountAmount);
  const groupedItems = useStore((state) => state.getGroupedItems());

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(true);

  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  const [addresses, setAddresses] = useState<ADDRESS_QUERY_RESULT | null>(
    null,
  );

  const [selectedAddresses, setSelectedAddresses] = useState<
    ADDRESS_QUERY_RESULT[number] | null
  >(null);

  const fetchAddresses = useCallback(async () => {
    if (!user?.id) return;

    setAddressLoading(true);

    try {
      const query = `
        *[_type == "address" && clerkUserId == $userId]
        | order(CreatedAT desc)
      `;

      const data: ADDRESS_QUERY_RESULT = await client.fetch(query, {
        userId: user.id,
      });

      setAddresses(data);

      // When Cart supplied an address ID, preserve that exact selection.
      if (requestedAddressId) {
        const requestedAddress = data.find(
          (address) => address._id === requestedAddressId,
        );

        if (requestedAddress) {
          setSelectedAddresses(requestedAddress);
        } else {
          setSelectedAddresses(null);

          toast.error(
            "Your previously selected address is unavailable. Please select another address.",
          );
        }

        return;
      }

      // Only use the default/first address when checkout was
      // opened without an address ID.
      const defaultAddress = data.find(
        (address) => address.Default === true,
      );

      setSelectedAddresses(defaultAddress ?? data[0] ?? null);
    } catch (error) {
      console.error("Address fetching error:", error);

      setAddresses(null);
      setSelectedAddresses(null);

      toast.error("Unable to load your delivery addresses.");
    } finally {
      setAddressLoading(false);
    }
  }, [user?.id, requestedAddressId]);

  useEffect(() => {
    if (isLoaded && isSignedIn && user?.id) {
      void fetchAddresses();
    }
  }, [isLoaded, isSignedIn, user?.id, fetchAddresses]);

  const handlePayment = async () => {
    if (!isLoaded || !isSignedIn || !user?.id) {
      toast.error("Please sign in before completing checkout.");
      return;
    }

    if (!groupedItems.length) {
      toast.error("Your cart is empty.");
      return;
    }

    if (addressLoading || !addresses) {
      toast.error("Please wait while your delivery address is verified.");
      return;
    }

    if (!selectedAddresses?._id) {
      toast.error("Please select a valid delivery address.");
      return;
    }

    // Confirm the selected address is still in the current
    // signed-in user's fetched address list.
    const verifiedAddress = addresses.find(
      (address) => address._id === selectedAddresses._id,
    );

    if (!verifiedAddress) {
      setSelectedAddresses(null);

      toast.error("Please select a valid delivery address.");
      return;
    }

    setPaymentLoading(true);

    try {
      const metadata: Metadata = {
        orderNumber: crypto.randomUUID(),
        customerName: user.fullName ?? "Customer",
        customerEmail:
          user.emailAddresses[0]?.emailAddress ?? "",
        addressId: verifiedAddress._id,
      };

      const checkoutUrl = await createCheckoutSession(
        groupedItems,
        metadata,
      );

      if (!checkoutUrl) {
        throw new Error("Unable to generate a payment link.");
      }

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Error creating checkout session:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create checkout session. Please try again.",
      );

      setPaymentLoading(false);
    }
  };

  const totalItemsCount = groupedItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  // Pricing contract:
  // Original subtotal = price before product discounts.
  // Discounted subtotal = amount payable for products.
  // Discount amount = actual savings.
  const originalSubtotal = getTotalPrice();
  const discountedSubtotal = getSubTotalPrice();
  const discountAmount = getDiscountAmount();

  const formatDiscountedUnitPrice = (
    price: number | undefined,
    discount: number | undefined,
  ) => {
    const safePrice =
      typeof price === "number" && Number.isFinite(price)
        ? Math.max(price, 0)
        : 0;

    const safeDiscount =
      typeof discount === "number" && Number.isFinite(discount)
        ? Math.min(Math.max(discount, 0), 100)
        : 0;

    return safePrice - (safePrice * safeDiscount) / 100;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-6 pb-60 sm:py-8 md:pb-12 lg:py-12">
      {isSignedIn ? (
        <Container>
          {groupedItems.length > 0 ? (
            <>
              {/* Breadcrumb Navigation */}
              <nav
                aria-label="Breadcrumb"
                className="mb-5 flex items-center gap-2 text-xs text-slate-500 sm:text-sm"
              >
                <Link
                  href="/"
                  className="transition-colors hover:text-shop-dark-green"
                >
                  Home
                </Link>

                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                <Link
                  href="/cart"
                  className="transition-colors hover:text-shop-dark-green"
                >
                  Cart
                </Link>

                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                <span className="font-semibold text-slate-900">
                  Checkout
                </span>
              </nav>

              {/* Checkout Header */}
              <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-5 sm:mb-8 sm:flex-row sm:items-end">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-shop-dark-green shadow-2xs">
                      <ShieldCheck className="h-5 w-5 stroke-[1.75]" />
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      Checkout
                    </h1>
                  </div>

                  <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">
                    Review your order and select your delivery destination
                    before payment.
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-2xs">
                    <Lock className="h-3.5 w-3.5" />
                    Secure Checkout
                  </span>
                </div>
              </div>

              {/* Main Checkout Layout */}
              <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
                {/* Delivery Address and Order Review */}
                <div className="space-y-6 lg:col-span-7 xl:col-span-8">
                  {/* Delivery Address */}
                  <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-shop-dark-green">
                          <MapPin className="h-4 w-4" />
                        </div>

                        <h2 className="text-base font-bold text-slate-900">
                          1. Delivery Address
                        </h2>
                      </div>

                      {selectedAddresses && (
                        <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                          Selected
                        </span>
                      )}
                    </div>

                    {addressLoading && !addresses ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-8 text-center text-xs text-slate-500">
                        Loading delivery addresses...
                      </div>
                    ) : addresses && addresses.length > 0 ? (
                      <RadioGroup
                        value={selectedAddresses?._id ?? ""}
                        onValueChange={(value) => {
                          const address = addresses.find(
                            (item) => item._id === value,
                          );

                          if (address) {
                            setSelectedAddresses(address);
                          }
                        }}
                        className="space-y-2.5"
                      >
                        {addresses.map((address) => {
                          const isSelected =
                            selectedAddresses?._id === address._id;

                          return (
                            <div
                              key={address._id}
                              onClick={() =>
                                setSelectedAddresses(address)
                              }
                              className={cn(
                                "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all duration-200",
                                isSelected
                                  ? "border-shop-dark-green bg-emerald-50/40 ring-1 ring-shop-dark-green/20"
                                  : "border-slate-200/80 bg-white hover:border-slate-300",
                              )}
                            >
                              <RadioGroupItem
                                value={address._id}
                                id={`checkout-${address._id}`}
                                className="mt-0.5"
                              />

                              <label
                                htmlFor={`checkout-${address._id}`}
                                className="flex-1 cursor-pointer space-y-1 text-xs"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-bold text-slate-900">
                                    {address.fullName}
                                  </span>

                                  {address.label && (
                                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                                      {address.label}
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs leading-relaxed text-slate-600">
                                  {address.street}, {address.city},{" "}
                                  {address.state}
                                </p>

                                <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[11px] text-slate-400">
                                  {address.phone && (
                                    <span>Tel: {address.phone}</span>
                                  )}

                                  {address.email && (
                                    <span>• {address.email}</span>
                                  )}
                                </div>
                              </label>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 py-6 text-center text-xs text-slate-500">
                        <MapPin className="mx-auto mb-2 h-8 w-8 text-slate-300" />

                        <p className="font-medium text-slate-700">
                          No delivery address found
                        </p>

                        <p className="mt-0.5">
                          Please add a shipping address to proceed with
                          order delivery.
                        </p>
                      </div>
                    )}

                    <AddressDialog onSuccess={fetchAddresses}>
                      <Button
                        variant="outline"
                        className="h-10 w-full cursor-pointer rounded-xl border-dashed border-slate-300 text-xs font-semibold text-slate-700 hover:border-shop-dark-green hover:bg-emerald-50/30"
                      >
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Add New Delivery Address
                      </Button>
                    </AddressDialog>
                  </div>

                  {/* Order Review */}
                  <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-shop-dark-green">
                          <ShoppingBag className="h-4 w-4" />
                        </div>

                        <h2 className="text-base font-bold text-slate-900">
                          2. Order Review
                        </h2>

                        <span className="text-xs font-medium text-slate-500">
                          ({totalItemsCount}{" "}
                          {totalItemsCount === 1 ? "item" : "items"})
                        </span>
                      </div>

                      <Link
                        href="/cart"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-shop-dark-green underline-offset-2 hover:underline"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit Cart</span>
                      </Link>
                    </div>

                    {/* Product Rows */}
                    <div className="divide-y divide-slate-100">
                      {groupedItems.map(({ product, quantity }) => {
                        const originalUnitPrice =
                          typeof product.price === "number"
                            ? product.price
                            : 0;

                        const discountedUnitPrice =
                          formatDiscountedUnitPrice(
                            product.price,
                            product.discount,
                          );

                        const hasDiscount =
                          discountedUnitPrice < originalUnitPrice;

                        return (
                          <div
                            key={product._id}
                            className="flex items-center justify-between gap-3 py-3 sm:py-3.5"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              {/* Product Thumbnail */}
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-b from-slate-50/90 to-slate-100/50 p-1 shadow-2xs sm:h-16 sm:w-16">
                                {product?.image?.[0] ? (
                                  <Image
                                    src={urlFor(product.image[0]).url()}
                                    alt={product.title ?? "Product image"}
                                    width={70}
                                    height={70}
                                    className="h-full w-full object-contain"
                                  />
                                ) : (
                                  <Package className="h-6 w-6 stroke-1 text-slate-300" />
                                )}
                              </div>

                              {/* Product Details */}
                              <div className="min-w-0 space-y-1">
                                <Link
                                  href={`/product/${product?.slug?.current}`}
                                  className="line-clamp-1 text-xs font-semibold text-slate-900 transition-colors hover:text-shop-dark-green sm:text-sm"
                                >
                                  {product?.title}
                                </Link>

                                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-700">
                                    Qty: {quantity}
                                  </span>

                                  {product?.variant && (
                                    <span className="capitalize text-slate-600">
                                      {product.variant}
                                    </span>
                                  )}

                                  {product?.status && (
                                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
                                      {product.status}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Discounted Line Total */}
                            <div className="shrink-0 text-right">
                              <PriceFormat
                                amount={discountedUnitPrice * quantity}
                                className="text-sm font-bold text-shop-dark-green sm:text-base"
                              />

                              {hasDiscount && (
                                <PriceFormat
                                  amount={originalUnitPrice * quantity}
                                  className="text-[11px] text-slate-400 line-through"
                                />
                              )}

                              {quantity > 1 && (
                                <p className="text-[11px] text-slate-400">
                                  <PriceFormat
                                    amount={discountedUnitPrice}
                                    className="text-[11px] text-slate-400"
                                  />{" "}
                                  each
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="space-y-6 lg:sticky lg:top-24 lg:col-span-5 xl:col-span-4">
                  <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
                    <h2 className="border-b border-slate-100 pb-3 text-lg font-bold tracking-tight text-slate-900">
                      Payment Summary
                    </h2>

                    <div className="space-y-3 text-sm">
                      {/* Original Subtotal */}
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Original Subtotal</span>

                        <PriceFormat
                          amount={originalSubtotal}
                          className="font-semibold text-slate-800"
                        />
                      </div>

                      {/* Product Discounts */}
                      {discountAmount > 0 && (
                        <div className="flex items-center justify-between text-emerald-700">
                          <span className="font-medium">
                            Product Discounts
                          </span>

                          <span className="font-bold">
                            -
                            <PriceFormat
                              amount={discountAmount}
                              className="font-bold text-emerald-700"
                            />
                          </span>
                        </div>
                      )}

                      <Separator className="my-2 bg-slate-100" />

                      {/* Total Payable */}
                      <div className="flex items-baseline justify-between pt-1">
                        <div>
                          <span className="text-base font-bold text-slate-900">
                            Total Payable
                          </span>

                          <p className="text-[11px] font-normal text-slate-400">
                            Before delivery charges
                          </p>
                        </div>

                        <PriceFormat
                          amount={discountedSubtotal}
                          className="text-xl font-black tracking-tight text-shop-dark-green sm:text-2xl"
                        />
                      </div>
                    </div>

                    {/* Payment CTA */}
                    <Button
                      className="h-12 w-full cursor-pointer rounded-xl bg-shop-dark-green text-sm font-semibold text-white shadow-xs transition-all duration-200 hover:bg-shop-dark-green/90 active:scale-[0.99] sm:text-base"
                      size="lg"
                      disabled={
                        paymentLoading ||
                        addressLoading ||
                        !selectedAddresses
                      }
                      onClick={handlePayment}
                    >
                      {paymentLoading
                        ? "Connecting..."
                        : "Proceed to Payment"}

                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>

                    {/* Payment Information */}
                    <div className="space-y-2 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />

                        <span>
                          Payment is processed securely through Stripe.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Sticky Payment Summary */}
              <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/90 bg-white/98 px-4 pb-4 pt-3.5 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md md:hidden">
                <div className="mx-auto w-full max-w-lg space-y-3">
                  {/* Collapsible Summary Header */}
                  <button
                    type="button"
                    onClick={() =>
                      setMobileSummaryOpen((current) => !current)
                    }
                    aria-expanded={mobileSummaryOpen}
                    className="flex w-full cursor-pointer items-center justify-between text-xs text-slate-600 transition-colors hover:text-slate-900"
                  >
                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                      <span>Payment Summary</span>

                      <span className="text-xs font-normal text-slate-500">
                        ({totalItemsCount}{" "}
                        {totalItemsCount === 1 ? "item" : "items"})
                      </span>
                    </div>

                    <div className="flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-shop-dark-green">
                      <span>
                        {mobileSummaryOpen
                          ? "Hide breakdown"
                          : "View breakdown"}
                      </span>

                      {mobileSummaryOpen ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronUp className="h-3.5 w-3.5" />
                      )}
                    </div>
                  </button>

                  {/* Mobile Breakdown */}
                  {mobileSummaryOpen && (
                    <div className="animate-in space-y-2 border-t border-slate-100 pt-2 text-xs duration-200 fade-in-50">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Original Subtotal</span>

                        <PriceFormat
                          amount={originalSubtotal}
                          className="font-semibold text-slate-800"
                        />
                      </div>

                      {discountAmount > 0 && (
                        <div className="flex items-center justify-between text-emerald-700">
                          <span className="font-medium">
                            Product Discounts
                          </span>

                          <span className="font-bold">
                            -
                            <PriceFormat
                              amount={discountAmount}
                              className="font-bold text-emerald-700"
                            />
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mobile Total and CTA */}
                  <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-2">
                    <div>
                      <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-400">
                        Total Payable
                      </span>

                      <PriceFormat
                        amount={discountedSubtotal}
                        className="text-lg font-black tracking-tight text-shop-dark-green"
                      />
                    </div>

                    <Button
                      className="h-11 max-w-[200px] flex-1 cursor-pointer rounded-xl bg-shop-dark-green px-5 text-sm font-semibold text-white shadow-xs hover:bg-shop-dark-green/90"
                      disabled={
                        paymentLoading ||
                        addressLoading ||
                        !selectedAddresses
                      }
                      onClick={handlePayment}
                    >
                      {paymentLoading
                        ? "Connecting..."
                        : "Proceed to Payment"}

                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <EmptyCart />
          )}
        </Container>
      ) : (
        <NoAccess details="Please sign in to review your order and complete checkout." />
      )}
    </div>
  );
};

export default CheckoutPage;
