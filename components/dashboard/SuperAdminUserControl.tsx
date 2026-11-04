"use client";

import React, { useState, useTransition } from "react";
import {
  Shield,
  Ban,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Save,
  Clock,
  UserCheck,
  UserX,
  Flag,
} from "lucide-react";
import type { ClerkUserData, Role } from "@/lib/roles";
import {
  updateUserRoleAction,
  toggleUserSuspensionAction,
  toggleUserLockAction,
  updateUserProfileInfoAction,
  updateUserVerificationAction,
  toggleUserFlagAction,
  revokeUserSessionsAction,
} from "@/actions/superAdminUserActions";
import StatusBadge from "./StatusBadge";

interface SuperAdminUserControlProps {
  user: ClerkUserData;
  activeSessionsCount: number;
}

export default function SuperAdminUserControl({
  user,
  activeSessionsCount,
}: SuperAdminUserControlProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  // Form states
  const [selectedRole, setSelectedRole] = useState<Role>(user.role);
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [username, setUsername] = useState(user.username || "");
  const [verificationStatus, setVerificationStatus] = useState<"verified" | "pending" | "unverified">(
    user.verificationStatus
  );
  const [flagReason, setFlagReason] = useState(user.flagReason || "");
  const [suspendReason, setSuspendReason] = useState("");

  const clearFeedbackAfterDelay = () => {
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleRoleChange = () => {
    startTransition(async () => {
      try {
        const res = await updateUserRoleAction(user.id, selectedRole);
        setFeedback({ type: "success", message: res.message });
        clearFeedbackAfterDelay();
      } catch (err) {
        setFeedback({
          type: "error",
          message: err instanceof Error ? err.message : "Failed to update role",
        });
      }
    });
  };

  const handleToggleSuspension = (suspend: boolean) => {
    startTransition(async () => {
      try {
        const res = await toggleUserSuspensionAction(user.id, suspend, suspendReason);
        setFeedback({ type: "success", message: res.message });
        setSuspendReason("");
        clearFeedbackAfterDelay();
      } catch (err) {
        setFeedback({
          type: "error",
          message: err instanceof Error ? err.message : "Suspension toggle failed",
        });
      }
    });
  };

  const handleToggleLock = (lock: boolean) => {
    startTransition(async () => {
      try {
        const res = await toggleUserLockAction(user.id, lock);
        setFeedback({ type: "success", message: res.message });
        clearFeedbackAfterDelay();
      } catch (err) {
        setFeedback({
          type: "error",
          message: err instanceof Error ? err.message : "Lock toggle failed",
        });
      }
    });
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await updateUserProfileInfoAction(user.id, {
          firstName,
          lastName,
          username,
        });
        setFeedback({ type: "success", message: res.message });
        clearFeedbackAfterDelay();
      } catch (err) {
        setFeedback({
          type: "error",
          message: err instanceof Error ? err.message : "Profile update failed",
        });
      }
    });
  };

  const handleVerificationChange = (newStatus: "verified" | "pending" | "unverified") => {
    setVerificationStatus(newStatus);
    startTransition(async () => {
      try {
        const res = await updateUserVerificationAction(user.id, newStatus);
        setFeedback({ type: "success", message: res.message });
        clearFeedbackAfterDelay();
      } catch (err) {
        setFeedback({
          type: "error",
          message: err instanceof Error ? err.message : "Verification update failed",
        });
      }
    });
  };

  const handleToggleFlag = (flagged: boolean) => {
    startTransition(async () => {
      try {
        const res = await toggleUserFlagAction(user.id, flagged, flagReason);
        setFeedback({ type: "success", message: res.message });
        if (!flagged) setFlagReason("");
        clearFeedbackAfterDelay();
      } catch (err) {
        setFeedback({
          type: "error",
          message: err instanceof Error ? err.message : "Flag toggle failed",
        });
      }
    });
  };

  const handleRevokeSessions = () => {
    startTransition(async () => {
      try {
        const res = await revokeUserSessionsAction(user.id);
        setFeedback({ type: "success", message: res.message });
        clearFeedbackAfterDelay();
      } catch (err) {
        setFeedback({
          type: "error",
          message: err instanceof Error ? err.message : "Session revocation failed",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Action Notification Alert */}
      {feedback && (
        <div
          className={`rounded-xl p-4 text-xs font-semibold flex items-center justify-between border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Grid of Control Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel 1: Role Authority & Assignment */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Shield className="h-4 w-4 text-purple-600" />
            <h4 className="text-sm font-bold text-slate-900">Authority Role Delegation</h4>
          </div>

          <p className="text-xs text-slate-500">
            Assign the platform authority tier for this account. Backend guards enforce these permissions on every request.
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Current Role:</span>
              <StatusBadge status={user.role} />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as Role)}
                disabled={isPending}
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:border-purple-500 focus:outline-hidden disabled:opacity-50"
              >
                <option value="customer">Customer (Level 1 - Buyer)</option>
                <option value="vendor">Vendor (Level 2 - Merchant)</option>
                <option value="product_manager">Product Manager (Level 3 - Catalog)</option>
                <option value="admin">Admin (Level 4 - Operations)</option>
                <option value="super_admin">Super Admin (Level 5 - Platform Owner)</option>
              </select>

              <button
                type="button"
                onClick={handleRoleChange}
                disabled={isPending || selectedRole === user.role}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-700 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-purple-800 disabled:opacity-50 transition"
              >
                <UserCheck className="h-3.5 w-3.5" />
                {isPending ? "Applying..." : "Assign Role"}
              </button>
            </div>
          </div>
        </div>

        {/* Panel 2: Account Status & Access Enforcement */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Ban className="h-4 w-4 text-rose-600" />
            <h4 className="text-sm font-bold text-slate-900">Access Restriction & Suspension</h4>
          </div>

          <p className="text-xs text-slate-500">
            Enforce account suspensions and lockouts directly at the identity level. Revokes active tokens immediately.
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Access State:</span>
              <div className="flex gap-1.5">
                {user.banned ? (
                  <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                    Suspended (Banned)
                  </span>
                ) : user.locked ? (
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                    Locked
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    Active & Permitted
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {user.banned ? (
                <button
                  type="button"
                  onClick={() => handleToggleSuspension(false)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  <Unlock className="h-3.5 w-3.5" />
                  Reactivate Account
                </button>
              ) : (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Suspension reason (optional)"
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-300 px-3 py-1.5 text-xs focus:border-rose-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => handleToggleSuspension(true)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition disabled:opacity-50 shrink-0"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    Suspend
                  </button>
                </div>
              )}

              {user.locked ? (
                <button
                  type="button"
                  onClick={() => handleToggleLock(false)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                >
                  <Unlock className="h-3.5 w-3.5" />
                  Unlock
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleToggleLock(true)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Lock
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Panel 3: Account Verification & Flags */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-900">Verification & Compliance Flags</h4>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Verification Status:
              </label>
              <div className="flex gap-2">
                {(["verified", "pending", "unverified"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleVerificationChange(st)}
                    disabled={isPending}
                    className={`flex-1 rounded-xl border py-1.5 text-xs font-semibold capitalize transition ${
                      verificationStatus === st
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">Security / Policy Flag:</span>
                {user.flagged ? (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                    Flagged for Review
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                    Clean Status
                  </span>
                )}
              </div>

              {user.flagged ? (
                <div className="space-y-2">
                  {user.flagReason && (
                    <p className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                      Reason: {user.flagReason}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => handleToggleFlag(false)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
                  >
                    Clear Account Flag
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Report reason (e.g. fraudulent activity)"
                    value={flagReason}
                    onChange={(e) => setFlagReason(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-300 px-3 py-1.5 text-xs focus:border-rose-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => handleToggleFlag(true)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900 transition"
                  >
                    <Flag className="h-3 w-3" /> Flag
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel 4: Active Sessions & Immediate Revocation */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <LogOut className="h-4 w-4 text-teal-600" />
            <h4 className="text-sm font-bold text-slate-900">Session Security & Access Revocation</h4>
          </div>

          <p className="text-xs text-slate-500">
            View active browser and device sessions. When an account is suspected of compromise, revoke all sessions to force immediate sign-out.
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Active Live Sessions:</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-800">
                <Clock className="h-3 w-3 text-slate-500" />
                {activeSessionsCount} active
              </span>
            </div>

            <button
              type="button"
              onClick={handleRevokeSessions}
              disabled={isPending || activeSessionsCount === 0}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-rose-300 bg-rose-50/70 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              {isPending ? "Revoking..." : "Revoke All Active Sessions"}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Permitted Profile Information Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Save className="h-4 w-4 text-shop-dark-green" />
          <h4 className="text-sm font-bold text-slate-900">Edit Permitted Account Details</h4>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-shop-dark-green focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-shop-dark-green focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-shop-dark-green focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-shop-dark-green px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-shop-light-green transition disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {isPending ? "Saving..." : "Save Profile Details"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

