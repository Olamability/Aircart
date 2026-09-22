import { client } from "@/sanity/lib/client";

export const getVendorDashboardStats = async (vendorId: string) => {
  const groq = `{
    "totalProducts": count(*[_type == "product" && vendor._ref == $vendorId]),
    "activeProducts": count(*[_type == "product" && vendor._ref == $vendorId && (status == "available" || status == "new" || status == "hot")]),
    "lowStockCount": count(*[_type == "product" && vendor._ref == $vendorId && stock <= 5]),
    "totalOrders": count(*[_type == "order" && count(products[product->vendor._ref == $vendorId]) > 0]),
    "recentOrders": *[_type == "order" && count(products[product->vendor._ref == $vendorId]) > 0] | order(createdAt desc)[0...5] {
      _id,
      orderNumber,
      customerName,
      status,
      paymentStatus,
      createdAt,
      "vendorTotal": math::sum(products[product->vendor._ref == $vendorId].price)
    },
    "lowStockItems": *[_type == "product" && vendor._ref == $vendorId && stock <= 5] | order(stock asc)[0...5] {
      _id,
      title,
      stock,
      price,
      image
    }
  }`;

  try {
    const res = await client.fetch(groq, { vendorId });
    return {
      totalProducts: res.totalProducts || 0,
      activeProducts: res.activeProducts || 0,
      lowStockCount: res.lowStockCount || 0,
      totalOrders: res.totalOrders || 0,
      recentOrders: res.recentOrders || [],
      lowStockItems: res.lowStockItems || [],
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

export const getVendorInventory = async (
  vendorId: string,
  options: { query?: string; stockLevel?: string } = {}
) => {
  const { query, stockLevel } = options;
  const filters = ['_type == "product"', 'vendor._ref == $vendorId'];
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

  const groq = `*[${filters.join(" && ")}] | order(stock asc) {
    _id,
    title,
    price,
    stock,
    status,
    image,
    "categories": categories[]->{ _id, title }
  }`;

  try {
    return await client.fetch(groq, params);
  } catch (error) {
    console.error("Error fetching vendor inventory:", error);
    return [];
  }
};

export const getVendorOrders = async (
  vendorId: string,
  options: { query?: string; status?: string } = {}
) => {
  const { query, status } = options;
  const filters = [
    '_type == "order"',
    'count(products[product->vendor._ref == $vendorId]) > 0',
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

  const groq = `*[${filters.join(" && ")}] | order(createdAt desc) {
    _id,
    orderNumber,
    customerName,
    customerEmail,
    status,
    paymentStatus,
    createdAt,
    address,
    "storeItems": products[product->vendor._ref == $vendorId] {
      quantity,
      price,
      product->{
        _id,
        title,
        image
      }
    }
  }`;

  try {
    return await client.fetch(groq, params);
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    return [];
  }
};

export const getVendorTelemetry = async (vendorId: string) => {
  const groq = `*[_type == "order" && count(products[product->vendor._ref == $vendorId]) > 0] {
    _id,
    createdAt,
    status,
    paymentStatus,
    "storeItems": products[product->vendor._ref == $vendorId] {
      quantity,
      price,
      product->{ _id, title }
    }
  }`;

  try {
    const orders = await client.fetch(groq, { vendorId });

    let grossRevenue = 0;
    let totalItemsSold = 0;
    const productSalesMap = new Map<string, { title: string; count: number; revenue: number }>();

    for (const order of orders) {
      if (order.paymentStatus === "paid" || order.status === "delivered") {
        for (const item of order.storeItems || []) {
          const itemTotal = (item.price || 0) * (item.quantity || 1);
          grossRevenue += itemTotal;
          totalItemsSold += item.quantity || 1;

          const pTitle = item.product?.title || "Product";
          const pId = item.product?._id || pTitle;

          if (!productSalesMap.has(pId)) {
            productSalesMap.set(pId, { title: pTitle, count: item.quantity || 1, revenue: itemTotal });
          } else {
            const ex = productSalesMap.get(pId)!;
            ex.count += item.quantity || 1;
            ex.revenue += itemTotal;
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

export const getVendorLedger = async (vendorId: string) => {
  const groq = `*[_type == "order" && count(products[product->vendor._ref == $vendorId]) > 0] | order(createdAt desc) {
    _id,
    orderNumber,
    createdAt,
    status,
    paymentStatus,
    "storeItems": products[product->vendor._ref == $vendorId] {
      quantity,
      price,
      product->{ title }
    }
  }`;

  try {
    const orders = await client.fetch(groq, { vendorId });

    let totalGross = 0;
    const transactions = orders.map((order: any) => {
      const orderGross = (order.storeItems || []).reduce(
        (acc: number, item: any) => acc + (item.price || 0) * (item.quantity || 1),
        0
      );
      totalGross += orderGross;
      const commission = Math.round(orderGross * 0.05); // 5% marketplace commission
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

    return {
      totalGross,
      platformCommission,
      netPayoutBalance,
      transactions,
    };
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
