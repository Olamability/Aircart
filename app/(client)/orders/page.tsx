export const dynamic = "force-dynamic";
import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getMyOrders } from "@/sanity/queries";
import Container from "@/components/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileX } from "lucide-react";
import { Button } from "@/components/ui/button";
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
                      <TableHead className="text-gray-500/50">S/N</TableHead>
                      <TableHead className="w-25 md:w-auto text-gray-500/50">
                        Order Number
                      </TableHead>
                      <TableHead className="text-gray-500/50">Date</TableHead>
                      <TableHead className="text-gray-500/50">
                        Customer Name
                      </TableHead>
                      <TableHead className="hidden sm:table-cell text-gray-500/50">
                        Email
                      </TableHead>
                      <TableHead className="text-gray-500/50">Total</TableHead>
                      <TableHead className="text-gray-500/50">Status</TableHead>
                      <TableHead className="hidden sm:table-cell text-gray-500/50">
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
          <div className="flex flex-col items-center justify-center py-12 px-">
            <FileX className="h-24 w-24 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900">
              No Orders found
            </h2>

            <p className="mt-2 text-sm text-gray-600 text-center max-w-md">
              It looks like you haven&apos;t placced any orders yet. Start
              shopping to see your orders here!
            </p>
            <Button className="mt-6">
              <Link href="/">Browse Products</Link>
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
};

export default OrdersPage;
