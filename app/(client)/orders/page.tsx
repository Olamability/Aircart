export const dynamic = "force-dynamic";
import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getMyOrders } from "@/sanity/queries";
import Container from "@/components/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import OrdersComponent from "@/components/OrdersComponent";

const OrdersPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }

  const orders = await getMyOrders(userId);

  return (
    <div>
      <Container className="py-10">
        {orders?.length ? (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="font-semibold">Order List</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-500">S/N</TableHead>
                      <TableHead className="w-28 md:w-auto text-slate-500">
                        Order Number
                      </TableHead>
                      <TableHead className="text-slate-500">Date</TableHead>
                      <TableHead className="text-slate-500">
                        Customer Name
                      </TableHead>
                      <TableHead className="hidden sm:table-cell text-slate-500">
                        Email
                      </TableHead>
                      <TableHead className="text-slate-500">Total</TableHead>
                      <TableHead className="text-slate-500">Status</TableHead>
                      <TableHead className="hidden sm:table-cell text-slate-500">
                        Invoice Number
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <OrdersComponent orders={orders} />
                </Table>
                <ScrollBar></ScrollBar>
              </ScrollArea>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <FileX className="h-24 w-24 text-slate-400 mb-4" />
            <h2 className="text-2xl font-semibold text-slate-900">
              No Orders found
            </h2>

            <p className="mt-2 text-sm text-slate-600 text-center max-w-md">
              It looks like you haven&apos;t placed any orders yet. Start
              shopping to see your orders here!
            </p>
            <Link href="/" className={buttonVariants({ className: "mt-6" })}>
              Browse Products
            </Link>
          </div>
        )}
      </Container>
    </div>
  );
};

export default OrdersPage;
