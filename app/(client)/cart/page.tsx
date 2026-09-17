"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { client } from "@/sanity/lib/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight, ShoppingBag, Trash } from "lucide-react";
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
import { Title } from "@/components/text";
import FavoriteIcon from "@/components/FavoriteIcon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import QuantityButtons from "@/components/QuantityButtons";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

      console.log("CLERK USER ID:", user.id);
      console.log("USER ADDRESSES:", data);

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

  const handleResetCart = () => {
    const confirmed = window.confirm(
      "Are you sure you want to remove all items from your cart?",
    );

    if (!confirmed) return;

    resetCart();
    toast.success("Cart cleared successfully");
  };

  const handleCheckout = async () => {
    if (!isLoaded || !isSignedIn || !user?.id) {
      toast.error("Please sign in before checkout");
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
        clerkUserId: user?.id ?? "",
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 pb-52 md:pb-10">
      {isSignedIn ? (
        <Container>
          {groupedItems?.length ? (
            <>
              <div className="flex items-center gap-2 py-5">
                <ShoppingBag className="text-darkColor" />

                <Title>Shopping Cart</Title>
              </div>

              <div className="grid lg:grid-cols-3 md:gap-8">
                <div className="lg:col-span-2 rounded-lg">
                  <div className="border bg-white rounded-md">
                    {groupedItems?.map(({ product }) => {
                      const itemCount = getItemCount(product?._id);

                      return (
                        <div
                          key={product._id}
                          className="border-b p-2.5 last:border-b-0 flex items-center justify-between gap-5"
                        >
                          <div className="flex flex-1 min-w-0 items-start gap-3">
                            {product?.image && (
                              <Link
                                href={`/product/${product?.slug?.current}`}
                                className="border p-0.5 md:p-1 md:mr-2 rounded-md overflow-hidden group"
                              >
                                <Image
                                  src={urlFor(product?.image[0]).url()}
                                  alt="productImage"
                                  width={500}
                                  height={500}
                                  loading="lazy"
                                  className="w-24 h-24 md:w-40 md:h-40 object-cover transition-transform hoverEffect"
                                />
                              </Link>
                            )}

                            <div className="min-w-0 flex-1 self-stretch py-1">
                              <div className="flex flex-col gap-0.5 md:gap-1.5">
                                <h2 className="text-sm sm:text-base font-semibold line-clamp-2">
                                  {product?.title}
                                </h2>

                                <p className="text-xs sm:text-sm capitalize">
                                  Variant:{" "}
                                  <span className="font-semibold">
                                    {product?.variant}
                                  </span>
                                </p>

                                <p className="text-xs sm:text-sm capitalize">
                                  Status:{" "}
                                  <span className="font-semibold">
                                    {product?.status}
                                  </span>
                                </p>
                              </div>

                              <div className="mt-3 flex items-center gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger className="flex items-center">
                                      <FavoriteIcon
                                        product={product}
                                        className="relative top-0 right-0"
                                      />
                                    </TooltipTrigger>

                                    <TooltipContent className="font-bold bg-shop-dark-green">
                                      Add to Favorite
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Trash
                                        onClick={() => {
                                          deleteCartProduct(product?._id);

                                          toast.success(
                                            "Product Successfully Deleted!",
                                          );
                                        }}
                                        className="w-4 h-4 md:w-5 md:h-5 mr-1 text-gray-500 hover:text-red-600 hoverEffect"
                                      />
                                    </TooltipTrigger>

                                    <TooltipContent className="font-bold bg-red-600">
                                      Delete Product
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-start justify-between h-36 md:h-44 p-0.5 md:p-1">
                            <PriceFormat
                              amount={(product?.price as number) * itemCount}
                              className="text-lg sm:text-base font-bold"
                            />

                            <QuantityButtons product={product} />
                          </div>
                        </div>
                      );
                    })}

                    <Button
                      onClick={handleResetCart}
                      className="m-5 font-semibold"
                      variant="destructive"
                    >
                      Reset Cart
                    </Button>
                  </div>
                </div>

                <div className="">
                  <div className="lg:col-span-1">
                    <div className="hidden md:inline-block w-full bg-white p-6 rounded-lg border">
                      <h2 className="text-xl font-semibold mb-4">
                        Order Sumarry
                      </h2>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>SubTotal</span>
                          <PriceFormat amount={getSubTotalPrice()} />
                        </div>

                        <div className="flex items-center justify-between">
                          <span>Discount</span>

                          <PriceFormat
                            amount={getSubTotalPrice() - getTotalPrice()}
                          />
                        </div>

                        <Separator />

                        <div>
                          <div className="flex items-center justify-between font-semibold text-lg">
                            <span>Total</span>

                            <PriceFormat
                              amount={getTotalPrice()}
                              className="text-lg font-bold text-black"
                            />
                          </div>

                          <Button
                            className="w-full rounded-full font-semibold tracking-wide hoverEffect"
                            size="lg"
                            disabled={loading}
                            onClick={handleCheckout}
                          >
                            {loading
                              ? "Processing, please wait..."
                              : "Proceed to Checkout"}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {addresses && (
                      <div className="bg-white rounded-md mt-5">
                        <Card>
                          <CardHeader>
                            <CardTitle className="font-semibold text-shop-dark-green">
                              Delievery Address
                            </CardTitle>
                          </CardHeader>

                          <CardContent>
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
                            >
                              {addresses?.map((address) => (
                                <div
                                  key={address._id}
                                  onClick={() => setSelectedAddresses(address)}
                                  className={cn(
                                    "flex items-center space-x-3 mb-4 cursor-pointer rounded-md border p-3",
                                    selectedAddresses?._id === address._id &&
                                      "border-shop-dark-green bg-shop-dark-green/5",
                                  )}
                                >
                                  <RadioGroupItem
                                    value={address._id}
                                    id={address._id}
                                  />

                                  <label
                                    htmlFor={address._id}
                                    className="flex-1 cursor-pointer"
                                  >
                                    <p className="font-semibold text-sm">
                                      {address.label}
                                    </p>

                                    <p className="font-semibold text-sm">
                                      {address.fullName}
                                    </p>

                                    <p className="text-xs text-shop-light-text">
                                      {address.street}, {address.city},{" "}
                                      {address.state}
                                    </p>

                                    <p className="text-xs text-shop-light-text">
                                      {address.phone}
                                    </p>

                                    <p className="text-xs text-shop-light-text">
                                      {address.email}
                                    </p>
                                  </label>
                                </div>
                              ))}
                            </RadioGroup>

                            <AddressDialog onSuccess={fetchAddresses}>
                              <Button variant="outline" className="w-full mt-4">
                                Add New Address
                              </Button>
                            </AddressDialog>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </div>

                {/* MOBILE STICKY ORDER SUMMARY */}
                <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white px-4 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden">
                  <div className="mx-auto w-full max-w-7xl">
                    <h2 className="mb-3 text-base font-bold text-darkColor">
                      Order Summary
                    </h2>

                    <div className="space-y-2 text-sm">
                      {/* Subtotal */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-shop-light-text">Subtotal</span>

                        <PriceFormat amount={getSubTotalPrice()} />
                      </div>

                      {/* Discount */}
                      {getSubTotalPrice() - getTotalPrice() > 0 && (
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-shop-light-text">Discount</span>

                          <PriceFormat
                            amount={getSubTotalPrice() - getTotalPrice()}
                            className="text-shop-dark-green"
                          />
                        </div>
                      )}

                      {/* Total */}
                      <div className="flex items-center justify-between gap-4 border-t border-dashed border-gray-200 pt-2">
                        <span className="font-bold text-darkColor">Total</span>

                        <PriceFormat
                          amount={getTotalPrice()}
                          className="text-base"
                        />
                      </div>
                    </div>

                    {/* Checkout */}
                    <Button
                      className="mt-3 h-10 w-full rounded-md bg-shop-dark-green font-semibold text-white hover:bg-shop-dark-green/90"
                      size="lg"
                      disabled={loading}
                      onClick={handleCheckout}
                    >
                      {loading ? "Processing, please wait..." : "Proceed to Checkout"}
                      <ArrowRight className="ml-2 h-4 w-4" />
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
