import { getUserRole } from "./roles";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
type Role = "customer" | "vendor" | "admin" | "super_admin" | "product_manager";
interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: Role[];
}
export const RoleGuard = async ({ children, allowedRoles }: RoleGuardProps) => {
  const role = await getUserRole();
  if (!role || !allowedRoles.includes(role)) {
    redirect("/");
  }
  return children;
};
