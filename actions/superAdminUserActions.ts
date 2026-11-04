"use server";

import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/writeClient";
import { requirePermission } from "@/lib/guards";
import { permissions } from "@/lib/permissions";
import { getUserRole, type Role, type AuditLogEntry } from "@/lib/roles";
import { revalidatePath } from "next/cache";

// Helper to append timestamped audit trail to user metadata
const appendAuditLog = (
  existingLogs: unknown,
  action: string,
  performedBy: string,
  details?: string
): AuditLogEntry[] => {
  const logs = Array.isArray(existingLogs) ? (existingLogs as AuditLogEntry[]) : [];
  const newEntry: AuditLogEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    action,
    performedBy,
    timestamp: Date.now(),
    details,
  };
  // Maintain up to 50 latest audit records
  return [newEntry, ...logs].slice(0, 50);
};

const getActorIdentifier = async () => {
  const { userId } = await auth();
  const user = await currentUser();
  return user?.emailAddresses?.[0]?.emailAddress || user?.username || userId || "Super Admin";
};

/**
 * Assign or change a user's role across the platform.
 */
export const updateUserRoleAction = async (userId: string, newRole: Role) => {
  const currentRole = await getUserRole();
  if (currentRole !== "super_admin") {
    throw new Error("Unauthorized: Only super administrators can modify authority roles.");
  }

  await requirePermission(permissions.role_delegation);

  const actor = await getActorIdentifier();
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  const prevRole = user.publicMetadata?.role || "customer";
  if (prevRole === newRole) {
    return { success: true, message: "Role is already assigned." };
  }

  // Prevent super admin from accidentally demoting themselves
  const { userId: currentAuthId } = await auth();
  if (userId === currentAuthId && newRole !== "super_admin") {
    throw new Error("Cannot demote your own active super admin account.");
  }

  const updatedAuditLog = appendAuditLog(
    user.publicMetadata?.auditLog,
    "ROLE_CHANGE",
    actor,
    `Role changed from '${prevRole}' to '${newRole}'`
  );

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...user.publicMetadata,
      role: newRole,
      auditLog: updatedAuditLog,
    },
  });

  revalidatePath("/super-admin/users");
  revalidatePath(`/super-admin/users/${userId}`);
  revalidatePath("/super-admin");
  revalidatePath("/super-admin/roles");
  revalidatePath("/super-admin/admins");

  return { success: true, message: `Role successfully updated to ${newRole}` };
};

/**
 * Suspend (ban) or reactivate (unban) a user account.
 */
export const toggleUserSuspensionAction = async (
  userId: string,
  suspend: boolean,
  reason?: string
) => {
  const currentRole = await getUserRole();
  if (currentRole !== "super_admin") {
    throw new Error("Unauthorized: Only super administrators can suspend accounts.");
  }

  await requirePermission(permissions.admin_manage);

  const { userId: currentAuthId } = await auth();
  if (userId === currentAuthId) {
    throw new Error("Cannot suspend your own active administrator account.");
  }

  const actor = await getActorIdentifier();
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  let updatedAuditLog: AuditLogEntry[];

  if (suspend) {
    await client.users.banUser(userId);

    // Revoke all existing sessions immediately to enforce suspension
    const sessions = await client.sessions.getSessionList({ userId });
    for (const session of sessions.data) {
      await client.sessions.revokeSession(session.id).catch(() => {});
    }

    // If user is a vendor, synchronize Sanity vendor document status
    const vendorDoc = await writeClient.fetch(
      `*[_type == "vendor" && (clerkUserId == $userId || email == $email)][0]._id`,
      { userId, email: user.emailAddresses?.[0]?.emailAddress || "" }
    );
    if (vendorDoc) {
      await writeClient.patch(vendorDoc).set({ status: "suspended" }).commit().catch(() => {});
    }

    updatedAuditLog = appendAuditLog(
      user.publicMetadata?.auditLog,
      "ACCOUNT_SUSPENDED",
      actor,
      reason ? `Account suspended: ${reason}` : "Account suspended by Super Admin"
    );
  } else {
    await client.users.unbanUser(userId);

    // Reactivate vendor document if applicable
    const vendorDoc = await writeClient.fetch(
      `*[_type == "vendor" && (clerkUserId == $userId || email == $email)][0]._id`,
      { userId, email: user.emailAddresses?.[0]?.emailAddress || "" }
    );
    if (vendorDoc) {
      await writeClient.patch(vendorDoc).set({ status: "approved" }).commit().catch(() => {});
    }

    updatedAuditLog = appendAuditLog(
      user.publicMetadata?.auditLog,
      "ACCOUNT_REACTIVATED",
      actor,
      "Account reactivated by Super Admin"
    );
  }

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...user.publicMetadata,
      auditLog: updatedAuditLog,
    },
  });

  revalidatePath("/super-admin/users");
  revalidatePath(`/super-admin/users/${userId}`);
  revalidatePath("/super-admin");
  revalidatePath("/admin/vendors");
  revalidatePath("/admin/compliance");

  return {
    success: true,
    message: suspend ? "Account suspended and active sessions terminated." : "Account reactivated.",
  };
};

/**
 * Lock or unlock a user account.
 */
export const toggleUserLockAction = async (
  userId: string,
  lock: boolean,
  reason?: string
) => {
  const currentRole = await getUserRole();
  if (currentRole !== "super_admin") {
    throw new Error("Unauthorized: Only super administrators can lock accounts.");
  }

  await requirePermission(permissions.admin_manage);

  const { userId: currentAuthId } = await auth();
  if (userId === currentAuthId) {
    throw new Error("Cannot lock your own active administrator account.");
  }

  const actor = await getActorIdentifier();
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  let updatedAuditLog: AuditLogEntry[];

  if (lock) {
    await client.users.lockUser(userId);

    const sessions = await client.sessions.getSessionList({ userId });
    for (const session of sessions.data) {
      await client.sessions.revokeSession(session.id).catch(() => {});
    }

    updatedAuditLog = appendAuditLog(
      user.publicMetadata?.auditLog,
      "ACCOUNT_LOCKED",
      actor,
      reason ? `Account locked: ${reason}` : "Account restricted/locked by Super Admin"
    );
  } else {
    await client.users.unlockUser(userId);

    updatedAuditLog = appendAuditLog(
      user.publicMetadata?.auditLog,
      "ACCOUNT_UNLOCKED",
      actor,
      "Account unlocked by Super Admin"
    );
  }

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...user.publicMetadata,
      auditLog: updatedAuditLog,
    },
  });

  revalidatePath("/super-admin/users");
  revalidatePath(`/super-admin/users/${userId}`);
  revalidatePath("/super-admin");

  return {
    success: true,
    message: lock ? "Account locked and access restricted." : "Account unlocked.",
  };
};

/**
 * Edit permitted user information (First Name, Last Name, Username).
 */
export const updateUserProfileInfoAction = async (
  userId: string,
  data: { firstName?: string; lastName?: string; username?: string }
) => {
  const currentRole = await getUserRole();
  if (currentRole !== "super_admin") {
    throw new Error("Unauthorized: Only super administrators can edit account profiles.");
  }

  await requirePermission(permissions.admin_manage);

  const actor = await getActorIdentifier();
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  await client.users.updateUser(userId, {
    firstName: data.firstName?.trim() || undefined,
    lastName: data.lastName?.trim() || undefined,
    username: data.username?.trim() || undefined,
  });

  const updatedAuditLog = appendAuditLog(
    user.publicMetadata?.auditLog,
    "PROFILE_EDIT",
    actor,
    `Profile details updated: ${[
      data.firstName ? `first: ${data.firstName}` : "",
      data.lastName ? `last: ${data.lastName}` : "",
      data.username ? `username: ${data.username}` : "",
    ]
      .filter(Boolean)
      .join(", ")}`
  );

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...user.publicMetadata,
      auditLog: updatedAuditLog,
    },
  });

  revalidatePath("/super-admin/users");
  revalidatePath(`/super-admin/users/${userId}`);

  return { success: true, message: "Profile details updated successfully." };
};

/**
 * Manage account verification status (verified, pending, unverified).
 */
export const updateUserVerificationAction = async (
  userId: string,
  status: "verified" | "pending" | "unverified"
) => {
  const currentRole = await getUserRole();
  if (currentRole !== "super_admin") {
    throw new Error("Unauthorized: Only super administrators can manage verification.");
  }

  await requirePermission(permissions.admin_manage);

  const actor = await getActorIdentifier();
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  const updatedAuditLog = appendAuditLog(
    user.publicMetadata?.auditLog,
    "VERIFICATION_UPDATE",
    actor,
    `Verification status set to '${status}'`
  );

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...user.publicMetadata,
      verificationStatus: status,
      auditLog: updatedAuditLog,
    },
  });

  revalidatePath("/super-admin/users");
  revalidatePath(`/super-admin/users/${userId}`);

  return { success: true, message: `Account verification updated to ${status}.` };
};

/**
 * Flag or unflag an account for suspicious activity or reported violations.
 */
export const toggleUserFlagAction = async (
  userId: string,
  flagged: boolean,
  reason?: string
) => {
  const currentRole = await getUserRole();
  if (currentRole !== "super_admin") {
    throw new Error("Unauthorized: Only super administrators can flag accounts.");
  }

  await requirePermission(permissions.admin_manage);

  const actor = await getActorIdentifier();
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  const updatedAuditLog = appendAuditLog(
    user.publicMetadata?.auditLog,
    flagged ? "ACCOUNT_FLAGGED" : "ACCOUNT_UNFLAGGED",
    actor,
    flagged
      ? `Account flagged for review: ${reason || "Suspicious activity detected"}`
      : "Account flag cleared by Super Admin"
  );

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...user.publicMetadata,
      flagged,
      flagReason: flagged ? reason || "Flagged for review" : null,
      auditLog: updatedAuditLog,
    },
  });

  revalidatePath("/super-admin/users");
  revalidatePath(`/super-admin/users/${userId}`);
  revalidatePath("/super-admin");

  return {
    success: true,
    message: flagged ? "Account flagged for administrative review." : "Account flag cleared.",
  };
};

/**
 * Revoke all active sessions for a user, forcing immediate logout.
 */
export const revokeUserSessionsAction = async (userId: string) => {
  const currentRole = await getUserRole();
  if (currentRole !== "super_admin") {
    throw new Error("Unauthorized: Only super administrators can revoke sessions.");
  }

  await requirePermission(permissions.admin_manage);

  const actor = await getActorIdentifier();
  const client = await clerkClient();
  const sessions = await client.sessions.getSessionList({ userId });

  let revokedCount = 0;
  for (const session of sessions.data) {
    await client.sessions.revokeSession(session.id);
    revokedCount++;
  }

  const user = await client.users.getUser(userId);
  const updatedAuditLog = appendAuditLog(
    user.publicMetadata?.auditLog,
    "SESSIONS_REVOKED",
    actor,
    `Revoked ${revokedCount} active session${revokedCount === 1 ? "" : "s"}`
  );

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...user.publicMetadata,
      auditLog: updatedAuditLog,
    },
  });

  revalidatePath("/super-admin/users");
  revalidatePath(`/super-admin/users/${userId}`);

  return {
    success: true,
    message: `Revoked ${revokedCount} active session${revokedCount === 1 ? "" : "s"}.`,
  };
};

