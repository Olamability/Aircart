import { auth, clerkClient } from "@clerk/nextjs/server";
import { rolePermissions } from "./permissions";
import { client as sanityClient } from "@/sanity/lib/client";

export type Role = keyof typeof rolePermissions;

export const getUserRole = async (): Promise<Role | null> => {
  const { sessionClaims } = await auth();

  if (!sessionClaims) {
    return null;
  }
  const role = sessionClaims.metadata?.role;
  if (typeof role === "string" && role in rolePermissions) {
    return role as Role;
  }
  return "customer";
};

export interface ClerkUserMetrics {
  totalUsers: number;
  activeUsers: number;
  restrictedUsers: number;
  customers: number;
  vendors: number;
  administrators: number;
  productManagers: number;
  superAdmins: number;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: number;
    banned: boolean;
  }>;
  isAvailable: boolean;
  error?: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  performedBy: string;
  timestamp: number;
  details?: string;
}

export interface ClerkUserData {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  email: string;
  phone: string | null;
  imageUrl: string;
  role: Role;
  banned: boolean;
  locked: boolean;
  verificationStatus: "verified" | "pending" | "unverified";
  flagged: boolean;
  flagReason?: string;
  createdAt: number;
  lastSignInAt: number | null;
  lastActiveAt: number | null;
  auditLog: AuditLogEntry[];
}

const executeWithRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 500): Promise<T> => {
  let lastError: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  throw lastError;
};

export const getClerkUserMetrics = async (): Promise<ClerkUserMetrics> => {
  try {
    const client = await clerkClient();
    const [totalUsers, userList] = await Promise.all([
      executeWithRetry(() => client.users.getCount()),
      executeWithRetry(() => client.users.getUserList({ limit: 100, orderBy: "-created_at" })),
    ]);

    let activeUsers = 0;
    let restrictedUsers = 0;
    let customers = 0;
    let vendors = 0;
    let administrators = 0;
    let productManagers = 0;
    let superAdmins = 0;

    const recentUsers: ClerkUserMetrics["recentUsers"] = [];

    for (const user of userList.data) {
      const isRestricted = Boolean(user.banned || user.locked);
      if (isRestricted) {
        restrictedUsers++;
      } else {
        activeUsers++;
      }

      const role = user.publicMetadata?.role;
      if (role === "super_admin") {
        superAdmins++;
      } else if (role === "admin") {
        administrators++;
      } else if (role === "product_manager") {
        productManagers++;
      } else if (role === "vendor") {
        vendors++;
      } else {
        customers++;
      }

      if (recentUsers.length < 5) {
        const name =
          [user.firstName, user.lastName].filter(Boolean).join(" ") ||
          user.username ||
          "User";
        const email =
          user.emailAddresses?.[0]?.emailAddress || "No email on record";
        recentUsers.push({
          id: user.id,
          name,
          email,
          role: typeof role === "string" && role in rolePermissions ? role : "customer",
          createdAt: user.createdAt,
          banned: isRestricted,
        });
      }
    }

    return {
      totalUsers,
      activeUsers,
      restrictedUsers,
      customers,
      vendors,
      administrators,
      productManagers,
      superAdmins,
      recentUsers,
      isAvailable: true,
    };
  } catch (error) {
    console.error("Error fetching Clerk user metrics:", error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      restrictedUsers: 0,
      customers: 0,
      vendors: 0,
      administrators: 0,
      productManagers: 0,
      superAdmins: 0,
      recentUsers: [],
      isAvailable: false,
      error: error instanceof Error ? error.message : "Clerk service unavailable",
    };
  }
};

export interface SuperAdminUserFilters {
  query?: string;
  role?: string;
  status?: string;
  verification?: string;
}

export const getSuperAdminUsers = async (filters: SuperAdminUserFilters = {}) => {
  try {
    const clerk = await clerkClient();
    const userList = await executeWithRetry(() =>
      clerk.users.getUserList({ limit: 200, orderBy: "-created_at" })
    );

    const users: ClerkUserData[] = userList.data.map((u) => {
      const email = u.emailAddresses?.[0]?.emailAddress || "No email on record";
      const phone = u.phoneNumbers?.[0]?.phoneNumber || null;
      const roleStr = u.publicMetadata?.role;
      const role: Role =
        typeof roleStr === "string" && roleStr in rolePermissions
          ? (roleStr as Role)
          : "customer";

      const verificationStatus =
        (u.publicMetadata?.verificationStatus as "verified" | "pending" | "unverified") ||
        (u.emailAddresses?.[0]?.verification?.status === "verified" ? "verified" : "unverified");

      const flagged = Boolean(u.publicMetadata?.flagged);
      const flagReason =
        typeof u.publicMetadata?.flagReason === "string" ? u.publicMetadata.flagReason : undefined;

      const auditLog = Array.isArray(u.publicMetadata?.auditLog)
        ? (u.publicMetadata.auditLog as AuditLogEntry[])
        : [];

      return {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        username: u.username,
        email,
        phone,
        imageUrl: u.imageUrl,
        role,
        banned: Boolean(u.banned),
        locked: Boolean(u.locked),
        verificationStatus,
        flagged,
        flagReason,
        createdAt: u.createdAt,
        lastSignInAt: u.lastSignInAt,
        lastActiveAt: u.lastActiveAt,
        auditLog,
      };
    });

    let filtered = users;

    if (filters.query && filters.query.trim()) {
      const q = filters.query.trim().toLowerCase();
      filtered = filtered.filter((u) => {
        const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
        return (
          fullName.includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.username && u.username.toLowerCase().includes(q)) ||
          u.id.toLowerCase().includes(q)
        );
      });
    }

    if (filters.role && filters.role !== "all") {
      filtered = filtered.filter((u) => u.role === filters.role);
    }

    if (filters.status && filters.status !== "all") {
      if (filters.status === "active") {
        filtered = filtered.filter((u) => !u.banned && !u.locked && !u.flagged);
      } else if (filters.status === "suspended") {
        filtered = filtered.filter((u) => u.banned);
      } else if (filters.status === "locked") {
        filtered = filtered.filter((u) => u.locked);
      } else if (filters.status === "flagged") {
        filtered = filtered.filter((u) => u.flagged);
      }
    }

    if (filters.verification && filters.verification !== "all") {
      filtered = filtered.filter((u) => u.verificationStatus === filters.verification);
    }

    return {
      users: filtered,
      totalCount: users.length,
      filteredCount: filtered.length,
      isAvailable: true,
    };
  } catch (error) {
    console.error("Error fetching super admin users:", error);
    return {
      users: [],
      totalCount: 0,
      filteredCount: 0,
      isAvailable: false,
      error: error instanceof Error ? error.message : "Clerk user query failed",
    };
  }
};

export const getSuperAdminUserDetail = async (userId: string) => {
  try {
    const clerk = await clerkClient();
    const [user, sessions] = await Promise.all([
      executeWithRetry(() => clerk.users.getUser(userId)),
      executeWithRetry(() => clerk.sessions.getSessionList({ userId })).catch(() => ({ data: [] })),
    ]);

    const email = user.emailAddresses?.[0]?.emailAddress || "";
    const phone = user.phoneNumbers?.[0]?.phoneNumber || null;
    const roleStr = user.publicMetadata?.role;
    const role: Role =
      typeof roleStr === "string" && roleStr in rolePermissions
        ? (roleStr as Role)
        : "customer";

    const verificationStatus =
      (user.publicMetadata?.verificationStatus as "verified" | "pending" | "unverified") ||
      (user.emailAddresses?.[0]?.verification?.status === "verified" ? "verified" : "unverified");

    const flagged = Boolean(user.publicMetadata?.flagged);
    const flagReason =
      typeof user.publicMetadata?.flagReason === "string" ? user.publicMetadata.flagReason : undefined;

    const auditLog = Array.isArray(user.publicMetadata?.auditLog)
      ? (user.publicMetadata.auditLog as AuditLogEntry[])
      : [];

    const userData: ClerkUserData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email,
      phone,
      imageUrl: user.imageUrl,
      role,
      banned: Boolean(user.banned),
      locked: Boolean(user.locked),
      verificationStatus,
      flagged,
      flagReason,
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
      lastActiveAt: user.lastActiveAt,
      auditLog,
    };

    const sanityData = await sanityClient.fetch(
      `{
        "orders": *[_type == "order" && (clerkUserId == $userId || customerEmail == $email)] | order(createdAt desc) {
          _id,
          orderNumber,
          totalPrice,
          currency,
          status,
          paymentStatus,
          paymentReference,
          orderDate,
          createdAt,
          "itemCount": count(products)
        },
        "vendor": *[_type == "vendor" && (clerkUserId == $userId || email == $email)][0] {
          _id,
          businessName,
          slug,
          status,
          email,
          description,
          createdAt,
          "productCount": count(*[_type == "product" && vendor._ref == ^._id])
        }
      }`,
      { userId, email }
    );

    const totalSpend = (sanityData.orders || []).reduce((acc: number, o: { paymentStatus?: string; status?: string; totalPrice?: number }) => {
      if (o.paymentStatus === "paid" || o.status === "delivered") {
        return acc + (o.totalPrice || 0);
      }
      return acc;
    }, 0);

    return {
      user: userData,
      activeSessionsCount: sessions.data?.length || 0,
      orders: sanityData.orders || [],
      totalSpend,
      vendor: sanityData.vendor || null,
      isAvailable: true,
    };
  } catch (error) {
    console.error("Error fetching super admin user detail:", error);
    return null;
  }
};
