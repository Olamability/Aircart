import type { MY_ORDERS_QUERY_RESULT } from "@/sanity.types";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { DialogHeader, Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import PriceFormat from "./PriceFormat";
import { urlFor } from "@/sanity/lib/image";

interface OrderDetailDialogProps {
  order: MY_ORDERS_QUERY_RESULT[number] | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!order) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="
    w-[calc(100%-1rem)]
    max-w-none
    sm:w-[calc(100%-2rem)]
    sm:max-width:560px;
    md:max-width:600px;
    lg:max-width:650px;
    xl:max-width:700px;
    max-h-[90vh]
    overflow-y-auto
    overflow-x-hidden
  "
      >
        <DialogHeader>
          <DialogTitle className="font-bold text-center">
            Order Details
            <span className="mt-2 block whitespace-nowrap text-gray-600/80 text-sm sm:text-base">
              {order.orderNumber}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Customer Information */}
        <div className="mt-4 space-y-2 text-sm sm:text-base">
          <p className="wraps-break">
            <strong>Customer:</strong> {order.customerName}
          </p>

          <p className="break-all">
            <strong>Email:</strong> {order.customerEmail}
          </p>

          <p>
            <strong>Date:</strong>{" "}
            {order.orderDate
              ? new Date(order.orderDate).toLocaleDateString()
              : "N/A"}
          </p>

          <p>
            <strong>Payment Status:</strong>{" "}
            <span className="capitalize font-medium text-green-600">
              {order.paymentStatus ?? "N/A"}
            </span>
          </p>

          <p>
            <strong>Order Status:</strong>{" "}
            <span className="capitalize font-medium">
              {order.status?.replaceAll("_", " ") ?? "N/A"}
            </span>
          </p>

          <p>
            <strong>Invoice Number:</strong> {order.invoice?.number ?? "N/A"}
          </p>

          {/* Invoice Button */}
          {order.invoice?.hosted_invoice_url && (
            <Button variant="outline" className="mt-2 w-full sm:w-auto">
              <Link
                href={order.invoice.hosted_invoice_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Invoice
              </Link>
            </Button>
          )}
        </div>

        {/* Products */}
        <div className="mt-6 w-full overflow-x-auto">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[45%]">Product</TableHead>

                <TableHead className="w-[20%] text-center">Quantity</TableHead>

                <TableHead className="w-[35%] text-right">Price</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {order.products?.map((item, index) => (
                <TableRow key={item?._key ?? index}>
                  {/* Product */}
                  <TableCell className="w-[45%]">
                    <div className="flex items-center gap-2 min-w-0">
                      {item?.product?.image?.[0] && (
                        <Image
                          src={urlFor(item.product.image[0]).url()}
                          alt={item.product.title ?? "Product image"}
                          width={50}
                          height={50}
                          className="rounded-sm border object-cover shrink-0"
                        />
                      )}

                      <span className="min-w-0 truncate">
                        {item?.product?.title ?? "Unknown Product"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Quantity */}
                  <TableCell className="w-[20%] text-center whitespace-nowrap">
                    {item?.quantity ?? 0}
                  </TableCell>

                  {/* Price */}
                  <TableCell className="w-[35%] text-right whitespace-nowrap">
                    <PriceFormat
                      amount={item?.price ?? 0}
                      className="font-medium"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Order Summary */}
        <div className="mt-4 flex justify-end text-right">
          <div className="w-44 flex flex-col gap-1">
            {order?.amountDiscount !== 0 && (
              <>
                <div className="flex w-full items-center justify-between">
                  <strong>Discount:</strong>

                  <PriceFormat
                    amount={order?.amountDiscount ?? 0}
                    className="font-bold text-black"
                  />
                </div>

                <div className="flex w-full items-center justify-between">
                  <strong>Subtotal:</strong>

                  <PriceFormat
                    amount={
                      (order?.totalPrice ?? 0) + (order?.amountDiscount ?? 0)
                    }
                    className="font-bold text-black"
                  />
                </div>
              </>
            )}

            <div className="flex w-full items-center justify-between">
              <strong>Total:</strong>

              <PriceFormat
                amount={order?.totalPrice ?? 0}
                className="font-bold text-black"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailDialog;
