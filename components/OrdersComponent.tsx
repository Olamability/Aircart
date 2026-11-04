
"use client";

import { useState } from "react";
import type { MY_ORDERS_QUERY_RESULT } from "@/sanity.types";
import { TableBody, TableCell, TableRow } from "./ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import PriceFormat from "./PriceFormat";
import { format } from "date-fns";
import OrderDetailDialog from "./OrderDetailDialog";
import StatusBadge from "./dashboard/StatusBadge";

const OrdersComponent = ({
  orders,
}: {
  orders: MY_ORDERS_QUERY_RESULT;
}) => {
  const [selectedOrder, setSelectedOrder] = useState<
    MY_ORDERS_QUERY_RESULT[number] | null
  >(null);

  return (
    <>
      <TableBody>
        {orders.map((order, index) => {
          return (
            <TableRow
              key={order?._id}
              onClick={() => setSelectedOrder(order)}
              className="cursor-pointer"
            >
              {/* S/N */}
              <TableCell className="whitespace-nowrap">
                {index + 1}
              </TableCell>

              {/* Order Number */}
              <TableCell className="font-medium">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="block max-w-[120px] sm:max-w-[150px] truncate cursor-pointer">
                        {order?.orderNumber?.slice(-10) ?? "N/A"}...
                      </span>
                    </TooltipTrigger>

                    <TooltipContent>
                      <p className="max-w-[300px] break-all">
                        {order?.orderNumber ?? "N/A"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>

              {/* Date */}
              <TableCell className="whitespace-nowrap">
                {order?.orderDate
                  ? format(new Date(order.orderDate), "dd/MM/yyyy")
                  : "N/A"}
              </TableCell>

              {/* Customer */}
              <TableCell className="max-w-[150px]">
                <span className="block truncate">
                  {order?.customerName ?? "N/A"}
                </span>
              </TableCell>

              {/* Email */}
              <TableCell className="hidden sm:table-cell">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="block max-w-[180px] truncate cursor-pointer">
                        {order?.customerEmail ?? "N/A"}
                      </span>
                    </TooltipTrigger>

                    <TooltipContent>
                      <p className="max-w-[300px] break-all">
                        {order?.customerEmail ?? "N/A"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>

              {/* Product Names and Quantities */}
              <TableCell className="min-w-[180px] max-w-[260px]">
                <div className="flex flex-col gap-1">
                  {order?.products?.length ? (
                    order.products.map((item, productIndex) => (
                      <div
                        key={item?._key ?? `${order._id}-${productIndex}`}
                        className="text-sm"
                      >
                        <span className="font-medium">
                          {item?.product?.title ?? "Product unavailable"}
                        </span>

                        <span className="ml-1 text-slate-500 whitespace-nowrap">
                          × {item?.quantity ?? 0}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-400">
                      No products found
                    </span>
                  )}
                </div>
              </TableCell>

              {/* Total */}
              <TableCell className="whitespace-nowrap">
                <PriceFormat amount={order?.totalPrice ?? 0} />
              </TableCell>

              {/* Status */}
              <TableCell className="whitespace-nowrap">
                {order?.status ? (
                  <StatusBadge status={order.status} />
                ) : (
                  <span className="text-slate-400">N/A</span>
                )}
              </TableCell>

              {/* Invoice Number */}
              <TableCell className="hidden sm:table-cell">
                <span className="whitespace-nowrap">
                  {order?.invoice?.number ?? "N/A"}
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>

      {/* Order Details Dialog */}
      <OrderDetailDialog
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
};

export default OrdersComponent;
