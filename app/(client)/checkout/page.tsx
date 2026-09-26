"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { urlFor } from "@/sanity/lib/image";
import { client } from "@/sanity/lib/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowRight,
  ShieldCheck,
  MapPin,
  ShoppingBag,
  RotateCcw,
  Package,
  Plus,
  ChevronRight,
  Lock,
  Edit3,
} from "lucide-react";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
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
  const router = useRouter();

  const {
    items,
    getTotalPrice,
    getSubTotalPrice,
    getItemCount,
  } = useStore();

  const [loading, setLoading] = useState(false);
  const groupedItems = useStore((state) => state.getGroupedItems());

  const { isLoaded, isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const { user } = useUser();

  const [addresses, setAddresses] = useState<ADDRESS_QUERY_RESULT | null>(null);
  const [selectedAddresses, setSelectedAddresses] = useState<
    ADDRESS_QUERY_RESULT[number] | null
  >(null);

  const fetchAddresses = async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const query = `*[_type == "address" && clerkUserId == $userId ] | order(CreatedAT desc)`;
      const data = await client.fetch(query, { userId: user?.id });

      setAddresses(data);

      const defaultAddress = data.find(
        (addr: ADDRESS_QUERY_RESULT[number]) => addr.Default === true,
      );

      if (defaultAddress) {
        setSelectedAddresses(defaultAddress);
      } else if (data.length > 0) {
        setSelectedAddresses(data[0]);
      }
    } catch (error) {
      console.log("Addresses fetching error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn && user?.id) {
      const timeoutId = window.setTimeout(() => {
        void fetchAddresses();
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [isLoaded, isSignedIn, user?.id]);

  const handlePayment = async () => {
    if (!isLoaded || !isSignedIn || !user?.id) {
      toast.error("Please sign in before completing checkout");
      return;
    }
    if (!selectedAddresses) {
      toast.error("Please select a delivery address");
      return;
    }
    setLoading(true);
    try {
      const metadata: Metadata = {
        orderNumber: crypto.randomUUID(),
        customerName: user?.fullName ?? "Unknown",
        customerEmail: user?.emailAddresses[0]?.emailAddress ?? "Unknown",
        address: selectedAddresses
          ? {
            label: selectedAddresses.label ?? "",
            name: selectedAddresses.fullName ?? "",
            address: selectedAddresses.street ?? "",
            city: selectedAddresses.city ?? "",
            state: selectedAddresses.state ?? "",
            zip: selectedAddresses.zip ?? "",
          }
          : null,
      };
      const checkoutUrl = await createCheckoutSession(groupedItems, metadata);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create checkout session. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const totalItemsCount = groupedItems?.reduce(
    (acc, item) => acc + (item.quantity || 1),
    0,
  );
  const discountAmount = getSubTotalPrice() - getTotalPrice();

  return (
    <div className="bg-slate-50/50 min-h-screen py-6 sm:py-8 lg:py-12 pb-36 md:pb-12">
      {isSignedIn ? (
        <Container>
          {groupedItems?.length ? (
            <>
              {/* Breadcrumb Navigation */}
              <nav
                aria-label="Breadcrumb"
                className="mb-5 flex items-center gap-2 text-xs sm:text-sm text-slate-500"
              >
                <Link
                  href="/"
                  className="hover:text-shop-dark-green transition-colors"
                >
                  Home
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <Link
                  href="/cart"
                  className="hover:text-shop-dark-green transition-colors"
                >
                  Cart
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-900 font-semibold">Checkout</span>
              </nav>

              {/* Checkout Header */}
              <div className="mb-6 sm:mb-8 pb-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-shop-dark-green shadow-2xs">
                      <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                      Checkout
                    </h1>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                    Review your order and select your delivery destination before payment.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-full shadow-2xs">
                    <Lock className="w-3.5 h-3.5" />
                    Secure Encrypted Checkout
                  </span>
                </div>
              </div>

              {/* 2-Column Responsive Checkout Architecture */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                {/* Left Column: Delivery Address & Order Review */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                  {/* 1. Delivery Address Card */}
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-shop-dark-green">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <h2 className="font-bold text-base text-slate-900">
                          1. Delivery Address
                        </h2>
                      </div>

                      {selectedAddresses && (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                          Selected
                        </span>
                      )}
                    </div>

                    {addresses && addresses.length > 0 ? (
                      <RadioGroup
                        value={selectedAddresses?._id}
                        onValueChange={(value) => {
                          const address = addresses.find(
                            (a) => a._id === value,
                          );
                          if (address) {
                            setSelectedAddresses(address);
                          }
                        }}
                        className="space-y-2.5"
                      >
                        {addresses.map((address) => {
                          const isSelected = selectedAddresses?._id === address._id;
                          return (
                            <div
                              key={address._id}
                              onClick={() => setSelectedAddresses(address)}
                              className={cn(
                                "flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-all duration-200",
                                isSelected
                                  ? "border-shop-dark-green bg-emerald-50/40 ring-1 ring-shop-dark-green/20"
                                  : "border-slate-200/80 hover:border-slate-300 bg-white",
                              )}
                            >
                              <RadioGroupItem
                                value={address._id}
                                id={`checkout-${address._id}`}
                                className="mt-0.5"
                              />

                              <label
                                htmlFor={`checkout-${address._id}`}
                                className="flex-1 cursor-pointer text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-sm text-slate-900">
                                    {address.fullName}
                                  </span>
                                  {address.label && (
                                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase">
                                      {address.label}
                                    </span>
                                  )}
                                </div>

                                <p className="text-slate-600 text-xs leading-relaxed">
                                  {address.street}, {address.city},{" "}
                                  {address.state}
                                </p>

                                <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[11px] pt-0.5">
                                  {address.phone && <span>Tel: {address.phone}</span>}
                                  {address.email && <span>• {address.email}</span>}
                                </div>
                              </label>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 p-4">
                        <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-medium text-slate-700">No delivery address found</p>
                        <p className="mt-0.5">Please add a shipping address to proceed with order delivery.</p>
                      </div>
                    )}

                    <AddressDialog onSuccess={fetchAddresses}>
                      <Button
                        variant="outline"
                        className="w-full h-10 rounded-xl text-xs font-semibold border-dashed border-slate-300 hover:border-shop-dark-green hover:bg-emerald-50/30 text-slate-700 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Add New Delivery Address
                      </Button>
                    </AddressDialog>
                  </div>

                  {/* 2. Compact Order Review Card */}
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-shop-dark-green">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <h2 className="font-bold text-base text-slate-900">
                          2. Order Review
                        </h2>
                        <span className="text-xs font-medium text-slate-500">
                          ({totalItemsCount} {totalItemsCount === 1 ? "item" : "items"})
                        </span>
                      </div>

                      <Link
                        href="/cart"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-shop-dark-green hover:underline decoration-1 underline-offset-2"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Cart</span>
                      </Link>
                    </div>

                    {/* Compact Item Rows */}
                    <div className="divide-y divide-slate-100">
                      {groupedItems.map(({ product, quantity }) => {
                        return (
                          <div
                            key={product._id}
                            className="py-3 sm:py-3.5 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Product Thumbnail */}
                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-slate-200/80 bg-gradient-to-b from-slate-50/90 to-slate-100/50 p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs">
                                {product?.image?.[0] ? (
                                  <Image
                                    src={urlFor(product.image[0]).url()}
                                    alt={product.title ?? "Product image"}
                                    width={70}
                                    height={70}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <Package className="w-6 h-6 text-slate-300 stroke-1" />
                                )}
                              </div>

                              {/* Title & Metadata */}
                              <div className="min-w-0 space-y-1">
                                <Link
                                  href={`/product/${product?.slug?.current}`}
                                  className="font-semibold text-xs sm:text-sm text-slate-900 hover:text-shop-dark-green transition-colors line-clamp-1"
                                >
                                  {product?.title}
                                </Link>

                                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                                  <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                                    Qty: {quantity}
                                  </span>

                                  {product?.variant && (
                                    <span className="capitalize text-slate-600">
                                      {product.variant}
                                    </span>
                                  )}

                                  {product?.status && (
                                    <span className="uppercase text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded">
                                      {product.status}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Line Subtotal */}
                            <div className="text-right shrink-0">
                              <PriceFormat
                                amount={(product?.price as number) * quantity}
                                className="text-sm sm:text-base font-bold text-shop-dark-green"
                              />
                              {quantity > 1 && (
                                <p className="text-[11px] text-slate-400">
                                  <PriceFormat amount={product?.price} className="text-[11px] text-slate-400" /> each
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Sticky Order & Payment Summary */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-24">
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-5">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight pb-3 border-b border-slate-100">
                      Payment Summary
                    </h2>

                    <div className="space-y-3 text-sm">
                      {/* Subtotal */}
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Items Subtotal</span>
                        <PriceFormat
                          amount={getSubTotalPrice()}
                          className="font-semibold text-slate-800"
                        />
                      </div>

                      {/* Discount */}
                      {discountAmount > 0 && (
                        <div className="flex items-center justify-between text-emerald-700">
                          <span className="font-medium">Marketplace Savings</span>
                          <span className="font-bold">
                            -<PriceFormat
                              amount={discountAmount}
                              className="text-emerald-700 font-bold"
                            />
                          </span>
                        </div>
                      )}

                      {/* Delivery note */}
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                        <span>Delivery</span>
                        <span className="text-emerald-700 font-semibold">Free Express</span>
                      </div>

                      <Separator className="my-2 bg-slate-100" />

                      {/* Total */}
                      <div className="flex items-baseline justify-between pt-1">
                        <div>
                          <span className="text-base font-bold text-slate-900">Total Payable</span>
                          <p className="text-[11px] text-slate-400 font-normal">All taxes included</p>
                        </div>
                        <PriceFormat
                          amount={getTotalPrice()}
                          className="text-xl sm:text-2xl font-black text-shop-dark-green tracking-tight"
                        />
                      </div>
                    </div>

                    {/* Primary Payment CTA Button */}
                    <Button
                      className="w-full h-12 rounded-xl bg-shop-dark-green text-white font-semibold text-sm sm:text-base hover:bg-shop-dark-green/90 active:scale-[0.99] transition-all duration-200 shadow-xs cursor-pointer"
                      size="lg"
                      disabled={loading}
                      onClick={handlePayment}
                    >
                      {loading ? "Please wait..." : "Proceed to Payment"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>

                    {/* Trust / Security Reassurance */}
                    <div className="pt-2 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>256-bit SSL encrypted Stripe payment processing</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>30-day marketplace return guarantee</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Sticky Payment CTA Bar */}
              <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/90 bg-white/95 backdrop-blur-md px-4 py-3.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden">
                <div className="mx-auto w-full max-w-lg flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                      Total ({totalItemsCount} {totalItemsCount === 1 ? "item" : "items"})
                    </span>
                    <PriceFormat
                      amount={getTotalPrice()}
                      className="text-lg font-black text-shop-dark-green tracking-tight"
                    />
                  </div>

                  <Button
                    className="h-11 px-6 rounded-xl bg-shop-dark-green font-semibold text-sm text-white hover:bg-shop-dark-green/90 shadow-xs cursor-pointer"
                    disabled={loading}
                    onClick={handlePayment}
                  >
                    {loading ? "Connecting..." : "Proceed to Payment"}
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
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
