import { getUserRole } from "./roles";
import { permissions, rolePermissions } from "./permissions";
type Permission = (typeof permissions)[keyof typeof permissions];
export const hasPermission = async (
  permission: Permission,
): Promise<boolean> => {
  const role = await getUserRole();
  if (!role) {
    return false;
  }
  return (rolePermissions[role] as readonly string[]).includes(permission);
};
export const requirePermission = async (
  permission: Permission,
): Promise<void> => {
  const allowed = await hasPermission(permission);
  if (!allowed) {
    throw new Error("Unauthorized");
  }
};
