import { client } from "@/sanity/lib/client";

export interface AdminDashboardStats {
  totalProducts: number;
  activeVendors: number;
  pendingApprovals: number;
  totalOrders: number;
  totalCustomers: number;
  lowStockCount: number;
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    customerName: string;
    totalPrice: number;
    currency: string;
    status: string;
    paymentStatus: string;
    orderDate: string;
  }>;
  recentProducts: Array<{
    _id: string;
    title: string;
    price: number;
    stock: number;
    status?: string;
    vendorName?: string;
    createdAt: string;
  }>;
  recentVendors: Array<{
    _id: string;
    businessName: string;
    email: string;
    status: string;
    createdAt: string;
  }>;
}

export const getAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  const query = `{
    "totalProducts": count(*[_type == "product"]),
    "activeVendors": count(*[_type == "vendor" && status == "approved"]),
    "pendingApprovals": count(*[_type == "vendor" && (status == "pending" || !defined(status))]),
    "totalOrders": count(*[_type == "order"]),
    "lowStockCount": count(*[_type == "product" && stock <= 5]),
    "recentOrders": *[_type == "order"] | order(createdAt desc)[0...5] {
      _id,
      orderNumber,
      customerName,
      totalPrice,
      currency,
      status,
      paymentStatus,
      orderDate
    },
    "recentProducts": *[_type == "product"] | order(_createdAt desc)[0...5] {
      _id,
      title,
      price,
      stock,
      status,
      "vendorName": vendor->businessName,
      "createdAt": _createdAt
    },
    "recentVendors": *[_type == "vendor"] | order(createdAt desc)[0...5] {
      _id,
      businessName,
      email,
      status,
      createdAt
    },
    "uniqueCustomerEmails": array::unique(*[_type == "order"].customerEmail)
  }`;

  try {
    const data = await client.fetch(query);
    return {
      totalProducts: data.totalProducts || 0,
      activeVendors: data.activeVendors || 0,
      pendingApprovals: data.pendingApprovals || 0,
      totalOrders: data.totalOrders || 0,
      totalCustomers: data.uniqueCustomerEmails?.length || 0,
      lowStockCount: data.lowStockCount || 0,
      recentOrders: data.recentOrders || [],
      recentProducts: data.recentProducts || [],
      recentVendors: data.recentVendors || [],
    };
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    return {
      totalProducts: 0,
      activeVendors: 0,
      pendingApprovals: 0,
      totalOrders: 0,
      totalCustomers: 0,
      lowStockCount: 0,
      recentOrders: [],
      recentProducts: [],
      recentVendors: [],
    };
  }
};

export interface AdminProductFilterOptions {
  query?: string;
  categoryId?: string;
  brandId?: string;
  vendorId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const getAdminProducts = async (options: AdminProductFilterOptions = {}) => {
  const { query, categoryId, brandId, vendorId, status, page = 1, limit = 15 } = options;
  const start = (page - 1) * limit;
  const end = start + limit;

  const filters = ['_type == "product"'];
  const params: Record<string, unknown> = { start, end };

  if (query && query.trim()) {
    filters.push("title match $query");
    params.query = `*${query.trim()}*`;
  }
  if (categoryId && categoryId !== "all") {
    filters.push("references($categoryId)");
    params.categoryId = categoryId;
  }
  if (brandId && brandId !== "all") {
    filters.push("brand._ref == $brandId");
    params.brandId = brandId;
  }
  if (vendorId && vendorId !== "all") {
    filters.push("vendor._ref == $vendorId");
    params.vendorId = vendorId;
  }
  if (status && status !== "all") {
    filters.push("status == $status");
    params.status = status;
  }

  const filterString = filters.join(" && ");

  const groq = `{
    "products": *[${filterString}] | order(_createdAt desc)[$start...$end] {
      _id,
      title,
      slug,
      price,
      discount,
      stock,
      status,
      isNew,
      variant,
      isfeatured,
      image,
      "brand": brand->{ _id, title },
      "categories": categories[]->{ _id, title },
      "vendor": vendor->{ _id, businessName, slug, email },
      _createdAt
    },
    "total": count(*[${filterString}])
  }`;

  try {
    const result = await client.fetch(groq, params);
    return {
      products: result.products || [],
      total: result.total || 0,
      page,
      limit,
      totalPages: Math.ceil((result.total || 0) / limit),
    };
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return { products: [], total: 0, page, limit, totalPages: 0 };
  }
};

export const getAdminVendors = async (options: { query?: string; status?: string } = {}) => {
  const { query, status } = options;
  const filters = ['_type == "vendor"'];
  const params: Record<string, unknown> = {};

  if (query && query.trim()) {
    filters.push("(businessName match $query || email match $query)");
    params.query = `*${query.trim()}*`;
  }
  if (status && status !== "all") {
    filters.push("status == $status");
    params.status = status;
  }

  const filterString = filters.join(" && ");

  const groq = `*[${filterString}] | order(createdAt desc) {
    _id,
    businessName,
    slug,
    logo,
    description,
    email,
    status,
    createdAt,
    clerkUserId,
    "productCount": count(*[_type == "product" && vendor._ref == ^._id])
  }`;

  try {
    return await client.fetch(groq, params);
  } catch (error) {
    console.error("Error fetching admin vendors:", error);
    return [];
  }
};

export const getAdminVendorDetail = async (vendorId: string) => {
  const groq = `{
    "vendor": *[_type == "vendor" && _id == $vendorId][0] {
      _id,
      businessName,
      slug,
      logo,
      description,
      email,
      status,
      createdAt,
      clerkUserId
    },
    "products": *[_type == "product" && vendor._ref == $vendorId] | order(_createdAt desc) {
      _id,
      title,
      price,
      stock,
      status,
      image,
      "categories": categories[]->{ _id, title },
      "brand": brand->{ _id, title }
    },
    "productCount": count(*[_type == "product" && vendor._ref == $vendorId]),
    "orderCount": count(*[_type == "order" && count(products[product->vendor._ref == $vendorId]) > 0])
  }`;

  try {
    return await client.fetch(groq, { vendorId });
  } catch (error) {
    console.error("Error fetching vendor detail:", error);
    return null;
  }
};

export const getAdminOrders = async (options: {
  query?: string;
  status?: string;
  paymentStatus?: string;
  page?: number;
  limit?: number;
} = {}) => {
  const { query, status, paymentStatus, page = 1, limit = 15 } = options;
  const start = (page - 1) * limit;
  const end = start + limit;

  const filters = ['_type == "order"'];
  const params: Record<string, unknown> = { start, end };

  if (query && query.trim()) {
    filters.push("(orderNumber match $query || customerName match $query || customerEmail match $query)");
    params.query = `*${query.trim()}*`;
  }
  if (status && status !== "all") {
    filters.push("status == $status");
    params.status = status;
  }
  if (paymentStatus && paymentStatus !== "all") {
    filters.push("paymentStatus == $paymentStatus");
    params.paymentStatus = paymentStatus;
  }

  const filterString = filters.join(" && ");

  const groq = `{
    "orders": *[${filterString}] | order(createdAt desc)[$start...$end] {
      _id,
      orderNumber,
      customerName,
      customerEmail,
      totalPrice,
      currency,
      status,
      paymentStatus,
      paymentReference,
      stripeCheckoutSessionId,
      orderDate,
      createdAt,
      address,
      "itemCount": count(products),
      "vendors": array::unique(products[].product->vendor->businessName)
    },
    "total": count(*[${filterString}])
  }`;

  try {
    const result = await client.fetch(groq, params);
    return {
      orders: result.orders || [],
      total: result.total || 0,
      page,
      limit,
      totalPages: Math.ceil((result.total || 0) / limit),
    };
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return { orders: [], total: 0, page, limit, totalPages: 0 };
  }
};

export const getAdminOrderDetail = async (orderId: string) => {
  const groq = `*[_type == "order" && _id == $orderId][0] {
    _id,
    orderNumber,
    customerName,
    customerEmail,
    clerkUserId,
    totalPrice,
    currency,
    amountDiscount,
    status,
    paymentStatus,
    paymentReference,
    stripeCheckoutSessionId,
    stripeCustomerId,
    stripePaymentIntentId,
    orderDate,
    createdAt,
    address,
    invoice,
    products[] {
      quantity,
      price,
      product->{
        _id,
        title,
        price,
        image,
        "vendor": vendor->{ _id, businessName, email }
      }
    }
  }`;

  try {
    return await client.fetch(groq, { orderId });
  } catch (error) {
    console.error("Error fetching order detail:", error);
    return null;
  }
};

export const getAdminCustomers = async (options: { query?: string } = {}) => {
  const { query } = options;
  const groq = `*[_type == "order"] | order(createdAt desc) {
    clerkUserId,
    customerName,
    customerEmail,
    totalPrice,
    currency,
    createdAt
  }`;

  try {
    const orders = await client.fetch(groq);
    // Group orders by unique email/userId
    const customerMap = new Map<string, {
      id: string;
      name: string;
      email: string;
      orderCount: number;
      totalSpend: number;
      currency: string;
      lastOrderDate: string;
    }>();

    for (const order of orders) {
      const key = order.customerEmail || order.clerkUserId;
      if (!key) continue;

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: order.clerkUserId || key,
          name: order.customerName || "Customer",
          email: order.customerEmail || "",
          orderCount: 1,
          totalSpend: order.totalPrice || 0,
          currency: order.currency || "NGN",
          lastOrderDate: order.createdAt,
        });
      } else {
        const existing = customerMap.get(key)!;
        existing.orderCount += 1;
        existing.totalSpend += order.totalPrice || 0;
      }
    }

    let customers = Array.from(customerMap.values());
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      customers = customers.filter(
        (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
      );
    }
    return customers;
  } catch (error) {
    console.error("Error fetching admin customers:", error);
    return [];
  }
};

export const getAdminCategories = async (query?: string) => {
  const groq = `*[_type == "category" ${query ? '&& title match $query' : ''}] | order(title asc) {
    _id,
    title,
    slug,
    description,
    "productCount": count(*[_type == "product" && references(^._id)])
  }`;

  try {
    const params: Record<string, unknown> = query ? { query: `*${query.trim()}*` } : {};
    return await client.fetch(groq, params);
  } catch (error) {
    console.error("Error fetching admin categories:", error);
    return [];
  }
};

export const getAdminBrands = async (query?: string) => {
  const groq = `*[_type == "brand" ${query ? '&& title match $query' : ''}] | order(title asc) {
    _id,
    title,
    slug,
    image,
    "productCount": count(*[_type == "product" && brand._ref == ^._id])
  }`;

  try {
    const params: Record<string, unknown> = query ? { query: `*${query.trim()}*` } : {};
    return await client.fetch(groq, params);
  } catch (error) {
    console.error("Error fetching admin brands:", error);
    return [];
  }
};

export const getAdminApprovals = async () => {
  const groq = `{
    "pendingVendors": *[_type == "vendor" && (status == "pending" || !defined(status))] | order(createdAt desc) {
      _id,
      businessName,
      email,
      logo,
      description,
      status,
      createdAt
    },
    "suspendedVendors": *[_type == "vendor" && status == "suspended"] | order(createdAt desc) {
      _id,
      businessName,
      email,
      logo,
      description,
      status,
      createdAt
    }
  }`;

  try {
    return await client.fetch(groq);
  } catch (error) {
    console.error("Error fetching admin approvals:", error);
    return { pendingVendors: [], suspendedVendors: [] };
  }
};

export const getAdminTransactions = async (options: {
  query?: string;
  status?: string;
  provider?: string;
} = {}) => {
  const { query, status, provider } = options;
  const filters = ['_type == "order" && defined(paymentStatus)'];
  const params: Record<string, unknown> = {};

  if (query && query.trim()) {
    filters.push("(orderNumber match $query || customerEmail match $query || paymentReference match $query)");
    params.query = `*${query.trim()}*`;
  }
  if (status && status !== "all") {
    filters.push("paymentStatus == $status");
    params.status = status;
  }
  if (provider && provider !== "all") {
    if (provider === "stripe") {
      filters.push("defined(stripeCheckoutSessionId)");
    } else if (provider === "paystack") {
      filters.push("!defined(stripeCheckoutSessionId) && defined(paymentReference)");
    }
  }

  const groq = `*[${filters.join(" && ")}] | order(createdAt desc)[0...50] {
    _id,
    orderNumber,
    customerName,
    customerEmail,
    totalPrice,
    currency,
    paymentStatus,
    paymentReference,
    stripeCheckoutSessionId,
    createdAt,
    "provider": select(
      defined(stripeCheckoutSessionId) => "Stripe",
      "Paystack / Direct"
    )
  }`;

  try {
    return await client.fetch(groq, params);
  } catch (error) {
    console.error("Error fetching admin transactions:", error);
    return [];
  }
};
