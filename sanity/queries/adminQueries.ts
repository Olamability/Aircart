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
    if (vendorId === "platform") {
      filters.push("!defined(vendor)");
    } else {
      filters.push("vendor._ref == $vendorId");
      params.vendorId = vendorId;
    }
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
      storeEmail,
      phone,
      storeCategory,
      storeSubcategory,
      storeAddress,
      storeCity,
      storeState,
      storeLga,
      registeredBusinessName,
      businessType,
      cacRegistrationNumber,
      taxIdentificationNumber,
      registeredBusinessAddress,
      registeredBusinessCity,
      registeredBusinessState,
      registeredBusinessLga,
      clerkUserId,
      status,
      rejectionReason,
      reviewerNote,
      reviewedAt,
      reviewedBy,
      approvalHistory[] {
        action,
        reason,
        reviewedBy,
        reviewedAt
      },
      createdAt,
      updatedAt
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

// ─── super-admin specific queries ───────────────────────────────────────────

export const getSuperAdminAllVendors = async (options: {
  query?: string;
  status?: string;
} = {}) => {
  const { query, status } = options;
  const filters = ['_type == "vendor"'];
  const params: Record<string, unknown> = {};

  if (query && query.trim()) {
    filters.push("(businessName match $query || email match $query || registeredBusinessName match $query)");
    params.query = `*${query.trim()}*`;
  }
  if (status && status !== "all") {
    if (status === "pending") {
      filters.push("(status == \"pending\" || !defined(status))");
    } else {
      filters.push("status == $status");
      params.status = status;
    }
  }

  const filterString = filters.join(" && ");
  const groq = `*[${filterString}] | order(createdAt desc) {
    _id,
    businessName,
    email,
    logo,
    storeCategory,
    status,
    rejectionReason,
    reviewedBy,
    reviewedAt,
    createdAt,
    "productCount": count(*[_type == "product" && vendor._ref == ^._id])
  }`;

  try {
    return await client.fetch(groq, params);
  } catch (error) {
    console.error("Error fetching super admin vendors:", error);
    return [];
  }
};

export const getSuperAdminVendorApplicationDetail = async (vendorId: string) => {
  const groq = `{
    "vendor": *[_type == "vendor" && _id == $vendorId][0] {
      _id,
      businessName,
      slug,
      logo,
      description,
      email,
      storeEmail,
      phone,
      storeCategory,
      storeSubcategory,
      storeAddress,
      storeCity,
      storeState,
      storeLga,
      registeredBusinessName,
      businessType,
      cacRegistrationNumber,
      taxIdentificationNumber,
      registeredBusinessAddress,
      registeredBusinessCity,
      registeredBusinessState,
      registeredBusinessLga,
      clerkUserId,
      status,
      rejectionReason,
      reviewerNote,
      reviewedAt,
      reviewedBy,
      approvalHistory[] {
        action,
        reason,
        reviewedBy,
        reviewedAt
      },
      createdAt,
      updatedAt
    },
    "productCount": count(*[_type == "product" && vendor._ref == $vendorId]),
    "orderCount": count(*[_type == "order" && count(products[product->vendor._ref == $vendorId]) > 0])
  }`;

  try {
    return await client.fetch(groq, { vendorId });
  } catch (error) {
    console.error("Error fetching vendor application detail:", error);
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
    statusHistory[] {
      status,
      note,
      changedBy,
      changedAt
    },
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
    hidden,
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
    hidden,
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
      reviewerNote,
      reviewedBy,
      reviewedAt,
      createdAt
    },
    "suspendedVendors": *[_type == "vendor" && status == "suspended"] | order(createdAt desc) {
      _id,
      businessName,
      email,
      logo,
      description,
      status,
      rejectionReason,
      reviewedBy,
      reviewedAt,
      createdAt
    },
    "rejectedVendors": *[_type == "vendor" && status == "rejected"] | order(reviewedAt desc) {
      _id,
      businessName,
      email,
      logo,
      description,
      status,
      rejectionReason,
      reviewedBy,
      reviewedAt,
      createdAt
    },
    "approvedVendors": *[_type == "vendor" && status == "approved"] | order(reviewedAt desc) {
      _id,
      businessName,
      email,
      logo,
      status,
      reviewedBy,
      reviewedAt,
      createdAt
    },
    "counts": {
      "total": count(*[_type == "vendor"]),
      "pending": count(*[_type == "vendor" && (status == "pending" || !defined(status))]),
      "approved": count(*[_type == "vendor" && status == "approved"]),
      "rejected": count(*[_type == "vendor" && status == "rejected"]),
      "suspended": count(*[_type == "vendor" && status == "suspended"])
    }
  }`;

  try {
    return await client.fetch(groq);
  } catch (error) {
    console.error("Error fetching admin approvals:", error);
    return {
      pendingVendors: [],
      suspendedVendors: [],
      rejectedVendors: [],
      approvedVendors: [],
      counts: { total: 0, pending: 0, approved: 0, rejected: 0, suspended: 0 },
    };
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

export interface SuperAdminDashboardStats {
  vendorStats: {
    total: number;
    approved: number;
    pending: number;
    suspended: number;
    rejected: number;
  };
  productStats: {
    total: number;
    active: number;
    drafts: number;
    unpublished: number;
    lowStock: number;
    outOfStock: number;
    platformOwned: number;
    vendorOwned: number;
  };
  orderStats: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  financials: {
    gmv: number;
    collectedRevenue: number;
    platformCommission: number;
    netPlatformRevenue: number;
    vendorEarnings: number;
  };
  paymentStats: {
    pending: number;
    paid: number;
    failed: number;
    refunded: number;
    refundedAmount: number;
  };
  disputeStats: {
    openDisputes: number;
    unresolvedComplaints: number;
    isSchemaPersisted: boolean;
  };
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    totalPrice: number;
    currency: string;
    status: string;
    paymentStatus: string;
    createdAt: string;
  }>;
  recentVendors: Array<{
    _id: string;
    businessName: string;
    email: string;
    status: string;
    createdAt: string;
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
  recentTransactions: Array<{
    _id: string;
    orderNumber: string;
    customerName: string;
    totalPrice: number;
    currency: string;
    paymentStatus: string;
    paymentReference?: string;
    stripeCheckoutSessionId?: string;
    createdAt: string;
  }>;
  alerts: {
    suspendedVendors: Array<{
      _id: string;
      businessName: string;
      email: string;
      status: string;
      createdAt: string;
    }>;
    criticalLowStock: Array<{
      _id: string;
      title: string;
      stock: number;
      price: number;
      vendorName?: string;
    }>;
    failedOrders: Array<{
      _id: string;
      orderNumber: string;
      customerName: string;
      totalPrice: number;
      paymentStatus: string;
      status: string;
      createdAt: string;
    }>;
  };
  isAvailable: boolean;
  error?: string;
}

export const getSuperAdminDashboardMetrics = async (): Promise<SuperAdminDashboardStats> => {
  const query = `{
    "vendorStats": {
      "total": count(*[_type == "vendor"]),
      "approved": count(*[_type == "vendor" && status == "approved"]),
      "pending": count(*[_type == "vendor" && (status == "pending" || !defined(status))]),
      "suspended": count(*[_type == "vendor" && status == "suspended"]),
      "rejected": count(*[_type == "vendor" && status == "rejected"])
    },
    "productStats": {
      "total": count(*[_type == "product"]),
      "active": count(*[_type == "product" && (status in ["available", "new", "hot", "sale"] || !defined(status)) && stock > 0]),
      "lowStock": count(*[_type == "product" && stock > 0 && stock <= 5]),
      "outOfStock": count(*[_type == "product" && stock == 0]),
      "platformOwned": count(*[_type == "product" && !defined(vendor)]),
      "vendorOwned": count(*[_type == "product" && defined(vendor)]),
      "drafts": count(*[_type == "product" && _id in path("drafts.**")]),
      "unpublished": count(*[_type == "product" && status == "draft"])
    },
    "orderStats": {
      "total": count(*[_type == "order"]),
      "pending": count(*[_type == "order" && status == "pending"]),
      "processing": count(*[_type == "order" && status == "processing"]),
      "shipped": count(*[_type == "order" && (status == "shipped" || status == "out_for_delivery")]),
      "delivered": count(*[_type == "order" && status == "delivered"]),
      "cancelled": count(*[_type == "order" && status == "cancelled"])
    },
    "paymentStats": {
      "pending": count(*[_type == "order" && paymentStatus == "pending"]),
      "paid": count(*[_type == "order" && paymentStatus == "paid"]),
      "failed": count(*[_type == "order" && paymentStatus == "failed"]),
      "refunded": count(*[_type == "order" && paymentStatus == "refunded"]),
      "refundedAmount": math::sum(*[_type == "order" && paymentStatus == "refunded"].totalPrice)
    },
    "financials": {
      "gmv": math::sum(*[_type == "order" && (paymentStatus == "paid" || status == "delivered")].totalPrice),
      "collectedRevenue": math::sum(*[_type == "order" && paymentStatus == "paid"].totalPrice)
    },
    "recentOrders": *[_type == "order"] | order(createdAt desc)[0...5] {
      _id,
      orderNumber,
      customerName,
      customerEmail,
      totalPrice,
      currency,
      status,
      paymentStatus,
      createdAt
    },
    "recentVendors": *[_type == "vendor"] | order(createdAt desc)[0...5] {
      _id,
      businessName,
      email,
      status,
      createdAt
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
    "recentTransactions": *[_type == "order" && defined(paymentStatus)] | order(createdAt desc)[0...5] {
      _id,
      orderNumber,
      customerName,
      totalPrice,
      currency,
      paymentStatus,
      paymentReference,
      stripeCheckoutSessionId,
      createdAt
    },
    "suspendedVendors": *[_type == "vendor" && status == "suspended"] | order(createdAt desc)[0...5] {
      _id,
      businessName,
      email,
      status,
      createdAt
    },
    "criticalLowStock": *[_type == "product" && stock <= 3] | order(stock asc)[0...5] {
      _id,
      title,
      stock,
      price,
      "vendorName": vendor->businessName
    },
    "failedOrders": *[_type == "order" && (paymentStatus == "failed" || status == "cancelled")] | order(createdAt desc)[0...5] {
      _id,
      orderNumber,
      customerName,
      totalPrice,
      paymentStatus,
      status,
      createdAt
    }
  }`;

  try {
    const data = await client.fetch(query);
    const gmv = data.financials?.gmv || 0;
    const collectedRevenue = data.financials?.collectedRevenue || 0;
    const platformCommission = Math.round(gmv * 0.05); // Standard 5.0% platform take rate
    const netPlatformRevenue = platformCommission;
    const vendorEarnings = gmv - platformCommission;

    return {
      vendorStats: {
        total: data.vendorStats?.total || 0,
        approved: data.vendorStats?.approved || 0,
        pending: data.vendorStats?.pending || 0,
        suspended: data.vendorStats?.suspended || 0,
        rejected: data.vendorStats?.rejected || 0,
      },
      productStats: {
        total: data.productStats?.total || 0,
        active: data.productStats?.active || 0,
        drafts: data.productStats?.drafts || 0,
        unpublished: data.productStats?.unpublished || 0,
        lowStock: data.productStats?.lowStock || 0,
        outOfStock: data.productStats?.outOfStock || 0,
        platformOwned: data.productStats?.platformOwned || 0,
        vendorOwned: data.productStats?.vendorOwned || 0,
      },
      orderStats: {
        total: data.orderStats?.total || 0,
        pending: data.orderStats?.pending || 0,
        processing: data.orderStats?.processing || 0,
        shipped: data.orderStats?.shipped || 0,
        delivered: data.orderStats?.delivered || 0,
        cancelled: data.orderStats?.cancelled || 0,
      },
      financials: {
        gmv,
        collectedRevenue,
        platformCommission,
        netPlatformRevenue,
        vendorEarnings,
      },
      paymentStats: {
        pending: data.paymentStats?.pending || 0,
        paid: data.paymentStats?.paid || 0,
        failed: data.paymentStats?.failed || 0,
        refunded: data.paymentStats?.refunded || 0,
        refundedAmount: data.paymentStats?.refundedAmount || 0,
      },
      disputeStats: {
        openDisputes: 0,
        unresolvedComplaints: 0,
        isSchemaPersisted: false,
      },
      recentOrders: data.recentOrders || [],
      recentVendors: data.recentVendors || [],
      recentProducts: data.recentProducts || [],
      recentTransactions: data.recentTransactions || [],
      alerts: {
        suspendedVendors: data.suspendedVendors || [],
        criticalLowStock: data.criticalLowStock || [],
        failedOrders: data.failedOrders || [],
      },
      isAvailable: true,
    };
  } catch (error) {
    console.error("Error fetching super admin dashboard metrics:", error);
    return {
      vendorStats: { total: 0, approved: 0, pending: 0, suspended: 0, rejected: 0 },
      productStats: { total: 0, active: 0, drafts: 0, unpublished: 0, lowStock: 0, outOfStock: 0, platformOwned: 0, vendorOwned: 0 },
      orderStats: { total: 0, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 },
      financials: { gmv: 0, collectedRevenue: 0, platformCommission: 0, netPlatformRevenue: 0, vendorEarnings: 0 },
      paymentStats: { pending: 0, paid: 0, failed: 0, refunded: 0, refundedAmount: 0 },
      disputeStats: { openDisputes: 0, unresolvedComplaints: 0, isSchemaPersisted: false },
      recentOrders: [],
      recentVendors: [],
      recentProducts: [],
      recentTransactions: [],
      alerts: { suspendedVendors: [], criticalLowStock: [], failedOrders: [] },
      isAvailable: false,
      error: error instanceof Error ? error.message : "Sanity service unavailable",
    };
  }
};

export interface SuperAdminVendorLedgerItem {
  vendorId: string;
  businessName: string;
  email: string;
  status: string;
  clearedOrdersCount: number;
  totalUnitsSold: number;
  grossSales: number;
  platformCommission: number;
  netVendorBalance: number;
}

export interface SuperAdminCommissionReport {
  totalGross: number;
  totalCommission: number;
  totalNetPayable: number;
  clearedTransactionsCount: number;
  vendors: SuperAdminVendorLedgerItem[];
}

export const getSuperAdminCommissionAndLedgerReport = async (): Promise<SuperAdminCommissionReport> => {
  const query = `{
    "vendors": *[_type == "vendor"] | order(businessName asc) {
      _id,
      businessName,
      email,
      status
    },
    "orders": *[_type == "order" && paymentStatus == "paid"] {
      _id,
      orderNumber,
      createdAt,
      products[] {
        quantity,
        price,
        "vendorId": product->vendor._ref
      }
    }
  }`;

  try {
    const data = await client.fetch(query);
    const vendorsList = data.vendors || [];
    const orders = data.orders || [];

    const vendorMap: Record<string, SuperAdminVendorLedgerItem> = {};

    vendorsList.forEach((v: any) => {
      vendorMap[v._id] = {
        vendorId: v._id,
        businessName: v.businessName || "Unnamed Vendor",
        email: v.email || "",
        status: v.status || "pending",
        clearedOrdersCount: 0,
        totalUnitsSold: 0,
        grossSales: 0,
        platformCommission: 0,
        netVendorBalance: 0,
      };
    });

    // Also account for direct platform sales
    vendorMap["platform"] = {
      vendorId: "platform",
      businessName: "Direct Marketplace (Platform)",
      email: "finance@airmart.market",
      status: "active",
      clearedOrdersCount: 0,
      totalUnitsSold: 0,
      grossSales: 0,
      platformCommission: 0,
      netVendorBalance: 0,
    };

    orders.forEach((order: any) => {
      const orderVendorsSeen = new Set<string>();

      (order.products || []).forEach((item: any) => {
        const vId = item.vendorId || "platform";
        if (!vendorMap[vId]) {
          vendorMap[vId] = {
            vendorId: vId,
            businessName: "Unknown Vendor",
            email: "",
            status: "unknown",
            clearedOrdersCount: 0,
            totalUnitsSold: 0,
            grossSales: 0,
            platformCommission: 0,
            netVendorBalance: 0,
          };
        }

        const itemTotal = (item.price || 0) * (item.quantity || 1);
        vendorMap[vId].grossSales += itemTotal;
        vendorMap[vId].totalUnitsSold += item.quantity || 1;
        orderVendorsSeen.add(vId);
      });

      orderVendorsSeen.forEach((vId) => {
        if (vendorMap[vId]) {
          vendorMap[vId].clearedOrdersCount += 1;
        }
      });
    });

    let totalGross = 0;
    let totalCommission = 0;
    let totalNetPayable = 0;

    const populatedVendors = Object.values(vendorMap).map((v) => {
      const isPlatform = v.vendorId === "platform";
      const commRate = isPlatform ? 0 : 0.05;
      const commission = Math.round(v.grossSales * commRate);
      const net = isPlatform ? v.grossSales : v.grossSales - commission;

      v.platformCommission = commission;
      v.netVendorBalance = net;

      totalGross += v.grossSales;
      totalCommission += commission;
      if (!isPlatform) {
        totalNetPayable += net;
      }

      return v;
    });

    return {
      totalGross,
      totalCommission,
      totalNetPayable,
      clearedTransactionsCount: orders.length,
      vendors: populatedVendors.sort((a, b) => b.grossSales - a.grossSales),
    };
  } catch (error) {
    console.error("Error fetching super admin commission report:", error);
    return {
      totalGross: 0,
      totalCommission: 0,
      totalNetPayable: 0,
      clearedTransactionsCount: 0,
      vendors: [],
    };
  }
};

export interface AdminInventoryItem {
  _id: string;
  title: string;
  slug?: { current?: string };
  price: number;
  stock: number;
  status?: string;
  image?: any;
  vendor?: {
    _id: string;
    businessName: string;
    email: string;
  };
  isPlatformOwned: boolean;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export const getAdminInventory = async (options: {
  query?: string;
  stockStatus?: string;
  ownership?: string;
} = {}) => {
  const { query, stockStatus, ownership } = options;
  const filters = ['_type == "product"'];
  const params: Record<string, unknown> = {};

  if (query && query.trim()) {
    filters.push("title match $query");
    params.query = `*${query.trim()}*`;
  }

  if (stockStatus === "out") {
    filters.push("stock == 0");
  } else if (stockStatus === "low") {
    filters.push("stock > 0 && stock <= 5");
  } else if (stockStatus === "in_stock") {
    filters.push("stock > 5");
  }

  if (ownership === "platform") {
    filters.push("!defined(vendor)");
  } else if (ownership === "vendor") {
    filters.push("defined(vendor)");
  }

  const filterString = filters.join(" && ");
  const groq = `*[${filterString}] | order(stock asc) {
    _id,
    title,
    slug,
    price,
    stock,
    status,
    image,
    "vendor": vendor->{ _id, businessName, email },
    "isPlatformOwned": !defined(vendor),
    "isLowStock": stock <= 5 && stock > 0,
    "isOutOfStock": stock == 0
  }`;

  try {
    const products = await client.fetch(groq, params);
    return {
      products: products || [],
      totalCount: products?.length || 0,
      lowStockCount: products?.filter((p: any) => p.isLowStock).length || 0,
      outOfStockCount: products?.filter((p: any) => p.isOutOfStock).length || 0,
    };
  } catch (error) {
    console.error("Error fetching admin inventory:", error);
    return { products: [], totalCount: 0, lowStockCount: 0, outOfStockCount: 0 };
  }
};

export const getAdminDisputes = async (options: {
  status?: string;
  reason?: string;
  query?: string;
} = {}) => {
  const { status, reason, query } = options;
  const filters = ['_type == "dispute"'];
  const params: Record<string, unknown> = {};

  if (query && query.trim()) {
    filters.push("(subject match $query || claimantName match $query || claimantEmail match $query)");
    params.query = `*${query.trim()}*`;
  }
  if (status && status !== "all") {
    filters.push("status == $status");
    params.status = status;
  }
  if (reason && reason !== "all") {
    filters.push("reason == $reason");
    params.reason = reason;
  }

  const filterString = filters.join(" && ");
  const groq = `{
    "disputes": *[${filterString}] | order(createdAt desc) {
      _id,
      subject,
      claimantType,
      claimantName,
      claimantEmail,
      reason,
      priority,
      status,
      description,
      resolutionNote,
      resolvedBy,
      resolvedAt,
      createdAt,
      "order": order->{ _id, orderNumber, totalPrice }
    },
    "counts": {
      "open": count(*[_type == "dispute" && status == "open"]),
      "investigating": count(*[_type == "dispute" && status == "investigating"]),
      "resolved": count(*[_type == "dispute" && status == "resolved"]),
      "escalated": count(*[_type == "dispute" && status == "escalated"]),
      "delivery": count(*[_type == "dispute" && reason == "non_delivery"]),
      "refunds": count(*[_type == "dispute" && reason == "refund_request"]),
      "total": count(*[_type == "dispute"])
    }
  }`;

  try {
    const res = await client.fetch(groq, params);
    return {
      disputes: res.disputes || [],
      counts: res.counts || { open: 0, investigating: 0, resolved: 0, escalated: 0, delivery: 0, refunds: 0, total: 0 },
    };
  } catch (error) {
    console.error("Error fetching disputes:", error);
    return {
      disputes: [],
      counts: { open: 0, investigating: 0, resolved: 0, escalated: 0, delivery: 0, refunds: 0, total: 0 },
    };
  }
};
