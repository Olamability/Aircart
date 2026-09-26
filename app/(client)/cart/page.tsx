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
} from "lucide-react";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
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
import {
  createCheckoutSession,
  type Metadata,
} from "@/actions/createCheckoutSession";
import type { ADDRESS_QUERY_RESULT } from "@/sanity.types";
import AddressDialog from "@/components/AddressDialog";

const CartPage = () => {
  const router = useRouter();

  const {
    items,
    addItem,
    removeItem,
    deleteCartProduct,
    resetCart,
    getTotalPrice,
    getSubTotalPrice,
    getItemCount,
  } = useStore();

  const [isClient, setIsClient] = useState(false);
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
    setIsClient(true);
  }, []);

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
    if (!isLoaded || !isSignedIn || !user?.id) {
      toast.error("Please sign in before checkout");
      return;
    }
    router.push("/checkout");
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
              {/* Cart Header */}
              <div className="mb-6 sm:mb-8 pb-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-shop-dark-green shadow-2xs">
                      <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                      Shopping Cart
                    </h1>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                    Review your selected items, configure quantities, and proceed to checkout.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs sm:text-sm font-medium text-slate-500 bg-white border border-slate-200/80 px-3 py-1.5 rounded-full shadow-2xs">
                    <span className="font-bold text-slate-900">{totalItemsCount}</span>{" "}
                    {totalItemsCount === 1 ? "item" : "items"}
                  </span>
                  <button
                    type="button"
                    onClick={handleResetCart}
                    className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors px-2 py-1 cursor-pointer"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              {/* Responsive 2-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                {/* Left Column: Cart Items List */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                  <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
                    {groupedItems.map(({ product }) => {
                      const itemCount = getItemCount(product?._id);
                      const isOutOfStock = (product?.stock as number) <= 0;

                      return (
                        <div
                          key={product._id}
                          className="p-4 sm:p-6 lg:p-7 flex flex-col sm:flex-row items-start sm:items-stretch justify-between gap-4 sm:gap-6 transition-colors hover:bg-slate-50/40 min-h-[140px] sm:min-h-[160px] lg:min-h-[175px]"
                        >
                          {/* Image & Product Info */}
                          <div className="flex flex-1 min-w-0 items-start gap-4 sm:gap-5 w-full sm:w-auto h-full">
                            {/* Product Image Stage */}
                            <div className="w-22 h-22 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50/90 via-slate-50/50 to-slate-100/60 p-2 sm:p-3 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs">
                              {product?.image?.[0] ? (
                                <Link
                                  href={`/product/${product?.slug?.current}`}
                                  className="w-full h-full flex items-center justify-center"
                                >
                                  <Image
                                    src={urlFor(product.image[0]).url()}
                                    alt={product.title ?? "Product image"}
                                    width={180}
                                    height={180}
                                    loading="lazy"
                                    className={`w-full h-full object-contain transition-transform duration-300 hover:scale-105 ${
                                      isOutOfStock ? "opacity-40 grayscale-[20%]" : ""
                                    }`}
                                  />
                                </Link>
                              ) : (
                                <Package className="w-10 h-10 text-slate-300 stroke-1" />
                              )}
                            </div>

                            {/* Details Column */}
                            <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5 space-y-2 h-full">
                              <div className="space-y-1.5 sm:space-y-2">
                                <Link
                                  href={`/product/${product?.slug?.current}`}
                                  className="font-bold text-sm sm:text-base lg:text-lg text-slate-900 hover:text-shop-dark-green transition-colors line-clamp-2 leading-snug"
                                >
                                  {product?.title}
                                </Link>

                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                  {product?.variant && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 font-medium text-slate-700 capitalize text-xs">
                                      {product.variant}
                                    </span>
                                  )}

                                  {product?.status && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold uppercase tracking-wider text-[10px]">
                                      {product.status}
                                    </span>
                                  )}

                                  {!isOutOfStock ? (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                      In Stock
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                                      Out of Stock
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Secondary Actions: Wishlist & Delete */}
                              <div className="pt-2 flex items-center gap-2.5">
                                <div title="Save to Wishlist">
                                  <FavoriteIcon
                                    product={product}
                                    className="static"
                                    buttonClassName="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200 bg-white hover:border-rose-200 hover:bg-rose-50/50 shadow-2xs flex items-center justify-center transition-all cursor-pointer"
                                    iconSize={15}
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    deleteCartProduct(product?._id);
                                    toast.success("Item removed from cart");
                                  }}
                                  title="Remove from Cart"
                                  aria-label="Remove item from cart"
                                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200 bg-white hover:border-rose-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Price & Quantity Controls */}
                          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 sm:self-stretch">
                            <div className="text-left sm:text-right">
                              <PriceFormat
                                amount={(product?.price as number) * itemCount}
                                className="text-base sm:text-lg lg:text-xl font-extrabold text-shop-dark-green tracking-tight"
                              />
                              {itemCount > 1 && (
                                <p className="text-xs text-slate-400 mt-0.5">
                                  <PriceFormat amount={product?.price} className="text-xs text-slate-400" /> each
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
                <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-24">
                  {/* Order Summary Card */}
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-5">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight pb-3 border-b border-slate-100">
                      Order Summary
                    </h2>

                    <div className="space-y-3 text-sm">
                      {/* Subtotal */}
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Subtotal</span>
                        <PriceFormat amount={getSubTotalPrice()} className="font-semibold text-slate-800" />
                      </div>

                      {/* Discount */}
                      {discountAmount > 0 && (
                        <div className="flex items-center justify-between text-emerald-700">
                          <span className="font-medium">Marketplace Discount</span>
                          <span className="font-bold">
                            -<PriceFormat amount={discountAmount} className="text-emerald-700 font-bold" />
                          </span>
                        </div>
                      )}

                      {/* Shipping Guarantee */}
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                        <span>Estimated Shipping</span>
                        <span className="text-emerald-700 font-medium">Free Nationwide</span>
                      </div>

                      <Separator className="my-2 bg-slate-100" />

                      {/* Total */}
                      <div className="flex items-baseline justify-between pt-1">
                        <div>
                          <span className="text-base font-bold text-slate-900">Total</span>
                          <p className="text-[11px] text-slate-400 font-normal">Taxes & fees included</p>
                        </div>
                        <PriceFormat
                          amount={getTotalPrice()}
                          className="text-xl sm:text-2xl font-black text-shop-dark-green tracking-tight"
                        />
                      </div>
                    </div>

                    {/* Checkout CTA */}
                    <Button
                      className="w-full h-12 rounded-xl bg-shop-dark-green text-white font-semibold text-sm hover:bg-shop-dark-green/90 active:scale-[0.99] transition-all duration-200 shadow-xs cursor-pointer"
                      size="lg"
                      disabled={loading}
                      onClick={handleCheckout}
                    >
                      {loading ? "Processing, please wait..." : "Proceed to Checkout"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>

                    {/* Trust Badges */}
                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Secure Checkout</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>30-Day Returns</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address Card */}
                  {addresses && (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-shop-dark-green" />
                          <h3 className="font-bold text-sm text-slate-900">
                            Delivery Address
                          </h3>
                        </div>
                        {selectedAddresses && (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                            Selected
                          </span>
                        )}
                      </div>

                      <RadioGroup
                        value={selectedAddresses?._id}
                        onValueChange={(value) => {
                          const address = addresses?.find(
                            (address) => address._id === value,
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
                                "flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all duration-200",
                                isSelected
                                  ? "border-shop-dark-green bg-emerald-50/40 ring-1 ring-shop-dark-green/20"
                                  : "border-slate-200/80 hover:border-slate-300 bg-white",
                              )}
                            >
                              <RadioGroupItem
                                value={address._id}
                                id={address._id}
                                className="mt-0.5"
                              />

                              <label
                                htmlFor={address._id}
                                className="flex-1 cursor-pointer text-xs space-y-0.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900">
                                    {address.fullName}
                                  </span>
                                  {address.label && (
                                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                                      {address.label}
                                    </span>
                                  )}
                                </div>

                                <p className="text-slate-600 leading-tight">
                                  {address.street}, {address.city}, {address.state}
                                </p>

                                <p className="text-slate-400 text-[11px]">
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
                          className="w-full h-10 rounded-xl text-xs font-semibold border-dashed border-slate-300 hover:border-shop-dark-green hover:bg-emerald-50/30 text-slate-700 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1.5" />
                          Add New Delivery Address
                        </Button>
                      </AddressDialog>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Sticky Order Summary Bar */}
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
                    onClick={handleCheckout}
                  >
                    {loading ? "Processing..." : "Checkout"}
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
        <NoAccess />
      )}
    </div>
  );
};

export default CartPage;
