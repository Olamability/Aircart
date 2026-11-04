
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { client } from "@/sanity/lib/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowRight,
  ShoppingBag,
  Trash2,
  MapPin,
  ShieldCheck,
  RotateCcw,
  Package,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import useStore from "@/store";
import Container from "@/components/Container";
import PriceFormat from "@/components/PriceFormat";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import NoAccess from "@/components/NoAccess";
import EmptyCart from "@/components/EmptyCart";
import FavoriteIcon from "@/components/FavoriteIcon";
import QuantityButtons from "@/components/QuantityButtons";
import { Separator } from "@/components/ui/separator";
import type { ADDRESS_QUERY_RESULT, Product } from "@/sanity.types";
import AddressDialog from "@/components/AddressDialog";

const getValidPrice = (price: Product["price"]): number => {
  return typeof price === "number" &&
    Number.isFinite(price) &&
    price >= 0
    ? price
    : 0;
};

const getValidDiscount = (discount: Product["discount"]): number => {
  return typeof discount === "number" &&
    Number.isFinite(discount) &&
    discount >= 0
    ? Math.min(discount, 100)
    : 0;
};

const hasValidStock = (stock: Product["stock"]): boolean => {
  return (
    typeof stock === "number" &&
    Number.isFinite(stock) &&
    stock >= 0
  );
};

const CartPage = () => {
  const router = useRouter();

  const {
    deleteCartProduct,
    resetCart,
    getTotalPrice,
    getSubTotalPrice,
    getDiscountAmount,
    getItemCount,
  } = useStore();

  const [loading, setLoading] = useState(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(true);

  const groupedItems = useStore((state) => state.getGroupedItems());

  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  const [addresses, setAddresses] = useState<ADDRESS_QUERY_RESULT | null>(
    null,
  );

  const [selectedAddresses, setSelectedAddresses] = useState<
    ADDRESS_QUERY_RESULT[number] | null
  >(null);

  const fetchAddresses = async () => {
    if (!user?.id) return;

    setLoading(true);

    try {
      const query = `*[_type == "address" && clerkUserId == $userId] | order(CreatedAT desc)`;

      const data = await client.fetch(query, {
        userId: user.id,
      });

      setAddresses(data);

      const defaultAddress = data.find(
        (addr: ADDRESS_QUERY_RESULT[number]) => addr.Default === true,
      );

      if (defaultAddress) {
        setSelectedAddresses(defaultAddress);
      } else if (data.length > 0) {
        setSelectedAddresses(data[0]);
      } else {
        setSelectedAddresses(null);
      }
    } catch (error) {
      console.error("Addresses fetching error:", error);
      toast.error("Unable to load your delivery addresses.");
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

  const handleResetCart = () => {
    const confirmed = window.confirm(
      "Are you sure you want to remove all items from your cart?",
    );

    if (!confirmed) return;

    resetCart();
    toast.success("Cart cleared successfully");
  };

  const handleCheckout = () => {
    if (!isSignedIn) {
      toast.error("Please sign in before proceeding to checkout.");
      return;
    }

    if (!selectedAddresses?._id) {
      toast.error("Please select a delivery address before checkout.");
      return;
    }

    const addressExists = addresses?.some(
      (address) => address._id === selectedAddresses._id,
    );

    if (!addressExists) {
      toast.error("Please select a valid delivery address.");
      return;
    }

    router.push(
      `/checkout?addressId=${encodeURIComponent(selectedAddresses._id)}`,
    );
  };

  const totalItemsCount = groupedItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  // Original product total before discounts
  const originalSubtotal = getTotalPrice();

  // Product total after discounts
  const discountedSubtotal = getSubTotalPrice();

  // Total savings from product discounts
  const discountAmount = getDiscountAmount();

  return (
    <div className="min-h-screen bg-slate-50/50 py-6 pb-60 sm:py-8 lg:py-12 md:pb-12">
      {isSignedIn ? (
        <Container>
          {groupedItems.length ? (
            <>
              {/* Cart Header */}
              <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-5 sm:mb-8 sm:flex-row sm:items-end">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-shop-dark-green shadow-2xs">
                      <ShoppingBag className="h-5 w-5 stroke-[1.75]" />
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      Shopping Cart
                    </h1>
                  </div>

                  <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">
                    Review your selected items, configure quantities, and proceed to checkout.
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-2xs sm:text-sm">
                    <span className="font-bold text-slate-900">
                      {totalItemsCount}
                    </span>{" "}
                    {totalItemsCount === 1 ? "item" : "items"}
                  </span>

                  <button
                    type="button"
                    onClick={handleResetCart}
                    className="cursor-pointer px-2 py-1 text-xs font-semibold text-slate-500 transition-colors hover:text-rose-600"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              {/* Responsive 2-Column Grid */}
              <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
                {/* Left Column: Cart Items */}
                <div className="space-y-4 lg:col-span-7 xl:col-span-8">
                  <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                    {groupedItems.map(({ product }) => {
                      const itemCount = getItemCount(product._id);

                      const validStock = hasValidStock(product.stock);
                      const isOutOfStock =
                        !validStock || product.stock === 0;

                      const originalUnitPrice = getValidPrice(
                        product.price,
                      );

                      const discount = getValidDiscount(
                        product.discount,
                      );

                      const discountedUnitPrice =
                        originalUnitPrice *
                        (1 - discount / 100);

                      return (
                        <div
                          key={product._id}
                          className="flex min-h-[140px] flex-col items-start justify-between gap-4 p-4 transition-colors hover:bg-slate-50/40 sm:min-h-[160px] sm:flex-row sm:items-stretch sm:gap-6 sm:p-6 lg:min-h-[175px] lg:p-7"
                        >
                          {/* Image & Product Info */}
                          <div className="flex h-full w-full min-w-0 flex-1 items-start gap-4 sm:w-auto sm:gap-5">
                            <div className="flex h-22 w-22 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50/90 via-slate-50/50 to-slate-100/60 p-2 shadow-2xs sm:h-32 sm:w-32 sm:p-3 lg:h-36 lg:w-36">
                              {product.image?.[0] ? (
                                <Link
                                  href={`/product/${product.slug?.current}`}
                                  className="flex h-full w-full items-center justify-center"
                                >
                                  <Image
                                    src={urlFor(product.image[0]).url()}
                                    alt={product.title ?? "Product image"}
                                    width={180}
                                    height={180}
                                    loading="lazy"
                                    className={cn(
                                      "h-full w-full object-contain transition-transform duration-300 hover:scale-105",
                                      isOutOfStock &&
                                      "opacity-40 grayscale-[20%]",
                                    )}
                                  />
                                </Link>
                              ) : (
                                <Package className="h-10 w-10 stroke-1 text-slate-300" />
                              )}
                            </div>

                            {/* Details Column */}
                            <div className="flex h-full min-w-0 flex-1 flex-col justify-between space-y-2 py-0.5">
                              <div className="space-y-1.5 sm:space-y-2">
                                <Link
                                  href={`/product/${product.slug?.current}`}
                                  className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 transition-colors hover:text-shop-dark-green sm:text-base lg:text-lg"
                                >
                                  {product.title}
                                </Link>

                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                  {product.variant && (
                                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-700">
                                      {product.variant}
                                    </span>
                                  )}

                                  {product.status && (
                                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
                                      {product.status}
                                    </span>
                                  )}

                                  {!isOutOfStock ? (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                      In Stock
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                                      Out of Stock
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Wishlist & Delete */}
                              <div className="flex items-center gap-2.5 pt-2">
                                <div title="Save to Wishlist">
                                  <FavoriteIcon
                                    product={product}
                                    className="static"
                                    buttonClassName="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white shadow-2xs transition-all hover:border-rose-200 hover:bg-rose-50/50 sm:h-9 sm:w-9"
                                    iconSize={15}
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    deleteCartProduct(product._id);
                                    toast.success("Item removed from cart");
                                  }}
                                  title="Remove from Cart"
                                  aria-label="Remove item from cart"
                                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-2xs transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 sm:h-9 sm:w-9"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Price & Quantity Controls */}
                          <div className="flex w-full items-center justify-between gap-4 border-t border-slate-100 pt-3 sm:w-auto sm:flex-col sm:items-end sm:self-stretch sm:border-t-0 sm:pt-0">
                            <div className="text-left sm:text-right">
                              <PriceFormat
                                amount={discountedUnitPrice * itemCount}
                                className="text-base font-extrabold tracking-tight text-shop-dark-green sm:text-lg lg:text-xl"
                              />

                              {discount > 0 && (
                                <p className="mt-0.5 text-xs text-slate-400 line-through">
                                  <PriceFormat
                                    amount={originalUnitPrice * itemCount}
                                    className="text-xs text-slate-400"
                                  />
                                </p>
                              )}

                              {itemCount > 1 && (
                                <p className="mt-0.5 text-xs text-slate-400">
                                  <PriceFormat
                                    amount={discountedUnitPrice}
                                    className="text-xs text-slate-400"
                                  />{" "}
                                  each
                                </p>
                              )}
                            </div>

                            <QuantityButtons product={product} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Order Summary & Delivery Address */}
                <div className="space-y-6 lg:sticky lg:top-24 lg:col-span-5 xl:col-span-4">
                  {/* Order Summary */}
                  <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
                    <h2 className="border-b border-slate-100 pb-3 text-lg font-bold tracking-tight text-slate-900">
                      Order Summary
                    </h2>

                    <div className="space-y-3 text-sm">
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
                            -<PriceFormat
                              amount={discountAmount}
                              className="font-bold text-emerald-700"
                            />
                          </span>
                        </div>
                      )}

                      <Separator className="my-2 bg-slate-100" />

                      <div className="flex items-baseline justify-between pt-1">
                        <div>
                          <span className="text-base font-bold text-slate-900">
                            Total
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

                    <Button
                      className="h-12 w-full cursor-pointer rounded-xl bg-shop-dark-green text-sm font-semibold text-white shadow-xs transition-all duration-200 hover:bg-shop-dark-green/90 active:scale-[0.99]"
                      size="lg"
                      disabled={loading || groupedItems.length === 0}
                      onClick={handleCheckout}
                    >
                      {loading
                        ? "Loading delivery details..."
                        : "Proceed to Checkout"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span>Secure Checkout</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <RotateCcw className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span>30-Day Returns</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {addresses && (
                    <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-shop-dark-green" />
                          <h3 className="text-sm font-bold text-slate-900">
                            Delivery Address
                          </h3>
                        </div>

                        {selectedAddresses && (
                          <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                            Selected
                          </span>
                        )}
                      </div>

                      <RadioGroup
                        value={selectedAddresses?._id}
                        onValueChange={(value) => {
                          const address = addresses.find(
                            (address) => address._id === value,
                          );

                          if (address) setSelectedAddresses(address);
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
                                "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all duration-200",
                                isSelected
                                  ? "border-shop-dark-green bg-emerald-50/40 ring-1 ring-shop-dark-green/20"
                                  : "border-slate-200/80 bg-white hover:border-slate-300",
                              )}
                            >
                              <RadioGroupItem
                                value={address._id}
                                id={address._id}
                                className="mt-0.5"
                              />

                              <label
                                htmlFor={address._id}
                                className="flex-1 cursor-pointer space-y-0.5 text-xs"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900">
                                    {address.fullName}
                                  </span>

                                  {address.label && (
                                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                                      {address.label}
                                    </span>
                                  )}
                                </div>

                                <p className="leading-tight text-slate-600">
                                  {address.street}, {address.city},{" "}
                                  {address.state}
                                </p>

                                <p className="text-[11px] text-slate-400">
                                  {address.phone}
                                </p>
                              </label>
                            </div>
                          );
                        })}
                      </RadioGroup>

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
                  )}
                </div>
              </div>

              {/* Mobile Sticky Order Summary */}
              <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/90 bg-white/98 px-4 pb-4 pt-3.5 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md md:hidden">
                <div className="mx-auto w-full max-w-lg space-y-3">
                  <button
                    type="button"
                    onClick={() =>
                      setMobileSummaryOpen(!mobileSummaryOpen)
                    }
                    className="flex w-full cursor-pointer items-center justify-between text-xs text-slate-600 transition-colors hover:text-slate-900"
                  >
                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                      <span>Order Summary</span>
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
                            -<PriceFormat
                              amount={discountAmount}
                              className="font-bold text-emerald-700"
                            />
                          </span>
                        </div>
                      )}
                    </div>
                  )}

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
                      disabled={loading || groupedItems.length === 0}
                      onClick={handleCheckout}
                    >
                      {loading ? "Loading..." : "Proceed to Checkout"}
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
        <NoAccess />
      )}
    </div>
  );
};

export default CartPage;
