import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getMyOrders } from "@/sanity/queries";

const OrdersPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }

  const orders = await getMyOrders(userId);
  console.log(orders);
  return;
  <div>My Orders</div>;
};

export default OrdersPage;
