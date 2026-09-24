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

const OrdersComponent = ({ orders }: { orders: MY_ORDERS_QUERY_RESULT }) => {
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
              <TableCell className="whitespace-nowrap">{index + 1}</TableCell>

              {/* Order Number */}
              <TableCell className="font-medium">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="block max-width:120px; truncate cursor-pointer sm:max-width:150px;">
                        {order?.orderNumber?.slice(-10) ?? "N/A"}...
                      </span>
                    </TooltipTrigger>

                    <TooltipContent>
                      <p className="max-width:300px; break-all">
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
              <TableCell className="max-width:150px">
                <span className="block truncate">
                  {order?.customerName ?? "N/A"}
                </span>
              </TableCell>

              {/* Email */}
              <TableCell className="hidden sm:table-cell">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="block max-width:180px truncate cursor-pointer">
                        {order?.customerEmail ?? "N/A"}
                      </span>
                    </TooltipTrigger>

                    <TooltipContent>
                      <p className="max-width:300px; break-all">
                        {order?.customerEmail ?? "N/A"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>

              {/* Total */}
              <TableCell className="whitespace-nowrap">
                <PriceFormat amount={order?.totalPrice ?? 0} />
              </TableCell>

              {/* Status */}
              <TableCell className="whitespace-nowrap">
                <span className="capitalize">
                  {order?.status?.replaceAll("_", " ") ?? "N/A"}
                </span>
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
