import { client } from "@/sanity/lib/client";
/* ========================================================= Vendor Dashboard Types ========================================================= */ export type VendorRecentOrder =
  {
    _id: string;
    orderNumber?: string;
    customerName?: string;
    status?: string;
    paymentStatus?: string;
    createdAt?: string;
    vendorTotal?: number;
  };
export type VendorLowStockItem = {
  _id: string;
  title: string;
  stock: number;
  price?: number;
  image?: unknown[];
};
export type VendorDashboardStats = {
  totalProducts: number;
  activeProducts: number;
  lowStockCount: number;
  totalOrders: number;
  recentOrders: VendorRecentOrder[];
  lowStockItems: VendorLowStockItem[];
};
/* ========================================================= Vendor Inventory Types ========================================================= */ export type VendorInventoryCategory =
  { _id: string; title: string };
export type VendorInventoryItem = {
  _id: string;
  title: string;
  price?: number;
  stock: number;
  status?: string;
  image?: unknown[];
  categories?: VendorInventoryCategory[];
};
/* ========================================================= Vendor Order Types ========================================================= */ export type VendorOrderProduct =
  { _id: string; title: string; image?: unknown[] };
export type VendorOrderStoreItem = {
  quantity?: number;
  price?: number;
  product?: VendorOrderProduct;
};
export type VendorOrder = {
  _id: string;
  orderNumber?: string;
  customerName?: string;
  customerEmail?: string;
  status?: string;
  paymentStatus?: string;
  createdAt?: string;
  address?: unknown;
  storeItems?: VendorOrderStoreItem[];
};
/* ========================================================= Vendor Telemetry Types ========================================================= */ export type VendorTelemetryItem =
  {
    quantity?: number;
    price?: number;
    product?: { _id: string; title: string };
  };
export type VendorTelemetryOrder = {
  _id: string;
  createdAt?: string;
  status?: string;
  paymentStatus?: string;
  storeItems?: VendorTelemetryItem[];
};
export type VendorTopProduct = {
  title: string;
  count: number;
  revenue: number;
};
export type VendorTelemetry = {
  orderCount: number;
  grossRevenue: number;
  totalItemsSold: number;
  topProducts: VendorTopProduct[];
};
/* ========================================================= Vendor Ledger Types ========================================================= */ export type VendorLedgerItem =
  { quantity?: number; price?: number; product?: { title?: string } };
export type VendorLedgerOrder = {
  _id: string;
  orderNumber?: string;
  createdAt?: string;
  status?: string;
  paymentStatus?: string;
  storeItems?: VendorLedgerItem[];
};
export type VendorLedgerTransaction = {
  orderId: string;
  orderNumber?: string;
  date?: string;
  status?: string;
  gross: number;
  commission: number;
  net: number;
};
export type VendorLedger = {
  totalGross: number;
  platformCommission: number;
  netPayoutBalance: number;
  transactions: VendorLedgerTransaction[];
};
/* ========================================================= Vendor Dashboard Stats ========================================================= */ export const getVendorDashboardStats =
  async (vendorId: string): Promise<VendorDashboardStats> => {
    const groq = `{ "totalProducts": count(*[ _type == "product" && vendor._ref == $vendorId ]), "activeProducts": count(*[ _type == "product" && vendor._ref == $vendorId && ( status == "available" || status == "new" || status == "hot" ) ]), "lowStockCount": count(*[ _type == "product" && vendor._ref == $vendorId && stock <= 5 ]), "totalOrders": count(*[ _type == "order" && count(products[product->vendor._ref == $vendorId]) > 0 ]), "recentOrders": *[ _type == "order" && count(products[product->vendor._ref == $vendorId]) > 0 ] | order(createdAt desc)[0...5] { _id, orderNumber, customerName, status, paymentStatus, createdAt, "vendorTotal": math::sum( products[ product->vendor._ref == $vendorId ].price ) }, "lowStockItems": *[ _type == "product" && vendor._ref == $vendorId && stock <= 5 ] | order(stock asc)[0...5] { _id, title, stock, price, image } }`;
    try {
      const res = await client.fetch<{
        totalProducts?: number;
        activeProducts?: number;
        lowStockCount?: number;
        totalOrders?: number;
        recentOrders?: VendorRecentOrder[];
        lowStockItems?: VendorLowStockItem[];
      }>(groq, { vendorId });
      return {
        totalProducts: res.totalProducts ?? 0,
        activeProducts: res.activeProducts ?? 0,
        lowStockCount: res.lowStockCount ?? 0,
        totalOrders: res.totalOrders ?? 0,
        recentOrders: res.recentOrders ?? [],
        lowStockItems: res.lowStockItems ?? [],
      };
    } catch (error) {
      console.error("Error fetching vendor dashboard stats:", error);
      return {
        totalProducts: 0,
        activeProducts: 0,
        lowStockCount: 0,
        totalOrders: 0,
        recentOrders: [],
        lowStockItems: [],
      };
    }
  };
/* ========================================================= Vendor Inventory ========================================================= */ export const getVendorInventory =
  async (
    vendorId: string,
    options: { query?: string; stockLevel?: string } = {},
  ): Promise<VendorInventoryItem[]> => {
    const { query, stockLevel } = options;
    const filters = ['_type == "product"', "vendor._ref == $vendorId"];
    const params: Record<string, unknown> = { vendorId };
    if (query && query.trim()) {
      filters.push("title match $query");
      params.query = `*${query.trim()}*`;
    }
    if (stockLevel === "low") {
      filters.push("stock > 0 && stock <= 5");
    } else if (stockLevel === "out") {
      filters.push("stock == 0");
    } else if (stockLevel === "in") {
      filters.push("stock > 5");
    }
    const groq = `*[ ${filters.join(" && ")} ] | order(stock asc) { _id, title, price, stock, status, image, "categories": categories[]->{ _id, title } }`;
    try {
      return await client.fetch<VendorInventoryItem[]>(groq, params);
    } catch (error) {
      console.error("Error fetching vendor inventory:", error);
      return [];
    }
  };
/* ========================================================= Vendor Orders ========================================================= */ export const getVendorOrders =
  async (
    vendorId: string,
    options: { query?: string; status?: string } = {},
  ): Promise<VendorOrder[]> => {
    const { query, status } = options;
    const filters = [
      '_type == "order"',
      "count(products[product->vendor._ref == $vendorId]) > 0",
    ];
    const params: Record<string, unknown> = { vendorId };
    if (query && query.trim()) {
      filters.push("(orderNumber match $query || customerName match $query)");
      params.query = `*${query.trim()}*`;
    }
    if (status && status !== "all") {
      filters.push("status == $status");
      params.status = status;
    }
    const groq = `*[ ${filters.join(" && ")} ] | order(createdAt desc) { _id, orderNumber, customerName, customerEmail, status, paymentStatus, createdAt, address, "storeItems": products[ product->vendor._ref == $vendorId ] { quantity, price, product->{ _id, title, image } } }`;
    try {
      return await client.fetch<VendorOrder[]>(groq, params);
    } catch (error) {
      console.error("Error fetching vendor orders:", error);
      return [];
    }
  };
/* ========================================================= Vendor Telemetry ========================================================= */ export const getVendorTelemetry =
  async (vendorId: string): Promise<VendorTelemetry> => {
    const groq = `*[ _type == "order" && count(products[product->vendor._ref == $vendorId]) > 0 ] { _id, createdAt, status, paymentStatus, "storeItems": products[ product->vendor._ref == $vendorId ] { quantity, price, product->{ _id, title } } }`;
    try {
      const orders = await client.fetch<VendorTelemetryOrder[]>(groq, {
        vendorId,
      });
      let grossRevenue = 0;
      let totalItemsSold = 0;
      const productSalesMap = new Map<string, VendorTopProduct>();
      for (const order of orders) {
        if (order.paymentStatus === "paid" || order.status === "delivered") {
          for (const item of order.storeItems ?? []) {
            const quantity = item.quantity ?? 1;
            const price = item.price ?? 0;
            const itemTotal = price * quantity;
            grossRevenue += itemTotal;
            totalItemsSold += quantity;
            const productTitle = item.product?.title ?? "Product";
            const productId = item.product?._id ?? productTitle;
            if (!productSalesMap.has(productId)) {
              productSalesMap.set(productId, {
                title: productTitle,
                count: quantity,
                revenue: itemTotal,
              });
            } else {
              const existing = productSalesMap.get(productId)!;
              existing.count += quantity;
              existing.revenue += itemTotal;
            }
          }
        }
      }
      const topProducts = Array.from(productSalesMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      return {
        orderCount: orders.length,
        grossRevenue,
        totalItemsSold,
        topProducts,
      };
    } catch (error) {
      console.error("Error fetching vendor telemetry:", error);
      return {
        orderCount: 0,
        grossRevenue: 0,
        totalItemsSold: 0,
        topProducts: [],
      };
    }
  };
/* ========================================================= Vendor Ledger ========================================================= */ export const getVendorLedger =
  async (vendorId: string): Promise<VendorLedger> => {
    const groq = `*[ _type == "order" && count(products[product->vendor._ref == $vendorId]) > 0 ] | order(createdAt desc) { _id, orderNumber, createdAt, status, paymentStatus, "storeItems": products[ product->vendor._ref == $vendorId ] { quantity, price, product->{ title } } }`;
    try {
      const orders = await client.fetch<VendorLedgerOrder[]>(groq, {
        vendorId,
      });
      let totalGross = 0;
      const transactions: VendorLedgerTransaction[] = orders.map((order) => {
        const orderGross = (order.storeItems ?? []).reduce(
          (acc, item) => acc + (item.price ?? 0) * (item.quantity ?? 1),
          0,
        );
        totalGross += orderGross;
        const commission = Math.round(orderGross * 0.05);
        const net = orderGross - commission;
        return {
          orderId: order._id,
          orderNumber: order.orderNumber,
          date: order.createdAt,
          status: order.paymentStatus,
          gross: orderGross,
          commission,
          net,
        };
      });
      const platformCommission = Math.round(totalGross * 0.05);
      const netPayoutBalance = totalGross - platformCommission;
      return { totalGross, platformCommission, netPayoutBalance, transactions };
    } catch (error) {
      console.error("Error fetching vendor ledger:", error);
      return {
        totalGross: 0,
        platformCommission: 0,
        netPayoutBalance: 0,
        transactions: [],
      };
    }
  };
