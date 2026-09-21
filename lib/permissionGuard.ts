import { redirect } from "next/navigation";
import { hasPermission } from "./guards";
import { permissions } from "./permissions";
import type { ReactNode } from "react";
type Permission = (typeof permissions)[keyof typeof permissions];
interface PermissionGuardProps {
  children: ReactNode;
  permission: Permission;
}
export const PermissionGuard = async ({
  children,
  permission,
}: PermissionGuardProps) => {
  const allowed = await hasPermission(permission);
  if (!allowed) {
    redirect("/");
  }
  return children;
};
